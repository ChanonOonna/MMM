import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Filter, Heart, X } from "lucide-react";
import { useLang, T } from "../lang";
import type { View } from "../types";
import { THAI_DAY_TO_INDEX } from "../profile";
import { fetchSports, sportEmoji, type ApiSport } from "../catalog";
import { fetchSwipeDeck, swipeUser, fetchMatches, type SwipeCardData, type MatchSummary } from "../swipe";
import { SwipeCard, MatchOverlay, Av, MobileUtilityNav, type SwipeDisplayUser } from "../components/shared";

const LEVEL_OPTIONS = [
  { id: "beginner", name: "ผู้เริ่มต้น" },
  { id: "intermediate", name: "ระดับกลาง" },
  { id: "advanced", name: "ระดับสูง" },
  { id: "competitive", name: "แข่งขัน" },
];
const LEVEL_COLOR: Record<string, string> = { beginner: "bg-emerald-100 text-emerald-700", intermediate: "bg-blue-100 text-blue-700", advanced: "bg-amber-100 text-amber-700", competitive: "bg-pink-100 text-pink-700" };
const INDEX_TO_THAI_DAY: Record<number, string> = { 0: "อา", 1: "จ", 2: "อ", 3: "พ", 4: "พฤ", 5: "ศ", 6: "ส" };
const DAY_ORDER = ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"];
const FALLBACK_PHOTO = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&auto=format";

function toDisplayUser(card: SwipeCardData, lang: "th" | "en"): SwipeDisplayUser {
  const primary = card.sports[0];
  const level = primary?.level ?? "";
  const avail = card.schedule.length === 0
    ? (lang === "th" ? "ยังไม่ระบุเวลาว่าง" : "No availability set")
    : `${Array.from(new Set(card.schedule.map(s => INDEX_TO_THAI_DAY[s.dayOfWeek]))).join("")} · ${card.schedule[0].startTime}-${card.schedule[0].endTime}`;
  return {
    id: card.id,
    name: `${card.firstName} ${card.lastName}`,
    nick: card.nickname ?? "",
    sport: primary?.sport ?? "",
    sportEmoji: primary?.icon ?? "🏅",
    level: LEVEL_OPTIONS.find(l => l.id === level)?.name ?? "",
    levelColor: LEVEL_COLOR[level] ?? "bg-gray-100 text-gray-700",
    venue: card.venue ?? (lang === "th" ? "ยังไม่ระบุสนามโปรด" : "No favorite venue set"),
    avail,
    photo: card.photos[0]?.url ?? FALLBACK_PHOTO,
    warning: card.warningBadge,
  };
}

