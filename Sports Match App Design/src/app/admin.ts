import { apiJson } from "./api";
import type { ApiSport, ApiVenue } from "./catalog";
import { getEvent as fetchEventById, type ApiEvent } from "./events";

export function createSport(name: string, icon: string): Promise<ApiSport> {
  return apiJson<ApiSport>("/admin/sports", { method: "POST", body: JSON.stringify({ name, icon }) });
}

export function updateSport(id: string, patch: { name?: string; icon?: string }): Promise<ApiSport> {
  return apiJson<ApiSport>(`/admin/sports/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}

export function deleteSport(id: string): Promise<void> {
  return apiJson(`/admin/sports/${id}`, { method: "DELETE" });
}

// Events
export const getEvent = fetchEventById;

export function createEvent(input: {
  sportId: string;
  venueId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  maxCapacity?: number;
  coverUrl?: string;
  coverPosX?: number;
  coverPosY?: number;
  images?: string[];
}): Promise<ApiEvent> {
  return apiJson<ApiEvent>("/events", { method: "POST", body: JSON.stringify(input) });
}

export function updateEvent(id: string, patch: Partial<{
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  maxCapacity?: number;
  coverUrl?: string;
  coverPosX?: number;
  coverPosY?: number;
  images?: string[];
}>): Promise<ApiEvent> {
  return apiJson<ApiEvent>(`/events/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}

export function deleteEvent(id: string): Promise<void> {
  return apiJson(`/events/${id}`, { method: "DELETE" });
}

interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
}

// Uploads straight to Cloudinary using a backend-signed request, mirrors uploadProfilePhoto in profile.ts.
async function uploadViaSignature(signaturePath: string, folder: string, file: File): Promise<string> {
  const sig = await apiJson<UploadSignature>(signaturePath);

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", String(sig.timestamp));
  form.append("signature", sig.signature);
  form.append("folder", folder);

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
  return uploaded.secure_url as string;
}

export function uploadEventImage(file: File): Promise<string> {
  return uploadViaSignature("/events/upload-signature", "sports-match/events", file);
}

// Venues
export function createVenue(input: { name: string; placeId?: string; photoUrl?: string; lat?: number; lng?: number }): Promise<ApiVenue> {
  return apiJson<ApiVenue>("/admin/venues", { method: "POST", body: JSON.stringify(input) });
}

export function updateVenue(id: string, patch: Partial<{ name: string; placeId: string; photoUrl: string; lat: number; lng: number }>): Promise<ApiVenue> {
  return apiJson<ApiVenue>(`/admin/venues/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}

export function deleteVenue(id: string): Promise<void> {
  return apiJson(`/admin/venues/${id}`, { method: "DELETE" });
}

export function uploadVenueImage(file: File): Promise<string> {
  return uploadViaSignature("/admin/venues/upload-signature", "sports-match/venues", file);
}

// Users
export interface ApiAdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  role: string;
  warningBadge: boolean;
  noShowCount: number;
  createdAt: string;
  photos: { url: string }[];
}

export function fetchAdminUsers(search?: string): Promise<ApiAdminUser[]> {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiJson<ApiAdminUser[]>(`/admin/users${qs}`);
}

export function setUserRole(id: string, role: "user" | "event_organizer" | "admin"): Promise<ApiAdminUser> {
  return apiJson<ApiAdminUser>(`/admin/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) });
}

export function resetNoShow(id: string): Promise<ApiAdminUser> {
  return apiJson<ApiAdminUser>(`/admin/users/${id}/reset-no-show`, { method: "POST" });
}

export function deleteAdminUser(id: string): Promise<void> {
  return apiJson(`/admin/users/${id}`, { method: "DELETE" });
}

// Rooms (user-created sport sessions, aka "ห้องทั่วไป")
export interface ApiAdminSession {
  id: string;
  title: string;
  description: string | null;
  status: string;
  maxPlayers: number;
  currentPlayers: number;
  startTime: string;
  endTime: string;
  sport: { id: string; name: string; icon: string };
  venue: { id: string; name: string };
  host: { id: string; firstName: string; lastName: string; nickname: string | null };
}

export function fetchAdminSessions(): Promise<ApiAdminSession[]> {
  return apiJson<ApiAdminSession[]>("/admin/sessions");
}

export function deleteAdminSession(id: string): Promise<void> {
  return apiJson(`/admin/sessions/${id}`, { method: "DELETE" });
}
