/**
 * Mapbox Configuration
 * 
 * This file contains the Mapbox access token and configuration.
 * The token is loaded from environment variables for security.
 */

// Get Mapbox token from environment variable
export const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

// Validate token on load in development
if (import.meta.env.DEV && !MAPBOX_ACCESS_TOKEN) {
  console.warn('VITE_MAPBOX_TOKEN environment variable is not set. Mapbox features will not work.');
}

export const MAPBOX_STYLE = 'mapbox://styles/mapbox/satellite-streets-v12';

export const DEFAULT_CENTER: [number, number] = [151.2093, -33.8688]; // Sydney, Australia

export const DEFAULT_ZOOM = 18; // Good zoom level for roof measurements

/**
 * Check if Mapbox is properly configured
 */
export function isMapboxConfigured(): boolean {
  return Boolean(MAPBOX_ACCESS_TOKEN);
}

