import { useState, useRef } from "react";
import { CalendarDays, MapPin, Users, Send, Search, User, MoreVertical, Flag, Ban, Swords, Image as ImageIcon, ChevronLeft, CheckCircle, X, RotateCcw } from "lucide-react";
import { useLang, T } from "../lang";
import type { View } from "../types";
import { MATCHES, MESSAGES, SPORTS, VENUES, type Msg } from "../data";
import { Av } from "../components/shared";

export function ChatPage({ onNav }: { onNav: (v: View) => void }) {
  const lang = useLang(); const t = T[lang];
  const [active, setActive] = useState("");
  const [msgs, setMsgs] = useState(MESSAGES);
  const [input, setInput] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteOk, setInviteOk] = useState<Record<string, boolean>>({});
  const [inviteDec, setInviteDec] = useState<Record<string, boolean>>({});
  const [invSport, setInvSport] = useState(SPORTS[0].name);
  const [invDate, setInvDate] = useState("");
  const [invTimeStart, setInvTimeStart] = useState("18:00");
  const [invTimeEnd, setInvTimeEnd] = useState("19:00");
  const [invVenue, setInvVenue] = useState(VENUES[0]);
  const [invCount, setInvCount] = useState("4");
  const [invMsg, setInvMsg] = useState("");
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [chatQ, setChatQ] = useState("");
  const [showChatSearch, setShowChatSearch] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const activePerson = MATCHES.find(m => m.id === active);
  const sendMsg = () => {
    if (!input.trim() || !active) return;
    const nm: Msg = { id: Date.now().toString(), from: "me", text: input, time: "ตอนนี้" };
    setMsgs(p => ({ ...p, [active]: [...(p[active] || []), nm] }));
    setInput(""); setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 30);
  };
  const sendInvite = () => {
    if (!active) return;
    const nm: Msg = { id: Date.now().toString(), from: "me", text: `${invSport}${invDate ? ` · ${invDate}` : ""} · ${invTimeStart}–${invTimeEnd} · ${invVenue} (${invCount} คน)${invMsg ? ` — ${invMsg}` : ""}`, time: "ตอนนี้", type: "invite" };
    setMsgs(p => ({ ...p, [active]: [...(p[active] || []), nm] }));
    setShowInvite(false); setInvMsg("");
  };
  const matchList = (
    <div className={`flex flex-col bg-white border-r border-border ${active ? "hidden lg:flex w-full lg:w-80 shrink-0" : "flex w-full lg:w-80 shrink-0"}`}>
      <div className="sticky top-0 z-10 bg-white border-b border-border px-4 h-14 flex items-center justify-between shrink-0">
        <h2 className="font-bold text-lg">{t.chat_title}</h2>
        <button onClick={() => { setShowChatSearch(v => !v); setChatQ(""); }} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"><Search size={19} /></button>
      </div>
      {showChatSearch && <div className="px-4 py-2 border-b border-border shrink-0"><input value={chatQ} onChange={e => setChatQ(e.target.value)} autoFocus placeholder="ค้นหาแชท..." className="w-full bg-gray-100 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-green-200" /></div>}
      <div className="flex-1 overflow-y-auto divide-y divide-border">
        {MATCHES.filter(m => !blocked.includes(m.id)).filter(m => !chatQ || m.name.includes(chatQ)).map(m => (
          <button key={m.id} onClick={() => setActive(m.id)} className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${active === m.id ? "bg-green-50" : "hover:bg-gray-50"}`}>
            <Av src={m.photo} size="md" online={m.online} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-semibold text-sm text-gray-900">{m.name}</span>
                <span className="text-[11px] text-muted-foreground">{m.time}</span>
              </div>
              <span className={`text-sm truncate block ${m.unsent ? "italic text-muted-foreground" : "text-muted-foreground"}`}>{m.lastMsg}</span>
            </div>
            {m.unread > 0 && <span className="ml-1 w-5 h-5 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">{m.unread}</span>}
          </button>
        ))}
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
      ) : activePerson ? (
        <>
          <div className="sticky top-0 z-10 bg-white border-b border-border h-14 px-3 flex items-center gap-2 shrink-0">
            <button onClick={() => setActive("")} className="lg:hidden p-1.5 rounded-xl hover:bg-gray-100"><ChevronLeft size={22} /></button>
            <Av src={activePerson.photo} size="sm" online={activePerson.online} />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{activePerson.name}</p>
              <p className="text-xs text-green-600">{activePerson.online ? "กำลังออนไลน์" : "ออฟไลน์"}</p>
            </div>
            <button onClick={() => onNav("profile-other")} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><User size={18} /></button>
            <div className="relative">
              <button onClick={() => setShowChatMenu(v => !v)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><MoreVertical size={18} /></button>
              {showChatMenu && (
                <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-border py-1 z-30 min-w-[140px]">
                  <button onClick={() => { setShowChatMenu(false); onNav("report"); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"><Flag size={14} />Report</button>
                  <button onClick={() => { setShowChatMenu(false); if (activePerson) setBlocked(b => [...b, activePerson.id]); setActive(""); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"><Ban size={14} />Block</button>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/30">
            {(msgs[active] || []).map(msg => (
              <div key={msg.id} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"} gap-2`}>
                {msg.from === "other" && <Av src={activePerson.photo} size="xs" />}
                {msg.type === "invite" ? (
                  <div className="bg-white border-2 border-green-200 rounded-2xl p-4 max-w-[260px] shadow-sm">
                    <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center text-lg">🏸</div><span className="text-sm font-bold text-green-700">Sport Invite</span></div>
                    <p className="text-sm font-bold mb-1">แบดมินตัน 2v2</p>
                    <div className="text-xs text-muted-foreground space-y-0.5 mb-3">
                      <div className="flex items-center gap-1"><CalendarDays size={11} />28 มิ.ย. 68 · 17:00–19:00</div>
                      <div className="flex items-center gap-1"><MapPin size={11} />สนามแบดมินตัน อาคารกีฬา</div>
                      <div className="flex items-center gap-1"><Users size={11} />ต้องการ 4 คน</div>
                    </div>
                    {inviteOk[msg.id] ? <div className="flex items-center gap-1.5 text-green-600 text-xs font-bold"><CheckCircle size={14} />ตอบรับแล้ว</div>
                      : inviteDec[msg.id] ? <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold"><X size={14} />ปฏิเสธแล้ว</div>
                      : <div className="flex gap-2"><button onClick={() => setInviteOk(p => ({ ...p, [msg.id]: true }))} className="flex-1 bg-green-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-green-700">ตอบรับ</button><button onClick={() => setInviteDec(p => ({ ...p, [msg.id]: true }))} className="flex-1 bg-gray-100 text-gray-600 text-xs font-bold py-2 rounded-lg hover:bg-gray-200">ปฏิเสธ</button></div>}
                  </div>
                ) : (
                  <div className="group relative">
                    <div className={`max-w-[72%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.from === "me" ? "bg-green-600 text-white rounded-br-sm" : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-border"} ${msg.unsent ? "italic text-gray-400 bg-gray-50 border-dashed border" : ""}`}>
                      {msg.unsent ? "ข้อความถูกยกเลิก" : msg.text}
                    </div>
                    {msg.from === "me" && !msg.unsent && (
                      <button onClick={() => setMsgs(p => ({ ...p, [active]: (p[active]||[]).map(x => x.id === msg.id ? { ...x, unsent: true } : x) }))} className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-400"><RotateCcw size={13}/></button>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          {showInvite && (
            <div className="bg-green-50 border-t border-green-200 p-4">
              <p className="text-sm font-bold text-green-800 mb-3">{t.invite_title}</p>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <select value={invSport} onChange={e => setInvSport(e.target.value)} className="bg-white border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500">{SPORTS.map(s => <option key={s.id} value={s.name}>{s.emoji} {s.name}</option>)}</select>
                <input type="date" value={invDate} onChange={e => setInvDate(e.target.value)} className="bg-white border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500" />
                <select value={invTimeStart} onChange={e => setInvTimeStart(e.target.value)} className="bg-white border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500">{"16:00,17:00,18:00,19:00,20:00".split(",").map(ts=><option key={ts} value={ts}>{t.start} {ts}</option>)}</select>
                <select value={invTimeEnd} onChange={e => setInvTimeEnd(e.target.value)} className="bg-white border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500">{"17:00,18:00,19:00,20:00,21:00".split(",").map(ts=><option key={ts} value={ts}>{t.end} {ts}</option>)}</select>
                <select value={invVenue} onChange={e => setInvVenue(e.target.value)} className="bg-white border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500 col-span-2">{VENUES.map(v => <option key={v}>{v}</option>)}</select>
                <input type="number" value={invCount} onChange={e => setInvCount(e.target.value)} min={2} placeholder={t.invite_count} className="bg-white border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500 col-span-2" />
              </div>
              <input value={invMsg} onChange={e => setInvMsg(e.target.value)} placeholder={t.invite_ph} className="w-full bg-white border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500 mb-2" />
              <div className="flex gap-2"><button onClick={sendInvite} className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-green-700">{t.invite}</button><button onClick={() => setShowInvite(false)} className="px-4 bg-white border border-border rounded-xl text-sm text-gray-600">{t.cancel}</button></div>
            </div>
          )}
          <div className="bg-white border-t border-border px-3 py-2.5 flex gap-2 shrink-0" style={{ paddingBottom: "calc(0.625rem + env(safe-area-inset-bottom))" }}>
            <button onClick={() => setShowInvite(v => !v)} className={`p-2.5 rounded-xl transition-colors ${showInvite ? "bg-green-100 text-green-600" : "text-gray-400 hover:bg-gray-100"}`}><Swords size={20} /></button>
            <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f && active) { setMsgs(p => ({ ...p, [active]: [...(p[active]||[]), { id: Date.now().toString(), from: "me" as const, text: `📷 ${f.name}`, time: "ตอนนี้" }] })); e.target.value = ""; setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 30); }}} />
            <button onClick={() => imgInputRef.current?.click()} className="p-2.5 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors"><ImageIcon size={20} /></button>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} placeholder={t.type_msg} className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-200 transition-all" />
            <button onClick={sendMsg} disabled={!input.trim()} className={`p-2.5 rounded-xl transition-colors ${input.trim() ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-200 text-gray-400"}`}><Send size={18} /></button>
          </div>
        </>
      ) : null}
    </div>
  );
  return <div className="flex h-full overflow-hidden">{matchList}{conversation}</div>;
}
