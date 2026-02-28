// ── Dynamic Location Utils ─────────────────────
export interface CityLocation {
  name: string;
  lat: number;
  lng: number;
  state: string;
}

/**
 * Global Support List — deprecated in favor of dynamic search.
 * Kept for type compatibility during migration.
 */
export const SUPPORTED_CITIES: CityLocation[] = [];

// ── Nominatim API (No Key Required) ───────────

/**
 * Searches for a location using OpenStreetMap Nominatim.
 * No API key required, but follows usage policy.
 */
export async function searchLocations(query: string): Promise<CityLocation[]> {
  if (!query || query.length < 3) return [];
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=in`,
      {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
          'User-Agent': 'EHRI-Dashboard/1.0', // Required by Nominatim policy
        },
      }
    );
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.map((item: any) => ({
      name: item.address.city || item.address.town || item.address.village || item.display_name.split(',')[0],
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      state: item.address.state || ""
    }));
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}

/**
 * Gets location details from coordinates.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<CityLocation | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
          'User-Agent': 'EHRI-Dashboard/1.0',
        },
      }
    );
    
    if (!response.ok) return null;
    
    const item = await response.json();
    return {
      name: item.address.city || item.address.town || item.address.village || "Unknown Location",
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      state: item.address.state || ""
    };
  } catch (error) {
    console.error("Reverse geocode error:", error);
    return null;
  }
}
