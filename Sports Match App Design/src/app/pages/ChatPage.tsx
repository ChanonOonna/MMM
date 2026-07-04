import { useEffect, useRef, useState } from "react";
import { CalendarDays, MapPin, Users, Send, Search, User, MoreVertical, Flag, Ban, ChevronLeft, RotateCcw } from "lucide-react";
import type { View } from "../types";
import { Av, MobileUtilityNav } from "../components/shared";
import { useAuth } from "../auth/AuthContext";
import { fetchMatches, blockMatchUser, type MatchSummary } from "../swipe";
import { fetchMessages, sendMessage, unsendMessage, type ChatMessage } from "../chat";
import { getSocket } from "../socket";
import { fetchSession, joinSession, type SessionDetail as ApiSessionDetail } from "../sessions";
import { getEvent, joinEvent, type ApiEvent } from "../events";

const SESSION_SHARE_RE = /^\[\[session:(.+)\]\]$/;
const EVENT_SHARE_RE = /^\[\[event:(.+)\]\]$/;

const LEVEL_LABEL: Record<string, string> = { beginner: "ผู้เริ่มต้น", intermediate: "ระดับกลาง", advanced: "ระดับสูง", competitive: "แข่งขัน" };

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("th-TH-u-ca-buddhist", { day: "numeric", month: "short", year: "2-digit" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function SessionShareCard({ sessionId, currentUserId }: { sessionId: string; currentUserId?: string }) {
  const [s, setS] = useState<ApiSessionDetail | null>(null);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  const load = () => fetchSession(sessionId).then(setS).catch(() => setError("ห้องนี้ไม่มีอยู่แล้ว"));
  useEffect(() => { load(); }, [sessionId]);

  if (error) return <div className="bg-white border-2 border-red-100 rounded-2xl p-4 max-w-[260px] text-xs text-red-500">{error}</div>;
  if (!s) return <div className="bg-white border-2 border-green-200 rounded-2xl p-4 max-w-[260px] shadow-sm"><div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>;

  const isMember = s.members.some(m => m.userId === currentUserId && !m.leftAt);
  const doJoin = async () => {
    setJoining(true);
    try { await joinSession(s.id); await load(); } catch (e) { setError(e instanceof Error ? e.message : "เข้าร่วมไม่สำเร็จ"); } finally { setJoining(false); }
  };

  return (
    <div className="bg-white border-2 border-green-200 rounded-2xl p-4 max-w-[260px] shadow-sm">
      <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center text-lg">🏸</div><span className="text-sm font-bold text-green-700">เชิญเข้าร่วมกิจกรรม</span></div>
      <p className="text-sm font-bold mb-1">{s.title}</p>
      <div className="text-xs text-muted-foreground space-y-0.5 mb-3">
        <div className="flex items-center gap-1"><CalendarDays size={11} />{fmtDate(s.startTime)} · {fmtTime(s.startTime)}–{fmtTime(s.endTime)}</div>
        <div className="flex items-center gap-1"><MapPin size={11} />{s.venue.name}</div>
        <div className="flex items-center gap-1"><Users size={11} />{s.currentPlayers}/{s.maxPlayers} คน · {LEVEL_LABEL[s.skillLevel]}</div>
      </div>
      {isMember ? (
        <div className="flex items-center gap-1.5 text-green-600 text-xs font-bold">เข้าร่วมแล้ว</div>
      ) : s.status !== "open" ? (
        <div className="text-xs font-bold text-muted-foreground">ห้องเต็มแล้ว</div>
      ) : (
        <button onClick={doJoin} disabled={joining} className="w-full bg-green-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">{joining ? "กำลังเข้าร่วม..." : "เข้าร่วม"}</button>
      )}
    </div>
  );
}

function EventShareCard({ eventId, currentUserId }: { eventId: string; currentUserId?: string }) {
  const [ev, setEv] = useState<ApiEvent | null>(null);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  const load = () => getEvent(eventId).then(setEv).catch(() => setError("กิจกรรมนี้ไม่มีอยู่แล้ว"));
  useEffect(() => { load(); }, [eventId]);

  if (error) return <div className="bg-white border-2 border-red-100 rounded-2xl p-4 max-w-[260px] text-xs text-red-500">{error}</div>;
  if (!ev) return <div className="bg-white border-2 border-green-200 rounded-2xl p-4 max-w-[260px] shadow-sm"><div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>;

  const isMember = (ev.members ?? []).some(m => m.userId === currentUserId);
  const isFull = ev.maxCapacity != null && (ev._count?.members ?? ev.members?.length ?? 0) >= ev.maxCapacity;
  const isPast = new Date(ev.endTime).getTime() < Date.now();
  const doJoin = async () => {
    setJoining(true);
    try { await joinEvent(ev.id); await load(); } catch (e) { setError(e instanceof Error ? e.message : "เข้าร่วมไม่สำเร็จ"); } finally { setJoining(false); }
  };

  return (
    <div className="bg-white border-2 border-green-200 rounded-2xl p-4 max-w-[260px] shadow-sm">
      <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center text-lg">🎉</div><span className="text-sm font-bold text-green-700">เชิญเข้าร่วมกิจกรรม</span></div>
      <p className="text-sm font-bold mb-1">{ev.title}</p>
      <div className="text-xs text-muted-foreground space-y-0.5 mb-3">
        <div className="flex items-center gap-1"><CalendarDays size={11} />{fmtDate(ev.startTime)} · {fmtTime(ev.startTime)}–{fmtTime(ev.endTime)}</div>
        <div className="flex items-center gap-1"><MapPin size={11} />{ev.venue.name}</div>
        <div className="flex items-center gap-1"><Users size={11} />{ev._count?.members ?? ev.members?.length ?? 0}{ev.maxCapacity != null ? `/${ev.maxCapacity}` : ""} คน</div>
      </div>
      {isMember ? (
        <div className="flex items-center gap-1.5 text-green-600 text-xs font-bold">เข้าร่วมแล้ว</div>
      ) : isPast ? (
        <div className="text-xs font-bold text-muted-foreground">กิจกรรมนี้จัดไปแล้ว</div>
      ) : isFull ? (
        <div className="text-xs font-bold text-muted-foreground">กิจกรรมเต็มแล้ว</div>
      ) : (
        <button onClick={doJoin} disabled={joining} className="w-full bg-green-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">{joining ? "กำลังเข้าร่วม..." : "เข้าร่วม"}</button>
      )}
    </div>
  );
}

export function ChatPage({ onNav }: { onNav: (v: View) => void }) {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [active, setActive] = useState("");
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [chatQ, setChatQ] = useState("");
  const [showChatSearch, setShowChatSearch] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const activeMatch = matches.find(m => m.matchId === active);

  const loadMatches = () => {
    setMatchesLoading(true);
    fetchMatches().then(setMatches).catch(() => {}).finally(() => setMatchesLoading(false));
  };
  useEffect(() => { loadMatches(); }, []);

  useEffect(() => {
    if (!active) { setMsgs([]); return; }
    setMsgsLoading(true);
    fetchMessages("match", active).then(list => setMsgs([...list].reverse())).catch(() => {}).finally(() => setMsgsLoading(false));
    const socket = getSocket();
    const roomKey = `match:${active}`;
    socket.emit("join_room", roomKey);
    const onNewMessage = (msg: ChatMessage) => { if (msg.roomId === active) setMsgs(p => [...p, msg]); };
    const onUnsent = ({ id }: { id: string }) => setMsgs(p => p.map(m => m.id === id ? { ...m, content: null, deletedAt: new Date().toISOString() } : m));
    socket.on("new_message", onNewMessage);
    socket.on("message_unsent", onUnsent);
    return () => {
      socket.emit("leave_room", roomKey);
      socket.off("new_message", onNewMessage);
      socket.off("message_unsent", onUnsent);
    };
  }, [active]);

  const sendMsg = async () => {
    const text = input.trim();
    if (!text || !active) return;
    setInput("");
    try { await sendMessage("match", active, text); } catch { /* socket broadcast still covers success case */ }
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 30);
  };

  const doUnsend = async (id: string) => {
    try { await unsendMessage(id); setMsgs(p => p.map(m => m.id === id ? { ...m, content: null, deletedAt: new Date().toISOString() } : m)); } catch { /* ignore */ }
  };

  const doBlock = async () => {
    if (!activeMatch) return;
    setShowChatMenu(false);
    try { await blockMatchUser(activeMatch.user.id); } catch { /* ignore */ }
    setMatches(p => p.filter(m => m.matchId !== activeMatch.matchId));
    setActive("");
  };

  const nameOf = (u: MatchSummary["user"]) => u.nickname || `${u.firstName} ${u.lastName}`;

  const matchList = (
    <div className={`flex flex-col bg-white border-r border-border ${active ? "hidden lg:flex w-full lg:w-80 shrink-0" : "flex w-full lg:w-80 shrink-0"}`}>
      <div className="sticky top-0 z-10 bg-white border-b border-border px-4 h-14 flex items-center justify-between shrink-0">
        <h2 className="font-bold text-lg">แชท</h2>
        <div className="flex items-center gap-1">
          <button onClick={() => { setShowChatSearch(v => !v); setChatQ(""); }} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"><Search size={19} /></button>
          <MobileUtilityNav onNav={onNav} />
        </div>
      </div>
      {showChatSearch && <div className="px-4 py-2 border-b border-border shrink-0"><input value={chatQ} onChange={e => setChatQ(e.target.value)} autoFocus placeholder="ค้นหาแชท..." className="w-full bg-gray-100 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-green-200" /></div>}
      <div className="flex-1 overflow-y-auto divide-y divide-border">
        {matchesLoading && <div className="flex justify-center py-10"><div className="w-7 h-7 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>}
        {!matchesLoading && matches.filter(m => !chatQ || nameOf(m.user).includes(chatQ)).map(m => (
          <button key={m.matchId} onClick={() => setActive(m.matchId)} className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${active === m.matchId ? "bg-green-50" : "hover:bg-gray-50"}`}>
            <Av src={m.user.photos[0]?.url ?? ""} name={nameOf(m.user)} size="md" />
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-sm text-gray-900">{nameOf(m.user)}</span>
            </div>
          </button>
        ))}
        {!matchesLoading && matches.length === 0 && <p className="text-center text-sm text-muted-foreground py-10">ยังไม่มี Match</p>}
      </div>
    </div>
  );
  const conversation = (
    <div className={`flex-1 flex flex-col overflow-hidden ${active ? "flex" : "hidden lg:flex"}`}>
      {!active ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-center p-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"><Search size={28} className="text-gray-400" /></div>
          <h3 className="font-semibold text-gray-500">เลือกการสนทนา</h3>
          <p className="text-sm text-muted-foreground mt-1">กดที่รายชื่อ Match เพื่อเริ่มแชท</p>
        </div>
      ) : activeMatch ? (
        <>
          <div className="sticky top-0 z-10 bg-white border-b border-border h-14 px-3 flex items-center gap-2 shrink-0">
            <button onClick={() => setActive("")} className="lg:hidden p-1.5 rounded-xl hover:bg-gray-100"><ChevronLeft size={22} /></button>
            <Av src={activeMatch.user.photos[0]?.url ?? ""} name={nameOf(activeMatch.user)} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{nameOf(activeMatch.user)}</p>
            </div>
            <button onClick={() => onNav("profile-other")} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><User size={18} /></button>
            <div className="relative">
              <button onClick={() => setShowChatMenu(v => !v)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><MoreVertical size={18} /></button>
              {showChatMenu && (
                <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-border py-1 z-30 min-w-[140px]">
                  <button onClick={() => { setShowChatMenu(false); onNav("report"); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"><Flag size={14} />Report</button>
                  <button onClick={doBlock} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"><Ban size={14} />Block</button>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/30">
            {msgsLoading && <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>}
            {msgs.map(msg => {
              const mine = msg.senderId === user?.id;
              const sessionShare = msg.content ? msg.content.match(SESSION_SHARE_RE) : null;
              const eventShare = msg.content ? msg.content.match(EVENT_SHARE_RE) : null;
              return (
                <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"} gap-2`}>
                  {!mine && <Av src={activeMatch.user.photos[0]?.url ?? ""} name={nameOf(activeMatch.user)} size="xs" />}
                  {sessionShare ? (
                    <SessionShareCard sessionId={sessionShare[1]} currentUserId={user?.id} />
                  ) : eventShare ? (
                    <EventShareCard eventId={eventShare[1]} currentUserId={user?.id} />
                  ) : (
                    <div className="group relative">
                      <div className={`max-w-[72%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${mine ? "bg-green-600 text-white rounded-br-sm" : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-border"} ${msg.deletedAt ? "italic text-gray-400 bg-gray-50 border-dashed border" : ""}`}>
                        {msg.deletedAt ? "ข้อความถูกยกเลิก" : msg.content}
                      </div>
                      {mine && !msg.deletedAt && (
                        <button onClick={() => doUnsend(msg.id)} className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-400"><RotateCcw size={13} /></button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          <div className="bg-white border-t border-border px-3 py-2.5 flex gap-2 shrink-0" style={{ paddingBottom: "calc(0.625rem + env(safe-area-inset-bottom))" }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} placeholder="พิมพ์ข้อความ..." className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-200 transition-all" />
            <button onClick={sendMsg} disabled={!input.trim()} className={`p-2.5 rounded-xl transition-colors ${input.trim() ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-200 text-gray-400"}`}><Send size={18} /></button>
          </div>
        </>
      ) : null}
    </div>
  );
  return <div className="flex h-full overflow-hidden">{matchList}{conversation}</div>;
}
