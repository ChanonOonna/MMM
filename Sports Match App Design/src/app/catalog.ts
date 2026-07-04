import { apiJson } from "./api";

export interface ApiSport {
  id: string;
  name: string;
  icon: string;
}

export interface ApiVenue {
  id: string;
  name: string;
  placeId?: string | null;
  photoUrl?: string | null;
  lat?: number | null;
  lng?: number | null;
}

// Backend only stores {id, name} — emoji is presentation-only, kept client-side.
const SPORT_EMOJI: Record<string, string> = {
  "แบดมินตัน": "🏸",
  "ฟุตบอล": "⚽",
  "บาสเกตบอล": "🏀",
  "เทนนิส": "🎾",
  "วิ่ง": "🏃",
  "ว่ายน้ำ": "🏊",
  "วอลเลย์บอล": "🏐",
  "ปิงปอง": "🏓",
  "ฟุตซอล": "🥅",
  "มวยไทย": "🥊",
  "กอล์ฟ": "⛳",
  "จักรยาน": "🚴",
};

export function sportEmoji(name: string, icon?: string | null): string {
  return icon || SPORT_EMOJI[name] || "🏅";
}

export function fetchSports(): Promise<ApiSport[]> {
  return apiJson<ApiSport[]>("/catalog/sports");
}

export function fetchVenues(): Promise<ApiVenue[]> {
  return apiJson<ApiVenue[]>("/catalog/venues");
}
