import React, { useState } from "react";
import { motion } from "motion/react";
import { Shield, BarChart2, AlertTriangle, CalendarDays, Star, MapPin, Trophy, Users, Zap, Heart, Activity, TrendingUp, Plus, Edit3, Trash2, ChevronLeft, Camera, ThumbsUp, ThumbsDown, Search, UserX, RefreshCw, SlidersHorizontal, RotateCcw } from "lucide-react";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, PieChart, Pie, Cell } from "recharts";
import { T } from "../lang";
import type { AdminTab } from "../types";
import { REPORTS_DATA, SPORTS, VENUES, ACHIEVEMENTS, USERS, EVENTS, DAU_DATA, VENUE_HEAT } from "../data";
import { Av } from "../components/shared";

export function AdminPage({ onBack, onOrganize }: { onBack: () => void; onOrganize?: () => void }) {
  const t = T["th"];
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [reports, setReports] = useState(REPORTS_DATA);
  const [reportFilter, setReportFilter] = useState("ทั้งหมด");
  const [adminSports, setAdminSports] = useState(SPORTS);
  const [adminVenues, setAdminVenues] = useState(VENUES);
  const [adminAchievements, setAdminAchievements] = useState(ACHIEVEMENTS);
  const [adminUsers, setAdminUsers] = useState(USERS);
  const [adminEvents, setAdminEvents] = useState(EVENTS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSportModal, setShowSportModal] = useState(false);
  const [newSportName, setNewSportName] = useState("");
  const [editingSport, setEditingSport] = useState<string | null>(null);
  const [editSportName, setEditSportName] = useState("");
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [newVenueName, setNewVenueName] = useState("");
  const [editingVenue, setEditingVenue] = useState<string | null>(null);
  const [editVenueName, setEditVenueName] = useState("");
  const [showAchModal, setShowAchModal] = useState(false);
  const [newAchName, setNewAchName] = useState("");
  const [editingAch, setEditingAch] = useState<string | null>(null);
  const [editAchName, setEditAchName] = useState("");
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});
  const [heatSport, setHeatSport] = useState("");
  const [heatPeriod, setHeatPeriod] = useState("7 วันล่าสุด");
  const [showEventCreateModal, setShowEventCreateModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [editingAdminEvent, setEditingAdminEvent] = useState<string | null>(null);
  const [editAdminEventTitle, setEditAdminEventTitle] = useState("");
  const filteredReports = reportFilter === "ทั้งหมด" ? reports : reports.filter(r => r.status === reportFilter);
  const handleRefresh = () => { setIsRefreshing(true); setTimeout(() => setIsRefreshing(false), 800); };
  const adminTabs: { id: AdminTab; icon: React.ReactNode; label: string; badge?: number }[] = [
    { id: "dashboard", icon: <BarChart2 size={17} />, label: "Dashboard" },
    { id: "reports", icon: <AlertTriangle size={17} />, label: "Reports", badge: 2 },
    { id: "events", icon: <CalendarDays size={17} />, label: t.events_title },
    { id: "sports", icon: <Star size={17} />, label: t.sport },
    { id: "venues", icon: <MapPin size={17} />, label: t.venue },
    { id: "achievements", icon: <Trophy size={17} />, label: "Achievement" },
    { id: "roles", icon: <Users size={17} />, label: "ผู้ใช้" },
    { id: "heatmap", icon: <Zap size={17} />, label: "Heat Map" },
  ];
  const stats = [
    { label: "User Online", val: "1,247", sub: "+12%", grad: "from-green-500 to-emerald-600", icon: <Users size={22} /> },
    { label: "Match วันนี้", val: "89", sub: "+8%", grad: "from-pink-500 to-rose-600", icon: <Heart size={22} /> },
    { label: "DAU", val: "3,482", sub: "7 วันย้อนหลัง", grad: "from-blue-500 to-indigo-600", icon: <Activity size={22} /> },
    { label: "Report รอตรวจ", val: "7", sub: "ต้องดำเนินการ", grad: "from-red-500 to-rose-600", icon: <AlertTriangle size={22} /> },
  ];
  const pieData = [{ name: "แบด", value: 142 }, { name: "ฟุตบอล", value: 118 }, { name: "วิ่ง", value: 94 }, { name: "บาส", value: 76 }, { name: "อื่นๆ", value: 90 }];
  const pieColors = ["#16A34A", "#3B82F6", "#F59E0B", "#EC4899", "#8B5CF6"];
  return (
    <div className="flex h-full overflow-hidden">
      <aside className="hidden lg:flex flex-col w-52 shrink-0 bg-gray-950 text-white">
        <div className="p-4 border-b border-white/10 flex items-center gap-2.5"><Shield size={20} className="text-purple-400" /><span className="font-black text-sm">Admin Panel</span></div>
        <nav className="flex-1 py-3 overflow-y-auto">
          {adminTabs.map(tb => <button key={tb.id} onClick={() => setTab(tb.id)} className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold transition-colors ${tab === tb.id ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80 hover:bg-white/5"}`}>{tb.icon}{tb.label}{tb.badge ? <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{tb.badge}</span> : null}</button>)}
        </nav>
        <button onClick={onBack} className="p-4 border-t border-white/10 flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors"><ChevronLeft size={17} />{t.back_app}</button>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="lg:hidden overflow-x-auto border-b border-border shrink-0 bg-white"><div className="flex min-w-max">{adminTabs.map(tb => <button key={tb.id} onClick={() => setTab(tb.id)} className={`flex items-center gap-1.5 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${tab === tb.id ? "border-green-600 text-green-700" : "border-transparent text-muted-foreground"}`}>{tb.icon}{tb.label}</button>)}</div></div>
        <div className="flex items-center justify-between px-5 h-14 border-b border-border bg-white shrink-0">
          <div><h2 className="font-black text-gray-900">{adminTabs.find(tb => tb.id === tab)?.label}</h2><p className="text-[11px] text-muted-foreground">KU Sports Admin</p></div>
          <button onClick={handleRefresh} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"><RefreshCw size={17} className={isRefreshing ? "animate-spin" : ""} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {tab === "dashboard" && (
            <div className="space-y-5 max-w-5xl">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(s => <div key={s.label} className={`bg-gradient-to-br ${s.grad} text-white rounded-2xl p-4 shadow-sm`}><div className="flex items-start justify-between mb-3 opacity-80">{s.icon}<TrendingUp size={14} /></div><div className="text-3xl font-black">{s.val}</div><div className="text-sm font-bold mt-0.5">{s.label}</div><div className="text-xs opacity-60 mt-0.5">{s.sub}</div></div>)}
              </div>
              <div className="grid lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-4">
                  <h3 className="font-bold text-sm mb-4">Daily Active Users (7 วัน)</h3>
                  <ResponsiveContainer width="100%" height={200}><LineChart data={DAU_DATA}><CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" /><XAxis dataKey="d" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Line type="monotone" dataKey="v" stroke="#16A34A" strokeWidth={2.5} dot={{ fill: "#16A34A", r: 4 }} /></LineChart></ResponsiveContainer>
                </div>
                <div className="bg-white rounded-2xl border border-border p-4">
                  <h3 className="font-bold text-sm mb-4">กีฬายอดนิยม</h3>
                  <ResponsiveContainer width="100%" height={200}><PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>{pieData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
                  <div className="space-y-1 mt-2">{pieData.map((p, i) => <div key={p.name} className="flex items-center gap-2 text-xs"><div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: pieColors[i] }} /><span className="text-gray-600 flex-1">{p.name}</span><span className="font-bold text-gray-900">{p.value}</span></div>)}</div>
                </div>
              </div>
            </div>
          )}
          {tab === "reports" && (
            <div className="max-w-4xl">
              <div className="flex gap-2 mb-4">{["ทั้งหมด","รอตรวจ","อนุมัติ","ปฏิเสธ"].map(f => <button key={f} onClick={() => setReportFilter(f)} className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${reportFilter===f?"bg-gray-900 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{f}</button>)}</div>
              <div className="bg-white rounded-2xl border border-border overflow-hidden overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead className="bg-gray-50 border-b border-border"><tr>{["ผู้แจ้ง","ผู้ถูกแจ้ง","หมวดหมู่","หลักฐาน","สถานะ","วันที่","จัดการ"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-black text-muted-foreground">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-border">
                    {filteredReports.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-gray-900">{r.reporter}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.reported}</td>
                        <td className="px-4 py-3"><span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{r.cat}</span></td>
                        <td className="px-4 py-3">{r.cat==="No Show"?<div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200"><Camera size={14} className="text-gray-400"/></div>:<span className="text-xs text-muted-foreground">—</span>}</td>
                        <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.status==="รอตรวจ"?"bg-amber-100 text-amber-700":r.status==="อนุมัติ"?"bg-green-100 text-green-700":"bg-gray-100 text-gray-600"}`}>{r.status}</span></td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{r.date}</td>
                        <td className="px-4 py-3"><div className="flex gap-1.5">{r.status==="รอตรวจ"&&<><button onClick={() => setReports(p => p.map(x => x.id===r.id?{...x,status:"อนุมัติ"}:x))} className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"><ThumbsUp size={13} /></button><button onClick={() => setReports(p => p.map(x => x.id===r.id?{...x,status:"ปฏิเสธ"}:x))} className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"><ThumbsDown size={13} /></button></>}</div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {tab === "events" && (
            <div className="max-w-4xl">
              <div className="flex justify-end mb-4"><button onClick={() => { setNewEventTitle(""); setNewEventDate(""); setShowEventCreateModal(true); }} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 hover:bg-green-700"><Plus size={15} />สร้างกิจกรรม</button></div>
              <div className="space-y-3">
                {adminEvents.map(ev => (
                  <div key={ev.id} className="bg-white rounded-2xl border border-border p-4 flex gap-4 items-start group hover:border-green-300 transition-all">
                    <img src={ev.cover} className="w-24 h-16 rounded-xl object-cover shrink-0" alt="" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        {editingAdminEvent === ev.id
                          ? <input autoFocus value={editAdminEventTitle} onChange={e => setEditAdminEventTitle(e.target.value)} onBlur={() => { if (editAdminEventTitle.trim()) setAdminEvents(p => p.map(x => x.id === ev.id ? { ...x, title: editAdminEventTitle.trim() } : x)); setEditingAdminEvent(null); }} onKeyDown={e => { if (e.key === "Enter") { if (editAdminEventTitle.trim()) setAdminEvents(p => p.map(x => x.id === ev.id ? { ...x, title: editAdminEventTitle.trim() } : x)); setEditingAdminEvent(null); }}} className="flex-1 text-sm font-black border border-green-400 rounded-lg px-2 py-1 outline-none" />
                          : <h3 className="font-black text-gray-900 text-sm truncate">{ev.title}</h3>
                        }
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${ev.past ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-700"}`}>{ev.past ? "จัดไปแล้ว" : "กำลังจะมาถึง"}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2"><CalendarDays size={11} className="inline mr-1" />{ev.date} · <MapPin size={11} className="inline mr-0.5" />{ev.venue}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground"><span><Users size={11} className="inline mr-0.5" />{ev.participants}/{ev.max}</span><span>{ev.organizer}</span></div>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button onClick={() => onOrganize?.()} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 flex items-center gap-1"><SlidersHorizontal size={12} />จัดการ</button>
                      <button onClick={() => { setEditingAdminEvent(ev.id); setEditAdminEventTitle(ev.title); }} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200 flex items-center gap-1"><Edit3 size={12} />{t.edit}</button>
                      <button onClick={() => setAdminEvents(p => p.filter(x => x.id !== ev.id))} className="bg-red-50 text-red-500 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 flex items-center gap-1"><Trash2 size={12} />{t.delete}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "sports" && (
            <div className="max-w-3xl">
              <div className="flex justify-end mb-4"><button onClick={() => { setNewSportName(""); setShowSportModal(true); }} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 hover:bg-green-700"><Plus size={15} />เพิ่มกีฬา</button></div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {adminSports.map(s => <div key={s.id} className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3 group hover:border-green-300 transition-all cursor-pointer">{editingSport === s.id ? <input autoFocus value={editSportName} onChange={e => setEditSportName(e.target.value)} onBlur={() => { if (editSportName.trim()) setAdminSports(p => p.map(x => x.id === s.id ? { ...x, name: editSportName.trim() } : x)); setEditingSport(null); }} onKeyDown={e => { if (e.key === "Enter") { if (editSportName.trim()) setAdminSports(p => p.map(x => x.id === s.id ? { ...x, name: editSportName.trim() } : x)); setEditingSport(null); }}} className="flex-1 text-sm font-bold border border-green-400 rounded-lg px-2 py-1 outline-none" /> : <><div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center text-2xl">{s.emoji}</div><span className="flex-1 text-sm font-bold">{s.name}</span></>}<div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => { setEditingSport(s.id); setEditSportName(s.name); }} className="p-1.5 hover:bg-gray-100 rounded-lg"><Edit3 size={13} className="text-gray-400" /></button><button onClick={() => setAdminSports(p => p.filter(x => x.id !== s.id))} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={13} className="text-red-400" /></button></div></div>)}
              </div>
            </div>
          )}
          {tab === "venues" && (
            <div className="max-w-3xl">
              <div className="flex justify-end mb-4"><button onClick={() => { setNewVenueName(""); setShowVenueModal(true); }} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 hover:bg-green-700"><Plus size={15} />เพิ่มสนาม</button></div>
              <div className="space-y-2">
                {adminVenues.map(v => <div key={v} className="bg-white rounded-xl border border-border p-4 flex items-center gap-3 group hover:border-green-300 transition-all"><div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center"><MapPin size={17} className="text-green-600" /></div>{editingVenue === v ? <input autoFocus value={editVenueName} onChange={e => setEditVenueName(e.target.value)} onBlur={() => { if (editVenueName.trim()) setAdminVenues(p => p.map(x => x === v ? editVenueName.trim() : x)); setEditingVenue(null); }} onKeyDown={e => { if (e.key === "Enter") { if (editVenueName.trim()) setAdminVenues(p => p.map(x => x === v ? editVenueName.trim() : x)); setEditingVenue(null); }}} className="flex-1 text-sm font-bold border border-green-400 rounded-lg px-2 py-1 outline-none" /> : <span className="flex-1 text-sm font-bold">{v}</span>}<div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => { setEditingVenue(v); setEditVenueName(v); }} className="p-1.5 hover:bg-gray-100 rounded-lg"><Edit3 size={13} className="text-gray-400" /></button><button onClick={() => setAdminVenues(p => p.filter(x => x !== v))} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={13} className="text-red-400" /></button></div></div>)}
              </div>
            </div>
          )}
          {tab === "achievements" && (
            <div className="max-w-3xl">
              <div className="flex justify-end mb-4"><button onClick={() => { setNewAchName(""); setShowAchModal(true); }} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 hover:bg-green-700"><Plus size={15} />สร้าง Achievement</button></div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {adminAchievements.map(a => <div key={a.id} className="bg-white rounded-2xl border border-border p-4 group hover:border-amber-300 transition-all cursor-pointer"><div className="flex items-start justify-between mb-2.5"><div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-2xl">{a.icon}</div><div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => { setEditingAch(a.id); setEditAchName(a.name); }} className="p-1 hover:bg-gray-100 rounded-lg"><Edit3 size={13} className="text-gray-400" /></button><button onClick={() => setAdminAchievements(p => p.filter(x => x.id !== a.id))} className="p-1 hover:bg-red-50 rounded-lg"><Trash2 size={13} className="text-red-400" /></button></div></div>{editingAch === a.id ? <input autoFocus value={editAchName} onChange={e => setEditAchName(e.target.value)} onBlur={() => { if (editAchName.trim()) setAdminAchievements(p => p.map(x => x.id === a.id ? { ...x, name: editAchName.trim() } : x)); setEditingAch(null); }} onKeyDown={e => { if (e.key === "Enter") { if (editAchName.trim()) setAdminAchievements(p => p.map(x => x.id === a.id ? { ...x, name: editAchName.trim() } : x)); setEditingAch(null); }}} className="text-sm font-black border border-amber-400 rounded-lg px-2 py-1 outline-none w-full mb-1" /> : <p className="text-sm font-black text-gray-900">{a.name}</p>}<p className="text-xs text-muted-foreground mt-0.5">{a.cond}</p></div>)}
              </div>
            </div>
          )}
          {tab === "roles" && (
            <div className="max-w-3xl space-y-4">
              <div className="relative"><Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><input placeholder="ค้นหาผู้ใช้..." className="w-full bg-white border border-border rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100" /></div>
              {adminUsers.map(u => <div key={u.id} className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3 flex-wrap">
                <Av src={u.photo} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5"><p className="text-sm font-bold">{u.name}</p>{u.warning&&<span className="inline-flex items-center gap-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full"><AlertTriangle size={9}/>No Show</span>}</div>
                  <p className="text-xs text-muted-foreground">65XXXXXXX@ku.th</p>
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                  {u.warning&&<button onClick={() => setAdminUsers(p => p.map(x => x.id === u.id ? {...x, warning: false} : x))} className="p-2 bg-orange-50 hover:bg-orange-100 rounded-xl text-orange-500 flex items-center gap-1 text-xs font-bold"><RotateCcw size={13}/>Reset</button>}
                  <select value={userRoles[u.id] || "User"} onChange={e => setUserRoles(p => ({ ...p, [u.id]: e.target.value }))} className="bg-gray-100 border-0 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-green-200"><option>User</option><option>ผู้จัดกิจกรรม</option><option>Admin</option></select>
                  <button onClick={() => setAdminUsers(p => p.filter(x => x.id !== u.id))} className="p-2 hover:bg-red-50 rounded-xl text-red-400"><UserX size={15} /></button>
                </div>
              </div>)}
            </div>
          )}
          {tab === "heatmap" && (
            <div className="max-w-3xl space-y-4">
              <div className="flex gap-3 flex-wrap">
                <select value={heatSport} onChange={e => setHeatSport(e.target.value)} className="bg-white border border-border rounded-xl px-3 py-2 text-sm font-semibold outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"><option value="">ทุกกีฬา</option>{SPORTS.slice(0,6).map(s=><option key={s.id} value={s.name}>{s.emoji} {s.name}</option>)}</select>
                <select value={heatPeriod} onChange={e => setHeatPeriod(e.target.value)} className="bg-white border border-border rounded-xl px-3 py-2 text-sm font-semibold outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"><option>7 วันล่าสุด</option><option>30 วันล่าสุด</option><option>ทั้งหมด</option></select>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {VENUE_HEAT.filter(v => !heatSport || v.name.toLowerCase().includes(heatSport.toLowerCase())).map(v => (
                  <div key={v.name} className="bg-white rounded-2xl border border-border p-4">
                    <div className="flex items-center justify-between mb-2.5"><span className="text-sm font-bold text-gray-900">{v.name}</span><span className="text-sm font-black" style={{ color: `hsl(${120*v.pct/100},60%,40%)` }}>{v.pct}%</span></div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${v.pct}%` }} transition={{ duration: 0.9 }} className="h-full rounded-full" style={{ background: `hsl(${120*v.pct/100},60%,45%)` }} /></div>
                    <div className="flex justify-between mt-2"><span className="text-xs text-muted-foreground">{v.sessions} sessions</span><span className="text-xs text-muted-foreground">{heatPeriod}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {showSportModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"><div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl"><h3 className="font-bold text-lg mb-4">เพิ่มกีฬาใหม่</h3><input autoFocus value={newSportName} onChange={e => setNewSportName(e.target.value)} placeholder="ชื่อกีฬา" className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500 mb-4" /><div className="flex gap-2"><button onClick={() => setShowSportModal(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-gray-600 hover:bg-gray-50">{t.cancel}</button><button onClick={() => { if (newSportName.trim()) { setAdminSports(p => [...p, { id: Date.now().toString(), name: newSportName.trim(), emoji: "🏅" }]); setShowSportModal(false); }}} disabled={!newSportName.trim()} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-40">{t.add}</button></div></div></div>}
      {showVenueModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"><div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl"><h3 className="font-bold text-lg mb-4">เพิ่มสนามใหม่</h3><input autoFocus value={newVenueName} onChange={e => setNewVenueName(e.target.value)} placeholder="ชื่อสนาม" className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500 mb-4" /><div className="flex gap-2"><button onClick={() => setShowVenueModal(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-gray-600 hover:bg-gray-50">{t.cancel}</button><button onClick={() => { if (newVenueName.trim()) { setAdminVenues(p => [...p, newVenueName.trim()]); setShowVenueModal(false); }}} disabled={!newVenueName.trim()} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-40">{t.add}</button></div></div></div>}
      {showAchModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"><div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl"><h3 className="font-bold text-lg mb-4">สร้าง Achievement</h3><input autoFocus value={newAchName} onChange={e => setNewAchName(e.target.value)} placeholder="ชื่อ Achievement" className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500 mb-4" /><div className="flex gap-2"><button onClick={() => setShowAchModal(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-gray-600 hover:bg-gray-50">{t.cancel}</button><button onClick={() => { if (newAchName.trim()) { setAdminAchievements(p => [...p, { id: Date.now().toString(), name: newAchName.trim(), icon: "🏆", cond: "เงื่อนไขใหม่", desc: "", done: false }]); setShowAchModal(false); }}} disabled={!newAchName.trim()} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-40">{t.create}</button></div></div></div>}
      {showEventCreateModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"><div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl"><h3 className="font-bold text-lg mb-4">{t.create_event_new}</h3><input autoFocus value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} placeholder={t.event_name} className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500 mb-3" /><input type="date" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500 mb-4" /><div className="flex gap-2"><button onClick={() => setShowEventCreateModal(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-gray-600 hover:bg-gray-50">{t.cancel}</button><button onClick={() => { if (newEventTitle.trim()) { setAdminEvents(p => [...p, { id: Date.now().toString(), title: newEventTitle.trim(), cover: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=400&fit=crop&auto=format", date: newEventDate || "TBD", time: "TBD", venue: "TBD", participants: 0, max: 100, organizer: "Admin", sports: [], desc: "", past: false }]); setShowEventCreateModal(false); }}} disabled={!newEventTitle.trim()} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-40">{t.create}</button></div></div></div>}
    </div>
  );
}
