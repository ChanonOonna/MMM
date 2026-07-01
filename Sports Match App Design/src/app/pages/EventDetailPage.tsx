import React, { useState } from "react";
import { CalendarDays, MapPin, Users, Send, QrCode, ChevronLeft, Megaphone } from "lucide-react";
import { EVENTS, SPORTS } from "../data";
import { PBar, SportBadge } from "../components/shared";

export function EventDetailPage({ eventId, onBack, onQR }: { eventId: string; onBack: () => void; onQR: () => void }) {
  const ev = EVENTS.find(e => e.id === eventId)!;
  const [joined, setJoined] = useState(false);
  const [evTab, setEvTab] = useState<"info"|"chat"|"announce">("info");
  const [evMsgs, setEvMsgs] = useState([{ id: "1", from: "ธนกร", text: "พร้อมแล้ว เจอกันงาน!" }, { id: "2", from: "นลินี", text: "มาแน่นอนค่ะ 💪" }]);
  const [evInput, setEvInput] = useState("");
  const ANNOUNCES = [
    { id: "a1", title: "กำหนดการเพิ่มเติม", body: "แต่ละกีฬาจะเริ่มในเวลา 09:00 น. กรุณามาก่อน 30 นาที", time: "2 วันที่แล้ว" },
    { id: "a2", title: "จุดลงทะเบียน", body: "ลงทะเบียนที่หน้าประตูสนามกีฬากลาง พร้อมแสดง QR Code", time: "1 วันที่แล้ว" },
  ];
  if (!ev) return null;
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="relative h-48 bg-gray-200 shrink-0">
        <img src={ev.cover} alt={ev.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
        <button onClick={onBack} className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/50"><ChevronLeft size={22} /></button>
        <div className="absolute bottom-4 left-5 right-5"><h1 className="text-xl font-black text-white leading-tight">{ev.title}</h1><p className="text-white/60 text-sm mt-0.5">จัดโดย {ev.organizer}</p></div>
      </div>
      <div className="border-b border-border shrink-0 bg-white">
        <div className="flex">{([["info","รายละเอียด"],["chat","แชทกลุ่ม"],["announce","ประกาศ"]] as const).map(([tab,label])=><button key={tab} onClick={()=>setEvTab(tab)} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${evTab===tab?"border-green-600 text-green-700":"border-transparent text-muted-foreground"}`}>{label}</button>)}</div>
      </div>
      {evTab === "info" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-white rounded-2xl border border-border divide-y divide-border overflow-hidden">
            {([[<CalendarDays size={17} className="text-green-600" />, `${ev.date} · ${ev.time}`],[<MapPin size={17} className="text-green-600" />, ev.venue],[<Users size={17} className="text-green-600" />, `${ev.participants.toLocaleString()} / ${ev.max.toLocaleString()} คน`]] as [React.ReactNode,string][]).map(([icon,text],i)=>(
              <div key={i} className="flex items-center gap-3 px-4 py-3.5 text-sm"><span className="shrink-0">{icon}</span><span className="font-medium text-gray-800">{text}</span></div>
            ))}
          </div>
          <PBar cur={ev.participants} max={ev.max} />
          <div className="bg-white rounded-2xl border border-border p-4">
            <p className="text-sm font-bold mb-2">กีฬาในงาน</p>
            <div className="flex flex-wrap gap-2">{ev.sports.map(s=>{const sp=SPORTS.find(x=>x.name===s);return sp?<SportBadge key={s} emoji={sp.emoji} name={s}/>:null;})}</div>
          </div>
          <div className="bg-white rounded-2xl border border-border p-4">
            <p className="text-sm font-bold mb-2">รายละเอียด</p>
            <p className="text-sm text-muted-foreground">{ev.desc}</p>
          </div>
          {joined && <button onClick={onQR} className="w-full bg-green-50 border-2 border-green-300 text-green-700 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-100 transition-colors"><QrCode size={20} />แสดง QR Code สำหรับ Check-in</button>}
          <button onClick={()=>setJoined(v=>!v)} className={`w-full py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] ${joined?"bg-gray-100 text-gray-600 hover:bg-gray-200":"bg-green-600 text-white hover:bg-green-700"}`}>{joined?"ยกเลิกการเข้าร่วม":"สมัครเข้าร่วม Event"}</button>
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
          {ANNOUNCES.map(a=>(
            <div key={a.id} className="bg-white rounded-2xl border border-border p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0"><Megaphone size={18} className="text-amber-600"/></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">{a.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{a.body}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">{a.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