export function SwipePage({ onNav, onChatOpen }: { onNav: (v: View) => void; onChatOpen?: () => void }) {
  const lang = useLang(); const t = T[lang];
  const [apiSports, setApiSports] = useState<ApiSport[]>([]);
  const [cards, setCards] = useState<SwipeCardData[]>([]);
  const [deckLoading, setDeckLoading] = useState(true);
  const [deckError, setDeckError] = useState("");
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState<"l"|"r"|null>(null);
  const [matchUser, setMatchUser] = useState<SwipeDisplayUser | null>(null);
  const [showSwipeFilter, setShowSwipeFilter] = useState(false);
  const [sfSportId, setSfSportId] = useState("");
  const [sfLevel, setSfLevel] = useState("");
  const [sfDay, setSfDay] = useState("");
  const [matches, setMatches] = useState<MatchSummary[]>([]);

  useEffect(() => { fetchSports().then(setApiSports).catch(() => {}); }, []);
  useEffect(() => { fetchMatches().then(setMatches).catch(() => {}); }, []);

  const loadDeck = () => {
    setDeckLoading(true);
    setDeckError("");
    fetchSwipeDeck({ sportId: sfSportId || undefined, levelFilter: sfLevel || undefined })
      .then(res => { setCards(res.cards); setIdx(0); })
      .catch(() => setDeckError(lang === "th" ? "โหลดรายชื่อไม่สำเร็จ" : "Failed to load matches"))
      .finally(() => setDeckLoading(false));
  };
  useEffect(() => { loadDeck(); }, [sfSportId, sfLevel]);

  const pool = sfDay ? cards.filter(c => c.schedule.some(s => s.dayOfWeek === THAI_DAY_TO_INDEX[sfDay])) : cards;
  const noCards = !deckLoading && (pool.length === 0 || idx >= pool.length);
  const cur = pool[idx];
  const nxt = pool[idx + 1];

  const go = (d: "l"|"r") => {
    if (!cur) return;
    const card = cur;
    setDir(d);
    swipeUser(card.id, d === "r" ? "right" : "left")
      .then(res => {
        if (d === "r" && res.match) {
          setMatchUser(toDisplayUser(card, lang));
          fetchMatches().then(setMatches).catch(() => {});
        }
      })
      .catch(() => {});
    setTimeout(() => { setIdx(i => i + 1); setDir(null); }, 340);
  };
  const hasSwipeFilter = !!(sfSportId || sfLevel || sfDay);
  const resetFilters = () => { setSfSportId(""); setSfLevel(""); setSfDay(""); };

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-border h-14 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2"><div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center text-white font-black text-sm">S</div><span className="font-black text-green-700 text-lg">Sports Match</span></div>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowSwipeFilter(true)} className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"><Filter size={19} />{hasSwipeFilter && <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full"/>}</button>
            <MobileUtilityNav onNav={onNav} />
          </div>
        </div>
        {showSwipeFilter && (
          <div className="fixed inset-0 z-40 flex flex-col justify-end" onClick={() => setShowSwipeFilter(false)}>
            <div className="bg-white rounded-t-2xl p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-lg">{t.swipe_filter}</h3><button onClick={resetFilters} className="text-sm text-green-600 font-bold">{t.reset}</button></div>
              <div className="mb-4"><p className="text-sm font-bold mb-2">{t.sport}</p><div className="flex flex-wrap gap-2">
                <button onClick={()=>setSfSportId("")} className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${sfSportId===""?"bg-green-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{t.all}</button>
                {apiSports.map(sp=><button key={sp.id} onClick={()=>setSfSportId(sp.id)} className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${sfSportId===sp.id?"bg-green-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{sportEmoji(sp.name, sp.icon)} {sp.name}</button>)}
              </div></div>
              <div className="mb-4"><p className="text-sm font-bold mb-2">{t.level_label}</p><div className="flex flex-wrap gap-2">
                <button onClick={()=>setSfLevel("")} className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${sfLevel===""?"bg-green-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{t.all}</button>
                {LEVEL_OPTIONS.map(l=><button key={l.id} onClick={()=>setSfLevel(l.id)} className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${sfLevel===l.id?"bg-green-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{l.name}</button>)}
              </div></div>
              <div className="mb-5"><p className="text-sm font-bold mb-2">{t.avail_day}</p><div className="flex flex-wrap gap-2">
                <button onClick={()=>setSfDay("")} className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${sfDay===""?"bg-green-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{t.all}</button>
                {DAY_ORDER.map(d=><button key={d} onClick={()=>setSfDay(d)} className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${sfDay===d?"bg-green-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{d}</button>)}
              </div></div>
              <button onClick={() => setShowSwipeFilter(false)} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700">{t.apply_filter}</button>
            </div>
          </div>
        )}
        <div className="flex-1 flex flex-col items-center justify-start px-4 pt-4 pb-4 overflow-y-auto">
          {deckLoading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : deckError ? (
            <div className="flex flex-col items-center justify-center w-full max-w-sm text-center px-4 py-12">
              <p className="text-sm text-red-500 mb-4">{deckError}</p>
              <button onClick={loadDeck} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors">{lang === "th" ? "ลองอีกครั้ง" : "Retry"}</button>
            </div>
          ) : noCards ? (
            <div className="flex flex-col items-center justify-center w-full max-w-sm text-center px-4 py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-4xl">🔍</div>
              <h3 className="font-black text-xl text-gray-800 mb-2">ไม่มีการ์ดเพิ่มแล้ว</h3>
              <p className="text-sm text-muted-foreground mb-6">ลองขยายการค้นหาโดยลดเกณฑ์กรอง</p>
              {hasSwipeFilter && <button onClick={resetFilters} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors">ขยายการค้นหา</button>}
            </div>
          ) : (
            <>
              <div className="relative w-full max-w-sm" style={{ height: "min(72vh, 530px)" }}>
                {nxt && (
                  <div className="absolute inset-0 rounded-2xl overflow-hidden bg-gray-200 scale-[0.94] translate-y-3 shadow-lg">
                    <img src={nxt.photos[0]?.url ?? FALLBACK_PHOTO} alt="" className="w-full h-full object-cover opacity-50" />
                  </div>
                )}
                <motion.div className="absolute inset-0"
                  animate={dir === "r" ? { x: 520, rotate: 28, opacity: 0 } : dir === "l" ? { x: -520, rotate: -28, opacity: 0 } : {}}
                  transition={{ duration: 0.32, ease: "easeOut" }}>
                  <SwipeCard user={toDisplayUser(cur, lang)} onLike={() => go("r")} onPass={() => go("l")} onReport={() => onNav("report")} />
                </motion.div>
              </div>
              <div className="flex items-center gap-6 mt-5 shrink-0">
                <button onClick={() => go("l")} className="w-14 h-14 rounded-full bg-white border-2 border-red-200 text-red-400 flex items-center justify-center hover:border-red-400 hover:scale-105 transition-all shadow-md active:scale-95"><X size={26} /></button>
                <div className="text-center"><p className="text-[11px] text-muted-foreground font-medium">ปัดซ้าย Pass</p><p className="text-[11px] text-muted-foreground">ปัดขวา Like</p></div>
                <button onClick={() => go("r")} className="w-16 h-16 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 hover:scale-105 transition-all shadow-lg active:scale-95"><Heart size={28} fill="white" /></button>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="hidden lg:flex flex-col w-72 shrink-0 border-l border-border bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-border"><h3 className="font-bold text-sm text-gray-800">Match ล่าสุด</h3><p className="text-xs text-muted-foreground">{matches.length} คู่</p></div>
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {matches.map(m => (
            <button key={m.matchId} onClick={onChatOpen} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors text-left">
              <Av src={m.user.photos[0]?.url ?? ""} name={m.user.nickname || m.user.firstName} size="sm" />
              <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{m.user.nickname || `${m.user.firstName} ${m.user.lastName}`}</p></div>
            </button>
          ))}
          {matches.length === 0 && <p className="text-center text-sm text-muted-foreground py-10">ยังไม่มี Match</p>}
        </div>
      </div>
      {matchUser && <MatchOverlay user={matchUser} onClose={() => setMatchUser(null)} onChat={onChatOpen} />}
    </div>
  );
}
