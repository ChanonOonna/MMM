import { apiJson } from "./api";

export interface ProfileSport {
  sportId: string;
  level: "beginner" | "intermediate" | "advanced" | "competitive";
  sport: { id: string; name: string };
}

export interface ProfileSchedule {
  id: string;
  dayOfWeek: number; // 0 = Sunday .. 6 = Saturday (JS Date.getDay() convention)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface ProfileFavoritePlace {
  venueId: string;
  venue: { id: string; name: string; placeId?: string | null };
}

export interface ProfilePhoto {
  id: string;
  url: string;
  position: number;
}

export interface Profile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  role: string;
  language: "th" | "en";
  noShowCount: number;
  warningBadge: boolean;
  hasEquipment: boolean;
  qrToken: string;
  photos: ProfilePhoto[];
  sports: ProfileSport[];
  weeklySchedule: ProfileSchedule[];
  favoritePlaces: ProfileFavoritePlace[];
}

// Thai day-abbreviation -> JS Date.getDay() index, used by the onboarding day picker.
export const THAI_DAY_TO_INDEX: Record<string, number> = {
  "จ": 1, "อ": 2, "พ": 3, "พฤ": 4, "ศ": 5, "ส": 6, "อา": 0,
};

export function fetchMyProfile(): Promise<Profile> {
  return apiJson<Profile>("/profile/me");
}

export function updateMyProfile(patch: Partial<{
  firstName: string;
  lastName: string;
  nickname: string;
  language: "th" | "en";
  hasEquipment: boolean;
}>): Promise<Profile> {
  return apiJson<Profile>("/profile/me", { method: "PATCH", body: JSON.stringify(patch) });
}

export function saveMySports(sports: { sportId: string; level: string }[]): Promise<{ ok: true }> {
  return apiJson("/profile/sports", { method: "PUT", body: JSON.stringify({ sports }) });
}

export function saveMySchedule(schedule: { dayOfWeek: number; startTime: string; endTime: string }[]): Promise<{ ok: true }> {
  return apiJson("/profile/schedule", { method: "PUT", body: JSON.stringify({ schedule }) });
}

export function saveMyFavoriteVenues(venueIds: string[]): Promise<{ ok: true }> {
  return apiJson("/profile/favorite-venues", { method: "PUT", body: JSON.stringify({ venueIds }) });
}

interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
}

// PRO-01: upload a profile photo straight to Cloudinary using a backend-signed request, then register the resulting URL.
export async function uploadProfilePhoto(file: File): Promise<ProfilePhoto> {
  const sig = await apiJson<UploadSignature>("/profile/photos/upload-signature");

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", String(sig.timestamp));
  form.append("signature", sig.signature);
  form.append("folder", "sports-match/profiles");

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    let message = "อัปโหลดรูปไม่สำเร็จ";
    try {
      const body = await res.json();
      if (body?.error?.message) message = `อัปโหลดรูปไม่สำเร็จ: ${body.error.message}`;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }
  const uploaded = await res.json();

  return apiJson<ProfilePhoto>("/profile/photos", {
    method: "POST",
    body: JSON.stringify({ url: uploaded.secure_url }),
  });
}

export function deleteProfilePhoto(id: string): Promise<void> {
  return apiJson(`/profile/photos/${id}`, { method: "DELETE" });
}
