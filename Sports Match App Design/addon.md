---
noteId: "a51e7710745711f1a7db05e25f54ecd5"
tags: []

---

# addon.md — สรุปการแก้ไขและฟีเจอร์ที่เพิ่มเติม

## ฟีเจอร์ใหม่

### ช่องค้นหา
- **EventsPage** — เพิ่ม search bar "🔍 ค้นหากิจกรรม..." กรองตามชื่อและชื่อผู้จัด
- **SessionsPage** — เพิ่ม search bar "🔍 ค้นหาห้อง..." กรองตามชื่อและประเภทกีฬา

### SettingsPage — เปลี่ยนรหัสผ่าน
- เพิ่ม section "ความปลอดภัย" พร้อมปุ่มเปลี่ยนรหัสผ่าน
- Modal มี 2 ขั้นตอน: form (กรอกรหัสเก่า/ใหม่/ยืนยัน) → success screen
- Validation: รหัสเก่าต้องกรอก, รหัสใหม่ ≥ 6 ตัว, ยืนยันต้องตรงกัน

### การจัดเรียง Navigation
- ลำดับใหม่: **ปัด → แชท → ห้องทั่วไป → กิจกรรม → โปรไฟล์**
- Sidebar (desktop) และ BottomNav (mobile) ใช้ NAV array เดียวกัน

---

## ภาษา

- **ลบระบบเปลี่ยนภาษาออกทั้งหมด** — แอปเป็นภาษาไทยเท่านั้น
- `useLang()` คืนค่า `"th" as const` เสมอ ไม่มี Context/Provider
- ลบปุ่ม TH/EN ออกจาก AuthPage และ SettingsPage
- T dictionary ยังมี `en` key แต่ไม่ถูกใช้งาน

---

## Bug Fix — Critical

### SwipePage — filter ไม่ทำงาน
- **ปัญหา:** ปุ่มกรอง (กีฬา/ระดับ/วัน) ไม่กรองการ์ดจริง
- **แก้:** เพิ่ม `filteredUsers` filter logic + `useEffect` reset index เมื่อ filter เปลี่ยน

### ChatPage — Block user ไม่ซ่อนแชท
- **ปัญหา:** block แล้วรายชื่อยังอยู่ในลิสต์
- **แก้:** เพิ่ม `blocked: string[]` state, filter ออกจาก MATCHES list ก่อนแสดง

---

## Bug Fix — Warning

### types.ts — OrgTab มี "stats" ที่ไม่มี UI
- ลบ `"stats"` ออกจาก `OrgTab` type

### EditProfilePage — Uncontrolled inputs
- **ปัญหา:** ชื่อ/ชื่อเล่น ใช้ `defaultValue` ค่าไม่ถูกเก็บเมื่อ save
- **แก้:** เพิ่ม `useState` สำหรับ `fullName`, `nick` → ใช้ `value` + `onChange`
- Email เปลี่ยนเป็น `readOnly`

### NotifsPage — getTarget() ใช้ text.includes() เปราะบาง
- **ปัญหา:** กด notification แล้ว navigate ผิดหน้าถ้าข้อความเปลี่ยน
- **แก้:** เพิ่ม `target` field ใน NOTIFS data (`"chat"`, `"sessions"`, `"profile"`, `null`)
- `getTarget()` ใช้ `n.target` โดยตรง ไม่ต้อง parse text

### SessionsPage — Non-null assertion (!)
- ลบ `!` ออกจาก `SESSIONS.find(x => x.id === sessionId)!`

---

## Bug Fix — Minor

### AdminPage — ternary ซ้ำซ้อน
- **ปัญหา:** มี `lang==="th" ? "ไทย" : "English"` กว่า 12 จุด ทั้งที่ lang เป็น "th" เสมอ
- **แก้:** ลบ ternary ทั้งหมด ใช้ string ไทยตรงๆ + ลบ `useLang` import ออกจากไฟล์

### Sidebar — ชื่อ/email hardcode
- **ปัญหา:** ชื่อ "สมชาย ใจดี" และ email "65010001@ku.th" ฝังตรงใน component
- **แก้:** ย้ายไปเป็น `SELF_NAME` / `SELF_EMAIL` constant ใน `data.ts`

---

## ไฟล์ที่แก้ไขทั้งหมด

| ไฟล์ | เปลี่ยนแปลง |
|---|---|
| `src/app/lang.ts` | ลบ i18n context, `useLang()` hardcode "th" |
| `src/app/types.ts` | ลบ `"stats"` จาก OrgTab |
| `src/app/data.ts` | เพิ่ม `target` ใน NOTIFS, เพิ่ม `SELF_NAME`/`SELF_EMAIL` |
| `src/app/App.tsx` | ลบ LangCtx Provider |
| `src/app/pages/AuthPage.tsx` | ลบปุ่ม TH/EN |
| `src/app/pages/SettingsPage.tsx` | ลบภาษา, เพิ่ม Change Password |
| `src/app/pages/SwipePage.tsx` | Fix filter + pool logic |
| `src/app/pages/ChatPage.tsx` | Fix blocked state |
| `src/app/pages/EventsPage.tsx` | เพิ่ม search bar |
| `src/app/pages/SessionsPage.tsx` | เพิ่ม search bar, ลบ `!` assertion |
| `src/app/pages/NotifsPage.tsx` | ใช้ `n.target` แทน text matching |
| `src/app/pages/EditProfilePage.tsx` | Controlled inputs |
| `src/app/pages/OnboardPage.tsx` | ใช้ T keys แทน hardcode |
| `src/app/pages/AdminPage.tsx` | ลบ lang ternaries ทั้งหมด |
| `src/app/components/shared/index.tsx` | NAV reorder, SELF_NAME/SELF_EMAIL |
