/**
 * Mapbox Configuration
 * 
 * This file contains the Mapbox access token and configuration.
 * In production, this should be moved to environment variables.
 */

export const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiamF5ZXRob21jbyIsImEiOiJjbWg5N2RsNXAwNzhrMmlwbXVwbWZrNTdyIn0.IikG_sMM0ksX2FBbahUKQg';

export const MAPBOX_STYLE = 'mapbox://styles/mapbox/satellite-streets-v12';

export const DEFAULT_CENTER: [number, number] = [151.2093, -33.8688]; // Sydney, Australia

export const DEFAULT_ZOOM = 18; // Good zoom level for roof measurements

