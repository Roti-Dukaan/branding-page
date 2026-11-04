// @ts-nocheck
"use client";

import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { Loader2, MapPin, Navigation } from "lucide-react";
import { Button } from "@shop/components/ui/button";
import { cn } from "@shop/lib/utils";
import { useGoogleMaps } from "@shop/hooks/use-google-maps";
import { locationService } from "@shop/services/location.service";
import { reverseGeocode } from "@shop/lib/google-maps";
import LocationSearch from "./LocationSearch";

export const DEFAULT_MAP_ZOOM = 17;
export const GPS_MAP_ZOOM = 18;

export interface MapAddressPreview {
  areaName: string;
  formattedAddress: string;
  loading?: boolean;
}

interface GoogleMapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationChange: (lat: number, lng: number) => void;
  onAddressPreviewChange?: (preview: MapAddressPreview) => void;
  className?: string;
  showSearch?: boolean;
  showAddressCard?: boolean;
  onPlaceSelected?: (lat: number, lng: number, address: string) => void;
  footer?: ReactNode;
  defaultZoom?: number;
  showCurrentLocation?: boolean;
}

const DEFAULT_CENTER = { lat: 17.385, lng: 78.4867 };

export default function GoogleMapPicker({
  initialLat,
  initialLng,
  onLocationChange,
  onAddressPreviewChange,
  className = "h-[420px]",
  showSearch = false,
  showAddressCard = false,
  onPlaceSelected,
  footer,
  defaultZoom = DEFAULT_MAP_ZOOM,
  showCurrentLocation = true,
}: GoogleMapPickerProps) {
  const { isLoaded, loadError, google } = useGoogleMaps();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const geocodeRequestRef = useRef(0);
  const isProgrammaticMoveRef = useRef(false);
  const lockedPositionRef = useRef<{ lat: number; lng: number } | null>(null);
  const interactionRef = useRef<"pan" | "zoom" | null>(null);
  const onLocationChangeRef = useRef(onLocationChange);
  const onAddressPreviewChangeRef = useRef(onAddressPreviewChange);
  const [mapReady, setMapReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [addressPreview, setAddressPreview] = useState<MapAddressPreview>({
    areaName: "",
    formattedAddress: "Move the map to set your delivery location",
    loading: false,
  });

  onLocationChangeRef.current = onLocationChange;
  onAddressPreviewChangeRef.current = onAddressPreviewChange;

  const center =
    initialLat != null && initialLng != null
      ? { lat: initialLat, lng: initialLng }
      : DEFAULT_CENTER;

  const updateAddressPreview = useCallback((preview: MapAddressPreview) => {
    setAddressPreview(preview);
    onAddressPreviewChangeRef.current?.(preview);
  }, []);

  const reverseGeocodeCenter = useCallback(
    async (lat: number, lng: number) => {
      if (!google) return;

      const requestId = ++geocodeRequestRef.current;
      updateAddressPreview({
        areaName: "",
        formattedAddress: "Fetching address...",
        loading: true,
      });

      try {
        const geo = await reverseGeocode(google, lat, lng);
        if (requestId !== geocodeRequestRef.current) return;

        updateAddressPreview({
          areaName: geo.areaName || geo.city || "Selected location",
          formattedAddress: geo.formattedAddress,
          loading: false,
        });
      } catch {
        if (requestId !== geocodeRequestRef.current) return;

        updateAddressPreview({
          areaName: "Selected location",
          formattedAddress: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          loading: false,
        });
      }
    },
    [google, updateAddressPreview]
  );

  const emitLocation = useCallback(
    (lat: number, lng: number) => {
      lockedPositionRef.current = { lat, lng };
      onLocationChangeRef.current(lat, lng);
      void reverseGeocodeCenter(lat, lng);
    },
    [reverseGeocodeCenter]
  );

  const panToLocation = useCallback(
    (lat: number, lng: number, zoom = defaultZoom) => {
      const map = mapInstanceRef.current;
      if (!map || !google) return;

      lockedPositionRef.current = { lat, lng };
      isProgrammaticMoveRef.current = true;
      const pos = new google.maps.LatLng(lat, lng);
      map.panTo(pos);
      map.setZoom(zoom);
      onLocationChangeRef.current(lat, lng);
      void reverseGeocodeCenter(lat, lng);
    },
    [google, defaultZoom, reverseGeocodeCenter]
  );

  const initMap = useCallback(() => {
    if (!google || !mapRef.current || mapInstanceRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom: defaultZoom,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      zoomControl: false,
      gestureHandling: "greedy",
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    });

    map.addListener("dragstart", () => {
      interactionRef.current = "pan";
    });

    map.addListener("dragend", () => {
      const mapCenter = map.getCenter();
      if (!mapCenter) return;

      emitLocation(mapCenter.lat(), mapCenter.lng());
    });

    map.addListener("zoom_changed", () => {
      if (isProgrammaticMoveRef.current) return;
      interactionRef.current = "zoom";
    });

    map.addListener("idle", () => {
      if (isProgrammaticMoveRef.current) {
        isProgrammaticMoveRef.current = false;
        interactionRef.current = null;
        return;
      }

      if (interactionRef.current === "zoom") {
        const locked = lockedPositionRef.current;
        if (locked) {
          const mapCenter = map.getCenter();
          if (mapCenter) {
            const latDiff = Math.abs(mapCenter.lat() - locked.lat);
            const lngDiff = Math.abs(mapCenter.lng() - locked.lng);
            if (latDiff > 1e-7 || lngDiff > 1e-7) {
              isProgrammaticMoveRef.current = true;
              map.panTo(new google.maps.LatLng(locked.lat, locked.lng));
            }
          }
        }
        interactionRef.current = null;
        return;
      }

      if (interactionRef.current === "pan") {
        interactionRef.current = null;
        return;
      }

      if (!lockedPositionRef.current) {
        const mapCenter = map.getCenter();
        if (mapCenter) {
          emitLocation(mapCenter.lat(), mapCenter.lng());
        }
      }
    });

    mapInstanceRef.current = map;
    setMapReady(true);
  }, [google, center, defaultZoom, emitLocation]);

  useEffect(() => {
    if (isLoaded && !mapInstanceRef.current) {
      initMap();
    }
  }, [isLoaded, initMap]);

  useEffect(() => {
    if (
      !mapReady ||
      !mapInstanceRef.current ||
      initialLat == null ||
      initialLng == null
    ) {
      return;
    }

    const map = mapInstanceRef.current;
    const current = map.getCenter();
    if (!current) return;

    const latDiff = Math.abs(current.lat() - initialLat);
    const lngDiff = Math.abs(current.lng() - initialLng);

    if (latDiff < 0.00005 && lngDiff < 0.00005) return;

    panToLocation(initialLat, initialLng, defaultZoom);
  }, [initialLat, initialLng, mapReady, panToLocation, defaultZoom]);

  const handleGetCurrentLocation = async () => {
    setLocating(true);
    try {
      const position = await locationService.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      panToLocation(latitude, longitude, GPS_MAP_ZOOM);
    } catch {
      // Error handled by location service
    } finally {
      setLocating(false);
    }
  };

  const handlePlaceSelected = (lat: number, lng: number, address: string) => {
    panToLocation(lat, lng, defaultZoom);
    onPlaceSelected?.(lat, lng, address);
  };

  if (loadError) {
    return (
      <div
        className={cn(
          "flex w-full items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 p-4",
          className
        )}
      >
        <div className="max-w-sm text-center">
          <p className="text-sm font-medium text-destructive">Map unavailable</p>
          <p className="mt-2 text-xs text-muted-foreground">{loadError}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className={cn(
          "flex w-full items-center justify-center rounded-xl border border-border bg-muted/20",
          className
        )}
      >
        <div className="text-center">
          <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="relative isolate min-h-0 flex-1">
        <div className="absolute inset-0 z-0 overflow-hidden bg-muted/20">
          <div ref={mapRef} className="h-full w-full" />
        </div>

        <div className="pointer-events-none absolute inset-0 z-10">
          {showSearch && (
            <div className="pointer-events-auto absolute inset-x-3 top-3">
              <LocationSearch
                onPlaceSelected={handlePlaceSelected}
                placeholder="Search a new address"
                className="shadow-lg"
              />
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative flex -translate-y-5 flex-col items-center">
              <div className="mb-2 max-w-[220px] rounded-lg bg-foreground px-3 py-2 text-center shadow-lg sm:max-w-[260px]">
                <p className="text-[11px] font-semibold leading-tight text-background">
                  Order will be delivered here
                </p>
                <p className="mt-0.5 text-[10px] leading-tight text-background/80">
                  Place the pin to your exact location
                </p>
                <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-foreground" />
              </div>
              <div className="relative">
                <MapPin
                  className="h-10 w-10 text-primary drop-shadow-md"
                  fill="currentColor"
                  strokeWidth={1.5}
                />
                <div className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 rounded-full bg-foreground/30" />
              </div>
            </div>
          </div>

          {showCurrentLocation && (
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="pointer-events-auto absolute bottom-4 right-4 h-11 w-11 rounded-full bg-background shadow-lg hover:bg-background"
              onClick={handleGetCurrentLocation}
              disabled={locating}
              aria-label="Use current location"
            >
              {locating ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <Navigation className="h-5 w-5 text-primary" />
              )}
            </Button>
          )}
        </div>
      </div>

      {showAddressCard && (
        <div className="shrink-0 rounded-t-2xl border-t border-border bg-background px-4 pb-4 pt-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
          <div className="mb-3 min-h-[52px]">
            {addressPreview.loading ? (
              <div className="flex items-center gap-2 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  Fetching address...
                </span>
              </div>
            ) : (
              <>
                <p className="text-base font-bold text-foreground">
                  {addressPreview.areaName || "Selected location"}
                </p>
                <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                  {addressPreview.formattedAddress}
                </p>
              </>
            )}
          </div>
          {footer}
        </div>
      )}
    </div>
  );
}
