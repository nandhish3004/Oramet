import { Alert, Linking } from 'react-native';

/** A place mapped in OpenStreetMap; this does not mean an authority has verified it as safe. */
export interface SafeShelter {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  placeType: string;
  isEmergencyTagged: boolean;
  source: 'OpenStreetMap';
  isAuthorityVerified: false;
  elevationMeters?: number;
  capacity?: number;
  contactNumber?: string;
  facilities: string[];
}

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function parseMappedPlaces(elements: OverpassElement[], lat: number, lng: number): SafeShelter[] {
  const deduplicated = new Map<string, SafeShelter>();

  for (const element of elements) {
    const point = element.type === 'node' ? { lat: element.lat, lon: element.lon } : element.center;
    if (typeof point?.lat !== 'number' || typeof point.lon !== 'number') continue;

    const tags = element.tags || {};
    const emergencyTag = tags.emergency;
    const amenityTag = tags.amenity;
    const placeType = emergencyTag || amenityTag || 'mapped place';
    const name = tags.name || tags['name:en'] || tags.operator || `${placeType.replace(/_/g, ' ')} (unnamed)`;
    const capacityValue = Number.parseInt(tags.capacity || '', 10);
    const elevationValue = Number.parseFloat(tags.ele || '');
    const facilities: string[] = [];
    if (tags.wheelchair === 'yes') facilities.push('Wheelchair access mapped');
    if (tags.drinking_water === 'yes') facilities.push('Drinking water mapped');
    if (tags.toilets === 'yes') facilities.push('Toilets mapped');

    const place: SafeShelter = {
      id: `${element.type}_${element.id}`,
      name,
      latitude: point.lat,
      longitude: point.lon,
      distanceKm: distanceKm(lat, lng, point.lat, point.lon),
      placeType,
      isEmergencyTagged: Boolean(emergencyTag),
      source: 'OpenStreetMap',
      isAuthorityVerified: false,
      ...(Number.isFinite(capacityValue) && capacityValue > 0 ? { capacity: capacityValue } : {}),
      ...(Number.isFinite(elevationValue) ? { elevationMeters: elevationValue } : {}),
      ...(tags['contact:phone'] || tags.phone ? { contactNumber: tags['contact:phone'] || tags.phone } : {}),
      facilities,
    };
    deduplicated.set(place.id, place);
  }

  return Array.from(deduplicated.values())
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 30);
}

async function requestOverpass(endpoint: string, query: string, signal: AbortSignal): Promise<OverpassElement[]> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    body: `data=${encodeURIComponent(query)}`,
    signal,
  });
  if (!response.ok) throw new Error(`OpenStreetMap query failed (${response.status})`);
  const json = await response.json();
  return Array.isArray(json.elements) ? json.elements : [];
}

export const evacuationService = {
  /** Search actual OSM-tagged shelters/assembly points around the selected coordinates. */
  fetchNearbyShelters: async (lat: number, lng: number, radiusMeters: number = 10000): Promise<SafeShelter[]> => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      throw new Error('A valid location is required to search mapped places.');
    }

    const radius = Math.max(1000, Math.min(25000, Math.round(radiusMeters)));
    const query = `[out:json][timeout:15];(
      node(around:${radius},${lat},${lng})[emergency~"^(assembly_point|shelter)$"];
      way(around:${radius},${lat},${lng})[emergency~"^(assembly_point|shelter)$"];
      relation(around:${radius},${lat},${lng})[emergency~"^(assembly_point|shelter)$"];
      node(around:${radius},${lat},${lng})[amenity=shelter];
      way(around:${radius},${lat},${lng})[amenity=shelter];
      relation(around:${radius},${lat},${lng})[amenity=shelter];
    );out center tags;`;

    let lastError: unknown;
    for (const endpoint of OVERPASS_ENDPOINTS) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 18000);
      try {
        const elements = await requestOverpass(endpoint, query, controller.signal);
        return parseMappedPlaces(elements, lat, lng);
      } catch (error) {
        lastError = error;
      } finally {
        clearTimeout(timeoutId);
      }
    }
    throw lastError instanceof Error ? lastError : new Error('Nearby place search is unavailable.');
  },

  /** Opens directions to a real mapped place, or a map search if no place was selected. */
  navigateToSafeShelter: async (
    userLat?: number,
    userLng?: number,
    shelter?: SafeShelter
  ): Promise<boolean> => {
    const originLat = userLat;
    const originLng = userLng;

    if (originLat === undefined || originLng === undefined || !Number.isFinite(originLat) || !Number.isFinite(originLng)) {
      Alert.alert('Location unavailable', 'Select or enable a location before opening nearby places.');
      return false;
    }

    const url = shelter
      ? `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${shelter.latitude},${shelter.longitude}&travelmode=walking`
      : `https://www.google.com/maps/search/?api=1&query=emergency%20shelter&center=${originLat},${originLng}`;

    try {
      await Linking.openURL(url);
      return true;
    } catch {
      Alert.alert(
        'Map app unavailable',
        shelter
          ? `Could not open directions to ${shelter.name}. This OpenStreetMap place is not authority-verified as a safe evacuation site.`
          : 'Could not open a map search. Call 112 for emergency assistance.'
      );
      return false;
    }
  },
};
