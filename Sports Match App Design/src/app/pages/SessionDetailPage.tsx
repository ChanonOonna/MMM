import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Users, Send, Flag, ChevronLeft, UserX, Navigation, Share2, X, Edit3 } from "lucide-react";
import { Av, LvBadge, PBar, PageHd, ThaiDateField, ThaiTimeField } from "../components/shared";
import { fetchSports, fetchVenues, sportEmoji, type ApiSport, type ApiVenue } from "../catalog";
import {
  fetchSession,
  joinSession,
  kickMember,
  leaveSession,
  updateSession,
  type SessionDetail as ApiSessionDetail,
} from "../sessions";
import { fetchMessages, sendMessage, type ChatMessage } from "../chat";
import { getSocket } from "../socket";
import { useAuth } from "../auth/AuthContext";
import { fetchMatches, type MatchSummary } from "../swipe";
import { ApiError } from "../api";

const LEVEL_OPTIONS = [
  { id: "beginner", name: "ผู้เริ่มต้น" },
  { id: "intermediate", name: "ระดับกลาง" },
  { id: "advanced", name: "ระดับสูง" },
  { id: "competitive", name: "แข่งขัน" },
];

const LEVEL_LABEL: Record<string, string> = { beginner: "ผู้เริ่มต้น", intermediate: "ระดับกลาง", advanced: "ระดับสูง", competitive: "แข่งขัน" };
const LEVEL_COLOR: Record<string, string> = { beginner: "bg-emerald-100 text-emerald-700", intermediate: "bg-blue-100 text-blue-700", advanced: "bg-amber-100 text-amber-700", competitive: "bg-pink-100 text-pink-700" };

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("th-TH-u-ca-buddhist", { day: "numeric", month: "short", year: "2-digit" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function VenueMapPanel({ venue, coords, onBack }: { venue: string; coords?: { lat: number; lng: number } | null; onBack: () => void }) {
  const target = coords ? `${coords.lat},${coords.lng}` : `${venue} มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตกำแพงแสน`;
  const embedSrc = `https://www.google.com/maps?q=${encodeURIComponent(target)}&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(target)}`;
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-border shrink-0 flex items-center gap-2">
        <button onClick={onBack} className="lg:hidden p-1 -ml-1 text-gray-500 shrink-0"><ChevronLeft size={18} /></button>
        <div className="min-w-0">
          <p className="font-bold text-sm">แผนที่</p>
          <p className="text-xs text-muted-foreground truncate">{venue}</p>
        </div>
      </div>
      <div className="flex-1 relative bg-gray-100">
        <iframe title="venue-map" src={embedSrc} className="absolute inset-0 w-full h-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      </div>
      <div className="border-t border-border p-3 shrink-0" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}>
        <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors active:scale-[0.98]">
          <Navigation size={16} /> นำทาง
        </a>
      </div>
    </div>
  );
}

