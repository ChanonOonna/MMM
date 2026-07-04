import React, { useEffect, useState } from "react";
import { CalendarDays, MapPin, Users, Send, QrCode, ChevronLeft, Megaphone, X, ChevronRight, Trash2, Edit3, Camera, Plus, Share2 } from "lucide-react";
import { SPORTS } from "../data";
import { Av, PBar, SportBadge, ThaiDateField, ThaiTimeField } from "../components/shared";
import { getEvent, toEventCard, joinEvent, deleteEvent, fetchAnnouncements, sendAnnouncement, relativeTime, type EventCardData, type ApiAnnouncement } from "../events";
import { updateEvent, uploadEventImage } from "../admin";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "../api";
import { sendMessage } from "../chat";
import { fetchMatches, type MatchSummary } from "../swipe";

export function EventDetailPage({ eventId, onBack, onQR }: { eventId: string; onBack: () => void; onQR: () => void }) {
  const { user } = useAuth();
  const [ev, setEv] = useState<EventCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [evTab, setEvTab] = useState<"info"|"chat"|"announce">("info");
  const [evMsgs, setEvMsgs] = useState([{ id: "1", from: "ธนกร", text: "พร้อมแล้ว เจอกันงาน!" }, { id: "2", from: "นลินี", text: "มาแน่นอนค่ะ 💪" }]);
  const [evInput, setEvInput] = useState("");
  const [announcements, setAnnouncements] = useState<ApiAnnouncement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [showEditForm, setShowEditForm] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTimeStart, setEditTimeStart] = useState("18:00");
  const [editTimeEnd, setEditTimeEnd] = useState("20:00");
  const [editMaxCapacity, setEditMaxCapacity] = useState("");
  const [editCover, setEditCover] = useState("");
  const [editCoverPos, setEditCoverPos] = useState({ x: 50, y: 50 });
  const [editImages, setEditImages] = useState<string[]>([]);
  const [coverUploading, setCoverUploading] = useState(false);
  const [imagesUploading, setImagesUploading] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");
  const coverDragRef = React.useRef<{ x: number; y: number; startPos: { x: number; y: number } } | null>(null);
  const [announceText, setAnnounceText] = useState("");
  const [announceSending, setAnnounceSending] = useState(false);
  const [announceError, setAnnounceError] = useState("");
  const [showShare, setShowShare] = useState(false);
  const [shareMatches, setShareMatches] = useState<MatchSummary[]>([]);
  const [shareMatchesLoading, setShareMatchesLoading] = useState(false);
  const [shareSendingId, setShareSendingId] = useState<string | null>(null);
  const [shareSentIds, setShareSentIds] = useState<string[]>([]);
  const [shareError, setShareError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getEvent(eventId)
      .then(srv => {
        setEv(toEventCard(srv));
        setJoined(!!user && (srv.members ?? []).some(m => m.userId === user.id));
      })
      .catch(() => setError("โหลดข้อมูลกิจกรรมไม่สำเร็จ"))
      .finally(() => setLoading(false));
    setAnnouncementsLoading(true);
    fetchAnnouncements(eventId)
      .then(setAnnouncements)
      .catch(() => {})
      .finally(() => setAnnouncementsLoading(false));
  }, [eventId, user]);

  const handleJoinToggle = async () => {
    if (joined) { setJoined(false); return; }
    setJoinError("");
    try {
      await joinEvent(eventId);
      setJoined(true);
      setEv(prev => prev ? { ...prev, participants: prev.participants + 1 } : prev);
    } catch (e) {
      if (e instanceof ApiError && e.message.includes("เข้าร่วม Event นี้แล้ว")) { setJoined(true); return; }
      setJoinError(e instanceof Error ? e.message : "เข้าร่วมกิจกรรมไม่สำเร็จ");
    }
  };

  const openShare = () => {
    setShareError("");
    setShareSentIds([]);
    setShowShare(true);
    setShareMatchesLoading(true);
    fetchMatches().then(setShareMatches).catch(() => setShareError("โหลดรายชื่อเพื่อนไม่สำเร็จ")).finally(() => setShareMatchesLoading(false));
  };
  const doShare = async (matchId: string) => {
    setShareSendingId(matchId);
    setShareError("");
    try {
      await sendMessage("match", matchId, `[[event:${eventId}]]`);
      setShareSentIds(p => [...p, matchId]);
    } catch (e) {
      setShareError(e instanceof Error ? e.message : "แชร์ไม่สำเร็จ");
    } finally {
      setShareSendingId(null);
    }
  };

  const canManage = !!user && (user.id === ev?.organizerId || user.role === "admin");
  const isOrganizer = !!user && user.id === ev?.organizerId;
  const isFull = !!ev && ev.participants >= ev.max;
  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteEvent(eventId);
      onBack();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "ลบกิจกรรมไม่สำเร็จ");
      setDeleting(false);
    }
  };

  const isoToLocalDateStr = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const isoToLocalTimeStr = (iso: string) => new Date(iso).toTimeString().slice(0, 5);

  const openEditForm = async () => {
    setEditError("");
    try {
      const srv = await getEvent(eventId);
      setEditTitle(srv.title);
      setEditDesc(srv.description ?? "");
      setEditDate(isoToLocalDateStr(srv.startTime));
      setEditTimeStart(isoToLocalTimeStr(srv.startTime));
      setEditTimeEnd(isoToLocalTimeStr(srv.endTime));
      setEditMaxCapacity(srv.maxCapacity ? String(srv.maxCapacity) : "");
      setEditCover(srv.coverUrl ?? "");
      setEditCoverPos({ x: srv.coverPosX ?? 50, y: srv.coverPosY ?? 50 });
      setEditImages(srv.images ?? []);
      setShowEditForm(true);
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "โหลดข้อมูลกิจกรรมไม่สำเร็จ");
    }
  };

  const onCoverPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    coverDragRef.current = { x: e.clientX, y: e.clientY, startPos: editCoverPos };
  };
  const onCoverPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!coverDragRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = ((e.clientX - coverDragRef.current.x) / rect.width) * 100;
    const dy = ((e.clientY - coverDragRef.current.y) / rect.height) * 100;
    const clamp = (n: number) => Math.max(0, Math.min(100, n));
    setEditCoverPos({ x: clamp(coverDragRef.current.startPos.x - dx), y: clamp(coverDragRef.current.startPos.y - dy) });
  };
  const onCoverPointerUp = () => { coverDragRef.current = null; };

  const onEditCoverFileChange = async (file: File | undefined) => {
    if (!file) return;
    setCoverUploading(true);
    setEditError("");
    try {
      const url = await uploadEventImage(file);
      setEditCover(url);
      setEditCoverPos({ x: 50, y: 50 });
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "อัปโหลดรูปไม่สำเร็จ");
    } finally {
      setCoverUploading(false);
    }
  };
  const addEditImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setImagesUploading(true);
    setEditError("");
    try {
      const urls = await Promise.all(Array.from(files).map(f => uploadEventImage(f)));
      setEditImages(prev => [...prev, ...urls]);
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "อัปโหลดรูปไม่สำเร็จ");
    } finally {
      setImagesUploading(false);
    }
  };
  const removeEditImage = (idx: number) => setEditImages(prev => prev.filter((_, i) => i !== idx));

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editDate || !editCover) {
      setEditError("กรุณากรอกข้อมูลให้ครบและแนบรูปปก");
      return;
    }
    setEditSubmitting(true);
    setEditError("");
    try {
      const updated = await updateEvent(eventId, {
        title: editTitle.trim(),
        description: editDesc || undefined,
        startTime: new Date(`${editDate}T${editTimeStart}:00`).toISOString(),
        endTime: new Date(`${editDate}T${editTimeEnd}:00`).toISOString(),
        maxCapacity: editMaxCapacity ? Number(editMaxCapacity) : undefined,
        coverUrl: editCover,
        coverPosX: editCoverPos.x,
        coverPosY: editCoverPos.y,
        images: editImages,
      });
      setEv(toEventCard(updated));
      setShowEditForm(false);
    } catch (e) {
      setEditError(e instanceof ApiError ? e.message : "แก้ไขกิจกรรมไม่สำเร็จ");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleSendAnnouncement = async () => {
    if (!announceText.trim()) return;
    setAnnounceSending(true);
    setAnnounceError("");
    try {
      const created = await sendAnnouncement(eventId, announceText.trim());
      setAnnouncements(p => [created, ...p]);
      setAnnounceText("");
    } catch (e) {
      setAnnounceError(e instanceof ApiError ? e.message : "ส่งประกาศไม่สำเร็จ");
    } finally {
      setAnnounceSending(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (error || !ev) return <div className="flex flex-col items-center justify-center h-full gap-3 p-6"><p className="text-sm text-muted-foreground">{error || "ไม่พบกิจกรรม"}</p><button onClick={onBack} className="text-sm font-bold text-green-600">กลับ</button></div>;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="relative h-48 bg-gray-200 shrink-0">
        <img src={ev.cover} alt={ev.title} style={{ objectPosition: `${ev.coverPos.x}% ${ev.coverPos.y}%` }} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
        <button onClick={onBack} className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/50"><ChevronLeft size={22} /></button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={openShare} className="bg-black/30 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/50" title="แชร์ให้เพื่อน"><Share2 size={19} /></button>
          {canManage && (
            <>
              <button onClick={openEditForm} className="bg-black/30 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/50" title="แก้ไขกิจกรรม"><Edit3 size={19} /></button>
              <button onClick={() => setShowDeleteDialog(true)} className="bg-black/30 backdrop-blur-sm text-white p-2 rounded-full hover:bg-red-600/80" title="ลบกิจกรรม"><Trash2 size={19} /></button>
            </>
          )}
        </div>
        <div className="absolute bottom-4 left-5 right-5"><h1 className="text-xl font-black text-white leading-tight">{ev.title}</h1><p className="text-white/60 text-sm mt-0.5">จัดโดย {ev.organizer}</p></div>
      </div>
      <div className="border-b border-border shrink-0 bg-white">
        <div className="flex">{([["info","รายละเอียด"],["chat","แชทกลุ่ม"],["announce","ประกาศ"]] as const).map(([tab,label])=><button key={tab} onClick={()=>setEvTab(tab)} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${evTab===tab?"border-green-600 text-green-700":"border-transparent text-muted-foreground"}`}>{label}</button>)}</div>
      </div>
      {evTab === "info" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-white rounded-2xl border border-border divide-y divide-border overflow-hidden">
            {([[<CalendarDays size={17} className="text-green-600" />, ev.time ? `${ev.date} · ${ev.time}` : ev.date],[<MapPin size={17} className="text-green-600" />, ev.venue],[<Users size={17} className="text-green-600" />, `${ev.participants.toLocaleString()} / ${ev.max.toLocaleString()} คน`],[<Megaphone size={17} className="text-green-600" />, `จัดโดย ${ev.organizer}`]] as [React.ReactNode,string][]).map(([icon,text],i)=>(
              <div key={i} className="flex items-center gap-3 px-4 py-3.5 text-sm"><span className="shrink-0">{icon}</span><span className="font-medium text-gray-800">{text}</span></div>
            ))}
          </div>
          <PBar cur={ev.participants} max={ev.max} />
          <div className="bg-white rounded-2xl border border-border p-4">
            <p className="text-sm font-bold mb-2">กีฬาในงาน</p>
            <div className="flex flex-wrap gap-2">{ev.sports.map(s=>{const sp=SPORTS.find(x=>x.name===s);return sp?<SportBadge key={s} emoji={sp.emoji} name={s}/>:<SportBadge key={s} emoji="🏅" name={s}/>;})}</div>
          </div>
          <div className="bg-white rounded-2xl border border-border p-4">
            <p className="text-sm font-bold mb-2">รายละเอียด</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ev.desc}</p>
          </div>
          {ev.images.length > 0 && (
            <div className="bg-white rounded-2xl border border-border p-4">
              <p className="text-sm font-bold mb-2">รายละเอียดเพิ่มเติม</p>
              <div className="grid grid-cols-3 gap-2">
                {ev.images.map((img, i) => (
                  <button key={i} type="button" onClick={() => setLightboxIdx(i)} className="aspect-square rounded-xl overflow-hidden border border-border cursor-zoom-in">
                    <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </button>
                ))}
              </div>
            </div>
          )}
          {joinError && <p className="text-red-500 text-xs">{joinError}</p>}
          {joined && <button onClick={onQR} className="w-full bg-green-50 border-2 border-green-300 text-green-700 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-100 transition-colors"><QrCode size={20} />แสดง QR Code สำหรับ Check-in</button>}
          {!isOrganizer && (
            <button onClick={handleJoinToggle} disabled={!joined && isFull} className={`w-full py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 ${joined?"bg-gray-100 text-gray-600 hover:bg-gray-200":"bg-green-600 text-white hover:bg-green-700"}`}>{joined?"ยกเลิกการเข้าร่วม":isFull?"กิจกรรมเต็มแล้ว":"สมัครเข้าร่วม Event"}</button>
          )}
        </div>
      )}
      {evTab === "chat" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/30">
            {evMsgs.map(msg=>(
              <div key={msg.id} className={`flex ${msg.from==="me"?"justify-end":"justify-start"} gap-2`}>
                {msg.from!=="me"&&<div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700 shrink-0">{msg.from[0]}</div>}
                <div className={`max-w-[72%] rounded-2xl px-3.5 py-2.5 text-sm ${msg.from==="me"?"bg-green-600 text-white rounded-br-sm":"bg-white text-gray-800 rounded-bl-sm shadow-sm border border-border"}`}>
                  {msg.from!=="me"&&<p className="text-xs font-bold text-green-600 mb-0.5">{msg.from}</p>}{msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border px-3 py-2.5 flex gap-2 shrink-0" style={{paddingBottom:"calc(0.625rem + env(safe-area-inset-bottom))"}}>
            <input value={evInput} onChange={e=>setEvInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&evInput.trim()){setEvMsgs(p=>[...p,{id:Date.now().toString(),from:"me",text:evInput}]);setEvInput("");}}} placeholder="พิมพ์ข้อความ..." className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm outline-none" />
            <button onClick={()=>{if(evInput.trim()){setEvMsgs(p=>[...p,{id:Date.now().toString(),from:"me",text:evInput}]);setEvInput("");}}} className="p-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700"><Send size={17}/></button>
          </div>
        </div>
      )}
      {evTab === "announce" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {canManage && (
            <div className="bg-white rounded-2xl border border-border p-4">
              <p className="text-sm font-bold mb-2">ส่งประกาศใหม่</p>
              {announceError && <p className="text-red-500 text-xs mb-2">{announceError}</p>}
              <textarea value={announceText} onChange={e => setAnnounceText(e.target.value)} rows={3} placeholder="พิมพ์ข้อความประกาศ..." className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500 resize-none" />
              <button onClick={handleSendAnnouncement} disabled={!announceText.trim() || announceSending} className="mt-2 w-full bg-green-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 disabled:opacity-40 flex items-center justify-center gap-2"><Send size={14} />{announceSending ? "กำลังส่ง..." : "ส่งประกาศ"}</button>
            </div>
          )}
          {announcementsLoading && <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>}
          {!announcementsLoading && announcements.map(a=>(
            <div key={a.id} className="bg-white rounded-2xl border border-border p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0"><Megaphone size={18} className="text-amber-600"/></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{a.message}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">{a.author.firstName} {a.author.lastName} · {relativeTime(a.createdAt)}</p>
                </div>
              </div>
            </div>
          ))}
          {!announcementsLoading && announcements.length === 0 && <p className="text-center text-sm text-muted-foreground py-10">ยังไม่มีประกาศ</p>}
        </div>
      )}
      {showEditForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 overflow-y-auto">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-xl my-auto">
            <h3 className="font-bold text-lg mb-4">แก้ไขกิจกรรม</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1.5">รูปปก *</label>
                <div
                  className="relative w-full h-36 rounded-xl overflow-hidden border border-border mb-1 bg-gray-100 cursor-grab active:cursor-grabbing select-none touch-none"
                  onPointerDown={onCoverPointerDown} onPointerMove={onCoverPointerMove} onPointerUp={onCoverPointerUp} onPointerLeave={onCoverPointerUp}
                >
                  {coverUploading ? (
                    <div className="w-full h-full flex items-center justify-center"><div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>
                  ) : editCover
                    ? <img src={editCover} draggable={false} style={{ objectPosition: `${editCoverPos.x}% ${editCoverPos.y}%` }} className="w-full h-full object-cover pointer-events-none" alt="" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-400 pointer-events-none"><Camera size={22} /></div>}
                </div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-green-600 cursor-pointer">{editCover ? "เปลี่ยนรูป" : "แนบรูปปก"}
                    <input type="file" accept="image/*" className="hidden" disabled={coverUploading} onChange={e => { const f = e.target.files?.[0]; onEditCoverFileChange(f); e.target.value = ""; }} />
                  </label>
                  {editCover && <span className="text-[11px] text-muted-foreground">ลากรูปเพื่อจัดตำแหน่ง</span>}
                </div>
              </div>
              <div><label className="text-sm font-bold text-gray-700 block mb-1.5">ชื่อกิจกรรม</label><input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500" /></div>
              <div><label className="text-sm font-bold text-gray-700 block mb-1.5">รายละเอียด</label><textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3} className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500 resize-none" /></div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1.5">รูปเพิ่มเติม (หลายรูป)</label>
                <div className="grid grid-cols-4 gap-2">
                  {editImages.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                      <img src={img} className="w-full h-full object-cover" alt="" />
                      <button type="button" onClick={() => removeEditImage(i)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={11} /></button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-gray-400 cursor-pointer hover:border-green-400 hover:text-green-500">
                    {imagesUploading ? <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /> : <Plus size={16} />}
                    <span className="text-[10px] font-semibold">เพิ่มรูป</span>
                    <input type="file" accept="image/*" multiple className="hidden" disabled={imagesUploading} onChange={e => { addEditImages(e.target.files); e.target.value = ""; }} />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-bold text-gray-700 block mb-1.5">วันที่</label><ThaiDateField value={editDate} onChange={setEditDate} /></div>
                <div><label className="text-sm font-bold text-gray-700 block mb-1.5">จำนวนสูงสุด</label><input type="number" min={1} value={editMaxCapacity} onChange={e => setEditMaxCapacity(e.target.value)} className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-bold text-gray-700 block mb-1.5">เวลาเริ่ม</label><ThaiTimeField value={editTimeStart} onChange={setEditTimeStart} /></div>
                <div><label className="text-sm font-bold text-gray-700 block mb-1.5">เวลาสิ้นสุด</label><ThaiTimeField value={editTimeEnd} onChange={setEditTimeEnd} /></div>
              </div>
              {editError && <p className="text-red-500 text-xs">{editError}</p>}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowEditForm(false)} disabled={editSubmitting} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50">ยกเลิก</button>
              <button onClick={handleSaveEdit} disabled={editSubmitting || coverUploading || imagesUploading} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-50">{editSubmitting ? "กำลังบันทึก..." : "บันทึก"}</button>
            </div>
          </div>
        </div>
      )}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-lg mb-1">🗑️ ลบกิจกรรม</h3>
            <p className="text-sm text-muted-foreground mb-4">กิจกรรมนี้จะถูกลบออกจากระบบถาวรและไม่สามารถกู้คืนได้</p>
            {deleteError && <p className="text-red-500 text-xs mb-3">{deleteError}</p>}
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteDialog(false)} disabled={deleting} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50">ยกเลิก</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50">ยืนยันลบ</button>
            </div>
          </div>
        </div>
      )}
      {lightboxIdx !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightboxIdx(null)}>
          <button onClick={() => setLightboxIdx(null)} className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10"><X size={24} /></button>
          {ev.images.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i! - 1 + ev.images.length) % ev.images.length); }} className="absolute left-2 sm:left-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10"><ChevronLeft size={28} /></button>
              <button onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i! + 1) % ev.images.length); }} className="absolute right-2 sm:right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10"><ChevronRight size={28} /></button>
            </>
          )}
          <img src={ev.images[lightboxIdx]} alt="" onClick={e => e.stopPropagation()} className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg" />
          {ev.images.length > 1 && <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/70 text-xs font-bold">{lightboxIdx + 1} / {ev.images.length}</div>}
        </div>
      )}
      {showShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setShowShare(false)}>
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3"><h3 className="font-bold text-lg">แชร์กิจกรรมให้เพื่อน</h3><button onClick={() => setShowShare(false)}><X size={18} className="text-gray-400" /></button></div>
            {shareError && <p className="text-red-500 text-xs mb-2">{shareError}</p>}
            {shareMatchesLoading && <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>}
            {!shareMatchesLoading && shareMatches.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">ยังไม่มี Match ให้แชร์</p>}
            <div className="flex-1 overflow-y-auto space-y-1.5">
              {shareMatches.map(m => (
                <div key={m.matchId} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50">
                  <Av src={m.user.photos[0]?.url ?? ""} name={m.user.nickname || m.user.firstName} size="sm" />
                  <span className="flex-1 text-sm font-semibold truncate">{m.user.nickname || `${m.user.firstName} ${m.user.lastName}`}</span>
                  {shareSentIds.includes(m.matchId) ? (
                    <span className="text-xs font-bold text-green-600">ส่งแล้ว</span>
                  ) : (
                    <button onClick={() => doShare(m.matchId)} disabled={shareSendingId === m.matchId} className="text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg disabled:opacity-50">{shareSendingId === m.matchId ? "กำลังส่ง..." : "แชร์"}</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
