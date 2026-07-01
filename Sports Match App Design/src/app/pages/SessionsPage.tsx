import React, { useState } from "react";
import { CalendarDays, MapPin, Users, Send, Flag, Plus, SlidersHorizontal, UserX, ChevronLeft, Search, X } from "lucide-react";
import { useLang, T } from "../lang";
import type { View } from "../types";
import { SESSIONS, USERS, VENUES, LEVELS } from "../data";
import { Av, LvBadge, PBar, PageHd } from "../components/shared";

function SessionDetail({ sessionId, onBack, onReport }: { sessionId: string; onBack: () => void; onReport?: () => void }) {
  const s = SESSIONS.find(x => x.id === sessionId);
  const [activeTab, setActiveTab] = useState<"info"|"chat">("info");
  const [joined, setJoined] = useState(false);
  const [members, setMembers] = useState(USERS.slice(0, s?.cur ?? 2));
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [leaveReason, setLeaveReason] = useState("");
  const isHost = true;
  const [cm, setCm] = useState<{ id: string; from: string; text: string }[]>([
    { id: "1", from: "ปรีดา", text: "มาเลยครับ ยังมีที่ว่าง!" },
    { id: "2", from: "ธนกร", text: "โอเค เจอกัน 5 โมง" },
  ]);
  const [ci, setCi] = useState("");
  if (!s) return null;
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHd title={s.title} onBack={onBack} right={<button onClick={onReport} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><Flag size={18} /></button>} />
      <div className="lg:hidden border-b border-border shrink-0">
        <div className="flex">{(["info","chat"] as const).map(x => <button key={x} onClick={() => setActiveTab(x)} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === x ? "border-green-600 text-green-700" : "border-transparent text-muted-foreground"}`}>{x === "info" ? "รายละเอียด" : "แชทกลุ่ม"}</button>)}</div>
      </div>
      <div className="flex-1 overflow-hidden flex">
        <div className={`${activeTab === "info" ? "flex" : "hidden"} lg:flex flex-col lg:w-1/2 lg:border-r lg:border-border overflow-y-auto p-4`}>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 mb-4 flex items-center gap-4 border border-green-100">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-sm">{s.emoji}</div>
            <div><LvBadge name={s.level} color={s.levelColor} /><h2 className="font-black text-xl mt-1">{s.title}</h2></div>
          </div>
          <div className="bg-white rounded-2xl border border-border divide-y divide-border mb-4 overflow-hidden">
            {([[<CalendarDays size={17} className="text-green-600" />, `${s.date} · ${s.time}`],[<MapPin size={17} className="text-green-600" />, s.venue],[<Users size={17} className="text-green-600" />, `${s.cur}/${s.max} คน`]] as [React.ReactNode, string][]).map(([icon, text], i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 text-sm"><span className="shrink-0">{icon}</span><span className="font-medium text-gray-800">{text}</span></div>
            ))}
          </div>
          <PBar cur={s.cur} max={s.max} className="mb-4" />
          <div className="bg-white rounded-2xl border border-border p-4 mb-4">
            <p className="text-sm font-bold mb-3">สมาชิก ({members.length} คน)</p>
            <div className="space-y-2">
              {members.map((u, i) => (
                <div key={u.id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                  <Av src={u.photo} size="xs" />
                  <span className="text-xs font-semibold flex-1">{u.nick}</span>
                  {i === 0 && <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">เจ้าของ</span>}
                  {i > 0 && isHost && (
                    <button onClick={() => setMembers(m => m.filter(x => x.id !== u.id))} className="p-1 hover:bg-red-50 rounded-lg text-red-400 transition-colors" title="Kick"><UserX size={13} /></button>
                  )}
                </div>
              ))}
            </div>
          </div>
          {showLeaveDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
              <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl">
                <h3 className="font-bold text-lg mb-1">{isHost ? "⚠️ ยุบ Session" : "ออกจาก Session"}</h3>
                <p className="text-sm text-muted-foreground mb-4">{isHost ? "การออกในฐานะเจ้าของจะยุบ Session และแจ้งสมาชิกทุกคน" : "กรุณาระบุเหตุผลที่ออก"}</p>
                <textarea value={leaveReason} onChange={e => setLeaveReason(e.target.value)} rows={3} placeholder="เช่น ติดธุระ ไม่สะดวกมา..." className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-400 resize-none mb-4" />
                <div className="flex gap-2">
                  <button onClick={() => setShowLeaveDialog(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-gray-600 hover:bg-gray-50">ยกเลิก</button>
                  <button onClick={() => { setJoined(false); setShowLeaveDialog(false); setLeaveReason(""); if (isHost) setMembers([]); }} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700">{isHost ? "ยุบ Session" : "ยืนยันออก"}</button>
                </div>
              </div>
            </div>
          )}
          <button onClick={() => joined ? setShowLeaveDialog(true) : setJoined(true)} className={`w-full py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] ${joined ? isHost ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-green-600 text-white hover:bg-green-700"}`}>{joined ? (isHost ? "ยุบ Session (ออกในฐานะเจ้าของ)" : "ออกจาก Session") : "เข้าร่วม Session"}</button>
        </div>
        <div className={`${activeTab === "chat" ? "flex" : "hidden"} lg:flex flex-col lg:flex-1 overflow-hidden`}>
          <div className="px-4 py-3 border-b border-border shrink-0"><p className="font-bold text-sm">แชทกลุ่ม</p><p className="text-xs text-muted-foreground">{s.cur} สมาชิก</p></div>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/30">
            {cm.map(msg => <div key={msg.id} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"} gap-2`}>{msg.from !== "me" && <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700 shrink-0">{msg.from[0]}</div>}<div className={`max-w-[72%] rounded-2xl px-3.5 py-2.5 text-sm ${msg.from === "me" ? "bg-green-600 text-white rounded-br-sm" : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-border"}`}>{msg.from !== "me" && <p className="text-xs font-bold text-green-600 mb-0.5">{msg.from}</p>}{msg.text}</div></div>)}
          </div>
          <div className="border-t border-border px-3 py-2.5 flex gap-2 shrink-0" style={{ paddingBottom: "calc(0.625rem + env(safe-area-inset-bottom))" }}>
            <input value={ci} onChange={e => setCi(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && ci.trim()) { setCm(p => [...p, { id: Date.now().toString(), from: "me", text: ci }]); setCi(""); }}} placeholder="พิมพ์ข้อความ..." className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm outline-none" />
            <button onClick={() => { if (ci.trim()) { setCm(p => [...p, { id: Date.now().toString(), from: "me", text: ci }]); setCi(""); }}} className="p-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"><Send size={17} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SessionsPage({ onNav }: { onNav: (v: View) => void }) {
  const lang = useLang(); const t = T[lang];
  const [sf, setSf] = useState("");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [fVenue, setFVenue] = useState("");
  const [fLevel, setFLevel] = useState("");
  const [fEquip, setFEquip] = useState<"all"|"yes"|"no">("all");
  if (detail) return <SessionDetail sessionId={detail} onBack={() => setDetail("")} onReport={() => { setDetail(""); onNav("report"); }} />;
  const filtered = SESSIONS.filter(s => {
    if (query && !s.title.toLowerCase().includes(query.toLowerCase()) && !s.sport.toLowerCase().includes(query.toLowerCase())) return false;
    if (sf && s.sport !== sf) return false;
    if (fVenue && s.venue !== fVenue) return false;
    if (fLevel && s.level !== fLevel) return false;
    if (fEquip === "yes" && !s.equipment) return false;
    if (fEquip === "no" && s.equipment) return false;
    return true;
  });
  const SPORTS_NAV = ["แบดมินตัน","ฟุตบอล","บาสเกตบอล","เทนนิส","วิ่ง","วอลเลย์บอล"];
  const SPORTS_EMOJI: Record<string,string> = { "แบดมินตัน":"🏸","ฟุตบอล":"⚽","บาสเกตบอล":"🏀","เทนนิส":"🎾","วิ่ง":"🏃","วอลเลย์บอล":"🏐" };
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-border h-14 px-4 flex items-center gap-3 shrink-0">
        <h1 className="font-bold text-lg flex-1">{t.sessions_title}</h1>
        <button onClick={() => setShowFilter(true)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 relative"><SlidersHorizontal size={19} />{(fVenue||fLevel||fEquip!=="all") && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full" />}</button>
        <button onClick={() => onNav("session-create")} className="bg-green-600 text-white px-3.5 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 hover:bg-green-700 transition-colors active:scale-95"><Plus size={15} />{t.create}</button>
      </div>
      {showFilter && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end" onClick={() => setShowFilter(false)}>
          <div className="bg-white rounded-t-2xl p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-lg">{t.filter}</h3><button onClick={() => { setFVenue(""); setFLevel(""); setFEquip("all"); }} className="text-sm text-green-600 font-bold">{t.reset}</button></div>
            <div className="mb-4"><p className="text-sm font-bold mb-2">{t.venue}</p><select value={fVenue} onChange={e => setFVenue(e.target.value)} className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500"><option value="">{lang==="th"?"ทุกสนาม":"All Venues"}</option>{VENUES.map(v=><option key={v} value={v}>{v}</option>)}</select></div>
            <div className="mb-4"><p className="text-sm font-bold mb-2">{t.level_label}</p><div className="flex flex-wrap gap-2">{["","ผู้เริ่มต้น","ระดับกลาง","ระดับสูง","แข่งขัน"].map(l=><button key={l} onClick={()=>setFLevel(l)} className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${fLevel===l?"bg-green-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{l||t.all}</button>)}</div></div>
            <div className="mb-5"><p className="text-sm font-bold mb-2">{t.equipment}</p><div className="flex gap-2">{([["all",t.all],["yes",lang==="th"?"มีอุปกรณ์":"Has Equipment"],["no",lang==="th"?"ไม่มี":"None"]] as const).map(([v,l])=><button key={v} onClick={()=>setFEquip(v)} className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${fEquip===v?"bg-green-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{l}</button>)}</div></div>
            <button onClick={() => setShowFilter(false)} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700">{lang==="th"?"ดูผลลัพธ์":"View Results"} ({filtered.length})</button>
          </div>
        </div>
      )}
      <div className="px-4 py-2.5 border-b border-border shrink-0">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder={t.search_session_ph} className="w-full bg-gray-100 rounded-xl pl-9 pr-9 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-green-200 transition-all" />
          {query && <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={14} className="text-gray-400" /></button>}
        </div>
      </div>
      <div className="px-4 py-3 border-b border-border overflow-x-auto shrink-0">
        <div className="flex gap-2 min-w-max">
          {["ทั้งหมด", ...SPORTS_NAV].map(f => <button key={f} onClick={() => setSf(f === "ทั้งหมด" ? "" : f)} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${sf === (f === "ทั้งหมด" ? "" : f) ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{SPORTS_EMOJI[f] || ""} {f}</button>)}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {filtered.map(s => (
            <button key={s.id} onClick={() => setDetail(s.id)} className="bg-white rounded-2xl border border-border p-4 text-left hover:border-green-300 hover:shadow-md transition-all active:scale-[0.98] group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">{s.emoji}</div>
                <LvBadge name={s.level} color={s.levelColor} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 leading-tight">{s.title}</h3>
              <div className="space-y-1 mb-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays size={11} />{s.date} · {s.time}</div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin size={11} />{s.venue}</div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Users size={11} />{s.cur}/{s.max} คน</div>
              </div>
              <PBar cur={s.cur} max={s.max} className="mb-3" />
              <div className="flex items-center justify-between">
                {s.equipment && <span className="text-xs text-blue-600 font-semibold">🎒 มีอุปกรณ์</span>}
                <span className="ml-auto text-xs font-bold text-green-600 group-hover:underline">รายละเอียด →</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
