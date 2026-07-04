import React, { useEffect, useState } from "react";
import { Edit3, Shield, Clock, MapPin, Star, Backpack } from "lucide-react";
import { useLang, T } from "../lang";
import type { View } from "../types";
import { SportBadge, LvBadge, MobileUtilityNav } from "../components/shared";
import { fetchMyProfile, type Profile } from "../profile";
import { apiJson } from "../api";
import { sportEmoji } from "../catalog";
import { fetchMySessions, type MySession } from "../sessions";

const LEVEL_LABEL: Record<string, string> = { beginner: "ผู้เริ่มต้น", intermediate: "ระดับกลาง", advanced: "ระดับสูง", competitive: "แข่งขัน" };
const LEVEL_COLOR: Record<string, string> = { beginner: "bg-emerald-100 text-emerald-700", intermediate: "bg-blue-100 text-blue-700", advanced: "bg-amber-100 text-amber-700", competitive: "bg-pink-100 text-pink-700" };
const INDEX_TO_THAI_DAY: Record<number, string> = { 0: "อา", 1: "จ", 2: "อ", 3: "พ", 4: "พฤ", 5: "ศ", 6: "ส" };

function formatSchedule(profile: Profile) {
  if (profile.weeklySchedule.length === 0) return "ยังไม่ได้ตั้งเวลาว่าง";
  const days = Array.from(new Set(profile.weeklySchedule.map(s => INDEX_TO_THAI_DAY[s.dayOfWeek]))).join(",");
  const first = profile.weeklySchedule[0];
  return `${days} · ${first.startTime}-${first.endTime}`;
}

interface AchievementItem {
  achievement: { id: string; name: string; description: string | null; icon: string | null };
  unlockedAt: string;
}
interface AllAchievement { id: string; name: string; description: string | null; icon: string | null }

