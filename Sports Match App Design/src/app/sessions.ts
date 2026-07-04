import { apiJson } from "./api";

export type SkillLevel = "beginner" | "intermediate" | "advanced" | "competitive";
export type SessionStatus = "open" | "full" | "ongoing" | "completed" | "cancelled";

export interface SessionSummary {
  id: string;
  hostUserId: string;
  sportId: string;
  venueId: string;
  title: string;
  description: string | null;
  skillLevel: SkillLevel;
  equipmentRequired: boolean;
  maxPlayers: number;
  currentPlayers: number;
  startTime: string;
  endTime: string;
  status: SessionStatus;
  source: "manual" | "from_invite";
  sport: { id: string; name: string; icon: string };
  venue: { id: string; name: string; photoUrl?: string | null; lat?: number | null; lng?: number | null };
  host: { id: string; firstName: string; lastName: string };
}

export interface SessionMember {
  id: string;
  userId: string;
  joinedAt: string;
  leftAt: string | null;
  leaveReason: string | null;
  kicked: boolean;
  user: { id: string; firstName: string; lastName: string; nickname: string | null; photos: { url: string }[] };
}

export interface SessionDetail extends SessionSummary {
  members: SessionMember[];
}

export function browseSessions(filters: {
  sportId?: string;
  venueId?: string;
  skillLevel?: string;
  equipmentRequired?: boolean;
  search?: string;
} = {}): Promise<SessionSummary[]> {
  const params = new URLSearchParams();
  if (filters.sportId) params.set("sportId", filters.sportId);
  if (filters.venueId) params.set("venueId", filters.venueId);
  if (filters.skillLevel) params.set("skillLevel", filters.skillLevel);
  if (filters.equipmentRequired !== undefined) params.set("equipmentRequired", String(filters.equipmentRequired));
  if (filters.search) params.set("search", filters.search);
  const qs = params.toString();
  return apiJson<SessionSummary[]>(`/sessions${qs ? `?${qs}` : ""}`);
}

export interface MySession {
  sessionId: string;
  joinedAt: string;
  leftAt: string | null;
  status: SessionStatus;
  title: string;
  sport: string;
  venue: string;
  startTime: string;
  endTime: string;
  maxPlayers: number;
  currentPlayers: number;
}

export function fetchMySessions(): Promise<MySession[]> {
  return apiJson<MySession[]>("/sessions/mine");
}

export function fetchSession(id: string): Promise<SessionDetail> {
  return apiJson<SessionDetail>(`/sessions/${id}`);
}

export function createSession(input: {
  sportId: string;
  venueId: string;
  title: string;
  description?: string;
  skillLevel: SkillLevel;
  equipmentRequired?: boolean;
  maxPlayers: number;
  startTime: string;
  endTime: string;
}): Promise<SessionSummary> {
  return apiJson<SessionSummary>("/sessions", { method: "POST", body: JSON.stringify(input) });
}

export function updateSession(id: string, patch: Partial<{
  sportId: string;
  venueId: string;
  title: string;
  description: string;
  skillLevel: SkillLevel;
  equipmentRequired: boolean;
  maxPlayers: number;
  startTime: string;
  endTime: string;
}>): Promise<SessionSummary> {
  return apiJson<SessionSummary>(`/sessions/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}

export function joinSession(id: string): Promise<SessionSummary> {
  return apiJson<SessionSummary>(`/sessions/${id}/join`, { method: "POST" });
}

export function leaveSession(id: string, reason?: string): Promise<void> {
  return apiJson(`/sessions/${id}/leave`, { method: "POST", body: JSON.stringify({ reason }) });
}

export function deleteSession(id: string): Promise<void> {
  return apiJson(`/sessions/${id}`, { method: "DELETE" });
}

export function kickMember(id: string, targetUserId: string): Promise<void> {
  return apiJson(`/sessions/${id}/kick`, { method: "POST", body: JSON.stringify({ targetUserId }) });
}
