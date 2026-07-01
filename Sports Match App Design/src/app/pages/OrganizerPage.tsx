import React, { useState } from "react";
import { QrCode, Users, Megaphone, Send, BarChart3, ChevronRight, CheckCircle, UserCheck } from "lucide-react";
import { useLang, T } from "../lang";
import type { OrgTab } from "../types";
import { ORG_EVENTS } from "../data";
import { PageHd, QRSvg } from "../components/shared";

export function OrganizerPage({ onBack }: { onBack: () => void }) {
  const lang = useLang(); const t = T[lang];
  const [tab, setTab] = useState<OrgTab>("my-events");
  const [scanMode, setScanMode] = useState(false);
  const [scanned, setScanned] = useState<string[]>([]);
  const [announce, setAnnounce] = useState("");
  const TABS: { id: OrgTab; label: string; icon: React.ReactNode }[] = [
    { id: "my-events", label: t.my_events, icon: <BarChart3 size={16} /> },
    { id: "qr-scan", label: t.qr_scan, icon: <QrCode size={16} /> },
    { id: "members", label: t.members, icon: <Users size={16} /> },
    { id: "announce", label: t.announce, icon: <Megaphone size={16} /> },
  ];
  const simulateScan = () => {
    const names = ["สมชาย ใจดี","นลินี ดีใจ","ธนกร วิชาการ","พิมพ์ใจ เก่งกีฬา"];
    const name = names[scanned.length % names.length];
    if (!scanned.includes(name)) setScanned(p => [...p, name]);
  };
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHd title={t.organizer_panel} onBack={onBack} />
      <div className="border-b border-border shrink-0 overflow-x-auto">
        <div className="flex px-2 min-w-max">
          {TABS.map(tb => (
            <button key={tb.id} onClick={() => setTab(tb.id)} className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${tab === tb.id ? "border-green-600 text-green-700" : "border-transparent text-muted-foreground"}`}>
              {tb.icon}{tb.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {tab === "my-events" && (
          <div className="p-4 space-y-3">
            {ORG_EVENTS.map(ev => (
              <div key={ev.id} className="bg-white rounded-2xl border border-border p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-xl shrink-0">{ev.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-gray-900">{ev.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{ev.date} · {ev.time}</p>
                    <div className="flex items-center gap-3 mt-2 text-sm">
                      <span className="flex items-center gap-1 font-semibold text-green-700"><Users size={13} />{ev.joined}/{ev.max}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ev.status === "upcoming" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>{ev.status === "upcoming" ? (lang==="th"?"กำลังจะมาถึง":"Upcoming") : (lang==="th"?"กำลังดำเนิน":"Live")}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 mt-1 shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === "qr-scan" && (
          <div className="p-4 space-y-4">
            <div className="bg-white rounded-2xl border border-border p-5 text-center">
              {scanMode ? (
                <>
                  <div className="bg-gray-100 rounded-xl w-full aspect-square max-w-[240px] mx-auto mb-4 flex items-center justify-center overflow-hidden relative">
                    <QRSvg value="SCANNER_MODE" size={180} />
                    <div className="absolute inset-0 border-4 border-green-500 rounded-xl animate-pulse" />
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-green-400/70 animate-scan" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{lang==="th"?"กำลังรอสแกน QR...":"Waiting for QR scan..."}</p>
                  <div className="flex gap-2">
                    <button onClick={simulateScan} className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-green-700">{lang==="th"?"จำลองการสแกน":"Simulate Scan"}</button>
                    <button onClick={() => setScanMode(false)} className="px-4 py-2.5 border border-border rounded-xl text-sm font-bold hover:bg-gray-50">{lang==="th"?"หยุด":"Stop"}</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><QrCode size={32} className="text-green-600" /></div>
                  <h3 className="font-black text-lg mb-1">{t.qr_scan}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{lang==="th"?"สแกน QR Code ผู้เข้าร่วมเพื่อ Check-in":"Scan participant QR codes for check-in"}</p>
                  <button onClick={() => setScanMode(true)} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700">{lang==="th"?"เปิดกล้องสแกน":"Open Camera Scanner"}</button>
                </>
              )}
            </div>
            {scanned.length > 0 && (
              <div className="bg-white rounded-2xl border border-border overflow-hidden">
                <div className="px-4 py-2.5 bg-green-50 border-b border-border flex items-center gap-2"><CheckCircle size={14} className="text-green-600" /><p className="text-xs font-black text-green-700">{lang==="th"?"Check-in สำเร็จ":"Checked In"} ({scanned.length})</p></div>
                {scanned.map((name, i) => <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0"><div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"><UserCheck size={14} className="text-green-600" /></div><p className="text-sm font-semibold">{name}</p><CheckCircle size={14} className="text-green-600 ml-auto" /></div>)}
              </div>
            )}
          </div>
        )}
        {tab === "members" && (
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {[["47",lang==="th"?"ผู้สมัคร":"Applied"],["32",lang==="th"?"ยืนยัน":"Confirmed"],["15",lang==="th"?"Check-in":"Checked-In"]].map(([n,l]) => <div key={l} className="bg-white rounded-xl border border-border p-3 text-center"><div className="text-2xl font-black text-green-700">{n}</div><div className="text-xs text-muted-foreground">{l}</div></div>)}
            </div>
            {Array.from({length:6},(_,i)=>({id:`m${i}`,name:["สมชาย ใจดี","นลินี ดีใจ","ธนกร วิชาการ","พิมพ์ใจ เก่งกีฬา","อรทัย มั่นคง","วีรชัย กีฬาเด่น"][i],checked: i<3})).map(m=>(
              <div key={m.id} className="bg-white rounded-xl border border-border p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center font-bold text-sm">{m.name[0]}</div>
                <div className="flex-1"><p className="text-sm font-semibold">{m.name}</p><p className="text-xs text-muted-foreground">{m.checked?(lang==="th"?"Check-in แล้ว":"Checked in"):(lang==="th"?"ยังไม่ Check-in":"Not checked in")}</p></div>
                {m.checked && <CheckCircle size={16} className="text-green-600" />}
              </div>
            ))}
          </div>
        )}
        {tab === "announce" && (
          <div className="p-4 space-y-3">
            <div className="bg-white rounded-2xl border border-border p-4">
              <p className="text-sm font-bold mb-2">{lang==="th"?"ส่งประกาศใหม่":"New Announcement"}</p>
              <textarea value={announce} onChange={e => setAnnounce(e.target.value)} rows={3} placeholder={lang==="th"?"พิมพ์ข้อความประกาศ...":"Type your announcement..."} className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500 resize-none" />
              <button onClick={() => setAnnounce("")} disabled={!announce.trim()} className="mt-2 w-full bg-green-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 disabled:opacity-40 flex items-center justify-center gap-2"><Send size={14} />{lang==="th"?"ส่งประกาศ":"Send Announcement"}</button>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-2.5"><Megaphone size={16} className="text-amber-600 mt-0.5 shrink-0" /><div><p className="text-sm font-bold text-amber-800">{lang==="th"?"กำหนดการเพิ่มเติม":"Schedule Update"}</p><p className="text-xs text-amber-700 mt-0.5">{lang==="th"?"แต่ละกีฬาจะเริ่ม 09:00 น. กรุณามาก่อน 30 นาที":"Each sport starts at 09:00. Please arrive 30 min early."}</p><p className="text-xs text-amber-600 mt-1.5">{lang==="th"?"เมื่อ 2 วันที่แล้ว":"2 days ago"}</p></div></div>
          </div>
        )}
      </div>
    </div>
  );
}
