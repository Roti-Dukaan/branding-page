// @ts-nocheck
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Search, Loader2, MapPin } from "lucide-react";
import { searchPlaces } from "@shop/lib/google-maps";
import { useGoogleMaps } from "@shop/hooks/use-google-maps";
import { cn } from "@shop/lib/utils";

interface LocationSearchProps {
  onPlaceSelected: (lat: number, lng: number, address: string) => void;
  placeholder?: string;
  className?: string;
}

export default function LocationSearch({
  onPlaceSelected,
  placeholder = "Search your area or landmark...",
  className,
}: LocationSearchProps) {
  const { isLoaded, loadError, google } = useGoogleMaps();
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const [dropdownStyle, setDropdownStyle] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const updateDropdownPosition = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;

    const rect = input.getBoundingClientRect();
    setDropdownStyle({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  const handleSearch = useCallback(
    async (input: string) => {
      if (!google || input.length < 3) {
        setPredictions([]);
        return;
      }

      setLoading(true);
      try {
        const results = await searchPlaces(google, input);
        setPredictions(results);
        setShowResults(results.length > 0);
      } catch {
        setPredictions([]);
      } finally {
        setLoading(false);
      }
    },
    [google]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, handleSearch]);

  useEffect(() => {
    if (!showResults || predictions.length === 0) {
      setDropdownStyle(null);
      return;
    }

    updateDropdownPosition();

    const handleReposition = () => updateDropdownPosition();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [showResults, predictions.length, updateDropdownPosition]);

  const handleSelectPrediction = async (
    prediction: google.maps.places.AutocompletePrediction
  ) => {
    if (!google) return;

    setShowResults(false);
    setQuery(prediction.description);

    const placesService = new google.maps.places.PlacesService(
      document.createElement("div")
    );

    placesService.getDetails(
      { placeId: prediction.place_id, fields: ["geometry", "formatted_address"] },
      (place, status) => {
        if (
          status === "OK" &&
          place?.geometry?.location &&
          place.formatted_address
        ) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          onPlaceSelected(lat, lng, place.formatted_address);
        }
      }
    );
  };

  if (loadError) {
    return (
      <div className="relative">
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-destructive/30 bg-destructive/5">
          <MapPin className="h-4 w-4 text-destructive shrink-0" />
          <span className="text-xs text-muted-foreground">{loadError}</span>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="relative">
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-muted/30">
          <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
          <span className="text-sm text-muted-foreground">Loading search...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => {
            if (predictions.length > 0) {
              setShowResults(true);
            }
            updateDropdownPosition();
          }}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {showResults &&
        predictions.length > 0 &&
        dropdownStyle &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: dropdownStyle.top,
              left: dropdownStyle.left,
              width: dropdownStyle.width,
            }}
            className="bg-background border border-border rounded-xl shadow-lg overflow-hidden z-[200] max-h-60 overflow-y-auto"
          >
            {predictions.map((pred) => (
              <button
                key={pred.place_id}
                onMouseDown={() => handleSelectPrediction(pred)}
                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {pred.structured_formatting?.main_text || pred.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {pred.structured_formatting?.secondary_text || ""}
                  </p>
                </div>
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
