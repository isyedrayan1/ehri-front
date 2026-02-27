
export interface CityLocation {
  name: string;
  lat: number;
  lng: number;
  state: string;
}

export const SUPPORTED_CITIES: CityLocation[] = [
  { name: "Agra", lat: 27.1767, lng: 78.0081, state: "Uttar Pradesh" },
  { name: "Ahmedabad", lat: 23.0225, lng: 72.5714, state: "Gujarat" },
  { name: "Amritsar", lat: 31.6340, lng: 74.8723, state: "Punjab" },
  { name: "Bengaluru", lat: 12.9716, lng: 77.5946, state: "Karnataka" },
  { name: "Bhopal", lat: 23.2599, lng: 77.4126, state: "Madhya Pradesh" },
  { name: "Chandigarh", lat: 30.7333, lng: 76.7794, state: "Chandigarh" },
  { name: "Chennai", lat: 13.0827, lng: 80.2707, state: "Tamil Nadu" },
  { name: "Coimbatore", lat: 11.0168, lng: 76.9558, state: "Tamil Nadu" },
  { name: "Dehradun", lat: 30.3165, lng: 78.0322, state: "Uttarakhand" },
  { name: "Delhi", lat: 28.6139, lng: 77.2090, state: "Delhi" },
  { name: "Faridabad", lat: 28.4089, lng: 77.3178, state: "Haryana" },
  { name: "Ghaziabad", lat: 28.6692, lng: 77.4538, state: "Uttar Pradesh" },
  { name: "Gurugram", lat: 28.4595, lng: 77.0266, state: "Haryana" },
  { name: "Guwahati", lat: 26.1158, lng: 91.7086, state: "Assam" },
  { name: "Gwalior", lat: 26.2183, lng: 78.1828, state: "Madhya Pradesh" },
  { name: "Hyderabad", lat: 17.3850, lng: 78.4867, state: "Telangana" },
  { name: "Indore", lat: 22.7196, lng: 75.8577, state: "Madhya Pradesh" },
  { name: "Jaipur", lat: 26.9124, lng: 75.7873, state: "Rajasthan" },
  { name: "Jalandhar", lat: 31.3260, lng: 75.5762, state: "Punjab" },
  { name: "Jodhpur", lat: 26.2389, lng: 73.0243, state: "Rajasthan" },
  { name: "Kanpur", lat: 26.4499, lng: 80.3319, state: "Uttar Pradesh" },
  { name: "Kochi", lat: 9.9312, lng: 76.2673, state: "Kerala" },
  { name: "Kolkata", lat: 22.5726, lng: 88.3639, state: "West Bengal" },
  { name: "Lucknow", lat: 26.8467, lng: 80.9462, state: "Uttar Pradesh" },
  { name: "Mumbai", lat: 19.0760, lng: 72.8777, state: "Maharashtra" },
  { name: "Mysuru", lat: 12.2958, lng: 76.6394, state: "Karnataka" },
  { name: "Nagpur", lat: 21.1458, lng: 79.0882, state: "Maharashtra" },
  { name: "Navi Mumbai", lat: 19.0330, lng: 73.0297, state: "Maharashtra" },
  { name: "Noida", lat: 28.5355, lng: 77.3910, state: "Uttar Pradesh" },
  { name: "Patna", lat: 25.5941, lng: 85.1376, state: "Bihar" },
  { name: "Pune", lat: 18.5204, lng: 73.8567, state: "Maharashtra" },
  { name: "Raipur", lat: 21.2514, lng: 81.6296, state: "Chhattisgarh" },
  { name: "Ranchi", lat: 23.3441, lng: 85.3096, state: "Jharkhand" },
  { name: "Surat", lat: 21.1702, lng: 72.8311, state: "Gujarat" },
  { name: "Thane", lat: 19.2183, lng: 72.9781, state: "Maharashtra" },
  { name: "Thiruvananthapuram", lat: 8.5241, lng: 76.9366, state: "Kerala" },
  { name: "Tiruchirappalli", lat: 10.7905, lng: 78.7047, state: "Tamil Nadu" },
  { name: "Vadodara", lat: 22.3072, lng: 73.1812, state: "Gujarat" },
  { name: "Varanasi", lat: 25.3176, lng: 82.9739, state: "Uttar Pradesh" },
  { name: "Visakhapatnam", lat: 17.6868, lng: 83.2185, state: "Andhra Pradesh" }
];

export function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findNearestCity(lat: number, lng: number): CityLocation {
  let nearestCity = SUPPORTED_CITIES[0];
  let minDistance = getDistance(lat, lng, nearestCity.lat, nearestCity.lng);

  for (let i = 1; i < SUPPORTED_CITIES.length; i++) {
    const d = getDistance(lat, lng, SUPPORTED_CITIES[i].lat, SUPPORTED_CITIES[i].lng);
    if (d < minDistance) {
      minDistance = d;
      nearestCity = SUPPORTED_CITIES[i];
    }
  }
  return nearestCity;
}

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
