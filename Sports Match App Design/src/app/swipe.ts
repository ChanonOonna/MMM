import { apiJson } from "./api";

export interface MatchSummary {
  matchId: string;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; nickname: string | null; photos: { url: string }[] };
}

export function fetchMatches(): Promise<MatchSummary[]> {
  return apiJson<MatchSummary[]>("/swipe/matches");
}

export function blockMatchUser(targetUserId: string): Promise<void> {
  return apiJson("/swipe/block", { method: "POST", body: JSON.stringify({ targetUserId }) });
}

export interface SwipeCardData {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  warningBadge: boolean;
  hasEquipment: boolean;
  photos: { url: string }[];
  sports: { sport: string; icon: string; level: string }[];
  venue: string | null;
  schedule: { dayOfWeek: number; startTime: string; endTime: string }[];
}

export function fetchSwipeDeck(filters: { sportId?: string; levelFilter?: string } = {}): Promise<{ cards: SwipeCardData[]; relaxed: number }> {
  const params = new URLSearchParams();
  if (filters.sportId) params.set("sportId", filters.sportId);
  if (filters.levelFilter) params.set("levelFilter", filters.levelFilter);
  const qs = params.toString();
  return apiJson<{ cards: SwipeCardData[]; relaxed: number }>(`/swipe/deck${qs ? `?${qs}` : ""}`);
}

export function swipeUser(targetUserId: string, direction: "left" | "right"): Promise<{ match: { id: string; userAId: string; userBId: string } | null }> {
  return apiJson("/swipe", { method: "POST", body: JSON.stringify({ targetUserId, direction }) });
}
