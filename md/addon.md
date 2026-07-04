---
noteId: "addon-buttons-functional"
tags: []

---

# Addon: ปุ่มทุกปุ่มในแอปทำงานได้

---

## หน้า Auth (Register/Login)

- **Mode switch (Login ↔ Register)** — เคลียร์ฟิลด์ชื่อ, นามสกุล, ยืนยันรหัสผ่าน และ error ทุกครั้งที่สลับโหมด

---

## หน้า Session Create

- **Toggle "มีอุปกรณ์กีฬา"** — เพิ่ม state `equip` ให้ toggle เปิด/ปิดได้จริง มีแอนิเมชัน
- **ปุ่ม "สร้าง Session"** — แสดงหน้า Success พร้อมชื่อ Session ที่กรอก แล้วกดกลับหน้า Session ได้

---

## หน้า Event

- **ปุ่ม Filter (รูปกรวย)** — เปิด bottom sheet ให้กรองได้ตาม:
  - สถานะ: ทั้งหมด / กำลังจะมาถึง / จัดไปแล้ว
  - กีฬา: ฟุตบอล, บาสเกตบอล, วอลเลย์บอล, วิ่ง, แบดมินตัน
  - แสดงจำนวนผลลัพธ์บนปุ่ม "ดูผลลัพธ์"
  - ปุ่ม "รีเซ็ต" ล้าง filter ทั้งหมด
  - มี dot indicator สีเขียวบนปุ่ม Filter เมื่อมี filter ที่ active

---

## หน้า Profile Other (โปรไฟล์คนอื่น)

- **ปุ่ม "แชท"** — นำทางไปยังแท็บ Chat พร้อมเปิดหน้าแชท (disable เมื่อถูกบล็อก)
- **ปุ่ม Block** — toggle บล็อก/unblock ผู้ใช้
  - เมื่อบล็อก: ปุ่มเปลี่ยนเป็นสีแดงทึบ, แสดง badge "บล็อกแล้ว", ปุ่มแชท disabled
  - เมื่อ unblock: กลับสู่สถานะปกติ

---

## หน้า Settings (ตั้งค่า)

- **Toggle แจ้งเตือน Match / แจ้งเตือนแชท** — toggle เปิด/ปิดได้จริง มีแอนิเมชันเลื่อน
- **"เปลี่ยนรหัสผ่าน"** — เปิด dialog กรอกรหัสผ่านเดิม + ใหม่ (validate อย่างน้อย 6 ตัว) แสดงหน้า success
- **"รายชื่อที่บล็อก"** — เปิด dialog แสดงรายชื่อที่บล็อก
- **"Report ที่ส่ง"** — เปิด dialog แสดงประวัติ Report พร้อมสถานะ
- **"ออกจากระบบ" ของแต่ละอุปกรณ์** — ลบอุปกรณ์นั้นออกจากรายการทันที
- **"ออกจากระบบทุกอุปกรณ์"** — ล้างรายการอุปกรณ์ทั้งหมดและ redirect ไปหน้า Auth
- **"ออกจากระบบ (เครื่องนี้)"** — redirect ไปหน้า Auth

---

## หน้า Search (ค้นหา)

- **คลิกผลลัพธ์ Session** — นำทางไปยังแท็บ Sessions
- **คลิกผลลัพธ์ Event** — นำทางไปยังหน้า Event Detail ของ Event นั้นโดยตรง
- **ปุ่ม ChevronRight** — แสดงบน card ผลลัพธ์ทุกรายการเพื่อบ่งบอก interactive

---

## หน้า Chat

- **ปุ่มรูปภาพ (ImageIcon)** — เปิด file picker เลือกรูปภาพ แล้วส่งข้อความ "📷 filename" เข้าแชท scroll ลงล่างอัตโนมัติ
- **ปุ่มค้นหา (🔍) ใน chat list** — toggle ช่องค้นหา กรองรายชื่อ Match ได้แบบ real-time
- **ปุ่ม "ปฏิเสธ" ใน Sport Invite** — เปลี่ยนสถานะ Invite เป็น "ปฏิเสธแล้ว"

---

## หน้า Edit Profile

- **ปุ่ม Camera (รูปหลัก)** — กด trigger file input เพื่อเปลี่ยนรูปโปรไฟล์หลัก
- **ปุ่ม "เพิ่มรูป"** — เปิด file picker เลือกรูปเพิ่ม
- **ปุ่ม X สนามประจำ** — ลบสนามนั้นออกจาก list ทันที
- **ปุ่ม "บันทึก"** — แสดง toast "บันทึกสำเร็จ!" พร้อม navigate กลับ

---

## Event Organizer

- **Filter สมาชิก (ทั้งหมด / Check-in / ยังไม่มา)** — กรองรายชื่อสมาชิกจริง
- **ปุ่ม "สร้าง" (Event)** — เปิด modal กรอกชื่อ Event + วันที่ กด "สร้าง" ปิด modal
- **ปุ่ม "จัดการ"** — เปิด bottom sheet แสดงสถิติ Event + ลิงก์ไป QR Check-in / ส่งประกาศ / ดูสมาชิก
- **ปุ่ม Edit (✏️) ข้าง Event** — เปิด modal แก้ไขชื่อ Event บันทึกได้ทันที
- **ปุ่มลบ (🗑️) ข้าง Event** — ลบ Event ออกจากรายการ
- **ปุ่ม Export ใน Stats** — แสดงสถานะ "Exported!" พร้อม checkmark 2 วินาที
- **ปุ่ม UserX ใน Members** — ลบสมาชิกออกจากรายการ (เก็บสถานะ Check-in ถูกต้อง)
- **แท็บ "ประกาศ" (Megaphone)** — เพิ่มแท็บที่ 5 ให้เลือกได้ ประกอบด้วย:
  - Form กรอกหัวข้อ + รายละเอียด แล้วกด "ส่งประกาศ" (validate ต้องกรอกครบ)
  - แสดงรายการประกาศที่ส่งแล้ว
  - ปุ่มลบประกาศแต่ละรายการ

