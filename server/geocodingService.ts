export interface AddressSuggestion {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

const MAPBOX_API_KEY = process.env.MAPBOX_API_KEY;
const MAPBOX_GEOCODING_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

export async function getAddressSuggestions(
  query: string,
  country: string = 'AU'
): Promise<AddressSuggestion[]> {
  if (!query || query.length < 3) return [];
  if (!MAPBOX_API_KEY) {
    console.warn('[Geocoding] Mapbox API key not configured');
    return [];
  }

  try {
    const url = new URL(`${MAPBOX_GEOCODING_URL}/${encodeURIComponent(query)}.json`);
    url.searchParams.set('access_token', MAPBOX_API_KEY);
    url.searchParams.set('country', country);
    url.searchParams.set('limit', '5');
    url.searchParams.set('types', 'address,place');

    const response = await fetch(url.toString());
    const data = await response.json() as any;

    if (!data.features) return [];

    return data.features.map((feature: any) => ({
      id: feature.id,
      address: feature.place_name,
      latitude: feature.geometry.coordinates[1],
      longitude: feature.geometry.coordinates[0],
      city: feature.context?.find((c: any) => c.id.startsWith('place'))?.text || '',
      state: feature.context?.find((c: any) => c.id.startsWith('region'))?.text || '',
      postcode: feature.context?.find((c: any) => c.id.startsWith('postcode'))?.text || '',
      country: 'Australia',
    }));
  } catch (error) {
    console.error('[Geocoding] Failed:', error);
    return [];
  }
}

export async function geocodeAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
  if (!address || !MAPBOX_API_KEY) return null;

  try {
    const url = new URL(`${MAPBOX_GEOCODING_URL}/${encodeURIComponent(address)}.json`);
    url.searchParams.set('access_token', MAPBOX_API_KEY);
    url.searchParams.set('limit', '1');

    const response = await fetch(url.toString());
    const data = await response.json() as any;

    if (!data.features?.length) return null;

    const feature = data.features[0];
    return {
      latitude: feature.geometry.coordinates[1],
      longitude: feature.geometry.coordinates[0],
    };
  } catch (error) {
    console.error('[Geocoding] Failed:', error);
    return null;
  }
}