export function SessionDetailPage({ sessionId, onBack, onReport }: { sessionId: string; onBack: () => void; onReport?: () => void }) {
  const { user } = useAuth();
  const [s, setS] = useState<ApiSessionDetail | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"info"|"chat">("info");
  const [rightPanel, setRightPanel] = useState<"chat"|"map">("chat");
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [leaveReason, setLeaveReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [cm, setCm] = useState<ChatMessage[]>([]);
  const [ci, setCi] = useState("");
  const [showShare, setShowShare] = useState(false);
  const [shareMatches, setShareMatches] = useState<MatchSummary[]>([]);
  const [shareMatchesLoading, setShareMatchesLoading] = useState(false);
  const [shareSendingId, setShareSendingId] = useState<string | null>(null);
  const [shareSentIds, setShareSentIds] = useState<string[]>([]);
  const [shareError, setShareError] = useState("");
  const [apiSports, setApiSports] = useState<ApiSport[]>([]);
  const [apiVenues, setApiVenues] = useState<ApiVenue[]>([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editSportId, setEditSportId] = useState("");
  const [editVenueId, setEditVenueId] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTimeStart, setEditTimeStart] = useState("18:00");
  const [editTimeEnd, setEditTimeEnd] = useState("20:00");
  const [editMaxPlayers, setEditMaxPlayers] = useState("4");
  const [editLevel, setEditLevel] = useState(LEVEL_OPTIONS[0].id);
  const [editEquip, setEditEquip] = useState(true);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  const refetch = () => fetchSession(sessionId).then(setS).catch(() => setError("โหลดข้อมูล Session ไม่สำเร็จ"));

  useEffect(() => { refetch(); }, [sessionId]);

  const isMemberNow = !!s && s.members.some(m => !m.leftAt && m.userId === user?.id);

  useEffect(() => {
    if (!isMemberNow) { setCm([]); return; }
    fetchMessages("session", sessionId).then(msgs => setCm([...msgs].reverse())).catch(() => {});
    const socket = getSocket();
    const roomKey = `session:${sessionId}`;
    socket.emit("join_room", roomKey);
    const onNewMessage = (msg: ChatMessage) => { if (msg.roomId === sessionId) setCm(p => [...p, msg]); };
    const onUnsent = ({ id }: { id: string }) => setCm(p => p.map(m => m.id === id ? { ...m, content: "ข้อความถูกยกเลิก", deletedAt: new Date().toISOString() } : m));
    socket.on("new_message", onNewMessage);
    socket.on("message_unsent", onUnsent);
    return () => {
      socket.emit("leave_room", roomKey);
      socket.off("new_message", onNewMessage);
      socket.off("message_unsent", onUnsent);
    };
  }, [sessionId, isMemberNow]);

  if (error) return <div className="p-6 text-center text-sm text-red-500">{error}</div>;
  if (!s) return <div className="flex-1 flex items-center justify-center h-full"><div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>;

  const isHost = user?.id === s.hostUserId;
  const activeMembers = s.members.filter(m => !m.leftAt);
  const isMember = activeMembers.some(m => m.userId === user?.id);
  const nameOf = (u: { firstName: string; lastName: string; nickname: string | null }) => u.nickname || u.firstName;

  const doJoin = async () => {
    setBusy(true);
    try { await joinSession(s.id); await refetch(); } catch (e: any) { setError(e.message ?? "เข้าร่วมไม่สำเร็จ"); }
    finally { setBusy(false); }
  };
  const doLeave = async () => {
    setBusy(true);
    try {
      await leaveSession(s.id, leaveReason || undefined);
      setShowLeaveDialog(false); setLeaveReason("");
      await refetch();
    } catch (e: any) { setError(e.message ?? "ออกจาก Session ไม่สำเร็จ"); }
    finally { setBusy(false); }
  };
  const doKick = async (targetUserId: string) => {
    try { await kickMember(s.id, targetUserId); await refetch(); } catch (e: any) { setError(e.message ?? "Kick ไม่สำเร็จ"); }
  };
  const doSend = async () => {
    const text = ci.trim();
    if (!text) return;
    setCi("");
    try { await sendMessage("session", s.id, text); } catch { /* socket broadcast still covers success case */ }
  };

  const openEditForm = () => {
    if (!s) return;
    setEditTitle(s.title);
    setEditSportId(s.sportId);
    setEditVenueId(s.venueId);
    setEditDate(s.startTime.slice(0, 10));
    setEditTimeStart(fmtTime(s.startTime));
    setEditTimeEnd(fmtTime(s.endTime));
    setEditMaxPlayers(String(s.maxPlayers));
    setEditLevel(s.skillLevel);
    setEditEquip(s.equipmentRequired);
    setEditError("");
    setShowEditForm(true);
    if (apiSports.length === 0 || apiVenues.length === 0) {
      Promise.all([fetchSports(), fetchVenues()]).then(([sp, ve]) => { setApiSports(sp); setApiVenues(ve); }).catch(() => {});
    }
  };
  const handleSaveEdit = async () => {
    if (!s || !editTitle.trim() || !editSportId || !editVenueId || !editDate) {
      setEditError("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    setEditSubmitting(true);
    setEditError("");
    try {
      await updateSession(s.id, {
        sportId: editSportId,
        venueId: editVenueId,
        title: editTitle.trim(),
        skillLevel: editLevel as any,
        equipmentRequired: editEquip,
        maxPlayers: Number(editMaxPlayers),
        startTime: new Date(`${editDate}T${editTimeStart}:00`).toISOString(),
        endTime: new Date(`${editDate}T${editTimeEnd}:00`).toISOString(),
      });
      setShowEditForm(false);
      await refetch();
    } catch (e) {
      setEditError(e instanceof ApiError ? e.message : "แก้ไข Session ไม่สำเร็จ");
    } finally {
      setEditSubmitting(false);
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
      await sendMessage("match", matchId, `[[session:${s.id}]]`);
      setShareSentIds(p => [...p, matchId]);
    } catch (e) {
      setShareError(e instanceof Error ? e.message : "แชร์ไม่สำเร็จ");
    } finally {
      setShareSendingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHd title={s.title} onBack={onBack} right={
        <div className="flex items-center gap-1">
          <button onClick={openShare} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500" title="แชร์ให้เพื่อน"><Share2 size={18} /></button>
          {isHost && <button onClick={openEditForm} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500" title="แก้ไขห้อง"><Edit3 size={18} /></button>}
          <button onClick={onReport} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><Flag size={18} /></button>
        </div>
      } />
      <div className="lg:hidden border-b border-border shrink-0">
        <div className="flex">{(["info","chat"] as const).map(x => <button key={x} onClick={() => setActiveTab(x)} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === x ? "border-green-600 text-green-700" : "border-transparent text-muted-foreground"}`}>{x === "info" ? "รายละเอียด" : rightPanel === "map" ? "แผนที่" : "แชทกลุ่ม"}</button>)}</div>
      </div>
      <div className="flex-1 overflow-hidden flex">
        <div className={`${activeTab === "info" ? "flex" : "hidden"} lg:flex flex-col lg:w-1/2 lg:border-r lg:border-border overflow-y-auto p-4`}>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 mb-4 flex items-center gap-4 border border-green-100">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-sm">{sportEmoji(s.sport.name, s.sport.icon)}</div>
            <div><LvBadge name={LEVEL_LABEL[s.skillLevel]} color={LEVEL_COLOR[s.skillLevel]} /><h2 className="font-black text-xl mt-1">{s.title}</h2></div>
          </div>
          <div className="bg-white rounded-2xl border border-border divide-y divide-border mb-4 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 text-sm"><span className="shrink-0"><CalendarDays size={17} className="text-green-600" /></span><span className="font-medium text-gray-800">{fmtDate(s.startTime)} · {fmtTime(s.startTime)}-{fmtTime(s.endTime)}</span></div>
            <button onClick={() => { setRightPanel("map"); setActiveTab("chat"); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-green-50/60 transition-colors text-left">
              <span className="shrink-0"><MapPin size={17} className="text-green-600" /></span>
              <span className="font-medium text-gray-800 flex-1">{s.venue.name}</span>
              <span className="text-xs font-bold text-green-600">ดูแผนที่ →</span>
            </button>
            <div className="flex items-center gap-3 px-4 py-3 text-sm"><span className="shrink-0"><Users size={17} className="text-green-600" /></span><span className="font-medium text-gray-800">{s.currentPlayers}/{s.maxPlayers} คน</span></div>
          </div>
          <PBar cur={s.currentPlayers} max={s.maxPlayers} className="mb-4" />
          <div className="bg-white rounded-2xl border border-border p-4 mb-4">
            <p className="text-sm font-bold mb-3">สมาชิก ({activeMembers.length} คน)</p>
            <div className="space-y-2">
              {activeMembers.map((m) => (
                <div key={m.id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                  <Av src={m.user.photos[0]?.url ?? ""} name={nameOf(m.user)} size="xs" />
                  <span className="text-xs font-semibold flex-1">{nameOf(m.user)}</span>
                  {m.userId === s.hostUserId && <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">เจ้าของ</span>}
                  {m.userId !== s.hostUserId && isHost && (
                    <button onClick={() => doKick(m.userId)} className="p-1 hover:bg-red-50 rounded-lg text-red-400 transition-colors" title="Kick"><UserX size={13} /></button>
                  )}
                </div>
              ))}
            </div>
          </div>
          {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
          {showLeaveDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
              <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl">
                <h3 className="font-bold text-lg mb-1">{isHost ? "⚠️ ยุบ Session" : "ออกจาก Session"}</h3>
                <p className="text-sm text-muted-foreground mb-4">{isHost ? "การออกในฐานะเจ้าของจะยุบ Session และแจ้งสมาชิกทุกคน" : "กรุณาระบุเหตุผลที่ออก"}</p>
                <textarea value={leaveReason} onChange={e => setLeaveReason(e.target.value)} rows={3} placeholder="เช่น ติดธุระ ไม่สะดวกมา..." className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-400 resize-none mb-4" />
                <div className="flex gap-2">
                  <button onClick={() => setShowLeaveDialog(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-gray-600 hover:bg-gray-50">ยกเลิก</button>
                  <button onClick={doLeave} disabled={busy} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50">{isHost ? "ยุบ Session" : "ยืนยันออก"}</button>
                </div>
              </div>
            </div>
          )}
          {s.status === "cancelled" ? (
            <p className="text-center text-sm text-red-500 font-bold py-3">Session นี้ถูกยกเลิกแล้ว</p>
          ) : (
            <button onClick={() => isMember ? setShowLeaveDialog(true) : doJoin()} disabled={busy || (!isMember && s.status !== "open")} className={`w-full py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 ${isMember ? isHost ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-green-600 text-white hover:bg-green-700"}`}>
              {isMember ? (isHost ? "ยุบ Session (ออกในฐานะเจ้าของ)" : "ออกจาก Session") : s.status === "open" ? "เข้าร่วม Session" : "Session เต็มแล้ว"}
            </button>
          )}
        </div>
        <div className={`${activeTab === "chat" ? "flex" : "hidden"} lg:flex flex-col lg:flex-1 overflow-hidden`}>
          {rightPanel === "map" ? (
            <VenueMapPanel venue={s.venue.name} coords={s.venue.lat != null && s.venue.lng != null ? { lat: s.venue.lat, lng: s.venue.lng } : null} onBack={() => setRightPanel("chat")} />
          ) : !isMember ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="text-sm text-muted-foreground">เข้าร่วม Session ก่อน ถึงจะเห็นแชทกลุ่มได้</p>
              {s.status === "open" && (
                <button onClick={doJoin} disabled={busy} className="px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-50">เข้าร่วม Session</button>
              )}
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-border shrink-0"><p className="font-bold text-sm">แชทกลุ่ม</p><p className="text-xs text-muted-foreground">{activeMembers.length} สมาชิก</p></div>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/30">
                {cm.map(msg => {
                  const mine = msg.senderId === user?.id;
                  const sender = s.members.find(m => m.userId === msg.senderId)?.user;
                  return (
                    <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"} gap-2`}>
                      {!mine && <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700 shrink-0">{sender ? nameOf(sender)[0] : "?"}</div>}
                      <div className={`max-w-[72%] rounded-2xl px-3.5 py-2.5 text-sm ${mine ? "bg-green-600 text-white rounded-br-sm" : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-border"}`}>
                        {!mine && sender && <p className="text-xs font-bold text-green-600 mb-0.5">{nameOf(sender)}</p>}
                        {msg.deletedAt ? <span className="italic opacity-70">ข้อความถูกยกเลิก</span> : msg.content}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-border px-3 py-2.5 flex gap-2 shrink-0" style={{ paddingBottom: "calc(0.625rem + env(safe-area-inset-bottom))" }}>
                <input value={ci} onChange={e => setCi(e.target.value)} onKeyDown={e => { if (e.key === "Enter") doSend(); }} placeholder="พิมพ์ข้อความ..." className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm outline-none" />
                <button onClick={doSend} className="p-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"><Send size={17} /></button>
              </div>
            </>
          )}
        </div>
      </div>
      {showShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setShowShare(false)}>
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3"><h3 className="font-bold text-lg">แชร์ห้องให้เพื่อน</h3><button onClick={() => setShowShare(false)}><X size={18} className="text-gray-400" /></button></div>
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
      {showEditForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 overflow-y-auto">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-xl my-auto">
            <h3 className="font-bold text-lg mb-4">แก้ไขห้องทั่วไป</h3>
            <div className="space-y-3">
              <div><label className="text-sm font-bold text-gray-700 block mb-1.5">กีฬา</label><select value={editSportId} onChange={e => setEditSportId(e.target.value)} className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500">{apiSports.map(sp => <option key={sp.id} value={sp.id}>{sportEmoji(sp.name, sp.icon)} {sp.name}</option>)}</select></div>
              <div><label className="text-sm font-bold text-gray-700 block mb-1.5">ชื่อห้อง</label><input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-bold text-gray-700 block mb-1.5">วันที่</label><ThaiDateField value={editDate} onChange={setEditDate} /></div>
                <div><label className="text-sm font-bold text-gray-700 block mb-1.5">จำนวนสูงสุด</label><input type="number" min={2} max={50} value={editMaxPlayers} onChange={e => setEditMaxPlayers(e.target.value)} className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-bold text-gray-700 block mb-1.5">เวลาเริ่ม</label><ThaiTimeField value={editTimeStart} onChange={setEditTimeStart} /></div>
                <div><label className="text-sm font-bold text-gray-700 block mb-1.5">เวลาสิ้นสุด</label><ThaiTimeField value={editTimeEnd} onChange={setEditTimeEnd} /></div>
              </div>
              <div><label className="text-sm font-bold text-gray-700 block mb-1.5">สถานที่</label><select value={editVenueId} onChange={e => setEditVenueId(e.target.value)} className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500">{apiVenues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></div>
              <div><label className="text-sm font-bold text-gray-700 block mb-1.5">ระดับ</label><select value={editLevel} onChange={e => setEditLevel(e.target.value)} className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500">{LEVEL_OPTIONS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
              <div className="flex items-center justify-between bg-gray-50 border border-border rounded-xl p-3.5">
                <p className="text-sm font-bold">ต้องใช้อุปกรณ์</p>
                <button onClick={() => setEditEquip(v => !v)} className={`w-12 h-6 rounded-full relative transition-colors ${editEquip ? "bg-green-600" : "bg-gray-300"}`}><span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${editEquip ? "right-1" : "left-1"}`} /></button>
              </div>
              {editError && <p className="text-red-500 text-xs">{editError}</p>}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowEditForm(false)} disabled={editSubmitting} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50">ยกเลิก</button>
              <button onClick={handleSaveEdit} disabled={editSubmitting} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-50">{editSubmitting ? "กำลังบันทึก..." : "บันทึก"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
