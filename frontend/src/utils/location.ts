const geocodeCache = new Map<string, string>();

function cacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(4)},${lng.toFixed(4)}`;
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const key = cacheKey(lat, lng);
  const cached = geocodeCache.get(key);
  if (cached) return cached;

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=16`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'UrbanPulseAI/1.0 (hackathon-project)',
        },
      }
    );
    if (!res.ok) {
      console.warn(`Nominatim returned ${res.status} for ${lat},${lng}`);
      return null;
    }
    const data = await res.json();
    if (data.error) {
      console.warn('Nominatim error:', data.error);
      return null;
    }
    if (data.display_name) {
      geocodeCache.set(key, data.display_name);
    }
    return data.display_name || null;
  } catch (err) {
    console.warn('Reverse geocode failed:', err);
    return null;
  }
}

export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(6)}° ${latDir}, ${Math.abs(lng).toFixed(6)}° ${lngDir}`;
}
