import { apiJson } from "./api";

export interface ApiEventSport { id: string; name: string; icon: string }
export interface ApiEventVenue { id: string; name: string; placeId?: string | null }
export interface ApiEventOrganizer { id: string; firstName: string; lastName: string }
export interface ApiEventMember {
  id: string;
  userId: string;
  joinedAt: string;
  checkedInAt: string | null;
  user?: { id: string; firstName: string; lastName: string; nickname: string | null; photos: { url: string }[] };
}

export interface ApiEvent {
  id: string;
  organizerId: string;
  sportId: string;
  venueId: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  maxCapacity: number | null;
  coverUrl: string | null;
  coverPosX: number | null;
  coverPosY: number | null;
  images: string[];
  createdAt: string;
  sport: ApiEventSport;
  venue: ApiEventVenue;
  organizer: ApiEventOrganizer;
  members?: ApiEventMember[];
  _count?: { members: number };
}

export function fetchEvents(): Promise<ApiEvent[]> {
  return apiJson<ApiEvent[]>("/events");
}

export function getEvent(id: string): Promise<ApiEvent> {
  return apiJson<ApiEvent>(`/events/${id}`);
}

export function joinEvent(id: string): Promise<ApiEventMember> {
  return apiJson<ApiEventMember>(`/events/${id}/join`, { method: "POST" });
}

export function deleteEvent(id: string): Promise<void> {
  return apiJson(`/events/${id}`, { method: "DELETE" });
}

export interface ApiAnnouncement {
  id: string;
  eventId: string;
  authorId: string;
  message: string;
  createdAt: string;
  author: { id: string; firstName: string; lastName: string };
}

export function fetchAnnouncements(eventId: string): Promise<ApiAnnouncement[]> {
  return apiJson<ApiAnnouncement[]>(`/events/${eventId}/announcements`);
}

export function sendAnnouncement(eventId: string, message: string): Promise<ApiAnnouncement> {
  return apiJson<ApiAnnouncement>(`/events/${eventId}/announcement`, { method: "POST", body: JSON.stringify({ message }) });
}

export function relativeTime(iso: string, lang: "th" | "en" = "th") {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return lang === "th" ? "เมื่อสักครู่" : "just now";
  if (mins < 60) return lang === "th" ? `${mins} นาทีที่แล้ว` : `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return lang === "th" ? `${hours} ชั่วโมงที่แล้ว` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return lang === "th" ? `${days} วันที่แล้ว` : `${days}d ago`;
}

const FALLBACK_COVER = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=400&fit=crop&auto=format";

export interface EventCardData {
  id: string;
  organizerId: string;
  title: string;
  cover: string;
  coverPos: { x: number; y: number };
  date: string;
  time: string;
  venue: string;
  participants: number;
  max: number;
  organizer: string;
  sports: string[];
  desc: string;
  images: string[];
  past: boolean;
}

const THAI_DATE_FMT = new Intl.DateTimeFormat("th-TH-u-ca-buddhist", { day: "numeric", month: "short", year: "2-digit" });

// Backend models one sport per event; the UI still renders sports as a badge list, so wrap it in an array.
export function toEventCard(ev: ApiEvent): EventCardData {
  const start = new Date(ev.startTime);
  const end = new Date(ev.endTime);
  const sameDay = start.toDateString() === end.toDateString();
  const fmtTime = `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}–${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  return {
    id: ev.id,
    organizerId: ev.organizerId,
    title: ev.title,
    cover: ev.coverUrl || FALLBACK_COVER,
    coverPos: { x: ev.coverPosX ?? 50, y: ev.coverPosY ?? 50 },
    date: THAI_DATE_FMT.format(start),
    time: sameDay ? fmtTime : "",
    venue: ev.venue?.name ?? "",
    participants: ev._count?.members ?? ev.members?.length ?? 0,
    max: ev.maxCapacity ?? 100,
    organizer: ev.organizer ? `${ev.organizer.firstName} ${ev.organizer.lastName}` : "",
    sports: ev.sport ? [ev.sport.name] : [],
    desc: ev.description ?? "",
    images: ev.images ?? [],
    past: end.getTime() < Date.now(),
  };
}
