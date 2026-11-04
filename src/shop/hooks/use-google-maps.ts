"use client";

import { useState, useEffect } from "react";
import { loadGoogleMaps, getLoadError, getGoogleMapsConfigError } from "@shop/lib/google-maps";

interface UseGoogleMapsResult {
  isLoaded: boolean;
  loadError: string | null;
  google: typeof google | null;
}

export function useGoogleMaps(): UseGoogleMapsResult {
  const [state, setState] = useState<UseGoogleMapsResult>({
    isLoaded: false,
    loadError: getLoadError(),
    google: typeof window !== "undefined" ? (window as any).google ?? null : null,
  });

  useEffect(() => {
    const configError = getGoogleMapsConfigError();
    if (configError) {
      setState({ isLoaded: false, loadError: configError, google: null });
      return;
    }

    if (state.google?.maps) {
      setState({ isLoaded: true, loadError: null, google: state.google });
      return;
    }

    let cancelled = false;

    loadGoogleMaps()
      .then((g) => {
        if (!cancelled) {
          setState({ isLoaded: true, loadError: null, google: g });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setState({
            isLoaded: false,
            loadError: err instanceof Error ? err.message : "Failed to load Google Maps",
            google: null,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [state.google]);

  return state;
}
