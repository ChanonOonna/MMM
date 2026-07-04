import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { CalendarDays, MapPin, Users, Filter, Search, X, Plus, Camera, Trash2 } from "lucide-react";
import { useLang, T } from "../lang";
import type { View } from "../types";
import { fetchEvents, toEventCard, type EventCardData } from "../events";
import { createEvent, uploadEventImage } from "../admin";
import { fetchSports, fetchVenues, sportEmoji, type ApiSport, type ApiVenue } from "../catalog";
import { PBar, PageHd, SportBadge, MobileUtilityNav, ThaiDateField, ThaiTimeField } from "../components/shared";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "../api";

function EventCard({ ev, onDetail }: { ev: EventCardData; onDetail: (id: string) => void }) {
  return (
    <button onClick={() => onDetail(ev.id)} className="w-full bg-white rounded-2xl border border-border overflow-hidden text-left hover:border-green-300 hover:shadow-lg transition-all active:scale-[0.98] group">
      <div className="relative h-44 bg-gray-200 overflow-hidden">
        <img src={ev.cover} alt={ev.title} style={{ objectPosition: `${ev.coverPos.x}% ${ev.coverPos.y}%` }} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        {ev.past && <div className="absolute top-3 left-3 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-full">จัดไปแล้ว</div>}
        <div className="absolute bottom-3 left-4 right-4"><h3 className="font-black text-white text-lg leading-tight">{ev.title}</h3><p className="text-white/60 text-xs mt-0.5">จัดโดย {ev.organizer}</p></div>
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1"><CalendarDays size={12} />{ev.date}{ev.time ? ` · ${ev.time}` : ""}</span>
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

export function EventsPage({ onDetail, onNav }: { onDetail: (id: string) => void; onNav: (v: View) => void }) {
  const lang = useLang(); const t = T[lang];
  const { user } = useAuth();
  const canCreate = user?.role === "admin" || user?.role === "event_organizer";
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterSport, setFilterSport] = useState("");
  const [filterPast, setFilterPast] = useState<"all"|"upcoming"|"past">("all");

  const [apiSports, setApiSports] = useState<ApiSport[]>([]);
  const [apiVenues, setApiVenues] = useState<ApiVenue[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSportId, setNewSportId] = useState("");
  const [newVenueId, setNewVenueId] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTimeStart, setNewTimeStart] = useState("18:00");
  const [newTimeEnd, setNewTimeEnd] = useState("20:00");
  const [newMaxCapacity, setNewMaxCapacity] = useState("");
  const [newCover, setNewCover] = useState("");
  const [newCoverPos, setNewCoverPos] = useState({ x: 50, y: 50 });
  const [newImages, setNewImages] = useState<string[]>([]);
  const [coverUploading, setCoverUploading] = useState(false);
  const [imagesUploading, setImagesUploading] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");
  const coverDragRef = useRef<{ x: number; y: number; startPos: { x: number; y: number } } | null>(null);

  const refetchEvents = () => {
    setLoading(true);
    fetchEvents()
      .then(list => setEvents(list.map(toEventCard)))
      .catch(() => setError("โหลดกิจกรรมไม่สำเร็จ"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refetchEvents(); }, []);

  useEffect(() => {
    if (!canCreate) return;
    Promise.all([fetchSports(), fetchVenues()]).then(([sp, ve]) => {
      setApiSports(sp); setApiVenues(ve);
    }).catch(() => {});
  }, [canCreate]);

  const openCreateForm = () => {
    setNewTitle(""); setNewDesc(""); setNewDate(""); setNewMaxCapacity("");
    setNewSportId(apiSports[0]?.id ?? ""); setNewVenueId(apiVenues[0]?.id ?? "");
    setNewTimeStart("18:00"); setNewTimeEnd("20:00");
    setNewCover(""); setNewCoverPos({ x: 50, y: 50 }); setNewImages([]);
    setCreateError("");
    setShowCreateForm(true);
  };

  const onCoverPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    coverDragRef.current = { x: e.clientX, y: e.clientY, startPos: newCoverPos };
  };
  const onCoverPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!coverDragRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = ((e.clientX - coverDragRef.current.x) / rect.width) * 100;
    const dy = ((e.clientY - coverDragRef.current.y) / rect.height) * 100;
    const clamp = (n: number) => Math.max(0, Math.min(100, n));
    setNewCoverPos({ x: clamp(coverDragRef.current.startPos.x - dx), y: clamp(coverDragRef.current.startPos.y - dy) });
  };
  const onCoverPointerUp = () => { coverDragRef.current = null; };

  const onNewCoverFileChange = async (file: File | undefined) => {
    if (!file) return;
    setCoverUploading(true);
    setCreateError("");
    try {
      const url = await uploadEventImage(file);
      setNewCover(url);
      setNewCoverPos({ x: 50, y: 50 });
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : (lang === "th" ? "อัปโหลดรูปไม่สำเร็จ" : "Failed to upload photo"));
    } finally {
      setCoverUploading(false);
    }
  };
  const addNewImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setImagesUploading(true);
    setCreateError("");
    try {
      const urls = await Promise.all(Array.from(files).map(f => uploadEventImage(f)));
      setNewImages(prev => [...prev, ...urls]);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : (lang === "th" ? "อัปโหลดรูปไม่สำเร็จ" : "Failed to upload photos"));
    } finally {
      setImagesUploading(false);
    }
  };
  const removeNewImage = (idx: number) => setNewImages(prev => prev.filter((_, i) => i !== idx));

  const handleCreateEvent = async () => {
    if (!newTitle.trim() || !newSportId || !newVenueId || !newDate || !newCover) {
      setCreateError(lang === "th" ? "กรุณากรอกข้อมูลให้ครบและแนบรูปปก" : "Please fill in all required fields and attach a cover photo");
      return;
    }
    setCreateSubmitting(true);
    setCreateError("");
    try {
      await createEvent({
        sportId: newSportId,
        venueId: newVenueId,
        title: newTitle.trim(),
        description: newDesc || undefined,
        startTime: new Date(`${newDate}T${newTimeStart}:00`).toISOString(),
        endTime: new Date(`${newDate}T${newTimeEnd}:00`).toISOString(),
        maxCapacity: newMaxCapacity ? Number(newMaxCapacity) : undefined,
        coverUrl: newCover,
        coverPosX: newCoverPos.x,
        coverPosY: newCoverPos.y,
        images: newImages,
      });
      setShowCreateForm(false);
      refetchEvents();
    } catch (e) {
      setCreateError(e instanceof ApiError ? e.message : (lang === "th" ? "สร้างกิจกรรมไม่สำเร็จ" : "Failed to create event"));
    } finally {
      setCreateSubmitting(false);
    }
  };

  const allEvents = events.filter(e => {
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
        <div className="flex items-center gap-1">
          <MobileUtilityNav onNav={onNav} />
          <button onClick={() => setShowFilter(true)} className={`relative p-2 rounded-xl hover:bg-gray-100 transition-colors ${hasFilter ? "text-green-600" : "text-gray-500"}`}>
            <Filter size={19} />{hasFilter && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full" />}
          </button>
          {canCreate && (
            <button onClick={openCreateForm} className="bg-green-600 text-white px-3.5 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 hover:bg-green-700 transition-colors active:scale-95"><Plus size={15} />{t.create}</button>
          )}
        </div>
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
        {loading && <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>}
        {error && <p className="text-center text-red-500 text-sm py-6">{error}</p>}
        {!loading && !error && (
          <>
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
          </>
        )}
      </div>
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 overflow-y-auto">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-xl my-auto">
            <h3 className="font-bold text-lg mb-4">{lang === "th" ? "สร้างกิจกรรมใหม่" : "Create New Event"}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1.5">{lang === "th" ? "รูปปก" : "Cover photo"} *</label>
                <div
                  className="relative w-full h-36 rounded-xl overflow-hidden border border-border mb-1 bg-gray-100 cursor-grab active:cursor-grabbing select-none touch-none"
                  onPointerDown={onCoverPointerDown} onPointerMove={onCoverPointerMove} onPointerUp={onCoverPointerUp} onPointerLeave={onCoverPointerUp}
                >
                  {coverUploading ? (
                    <div className="w-full h-full flex items-center justify-center"><div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>
                  ) : newCover
                    ? <img src={newCover} draggable={false} style={{ objectPosition: `${newCoverPos.x}% ${newCoverPos.y}%` }} className="w-full h-full object-cover pointer-events-none" alt="" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-400 pointer-events-none"><Camera size={22} /></div>}
                </div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-green-600 cursor-pointer">{newCover ? (lang === "th" ? "เปลี่ยนรูป" : "Change photo") : (lang === "th" ? "แนบรูปปก" : "Attach cover photo")}
                    <input type="file" accept="image/*" className="hidden" disabled={coverUploading} onChange={e => { const f = e.target.files?.[0]; onNewCoverFileChange(f); e.target.value = ""; }} />
                  </label>
                  {newCover && <span className="text-[11px] text-muted-foreground">ลากรูปเพื่อจัดตำแหน่ง</span>}
                </div>
              </div>
              <div><label className="text-sm font-bold text-gray-700 block mb-1.5">{t.sport}</label><select value={newSportId} onChange={e => setNewSportId(e.target.value)} className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500">{apiSports.map(s => <option key={s.id} value={s.id}>{sportEmoji(s.name, s.icon)} {s.name}</option>)}</select></div>
              <div><label className="text-sm font-bold text-gray-700 block mb-1.5">{lang === "th" ? "ชื่อกิจกรรม" : "Event title"}</label><input value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500" /></div>
              <div><label className="text-sm font-bold text-gray-700 block mb-1.5">{lang === "th" ? "รายละเอียด" : "Description"}</label><textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={3} className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500 resize-none" /></div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1.5">{lang === "th" ? "รูปเพิ่มเติม (หลายรูป)" : "Additional photos (multiple)"}</label>
                <div className="grid grid-cols-4 gap-2">
                  {newImages.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                      <img src={img} className="w-full h-full object-cover" alt="" />
                      <button type="button" onClick={() => removeNewImage(i)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={11} /></button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-gray-400 cursor-pointer hover:border-green-400 hover:text-green-500">
                    {imagesUploading ? <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /> : <Plus size={16} />}
                    <span className="text-[10px] font-semibold">{lang === "th" ? "เพิ่มรูป" : "Add photo"}</span>
                    <input type="file" accept="image/*" multiple className="hidden" disabled={imagesUploading} onChange={e => { addNewImages(e.target.files); e.target.value = ""; }} />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-bold text-gray-700 block mb-1.5">{t.date}</label><ThaiDateField value={newDate} onChange={setNewDate} /></div>
                <div><label className="text-sm font-bold text-gray-700 block mb-1.5">{lang === "th" ? "จำนวนสูงสุด" : "Max capacity"}</label><input type="number" min={1} value={newMaxCapacity} onChange={e => setNewMaxCapacity(e.target.value)} className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-bold text-gray-700 block mb-1.5">{t.time_start}</label><ThaiTimeField value={newTimeStart} onChange={setNewTimeStart} /></div>
                <div><label className="text-sm font-bold text-gray-700 block mb-1.5">{t.time_end}</label><ThaiTimeField value={newTimeEnd} onChange={setNewTimeEnd} /></div>
              </div>
              <div><label className="text-sm font-bold text-gray-700 block mb-1.5">{t.venue}</label><select value={newVenueId} onChange={e => setNewVenueId(e.target.value)} className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500">{apiVenues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></div>
              {createError && <p className="text-red-500 text-xs">{createError}</p>}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowCreateForm(false)} disabled={createSubmitting} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50">{t.cancel}</button>
              <button onClick={handleCreateEvent} disabled={createSubmitting || coverUploading || imagesUploading} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-50">{createSubmitting ? (lang === "th" ? "กำลังสร้าง..." : "Creating...") : t.create}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
