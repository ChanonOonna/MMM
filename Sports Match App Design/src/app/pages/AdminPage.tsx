import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Shield, BarChart2, AlertTriangle, CalendarDays, Clock, Star, MapPin, Trophy, Users, Zap, Heart, Activity, TrendingUp, Plus, Edit3, Trash2, Check, ChevronLeft, Camera, ThumbsUp, ThumbsDown, Search, UserX, RefreshCw, SlidersHorizontal, RotateCcw, DoorOpen } from "lucide-react";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, PieChart, Pie, Cell } from "recharts";
import { T } from "../lang";
import type { AdminTab } from "../types";
import { REPORTS_DATA, SPORTS, ACHIEVEMENTS, DAU_DATA, VENUE_HEAT } from "../data";
import { Av, ThaiDateField } from "../components/shared";
import { VenuePinPicker } from "../components/VenuePinPicker";
import { fetchSports, fetchVenues, type ApiSport, type ApiVenue } from "../catalog";
import {
  createSport, updateSport, deleteSport,
  getEvent, createEvent as apiCreateEvent, updateEvent as apiUpdateEvent, deleteEvent as apiDeleteEvent, uploadEventImage,
  createVenue, updateVenue, deleteVenue, uploadVenueImage,
  fetchAdminUsers, setUserRole, resetNoShow, deleteAdminUser, type ApiAdminUser,
  fetchAdminSessions, deleteAdminSession, type ApiAdminSession,
} from "../admin";
import { fetchEvents, toEventCard, type EventCardData } from "../events";
import { ApiError, useAuth } from "../auth/AuthContext";

