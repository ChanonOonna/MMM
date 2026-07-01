import { useState } from "react";
import { ChevronLeft, MessageCircle, MoreVertical, AlertTriangle, MapPin, Clock, Flag, Ban } from "lucide-react";
import type { View } from "../types";
import { USERS } from "../data";
import { Av, SportBadge, LvBadge } from "../components/shared";

export function ProfileOtherPage({ onBack, onNav, onChat }: { onBack: () => void; onNav: (v: View) => void; onChat: () => void }) {
  const u = USERS[0];
  const [isBlocked, setIsBlocked] = useState(false);
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="relative h-40 bg-gradient-to-br from-blue-500 to-blue-700 shrink-0">
        <button onClick={onBack} className="absolute top-4 left-4 bg-black/20 text-white p-2 rounded-full"><ChevronLeft size={22} /></button>
        <button onClick={() => onNav("report")} className="absolute top-4 right-4 bg-black/20 text-white p-2 rounded-full"><MoreVertical size={18} /></button>
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2"><Av src={u.photo} size="xl" warn={u.warning} /></div>
      </div>
      <div className="pt-14 px-4 pb-4 text-center">
        {u.warning && <div className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full mb-2"><AlertTriangle size={12} />มี Warning</div>}
        {isBlocked && <div className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full mb-2"><Ban size={12} />บล็อกแล้ว</div>}
        <h2 className="text-xl font-black">{u.name}</h2>
        <p className="text-muted-foreground text-sm">ชื่อเล่น: {u.nick} · {u.age} ปี</p>
        <div className="flex justify-center gap-2 mt-3 flex-wrap"><SportBadge emoji={u.sportEmoji} name={u.sport} /><LvBadge name={u.level} color={u.levelColor} /></div>
        <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mt-2"><MapPin size={13} />{u.venue}</div>
        <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mt-1"><Clock size={13} />{u.avail}</div>
        <div className="flex gap-3 mt-5 px-4">
          <button onClick={onChat} disabled={isBlocked} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"><MessageCircle size={18} />แชท</button>
          <button onClick={() => onNav("report")} className="p-3 bg-gray-100 rounded-xl text-gray-500 hover:bg-gray-200 transition-colors" title="Report"><Flag size={20} /></button>
          <button onClick={() => setIsBlocked(v => !v)} className={`p-3 rounded-xl transition-colors ${isBlocked ? "bg-red-500 text-white" : "bg-red-50 text-red-400 hover:bg-red-100"}`} title={isBlocked ? "Unblock" : "Block"}><Ban size={20} /></button>
        </div>
      </div>
    </div>
  );
}
