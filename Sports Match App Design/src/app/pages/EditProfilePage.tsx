import { useState, useRef } from "react";
import { Camera, Plus, Check, CheckCircle, X } from "lucide-react";
import { useLang, T } from "../lang";
import { SELF_PHOTO, SPORTS, LEVELS, DAYS } from "../data";
import { PageHd } from "../components/shared";

export function EditProfilePage({ onBack }: { onBack: () => void }) {
  const lang = useLang(); const t = T[lang];
  const inp = "w-full bg-white border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all";
  const [fullName, setFullName] = useState("สมชาย ใจดี");
  const [nick, setNick] = useState("สมชาย");
  const [selSports, setSelSports] = useState(["badminton"]);
  const [selDays, setSelDays] = useState(["จ","อ","พ"]);
  const [hasEquip, setHasEquip] = useState(true);
  const [selVenues, setSelVenues] = useState(["สนามแบดมินตัน","สนามฟุตบอล"]);
  const [saved, setSaved] = useState(false);
  const [selLevel, setSelLevel] = useState(LEVELS[0].name);
  const [avStart, setAvStart] = useState("17:00");
  const [avEnd, setAvEnd] = useState("20:00");
  const photoRef = useRef<HTMLInputElement>(null);
  const tSport = (id: string) => setSelSports(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const tDay = (d: string) => setSelDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d]);
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHd title={t.edit_profile} onBack={onBack} />
      {saved && <div className="mx-4 mt-2 bg-green-50 border border-green-200 text-green-700 text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2"><CheckCircle size={16} />{t.save_success}</div>}
      <input ref={photoRef} type="file" accept="image/*" className="hidden" />
      <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full">
        <div className="mb-6">
          <p className="text-sm font-bold text-gray-700 mb-2">{t.profile_photos} <span className="text-xs text-muted-foreground font-normal">{t.photo_hint}</span></p>
          <div className="flex gap-2 flex-wrap">
            <div className="relative w-20 h-20 shrink-0"><img src={SELF_PHOTO} className="w-20 h-20 rounded-xl object-cover" alt="" /><button onClick={() => photoRef.current?.click()} className="absolute bottom-0 right-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white shadow"><Camera size={11} /></button><span className="absolute -top-1.5 -left-1.5 bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{t.main_photo}</span></div>
            {[0,1,2,3].map(i=><button key={i} onClick={() => photoRef.current?.click()} className="w-20 h-20 shrink-0 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors"><Plus size={18} className="text-gray-400" /><span className="text-[10px] text-gray-400 mt-0.5">{t.add_photo}</span></button>)}
          </div>
        </div>
        <div className="space-y-4">
          <div><label className="text-sm font-bold text-gray-700 block mb-1.5">{lang==="th"?"ชื่อ-นามสกุล":"Full Name"}</label><input value={fullName} onChange={e => setFullName(e.target.value)} className={inp} /></div>
          <div><label className="text-sm font-bold text-gray-700 block mb-1.5">{t.ph_nickname}</label><input value={nick} onChange={e => setNick(e.target.value)} className={inp} /></div>
          <div><label className="text-sm font-bold text-gray-700 block mb-1.5">Email</label><input value="65010001@ku.th" readOnly className={`${inp} text-muted-foreground cursor-not-allowed`} /></div>
          <div><label className="text-sm font-bold text-gray-700 block mb-1.5">{t.skill_level}</label><select value={selLevel} onChange={e => setSelLevel(e.target.value)} className={inp}>{LEVELS.map(l => <option key={l.id}>{l.name}</option>)}</select></div>
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">{t.sports_played}</label>
            <div className="grid grid-cols-3 gap-2">
              {SPORTS.slice(0,9).map(s=>{const on=selSports.includes(s.id);return(<button key={s.id} onClick={()=>tSport(s.id)} className={`relative p-2.5 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${on?"border-green-600 bg-green-50":"border-border bg-white hover:border-green-300"}`}>{on&&<div className="absolute top-1.5 right-1.5 w-4 h-4 bg-green-600 rounded-full flex items-center justify-center"><Check size={9} className="text-white"/></div>}<span className="text-2xl">{s.emoji}</span><span className="text-[10px] font-semibold text-center leading-tight">{s.name}</span></button>);})}
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">{t.available_days}</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(d=><button key={d} onClick={()=>tDay(d)} className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all ${selDays.includes(d)?"bg-green-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{d}</button>)}
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">{t.avail_time}</label>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground block mb-1">{t.start}</label><select value={avStart} onChange={e => setAvStart(e.target.value)} className={inp}>{"06:00,07:00,15:00,16:00,17:00,18:00".split(",").map(ts=><option key={ts}>{ts}</option>)}</select></div>
              <div><label className="text-xs text-muted-foreground block mb-1">{t.end}</label><select value={avEnd} onChange={e => setAvEnd(e.target.value)} className={inp}>{"18:00,19:00,20:00,21:00,22:00".split(",").map(ts=><option key={ts}>{ts}</option>)}</select></div>
            </div>
          </div>
          <div><label className="text-sm font-bold text-gray-700 block mb-1.5">{t.favorites}</label><div className="flex flex-wrap gap-2">{selVenues.map(v => <span key={v} className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1.5 rounded-full">{v}<button onClick={() => setSelVenues(p => p.filter(x => x !== v))}><X size={11} /></button></span>)}</div></div>
          <div className="flex items-center justify-between bg-white border border-border rounded-xl p-4">
            <div><p className="text-sm font-bold">{t.equipment}</p><p className="text-xs text-muted-foreground">{t.equip_desc}</p></div>
            <button onClick={()=>setHasEquip(v=>!v)} className={`w-12 h-6 rounded-full relative transition-colors ${hasEquip?"bg-green-600":"bg-gray-300"}`}><span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${hasEquip?"right-1":"left-1"}`}/></button>
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-border shrink-0" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
        <button onClick={() => { setSaved(true); setTimeout(() => { setSaved(false); onBack(); }, 900); }} className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98]">{t.save}</button>
      </div>
    </div>
  );
}
