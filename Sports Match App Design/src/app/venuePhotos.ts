const STORAGE_KEY = "venuePhotos";

function readAll(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function getVenuePhoto(venue: string): string | null {
  return readAll()[venue] ?? null;
}

export function setVenuePhoto(venue: string, dataUrl: string) {
  const all = readAll();
  all[venue] = dataUrl;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function getAllVenuePhotos(): Record<string, string> {
  return readAll();
}
