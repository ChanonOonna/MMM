import { useState } from "react";
import { motion } from "motion/react";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";
import { useLang, T } from "../lang";

export function AuthPage({ onDone }: { onDone: () => void }) {
  const lang = useLang(); const t = T[lang];
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nick, setNick] = useState("");
  const [dob, setDob] = useState("");
  const [err, setErr] = useState("");
  const submit = () => {
    if (!email.endsWith("@ku.th")) { setErr(t.err_email); return; }
    if (pw.length < 6) { setErr(t.err_pw_short); return; }
    if (mode === "register" && pw !== confirmPw) { setErr(t.err_pw_match); return; }
    setErr(""); onDone();
  };
  const inp = "w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-400";
  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-900 flex items-stretch">
      <img src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&h=800&fit=crop&auto=format" alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/55 to-black/80" />
      <div className="relative z-10 flex flex-col w-full">
        <div className="lg:hidden flex-1 flex flex-col items-center justify-center py-12">
          <motion.div initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-center">
            <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black mx-auto mb-4 shadow-2xl">S</div>
            <h1 className="text-3xl font-black text-white">Sports Match</h1>
            <p className="text-white/50 mt-1.5 text-sm">{t.tagline}</p>
          </motion.div>
        </div>
        <motion.div initial={{ y: 48, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.18, type: "spring", stiffness: 260, damping: 26 }}
          className="bg-white rounded-t-3xl lg:rounded-2xl px-6 py-7 lg:px-8 lg:py-8 lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-[420px] shadow-2xl">
          <div className="hidden lg:block text-center mb-6">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-3">S</div>
            <h1 className="text-2xl font-black text-gray-900">Sports Match</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{t.university}</p>
          </div>
          <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
            {(["login","register"] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setErr(""); setConfirmPw(""); setFirstName(""); setLastName(""); }} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === m ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>
                {m === "login" ? t.login : t.register}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {mode === "register" && <>
              <div className="flex gap-2">
                <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder={t.ph_firstname} className={inp} />
                <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder={t.ph_lastname} className={inp} />
              </div>
              <div className="flex gap-2">
                <input value={nick} onChange={e => setNick(e.target.value)} placeholder={t.ph_nickname} className={inp} />
                <input type="date" value={dob} onChange={e => setDob(e.target.value)} className={inp} title={t.ph_dob} />
              </div>
            </>}
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t.ph_email} className={inp} />
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={pw} onChange={e => setPw(e.target.value)} placeholder={t.ph_password} className={`${inp} pr-12`} />
              <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPw ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </div>
            {mode === "register" && (
              <div className="relative">
                <input type={showConfirmPw ? "text" : "password"} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder={t.ph_confirm_pw} className={`${inp} pr-12`} />
                <button type="button" onClick={() => setShowConfirmPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showConfirmPw ? <EyeOff size={17} /> : <Eye size={17} />}</button>
              </div>
            )}
          </div>
          {err && <p className="text-red-500 text-xs mt-2 flex items-center gap-1.5"><AlertTriangle size={13} />{err}</p>}
          <button onClick={submit} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-colors active:scale-[0.98] shadow-sm">
            {mode === "login" ? t.login : t.register}
          </button>
          <p className="text-center text-[11px] text-muted-foreground mt-4 leading-relaxed">{t.ku_only}</p>
        </motion.div>
      </div>
    </div>
  );
}
