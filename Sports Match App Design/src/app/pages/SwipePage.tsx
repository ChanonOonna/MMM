import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Bell, Filter, Heart, X } from "lucide-react";
import { useLang, T } from "../lang";
import type { View } from "../types";
import { USERS, MATCHES } from "../data";
import { SwipeCard, MatchOverlay, Av } from "../components/shared";

export function SwipePage({ onNav, onChatOpen }: { onNav: (v: View) => void; onChatOpen?: () => void }) {
  const lang = useLang(); const t = T[lang];
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState<"l"|"r"|null>(null);
  const [matchUser, setMatchUser] = useState<typeof USERS[0] | null>(null);
  const [showSwipeFilter, setShowSwipeFilter] = useState(false);
  const [sfSport, setSfSport] = useState("");
  const [sfLevel, setSfLevel] = useState("");
  const [sfDay, setSfDay] = useState("");
  const filteredUsers = USERS.filter(u => {
    if (sfSport && u.sport !== sfSport) return false;
    if (sfLevel && u.level !== sfLevel) return false;
    if (sfDay && !u.avail.includes(sfDay)) return false;
    return true;
  });
  const pool = filteredUsers.length > 0 ? filteredUsers : USERS;
  const noCards = filteredUsers.length === 0 || idx >= pool.length * 2;
  const cur = pool[idx % pool.length];
  const nxt = pool[(idx + 1) % pool.length];
  useEffect(() => { setIdx(0); }, [sfSport, sfLevel, sfDay]);
  const go = (d: "l"|"r") => { setDir(d); if (d === "r" && Math.random() > 0.4) setMatchUser(cur); setTimeout(() => { setIdx(i => i + 1); setDir(null); }, 340); };
  const hasSwipeFilter = !!(sfSport || sfLevel || sfDay);
  const DAYS_TH = ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"];
  const SPORTS_SAMPLE = ["แบดมินตัน","ฟุตบอล","บาสเกตบอล","เทนนิส","วิ่ง","ว่ายน้ำ"];
  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-border h-14 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2"><div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center text-white font-black text-sm">S</div><span className="font-black text-green-700 text-lg">Sports Match</span></div>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowSwipeFilter(true)} className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"><Filter size={19} />{hasSwipeFilter && <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full"/>}</button>
            <button onClick={() => onNav("notifications")} className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"><Bell size={19} /><span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" /></button>
          </div>
        </div>
        {showSwipeFilter && (
          <div className="fixed inset-0 z-40 flex flex-col justify-end" onClick={() => setShowSwipeFilter(false)}>
            <div className="bg-white rounded-t-2xl p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-lg">{t.swipe_filter}</h3><button onClick={() => { setSfSport(""); setSfLevel(""); setSfDay(""); }} className="text-sm text-green-600 font-bold">{t.reset}</button></div>
              <div className="mb-4"><p className="text-sm font-bold mb-2">{t.sport}</p><div className="flex flex-wrap gap-2">{["", ...SPORTS_SAMPLE].map(s=><button key={s} onClick={()=>setSfSport(s)} className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${sfSport===s?"bg-green-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{s||t.all}</button>)}</div></div>
              <div className="mb-4"><p className="text-sm font-bold mb-2">{t.level_label}</p><div className="flex flex-wrap gap-2">{["","ผู้เริ่มต้น","ระดับกลาง","ระดับสูง","แข่งขัน"].map(l=><button key={l} onClick={()=>setSfLevel(l)} className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${sfLevel===l?"bg-green-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{l||t.all}</button>)}</div></div>
              <div className="mb-5"><p className="text-sm font-bold mb-2">{t.avail_day}</p><div className="flex flex-wrap gap-2">{["", ...DAYS_TH].map(d=><button key={d} onClick={()=>setSfDay(d)} className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${sfDay===d?"bg-green-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{d||t.all}</button>)}</div></div>
              <button onClick={() => setShowSwipeFilter(false)} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700">{t.apply_filter}</button>
            </div>
          </div>
        )}
        <div className="flex-1 flex flex-col items-center justify-start px-4 pt-4 pb-4 overflow-y-auto">
          {noCards ? (
            <div className="flex flex-col items-center justify-center w-full max-w-sm text-center px-4 py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-4xl">🔍</div>
              <h3 className="font-black text-xl text-gray-800 mb-2">ไม่มีการ์ดเพิ่มแล้ว</h3>
              <p className="text-sm text-muted-foreground mb-6">ลองขยายการค้นหาโดยลดเกณฑ์กรอง</p>
              <button onClick={() => { setSfSport(""); setSfLevel(""); setSfDay(""); setIdx(0); }} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors">ขยายการค้นหา</button>
            </div>
          ) : (
            <>
              <div className="relative w-full max-w-sm" style={{ height: "min(72vh, 530px)" }}>
                <div className="absolute inset-0 rounded-2xl overflow-hidden bg-gray-200 scale-[0.94] translate-y-3 shadow-lg">
                  <img src={nxt.photo} alt="" className="w-full h-full object-cover opacity-50" />
                </div>
                <motion.div className="absolute inset-0"
                  animate={dir === "r" ? { x: 520, rotate: 28, opacity: 0 } : dir === "l" ? { x: -520, rotate: -28, opacity: 0 } : {}}
                  transition={{ duration: 0.32, ease: "easeOut" }}>
                  <SwipeCard user={cur} onLike={() => go("r")} onPass={() => go("l")} onReport={() => onNav("report")} />
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
        <div className="px-4 py-3 border-b border-border"><h3 className="font-bold text-sm text-gray-800">Match ล่าสุด</h3><p className="text-xs text-muted-foreground">{MATCHES.length} คู่</p></div>
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {MATCHES.map(m => (
            <button key={m.id} onClick={onChatOpen} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors text-left">
              <Av src={m.photo} size="sm" online={m.online} />
              <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{m.name}</p><p className="text-xs text-muted-foreground">{m.sport} {m.sportEmoji}</p></div>
              {m.unread > 0 && <span className="w-5 h-5 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center">{m.unread}</span>}
            </button>
          ))}
        </div>
      </div>
      {matchUser && <MatchOverlay user={matchUser} onClose={() => setMatchUser(null)} onChat={onChatOpen} />}
    </div>
  );
}
