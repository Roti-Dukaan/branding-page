"use client";

import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { Button } from "@shop/components/ui/button";
import { Loader2, MapPin, Navigation } from "lucide-react";
import "leaflet/dist/leaflet.css";

const DEFAULT_ZOOM = 17;
const GPS_ZOOM = 18;

interface AddressMapPickerProps {
  lat: number;
  lng: number;
  onLocationChange: (lat: number, lng: number) => void;
}

function MapCenterTracker({
  initialLat,
  initialLng,
  onLocationChange,
  lockedPositionRef,
}: {
  initialLat: number;
  initialLng: number;
  onLocationChange: (lat: number, lng: number) => void;
  lockedPositionRef: React.MutableRefObject<{ lat: number; lng: number } | null>;
}) {
  const map = useMap();
  const isRestoringRef = useRef(false);

  useMapEvents({
    dragend: () => {
      const center = map.getCenter();
      lockedPositionRef.current = { lat: center.lat, lng: center.lng };
      onLocationChange(center.lat, center.lng);
    },
    zoomend: () => {
      const locked = lockedPositionRef.current;
      if (!locked || isRestoringRef.current) return;

      const center = map.getCenter();
      const latDiff = Math.abs(center.lat - locked.lat);
      const lngDiff = Math.abs(center.lng - locked.lng);
      if (latDiff > 1e-7 || lngDiff > 1e-7) {
        isRestoringRef.current = true;
        map.setView([locked.lat, locked.lng], map.getZoom(), { animate: false });
        isRestoringRef.current = false;
      }
    },
  });

  useEffect(() => {
    if (!lockedPositionRef.current) {
      lockedPositionRef.current = { lat: initialLat, lng: initialLng };
    }
  }, [initialLat, initialLng, lockedPositionRef]);

  return null;
}

function MapViewUpdater({
  lat,
  lng,
  zoom,
  lockedPositionRef,
}: {
  lat: number;
  lng: number;
  zoom: number;
  lockedPositionRef: React.MutableRefObject<{ lat: number; lng: number } | null>;
}) {
  const map = useMap();

  useEffect(() => {
    lockedPositionRef.current = { lat, lng };
    map.setView([lat, lng], zoom, { animate: true });
  }, [lat, lng, zoom, map, lockedPositionRef]);

  return null;
}

export default function AddressMapPicker({
  lat,
  lng,
  onLocationChange,
}: AddressMapPickerProps) {
  const [locating, setLocating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const lockedPositionRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        lockedPositionRef.current = { lat: latitude, lng: longitude };
        onLocationChange(latitude, longitude);
        setZoom(GPS_ZOOM);
        setLocating(false);
      },
      () => {
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  if (!mounted) {
    return (
      <div className="flex h-[280px] w-full items-center justify-center rounded-xl border border-border bg-muted/20 text-xs text-muted-foreground">
        Loading map...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative isolate h-[280px] overflow-hidden rounded-xl border border-border">
        <div className="absolute inset-0 z-0">
          <MapContainer
            center={[lat, lng]}
            zoom={zoom}
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapCenterTracker
              initialLat={lat}
              initialLng={lng}
              onLocationChange={onLocationChange}
              lockedPositionRef={lockedPositionRef}
            />
            <MapViewUpdater
              lat={lat}
              lng={lng}
              zoom={zoom}
              lockedPositionRef={lockedPositionRef}
            />
          </MapContainer>
        </div>

        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative flex -translate-y-5 flex-col items-center">
              <div className="mb-2 max-w-[220px] rounded-lg bg-foreground px-3 py-2 text-center shadow-lg">
                <p className="text-[11px] font-semibold leading-tight text-background">
                  Order will be delivered here
                </p>
                <p className="mt-0.5 text-[10px] leading-tight text-background/80">
                  Place the pin to your exact location
                </p>
              </div>
              <MapPin
                className="h-10 w-10 text-primary drop-shadow-md"
                fill="currentColor"
                strokeWidth={1.5}
              />
            </div>
          </div>

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
        </div>
      </div>
    </div>
  );
}
