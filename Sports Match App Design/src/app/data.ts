export const SPORTS = [
  { id: "badminton", name: "แบดมินตัน", emoji: "🏸" },
  { id: "football", name: "ฟุตบอล", emoji: "⚽" },
  { id: "basketball", name: "บาสเกตบอล", emoji: "🏀" },
  { id: "tennis", name: "เทนนิส", emoji: "🎾" },
  { id: "running", name: "วิ่ง", emoji: "🏃" },
  { id: "swimming", name: "ว่ายน้ำ", emoji: "🏊" },
  { id: "volleyball", name: "วอลเลย์บอล", emoji: "🏐" },
  { id: "tabletennis", name: "ปิงปอง", emoji: "🏓" },
  { id: "futsal", name: "ฟุตซอล", emoji: "🥅" },
  { id: "muaythai", name: "มวยไทย", emoji: "🥊" },
  { id: "golf", name: "กอล์ฟ", emoji: "⛳" },
  { id: "cycling", name: "จักรยาน", emoji: "🚴" },
];
export const LEVELS = [
  { id: "beginner", name: "ผู้เริ่มต้น", desc: "เพิ่งเริ่มเล่น ยังไม่ชำนาญ", color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  { id: "intermediate", name: "ระดับกลาง", desc: "เล่นได้สักพัก รู้เทคนิคพื้นฐาน", color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  { id: "advanced", name: "ระดับสูง", desc: "เล่นมาหลายปี ค่อนข้างเชี่ยวชาญ", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  { id: "competitive", name: "แข่งขัน", desc: "เคยแข่งขันในรายการต่างๆ", color: "bg-pink-100 text-pink-700", dot: "bg-pink-500" },
];
export const VENUES = [
  "สนามกีฬากลาง มก.", "สระว่ายน้ำ มก.", "สนามบาสเกตบอล อาคารจุฬา",
  "สนามฟุตบอลหญ้าเทียม", "สนามแบดมินตัน อาคารกีฬา",
  "สนามเทนนิส มก.", "ลู่วิ่งสนามกีฬา", "สนามวอลเลย์บอล",
];
export const DAYS = ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"];

export const SELF_PHOTO = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&auto=format";
export const SELF_NAME = "สมชาย ใจดี";
export const SELF_EMAIL = "65010001@ku.th";
export const USERS = [
  { id: "u1", name: "ปรีดา สุขสวัสดิ์", nick: "ปีเตอร์", age: 21, sport: "แบดมินตัน", sportEmoji: "🏸", level: "ระดับกลาง", levelColor: "bg-blue-100 text-blue-700", venue: "สนามแบดมินตัน อาคารกีฬา", avail: "จ–พ · 17:00–20:00", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&auto=format", warning: false },
  { id: "u2", name: "นลินี วงษ์เจริญ", nick: "นิน", age: 20, sport: "วิ่ง", sportEmoji: "🏃", level: "ผู้เริ่มต้น", levelColor: "bg-emerald-100 text-emerald-700", venue: "ลู่วิ่งสนามกีฬา", avail: "ส–อา · 06:00–08:00", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&auto=format", warning: false },
  { id: "u3", name: "ธนกร มีมาก", nick: "ต้น", age: 22, sport: "บาสเกตบอล", sportEmoji: "🏀", level: "ระดับสูง", levelColor: "bg-amber-100 text-amber-700", venue: "สนามบาสเกตบอล อาคารจุฬา", avail: "อ–ศ · 18:00–21:00", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&auto=format", warning: true },
  { id: "u4", name: "พิมพ์ลดา ชื่นใจ", nick: "พิม", age: 19, sport: "เทนนิส", sportEmoji: "🎾", level: "ระดับกลาง", levelColor: "bg-blue-100 text-blue-700", venue: "สนามเทนนิส มก.", avail: "พฤ–ส · 15:00–18:00", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop&auto=format", warning: false },
];
export const MATCHES = [
  { id: "m1", uid: "u1", name: "ปรีดา สุขสวัสดิ์", sport: "แบดมินตัน", sportEmoji: "🏸", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format", lastMsg: "ว่างพรุ่งนี้มั้ย?", time: "5 นาที", unread: 2, online: true },
  { id: "m2", uid: "u2", name: "นลินี วงษ์เจริญ", sport: "วิ่ง", sportEmoji: "🏃", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&auto=format", lastMsg: "ขอบคุณมากนะ!", time: "1 ชม.", unread: 0, online: true },
  { id: "m3", uid: "u4", name: "พิมพ์ลดา ชื่นใจ", sport: "เทนนิส", sportEmoji: "🎾", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format", lastMsg: "ข้อความถูกยกเลิก", time: "3 ชม.", unread: 0, online: false, unsent: true },
];
export type Msg = { id: string; from: "me" | "other"; text: string; time: string; type?: "invite"; unsent?: boolean };
export const MESSAGES: Record<string, Msg[]> = {
  m1: [
    { id: "1", from: "other", text: "สวัสดีครับ 👋 ยินดีที่ได้รู้จัก", time: "10:00" },
    { id: "2", from: "me", text: "สวัสดีครับ! ยินดีเช่นกัน 😊", time: "10:01" },
    { id: "3", from: "other", text: "เล่นแบดมินตันด้วยกันได้เลยนะครับ ว่างพรุ่งนี้มั้ย?", time: "10:02" },
  ],
  m2: [
    { id: "1", from: "other", text: "ไปวิ่งด้วยกันได้เลยนะค่ะ", time: "09:00" },
    { id: "2", from: "me", text: "เยี่ยมเลย! เช้าเสาร์ได้มั้ย", time: "09:05" },
    { id: "3", from: "other", text: "ได้เลยค่ะ 6 โมงเช้าเลยนะ", time: "09:06" },
    { id: "4", from: "me", text: "โอเค เจอกันที่ลู่วิ่งนะ", time: "09:07" },
    { id: "5", from: "other", text: "ขอบคุณมากนะ!", time: "09:30" },
  ],
  m3: [
    { id: "1", from: "other", text: "เทนนิสด้วยกันได้มั้ยคะ", time: "08:00" },
    { id: "2", from: "me", text: "ได้เลยครับ", time: "08:05" },
    { id: "3", from: "other", text: "ข้อความถูกยกเลิก", time: "08:10", unsent: true },
  ],
};
export const SESSIONS = [
  { id: "s1", sport: "แบดมินตัน", emoji: "🏸", title: "หาคู่แบด 2v2 บ่ายนี้", date: "28 มิ.ย. 68", time: "17:00–19:00", venue: "สนามแบดมินตัน อาคารกีฬา", level: "ระดับกลาง", levelColor: "bg-blue-100 text-blue-700", cur: 2, max: 4, equipment: true, creator: "ปรีดา" },
  { id: "s2", sport: "ฟุตบอล", emoji: "⚽", title: "5v5 ฟุตบอลหญ้าเทียม", date: "29 มิ.ย. 68", time: "18:00–20:00", venue: "สนามฟุตบอลหญ้าเทียม", level: "ผู้เริ่มต้น", levelColor: "bg-emerald-100 text-emerald-700", cur: 7, max: 10, equipment: false, creator: "ธนกร" },
  { id: "s3", sport: "บาสเกตบอล", emoji: "🏀", title: "3on3 บาสเกตบอล", date: "30 มิ.ย. 68", time: "16:00–18:00", venue: "สนามบาสเกตบอล อาคารจุฬา", level: "ระดับสูง", levelColor: "bg-amber-100 text-amber-700", cur: 5, max: 6, equipment: true, creator: "ธนกร" },
  { id: "s4", sport: "วิ่ง", emoji: "🏃", title: "วิ่งเช้าเสาร์ 5K", date: "5 ก.ค. 68", time: "06:00–08:00", venue: "ลู่วิ่งสนามกีฬา", level: "ผู้เริ่มต้น", levelColor: "bg-emerald-100 text-emerald-700", cur: 3, max: 15, equipment: false, creator: "นลินี" },
  { id: "s5", sport: "เทนนิส", emoji: "🎾", title: "ฝึกซ้อมเทนนิสคู่", date: "2 ก.ค. 68", time: "15:00–17:00", venue: "สนามเทนนิส มก.", level: "ระดับกลาง", levelColor: "bg-blue-100 text-blue-700", cur: 1, max: 2, equipment: true, creator: "พิมพ์ลดา" },
  { id: "s6", sport: "วอลเลย์บอล", emoji: "🏐", title: "วอลเลย์บอล 6v6", date: "3 ก.ค. 68", time: "17:00–19:00", venue: "สนามวอลเลย์บอล", level: "ระดับกลาง", levelColor: "bg-blue-100 text-blue-700", cur: 8, max: 12, equipment: false, creator: "สมหมาย" },
];
export const EVENTS = [
  { id: "e1", title: "KU Sports Day 2568", cover: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=400&fit=crop&auto=format", date: "5 ก.ค. 68", time: "09:00–17:00", venue: "สนามกีฬากลาง มก.", participants: 342, max: 500, organizer: "กองกิจการนิสิต", sports: ["ฟุตบอล", "บาสเกตบอล", "วอลเลย์บอล"], desc: "งานกีฬาประจำปีของมหาวิทยาลัย เปิดรับนิสิตทุกคณะ", past: false },
  { id: "e2", title: "KU Running Club Marathon", cover: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop&auto=format", date: "12 ก.ค. 68", time: "05:30–09:00", venue: "ลู่วิ่งสนามกีฬา", participants: 128, max: 200, organizer: "ชมรมวิ่ง มก.", sports: ["วิ่ง"], desc: "วิ่งมาราธอนประจำเดือน ระยะ 5K และ 10K", past: false },
  { id: "e3", title: "KU Badminton Open 2568", cover: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&h=400&fit=crop&auto=format", date: "19 ก.ค. 68", time: "08:00–18:00", venue: "สนามแบดมินตัน อาคารกีฬา", participants: 64, max: 128, organizer: "สโมสรนิสิต", sports: ["แบดมินตัน"], desc: "การแข่งขันแบดมินตันเปิดระดับมหาวิทยาลัย", past: false },
  { id: "e4", title: "KU Football Cup 2567", cover: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=400&fit=crop&auto=format", date: "10 มี.ค. 67", time: "08:00–18:00", venue: "สนามฟุตบอลหญ้าเทียม", participants: 200, max: 200, organizer: "กองกิจการนิสิต", sports: ["ฟุตบอล"], desc: "การแข่งขันฟุตบอลประจำปี 2567 (จัดไปแล้ว)", past: true },
];
export const DEVICES = [
  { id: "d1", name: "iPhone 14 Pro", type: "mobile", location: "กำแพงแสน", lastActive: "ตอนนี้", current: true },
  { id: "d2", name: "MacBook Pro", type: "desktop", location: "กำแพงแสน", lastActive: "2 ชั่วโมงที่แล้ว", current: false },
  { id: "d3", name: "Samsung Galaxy S23", type: "mobile", location: "กรุงเทพฯ", lastActive: "เมื่อวาน", current: false },
];
export const NOTIFS = [
  { id: "n1", icon: "💚", text: "คุณ Match กับ ปรีดา สุขสวัสดิ์", sub: "เริ่มแชทและนัดเล่นกีฬากันได้เลย", time: "5 นาทีที่แล้ว", read: false, target: "chat" },
  { id: "n2", icon: "💬", text: "นลินี ส่งข้อความมาหาคุณ", sub: "ไปวิ่งด้วยกันได้เลยนะค่ะ", time: "12 นาทีที่แล้ว", read: false, target: "chat" },
  { id: "n3", icon: "🏸", text: "ปรีดา ส่ง Sport Invite", sub: "แบดมินตัน · 28 มิ.ย. 17:00", time: "1 ชั่วโมงที่แล้ว", read: true, target: "chat" },
  { id: "n4", icon: "👥", text: "มีผู้เล่นเข้าร่วม Session ของคุณ", sub: "5v5 ฟุตบอลหญ้าเทียม มีคน Join แล้ว", time: "2 ชั่วโมงที่แล้ว", read: true, target: "sessions" },
  { id: "n5", icon: "🏆", text: "ปลดล็อก Achievement ใหม่!", sub: "นักกีฬามือใหม่ — เข้าร่วม Session ครั้งแรก", time: "1 วันที่แล้ว", read: true, target: "profile" },
  { id: "n6", icon: "⚠️", text: "คำเตือน No Show — ครบ 5 ครั้งแล้ว", sub: "โปรไฟล์ของคุณมีป้ายเตือน กรุณาให้เกียรตินัดหมาย", time: "2 วันที่แล้ว", read: true, target: null },
  { id: "n7", icon: "📋", text: "Admin ตัดสิน Report แล้ว", sub: "Report ที่คุณส่งเมื่อ 25 มิ.ย. ได้รับการอนุมัติ", time: "3 วันที่แล้ว", read: true, target: null },
];
export const ACHIEVEMENTS = [
  { id: "a1", icon: "🥇", name: "นักกีฬามือใหม่", desc: "เข้าร่วม Session ครั้งแรก", cond: "1 Session", done: true, date: "15 มิ.ย. 68" },
  { id: "a2", icon: "🔥", name: "ติดลมบน", desc: "เข้าร่วม 5 Session ติดต่อกัน", cond: "5 Session ติด", done: true, date: "22 มิ.ย. 68" },
  { id: "a3", icon: "🤝", name: "เพื่อนกีฬา", desc: "Match สำเร็จ 5 คน", cond: "Match 5 คน", done: true, date: "25 มิ.ย. 68" },
  { id: "a4", icon: "⚡", name: "ฟ้าผ่า", desc: "เข้าร่วม Event ครั้งแรก", cond: "1 Event", done: true, date: "20 มิ.ย. 68" },
  { id: "a5", icon: "🌟", name: "ดาวเด่น", desc: "เข้าร่วม 20 Session", cond: "20 Session", done: false, date: "" },
  { id: "a6", icon: "🏟️", name: "ขาประจำ", desc: "ใช้สนาม 5 สนามต่างกัน", cond: "5 สนาม", done: false, date: "" },
  { id: "a7", icon: "🎯", name: "หลายพรสวรรค์", desc: "เล่นกีฬา 3 ประเภทขึ้นไป", cond: "3 กีฬา", done: false, date: "" },
  { id: "a8", icon: "👑", name: "ราชาสนาม", desc: "เล่นกีฬาครบ 50 ครั้ง", cond: "50 Session", done: false, date: "" },
];
export const HISTORY = [
  { id: "h1", emoji: "🏸", title: "แบด 2v2 กับปรีดา", date: "25 มิ.ย. 68", venue: "สนามแบดมินตัน อาคารกีฬา", players: 4 },
  { id: "h2", emoji: "⚽", title: "5v5 ฟุตบอลเพื่อน", date: "20 มิ.ย. 68", venue: "สนามฟุตบอลหญ้าเทียม", players: 10 },
  { id: "h3", emoji: "🏃", title: "วิ่งเช้าเสาร์", date: "15 มิ.ย. 68", venue: "ลู่วิ่งสนามกีฬา", players: 8 },
  { id: "h4", emoji: "🏸", title: "แบดมินตันตอนเย็น", date: "10 มิ.ย. 68", venue: "สนามแบดมินตัน อาคารกีฬา", players: 4 },
  { id: "h5", emoji: "🏀", title: "3on3 บาส", date: "5 มิ.ย. 68", venue: "สนามบาสเกตบอล อาคารจุฬา", players: 6 },
];
export const DAU_DATA = [
  { d: "จ", v: 2840 }, { d: "อ", v: 3120 }, { d: "พ", v: 3480 },
  { d: "พฤ", v: 2960 }, { d: "ศ", v: 3820 }, { d: "ส", v: 4210 }, { d: "อา", v: 3950 },
];
export const SPORT_POP = [
  { s: "แบด", n: 142 }, { s: "ฟุตบอล", n: 118 }, { s: "วิ่ง", n: 94 },
  { s: "บาส", n: 76 }, { s: "เทนนิส", n: 52 }, { s: "ว่ายน้ำ", n: 38 },
];
export const REPORTS_DATA = [
  { id: "r1", reporter: "นลินี", reported: "ธนกร", cat: "No Show", status: "รอตรวจ", date: "28 มิ.ย. 68" },
  { id: "r2", reporter: "พิมพ์ลดา", reported: "ปรีดา", cat: "โปรไฟล์ปลอม", status: "รอตรวจ", date: "27 มิ.ย. 68" },
  { id: "r3", reporter: "ธนกร", reported: "นลินี", cat: "คุกคาม", status: "อนุมัติ", date: "25 มิ.ย. 68" },
  { id: "r4", reporter: "สมหมาย", reported: "พิมพ์ลดา", cat: "เนื้อหาไม่เหมาะสม", status: "ปฏิเสธ", date: "24 มิ.ย. 68" },
];
export const VENUE_HEAT = [
  { name: "สนามแบดมินตัน", pct: 92, sessions: 142 },
  { name: "สนามฟุตบอล", pct: 85, sessions: 118 },
  { name: "สนามบาสเกตบอล", pct: 74, sessions: 96 },
  { name: "ลู่วิ่ง", pct: 68, sessions: 87 },
  { name: "สระว่ายน้ำ", pct: 55, sessions: 64 },
  { name: "สนามเทนนิส", pct: 48, sessions: 52 },
  { name: "สนามวอลเลย์บอล", pct: 42, sessions: 48 },
  { name: "สนามกีฬากลาง", pct: 36, sessions: 38 },
];
export const ORG_EVENTS = [
  { id: "oe1", title: "KU Badminton Open 2568", date: "19 ก.ค. 68", participants: 64, checkins: 41, status: "กำลังจะมาถึง" },
  { id: "oe2", title: "ชมรมแบดมินตัน Mini Tournament", date: "10 มิ.ย. 68", participants: 32, checkins: 30, status: "จบแล้ว" },
];
