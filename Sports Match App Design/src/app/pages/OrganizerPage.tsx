import React, { useEffect, useState } from "react";
import { QrCode, Users, Megaphone, Send, CheckCircle, UserCheck, Plus, Trash2, Edit3, CalendarDays, MapPin, Briefcase, ChevronLeft, ChevronRight, RefreshCw, Camera, X } from "lucide-react";
import { useLang, T } from "../lang";
import { SPORTS } from "../data";
import { QRSvg, SportBadge, ThaiDateField, ThaiTimeField } from "../components/shared";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "../api";
import { fetchEvents, getEvent, joinEvent, deleteEvent, toEventCard, fetchAnnouncements, sendAnnouncement, relativeTime, type ApiEvent, type ApiAnnouncement } from "../events";
import { createEvent, updateEvent, uploadEventImage } from "../admin";
import { fetchSports, fetchVenues, sportEmoji, type ApiSport, type ApiVenue } from "../catalog";

type DetailTab = "info" | "scan" | "members" | "announce";
type ListScope = "mine" | "all";

export function OrganizerPage({ onBack, initialEventId }: { onBack: () => void; initialEventId?: string }) {
  const lang = useLang(); const t = T[lang];
  const { user } = useAuth();
  const [openEventId, setOpenEventId] = useState<string | null>(initialEventId ?? null);
  const [detailTab, setDetailTab] = useState<DetailTab>("info");
  const [listScope, setListScope] = useState<ListScope>("mine");
  const [scanMode, setScanMode] = useState(false);
  const [scanned, setScanned] = useState<string[]>([]);

  const [allEvents, setAllEvents] = useState<ApiEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");
  const [openEventDetail, setOpenEventDetail] = useState<ApiEvent | null>(null);
  const [openEventLoading, setOpenEventLoading] = useState(false);
  const [openEventError, setOpenEventError] = useState("");
  const [joined, setJoined] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [announcements, setAnnouncements] = useState<ApiAnnouncement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [announce, setAnnounce] = useState("");
  const [announceError, setAnnounceError] = useState("");
  const [announceSending, setAnnounceSending] = useState(false);

  const [apiSports, setApiSports] = useState<ApiSport[]>([]);
  const [apiVenues, setApiVenues] = useState<ApiVenue[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const coverDragRef = React.useRef<{ x: number; y: number; startPos: { x: number; y: number } } | null>(null);

  useEffect(() => {
    if (initialEventId) { setOpenEventId(initialEventId); setDetailTab("info"); refetchOpenEvent(initialEventId); }
  }, [initialEventId]);

  useEffect(() => {
    if (openEventDetail && !canManageOpen && detailTab !== "info") setDetailTab("info");
  }, [openEventDetail, canManageOpen, detailTab]);

  const simulateScan = () => {
    const names = ["สมชาย ใจดี","นลินี ดีใจ","ธนกร วิชาการ","พิมพ์ใจ เก่งกีฬา"];
    const name = names[scanned.length % names.length];
    if (!scanned.includes(name)) setScanned(p => [...p, name]);
  };

  const loadEvents = () => {
    if (!user) return;
    setEventsLoading(true);
    fetchEvents()
      .then(setAllEvents)
      .catch(() => setEventsError(lang === "th" ? "โหลดกิจกรรมไม่สำเร็จ" : "Failed to load events"))
      .finally(() => setEventsLoading(false));
  };

  useEffect(() => { loadEvents(); }, [user]);

  const visibleEvents = listScope === "mine" ? allEvents.filter(ev => ev.organizerId === user?.id) : allEvents;

  useEffect(() => {
    Promise.all([fetchSports(), fetchVenues()]).then(([sp, ve]) => {
      setApiSports(sp); setApiVenues(ve);
      if (sp[0]) setNewSportId(sp[0].id);
      if (ve[0]) setNewVenueId(ve[0].id);
    }).catch(() => {});
  }, []);

  const refetchOpenEvent = (id: string) => {
    setOpenEventLoading(true);
    setOpenEventError("");
    getEvent(id)
      .then(srv => {
        setOpenEventDetail(srv);
        setJoined(!!user && (srv.members ?? []).some(m => m.userId === user.id));
      })
      .catch(() => setOpenEventError(lang === "th" ? "โหลดข้อมูลกิจกรรมไม่สำเร็จ" : "Failed to load event"))
      .finally(() => setOpenEventLoading(false));
  };
  const openEvent = (id: string) => { setOpenEventId(id); setDetailTab("info"); setLightboxIdx(null); refetchOpenEvent(id); };
  const closeEvent = () => { setOpenEventId(null); setOpenEventDetail(null); };

  const handleJoinToggle = async () => {
    if (!openEventDetail) return;
    if (joined) { setJoined(false); return; }
    setJoinError("");
    try {
      await joinEvent(openEventDetail.id);
      setJoined(true);
      refetchOpenEvent(openEventDetail.id);
      loadEvents();
    } catch (e) {
      if (e instanceof ApiError && e.status === 400) { setJoined(true); return; }
      setJoinError(e instanceof Error ? e.message : (lang === "th" ? "เข้าร่วมกิจกรรมไม่สำเร็จ" : "Failed to join event"));
    }
  };

  const openCreateForm = () => {
    setEditingEventId(null);
    setNewTitle(""); setNewDesc(""); setNewDate(""); setNewMaxCapacity("");
    setNewSportId(apiSports[0]?.id ?? ""); setNewVenueId(apiVenues[0]?.id ?? "");
    setNewTimeStart("18:00"); setNewTimeEnd("20:00");
    setNewCover(""); setNewCoverPos({ x: 50, y: 50 }); setNewImages([]);
    setCreateError("");
    setShowCreateForm(true);
  };

  const onCoverPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    coverDragRef.current = { x: e.clientX, y: e.clientY, startPos: newCoverPos };
  };
  const onCoverPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
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

  const isoToLocalDateStr = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const isoToLocalTimeStr = (iso: string) => new Date(iso).toTimeString().slice(0, 5);

  const openEditForm = (ev: ApiEvent) => {
    setEditingEventId(ev.id);
    setNewTitle(ev.title);
    setNewDesc(ev.description ?? "");
    setNewSportId(ev.sportId);
    setNewVenueId(ev.venueId);
    setNewDate(isoToLocalDateStr(ev.startTime));
    setNewTimeStart(isoToLocalTimeStr(ev.startTime));
    setNewTimeEnd(isoToLocalTimeStr(ev.endTime));
    setNewMaxCapacity(ev.maxCapacity ? String(ev.maxCapacity) : "");
    setNewCover(ev.coverUrl ?? "");
    setNewCoverPos({ x: ev.coverPosX ?? 50, y: ev.coverPosY ?? 50 });
    setNewImages(ev.images ?? []);
    setCreateError("");
    setShowCreateForm(true);
  };

  const handleCreateEvent = async () => {
    if (!newTitle.trim() || !newSportId || !newVenueId || !newDate || !newCover) {
      setCreateError(lang === "th" ? "กรุณากรอกข้อมูลให้ครบและแนบรูปปก" : "Please fill in all required fields and attach a cover photo");
      return;
    }
    setCreateSubmitting(true);
    setCreateError("");
    try {
      const payload = {
        title: newTitle.trim(),
        description: newDesc || undefined,
        startTime: new Date(`${newDate}T${newTimeStart}:00`).toISOString(),
        endTime: new Date(`${newDate}T${newTimeEnd}:00`).toISOString(),
        maxCapacity: newMaxCapacity ? Number(newMaxCapacity) : undefined,
        coverUrl: newCover,
        coverPosX: newCoverPos.x,
        coverPosY: newCoverPos.y,
        images: newImages,
      };
      if (editingEventId) {
        await updateEvent(editingEventId, payload);
        if (openEventId === editingEventId) refetchOpenEvent(editingEventId);
      } else {
        await createEvent({ sportId: newSportId, venueId: newVenueId, ...payload });
      }
      loadEvents();
      setShowCreateForm(false);
      setEditingEventId(null);
    } catch (e) {
      setCreateError(e instanceof ApiError ? e.message : (editingEventId ? (lang === "th" ? "แก้ไขกิจกรรมไม่สำเร็จ" : "Failed to update event") : (lang === "th" ? "สร้างกิจกรรมไม่สำเร็จ" : "Failed to create event")));
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    setEventsError("");
    try {
      await deleteEvent(id);
      loadEvents();
      if (openEventId === id) closeEvent();
    } catch (e) {
      setEventsError(e instanceof ApiError ? e.message : (lang === "th" ? "ลบกิจกรรมไม่สำเร็จ" : "Failed to delete event"));
    }
  };

  useEffect(() => {
    if (!openEventId) { setAnnouncements([]); return; }
    setAnnouncementsLoading(true);
    fetchAnnouncements(openEventId)
      .then(setAnnouncements)
      .catch(() => setAnnounceError(lang === "th" ? "โหลดประกาศไม่สำเร็จ" : "Failed to load announcements"))
      .finally(() => setAnnouncementsLoading(false));
  }, [openEventId]);

  const handleSendAnnouncement = async () => {
    if (!announce.trim() || !openEventId) return;
    setAnnounceSending(true);
    setAnnounceError("");
    try {
      const created = await sendAnnouncement(openEventId, announce.trim());
      setAnnouncements(p => [created, ...p]);
      setAnnounce("");
    } catch (e) {
      setAnnounceError(e instanceof ApiError ? e.message : (lang === "th" ? "ส่งประกาศไม่สำเร็จ" : "Failed to send announcement"));
    } finally {
      setAnnounceSending(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadEvents();
    if (openEventId) refetchOpenEvent(openEventId);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const openEventCard = openEventDetail ? toEventCard(openEventDetail) : null;
  const canManageOpen = !!user && !!openEventDetail && (user.role === "admin" || openEventDetail.organizerId === user.id);

  const DETAIL_TABS: { id: DetailTab; label: string; icon: React.ReactNode }[] = [
    { id: "info", label: lang === "th" ? "รายละเอียด" : "Details", icon: <CalendarDays size={15} /> },
    ...(canManageOpen ? [
      { id: "scan" as const, label: t.qr_scan, icon: <QrCode size={15} /> },
      { id: "members" as const, label: t.members, icon: <Users size={15} /> },
      { id: "announce" as const, label: t.announce, icon: <Megaphone size={15} /> },
    ] : []),
  ];

  return (
    <div className="flex h-full overflow-hidden">
      <aside className="hidden lg:flex flex-col w-52 shrink-0 bg-gray-950 text-white">
        <div className="p-4 border-b border-white/10 flex items-center gap-2.5"><Briefcase size={20} className="text-green-400" /><span className="font-black text-sm">{t.organizer_panel}</span></div>
        <nav className="flex-1 py-3 overflow-y-auto">
          <button onClick={() => { setListScope("mine"); closeEvent(); }} className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold transition-colors ${!openEventId && listScope === "mine" ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80 hover:bg-white/5"}`}>
            <CalendarDays size={16} />{lang === "th" ? "กิจกรรมของฉัน" : "My Events"}
          </button>
          <button onClick={() => { setListScope("all"); closeEvent(); }} className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold transition-colors ${!openEventId && listScope === "all" ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80 hover:bg-white/5"}`}>
            <Briefcase size={16} />{lang === "th" ? "กิจกรรมทั้งหมด" : "All Events"}
          </button>
        </nav>
        <button onClick={onBack} className="p-4 border-t border-white/10 flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors"><ChevronLeft size={17} />{t.back_app}</button>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="lg:hidden overflow-x-auto border-b border-border shrink-0 bg-white">
          <div className="flex min-w-max items-center">
            <button onClick={openEventId ? closeEvent : onBack} className="flex items-center px-3 py-3 text-gray-500"><ChevronLeft size={18} /></button>
            {openEventId ? (
              DETAIL_TABS.map(tb => (
                <button key={tb.id} onClick={() => setDetailTab(tb.id)} className={`flex items-center gap-1.5 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${detailTab === tb.id ? "border-green-600 text-green-700" : "border-transparent text-muted-foreground"}`}>
                  {tb.icon}{tb.label}
                </button>
              ))
            ) : (
              <span className="px-2 py-3 text-sm font-bold text-gray-800">{listScope === "mine" ? (lang === "th" ? "กิจกรรมของฉัน" : "My Events") : (lang === "th" ? "กิจกรรมทั้งหมด" : "All Events")}</span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between px-5 h-14 border-b border-border bg-white shrink-0">
          <div className="min-w-0">
            <h2 className="font-black text-gray-900 truncate">{openEventId ? (openEventCard?.title ?? "...") : (listScope === "mine" ? (lang === "th" ? "กิจกรรมของฉัน" : "My Events") : (lang === "th" ? "กิจกรรมทั้งหมด" : "All Events"))}</h2>
            <p className="text-[11px] text-muted-foreground">{openEventId ? (canManageOpen ? (lang === "th" ? "จัดการกิจกรรมนี้" : "Manage this event") : (lang === "th" ? "ดูรายละเอียดกิจกรรม" : "View event details")) : (listScope === "mine" ? (lang === "th" ? "จัดการกิจกรรมของคุณ" : "Manage your events") : (lang === "th" ? "กิจกรรมทั้งหมดในระบบ" : "All events in the system"))}</p>
          </div>
          <button onClick={handleRefresh} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors shrink-0"><RefreshCw size={17} className={isRefreshing ? "animate-spin" : ""} /></button>
        </div>
        {openEventId && (
          <div className="hidden lg:flex border-b border-border shrink-0 bg-white px-2">
            {DETAIL_TABS.map(tb => (
              <button key={tb.id} onClick={() => setDetailTab(tb.id)} className={`flex items-center gap-1.5 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${detailTab === tb.id ? "border-green-600 text-green-700" : "border-transparent text-muted-foreground"}`}>
                {tb.icon}{tb.label}
              </button>
            ))}
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {!openEventId && (
            <div className="p-4 space-y-3">
              {listScope === "mine" && <button onClick={openCreateForm} className="w-full bg-green-600 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-green-700"><Plus size={15} />{lang === "th" ? "สร้างกิจกรรมใหม่" : "Create New Event"}</button>}
              {eventsError && <p className="text-red-500 text-xs">{eventsError}</p>}
              {eventsLoading && <div className="flex justify-center py-10"><div className="w-7 h-7 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>}
              {!eventsLoading && visibleEvents.length === 0 && <p className="text-center text-sm text-muted-foreground py-10">{listScope === "mine" ? (lang === "th" ? "คุณยังไม่มีกิจกรรมที่จัด" : "You don't have any events yet") : (lang === "th" ? "ยังไม่มีกิจกรรมในระบบ" : "No events yet")}</p>}
              {!eventsLoading && visibleEvents.map(ev => {
                const card = toEventCard(ev);
                const canManageRow = !!user && (user.role === "admin" || ev.organizerId === user.id);
                return (
                  <button key={ev.id} onClick={() => openEvent(ev.id)} className="w-full text-left bg-white rounded-2xl border border-border p-4 flex gap-3 items-start hover:border-green-300 hover:shadow-sm transition-all">
                    <img src={card.cover} style={{ objectPosition: `${card.coverPos.x}% ${card.coverPos.y}%` }} className="w-20 h-16 rounded-xl object-cover shrink-0" alt="" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-gray-900 truncate">{card.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5"><CalendarDays size={11} className="inline mr-1" />{card.date}{card.time ? ` · ${card.time}` : ""}</p>
                      <p className="text-xs text-muted-foreground">{card.venue} · {card.participants}/{card.max} {lang === "th" ? "คน" : "people"}</p>
                      {listScope === "all" && <p className="text-xs text-muted-foreground">{lang === "th" ? "จัดโดย" : "By"} {card.organizer}</p>}
                    </div>
                    {canManageRow && (
                      <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                        <button onClick={() => openEditForm(ev)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl" title={lang === "th" ? "แก้ไขกิจกรรม" : "Edit event"}><Edit3 size={16} /></button>
                        <button onClick={() => handleDeleteEvent(ev.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl" title={lang === "th" ? "ลบกิจกรรม" : "Delete event"}><Trash2 size={16} /></button>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          {openEventId && openEventLoading && !openEventCard && (
            <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>
          )}
          {openEventId && openEventError && !openEventCard && (
            <div className="flex flex-col items-center justify-center py-16 gap-2"><p className="text-sm text-muted-foreground">{openEventError}</p><button onClick={() => refetchOpenEvent(openEventId)} className="text-sm font-bold text-green-600">{lang === "th" ? "ลองอีกครั้ง" : "Retry"}</button></div>
          )}
          {openEventId && openEventDetail && openEventCard && detailTab === "info" && (
            <div className="max-w-2xl">
              <div className="relative h-48 bg-gray-200">
                <img src={openEventCard.cover} style={{ objectPosition: `${openEventCard.coverPos.x}% ${openEventCard.coverPos.y}%` }} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
                {canManageOpen && (
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => openEditForm(openEventDetail)} className="bg-black/30 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/50" title={lang === "th" ? "แก้ไขกิจกรรม" : "Edit event"}><Edit3 size={19} /></button>
                    <button onClick={() => handleDeleteEvent(openEventId)} className="bg-black/30 backdrop-blur-sm text-white p-2 rounded-full hover:bg-red-600/80" title={lang === "th" ? "ลบกิจกรรม" : "Delete event"}><Trash2 size={19} /></button>
                  </div>
                )}
                <div className="absolute bottom-4 left-5 right-5"><h1 className="text-xl font-black text-white leading-tight">{openEventCard.title}</h1><p className="text-white/60 text-sm mt-0.5">{lang === "th" ? "จัดโดย" : "By"} {openEventCard.organizer}</p></div>
              </div>
              <div className="p-4 space-y-3">
                <div className="bg-white rounded-2xl border border-border divide-y divide-border overflow-hidden">
                  {([[<CalendarDays size={17} className="text-green-600" />, openEventCard.time ? `${openEventCard.date} · ${openEventCard.time}` : openEventCard.date],[<MapPin size={17} className="text-green-600" />, openEventCard.venue],[<Users size={17} className="text-green-600" />, `${openEventCard.participants.toLocaleString()} / ${openEventCard.max.toLocaleString()} ${lang === "th" ? "คน" : "people"}`]] as [React.ReactNode,string][]).map(([icon,text],i)=>(
                    <div key={i} className="flex items-center gap-3 px-4 py-3.5 text-sm"><span className="shrink-0">{icon}</span><span className="font-medium text-gray-800">{text}</span></div>
                  ))}
                </div>
                {openEventCard.sports.length > 0 && (
                  <div className="bg-white rounded-2xl border border-border p-4">
                    <p className="text-sm font-bold mb-2">{lang === "th" ? "กีฬาในงาน" : "Sports"}</p>
                    <div className="flex flex-wrap gap-2">{openEventCard.sports.map(s=>{const sp=SPORTS.find(x=>x.name===s);return sp?<SportBadge key={s} emoji={sp.emoji} name={s}/>:<SportBadge key={s} emoji="🏅" name={s}/>;})}</div>
                  </div>
                )}
                {openEventCard.desc && (
                  <div className="bg-white rounded-2xl border border-border p-4">
                    <p className="text-sm font-bold mb-2">{lang === "th" ? "รายละเอียด" : "Description"}</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{openEventCard.desc}</p>
                  </div>
                )}
                {openEventCard.images.length > 0 && (
                  <div className="bg-white rounded-2xl border border-border p-4">
                    <p className="text-sm font-bold mb-2">{lang === "th" ? "รายละเอียดเพิ่มเติม" : "Additional photos"}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {openEventCard.images.map((img, i) => (
                        <button key={i} type="button" onClick={() => setLightboxIdx(i)} className="aspect-square rounded-xl overflow-hidden border border-border cursor-zoom-in">
                          <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {eventsError && <p className="text-red-500 text-xs">{eventsError}</p>}
                {joinError && <p className="text-red-500 text-xs">{joinError}</p>}
                <button onClick={handleJoinToggle} className={`w-full py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] ${joined?"bg-gray-100 text-gray-600 hover:bg-gray-200":"bg-green-600 text-white hover:bg-green-700"}`}>{joined?(lang === "th" ? "ยกเลิกการเข้าร่วม" : "Cancel participation"):(lang === "th" ? "สมัครเข้าร่วม Event" : "Join Event")}</button>
              </div>
            </div>
          )}
          {openEventId && openEventCard && detailTab === "scan" && (
            <div className="p-4 space-y-4 max-w-2xl">
              <div className="bg-white rounded-2xl border border-border p-5 text-center">
                {scanMode ? (
                  <>
                    <div className="bg-gray-100 rounded-xl w-full aspect-square max-w-[240px] mx-auto mb-4 flex items-center justify-center overflow-hidden relative">
                      <QRSvg value="SCANNER_MODE" size={180} />
                      <div className="absolute inset-0 border-4 border-green-500 rounded-xl animate-pulse" />
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-green-400/70 animate-scan" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{lang === "th" ? "กำลังรอสแกน QR..." : "Waiting for QR scan..."}</p>
                    <div className="flex gap-2">
                      <button onClick={simulateScan} className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-green-700">{lang === "th" ? "จำลองการสแกน" : "Simulate Scan"}</button>
                      <button onClick={() => setScanMode(false)} className="px-4 py-2.5 border border-border rounded-xl text-sm font-bold hover:bg-gray-50">{lang === "th" ? "หยุด" : "Stop"}</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><QrCode size={32} className="text-green-600" /></div>
                    <h3 className="font-black text-lg mb-1">{t.qr_scan}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{lang === "th" ? "สแกน QR Code ผู้เข้าร่วมเพื่อ Check-in" : "Scan participant QR codes for check-in"}</p>
                    <button onClick={() => setScanMode(true)} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700">{lang === "th" ? "เปิดกล้องสแกน" : "Open Camera Scanner"}</button>
                  </>
                )}
              </div>
              {scanned.length > 0 && (
                <div className="bg-white rounded-2xl border border-border overflow-hidden">
                  <div className="px-4 py-2.5 bg-green-50 border-b border-border flex items-center gap-2"><CheckCircle size={14} className="text-green-600" /><p className="text-xs font-black text-green-700">{lang === "th" ? "Check-in สำเร็จ" : "Checked In"} ({scanned.length})</p></div>
                  {scanned.map((name, i) => <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0"><div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"><UserCheck size={14} className="text-green-600" /></div><p className="text-sm font-semibold">{name}</p><CheckCircle size={14} className="text-green-600 ml-auto" /></div>)}
                </div>
              )}
            </div>
          )}
          {openEventId && openEventCard && detailTab === "members" && (
            <div className="p-4 space-y-3 max-w-2xl">
              <div className="grid grid-cols-3 gap-3">
                {[["47", lang === "th" ? "ผู้สมัคร" : "Applied"], ["32", lang === "th" ? "ยืนยัน" : "Confirmed"], ["15", lang === "th" ? "Check-in" : "Checked-In"]].map(([n, l]) => <div key={l} className="bg-white rounded-xl border border-border p-3 text-center"><div className="text-2xl font-black text-green-700">{n}</div><div className="text-xs text-muted-foreground">{l}</div></div>)}
              </div>
              {Array.from({ length: 6 }, (_, i) => ({ id: `m${i}`, name: ["สมชาย ใจดี", "นลินี ดีใจ", "ธนกร วิชาการ", "พิมพ์ใจ เก่งกีฬา", "อรทัย มั่นคง", "วีรชัย กีฬาเด่น"][i], checked: i < 3 })).map(m => (
                <div key={m.id} className="bg-white rounded-xl border border-border p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center font-bold text-sm">{m.name[0]}</div>
                  <div className="flex-1"><p className="text-sm font-semibold">{m.name}</p><p className="text-xs text-muted-foreground">{m.checked ? (lang === "th" ? "Check-in แล้ว" : "Checked in") : (lang === "th" ? "ยังไม่ Check-in" : "Not checked in")}</p></div>
                  {m.checked && <CheckCircle size={16} className="text-green-600" />}
                </div>
              ))}
            </div>
          )}
          {openEventId && openEventCard && detailTab === "announce" && (
            <div className="p-4 space-y-3 max-w-2xl">
              {announceError && <p className="text-red-500 text-xs">{announceError}</p>}
              <div className="bg-white rounded-2xl border border-border p-4">
                <p className="text-sm font-bold mb-2">{lang === "th" ? "ส่งประกาศใหม่" : "New Announcement"}</p>
                <textarea value={announce} onChange={e => setAnnounce(e.target.value)} rows={3} placeholder={lang === "th" ? "พิมพ์ข้อความประกาศ..." : "Type your announcement..."} className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500 resize-none" />
                <button onClick={handleSendAnnouncement} disabled={!announce.trim() || announceSending} className="mt-2 w-full bg-green-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 disabled:opacity-40 flex items-center justify-center gap-2"><Send size={14} />{announceSending ? (lang === "th" ? "กำลังส่ง..." : "Sending...") : (lang === "th" ? "ส่งประกาศ" : "Send Announcement")}</button>
              </div>
              {announcementsLoading && <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>}
              {!announcementsLoading && announcements.map(a => (
                <div key={a.id} className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-2.5">
                  <Megaphone size={16} className="text-amber-600 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-amber-800 whitespace-pre-wrap">{a.message}</p>
                    <p className="text-xs text-amber-600 mt-1.5">{a.author.firstName} {a.author.lastName} · {relativeTime(a.createdAt, lang)}</p>
                  </div>
                </div>
              ))}
              {!announcementsLoading && announcements.length === 0 && <p className="text-center text-sm text-muted-foreground py-6">{lang === "th" ? "ยังไม่มีประกาศ" : "No announcements yet"}</p>}
            </div>
          )}
        </div>
      </div>
      {lightboxIdx !== null && openEventCard && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightboxIdx(null)}>
          <button onClick={() => setLightboxIdx(null)} className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10"><X size={24} /></button>
          {openEventCard.images.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i! - 1 + openEventCard.images.length) % openEventCard.images.length); }} className="absolute left-2 sm:left-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10"><ChevronLeft size={28} /></button>
              <button onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i! + 1) % openEventCard.images.length); }} className="absolute right-2 sm:right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10"><ChevronRight size={28} /></button>
            </>
          )}
          <img src={openEventCard.images[lightboxIdx]} alt="" onClick={e => e.stopPropagation()} className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg" />
          {openEventCard.images.length > 1 && <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/70 text-xs font-bold">{lightboxIdx + 1} / {openEventCard.images.length}</div>}
        </div>
      )}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 overflow-y-auto">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-xl my-auto">
            <h3 className="font-bold text-lg mb-4">{editingEventId ? (lang === "th" ? "แก้ไขกิจกรรม" : "Edit Event") : (lang === "th" ? "สร้างกิจกรรมใหม่" : "Create New Event")}</h3>
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
                  {newCover && <span className="text-[11px] text-muted-foreground">{lang === "th" ? "ลากรูปเพื่อจัดตำแหน่ง" : "Drag to reposition"}</span>}
                </div>
              </div>
              <div><label className="text-sm font-bold text-gray-700 block mb-1.5">{t.sport}</label><select value={newSportId} onChange={e => setNewSportId(e.target.value)} disabled={!!editingEventId} className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500 disabled:opacity-60">{apiSports.map(s => <option key={s.id} value={s.id}>{sportEmoji(s.name, s.icon)} {s.name}</option>)}</select></div>
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
              <div><label className="text-sm font-bold text-gray-700 block mb-1.5">{t.venue}</label><select value={newVenueId} onChange={e => setNewVenueId(e.target.value)} disabled={!!editingEventId} className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500 disabled:opacity-60">{apiVenues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></div>
              {createError && <p className="text-red-500 text-xs">{createError}</p>}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => { setShowCreateForm(false); setEditingEventId(null); }} disabled={createSubmitting} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50">{t.cancel}</button>
              <button onClick={handleCreateEvent} disabled={createSubmitting || coverUploading || imagesUploading} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-50">{createSubmitting ? (lang === "th" ? "กำลังบันทึก..." : "Saving...") : editingEventId ? t.save : t.create}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
