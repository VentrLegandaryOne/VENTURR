/**
 * Mapbox Geocoding Utilities
 * 
 * Functions for converting addresses to coordinates and vice versa.
 */

import { MAPBOX_ACCESS_TOKEN } from './mapbox-config';

export interface GeocodingResult {
  place_name: string;
  center: [number, number]; // [longitude, latitude]
  bbox?: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  context?: Array<{
    id: string;
    text: string;
  }>;
}

/**
 * Forward geocoding: Convert address to coordinates
 * @param address - The address to geocode
 * @param country - Optional country code (default: 'au' for Australia)
 * @returns Array of geocoding results
 */
export async function geocodeAddress(
  address: string,
  country: string = 'au'
): Promise<GeocodingResult[]> {
  const encodedAddress = encodeURIComponent(address);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?country=${country}&access_token=${MAPBOX_ACCESS_TOKEN}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.features || [];
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}

/**
 * Reverse geocoding: Convert coordinates to address
 * @param longitude - Longitude coordinate
 * @param latitude - Latitude coordinate
 * @returns Address information
 */
export async function reverseGeocode(
  longitude: number,
  latitude: number
): Promise<GeocodingResult | null> {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_ACCESS_TOKEN}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.features?.[0] || null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw error;
  }
}

/**
 * Get autocomplete suggestions for an address
 * @param query - The search query
 * @param country - Optional country code (default: 'au' for Australia)
 * @returns Array of address suggestions
 */
export async function getAddressSuggestions(
  query: string,
  country: string = 'au'
): Promise<GeocodingResult[]> {
  if (!query || query.length < 3) {
    return [];
  }

  return geocodeAddress(query, country);
}

