import { useState } from "react";
import { CalendarDays, MapPin, Users, Filter, Search, X } from "lucide-react";
import { useLang, T } from "../lang";
import { EVENTS } from "../data";
import { PBar, PageHd, SportBadge } from "../components/shared";

function EventCard({ ev, onDetail }: { ev: typeof EVENTS[0]; onDetail: (id: string) => void }) {
  return (
    <button onClick={() => onDetail(ev.id)} className="w-full bg-white rounded-2xl border border-border overflow-hidden text-left hover:border-green-300 hover:shadow-lg transition-all active:scale-[0.98] group">
      <div className="relative h-44 bg-gray-200 overflow-hidden">
        <img src={ev.cover} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        {ev.past && <div className="absolute top-3 left-3 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-full">จัดไปแล้ว</div>}
        <div className="absolute bottom-3 left-4 right-4"><h3 className="font-black text-white text-lg leading-tight">{ev.title}</h3><p className="text-white/60 text-xs mt-0.5">จัดโดย {ev.organizer}</p></div>
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1"><CalendarDays size={12} />{ev.date} · {ev.time}</span>
          <span className="flex items-center gap-1"><MapPin size={12} />{ev.venue}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700"><Users size={14} />{ev.participants.toLocaleString()} / {ev.max.toLocaleString()} คน</div>
          <PBar cur={ev.participants} max={ev.max} className="flex-1 max-w-[100px]" />
        </div>
      </div>
    </button>
  );
}

export function EventsPage({ onDetail }: { onDetail: (id: string) => void }) {
  const lang = useLang(); const t = T[lang];
  const [query, setQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterSport, setFilterSport] = useState("");
  const [filterPast, setFilterPast] = useState<"all"|"upcoming"|"past">("all");
  const allEvents = EVENTS.filter(e => {
    if (query && !e.title.toLowerCase().includes(query.toLowerCase()) && !e.organizer.toLowerCase().includes(query.toLowerCase())) return false;
    if (filterPast === "upcoming" && e.past) return false;
    if (filterPast === "past" && !e.past) return false;
    if (filterSport && !e.sports.includes(filterSport)) return false;
    return true;
  });
  const upcoming = allEvents.filter(e => !e.past);
  const past = allEvents.filter(e => e.past);
  const hasFilter = !!(filterSport || filterPast !== "all");
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHd title={t.events_title} right={
        <button onClick={() => setShowFilter(true)} className={`relative p-2 rounded-xl hover:bg-gray-100 transition-colors ${hasFilter ? "text-green-600" : "text-gray-500"}`}>
          <Filter size={19} />{hasFilter && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full" />}
        </button>
      } />
      <div className="px-4 py-2.5 border-b border-border shrink-0">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder={t.search_event_ph} className="w-full bg-gray-100 rounded-xl pl-9 pr-9 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-green-200 transition-all" />
          {query && <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={14} className="text-gray-400" /></button>}
        </div>
      </div>
      {showFilter && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end" onClick={() => setShowFilter(false)}>
          <div className="bg-white rounded-t-2xl p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{t.filter_events}</h3>
              <button onClick={() => { setFilterSport(""); setFilterPast("all"); }} className="text-sm text-green-600 font-bold">{t.reset}</button>
            </div>
            <div className="mb-4">
              <p className="text-sm font-bold mb-2">{lang==="th"?"สถานะ":"Status"}</p>
              <div className="flex gap-2">
                {([["all",t.all],["upcoming",t.upcoming],["past",t.past]] as const).map(([v,l]) => (
                  <button key={v} onClick={() => setFilterPast(v)} className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${filterPast===v?"bg-green-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{l}</button>
                ))}
              </div>
            </div>
            <div className="mb-5">
              <p className="text-sm font-bold mb-2">{t.sport}</p>
              <div className="flex flex-wrap gap-2">
                {["", ...["ฟุตบอล","บาสเกตบอล","วอลเลย์บอล","วิ่ง","แบดมินตัน"]].map(s => (
                  <button key={s} onClick={() => setFilterSport(s)} className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${filterSport===s?"bg-green-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{s||t.all}</button>
                ))}
              </div>
            </div>
            <button onClick={() => setShowFilter(false)} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700">{lang==="th"?"ดูผลลัพธ์":"View Results"} ({allEvents.length})</button>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {upcoming.length > 0 && (
          <div>
            <p className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-3">{t.upcoming} ({upcoming.length})</p>
            <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
              {upcoming.map(ev => <EventCard key={ev.id} ev={ev} onDetail={onDetail} />)}
            </div>
          </div>
        )}
        {past.length > 0 && (
          <div>
            <p className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-3">{t.past} ({past.length})</p>
            <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 opacity-70">
              {past.map(ev => <EventCard key={ev.id} ev={ev} onDetail={onDetail} />)}
            </div>
          </div>
        )}
        {allEvents.length === 0 && <p className="text-center text-muted-foreground text-sm py-16">{t.no_results}</p>}
      </div>
    </div>
  );
}
