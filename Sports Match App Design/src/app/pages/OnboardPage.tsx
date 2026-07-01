import { useState } from "react";
import { ChevronLeft, Check, Plus, MapPin, Search, X, Camera, CheckCircle } from "lucide-react";
import { SPORTS, LEVELS, VENUES, DAYS } from "../data";
import { useLang, T } from "../lang";

export function OnboardPage({ onDone }: { onDone: () => void }) {
  const lang = useLang(); const t = T[lang];
  const [step, setStep] = useState(1);
  const [sports, setSports] = useState<string[]>([]);
  const [level, setLevel] = useState("");
  const [days, setDays] = useState<string[]>([]);
  const [avStart, setAvStart] = useState("17:00");
  const [avEnd, setAvEnd] = useState("20:00");
  const [venues, setVenues] = useState<string[]>([]);
  const [vSearch, setVSearch] = useState("");
  const [mainPicSet, setMainPicSet] = useState(false);
  const [extraPics, setExtraPics] = useState<Set<number>>(new Set());
  const tSport = (id: string) => setSports(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const tDay = (d: string) => setDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d]);
  const tVenue = (v: string) => setVenues(p => p.includes(v) ? p.filter(x => x !== v) : p.length < 5 ? [...p, v] : p);
  const canNext = [sports.length > 0, !!level, days.length > 0, venues.length > 0, true][step - 1];
  const fVenues = VENUES.filter(v => !vSearch || v.toLowerCase().includes(vSearch.toLowerCase()));
  const inp2 = "w-full bg-white border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all";
  const stepLabel = lang === "th" ? `ขั้นที่ ${step} / 5` : `Step ${step} of 5`;
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="sticky top-0 z-10 bg-white border-b border-border px-4 py-3.5">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => step > 1 && setStep(s => s - 1)} disabled={step === 1} className="p-1.5 rounded-xl hover:bg-gray-100 disabled:opacity-30 transition-colors"><ChevronLeft size={22} /></button>
            <span className="text-sm font-semibold text-muted-foreground">{stepLabel}</span>
            <div className="w-9" />
          </div>
          <div className="flex gap-1.5">{[1,2,3,4,5].map(s => <div key={s} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${s <= step ? "bg-green-600" : "bg-gray-200"}`} />)}</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-lg mx-auto w-full">
        {step === 1 && <>
          <h2 className="text-2xl font-black mb-1">{t.onboard_sport_title}</h2>
          <p className="text-muted-foreground text-sm mb-5">{t.onboard_sport_sub}</p>
          <div className="grid grid-cols-3 gap-3">
            {SPORTS.map(s => {
              const on = sports.includes(s.id);
              return (
                <button key={s.id} onClick={() => tSport(s.id)} className={`relative p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all ${on ? "border-green-600 bg-green-50 shadow-sm" : "border-border bg-white hover:border-green-300"}`}>
                  {on && <div className="absolute top-2 right-2 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center"><Check size={11} className="text-white" /></div>}
                  <span className="text-3xl">{s.emoji}</span>
                  <span className="text-xs font-semibold text-center leading-tight">{s.name}</span>
                </button>
              );
            })}
          </div>
        </>}
        {step === 2 && <>
          <h2 className="text-2xl font-black mb-1">{t.onboard_level_title}</h2>
          <p className="text-muted-foreground text-sm mb-5">{t.onboard_level_sub}</p>
          <div className="space-y-3">
            {LEVELS.map(l => (
              <button key={l.id} onClick={() => setLevel(l.id)} className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${level === l.id ? "border-green-600 bg-green-50" : "border-border bg-white hover:border-green-300"}`}>
                <div className={`w-3 h-3 rounded-full ${l.dot} shrink-0`} />
                <div className="flex-1"><p className="font-bold text-gray-900">{l.name}</p><p className="text-sm text-muted-foreground mt-0.5">{l.desc}</p></div>
                {level === l.id && <Check size={20} className="text-green-600 shrink-0" />}
              </button>
            ))}
          </div>
        </>}
        {step === 3 && <>
          <h2 className="text-2xl font-black mb-1">{t.onboard_time_title}</h2>
          <p className="text-muted-foreground text-sm mb-5">{t.onboard_time_sub}</p>
          <div className="bg-white rounded-2xl border border-border p-4 mb-4">
            <p className="text-sm font-bold mb-3">{t.avail_day_label}</p>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(d => <button key={d} onClick={() => tDay(d)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${days.includes(d) ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{d}</button>)}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-border p-4">
            <p className="text-sm font-bold mb-3">{t.avail_period}</p>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground block mb-1">{t.start}</label><select value={avStart} onChange={e => setAvStart(e.target.value)} className={inp2}>{"06:00,07:00,08:00,09:00,10:00,15:00,16:00,17:00,18:00,19:00".split(",").map(ts => <option key={ts}>{ts}</option>)}</select></div>
              <div><label className="text-xs text-muted-foreground block mb-1">{t.end}</label><select value={avEnd} onChange={e => setAvEnd(e.target.value)} className={inp2}>{"08:00,09:00,10:00,17:00,18:00,19:00,20:00,21:00,22:00".split(",").map(ts => <option key={ts}>{ts}</option>)}</select></div>
            </div>
          </div>
        </>}
        {step === 4 && <>
          <h2 className="text-2xl font-black mb-1">{t.onboard_venue_title}</h2>
          <p className="text-muted-foreground text-sm mb-4">{t.onboard_venue_sub}</p>
          {venues.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {venues.map(v => <span key={v} className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1.5 rounded-full">{v.split(" ")[0]}<button onClick={() => tVenue(v)}><X size={12} /></button></span>)}
            </div>
          )}
          <div className="relative mb-3"><Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={vSearch} onChange={e => setVSearch(e.target.value)} placeholder={t.search_venue} className={`${inp2} pl-9`} /></div>
          <div className="space-y-2">
            {fVenues.map(v => {
              const sel = venues.includes(v);
              return <button key={v} onClick={() => tVenue(v)} disabled={!sel && venues.length >= 5} className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 text-sm font-medium transition-all ${sel ? "border-green-600 bg-green-50" : "border-border bg-white hover:border-green-300 disabled:opacity-40"}`}><span className="flex items-center gap-2.5"><MapPin size={15} className={sel ? "text-green-600" : "text-gray-400"} />{v}</span>{sel && <Check size={17} className="text-green-600" />}</button>;
            })}
          </div>
        </>}
        {step === 5 && (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-black mb-1">{t.onboard_photo_title}</h2>
            <p className="text-muted-foreground text-sm mb-8">{t.onboard_photo_sub}</p>
            <button onClick={() => setMainPicSet(v => !v)} className={`w-32 h-32 rounded-full border-2 border-dashed flex flex-col items-center justify-center transition-colors mb-6 ${mainPicSet ? "bg-green-200 border-green-600" : "bg-green-50 border-green-400 hover:bg-green-100"}`}>{mainPicSet ? <><CheckCircle size={28} className="text-green-700 mb-1" /><span className="text-xs font-semibold text-green-700">{t.selected}</span></> : <><Camera size={28} className="text-green-500 mb-1" /><span className="text-xs font-semibold text-green-600">{t.main_photo}</span></>}</button>
            <div className="flex gap-3">{[0,1,2,3].map(i => <button key={i} onClick={() => setExtraPics(p => { const s=new Set(p); s.has(i)?s.delete(i):s.add(i); return s; })} className={`w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center transition-colors ${extraPics.has(i) ? "bg-green-100 border-green-400" : "bg-gray-100 border-gray-300 hover:bg-gray-50"}`}>{extraPics.has(i) ? <Check size={20} className="text-green-600" /> : <Plus size={20} className="text-gray-400" />}</button>)}</div>
          </div>
        )}
      </div>
      <div className="sticky bottom-0 bg-white border-t border-border p-4 max-w-lg mx-auto w-full" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
        <div className="flex gap-3">
          {step === 5 && <button onClick={onDone} className="flex-1 py-3.5 rounded-xl border-2 border-border text-gray-600 font-bold hover:bg-gray-50 transition-colors">{t.skip}</button>}
          <button onClick={() => step < 5 ? setStep(s => s + 1) : onDone()} disabled={!canNext} className={`flex-1 py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] ${canNext ? "bg-green-600 text-white hover:bg-green-700 shadow-sm" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
            {step === 5 ? t.done : t.next}
          </button>
        </div>
      </div>
    </div>
  );
}