export function AdminPage({ onBack, onOrganize }: { onBack: () => void; onOrganize?: (eventId: string) => void }) {
  const t = T["th"];
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [reports, setReports] = useState(REPORTS_DATA);
  const [reportFilter, setReportFilter] = useState("ทั้งหมด");
  const [adminSports, setAdminSports] = useState<ApiSport[]>([]);
  const [sportsLoading, setSportsLoading] = useState(true);
  const [sportsError, setSportsError] = useState("");
  const [adminVenues, setAdminVenues] = useState<ApiVenue[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(true);
  const [venuesError, setVenuesError] = useState("");
  const [adminAchievements, setAdminAchievements] = useState(ACHIEVEMENTS);
  const [adminUsers, setAdminUsers] = useState<ApiAdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [adminEvents, setAdminEvents] = useState<EventCardData[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");
  const [adminRooms, setAdminRooms] = useState<ApiAdminSession[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomsError, setRoomsError] = useState("");
  const [roomSearch, setRoomSearch] = useState("");
  const { user: currentUser } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSportModal, setShowSportModal] = useState(false);
  const [newSportName, setNewSportName] = useState("");
  const [newSportIcon, setNewSportIcon] = useState("🏅");
  const [editingSport, setEditingSport] = useState<string | null>(null);
  const [editSportName, setEditSportName] = useState("");
  const [editSportIcon, setEditSportIcon] = useState("");

  const loadEvents = () => {
    setEventsLoading(true);
    fetchEvents()
      .then(list => setAdminEvents(list.map(toEventCard)))
      .catch(() => setEventsError("โหลดกิจกรรมไม่สำเร็จ"))
      .finally(() => setEventsLoading(false));
  };
  const loadVenues = () => {
    setVenuesLoading(true);
    fetchVenues()
      .then(setAdminVenues)
      .catch(() => setVenuesError("โหลดสนามไม่สำเร็จ"))
      .finally(() => setVenuesLoading(false));
  };
  const loadUsers = () => {
    setUsersLoading(true);
    fetchAdminUsers()
      .then(setAdminUsers)
      .catch(() => setUsersError("โหลดผู้ใช้ไม่สำเร็จ"))
      .finally(() => setUsersLoading(false));
  };
  const loadRooms = () => {
    setRoomsLoading(true);
    fetchAdminSessions()
      .then(setAdminRooms)
      .catch(() => setRoomsError("โหลดห้องทั่วไปไม่สำเร็จ"))
      .finally(() => setRoomsLoading(false));
  };

  useEffect(() => {
    fetchSports()
      .then(setAdminSports)
      .catch(() => setSportsError("โหลดรายชื่อกีฬาไม่สำเร็จ"))
      .finally(() => setSportsLoading(false));
    loadEvents();
    loadVenues();
    loadUsers();
    loadRooms();
  }, []);

  const addSport = async () => {
    if (!newSportName.trim()) return;
    setSportsError("");
    try {
      const sport = await createSport(newSportName.trim(), newSportIcon.trim() || "🏅");
      setAdminSports(p => [...p, sport]);
      setShowSportModal(false);
    } catch (e) {
      setSportsError(e instanceof ApiError ? e.message : "เพิ่มกีฬาไม่สำเร็จ");
    }
  };

  const saveSportEdit = async (id: string) => {
    if (!editSportName.trim()) { setEditingSport(null); return; }
    setSportsError("");
    try {
      const updated = await updateSport(id, { name: editSportName.trim(), icon: editSportIcon.trim() || "🏅" });
      setAdminSports(p => p.map(x => x.id === id ? updated : x));
    } catch (e) {
      setSportsError(e instanceof ApiError ? e.message : "แก้ไขกีฬาไม่สำเร็จ");
    } finally {
      setEditingSport(null);
    }
  };

  const removeSport = async (id: string) => {
    setSportsError("");
    try {
      await deleteSport(id);
      setAdminSports(p => p.filter(x => x.id !== id));
    } catch (e) {
      setSportsError(e instanceof ApiError ? e.message : "ลบกีฬาไม่สำเร็จ");
    }
  };
  const emptyVenueForm = { name: "", photoUrl: "", lat: null as number | null, lng: null as number | null };
  const [venueModal, setVenueModal] = useState<{ mode: "create" | "edit"; id?: string } | null>(null);
  const [venueForm, setVenueForm] = useState(emptyVenueForm);
  const [venueFormError, setVenueFormError] = useState("");
  const [venueFormSaving, setVenueFormSaving] = useState(false);
  const [venuePhotoUploading, setVenuePhotoUploading] = useState(false);

  const openCreateVenueModal = () => { setVenueForm(emptyVenueForm); setVenueFormError(""); setVenueModal({ mode: "create" }); };
  const openEditVenueModal = (v: ApiVenue) => {
    setVenueForm({ name: v.name, photoUrl: v.photoUrl ?? "", lat: v.lat ?? null, lng: v.lng ?? null });
    setVenueFormError("");
    setVenueModal({ mode: "edit", id: v.id });
  };
  const closeVenueModal = () => setVenueModal(null);
  const onVenuePhotoChange = async (file: File | undefined) => {
    if (!file) return;
    setVenuePhotoUploading(true);
    setVenueFormError("");
    try {
      const url = await uploadVenueImage(file);
      setVenueForm(prev => ({ ...prev, photoUrl: url }));
    } catch (e) {
      setVenueFormError(e instanceof Error ? e.message : "อัปโหลดรูปไม่สำเร็จ");
    } finally {
      setVenuePhotoUploading(false);
    }
  };
  const saveVenueModal = async () => {
    if (!venueForm.name.trim()) return;
    setVenueFormSaving(true);
    setVenueFormError("");
    try {
      const payload = {
        name: venueForm.name.trim(),
        photoUrl: venueForm.photoUrl || undefined,
        lat: venueForm.lat ?? undefined,
        lng: venueForm.lng ?? undefined,
      };
      if (venueModal?.mode === "create") {
        const created = await createVenue(payload);
        setAdminVenues(p => [...p, created]);
      } else if (venueModal?.mode === "edit" && venueModal.id) {
        const updated = await updateVenue(venueModal.id, payload);
        setAdminVenues(p => p.map(x => x.id === venueModal.id ? updated : x));
      }
      setVenueModal(null);
    } catch (e) {
      setVenueFormError(e instanceof ApiError ? e.message : "บันทึกสนามไม่สำเร็จ");
    } finally {
      setVenueFormSaving(false);
    }
  };
  const removeVenue = async (id: string) => {
    setVenuesError("");
    try {
      await deleteVenue(id);
      setAdminVenues(p => p.filter(x => x.id !== id));
    } catch (e) {
      setVenuesError(e instanceof ApiError ? e.message : "ลบสนามไม่สำเร็จ (อาจมีกิจกรรม/ห้องที่ใช้สนามนี้อยู่)");
    }
  };

  const [userActionError, setUserActionError] = useState("");
  const changeUserRole = async (id: string, role: "user" | "event_organizer" | "admin") => {
    setUserActionError("");
    try {
      const updated = await setUserRole(id, role);
      setAdminUsers(p => p.map(x => x.id === id ? updated : x));
    } catch (e) {
      setUserActionError(e instanceof ApiError ? e.message : "เปลี่ยนสิทธิ์ไม่สำเร็จ");
    }
  };
  const resetUserNoShow = async (id: string) => {
    setUserActionError("");
    try {
      const updated = await resetNoShow(id);
      setAdminUsers(p => p.map(x => x.id === id ? updated : x));
    } catch (e) {
      setUserActionError(e instanceof ApiError ? e.message : "รีเซ็ตไม่สำเร็จ");
    }
  };
  const removeUser = async (id: string) => {
    setUserActionError("");
    try {
      await deleteAdminUser(id);
      setAdminUsers(p => p.filter(x => x.id !== id));
    } catch (e) {
      setUserActionError(e instanceof ApiError ? e.message : "ลบผู้ใช้ไม่สำเร็จ");
    }
  };
  const filteredAdminUsers = adminUsers.filter(u => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return true;
    return `${u.firstName} ${u.lastName} ${u.nickname ?? ""} ${u.email}`.toLowerCase().includes(q);
  });

  const [showAchModal, setShowAchModal] = useState(false);
  const [newAchName, setNewAchName] = useState("");
  const [editingAch, setEditingAch] = useState<string | null>(null);
  const [editAchName, setEditAchName] = useState("");
  const [heatSport, setHeatSport] = useState("");
  const [heatPeriod, setHeatPeriod] = useState("7 วันล่าสุด");
  const [eventSearch, setEventSearch] = useState("");
  const emptyEventForm = { title: "", desc: "", date: "", time: "", venueId: "", sportId: "", max: "", cover: "", coverPos: { x: 50, y: 50 }, images: [] as string[] };
  const [eventModal, setEventModal] = useState<{ mode: "create" | "edit"; id?: string } | null>(null);
  const [eventForm, setEventForm] = useState(emptyEventForm);
  const [eventFormError, setEventFormError] = useState("");
  const [eventFormSaving, setEventFormSaving] = useState(false);
  const [eventOrganizerLabel, setEventOrganizerLabel] = useState("");
  const [coverUploading, setCoverUploading] = useState(false);
  const [imagesUploading, setImagesUploading] = useState(false);
  const coverDragRef = React.useRef<{ x: number; y: number; startPos: { x: number; y: number } } | null>(null);

  const buildStartEnd = (date: string, time: string) => {
    if (!date) return null;
    if (time && time.includes("–")) {
      const [s, e] = time.split("–").map(x => x.trim());
      return { startTime: new Date(`${date}T${s}`).toISOString(), endTime: new Date(`${date}T${e}`).toISOString() };
    }
    return { startTime: new Date(`${date}T00:00`).toISOString(), endTime: new Date(`${date}T23:59`).toISOString() };
  };

  const openCreateEventModal = () => {
    setEventForm(emptyEventForm);
    setEventFormError("");
    setEventOrganizerLabel(currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "");
    setEventModal({ mode: "create" });
  };
  const isoToLocalDateStr = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const openEditEventModal = async (ev: EventCardData) => {
    setEventFormError("");
    setEventOrganizerLabel(ev.organizer);
    try {
      const srv = await getEvent(ev.id);
      setEventForm({
        title: srv.title, desc: srv.description ?? "", date: isoToLocalDateStr(srv.startTime),
        time: srv.startTime && srv.endTime ? `${new Date(srv.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}–${new Date(srv.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "",
        venueId: srv.venueId, sportId: srv.sportId, max: srv.maxCapacity ? String(srv.maxCapacity) : "",
        cover: srv.coverUrl ?? "", coverPos: { x: srv.coverPosX ?? 50, y: srv.coverPosY ?? 50 }, images: srv.images ?? [],
      });
      setEventModal({ mode: "edit", id: srv.id });
    } catch (e) {
      setEventFormError(e instanceof ApiError ? e.message : "โหลดข้อมูลกิจกรรมไม่สำเร็จ กรุณาเลือกกีฬาและสถานที่ใหม่ก่อนบันทึก");
      setEventForm({
        title: ev.title, desc: ev.desc, date: "", time: ev.time, venueId: "", sportId: "", max: String(ev.max || ""),
        cover: ev.cover, coverPos: ev.coverPos, images: ev.images,
      });
      setEventModal({ mode: "edit", id: ev.id });
    }
  };
  const addEventImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setImagesUploading(true);
    setEventFormError("");
    try {
      const urls = await Promise.all(Array.from(files).map(f => uploadEventImage(f)));
      setEventForm(prev => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch (e) {
      setEventFormError(e instanceof Error ? e.message : "อัปโหลดรูปไม่สำเร็จ");
    } finally {
      setImagesUploading(false);
    }
  };
  const removeEventImage = (idx: number) => setEventForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  const onCoverFileChange = async (file: File | undefined) => {
    if (!file) return;
    setCoverUploading(true);
    setEventFormError("");
    try {
      const url = await uploadEventImage(file);
      setEventForm(prev => ({ ...prev, cover: url, coverPos: { x: 50, y: 50 } }));
    } catch (e) {
      setEventFormError(e instanceof Error ? e.message : "อัปโหลดรูปไม่สำเร็จ");
    } finally {
      setCoverUploading(false);
    }
  };
  const closeEventModal = () => setEventModal(null);
  const saveEventModal = async () => {
    if (!eventForm.title.trim() || !eventForm.sportId || !eventForm.venueId) return;
    if (!eventForm.cover) { setEventFormError("กรุณาแนบรูปปกกิจกรรม"); return; }
    const range = buildStartEnd(eventForm.date, eventForm.time);
    if (!range) { setEventFormError("กรุณาเลือกวันที่"); return; }
    setEventFormSaving(true);
    setEventFormError("");
    try {
      const payload = {
        title: eventForm.title.trim(), description: eventForm.desc || undefined,
        startTime: range.startTime, endTime: range.endTime,
        maxCapacity: eventForm.max ? Number(eventForm.max) : undefined,
        coverUrl: eventForm.cover || undefined, coverPosX: eventForm.coverPos.x, coverPosY: eventForm.coverPos.y,
        images: eventForm.images,
      };
      if (eventModal?.mode === "create") {
        const created = await apiCreateEvent({ sportId: eventForm.sportId, venueId: eventForm.venueId, ...payload });
        setAdminEvents(p => [...p, toEventCard(created)]);
      } else if (eventModal?.mode === "edit" && eventModal.id) {
        const updated = await apiUpdateEvent(eventModal.id, payload);
        setAdminEvents(p => p.map(x => x.id === eventModal.id ? toEventCard(updated) : x));
      }
      setEventModal(null);
    } catch (e) {
      setEventFormError(e instanceof ApiError ? e.message : "บันทึกกิจกรรมไม่สำเร็จ");
    } finally {
      setEventFormSaving(false);
    }
  };
  const removeEvent = async (id: string) => {
    setEventsError("");
    try {
      await apiDeleteEvent(id);
      setAdminEvents(p => p.filter(x => x.id !== id));
    } catch (e) {
      setEventsError(e instanceof ApiError ? e.message : "ลบกิจกรรมไม่สำเร็จ");
    }
  };
  const removeRoom = async (id: string) => {
    setRoomsError("");
    try {
      await deleteAdminSession(id);
      setAdminRooms(p => p.filter(x => x.id !== id));
    } catch (e) {
      setRoomsError(e instanceof ApiError ? e.message : "ลบห้องไม่สำเร็จ");
    }
  };
  const filteredAdminRooms = adminRooms.filter(r => {
    const q = roomSearch.trim().toLowerCase();
    if (!q) return true;
    return `${r.title} ${r.sport.name} ${r.venue.name} ${r.host.firstName} ${r.host.lastName}`.toLowerCase().includes(q);
  });
  const roomStatusLabel: Record<string, string> = { open: "เปิดรับ", full: "เต็ม", ongoing: "กำลังเล่น", completed: "จบแล้ว", cancelled: "ยกเลิก" };
  const roomStatusClass: Record<string, string> = {
    open: "bg-green-100 text-green-700", full: "bg-amber-100 text-amber-700", ongoing: "bg-blue-100 text-blue-700",
    completed: "bg-gray-100 text-gray-600", cancelled: "bg-red-100 text-red-600",
  };
  const onCoverPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    coverDragRef.current = { x: e.clientX, y: e.clientY, startPos: eventForm.coverPos };
  };
  const onCoverPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!coverDragRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = ((e.clientX - coverDragRef.current.x) / rect.width) * 100;
    const dy = ((e.clientY - coverDragRef.current.y) / rect.height) * 100;
    const clamp = (n: number) => Math.max(0, Math.min(100, n));
    setEventForm(f => ({ ...f, coverPos: { x: clamp(coverDragRef.current!.startPos.x - dx), y: clamp(coverDragRef.current!.startPos.y - dy) } }));
  };
  const onCoverPointerUp = () => { coverDragRef.current = null; };
  const filteredAdminEvents = adminEvents.filter(ev => ev.title.toLowerCase().includes(eventSearch.trim().toLowerCase()));
  const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [timeDraft, setTimeDraft] = useState<{ sh: string; sm: string; eh: string; em: string }>({ sh: "", sm: "", eh: "", em: "" });
  const openTimePicker = () => {
    const [s, e] = eventForm.time.includes("–") ? eventForm.time.split("–").map(x => x.trim()) : ["", ""];
    const [sh, sm] = s ? s.split(":") : ["", ""];
    const [eh, em] = e ? e.split(":") : ["", ""];
    setTimeDraft({ sh, sm, eh, em });
    setTimePickerOpen(true);
  };
  const timeDraftValid = timeDraft.sh && timeDraft.sm && timeDraft.eh && timeDraft.em && `${timeDraft.sh}:${timeDraft.sm}` < `${timeDraft.eh}:${timeDraft.em}`;
  const confirmTimePicker = () => {
    if (!timeDraftValid) return;
    setEventForm(f => ({ ...f, time: `${timeDraft.sh}:${timeDraft.sm}–${timeDraft.eh}:${timeDraft.em}` }));
    setTimePickerOpen(false);
  };
  const clearTimePicker = () => { setEventForm(f => ({ ...f, time: "" })); setTimePickerOpen(false); };
  const timeLabel = eventForm.time || "ไม่ระบุเวลา (ทั้งวัน)";
  const filteredReports = reportFilter === "ทั้งหมด" ? reports : reports.filter(r => r.status === reportFilter);
  const handleRefresh = () => { setIsRefreshing(true); setTimeout(() => setIsRefreshing(false), 800); };
  const adminTabs: { id: AdminTab; icon: React.ReactNode; label: string; badge?: number }[] = [
    { id: "dashboard", icon: <BarChart2 size={17} />, label: "Dashboard" },
    { id: "reports", icon: <AlertTriangle size={17} />, label: "Reports", badge: 2 },
    { id: "events", icon: <CalendarDays size={17} />, label: t.events_title },
    { id: "rooms", icon: <DoorOpen size={17} />, label: "ห้องทั่วไป" },
    { id: "sports", icon: <Star size={17} />, label: t.sport },
    { id: "venues", icon: <MapPin size={17} />, label: t.venue },
    { id: "achievements", icon: <Trophy size={17} />, label: "Achievement" },
    { id: "roles", icon: <Users size={17} />, label: "ผู้ใช้" },
    { id: "heatmap", icon: <Zap size={17} />, label: "Heat Map" },
  ];
  const stats = [
    { label: "User Online", val: "1,247", sub: "+12%", grad: "from-green-500 to-emerald-600", icon: <Users size={22} /> },
    { label: "Match วันนี้", val: "89", sub: "+8%", grad: "from-pink-500 to-rose-600", icon: <Heart size={22} /> },
    { label: "DAU", val: "3,482", sub: "7 วันย้อนหลัง", grad: "from-blue-500 to-indigo-600", icon: <Activity size={22} /> },
    { label: "Report รอตรวจ", val: "7", sub: "ต้องดำเนินการ", grad: "from-red-500 to-rose-600", icon: <AlertTriangle size={22} /> },
  ];
  const pieData = [{ name: "แบด", value: 142 }, { name: "ฟุตบอล", value: 118 }, { name: "วิ่ง", value: 94 }, { name: "บาส", value: 76 }, { name: "อื่นๆ", value: 90 }];
  const pieColors = ["#16A34A", "#3B82F6", "#F59E0B", "#EC4899", "#8B5CF6"];
  return (
    <div className="flex h-full overflow-hidden">
      <aside className="hidden lg:flex flex-col w-52 shrink-0 bg-gray-950 text-white">
        <div className="p-4 border-b border-white/10 flex items-center gap-2.5"><Shield size={20} className="text-purple-400" /><span className="font-black text-sm">Admin Panel</span></div>
        <nav className="flex-1 py-3 overflow-y-auto">
          {adminTabs.map(tb => <button key={tb.id} onClick={() => setTab(tb.id)} className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold transition-colors ${tab === tb.id ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80 hover:bg-white/5"}`}>{tb.icon}{tb.label}{tb.badge ? <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{tb.badge}</span> : null}</button>)}
        </nav>
        <button onClick={onBack} className="p-4 border-t border-white/10 flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors"><ChevronLeft size={17} />{t.back_app}</button>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="lg:hidden overflow-x-auto border-b border-border shrink-0 bg-white"><div className="flex min-w-max">{adminTabs.map(tb => <button key={tb.id} onClick={() => setTab(tb.id)} className={`flex items-center gap-1.5 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${tab === tb.id ? "border-green-600 text-green-700" : "border-transparent text-muted-foreground"}`}>{tb.icon}{tb.label}</button>)}</div></div>
        <div className="flex items-center justify-between px-5 h-14 border-b border-border bg-white shrink-0">
          <div><h2 className="font-black text-gray-900">{adminTabs.find(tb => tb.id === tab)?.label}</h2><p className="text-[11px] text-muted-foreground">KU Sports Admin</p></div>
          <button onClick={handleRefresh} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"><RefreshCw size={17} className={isRefreshing ? "animate-spin" : ""} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {tab === "dashboard" && (
            <div className="space-y-5 max-w-5xl">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(s => <div key={s.label} className={`bg-gradient-to-br ${s.grad} text-white rounded-2xl p-4 shadow-sm`}><div className="flex items-start justify-between mb-3 opacity-80">{s.icon}<TrendingUp size={14} /></div><div className="text-3xl font-black">{s.val}</div><div className="text-sm font-bold mt-0.5">{s.label}</div><div className="text-xs opacity-60 mt-0.5">{s.sub}</div></div>)}
              </div>
              <div className="grid lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-4">
                  <h3 className="font-bold text-sm mb-4">Daily Active Users (7 วัน)</h3>
                  <ResponsiveContainer width="100%" height={200}><LineChart data={DAU_DATA}><CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" /><XAxis dataKey="d" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Line type="monotone" dataKey="v" stroke="#16A34A" strokeWidth={2.5} dot={{ fill: "#16A34A", r: 4 }} /></LineChart></ResponsiveContainer>
                </div>
                <div className="bg-white rounded-2xl border border-border p-4">
                  <h3 className="font-bold text-sm mb-4">กีฬายอดนิยม</h3>
                  <ResponsiveContainer width="100%" height={200}><PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>{pieData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
                  <div className="space-y-1 mt-2">{pieData.map((p, i) => <div key={p.name} className="flex items-center gap-2 text-xs"><div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: pieColors[i] }} /><span className="text-gray-600 flex-1">{p.name}</span><span className="font-bold text-gray-900">{p.value}</span></div>)}</div>
                </div>
              </div>
            </div>
          )}
          {tab === "reports" && (
            <div className="max-w-4xl">
              <div className="flex gap-2 mb-4">{["ทั้งหมด","รอตรวจ","อนุมัติ","ปฏิเสธ"].map(f => <button key={f} onClick={() => setReportFilter(f)} className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${reportFilter===f?"bg-gray-900 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{f}</button>)}</div>
              <div className="bg-white rounded-2xl border border-border overflow-hidden overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead className="bg-gray-50 border-b border-border"><tr>{["ผู้แจ้ง","ผู้ถูกแจ้ง","หมวดหมู่","หลักฐาน","สถานะ","วันที่","จัดการ"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-black text-muted-foreground">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-border">
                    {filteredReports.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-gray-900">{r.reporter}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.reported}</td>
                        <td className="px-4 py-3"><span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{r.cat}</span></td>
                        <td className="px-4 py-3">{r.cat==="No Show"?<div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200"><Camera size={14} className="text-gray-400"/></div>:<span className="text-xs text-muted-foreground">—</span>}</td>
                        <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.status==="รอตรวจ"?"bg-amber-100 text-amber-700":r.status==="อนุมัติ"?"bg-green-100 text-green-700":"bg-gray-100 text-gray-600"}`}>{r.status}</span></td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{r.date}</td>
                        <td className="px-4 py-3"><div className="flex gap-1.5">{r.status==="รอตรวจ"&&<><button onClick={() => setReports(p => p.map(x => x.id===r.id?{...x,status:"อนุมัติ"}:x))} className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"><ThumbsUp size={13} /></button><button onClick={() => setReports(p => p.map(x => x.id===r.id?{...x,status:"ปฏิเสธ"}:x))} className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"><ThumbsDown size={13} /></button></>}</div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {tab === "events" && (
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1"><Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={eventSearch} onChange={e => setEventSearch(e.target.value)} placeholder={t.search_event_ph} className="w-full bg-white border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100" /></div>
                <button onClick={openCreateEventModal} className="bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 hover:bg-green-700 shrink-0"><Plus size={15} />สร้างกิจกรรม</button>
              </div>
              {eventsError && <p className="text-red-500 text-xs mb-3">{eventsError}</p>}
              {eventsLoading && <div className="flex justify-center py-10"><div className="w-7 h-7 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>}
              {!eventsLoading && (
              <div className="space-y-3">
                {filteredAdminEvents.map(ev => (
                  <div key={ev.id} className="bg-white rounded-2xl border border-border p-4 flex gap-4 items-start group hover:border-green-300 transition-all">
                    <img src={ev.cover} style={{ objectPosition: `${ev.coverPos.x}% ${ev.coverPos.y}%` }} className="w-24 h-16 rounded-xl object-cover shrink-0" alt="" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-black text-gray-900 text-sm truncate">{ev.title}</h3>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${ev.past ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-700"}`}>{ev.past ? "จัดไปแล้ว" : "กำลังจะมาถึง"}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2"><CalendarDays size={11} className="inline mr-1" />{ev.date}{ev.time ? ` · ${ev.time}` : ""} · <MapPin size={11} className="inline mr-0.5" />{ev.venue}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground"><span><Users size={11} className="inline mr-0.5" />{ev.participants}/{ev.max}</span><span>{ev.organizer}</span></div>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button onClick={() => onOrganize?.(ev.id)} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 flex items-center gap-1"><SlidersHorizontal size={12} />จัดการ</button>
                      <button onClick={() => openEditEventModal(ev)} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200 flex items-center gap-1"><Edit3 size={12} />{t.edit}</button>
                      <button onClick={() => removeEvent(ev.id)} className="bg-red-50 text-red-500 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 flex items-center gap-1"><Trash2 size={12} />{t.delete}</button>
                    </div>
                  </div>
                ))}
                {filteredAdminEvents.length === 0 && <p className="text-center text-sm text-muted-foreground py-10">ไม่พบกิจกรรมที่ค้นหา</p>}
              </div>
              )}
            </div>
          )}
          {tab === "rooms" && (
            <div className="max-w-4xl">
              <div className="relative mb-4"><Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={roomSearch} onChange={e => setRoomSearch(e.target.value)} placeholder="ค้นหาห้อง, กีฬา, สนาม, ผู้สร้าง..." className="w-full bg-white border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100" /></div>
              {roomsError && <p className="text-red-500 text-xs mb-3">{roomsError}</p>}
              {roomsLoading && <div className="flex justify-center py-10"><div className="w-7 h-7 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>}
              {!roomsLoading && (
              <div className="space-y-3">
                {filteredAdminRooms.map(r => (
                  <div key={r.id} className="bg-white rounded-2xl border border-border p-4 flex gap-4 items-start group hover:border-red-200 transition-all">
                    <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center text-2xl shrink-0">{r.sport.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-black text-gray-900 text-sm truncate">{r.title}</h3>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${roomStatusClass[r.status] ?? "bg-gray-100 text-gray-600"}`}>{roomStatusLabel[r.status] ?? r.status}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2"><CalendarDays size={11} className="inline mr-1" />{new Date(r.startTime).toLocaleDateString("th-TH")}{" "}·{" "}<MapPin size={11} className="inline mr-0.5" />{r.venue.name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground"><span><Users size={11} className="inline mr-0.5" />{r.currentPlayers}/{r.maxPlayers}</span><span>โดย {r.host.nickname || `${r.host.firstName} ${r.host.lastName}`}</span></div>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button onClick={() => removeRoom(r.id)} className="bg-red-50 text-red-500 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 flex items-center gap-1"><Trash2 size={12} />{t.delete}</button>
                    </div>
                  </div>
                ))}
                {filteredAdminRooms.length === 0 && <p className="text-center text-sm text-muted-foreground py-10">ไม่พบห้องที่ค้นหา</p>}
              </div>
              )}
            </div>
          )}
          {tab === "sports" && (
            <div className="max-w-3xl">
              <div className="flex justify-end mb-4"><button onClick={() => { setNewSportName(""); setNewSportIcon("🏅"); setSportsError(""); setShowSportModal(true); }} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 hover:bg-green-700"><Plus size={15} />เพิ่มกีฬา</button></div>
              {sportsError && <p className="text-red-500 text-xs mb-3">{sportsError}</p>}
              {sportsLoading && <div className="flex justify-center py-10"><div className="w-7 h-7 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>}
              {!sportsLoading && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {adminSports.map(s => <div key={s.id} className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3 group hover:border-green-300 transition-all cursor-pointer">
                    {editingSport === s.id ? (
                      <>
                        <input autoFocus value={editSportIcon} onChange={e => setEditSportIcon(e.target.value)} className="w-11 h-11 text-center text-xl border border-green-400 rounded-xl outline-none" maxLength={4} />
                        <input value={editSportName} onChange={e => setEditSportName(e.target.value)} onKeyDown={e => { if (e.key === "Enter") saveSportEdit(s.id); }} className="flex-1 text-sm font-bold border border-green-400 rounded-lg px-2 py-1 outline-none" />
                        <button onClick={() => saveSportEdit(s.id)} className="p-1.5 hover:bg-green-50 rounded-lg"><Check size={15} className="text-green-600" /></button>
                      </>
                    ) : (
                      <>
                        <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center text-2xl">{s.icon}</div>
                        <span className="flex-1 text-sm font-bold">{s.name}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingSport(s.id); setEditSportName(s.name); setEditSportIcon(s.icon); }} className="p-1.5 hover:bg-gray-100 rounded-lg"><Edit3 size={13} className="text-gray-400" /></button>
                          <button onClick={() => removeSport(s.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={13} className="text-red-400" /></button>
                        </div>
                      </>
                    )}
                  </div>)}
                </div>
              )}
            </div>
          )}
          {tab === "venues" && (
            <div className="max-w-3xl">
              <div className="flex justify-end mb-4"><button onClick={openCreateVenueModal} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 hover:bg-green-700"><Plus size={15} />เพิ่มสนาม</button></div>
              {venuesError && <p className="text-red-500 text-xs mb-3">{venuesError}</p>}
              {venuesLoading && <div className="flex justify-center py-10"><div className="w-7 h-7 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>}
              {!venuesLoading && (
              <div className="space-y-2">
                {adminVenues.map(v => (
                  <div key={v.id} className="bg-white rounded-xl border border-border p-4 flex items-center gap-3 group hover:border-green-300 transition-all">
                    {v.photoUrl ? <img src={v.photoUrl} alt={v.name} className="w-9 h-9 rounded-xl object-cover shrink-0" /> : <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center shrink-0"><MapPin size={17} className="text-green-600" /></div>}
                    <span className="flex-1 text-sm font-bold flex items-center gap-2">{v.name}{v.lat != null && v.lng != null && <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">ปักหมุดแล้ว</span>}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditVenueModal(v)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="แก้ไข"><Edit3 size={13} className="text-gray-400" /></button>
                      <button onClick={() => removeVenue(v.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={13} className="text-red-400" /></button>
                    </div>
                  </div>
                ))}
                {adminVenues.length === 0 && <p className="text-center text-sm text-muted-foreground py-10">ยังไม่มีสนาม</p>}
              </div>
              )}
            </div>
          )}
          {tab === "achievements" && (
            <div className="max-w-3xl">
              <div className="flex justify-end mb-4"><button onClick={() => { setNewAchName(""); setShowAchModal(true); }} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 hover:bg-green-700"><Plus size={15} />สร้าง Achievement</button></div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {adminAchievements.map(a => <div key={a.id} className="bg-white rounded-2xl border border-border p-4 group hover:border-amber-300 transition-all cursor-pointer"><div className="flex items-start justify-between mb-2.5"><div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-2xl">{a.icon}</div><div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => { setEditingAch(a.id); setEditAchName(a.name); }} className="p-1 hover:bg-gray-100 rounded-lg"><Edit3 size={13} className="text-gray-400" /></button><button onClick={() => setAdminAchievements(p => p.filter(x => x.id !== a.id))} className="p-1 hover:bg-red-50 rounded-lg"><Trash2 size={13} className="text-red-400" /></button></div></div>{editingAch === a.id ? <input autoFocus value={editAchName} onChange={e => setEditAchName(e.target.value)} onBlur={() => { if (editAchName.trim()) setAdminAchievements(p => p.map(x => x.id === a.id ? { ...x, name: editAchName.trim() } : x)); setEditingAch(null); }} onKeyDown={e => { if (e.key === "Enter") { if (editAchName.trim()) setAdminAchievements(p => p.map(x => x.id === a.id ? { ...x, name: editAchName.trim() } : x)); setEditingAch(null); }}} className="text-sm font-black border border-amber-400 rounded-lg px-2 py-1 outline-none w-full mb-1" /> : <p className="text-sm font-black text-gray-900">{a.name}</p>}<p className="text-xs text-muted-foreground mt-0.5">{a.cond}</p></div>)}
              </div>
            </div>
          )}
          {tab === "roles" && (
            <div className="max-w-3xl space-y-4">
              <div className="relative"><Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="ค้นหาผู้ใช้..." className="w-full bg-white border border-border rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100" /></div>
              {usersError && <p className="text-red-500 text-xs">{usersError}</p>}
              {userActionError && <p className="text-red-500 text-xs">{userActionError}</p>}
              {usersLoading && <div className="flex justify-center py-10"><div className="w-7 h-7 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>}
              {!usersLoading && filteredAdminUsers.map(u => (
                <div key={u.id} className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3 flex-wrap">
                  <Av src={u.photos[0]?.url ?? ""} name={u.nickname || u.firstName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5"><p className="text-sm font-bold">{u.nickname || `${u.firstName} ${u.lastName}`}</p>{u.warningBadge && <span className="inline-flex items-center gap-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full"><AlertTriangle size={9}/>No Show</span>}</div>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto">
                    {u.warningBadge && <button onClick={() => resetUserNoShow(u.id)} className="p-2 bg-orange-50 hover:bg-orange-100 rounded-xl text-orange-500 flex items-center gap-1 text-xs font-bold"><RotateCcw size={13}/>Reset</button>}
                    {u.role === "admin"
                      ? <span className="bg-purple-100 text-purple-700 rounded-xl px-3 py-2 text-xs font-bold">Admin</span>
                      : <select value={u.role} onChange={e => changeUserRole(u.id, e.target.value as "user" | "event_organizer" | "admin")} className="bg-gray-100 border-0 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-green-200"><option value="user">User</option><option value="event_organizer">ผู้จัดกิจกรรม</option><option value="admin">Admin</option></select>
                    }
                    {u.role !== "admin" && <button onClick={() => removeUser(u.id)} className="p-2 hover:bg-red-50 rounded-xl text-red-400"><UserX size={15} /></button>}
                  </div>
                </div>
              ))}
              {!usersLoading && filteredAdminUsers.length === 0 && <p className="text-center text-sm text-muted-foreground py-10">ไม่พบผู้ใช้</p>}
            </div>
          )}
          {tab === "heatmap" && (
            <div className="max-w-3xl space-y-4">
              <div className="flex gap-3 flex-wrap">
                <select value={heatSport} onChange={e => setHeatSport(e.target.value)} className="bg-white border border-border rounded-xl px-3 py-2 text-sm font-semibold outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"><option value="">ทุกกีฬา</option>{SPORTS.slice(0,6).map(s=><option key={s.id} value={s.name}>{s.emoji} {s.name}</option>)}</select>
                <select value={heatPeriod} onChange={e => setHeatPeriod(e.target.value)} className="bg-white border border-border rounded-xl px-3 py-2 text-sm font-semibold outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"><option>7 วันล่าสุด</option><option>30 วันล่าสุด</option><option>ทั้งหมด</option></select>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {VENUE_HEAT.filter(v => !heatSport || v.name.toLowerCase().includes(heatSport.toLowerCase())).map(v => (
                  <div key={v.name} className="bg-white rounded-2xl border border-border p-4">
                    <div className="flex items-center justify-between mb-2.5"><span className="text-sm font-bold text-gray-900">{v.name}</span><span className="text-sm font-black" style={{ color: `hsl(${120*v.pct/100},60%,40%)` }}>{v.pct}%</span></div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${v.pct}%` }} transition={{ duration: 0.9 }} className="h-full rounded-full" style={{ background: `hsl(${120*v.pct/100},60%,45%)` }} /></div>
                    <div className="flex justify-between mt-2"><span className="text-xs text-muted-foreground">{v.sessions} sessions</span><span className="text-xs text-muted-foreground">{heatPeriod}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {showSportModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"><div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl">
        <h3 className="font-bold text-lg mb-4">เพิ่มกีฬาใหม่</h3>
        <div className="flex gap-2 mb-4">
          <input autoFocus value={newSportIcon} onChange={e => setNewSportIcon(e.target.value)} placeholder="🏅" maxLength={4} className="w-16 bg-gray-50 border border-border rounded-xl px-2 py-3 text-center text-xl outline-none focus:border-green-500" />
          <input value={newSportName} onChange={e => setNewSportName(e.target.value)} placeholder="ชื่อกีฬา" className="flex-1 bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500" />
        </div>
        {sportsError && <p className="text-red-500 text-xs mb-3">{sportsError}</p>}
        <div className="flex gap-2">
          <button onClick={() => setShowSportModal(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-gray-600 hover:bg-gray-50">{t.cancel}</button>
          <button onClick={addSport} disabled={!newSportName.trim()} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-40">{t.add}</button>
        </div>
      </div></div>}
      {venueModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 overflow-y-auto"><div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-xl my-auto">
        <h3 className="font-bold text-lg mb-4">{venueModal.mode === "create" ? "เพิ่มสนามใหม่" : "แก้ไขสนาม"}</h3>
        {venueFormError && <p className="text-red-500 text-xs mb-3">{venueFormError}</p>}
        <input autoFocus value={venueForm.name} onChange={e => setVenueForm(f => ({ ...f, name: e.target.value }))} placeholder="ชื่อสนาม" className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500 mb-4" />
        <p className="text-sm font-bold mb-2">รูปสนาม</p>
        <label className="flex items-center gap-3 mb-4 cursor-pointer">
          {venuePhotoUploading ? <div className="w-16 h-16 rounded-xl border border-border flex items-center justify-center"><div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>
            : venueForm.photoUrl ? <img src={venueForm.photoUrl} alt="preview" className="w-16 h-16 rounded-xl object-cover border border-border" /> : <div className="w-16 h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-gray-400"><Camera size={20} /></div>}
          <span className="text-sm font-semibold text-green-600">{venueForm.photoUrl ? "เปลี่ยนรูป" : "แนบรูปสนาม"}</span>
          <input type="file" accept="image/*" className="hidden" disabled={venuePhotoUploading} onChange={e => { const f = e.target.files?.[0]; onVenuePhotoChange(f); e.target.value = ""; }} />
        </label>
        <p className="text-sm font-bold mb-2">ปักหมุดตำแหน่งสนาม</p>
        <VenuePinPicker initial={venueForm.lat != null && venueForm.lng != null ? { lat: venueForm.lat, lng: venueForm.lng } : null} onChange={c => setVenueForm(f => ({ ...f, lat: c.lat, lng: c.lng }))} />
        {venueForm.lat != null && venueForm.lng != null && <p className="text-xs text-muted-foreground mt-2 mb-1">พิกัด: {venueForm.lat.toFixed(6)}, {venueForm.lng.toFixed(6)}</p>}
        <div className="flex gap-2 mt-4">
          <button onClick={closeVenueModal} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-gray-600 hover:bg-gray-50">{t.cancel}</button>
          <button onClick={saveVenueModal} disabled={!venueForm.name.trim() || venueFormSaving} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-40">{venueFormSaving ? "กำลังบันทึก..." : venueModal.mode === "create" ? t.add : "บันทึก"}</button>
        </div>
      </div></div>}
      {showAchModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"><div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl"><h3 className="font-bold text-lg mb-4">สร้าง Achievement</h3><input autoFocus value={newAchName} onChange={e => setNewAchName(e.target.value)} placeholder="ชื่อ Achievement" className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500 mb-4" /><div className="flex gap-2"><button onClick={() => setShowAchModal(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-gray-600 hover:bg-gray-50">{t.cancel}</button><button onClick={() => { if (newAchName.trim()) { setAdminAchievements(p => [...p, { id: Date.now().toString(), name: newAchName.trim(), icon: "🏆", cond: "เงื่อนไขใหม่", desc: "", done: false }]); setShowAchModal(false); }}} disabled={!newAchName.trim()} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-40">{t.create}</button></div></div></div>}
      {eventModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 overflow-y-auto"><div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-xl my-auto">
        <h3 className="font-bold text-lg mb-4">{eventModal.mode === "create" ? t.create_event_new : "แก้ไขกิจกรรม"}</h3>
        {eventFormError && <p className="text-red-500 text-xs mb-3">{eventFormError}</p>}
        <p className="text-sm font-bold mb-2">รูปปก</p>
        <div
          className="relative w-full h-40 rounded-xl overflow-hidden border border-border mb-1 bg-gray-100 cursor-grab active:cursor-grabbing select-none touch-none"
          onPointerDown={onCoverPointerDown} onPointerMove={onCoverPointerMove} onPointerUp={onCoverPointerUp} onPointerLeave={onCoverPointerUp}
        >
          {coverUploading ? (
            <div className="w-full h-full flex items-center justify-center"><div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : eventForm.cover
            ? <img src={eventForm.cover} draggable={false} style={{ objectPosition: `${eventForm.coverPos.x}% ${eventForm.coverPos.y}%` }} className="w-full h-full object-cover pointer-events-none" alt="" />
            : <div className="w-full h-full flex items-center justify-center text-gray-400 pointer-events-none"><Camera size={22} /></div>}
        </div>
        <div className="flex items-center justify-between mb-4">
          <label className="text-xs font-semibold text-green-600 cursor-pointer">{eventForm.cover ? "เปลี่ยนรูป" : "แนบรูปปก"}<input type="file" accept="image/*" className="hidden" disabled={coverUploading} onChange={e => { const f = e.target.files?.[0]; onCoverFileChange(f); e.target.value = ""; }} /></label>
          {eventForm.cover && <span className="text-[11px] text-muted-foreground">ลากรูปเพื่อจัดตำแหน่ง</span>}
        </div>
        <input autoFocus value={eventForm.title} onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))} placeholder={t.event_name} className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500 mb-3" />
        <textarea value={eventForm.desc} onChange={e => setEventForm(f => ({ ...f, desc: e.target.value }))} placeholder="รายละเอียดกิจกรรม" rows={3} className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500 mb-2 resize-none" />
        <p className="text-xs font-bold text-muted-foreground mb-1.5">รายละเอียดเพิ่มเติม (ตารางงาน / โปสเตอร์ ฯลฯ)</p>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {eventForm.images.map((img, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
              <img src={img} className="w-full h-full object-cover" alt="" />
              <button type="button" onClick={() => removeEventImage(i)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={11} /></button>
            </div>
          ))}
          <label className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-gray-400 cursor-pointer hover:border-green-400 hover:text-green-500">
            {imagesUploading ? <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /> : <Plus size={16} />}
            <span className="text-[10px] font-semibold">เพิ่มรูป</span>
            <input type="file" accept="image/*" multiple className="hidden" disabled={imagesUploading} onChange={e => { addEventImages(e.target.files); e.target.value = ""; }} />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <p className="text-xs font-bold text-muted-foreground mb-1">{t.date}</p>
            <ThaiDateField value={eventForm.date} onChange={date => setEventForm(f => ({ ...f, date }))} />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground mb-1">เวลา (ถ้ามี)</p>
            <button type="button" onClick={openTimePicker} className={`w-full text-left bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500 flex items-center justify-between ${eventForm.time ? "text-gray-900" : "text-muted-foreground"}`}>
              <span>{timeLabel}</span>
              <Clock size={14} className="text-muted-foreground shrink-0" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div><p className="text-xs font-bold text-muted-foreground mb-1">{t.sport}</p><select value={eventForm.sportId} onChange={e => setEventForm(f => ({ ...f, sportId: e.target.value }))} className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500"><option value="">เลือกกีฬา</option>{adminSports.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}</select></div>
          <div><p className="text-xs font-bold text-muted-foreground mb-1">{t.venue}</p><select value={eventForm.venueId} onChange={e => setEventForm(f => ({ ...f, venueId: e.target.value }))} className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500"><option value="">เลือกสถานที่</option>{adminVenues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div><p className="text-xs font-bold text-muted-foreground mb-1">จำนวนคน</p><input type="number" min={0} value={eventForm.max} onChange={e => setEventForm(f => ({ ...f, max: e.target.value }))} placeholder="100" className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500" /></div>
          <div><p className="text-xs font-bold text-muted-foreground mb-1">ชื่อคนโพส/หน่วยงานที่โพส</p><input value={eventOrganizerLabel} readOnly disabled className="w-full bg-gray-100 border border-border rounded-xl px-3 py-2.5 text-sm outline-none text-muted-foreground" /></div>
        </div>
        <div className="flex gap-2">
          <button onClick={closeEventModal} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-gray-600 hover:bg-gray-50">{t.cancel}</button>
          <button onClick={saveEventModal} disabled={!eventForm.title.trim() || !eventForm.sportId || !eventForm.venueId || !eventForm.date || !eventForm.cover || eventFormSaving} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-40">{eventFormSaving ? "กำลังบันทึก..." : eventModal.mode === "create" ? t.create : "บันทึก"}</button>
        </div>
      </div></div>}
      {timePickerOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50" onClick={() => setTimePickerOpen(false)}>
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={e => e.stopPropagation()} className="bg-white rounded-t-2xl w-full max-w-md shadow-xl px-5 pt-3 pb-5"
          >
            <div className="w-10 h-1.5 bg-gray-200 rounded-full mx-auto mb-3" />
            <h3 className="font-bold text-base mb-1 text-center">เลือกเวลา</h3>
            <div className="grid grid-cols-2 gap-2 mb-1.5">
              <p className="text-[11px] font-bold text-muted-foreground text-center">เวลาเริ่ม</p>
              <p className="text-[11px] font-bold text-muted-foreground text-center">เวลาสิ้นสุด</p>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { key: "sh" as const, label: "ชั่วโมง", options: HOUR_OPTIONS },
                { key: "sm" as const, label: "นาที", options: MINUTE_OPTIONS },
                { key: "eh" as const, label: "ชั่วโมง", options: HOUR_OPTIONS },
                { key: "em" as const, label: "นาที", options: MINUTE_OPTIONS },
              ].map((col, i) => (
                <div key={col.key} className={`flex flex-col ${i === 2 ? "border-l border-border pl-1.5" : ""}`}>
                  <p className="text-[10px] font-semibold text-muted-foreground text-center mb-1">{col.label}</p>
                  <div className="h-48 overflow-y-auto rounded-xl border border-border bg-gray-50">
                    {col.options.map(opt => (
                      <button
                        key={opt} type="button"
                        onClick={() => setTimeDraft(d => ({ ...d, [col.key]: opt }))}
                        className={`w-full text-center py-2 text-sm transition-colors ${timeDraft[col.key] === opt ? "bg-green-600 text-white font-bold" : "text-gray-700 hover:bg-gray-100"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {timeDraft.sh && timeDraft.sm && timeDraft.eh && timeDraft.em && !timeDraftValid && <p className="text-[11px] text-red-500 text-center mt-2">เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่ม</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={clearTimePicker} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-gray-600 hover:bg-gray-50">ไม่ระบุเวลา</button>
              <button onClick={confirmTimePicker} disabled={!timeDraftValid} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-40">ตกลง</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
