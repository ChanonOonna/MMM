import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Users, Plus, SlidersHorizontal, Search, X } from "lucide-react";
import { useLang, T } from "../lang";
import type { View } from "../types";
import { LvBadge, PBar, MobileUtilityNav, ThaiDateField, ThaiTimeField } from "../components/shared";
import { fetchSports, fetchVenues, sportEmoji, type ApiSport, type ApiVenue } from "../catalog";
import {
  browseSessions,
  createSession,
  fetchMySessions,
  type MySession,
  type SessionStatus,
  type SessionSummary,
} from "../sessions";
import { ApiError } from "../api";

const LEVEL_OPTIONS = [
  { id: "beginner", name: "ผู้เริ่มต้น" },
  { id: "intermediate", name: "ระดับกลาง" },
  { id: "advanced", name: "ระดับสูง" },
  { id: "competitive", name: "แข่งขัน" },
];

const LEVEL_LABEL: Record<string, string> = { beginner: "ผู้เริ่มต้น", intermediate: "ระดับกลาง", advanced: "ระดับสูง", competitive: "แข่งขัน" };
const LEVEL_COLOR: Record<string, string> = { beginner: "bg-emerald-100 text-emerald-700", intermediate: "bg-blue-100 text-blue-700", advanced: "bg-amber-100 text-amber-700", competitive: "bg-pink-100 text-pink-700" };
const STATUS_LABEL: Record<string, string> = { open: "เปิดรับสมาชิก", full: "เต็มแล้ว", ongoing: "กำลังแข่ง", completed: "จบแล้ว", cancelled: "ยกเลิกแล้ว" };
const STATUS_COLOR: Record<string, string> = { open: "bg-green-100 text-green-700", full: "bg-amber-100 text-amber-700", ongoing: "bg-blue-100 text-blue-700", completed: "bg-gray-100 text-gray-600", cancelled: "bg-red-100 text-red-600" };

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("th-TH-u-ca-buddhist", { day: "numeric", month: "short", year: "2-digit" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function SessionsPage({ onDetail, onNav }: { onDetail: (id: string) => void; onNav: (v: View) => void }) {
  const lang = useLang(); const t = T[lang];
  const [apiSports, setApiSports] = useState<ApiSport[]>([]);
  const [apiVenues, setApiVenues] = useState<ApiVenue[]>([]);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [sf, setSf] = useState(""); // sportId
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [fVenue, setFVenue] = useState(""); // venueId
  const [fLevel, setFLevel] = useState("");
  const [fEquip, setFEquip] = useState<"all"|"yes"|"no">("all");
  const [mySessions, setMySessions] = useState<MySession[]>([]);
  const [mineLoading, setMineLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSportId, setNewSportId] = useState("");
  const [newVenueId, setNewVenueId] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTimeStart, setNewTimeStart] = useState("18:00");
  const [newTimeEnd, setNewTimeEnd] = useState("20:00");
  const [newMaxPlayers, setNewMaxPlayers] = useState("4");
  const [newLevel, setNewLevel] = useState(LEVEL_OPTIONS[0].id);
  const [newEquip, setNewEquip] = useState<boolean | null>(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    Promise.all([fetchSports(), fetchVenues()]).then(([sp, ve]) => { setApiSports(sp); setApiVenues(ve); }).catch(() => {});
  }, []);

  const openCreateForm = () => {
    setNewTitle(""); setNewDate(""); setNewMaxPlayers("4");
    setNewSportId(apiSports[0]?.id ?? ""); setNewVenueId(apiVenues[0]?.id ?? "");
    setNewTimeStart("18:00"); setNewTimeEnd("20:00");
    setNewLevel(LEVEL_OPTIONS[0].id); setNewEquip(null);
    setCreateError("");
    setShowCreateForm(true);
  };
  const handleCreateSession = async () => {
    if (!newTitle.trim() || !newSportId || !newVenueId || !newDate || newEquip === null) {
      setCreateError("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    setCreateSubmitting(true);
    setCreateError("");
    try {
      await createSession({
        sportId: newSportId,
        venueId: newVenueId,
        title: newTitle.trim(),
        skillLevel: newLevel as any,
        equipmentRequired: newEquip,
        maxPlayers: Number(newMaxPlayers),
        startTime: new Date(`${newDate}T${newTimeStart}:00`).toISOString(),
        endTime: new Date(`${newDate}T${newTimeEnd}:00`).toISOString(),
      });
      setShowCreateForm(false);
      refetchSessions();
      refetchMine();
    } catch (e) {
      setCreateError(e instanceof ApiError ? e.message : "สร้าง Session ไม่สำเร็จ");
    } finally {
      setCreateSubmitting(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const refetchSessions = () => {
    setLoading(true);
    browseSessions({
      sportId: sf || undefined,
      venueId: fVenue || undefined,
      skillLevel: fLevel || undefined,
      equipmentRequired: fEquip === "all" ? undefined : fEquip === "yes",
      search: debouncedQuery || undefined,
    }).then(setSessions).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { refetchSessions(); }, [sf, fVenue, fLevel, fEquip, debouncedQuery]);

  const refetchMine = () => {
    setMineLoading(true);
    fetchMySessions().then(setMySessions).catch(() => {}).finally(() => setMineLoading(false));
  };

  useEffect(() => { refetchMine(); }, []);

  const mineIds = new Set(mySessions.map(m => m.sessionId));
  const combined: Array<{
    id: string; sport: string; icon?: string | null; title: string;
    startTime: string; endTime: string; venue: string;
    currentPlayers: number; maxPlayers: number;
    skillLevel?: SessionSummary["skillLevel"]; equipmentRequired?: boolean; status: SessionStatus;
  }> = [
    ...sessions.map(s => ({
      id: s.id, sport: s.sport.name, icon: s.sport.icon, title: s.title,
      startTime: s.startTime, endTime: s.endTime, venue: s.venue.name,
      currentPlayers: s.currentPlayers, maxPlayers: s.maxPlayers,
      skillLevel: s.skillLevel, equipmentRequired: s.equipmentRequired, status: s.status,
    })),
    ...mySessions.filter(m => !sessions.some(s => s.id === m.sessionId)).map(m => ({
      id: m.sessionId, sport: m.sport, title: m.title,
      startTime: m.startTime, endTime: m.endTime, venue: m.venue,
      currentPlayers: m.currentPlayers, maxPlayers: m.maxPlayers, status: m.status,
    })),
  ];
  const isMineOnly = (id: string) => mineIds.has(id) && !sessions.some(s => s.id === id);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-border h-14 px-4 flex items-center gap-3 shrink-0">
        <h1 className="font-bold text-lg flex-1">{t.sessions_title}</h1>
        <MobileUtilityNav onNav={onNav} />
        <button onClick={() => setShowFilter(true)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 relative"><SlidersHorizontal size={19} />{(fVenue||fLevel||fEquip!=="all") && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full" />}</button>
        <button onClick={openCreateForm} className="bg-green-600 text-white px-3.5 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 hover:bg-green-700 transition-colors active:scale-95"><Plus size={15} />{t.create}</button>
      </div>
      {showFilter && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end" onClick={() => setShowFilter(false)}>
          <div className="bg-white rounded-t-2xl p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-lg">{t.filter}</h3><button onClick={() => { setFVenue(""); setFLevel(""); setFEquip("all"); }} className="text-sm text-green-600 font-bold">{t.reset}</button></div>
            <div className="mb-4"><p className="text-sm font-bold mb-2">{t.venue}</p><select value={fVenue} onChange={e => setFVenue(e.target.value)} className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500"><option value="">{lang==="th"?"ทุกสนาม":"All Venues"}</option>{apiVenues.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}</select></div>
            <div className="mb-4"><p className="text-sm font-bold mb-2">{t.level_label}</p><div className="flex flex-wrap gap-2">{["","beginner","intermediate","advanced","competitive"].map(l=><button key={l} onClick={()=>setFLevel(l)} className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${fLevel===l?"bg-green-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{l?LEVEL_LABEL[l]:t.all}</button>)}</div></div>
            <div className="mb-5"><p className="text-sm font-bold mb-2">{t.equipment}</p><div className="flex gap-2">{([["all",t.all],["yes",lang==="th"?"มีอุปกรณ์":"Has Equipment"],["no",lang==="th"?"ไม่มี":"None"]] as const).map(([v,l])=><button key={v} onClick={()=>setFEquip(v)} className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${fEquip===v?"bg-green-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{l}</button>)}</div></div>
            <button onClick={() => setShowFilter(false)} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700">{lang==="th"?"ดูผลลัพธ์":"View Results"} ({sessions.length})</button>
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
          <button onClick={() => setSf("")} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${sf === "" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>ทั้งหมด</button>
          {apiSports.map(sp => <button key={sp.id} onClick={() => setSf(sp.id)} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${sf === sp.id ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{sportEmoji(sp.name, sp.icon)} {sp.name}</button>)}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {(loading || mineLoading) && <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>}
        {!loading && !mineLoading && combined.length === 0 && <p className="text-center text-sm text-muted-foreground py-10">ไม่พบ Session</p>}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {combined.map(s => (
            <div key={s.id} onClick={() => onDetail(s.id)} className="relative bg-white rounded-2xl border border-border p-4 text-left hover:border-green-300 hover:shadow-md transition-all active:scale-[0.98] cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">{sportEmoji(s.sport, s.icon)}</div>
                {isMineOnly(s.id) || s.skillLevel === undefined
                  ? <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${STATUS_COLOR[s.status]}`}>{STATUS_LABEL[s.status]}</span>
                  : <LvBadge name={LEVEL_LABEL[s.skillLevel]} color={LEVEL_COLOR[s.skillLevel]} />}
              </div>
              <h3 className="font-bold text-gray-900 mb-2 leading-tight pr-6">{s.title}</h3>
              <div className="space-y-1 mb-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays size={11} />{fmtDate(s.startTime)} · {fmtTime(s.startTime)}-{fmtTime(s.endTime)}</div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin size={11} />{s.venue}</div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Users size={11} />{s.currentPlayers}/{s.maxPlayers} คน</div>
              </div>
              <PBar cur={s.currentPlayers} max={s.maxPlayers} className="mb-3" />
              <div className="flex items-center justify-between">
                {s.equipmentRequired && <span className="text-xs text-blue-600 font-semibold">🎒 มีอุปกรณ์</span>}
                {mineIds.has(s.id) && <span className="text-xs text-green-600 font-semibold">✓ เข้าร่วมแล้ว</span>}
                <span className="ml-auto text-xs font-bold text-green-600 group-hover:underline">รายละเอียด →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 overflow-y-auto">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-xl my-auto">
            <h3 className="font-bold text-lg mb-4">{t.create_session}</h3>
            <div className="space-y-3">
              <div><label className="text-sm font-bold text-gray-700 block mb-1.5">{t.sport}</label><select value={newSportId} onChange={e => setNewSportId(e.target.value)} className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500">{apiSports.map(s => <option key={s.id} value={s.id}>{sportEmoji(s.name, s.icon)} {s.name}</option>)}</select></div>
              <div><label className="text-sm font-bold text-gray-700 block mb-1.5">{t.room_name}</label><input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder={t.room_ph} className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-bold text-gray-700 block mb-1.5">{t.date}</label><ThaiDateField value={newDate} onChange={setNewDate} /></div>
                <div><label className="text-sm font-bold text-gray-700 block mb-1.5">{t.max_players}</label><input type="number" min={2} max={50} value={newMaxPlayers} onChange={e => setNewMaxPlayers(e.target.value)} className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-bold text-gray-700 block mb-1.5">{t.time_start}</label><ThaiTimeField value={newTimeStart} onChange={setNewTimeStart} /></div>
                <div><label className="text-sm font-bold text-gray-700 block mb-1.5">{t.time_end}</label><ThaiTimeField value={newTimeEnd} onChange={setNewTimeEnd} /></div>
              </div>
              <div><label className="text-sm font-bold text-gray-700 block mb-1.5">{t.venue}</label><select value={newVenueId} onChange={e => setNewVenueId(e.target.value)} className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500">{apiVenues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></div>
              <div><label className="text-sm font-bold text-gray-700 block mb-1.5">{t.level_label}</label><select value={newLevel} onChange={e => setNewLevel(e.target.value)} className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500">{LEVEL_OPTIONS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
              <div className="bg-gray-50 border border-border rounded-xl p-3.5">
                <p className="text-sm font-bold">{t.equipment}</p>
                <p className="text-xs text-muted-foreground mb-2.5">{t.equip_desc2}</p>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setNewEquip(true)} className={`py-2 rounded-lg text-sm font-bold border transition-colors ${newEquip === true ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-border hover:bg-gray-100"}`}>มีอุปกรณ์</button>
                  <button type="button" onClick={() => setNewEquip(false)} className={`py-2 rounded-lg text-sm font-bold border transition-colors ${newEquip === false ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-border hover:bg-gray-100"}`}>ไม่มีอุปกรณ์</button>
                </div>
              </div>
              {createError && <p className="text-red-500 text-xs">{createError}</p>}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowCreateForm(false)} disabled={createSubmitting} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50">{t.cancel}</button>
              <button onClick={handleCreateSession} disabled={createSubmitting || newEquip === null} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-50">{createSubmitting ? "กำลังสร้าง..." : t.create}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
