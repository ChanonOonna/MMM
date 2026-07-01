import React, { useState } from "react";
import { Edit3, Shield, Clock, MapPin, Star, Backpack } from "lucide-react";
import { useLang, T } from "../lang";
import type { View } from "../types";
import { SELF_PHOTO, ACHIEVEMENTS, HISTORY } from "../data";
import { SportBadge, LvBadge } from "../components/shared";

export function ProfilePage({ onNav }: { onNav: (v: View) => void }) {
  const lang = useLang(); const t = T[lang];
  const [tab, setTab] = useState<"info"|"history"|"achievements">("info");
  const [historyFilter, setHistoryFilter] = useState("");
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="relative h-36 bg-gradient-to-br from-green-600 to-emerald-700 shrink-0">
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=')]" />
        <button onClick={() => onNav("edit-profile")} className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-xl hover:bg-white/30 transition-colors"><Edit3 size={18} /></button>
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="relative">
            <img src={SELF_PHOTO} className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg" alt="" />
            <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full ring-2 ring-white" />
          </div>
        </div>
      </div>
      <div className="pt-14 px-4 pb-4 text-center shrink-0">
        <h2 className="text-xl font-black text-gray-900">สมชาย ใจดี</h2>
        <div className="flex items-center justify-center gap-1.5 mt-1"><Shield size={13} className="text-green-600" /><span className="text-xs font-bold text-green-700">{t.verified_badge}</span></div>
        <p className="text-muted-foreground text-xs mt-0.5">@somchai · 65010001@ku.th</p>
        <div className="flex justify-center gap-2 mt-3 flex-wrap"><SportBadge emoji="🏸" name="แบดมินตัน" /><SportBadge emoji="⚽" name="ฟุตบอล" /><LvBadge name="ระดับกลาง" color="bg-blue-100 text-blue-700" /></div>
        <div className="flex justify-center gap-8 mt-4">{[["17",t.match_stat],["23",t.room_stat],["4",t.badge_stat]].map(([n,l]) => <div key={l} className="text-center"><div className="text-2xl font-black text-gray-900">{n}</div><div className="text-xs text-muted-foreground">{l}</div></div>)}</div>
      </div>
      <div className="border-b border-border shrink-0">
        <div className="flex px-4">{([["info","ข้อมูล"],["history","ประวัติ"],["achievements","Achievement"]] as const).map(([tb,l]) => <button key={tb} onClick={() => setTab(tb)} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${tab === tb ? "border-green-600 text-green-700" : "border-transparent text-muted-foreground"}`}>{l}</button>)}</div>
      </div>
      <div className="flex-1 p-4">
        {tab === "info" && (
          <div className="space-y-3 max-w-lg mx-auto">
            {([[<Clock size={16} className="text-green-600" />, t.available_days, "จ–พ · 17:00–20:00"],[<MapPin size={16} className="text-green-600" />, t.favorites, "สนามแบดมินตัน อาคารกีฬา"],[<Star size={16} className="text-green-600" />, t.sports_played, "แบดมินตัน, ฟุตบอล"]] as [React.ReactNode,string,string][]).map(([icon, label, value]) => (
              <div key={label} className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
                <span className="shrink-0">{icon}</span><div><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-semibold text-gray-900">{value}</p></div>
              </div>
            ))}
            <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
              <span className="shrink-0"><Backpack size={16} className="text-green-600" /></span>
              <div><p className="text-xs text-muted-foreground">อุปกรณ์กีฬา</p><p className="text-sm font-semibold text-gray-900">มีอุปกรณ์ 🎒</p></div>
            </div>
          </div>
        )}
        {tab === "history" && (
          <div className="space-y-3 max-w-lg mx-auto">
            <div className="grid grid-cols-3 gap-3 mb-3">{[["17","รวม"],["🏸 12","แบดมินตัน"],["⚽ 5","ฟุตบอล"]].map(([n,l]) => <div key={l} className="bg-white rounded-xl border border-border p-3 text-center"><div className="text-xl font-black">{n}</div><div className="text-xs text-muted-foreground">{l}</div></div>)}</div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {["","🏸 แบดมินตัน","⚽ ฟุตบอล","🏃 วิ่ง","🏀 บาสเกตบอล"].map(f=><button key={f} onClick={()=>setHistoryFilter(f)} className={`px-3.5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${historyFilter===f?"bg-green-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{f||"ทั้งหมด"}</button>)}
            </div>
            {HISTORY.filter(h=>!historyFilter||h.title.includes(historyFilter.split(" ")[1]||historyFilter)).map(h => <div key={h.id} className="bg-white rounded-xl border border-border p-3.5 flex items-center gap-3"><div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center text-2xl">{h.emoji}</div><div className="flex-1 min-w-0"><p className="text-sm font-bold truncate">{h.title}</p><p className="text-xs text-muted-foreground">{h.date} · {h.venue}</p></div><span className="text-xs text-muted-foreground shrink-0">{h.players} คน</span></div>)}
          </div>
        )}
        {tab === "achievements" && (
          <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
            {ACHIEVEMENTS.map(a => <div key={a.id} className={`bg-white rounded-2xl border p-3.5 transition-all ${a.done ? "border-amber-200 bg-amber-50/40" : "border-border opacity-50"}`}><div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-2.5 ${a.done ? "bg-amber-100" : "bg-gray-100 grayscale"}`}>{a.icon}</div><p className="text-sm font-black text-gray-900 leading-tight">{a.name}</p><p className="text-xs text-muted-foreground mt-0.5 leading-tight">{a.desc}</p>{a.done && <p className="text-xs text-amber-600 font-semibold mt-1.5">{a.date}</p>}</div>)}
          </div>
        )}
      </div>
    </div>
  );
}
