import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useLang, T } from "../lang";
import type { View } from "../types";
import { NOTIFS } from "../data";
import { PageHd } from "../components/shared";

export function NotifsPage({ onBack, onNav }: { onBack: () => void; onNav: (v: View) => void }) {
  const lang = useLang(); const t = T[lang];
  const [list, setList] = useState(NOTIFS);
  const markRead = (id: string) => setList(p => p.map(x => x.id === id ? { ...x, read: true } : x));
  const getTarget = (n: typeof NOTIFS[0]): View | null =>
    n.target ? n.target as View : null;
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHd title={t.notifs_title} onBack={onBack} right={<button onClick={() => setList(n => n.map(x => ({ ...x, read: true })))} className="text-xs text-green-600 font-bold">{t.mark_all_read}</button>} />
      <div className="flex-1 overflow-y-auto divide-y divide-border">
        {list.map(n => {
          const target = getTarget(n);
          return (
            <button key={n.id} onClick={() => { markRead(n.id); if (target) onNav(target); }} className={`w-full flex items-start gap-3 px-4 py-4 text-left hover:bg-gray-50 transition-colors ${!n.read ? "bg-green-50/60" : ""}`}>
              <div className="w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center text-xl shrink-0">{n.icon}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug ${!n.read ? "font-bold text-gray-900" : "text-gray-700"}`}>{n.text}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.sub}</p>
                <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0 mt-1">{!n.read && <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />}{target && <ChevronRight size={14} className="text-gray-300" />}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
