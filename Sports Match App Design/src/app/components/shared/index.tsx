import React from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import {
  Home, MessageCircle, CalendarDays, User, Star,
  Bell, Settings, Shield, Search, LogOut, Briefcase,
  ChevronLeft, ChevronRight, Heart, AlertTriangle, Flag,
  MapPin, Clock, X
} from "lucide-react";
import { useNavigate } from "react-router";
import { useLang, T } from "../../lang";
import type { MainTab, View } from "../../types";
import { SELF_PHOTO, SELF_NAME, SELF_EMAIL } from "../../data";
import { useAuth } from "../../auth/AuthContext";

// ─── AVATAR ───────────────────────────────────────────────────────────────────
export function Av({ src, name, size = "md", online = false, warn = false }: { src: string; name?: string; size?: "xs"|"sm"|"md"|"lg"|"xl"; online?: boolean; warn?: boolean }) {
  const sz = { xs: "w-7 h-7", sm: "w-9 h-9", md: "w-11 h-11", lg: "w-14 h-14", xl: "w-20 h-20" }[size];
  const ds = { xs: "w-2 h-2", sm: "w-2.5 h-2.5", md: "w-3 h-3", lg: "w-3.5 h-3.5", xl: "w-4 h-4" }[size];
  const textSz = { xs: "text-[10px]", sm: "text-xs", md: "text-sm", lg: "text-base", xl: "text-2xl" }[size];
  const initial = name?.trim()?.[0]?.toUpperCase() ?? "";
  return (
    <div className="relative inline-block shrink-0">
      {src ? (
        <img src={src} alt="" className={`${sz} rounded-full object-cover bg-gray-200`} />
      ) : (
        <div className={`${sz} rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center ${textSz}`}>{initial}</div>
      )}
      {warn && <span className={`absolute bottom-0 right-0 ${ds} bg-orange-500 rounded-full ring-2 ring-white`} />}
      {!warn && online && <span className={`absolute bottom-0 right-0 ${ds} bg-green-500 rounded-full ring-2 ring-white`} />}
    </div>
  );
}

export function SportBadge({ emoji, name }: { emoji: string; name: string }) {
  return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 leading-none">{emoji} {name}</span>;
}

