import { useEffect, useRef, useState } from "react";
import { Camera, Check, CheckCircle, Loader2, X } from "lucide-react";
import { useLang, T } from "../lang";
import { DAYS } from "../data";
import { PageHd, ThaiTimeField } from "../components/shared";
import { fetchSports, fetchVenues, sportEmoji, type ApiSport, type ApiVenue } from "../catalog";
import {
  deleteProfilePhoto,
  fetchMyProfile,
  saveMyFavoriteVenues,
  saveMySchedule,
  saveMySports,
  updateMyProfile,
  uploadProfilePhoto,
  THAI_DAY_TO_INDEX,
  type ProfilePhoto,
} from "../profile";
import { ApiError } from "../auth/AuthContext";

const LEVEL_OPTIONS = [
  { id: "beginner", name: "ผู้เริ่มต้น" },
  { id: "intermediate", name: "ระดับกลาง" },
  { id: "advanced", name: "ระดับสูง" },
  { id: "competitive", name: "แข่งขัน" },
];

const INDEX_TO_THAI_DAY: Record<number, string> = { 0: "อา", 1: "จ", 2: "อ", 3: "พ", 4: "พฤ", 5: "ศ", 6: "ส" };

export function EditProfilePage({ onBack }: { onBack: () => void }) {
  const lang = useLang(); const t = T[lang];
  const inp = "w-full bg-white border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all";

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [apiSports, setApiSports] = useState<ApiSport[]>([]);
  const [apiVenues, setApiVenues] = useState<ApiVenue[]>([]);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nick, setNick] = useState("");
  const [selSports, setSelSports] = useState<string[]>([]);
  const [selDays, setSelDays] = useState<string[]>([]);
  const [hasEquip, setHasEquip] = useState(false);
  const [selVenues, setSelVenues] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [selLevel, setSelLevel] = useState(LEVEL_OPTIONS[0].id);
  const [dayTimes, setDayTimes] = useState<Record<string, { start: string; end: string }>>({});
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([fetchMyProfile(), fetchSports(), fetchVenues()])
      .then(([profile, sports, venues]) => {
        setApiSports(sports);
        setApiVenues(venues);
        setFirstName(profile.firstName);
        setLastName(profile.lastName);
        setNick(profile.nickname ?? "");
        setEmail(profile.email);
        setHasEquip(profile.hasEquipment);
        setPhotos(profile.photos);
        setSelSports(profile.sports.map(s => s.sportId));
        if (profile.sports[0]) setSelLevel(profile.sports[0].level);
        setSelVenues(profile.favoritePlaces.map(f => f.venueId));
        const dayLetters = Array.from(new Set(profile.weeklySchedule.map(s => INDEX_TO_THAI_DAY[s.dayOfWeek])));
        setSelDays(dayLetters);
        const times: Record<string, { start: string; end: string }> = {};
        for (const s of profile.weeklySchedule) times[INDEX_TO_THAI_DAY[s.dayOfWeek]] = { start: s.startTime, end: s.endTime };
        setDayTimes(times);
      })
      .catch(() => setLoadError("โหลดข้อมูลโปรไฟล์ไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, []);

  const tSport = (id: string) => setSelSports(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const tDay = (d: string) => {
    setSelDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d]);
    setDayTimes(p => p[d] ? p : { ...p, [d]: { start: "17:00", end: "20:00" } });
  };
  const setDayStart = (d: string, start: string) => setDayTimes(p => ({ ...p, [d]: { start, end: p[d]?.end ?? "20:00" } }));
  const setDayEnd = (d: string, end: string) => setDayTimes(p => ({ ...p, [d]: { start: p[d]?.start ?? "17:00", end } }));

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

  const onDeletePhoto = async (id: string) => {
    setPhotoError("");
    try {
      await deleteProfilePhoto(id);
      setPhotos(p => p.filter(x => x.id !== id));
    } catch (err) {
      setPhotoError(err instanceof ApiError ? err.message : "ลบรูปไม่สำเร็จ");
    }
  };

  const save = async () => {
    setSaving(true); setSaveError("");
    try {
      await updateMyProfile({ firstName, lastName, nickname: nick, hasEquipment: hasEquip });
      if (selSports.length > 0) {
        await saveMySports(selSports.map(sportId => ({ sportId, level: selLevel })));
      }
      await saveMySchedule(selDays.map(d => ({ dayOfWeek: THAI_DAY_TO_INDEX[d], startTime: dayTimes[d]?.start ?? "17:00", endTime: dayTimes[d]?.end ?? "20:00" })));
      await saveMyFavoriteVenues(selVenues);
      setSaved(true);
      setTimeout(() => { setSaved(false); onBack(); }, 900);
    } catch (e) {
      setSaveError(e instanceof ApiError ? e.message : "บันทึกไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <PageHd title={t.edit_profile} onBack={onBack} />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHd title={t.edit_profile} onBack={onBack} />
      {saved && <div className="mx-4 mt-2 bg-green-50 border border-green-200 text-green-700 text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2"><CheckCircle size={16} />{t.save_success}</div>}
      {loadError && <div className="mx-4 mt-2 bg-red-50 border border-red-200 text-red-600 text-sm font-bold px-4 py-2.5 rounded-xl">{loadError}</div>}
      <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full">
        <div className="mb-6">
          <p className="text-sm font-bold text-gray-700 mb-2">{t.profile_photos} <span className="text-xs text-muted-foreground font-normal">{t.photo_hint}</span></p>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
          <div className="flex flex-wrap gap-2.5">
            {photos.map(p => (
              <div key={p.id} className="relative w-20 h-20 rounded-xl overflow-hidden group">
                <img src={p.url} alt="" className="w-full h-full object-cover" />
                <button onClick={() => onDeletePhoto(p.id)} className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"><X size={11} className="text-white" /></button>
              </div>
            ))}
            {photos.length < 5 && (
              <button onClick={() => fileInputRef.current?.click()} disabled={photoUploading} className="w-20 h-20 rounded-xl border-2 border-dashed border-green-300 bg-green-50 hover:bg-green-100 flex items-center justify-center transition-colors disabled:opacity-60">
                {photoUploading ? <Loader2 size={20} className="text-green-600 animate-spin" /> : <Camera size={20} className="text-green-600" />}
              </button>
            )}
          </div>
          {photoError && <p className="text-red-500 text-xs mt-2">{photoError}</p>}
        </div>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1"><label className="text-sm font-bold text-gray-700 block mb-1.5">{lang==="th"?"ชื่อ":"First Name"}</label><input value={firstName} onChange={e => setFirstName(e.target.value)} className={inp} /></div>
            <div className="flex-1"><label className="text-sm font-bold text-gray-700 block mb-1.5">{lang==="th"?"นามสกุล":"Last Name"}</label><input value={lastName} onChange={e => setLastName(e.target.value)} className={inp} /></div>
          </div>
          <div><label className="text-sm font-bold text-gray-700 block mb-1.5">{t.ph_nickname}</label><input value={nick} onChange={e => setNick(e.target.value)} className={inp} /></div>
          <div><label className="text-sm font-bold text-gray-700 block mb-1.5">Email</label><input value={email} readOnly className={`${inp} text-muted-foreground cursor-not-allowed`} /></div>
          <div><label className="text-sm font-bold text-gray-700 block mb-1.5">{t.skill_level}</label><select value={selLevel} onChange={e => setSelLevel(e.target.value)} className={inp}>{LEVEL_OPTIONS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">{t.sports_played}</label>
            <div className="grid grid-cols-3 gap-2">
              {apiSports.map(s => { const on = selSports.includes(s.id); return (<button key={s.id} onClick={()=>tSport(s.id)} className={`relative p-2.5 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${on?"border-green-600 bg-green-50":"border-border bg-white hover:border-green-300"}`}>{on&&<div className="absolute top-1.5 right-1.5 w-4 h-4 bg-green-600 rounded-full flex items-center justify-center"><Check size={9} className="text-white"/></div>}<span className="text-2xl">{sportEmoji(s.name, s.icon)}</span><span className="text-[10px] font-semibold text-center leading-tight">{s.name}</span></button>);})}
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">{t.available_days}</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(d=><button key={d} onClick={()=>tDay(d)} className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all ${selDays.includes(d)?"bg-green-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{d}</button>)}
            </div>
          </div>
          {selDays.length > 0 && (
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">{t.avail_time}</label>
              <div className="space-y-3">
                {selDays.map(d => (
                  <div key={d}>
                    <p className="text-xs font-semibold text-green-700 mb-1.5">{d}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-xs text-muted-foreground block mb-1">{t.start}</label><ThaiTimeField value={dayTimes[d]?.start ?? "17:00"} onChange={v => setDayStart(d, v)} /></div>
                      <div><label className="text-xs text-muted-foreground block mb-1">{t.end}</label><ThaiTimeField value={dayTimes[d]?.end ?? "20:00"} onChange={v => setDayEnd(d, v)} /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-1.5">{t.favorites}</label>
            <div className="flex flex-wrap gap-2 mb-2">{selVenues.map(id => { const v = apiVenues.find(x => x.id === id); if (!v) return null; return <span key={id} className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1.5 rounded-full">{v.name}<button onClick={() => setSelVenues(p => p.filter(x => x !== id))}><X size={11} /></button></span>; })}</div>
            <select onChange={e => { if (e.target.value && selVenues.length < 5) setSelVenues(p => [...p, e.target.value]); e.target.value = ""; }} className={inp}>
              <option value="">{lang === "th" ? "+ เพิ่มสนามโปรด" : "+ Add favorite venue"}</option>
              {apiVenues.filter(v => !selVenues.includes(v.id)).map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between bg-white border border-border rounded-xl p-4">
            <div><p className="text-sm font-bold">{t.equipment}</p><p className="text-xs text-muted-foreground">{t.equip_desc}</p></div>
            <button onClick={()=>setHasEquip(v=>!v)} className={`w-12 h-6 rounded-full relative transition-colors ${hasEquip?"bg-green-600":"bg-gray-300"}`}><span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${hasEquip?"right-1":"left-1"}`}/></button>
          </div>
          {saveError && <p className="text-red-500 text-xs">{saveError}</p>}
        </div>
      </div>
      <div className="p-4 border-t border-border shrink-0" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
        <button onClick={save} disabled={saving} className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-60">{saving ? "กำลังบันทึก..." : t.save}</button>
      </div>
    </div>
  );
}
