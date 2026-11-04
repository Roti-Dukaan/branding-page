// @ts-nocheck
"use client";

import {
  extractAreaName,
  extractCity,
  extractPincode,
} from "@shop/lib/geo/address-components";

/** Client-side Maps JS key (must be NEXT_PUBLIC_* for Next.js). */
const GOOGLE_MAPS_KEY = (
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ||
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  ""
).trim();

const MISSING_KEY_MESSAGE =
  "Google Maps API key is missing. Set NEXT_PUBLIC_GOOGLE_MAPS_KEY in next-frontend/.env.local and restart the dev server.";

let loadingPromise: Promise<typeof google> | null = null;
let loadError: string | null = null;

const MAPS_API_URL = GOOGLE_MAPS_KEY
  ? `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places,geometry&v=weekly`
  : "";

export function isGoogleMapsConfigured(): boolean {
  return GOOGLE_MAPS_KEY.length > 0;
}

export function getGoogleMapsConfigError(): string | null {
  if (isGoogleMapsConfigured()) return null;
  return MISSING_KEY_MESSAGE;
}

export function loadGoogleMaps(): Promise<typeof google> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps not available server-side"));
  }

  const configError = getGoogleMapsConfigError();
  if (configError) {
    loadError = configError;
    return Promise.reject(new Error(configError));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }

  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = MAPS_API_URL;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google?.maps) {
        loadError = null;
        resolve(window.google);
      } else {
        const err = "Google Maps loaded but API not available";
        loadError = err;
        reject(new Error(err));
      }
    };

    script.onerror = () => {
      const err =
        "Failed to load Google Maps. Check your API key, enabled APIs (Maps JavaScript, Places, Geocoding), billing, and HTTP referrer restrictions for http://localhost:3000/*";
      loadError = err;
      reject(new Error(err));
    };

    document.head.appendChild(script);
  });

  return loadingPromise;
}

export function getLoadError(): string | null {
  return loadError;
}

export function reverseGeocode(
  google: typeof window.google,
  lat: number,
  lng: number
): Promise<{
  formattedAddress: string;
  areaName: string;
  city: string;
  pincode: string;
}> {
  const geocoder = new google.maps.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.geocode(
      { location: { lat, lng } },
      (results, status) => {
        if (status !== "OK" || !results || results.length === 0) {
          reject(new Error(`Geocoding failed: ${status}`));
          return;
        }

        const result = results[0];
        const formattedAddress = result.formatted_address;
        const components = result.address_components;

        const areaName = extractAreaName(components);
        const city = extractCity(components);
        const pincode = extractPincode(components);

        resolve({ formattedAddress, areaName, city, pincode });
      }
    );
  });
}

export function searchPlaces(
  google: typeof window.google,
  input: string,
  bounds?: google.maps.LatLngBounds
): Promise<google.maps.places.AutocompletePrediction[]> {
  const service = new google.maps.places.AutocompleteService();

  return new Promise((resolve, reject) => {
    service.getPlacePredictions(
      {
        input,
        bounds,
        componentRestrictions: { country: "in" },
        types: ["geocode", "establishment"],
      },
      (predictions, status) => {
        if (status !== "OK" || !predictions) {
          if (status === "ZERO_RESULTS") {
            resolve([]);
          } else {
            reject(new Error(`Places search failed: ${status}`));
          }
          return;
        }
        resolve(predictions);
      }
    );
  });
}

export function geocodeAddress(
  google: typeof window.google,
  address: string
): Promise<{
  lat: number;
  lng: number;
  formattedAddress: string;
  areaName: string;
  city: string;
  pincode: string;
}> {
  const geocoder = new google.maps.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.geocode(
      { address },
      (results, status) => {
        if (status !== "OK" || !results || results.length === 0) {
          reject(new Error(`Geocoding failed: ${status}`));
          return;
        }

        const result = results[0];
        const location = result.geometry.location;
        const formattedAddress = result.formatted_address;
        const components = result.address_components;

        const areaName = extractAreaName(components);
        const city = extractCity(components);
        const pincode = extractPincode(components);

        resolve({
          lat: location.lat(),
          lng: location.lng(),
          formattedAddress,
          areaName,
          city,
          pincode,
        });
      }
    );
  });
}
