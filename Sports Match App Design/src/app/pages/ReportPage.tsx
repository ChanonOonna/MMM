import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { useLang, T } from "../lang";
import { PageHd } from "../components/shared";

export function ReportPage({ onBack }: { onBack: () => void }) {
  const lang = useLang(); const t = T[lang];
  const [selReason, setSelReason] = useState("");
  const [detail, setDetail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const REASONS = lang === "th"
    ? ["พฤติกรรมไม่เหมาะสม","คำพูดที่ไม่เหมาะสม","รูปโปรไฟล์ไม่เหมาะสม","ไม่มาตามนัด (No-show)","ข้อมูลเท็จ","อื่นๆ"]
    : ["Inappropriate behavior","Abusive language","Inappropriate photo","No-show","False information","Other"];
  if (submitted) return (
    <div className="flex flex-col h-full items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"><CheckCircle size={32} className="text-green-600" /></div>
      <h2 className="text-xl font-black mb-2">{t.report_sent}</h2>
      <p className="text-muted-foreground text-sm mb-6">{t.report_sent_sub}</p>
      <button onClick={onBack} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700">{t.back}</button>
    </div>
  );
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHd title={t.report_title} onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full space-y-5">
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">{t.report_reason}</p>
          <div className="space-y-2">
            {REASONS.map(r => (
              <button key={r} onClick={() => setSelReason(r)} className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${selReason === r ? "border-red-500 bg-red-50 text-red-700" : "border-border bg-white text-gray-700 hover:border-gray-300"}`}>{r}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-bold text-gray-700 block mb-1.5">{t.report_detail} <span className="text-xs font-normal text-muted-foreground">({t.optional})</span></label>
          <textarea value={detail} onChange={e => setDetail(e.target.value)} rows={4} placeholder={t.report_detail_ph} className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all resize-none" />
        </div>
      </div>
      <div className="p-4 border-t border-border shrink-0" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
        <button onClick={() => selReason && setSubmitted(true)} disabled={!selReason} className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98]">{t.submit_report}</button>
      </div>
    </div>
  );
}
