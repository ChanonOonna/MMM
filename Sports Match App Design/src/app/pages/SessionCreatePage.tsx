import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { useLang, T } from "../lang";
import { SPORTS, LEVELS, VENUES } from "../data";
import { PageHd } from "../components/shared";

export function SessionCreatePage({ onBack }: { onBack: () => void }) {
  const lang = useLang(); const t = T[lang];
  const inp = "w-full bg-white border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all";
  const [equip, setEquip] = useState(true);
  const [created, setCreated] = useState(false);
  const [title, setTitle] = useState("");
  const [sport, setSport] = useState(SPORTS[0].name);
  const [date, setDate] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("4");
  const [timeStart, setTimeStart] = useState("18:00");
  const [timeEnd, setTimeEnd] = useState("20:00");
  const [venue, setVenue] = useState(VENUES[0]);
  const [level, setLevel] = useState(LEVELS[0].name);
  if (created) return (
    <div className="flex flex-col h-full items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"><CheckCircle size={32} className="text-green-600" /></div>
      <h2 className="text-xl font-black mb-2">{t.session_created}</h2>
      <p className="text-muted-foreground text-sm mb-6">{title || (lang==="th"?"ห้องทั่วไปใหม่":"New Room")} ({sport}) {date ? `${t.date} ${date}` : ""} {timeStart}–{timeEnd} · {venue}</p>
      <button onClick={onBack} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700">{t.back_sessions}</button>
    </div>
  );
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHd title={t.create_session} onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full">
        <div className="space-y-4">
          <div><label className="text-sm font-bold text-gray-700 block mb-1.5">{t.sport}</label><select value={sport} onChange={e => setSport(e.target.value)} className={inp}>{SPORTS.map(s => <option key={s.id}>{s.emoji} {s.name}</option>)}</select></div>
          <div><label className="text-sm font-bold text-gray-700 block mb-1.5">{t.room_name}</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder={t.room_ph} className={inp} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-bold text-gray-700 block mb-1.5">{t.date}</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className={inp} /></div>
            <div><label className="text-sm font-bold text-gray-700 block mb-1.5">{t.max_players}</label><input type="number" value={maxPlayers} onChange={e => setMaxPlayers(e.target.value)} min={2} max={50} className={inp} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-bold text-gray-700 block mb-1.5">{t.time_start}</label><select value={timeStart} onChange={e => setTimeStart(e.target.value)} className={inp}>{"16:00,17:00,18:00,19:00".split(",").map(ts => <option key={ts}>{ts}</option>)}</select></div>
            <div><label className="text-sm font-bold text-gray-700 block mb-1.5">{t.time_end}</label><select value={timeEnd} onChange={e => setTimeEnd(e.target.value)} className={inp}>{"18:00,19:00,20:00,21:00".split(",").map(ts => <option key={ts}>{ts}</option>)}</select></div>
          </div>
          <div><label className="text-sm font-bold text-gray-700 block mb-1.5">{t.venue}</label><select value={venue} onChange={e => setVenue(e.target.value)} className={inp}>{VENUES.map(v => <option key={v}>{v}</option>)}</select></div>
          <div><label className="text-sm font-bold text-gray-700 block mb-1.5">{t.level_label}</label><select value={level} onChange={e => setLevel(e.target.value)} className={inp}>{LEVELS.map(l => <option key={l.id}>{l.name}</option>)}</select></div>
          <div className="flex items-center justify-between bg-white border border-border rounded-xl p-4">
            <div><p className="text-sm font-bold">{t.equipment}</p><p className="text-xs text-muted-foreground">{t.equip_desc2}</p></div>
            <button onClick={() => setEquip(v => !v)} className={`w-12 h-6 rounded-full relative transition-colors ${equip ? "bg-green-600" : "bg-gray-300"}`}><span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${equip ? "right-1" : "left-1"}`} /></button>
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-border shrink-0" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
        <button onClick={() => setCreated(true)} className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98]">{t.create_session}</button>
      </div>
    </div>
  );
}
