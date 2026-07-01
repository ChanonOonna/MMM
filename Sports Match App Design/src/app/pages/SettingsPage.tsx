import React, { useState } from "react";
import { ChevronRight, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useLang, T } from "../lang";
import { PageHd } from "../components/shared";

export function SettingsPage({ onBack }: { onBack: () => void }) {
  const lang = useLang(); const t = T[lang];
  const [notifMatch, setNotifMatch] = useState(true);
  const [notifSession, setNotifSession] = useState(true);
  const [notifEvent, setNotifEvent] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  const [pwStep, setPwStep] = useState<"form"|"success">("form");
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwErr, setPwErr] = useState("");
  const closePwModal = () => { setShowChangePw(false); setPwStep("form"); setOldPw(""); setNewPw(""); setConfirmPw(""); setPwErr(""); setShowOld(false); setShowNew(false); setShowConfirm(false); };
  const submitPw = () => {
    if (!oldPw) { setPwErr("กรุณากรอกรหัสผ่านเดิม"); return; }
    if (newPw.length < 6) { setPwErr("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร"); return; }
    if (newPw !== confirmPw) { setPwErr("รหัสผ่านใหม่ไม่ตรงกัน"); return; }
    setPwErr(""); setPwStep("success");
  };
  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ${on ? "bg-green-600" : "bg-gray-300"}`}>
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? "right-1" : "left-1"}`} />
    </button>
  );
  const Row = ({ label, sub, right }: { label: string; sub?: string; right: React.ReactNode }) => (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-900">{label}</p>{sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}</div>
      {right}
    </div>
  );
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHd title={t.settings_title} onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-2xl border border-border overflow-hidden divide-y divide-border">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-border"><p className="text-xs font-black text-muted-foreground uppercase tracking-wider">{t.notif_settings}</p></div>
            <Row label={t.notif_match} sub={t.notif_match_sub} right={<Toggle on={notifMatch} onToggle={() => setNotifMatch(v=>!v)} />} />
            <Row label={t.notif_session} sub={t.notif_session_sub} right={<Toggle on={notifSession} onToggle={() => setNotifSession(v=>!v)} />} />
            <Row label={t.notif_event} sub={t.notif_event_sub} right={<Toggle on={notifEvent} onToggle={() => setNotifEvent(v=>!v)} />} />
          </div>
          <div className="bg-white rounded-2xl border border-border overflow-hidden divide-y divide-border">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-border"><p className="text-xs font-black text-muted-foreground uppercase tracking-wider">ความปลอดภัย</p></div>
            <button onClick={() => setShowChangePw(true)} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors">
              <Lock size={16} className="text-gray-400 shrink-0" />
              <p className="text-sm font-semibold text-gray-900 flex-1 text-left">{t.change_pw}</p>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-border overflow-hidden divide-y divide-border">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-border"><p className="text-xs font-black text-muted-foreground uppercase tracking-wider">{t.privacy_label}</p></div>
            <button onClick={() => setShowPrivacy(true)} className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50">
              <p className="text-sm font-semibold text-gray-900">{t.privacy_policy}</p><ChevronRight size={16} className="text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50">
              <p className="text-sm font-semibold text-gray-900">{t.terms}</p><ChevronRight size={16} className="text-gray-400" />
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-red-50 text-red-600 transition-colors">
              <p className="text-sm font-semibold">{t.logout}</p>
            </button>
          </div>
          <p className="text-center text-xs text-muted-foreground">KU Sports v1.0.0 · พัฒนาโดยนิสิต KU</p>
        </div>
      </div>
      {showChangePw && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6" onClick={closePwModal}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            {pwStep === "success" ? (
              <div className="flex flex-col items-center text-center py-2">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-3"><CheckCircle size={28} className="text-green-600" /></div>
                <h3 className="font-black text-lg mb-1">เปลี่ยนรหัสผ่านสำเร็จ</h3>
                <p className="text-sm text-muted-foreground mb-5">รหัสผ่านของคุณถูกอัปเดตแล้ว</p>
                <button onClick={closePwModal} className="w-full bg-green-600 text-white py-2.5 rounded-xl font-bold hover:bg-green-700">เสร็จสิ้น</button>
              </div>
            ) : (
              <>
                <h3 className="font-black text-lg mb-4">{t.change_pw}</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1">รหัสผ่านเดิม</label>
                    <div className="relative">
                      <input type={showOld ? "text" : "password"} value={oldPw} onChange={e => { setOldPw(e.target.value); setPwErr(""); }} placeholder="••••••" className="w-full bg-gray-50 border border-border rounded-xl px-4 py-2.5 pr-10 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100" />
                      <button type="button" onClick={() => setShowOld(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showOld ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1">รหัสผ่านใหม่</label>
                    <div className="relative">
                      <input type={showNew ? "text" : "password"} value={newPw} onChange={e => { setNewPw(e.target.value); setPwErr(""); }} placeholder="อย่างน้อย 6 ตัวอักษร" className="w-full bg-gray-50 border border-border rounded-xl px-4 py-2.5 pr-10 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100" />
                      <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showNew ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1">ยืนยันรหัสผ่านใหม่</label>
                    <div className="relative">
                      <input type={showConfirm ? "text" : "password"} value={confirmPw} onChange={e => { setConfirmPw(e.target.value); setPwErr(""); }} placeholder="••••••" className="w-full bg-gray-50 border border-border rounded-xl px-4 py-2.5 pr-10 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100" />
                      <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                    </div>
                  </div>
                </div>
                {pwErr && <p className="text-red-500 text-xs mt-2">{pwErr}</p>}
                <div className="flex gap-2 mt-5">
                  <button onClick={closePwModal} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-gray-600 hover:bg-gray-50">ยกเลิก</button>
                  <button onClick={submitPw} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700">บันทึก</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6" onClick={() => setShowPrivacy(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-lg mb-3">{t.privacy_policy}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">แอปพลิเคชันนี้เก็บข้อมูลส่วนตัวของผู้ใช้เพื่อการจับคู่กีฬาและการแจ้งเตือนกิจกรรมภายในมหาวิทยาลัยเท่านั้น ข้อมูลจะไม่ถูกเผยแพร่ให้บุคคลภายนอก</p>
            <button onClick={() => setShowPrivacy(false)} className="mt-4 w-full bg-green-600 text-white py-2.5 rounded-xl font-bold">เข้าใจแล้ว</button>
          </div>
        </div>
      )}
    </div>
  );
}