---

## Admin Panel

- **Report filter pills (ทั้งหมด / รอตรวจ / อนุมัติ / ปฏิเสธ)** — กรองตารางรายงานจริง pill ที่เลือกเปลี่ยนสี
- **ปุ่ม Refresh (🔄)** — มีแอนิเมชัน spin 0.8 วินาที
- **ปุ่ม "เพิ่มกีฬา"** — เปิด modal กรอกชื่อกีฬา กด "เพิ่ม" เพิ่มลง list พร้อม emoji 🏅
- **ปุ่มแก้ไข (✏️) ใน Sports** — คลิก inline เปลี่ยนชื่อกีฬาได้ทันที (Enter หรือ blur บันทึก)
- **ปุ่มลบ (🗑️) ใน Sports** — ลบกีฬานั้นออกจาก list
- **ปุ่ม "เพิ่มสนาม"** — เปิด modal กรอกชื่อสนาม กด "เพิ่ม" เพิ่มลง list
- **ปุ่มแก้ไข (✏️) ใน Venues** — คลิก inline เปลี่ยนชื่อสนามได้ทันที (Enter หรือ blur บันทึก)
- **ปุ่มลบ (🗑️) ใน Venues** — ลบสนามนั้นออกจาก list
- **ปุ่ม "สร้าง Achievement"** — เปิด modal กรอกชื่อ Achievement กด "สร้าง" เพิ่มลง list
- **ปุ่มแก้ไข (✏️) ใน Achievements** — คลิก inline เปลี่ยนชื่อ Achievement ได้ทันที
- **ปุ่มลบ (🗑️) ใน Achievements** — ลบ Achievement นั้นออกจาก list
- **ปุ่ม UserX ใน Roles** — ลบผู้ใช้นั้นออกจากรายการ
- **ปุ่ม Reset No Show (↺) ใน Roles** — ล้าง No Show warning ของผู้ใช้ badge หายทันที

---

## หน้า Swipe / Match Overlay

- **รายชื่อ Match (desktop sidebar)** — เปลี่ยนจาก `<div>` เป็น `<button>` คลิกแล้วนำทางไปยังแท็บ Chat
- **ปุ่ม "เริ่มแชท" ใน Match Overlay** — ปิด overlay และ navigate ไปยังแท็บ Chat ทันที

---

## หน้า Onboarding ขั้นที่ 5 (รูปโปรไฟล์)

- **รูปหลัก (กล้อง)** — คลิก toggle เป็น "เลือกแล้ว" (เปลี่ยนสีและ icon เป็น checkmark)
- **รูปเพิ่มเติม (+)** — คลิก toggle เพิ่ม/ยกเลิก แต่ละช่อง (เปลี่ยนสีและ icon)

---

## ระบบ 2 ภาษา (Thai / English)

- **`LangCtx` (React Context)** — เก็บภาษาปัจจุบัน (`"th"` หรือ `"en"`) ระดับ root
- **`T` (Translation Dictionary)** — object ที่มี key ครบทุก string ใน UI ทั้ง `th` และ `en`
- **`useLang()` hook** — ดึงภาษาปัจจุบันภายใน component ใดก็ได้
- **SettingsPage** — รับ prop `onLangChange` → toggle ภาษาใน section "เครื่องมือ/Tools"
  - กด "ภาษา / Language" จะสลับระหว่าง ไทย ↔ English ทันที
- **`LangCtx.Provider`** — ครอบทุก view รวมถึง Auth, Onboard, Admin, Organizer
- **Component ที่รองรับ 2 ภาษาครบ:**
  - AuthPage (Login/Register — labels, errors, tagline, university)
  - Sidebar & BottomNav (nav labels ทุกแท็บ + Notifications, Search, Settings, Admin)
  - SwipePage (filter: กีฬา, ระดับ, วันที่ว่าง, ปุ่ม apply/reset)
  - SessionsPage (title, create, filter, labels)
  - SessionCreatePage (labels ทุก field + success screen)
  - ChatPage (header, invite form, message input)
  - EventsPage (title, filter: สถานะ/กีฬา, upcoming/past labels)
  - ProfilePage (verified badge, stats labels, info tab labels)
  - EditProfilePage (section titles, labels, buttons)
  - NotifsPage (title, mark all read)
  - SearchPage (placeholder, result labels, filter labels)
  - SettingsPage (sections, toggle labels, dialogs, device list, logout buttons)
  - OrganizerPage (title, tab labels, event action buttons, announce section, modals)
  - AdminPage (tab labels, back button, modals)

---

## สิ่งที่ทำงานได้อยู่แล้วก่อนหน้า (ยืนยัน)

- ปุ่ม Like / Pass บนหน้า Swipe
- แชทส่งข้อความ / unsend / Sport Invite / ตอบรับ/ปฏิเสธ Invite
- Join / Leave / ยุบ Session, Kick สมาชิก
- Report page (เลือกหมวด + แนบหลักฐาน + ส่ง)
- แจ้งเตือน click → นำทางไปหน้าที่เกี่ยวข้อง
- Admin Reports thumbsup/thumbsdown อนุมัติ/ปฏิเสธ
- QR Code Check-in, Organizer QR Scan จำลอง
- Onboarding ทุก step
- BottomNav และ Sidebar ทุกแท็บ
