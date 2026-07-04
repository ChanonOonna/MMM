import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Check, Plus, MapPin, Search, X, Camera, Loader2 } from "lucide-react";
import { DAYS } from "../data";
import { useLang, T } from "../lang";
import { ThaiTimeField } from "../components/shared";
import { fetchSports, fetchVenues, sportEmoji, type ApiSport, type ApiVenue } from "../catalog";
import {
  deleteProfilePhoto,
  saveMyFavoriteVenues,
  saveMySchedule,
  saveMySports,
  uploadProfilePhoto,
  THAI_DAY_TO_INDEX,
  type ProfilePhoto,
} from "../profile";
import { ApiError } from "../auth/AuthContext";

const LEVEL_OPTIONS = [
  { id: "beginner", name: "ผู้เริ่มต้น", desc: "เพิ่งเริ่มเล่น ยังไม่ชำนาญ", color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  { id: "intermediate", name: "ระดับกลาง", desc: "เล่นได้สักพัก รู้เทคนิคพื้นฐาน", color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  { id: "advanced", name: "ระดับสูง", desc: "เล่นมาหลายปี ค่อนข้างเชี่ยวชาญ", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  { id: "competitive", name: "แข่งขัน", desc: "เคยแข่งขันในรายการต่างๆ", color: "bg-pink-100 text-pink-700", dot: "bg-pink-500" },
];

export function OnboardPage({ onDone }: { onDone: () => void }) {
  const lang = useLang(); const t = T[lang];
  const [step, setStep] = useState(1);
  const [apiSports, setApiSports] = useState<ApiSport[]>([]);
  const [apiVenues, setApiVenues] = useState<ApiVenue[]>([]);
  const [catalogError, setCatalogError] = useState("");
  const [sports, setSports] = useState<string[]>([]); // sportId[]
  const [level, setLevel] = useState("");
  const [days, setDays] = useState<string[]>([]);
  const [dayTimes, setDayTimes] = useState<Record<string, { start: string; end: string }>>({});
  const [venues, setVenues] = useState<string[]>([]); // venueId[]
  const [vSearch, setVSearch] = useState("");
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    Promise.all([fetchSports(), fetchVenues()])
      .then(([s, v]) => { setApiSports(s); setApiVenues(v); })
      .catch(() => setCatalogError("โหลดรายชื่อกีฬา/สนามไม่สำเร็จ ลองรีเฟรชหน้านี้อีกครั้ง"));
  }, []);

  const tSport = (id: string) => setSports(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const tDay = (d: string) => {
    setDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d]);
    setDayTimes(p => p[d] ? p : { ...p, [d]: { start: "17:00", end: "20:00" } });
  };
  const setDayStart = (d: string, start: string) => setDayTimes(p => ({ ...p, [d]: { start, end: p[d]?.end ?? "20:00" } }));
  const setDayEnd = (d: string, end: string) => setDayTimes(p => ({ ...p, [d]: { start: p[d]?.start ?? "17:00", end } }));
  const tVenue = (id: string) => setVenues(p => p.includes(id) ? p.filter(x => x !== id) : p.length < 5 ? [...p, id] : p);

  const onPickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoError(""); setPhotoUploading(true);
    try {
      const photo = await uploadProfilePhoto(file);
      setPhotos(p => [...p, photo]);
    } catch (err) {
      setPhotoError(err instanceof ApiError ? err.message : "อัปโหลดรูปไม่สำเร็จ");
    } finally {
      setPhotoUploading(false);
    }
  };

  const onRemovePhoto = async (id: string) => {
    setPhotoError("");
    try {
      await deleteProfilePhoto(id);
      setPhotos(p => p.filter(x => x.id !== id));
    } catch (err) {
      setPhotoError(err instanceof ApiError ? err.message : "ลบรูปไม่สำเร็จ");
    }
  };
  const canNext = [sports.length > 0, !!level, days.length > 0, venues.length > 0, true][step - 1];
  const fVenues = apiVenues.filter(v => !vSearch || v.name.toLowerCase().includes(vSearch.toLowerCase()));
  const inp2 = "w-full bg-white border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all";
  const stepLabel = lang === "th" ? `ขั้นที่ ${step} / 5` : `Step ${step} of 5`;

  const finish = async () => {
    setSubmitting(true); setSaveError("");
    try {
      if (sports.length > 0 && level) {
        await saveMySports(sports.map(sportId => ({ sportId, level })));
      }
      if (days.length > 0) {
        await saveMySchedule(days.map(d => ({ dayOfWeek: THAI_DAY_TO_INDEX[d], startTime: dayTimes[d]?.start ?? "17:00", endTime: dayTimes[d]?.end ?? "20:00" })));
      }
      await saveMyFavoriteVenues(venues);
      onDone();
    } catch (e) {
      setSaveError(e instanceof ApiError ? e.message : "บันทึกไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  };

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
        {catalogError && <p className="text-red-500 text-xs mb-4">{catalogError}</p>}
        {step === 1 && <>
          <h2 className="text-2xl font-black mb-1">{t.onboard_sport_title}</h2>
          <p className="text-muted-foreground text-sm mb-5">{t.onboard_sport_sub}</p>
          <div className="grid grid-cols-3 gap-3">
            {apiSports.map(s => {
              const on = sports.includes(s.id);
              return (
                <button key={s.id} onClick={() => tSport(s.id)} className={`relative p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all ${on ? "border-green-600 bg-green-50 shadow-sm" : "border-border bg-white hover:border-green-300"}`}>
                  {on && <div className="absolute top-2 right-2 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center"><Check size={11} className="text-white" /></div>}
                  <span className="text-3xl">{sportEmoji(s.name, s.icon)}</span>
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
            {LEVEL_OPTIONS.map(l => (
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
          {days.length > 0 && (
            <div className="bg-white rounded-2xl border border-border p-4 space-y-4">
              <p className="text-sm font-bold">{t.avail_period}</p>
              {days.map(d => (
                <div key={d}>
                  <p className="text-xs font-semibold text-green-700 mb-1.5">{d}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs text-muted-foreground block mb-1">{t.start}</label><ThaiTimeField value={dayTimes[d]?.start ?? "17:00"} onChange={v => setDayStart(d, v)} /></div>
                    <div><label className="text-xs text-muted-foreground block mb-1">{t.end}</label><ThaiTimeField value={dayTimes[d]?.end ?? "20:00"} onChange={v => setDayEnd(d, v)} /></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>}
        {step === 4 && <>
          <h2 className="text-2xl font-black mb-1">{t.onboard_venue_title}</h2>
          <p className="text-muted-foreground text-sm mb-4">{t.onboard_venue_sub}</p>
          {venues.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {venues.map(id => {
                const v = apiVenues.find(x => x.id === id);
                if (!v) return null;
                return <span key={id} className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1.5 rounded-full">{v.name.split(" ")[0]}<button onClick={() => tVenue(id)}><X size={12} /></button></span>;
              })}
            </div>
          )}
          <div className="relative mb-3"><Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={vSearch} onChange={e => setVSearch(e.target.value)} placeholder={t.search_venue} className={`${inp2} pl-9`} /></div>
          <div className="space-y-2">
            {fVenues.map(v => {
              const sel = venues.includes(v.id);
              return <button key={v.id} onClick={() => tVenue(v.id)} disabled={!sel && venues.length >= 5} className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 text-sm font-medium transition-all ${sel ? "border-green-600 bg-green-50" : "border-border bg-white hover:border-green-300 disabled:opacity-40"}`}><span className="flex items-center gap-2.5"><MapPin size={15} className={sel ? "text-green-600" : "text-gray-400"} />{v.name}</span>{sel && <Check size={17} className="text-green-600" />}</button>;
            })}
          </div>
        </>}
        {step === 5 && (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-black mb-1">{t.onboard_photo_title}</h2>
            <p className="text-muted-foreground text-sm mb-8">{t.onboard_photo_sub}</p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
            {photos[0] ? (
              <div className="relative w-32 h-32 rounded-full overflow-hidden mb-6">
                <img src={photos[0].url} alt="" className="w-full h-full object-cover" />
                <button onClick={() => onRemovePhoto(photos[0].id)} className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"><X size={13} className="text-white" /></button>
              </div>
            ) : (
              <button onClick={() => fileInputRef.current?.click()} disabled={photoUploading} className="w-32 h-32 rounded-full border-2 border-dashed border-green-400 bg-green-50 hover:bg-green-100 flex flex-col items-center justify-center transition-colors mb-6 disabled:opacity-60">
                {photoUploading ? <Loader2 size={28} className="text-green-500 animate-spin" /> : <><Camera size={28} className="text-green-500 mb-1" /><span className="text-xs font-semibold text-green-600">{t.main_photo}</span></>}
              </button>
            )}
            <div className="flex gap-3">
              {[0,1,2,3].map(i => {
                const p = photos[i + 1];
                if (p) return (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden">
                    <img src={p.url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => onRemovePhoto(p.id)} className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 hover:bg-red-600 rounded-full flex items-center justify-center"><X size={9} className="text-white" /></button>
                  </div>
                );
                const enabled = photos.length === i + 1 && !photoUploading;
                return (
                  <button key={i} onClick={() => enabled && fileInputRef.current?.click()} disabled={!enabled} className={`w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center transition-colors ${enabled ? "bg-gray-100 border-gray-300 hover:bg-gray-50" : "bg-gray-50 border-gray-200 opacity-50"}`}><Plus size={20} className="text-gray-400" /></button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-4">{lang === "th" ? "ข้อมูลกีฬา/ระดับ/เวลาว่าง/สนามที่เลือกไว้จะถูกบันทึกทันทีที่กดต่อไป" : "Your sport/level/availability/venue picks are saved when you continue."}</p>
            {photoError && <p className="text-red-500 text-xs mt-3">{photoError}</p>}
            {saveError && <p className="text-red-500 text-xs mt-3">{saveError}</p>}
          </div>
        )}
      </div>
      <div className="sticky bottom-0 bg-white border-t border-border p-4 max-w-lg mx-auto w-full" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
        <div className="flex gap-3">
          {step === 5 && <button onClick={finish} disabled={submitting} className="flex-1 py-3.5 rounded-xl border-2 border-border text-gray-600 font-bold hover:bg-gray-50 transition-colors disabled:opacity-50">{t.skip}</button>}
          <button onClick={() => step < 5 ? setStep(s => s + 1) : finish()} disabled={!canNext || submitting} className={`flex-1 py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] ${canNext && !submitting ? "bg-green-600 text-white hover:bg-green-700 shadow-sm" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
            {submitting ? "กำลังบันทึก..." : step === 5 ? t.done : t.next}
          </button>
        </div>
      </div>
    </div>
  );
}