export function LvBadge({ name, color }: { name: string; color: string }) {
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium leading-none ${color}`}>{name}</span>;
}

export function PBar({ cur, max, className = "" }: { cur: number; max: number; className?: string }) {
  const p = Math.min((cur / max) * 100, 100);
  return (
    <div className={`h-1.5 bg-gray-200 rounded-full overflow-hidden ${className}`}>
      <div className={`h-full rounded-full ${p >= 90 ? "bg-red-500" : p >= 70 ? "bg-amber-500" : "bg-green-500"}`} style={{ width: `${p}%` }} />
    </div>
  );
}

export function PageHd({ title, onBack, right }: { title: string; onBack?: () => void; right?: React.ReactNode }) {
  return (
    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-border h-14 px-4 flex items-center gap-2 shrink-0">
      {onBack && <button onClick={onBack} className="p-1.5 -ml-1 rounded-xl hover:bg-gray-100 transition-colors"><ChevronLeft size={22} /></button>}
      <h1 className="font-bold text-lg flex-1 truncate">{title}</h1>
      {right}
    </div>
  );
}

// ─── THAI DATE FIELD ────────────────────────────────────────────────────────
// Buddhist-calendar date picker (day/month/year wheels), used anywhere an event/session
// date needs to read naturally in Thai instead of the browser's native <input type="date">.
const THAI_MONTHS = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

function isoToThaiParts(iso: string) {
  if (!iso) return { day: "", month: "", buddhistYear: "" };
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return { day: "", month: "", buddhistYear: "" };
  return { day: String(Number(d)), month: String(Number(m) - 1), buddhistYear: String(Number(y) + 543) };
}
function thaiPartsToIso(day: string, month: string, buddhistYear: string) {
  if (!day || !month || !buddhistYear) return "";
  const gregYear = Number(buddhistYear) - 543;
  return `${String(gregYear).padStart(4, "0")}-${String(Number(month) + 1).padStart(2, "0")}-${String(Number(day)).padStart(2, "0")}`;
}

export function ThaiDateField({ value, onChange, yearsAhead = 4, mode = "future" }: { value: string; onChange: (iso: string) => void; yearsAhead?: number; mode?: "future" | "past" }) {
  const todayDate = new Date(); todayDate.setHours(0, 0, 0, 0);
  const isPast = mode === "past";
  const minDate = isPast ? new Date(todayDate.getFullYear() - yearsAhead, todayDate.getMonth(), todayDate.getDate()) : todayDate;
  const maxEventDate = isPast ? todayDate : new Date(todayDate.getFullYear() + yearsAhead, todayDate.getMonth(), todayDate.getDate());
  const minYearBE = minDate.getFullYear() + 543;
  const maxYearBE = maxEventDate.getFullYear() + 543;
  const thaiYearOptions = Array.from({ length: maxYearBE - minYearBE + 1 }, (_, i) => minYearBE + i);
  const orderedYearOptions = isPast ? [...thaiYearOptions].reverse() : thaiYearOptions;
  const daysInThaiMonth = (yearBE: number, month: number) => new Date(yearBE - 543, month + 1, 0).getDate();
  const thaiMonthBounds = (yearBE: number) => ({
    min: yearBE === minYearBE ? minDate.getMonth() : 0,
    max: yearBE === maxYearBE ? maxEventDate.getMonth() : 11,
  });
  const thaiDayBounds = (yearBE: number, month: number) => {
    const dim = daysInThaiMonth(yearBE, month);
    let min = 1, max = dim;
    if (yearBE === minYearBE && month === minDate.getMonth()) min = minDate.getDate();
    if (yearBE === maxYearBE && month === maxEventDate.getMonth()) max = Math.min(max, maxEventDate.getDate());
    return { min, max };
  };

  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<{ day: string; month: string; buddhistYear: string }>({ day: "", month: "", buddhistYear: "" });

  const openPicker = () => {
    const anchor = isPast ? maxEventDate : minDate;
    const anchorYearBE = anchor.getFullYear() + 543;
    const parts = value ? isoToThaiParts(value) : { day: String(anchor.getDate()), month: String(anchor.getMonth()), buddhistYear: String(anchorYearBE) };
    setDraft(parts);
    setOpen(true);
  };
  const confirm = () => { onChange(thaiPartsToIso(draft.day, draft.month, draft.buddhistYear)); setOpen(false); };
  const selectYear = (yearStr: string) => setDraft(d => {
    const yearBE = Number(yearStr);
    const mb = thaiMonthBounds(yearBE);
    const month = d.month === "" ? mb.min : Math.min(Math.max(Number(d.month), mb.min), mb.max);
    const db = thaiDayBounds(yearBE, month);
    const day = d.day === "" ? db.min : Math.min(Math.max(Number(d.day), db.min), db.max);
    return { day: String(day), month: String(month), buddhistYear: String(yearBE) };
  });
  const selectMonth = (monthStr: string) => setDraft(d => {
    const yearBE = Number(d.buddhistYear || minYearBE);
    const month = Number(monthStr);
    const db = thaiDayBounds(yearBE, month);
    const day = d.day === "" ? db.min : Math.min(Math.max(Number(d.day), db.min), db.max);
    return { day: String(day), month: String(month), buddhistYear: String(yearBE) };
  });
  const selectDay = (dayStr: string) => setDraft(d => ({ ...d, day: dayStr }));

  const draftYearBE = Number(draft.buddhistYear || minYearBE);
  const draftMonthBounds = thaiMonthBounds(draftYearBE);
  const draftMonth = draft.month === "" ? draftMonthBounds.min : Number(draft.month);
  const draftDayBounds = thaiDayBounds(draftYearBE, draftMonth);
  const dateLabel = (() => {
    const p = isoToThaiParts(value);
    if (!p.day || !p.month || !p.buddhistYear) return "เลือกวันที่";
    return `${p.day} ${THAI_MONTHS[Number(p.month)]} ${p.buddhistYear}`;
  })();

  return (
    <>
      <button type="button" onClick={openPicker} className={`w-full text-left bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500 flex items-center justify-between ${value ? "text-gray-900" : "text-muted-foreground"}`}>
        <span>{dateLabel}</span>
        <CalendarDays size={14} className="text-muted-foreground shrink-0" />
      </button>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50" onClick={() => setOpen(false)}>
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={e => e.stopPropagation()} className="bg-white rounded-t-2xl w-full max-w-md shadow-xl px-5 pt-3 pb-5"
          >
            <div className="w-10 h-1.5 bg-gray-200 rounded-full mx-auto mb-3" />
            <h3 className="font-bold text-base mb-3 text-center">เลือกวันที่</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  key: "day" as const, label: "วัน", onSelect: selectDay,
                  options: Array.from({ length: draftDayBounds.max - draftDayBounds.min + 1 }, (_, i) => draftDayBounds.min + i).map(d => ({ value: String(d), label: String(d) })),
                },
                {
                  key: "month" as const, label: "เดือน", onSelect: selectMonth,
                  options: THAI_MONTHS.map((m, i) => ({ value: String(i), label: m })).filter((_, i) => i >= draftMonthBounds.min && i <= draftMonthBounds.max),
                },
                {
                  key: "buddhistYear" as const, label: "ปี", onSelect: selectYear,
                  options: orderedYearOptions.map(y => ({ value: String(y), label: String(y) })),
                },
              ].map(col => (
                <div key={col.key} className="flex flex-col">
                  <p className="text-[11px] font-bold text-muted-foreground text-center mb-1">{col.label}</p>
                  <div className="h-48 overflow-y-auto rounded-xl border border-border bg-gray-50">
                    {col.options.map(opt => (
                      <button
                        key={opt.value} type="button"
                        onClick={() => col.onSelect(opt.value)}
                        className={`w-full text-center py-2 text-sm transition-colors ${draft[col.key] === opt.value ? "bg-green-600 text-white font-bold" : "text-gray-700 hover:bg-gray-100"}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground text-center mt-2">{isPast ? `เลือกได้ตั้งแต่ ${yearsAhead} ปีที่แล้วถึงวันนี้` : `เลือกได้ตั้งแต่วันนี้ถึง ${yearsAhead} ปีข้างหน้า`}</p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-gray-600 hover:bg-gray-50">ยกเลิก</button>
              <button onClick={confirm} disabled={!draft.day || !draft.month || !draft.buddhistYear} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-40">ตกลง</button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

// ─── THAI TIME FIELD ────────────────────────────────────────────────────────
// Same wheel-picker interaction as ThaiDateField, but for time-of-day (HH:mm),
// used anywhere an event/session/availability time needs picking instead of the
// browser's native <input type="time">.
const MINUTE_STEPS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

function timeToParts(value: string) {
  if (!value) return { hour: "", minute: "" };
  const [h, m] = value.split(":");
  if (!h || !m) return { hour: "", minute: "" };
  return { hour: h, minute: m };
}

export function ThaiTimeField({ value, onChange }: { value: string; onChange: (time: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<{ hour: string; minute: string }>({ hour: "", minute: "" });

  const openPicker = () => {
    const parts = value ? timeToParts(value) : { hour: "17", minute: "00" };
    setDraft(parts);
    setOpen(true);
  };
  const confirm = () => {
    if (draft.hour && draft.minute) onChange(`${draft.hour}:${draft.minute}`);
    setOpen(false);
  };

  const hourOptions = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const timeLabel = value && value.includes(":") ? value : "เลือกเวลา";

  return (
    <>
      <button type="button" onClick={openPicker} className={`w-full text-left bg-gray-50 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500 flex items-center justify-between ${value ? "text-gray-900" : "text-muted-foreground"}`}>
        <span>{timeLabel}</span>
        <Clock size={14} className="text-muted-foreground shrink-0" />
      </button>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50" onClick={() => setOpen(false)}>
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={e => e.stopPropagation()} className="bg-white rounded-t-2xl w-full max-w-md shadow-xl px-5 pt-3 pb-5"
          >
            <div className="w-10 h-1.5 bg-gray-200 rounded-full mx-auto mb-3" />
            <h3 className="font-bold text-base mb-3 text-center">เลือกเวลา</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "hour" as const, label: "ชั่วโมง", options: hourOptions },
                { key: "minute" as const, label: "นาที", options: MINUTE_STEPS },
              ].map(col => (
                <div key={col.key} className="flex flex-col">
                  <p className="text-[11px] font-bold text-muted-foreground text-center mb-1">{col.label}</p>
                  <div className="h-48 overflow-y-auto rounded-xl border border-border bg-gray-50">
                    {col.options.map(opt => (
                      <button
                        key={opt} type="button"
                        onClick={() => setDraft(d => ({ ...d, [col.key]: opt }))}
                        className={`w-full text-center py-2 text-sm transition-colors ${draft[col.key] === opt ? "bg-green-600 text-white font-bold" : "text-gray-700 hover:bg-gray-100"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-gray-600 hover:bg-gray-50">ยกเลิก</button>
              <button onClick={confirm} disabled={!draft.hour || !draft.minute} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-40">ตกลง</button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

// Mobile-only counterpart to the desktop Sidebar's แจ้งเตือน/ค้นหา/ตั้งค่า links — the
// bottom tab bar only holds the 5 main destinations, so these live in each page's header instead.
export function MobileUtilityNav({ onNav, variant = "light" }: { onNav: (v: View) => void; variant?: "light" | "dark" }) {
  const items: { icon: React.ReactNode; view: View; badge?: number }[] = [
    { icon: <Bell size={19} />, view: "notifications", badge: 2 },
    { icon: <Search size={19} />, view: "search" },
    { icon: <Settings size={19} />, view: "settings" },
  ];
  const btnClass = variant === "dark"
    ? "text-white/90 hover:bg-white/20"
    : "text-gray-500 hover:bg-gray-100";
  return (
    <div className="flex items-center gap-1 lg:hidden">
      {items.map(({ icon, view, badge }) => (
        <button key={view} onClick={() => onNav(view)} className={`relative p-2.5 rounded-xl transition-colors ${btnClass}`}>
          {icon}
          {badge ? <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" /> : null}
        </button>
      ))}
    </div>
  );
}

// ─── QR CODE SVG ──────────────────────────────────────────────────────────────
export function QRSvg({ value, size }: { value: string; size?: number }) {
  const SZ = 25, C = 10;
  const m: boolean[][] = Array.from({ length: SZ }, (_, r) =>
    Array.from({ length: SZ }, (_, c) => {
      const h = ((r * 37 + c * 19 + (value.charCodeAt((r * c + 1) % value.length) | 0)) * 2654435761) >>> 0;
      return (h % 3) !== 0;
    })
  );
  const finder = (row: number, col: number) => {
    for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) {
      m[row + r][col + c] = r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
    }
    for (let r = -1; r <= 7; r++) for (let c = -1; c <= 7; c++) {
      if ((r === -1 || r === 7 || c === -1 || c === 7) && row + r >= 0 && row + r < SZ && col + c >= 0 && col + c < SZ)
        m[row + r][col + c] = false;
    }
  };
  finder(0, 0); finder(0, SZ - 7); finder(SZ - 7, 0);
  const W = SZ * C;
  return (
    <svg width={size ?? W} height={size ?? W} viewBox={`0 0 ${W} ${W}`} className="rounded-xl">
      <rect width={W} height={W} fill="white" />
      {m.map((row, r) => row.map((on, c) => on ? <rect key={`${r}${c}`} x={c * C} y={r * C} width={C} height={C} fill="#111827" /> : null))}
    </svg>
  );
}

// ─── SWIPE CARD ───────────────────────────────────────────────────────────────
export interface SwipeDisplayUser {
  id: string;
  name: string;
  nick: string;
  sport: string;
  sportEmoji: string;
  level: string;
  levelColor: string;
  venue: string;
  avail: string;
  photo: string;
  warning: boolean;
}

export function SwipeCard({ user, onLike, onPass, onReport, z = 10 }: { user: SwipeDisplayUser; onLike: () => void; onPass: () => void; onReport?: () => void; z?: number }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-22, 22]);
  const likeOp = useTransform(x, [25, 110], [0, 1]);
  const passOp = useTransform(x, [-110, -25], [1, 0]);
  return (
    <motion.div key={user.id} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.5}
      style={{ x, rotate, zIndex: z }}
      onDragEnd={(_, i) => { if (i.offset.x > 85) onLike(); else if (i.offset.x < -85) onPass(); }}
      className="absolute inset-0 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing shadow-xl"
      whileTap={{ scale: 1.01 }}>
      <img src={user.photo} alt="" className="w-full h-full object-cover select-none pointer-events-none" draggable={false} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
      {user.warning && (
        <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
          <AlertTriangle size={11} />Warning
        </div>
      )}
      <button onClick={e=>{e.stopPropagation();onReport?.();}} className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm text-white/80 p-2 rounded-full hover:bg-black/50 hover:text-white transition-all"><Flag size={15} /></button>
      <div className="absolute bottom-0 left-0 right-0 p-5 pb-6">
        <h2 className="text-[1.6rem] font-black text-white leading-tight">{user.name}</h2>
        {user.nick && <p className="text-white/60 text-sm mb-2.5">{user.nick}</p>}
        <div className="flex flex-wrap gap-2 mb-2.5">
          <SportBadge emoji={user.sportEmoji} name={user.sport} />
          <LvBadge name={user.level} color={user.levelColor} />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-sm text-white/75"><MapPin size={13} />{user.venue}</div>
          <div className="flex items-center gap-1.5 text-sm text-white/55"><Clock size={13} />{user.avail}</div>
        </div>
      </div>
      <motion.div style={{ opacity: likeOp }} className="absolute top-10 left-5 border-4 border-green-400 text-green-400 rounded-xl px-4 py-1.5 font-black text-2xl tracking-widest -rotate-12 pointer-events-none drop-shadow-lg">LIKE</motion.div>
      <motion.div style={{ opacity: passOp }} className="absolute top-10 right-5 border-4 border-red-400 text-red-400 rounded-xl px-4 py-1.5 font-black text-2xl tracking-widest rotate-12 pointer-events-none drop-shadow-lg">PASS</motion.div>
    </motion.div>
  );
}

// ─── MATCH OVERLAY ────────────────────────────────────────────────────────────
export function MatchOverlay({ user, onClose, onChat }: { user: SwipeDisplayUser; onClose: () => void; onChat?: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }} className="text-center px-8">
        <div className="text-7xl mb-3">🎉</div>
        <h2 className="text-4xl font-black text-white mb-1">It's a Match!</h2>
        <p className="text-white/60 text-lg mb-7">คุณ Match กับ {user.name}</p>
        <div className="flex items-center justify-center gap-6 mb-8">
          <img src={SELF_PHOTO} className="w-20 h-20 rounded-full object-cover ring-4 ring-green-500 shadow-xl" alt="" />
          <Heart size={36} className="text-red-400 drop-shadow-lg" fill="#f87171" />
          <img src={user.photo} className="w-20 h-20 rounded-full object-cover ring-4 ring-green-500 shadow-xl" alt="" />
        </div>
        <button onClick={() => { onClose(); onChat?.(); }} className="bg-green-600 text-white px-10 py-3.5 rounded-full font-bold text-lg hover:bg-green-700 transition-colors shadow-lg active:scale-95">เริ่มแชท</button>
        <button onClick={onClose} className="block mx-auto mt-3 text-white/40 text-sm hover:text-white/70 transition-colors">ดูต่อ</button>
      </motion.div>
    </motion.div>
  );
}

// ─── NAVIGATION ───────────────────────────────────────────────────────────────
const NAV: { id: MainTab; label: string; icon: React.ReactNode }[] = [
  { id: "swipe", label: "ปัด", icon: <Home size={22} /> },
  { id: "chat", label: "แชท", icon: <MessageCircle size={22} /> },
  { id: "sessions", label: "ห้องทั่วไป", icon: <CalendarDays size={22} /> },
  { id: "events", label: "กิจกรรม", icon: <Star size={22} /> },
  { id: "profile", label: "โปรไฟล์", icon: <User size={22} /> },
];

export function Sidebar({ tab, setTab, onNav, unread, view }: { tab: MainTab; setTab: (t: MainTab) => void; onNav: (v: View) => void; unread: number; view?: View }) {
  const lang = useLang(); const t = T[lang];
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => { await logout(); navigate("/auth", { replace: true }); };
  const displayName = user ? (user.nickname || `${user.firstName} ${user.lastName}`) : SELF_NAME;
  const navLabels: Record<string, string> = { swipe: t.nav_swipe, sessions: t.nav_sessions, chat: t.nav_chat, events: t.nav_events, profile: t.nav_profile };
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-white border-r border-border h-screen sticky top-0 overflow-hidden">
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-sm">S</div>
          <div className="min-w-0">
            <div className="font-black text-gray-900 leading-tight">Sports Match</div>
            <div className="text-[11px] text-muted-foreground">{t.university}</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)}
            className={`w-[calc(100%-16px)] mx-2 flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 ${tab === n.id ? "bg-green-50 text-green-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}>
            <span className={tab === n.id ? "text-green-600" : ""}>{n.icon}</span>{navLabels[n.id] ?? n.label}
            {n.id === "chat" && unread > 0 && <span className="ml-auto bg-green-600 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">{unread}</span>}
          </button>
        ))}
        <div className="h-px bg-border mx-4 my-2" />
        {([
          { icon: <Bell size={19} />, label: t.nav_notifs, badge: 2, action: () => onNav("notifications"), viewKey: "notifications" as View },
          { icon: <Search size={19} />, label: t.nav_search, action: () => onNav("search"), viewKey: "search" as View },
          { icon: <Settings size={19} />, label: t.nav_settings, action: () => onNav("settings"), viewKey: "settings" as View },
          ...(user?.role === "admin" ? [{ icon: <Shield size={19} />, label: t.admin_panel, action: () => onNav("admin"), purple: true }] : []),
          ...(user?.role === "event_organizer" ? [{ icon: <Briefcase size={19} />, label: t.organizer_panel, action: () => onNav("organizer"), purple: true }] : []),
        ] as { icon: React.ReactNode; label: string; badge?: number; action: () => void; purple?: boolean; viewKey?: View }[]).map(({ icon, label, badge, action, purple, viewKey }) => {
          const active = viewKey != null && view === viewKey;
          return (
            <button key={label} onClick={action}
              className={`w-[calc(100%-16px)] mx-2 flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 ${active ? "bg-green-50 text-green-700" : purple ? "text-purple-600 hover:bg-purple-50" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}>
              <span className={active ? "text-green-600" : ""}>{icon}</span>{label}
              {badge ? <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center">{badge}</span> : null}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2.5">
          <Av src={user?.photoUrl ?? ""} name={displayName} size="sm" online />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user?.email ?? SELF_EMAIL}</p>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors p-1"><LogOut size={16} /></button>
        </div>
      </div>
    </aside>
  );
}

export function BottomNav({ tab, setTab }: { tab: MainTab; setTab: (t: MainTab) => void }) {
  const lang = useLang(); const tr = T[lang];
  const navLabels: Record<string, string> = { swipe: tr.nav_swipe, sessions: tr.nav_sessions, chat: tr.nav_chat, events: tr.nav_events, profile: tr.nav_profile };
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-border z-30" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex h-16">
        {NAV.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${tab === n.id ? "text-green-600" : "text-gray-400 hover:text-gray-600"}`}>
            {n.icon}
            <span className="text-[10px] font-medium">{navLabels[n.id] ?? n.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
