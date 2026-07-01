import { useState } from "react";
import { Search, SlidersHorizontal, X, MapPin, Clock, Star } from "lucide-react";
import { useLang, T } from "../lang";
import type { View } from "../types";
import { USERS, SPORTS, LEVELS } from "../data";
import { Av, SportBadge, LvBadge } from "../components/shared";

export function SearchPage({ onBack, onProfile }: { onBack: () => void; onProfile: () => void }) {
  const lang = useLang(); const t = T[lang];
  const [query, setQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterSport, setFilterSport] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterEquip, setFilterEquip] = useState<""|"yes"|"no">("");
  const [filterVenue, setFilterVenue] = useState("");
  const hasFilter = !!(filterSport || filterLevel || filterEquip || filterVenue);
  const results = USERS.filter(u => {
    if (query && !u.name.includes(query) && !u.sport.includes(query)) return false;
    if (filterSport && u.sport !== filterSport) return false;
    if (filterLevel && u.level !== filterLevel) return false;
    return true;
  });
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-border shrink-0">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder={t.search_ph} className="w-full bg-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-green-200 transition-all" />
            {query && <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={15} className="text-gray-400" /></button>}
          </div>
          <button onClick={() => setShowFilter(true)} className={`relative p-2.5 rounded-xl border transition-colors ${hasFilter ? "border-green-600 text-green-600 bg-green-50" : "border-border text-gray-500 hover:bg-gray-50"}`}>
            <SlidersHorizontal size={18} />{hasFilter && <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />}
          </button>
          <button onClick={onBack} className="p-2.5 rounded-xl border border-border text-gray-500 hover:bg-gray-50"><X size={18} /></button>
        </div>
        {hasFilter && (
          <div className="flex gap-2 mt-2.5 overflow-x-auto pb-1">
            {filterSport && <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">{filterSport}<button onClick={() => setFilterSport("")}><X size={10}/></button></span>}
            {filterLevel && <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">{filterLevel}<button onClick={() => setFilterLevel("")}><X size={10}/></button></span>}
            {filterEquip && <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">{filterEquip==="yes"?"มีอุปกรณ์":"ไม่มีอุปกรณ์"}<button onClick={() => setFilterEquip("")}><X size={10}/></button></span>}
          </div>
        )}
      </div>
      {showFilter && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end" onClick={() => setShowFilter(false)}>
          <div className="bg-white rounded-t-2xl p-5 shadow-2xl max-h-[75vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{t.filter_label}</h3>
              <button onClick={() => { setFilterSport(""); setFilterLevel(""); setFilterEquip(""); setFilterVenue(""); }} className="text-sm text-green-600 font-bold">{t.reset}</button>
            </div>
            <div className="space-y-5">
              <div>
                <p className="text-sm font-bold mb-2">{t.sport}</p>
                <div className="flex flex-wrap gap-2">{["", ...SPORTS.slice(0,7).map(s=>s.name)].map(s => <button key={s} onClick={() => setFilterSport(s)} className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${filterSport===s?"bg-green-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{s||t.all}</button>)}</div>
              </div>
              <div>
                <p className="text-sm font-bold mb-2">{t.level_label}</p>
                <div className="flex flex-wrap gap-2">{["", ...LEVELS.map(l=>l.name)].map(l => <button key={l} onClick={() => setFilterLevel(l)} className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${filterLevel===l?"bg-green-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{l||t.all}</button>)}</div>
              </div>
              <div>
                <p className="text-sm font-bold mb-2">{t.equipment}</p>
                <div className="flex gap-2">{([["","ทั้งหมด"],["yes","มีอุปกรณ์"],["no","ไม่มีอุปกรณ์"]] as const).map(([v,l]) => <button key={v} onClick={() => setFilterEquip(v)} className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${filterEquip===v?"bg-green-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{l}</button>)}</div>
              </div>
            </div>
            <button onClick={() => setShowFilter(false)} className="w-full mt-5 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700">{lang==="th"?"ดูผลลัพธ์":"View Results"} ({results.length})</button>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        {query === "" && !hasFilter ? (
          <div className="p-4">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-3">{t.suggestions}</p>
            <div className="grid grid-cols-2 gap-2">
              {SPORTS.slice(0,6).map(s => <button key={s.id} onClick={() => setQuery(s.name)} className="bg-white border border-border rounded-xl p-3 flex items-center gap-2.5 hover:border-green-300 hover:bg-green-50 transition-colors text-left"><span className="text-xl">{s.emoji}</span><span className="text-sm font-semibold">{s.name}</span></button>)}
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground"><Search size={32} className="mb-2 opacity-30" /><p className="text-sm">{t.no_results}</p></div>
        ) : (
          <div className="divide-y divide-border">
            {results.map(u => (
              <button key={u.id} onClick={onProfile} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 text-left transition-colors">
                <Av src={u.photo} size="lg" warn={u.warning} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap"><p className="text-sm font-bold text-gray-900">{u.name}</p><SportBadge emoji={u.sportEmoji} name={u.sport} /><LvBadge name={u.level} color={u.levelColor} /></div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><MapPin size={10}/>{u.venue}</span>
                    <span className="flex items-center gap-1"><Clock size={10}/>{u.avail}</span>
                    {u.rating && <span className="flex items-center gap-1"><Star size={10} className="text-amber-500"/>{u.rating}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