export function ProfilePage({ onNav }: { onNav: (v: View) => void }) {
  const lang = useLang(); const t = T[lang];
  const [tab, setTab] = useState<"info"|"history"|"achievements">("info");
  const [historyFilter, setHistoryFilter] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [allAchievements, setAllAchievements] = useState<AllAchievement[]>([]);
  const [unlocked, setUnlocked] = useState<AchievementItem[]>([]);
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [mySessions, setMySessions] = useState<MySession[]>([]);

  useEffect(() => {
    fetchMyProfile().then(setProfile).catch(() => {});
    apiJson<AllAchievement[]>("/achievements").then(setAllAchievements).catch(() => {});
    apiJson<AchievementItem[]>("/achievements/me").then(setUnlocked).catch(() => {});
    apiJson<unknown[]>("/swipe/matches").then(m => setMatchCount(m.length)).catch(() => {});
    fetchMySessions().then(setMySessions).catch(() => {});
  }, []);

  const unlockedIds = new Set(unlocked.map(u => u.achievement.id));
  const mainPhoto = profile?.photos[0]?.url ?? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&auto=format";
  const displayName = profile ? `${profile.firstName} ${profile.lastName}` : "";

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="relative h-36 bg-gradient-to-br from-green-600 to-emerald-700 shrink-0">
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=')]" />
        <div className="absolute top-4 right-4 flex items-center gap-1">
          <MobileUtilityNav onNav={onNav} variant="dark" />
          <button onClick={() => onNav("edit-profile")} className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-xl hover:bg-white/30 transition-colors"><Edit3 size={18} /></button>
        </div>
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="relative">
            <img src={mainPhoto} className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg" alt="" />
            <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full ring-2 ring-white" />
          </div>
        </div>
      </div>
      <div className="pt-14 px-4 pb-4 text-center shrink-0">
        <h2 className="text-xl font-black text-gray-900">{displayName || "..."}</h2>
        <div className="flex items-center justify-center gap-1.5 mt-1"><Shield size={13} className="text-green-600" /><span className="text-xs font-bold text-green-700">{t.verified_badge}</span></div>
        <p className="text-muted-foreground text-xs mt-0.5">{profile?.nickname ? `@${profile.nickname} · ` : ""}{profile?.email}</p>
        <div className="flex justify-center gap-2 mt-3 flex-wrap">
          {profile?.sports.map(s => <SportBadge key={s.sportId} emoji="🏅" name={s.sport.name} />)}
          {profile?.sports[0] && <LvBadge name={LEVEL_LABEL[profile.sports[0].level]} color={LEVEL_COLOR[profile.sports[0].level]} />}
        </div>
        <div className="flex justify-center gap-8 mt-4">{[[matchCount ?? "-", t.match_stat],[mySessions.length, t.room_stat],[unlocked.length, t.badge_stat]].map(([n,l]) => <div key={l as string} className="text-center"><div className="text-2xl font-black text-gray-900">{n}</div><div className="text-xs text-muted-foreground">{l}</div></div>)}</div>
      </div>
      <div className="border-b border-border shrink-0">
        <div className="flex px-4">{([["info","ข้อมูล"],["history","ประวัติ"],["achievements","Achievement"]] as const).map(([tb,l]) => <button key={tb} onClick={() => setTab(tb)} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${tab === tb ? "border-green-600 text-green-700" : "border-transparent text-muted-foreground"}`}>{l}</button>)}</div>
      </div>
      <div className="flex-1 p-4">
        {tab === "info" && profile && (
          <div className="space-y-3 max-w-lg mx-auto">
            <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
              <span className="shrink-0"><Clock size={16} className="text-green-600" /></span><div><p className="text-xs text-muted-foreground">{t.available_days}</p><p className="text-sm font-semibold text-gray-900">{formatSchedule(profile)}</p></div>
            </div>
            <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
              <span className="shrink-0"><MapPin size={16} className="text-green-600" /></span><div><p className="text-xs text-muted-foreground">{t.favorites}</p><p className="text-sm font-semibold text-gray-900">{profile.favoritePlaces.length ? profile.favoritePlaces.map(f => f.venue.name).join(", ") : "ยังไม่ได้เลือกสนามโปรด"}</p></div>
            </div>
            <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
              <span className="shrink-0"><Star size={16} className="text-green-600" /></span><div><p className="text-xs text-muted-foreground">{t.sports_played}</p><p className="text-sm font-semibold text-gray-900">{profile.sports.length ? profile.sports.map(s => s.sport.name).join(", ") : "ยังไม่ได้เลือกกีฬา"}</p></div>
            </div>
            <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
              <span className="shrink-0"><Backpack size={16} className="text-green-600" /></span>
              <div><p className="text-xs text-muted-foreground">อุปกรณ์กีฬา</p><p className="text-sm font-semibold text-gray-900">{profile.hasEquipment ? "มีอุปกรณ์ 🎒" : "ไม่มีอุปกรณ์"}</p></div>
            </div>
          </div>
        )}
        {tab === "history" && (() => {
          const sportCounts = mySessions.reduce<Record<string, number>>((acc, s) => { acc[s.sport] = (acc[s.sport] ?? 0) + 1; return acc; }, {});
          const topSports = Object.entries(sportCounts).sort((a, b) => b[1] - a[1]).slice(0, 2);
          const filtered = historyFilter ? mySessions.filter(s => s.sport === historyFilter) : mySessions;
          return (
            <div className="space-y-3 max-w-lg mx-auto">
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-white rounded-xl border border-border p-3 text-center"><div className="text-xl font-black">{mySessions.length}</div><div className="text-xs text-muted-foreground">รวม</div></div>
                {topSports.map(([sport, count]) => <div key={sport} className="bg-white rounded-xl border border-border p-3 text-center"><div className="text-xl font-black">{sportEmoji(sport)} {count}</div><div className="text-xs text-muted-foreground">{sport}</div></div>)}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {["", ...Object.keys(sportCounts)].map(f=><button key={f} onClick={()=>setHistoryFilter(f)} className={`px-3.5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${historyFilter===f?"bg-green-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{f ? `${sportEmoji(f)} ${f}` : "ทั้งหมด"}</button>)}
              </div>
              {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">ยังไม่มีประวัติการเล่น</p>}
              {filtered.map(h => <div key={h.sessionId} className="bg-white rounded-xl border border-border p-3.5 flex items-center gap-3"><div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center text-2xl">{sportEmoji(h.sport)}</div><div className="flex-1 min-w-0"><p className="text-sm font-bold truncate">{h.title}</p><p className="text-xs text-muted-foreground">{new Date(h.startTime).toLocaleDateString("th-TH")} · {h.venue}</p></div><span className="text-xs text-muted-foreground shrink-0">{h.currentPlayers}/{h.maxPlayers} คน</span></div>)}
            </div>
          );
        })()}
        {tab === "achievements" && (
          <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
            {allAchievements.length === 0 && <p className="col-span-2 text-sm text-muted-foreground text-center py-6">ยังไม่มี Achievement ในระบบ</p>}
            {allAchievements.map(a => {
              const done = unlockedIds.has(a.id);
              const unlockedAt = unlocked.find(u => u.achievement.id === a.id)?.unlockedAt;
              return (
                <div key={a.id} className={`bg-white rounded-2xl border p-3.5 transition-all ${done ? "border-amber-200 bg-amber-50/40" : "border-border opacity-50"}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-2.5 ${done ? "bg-amber-100" : "bg-gray-100 grayscale"}`}>{a.icon ?? "🏆"}</div>
                  <p className="text-sm font-black text-gray-900 leading-tight">{a.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{a.description}</p>
                  {done && unlockedAt && <p className="text-xs text-amber-600 font-semibold mt-1.5">{new Date(unlockedAt).toLocaleDateString("th-TH")}</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
