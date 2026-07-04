export interface VenueCoords {
  lat: number;
  lng: number;
}

const STORAGE_KEY = "venueCoords";

// Kasetsart University, Kamphaeng Saen campus — default map center when a venue has no pin yet.
export const DEFAULT_MAP_CENTER: VenueCoords = { lat: 14.0203, lng: 99.9636 };

function readAll(): Record<string, VenueCoords> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function getVenueCoords(venue: string): VenueCoords | null {
  return readAll()[venue] ?? null;
}

export function setVenueCoords(venue: string, coords: VenueCoords) {
  const all = readAll();
  all[venue] = coords;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function getAllVenueCoords(): Record<string, VenueCoords> {
  return readAll();
}
