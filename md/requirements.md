---
noteId: "cdba7620731611f181ad6b28ef8d6d28"
tags: []

---

# Software Requirements Specification (SRS)
# Sports Match — KU Student Sport Matching Platform

**Version:** 1.0  
**Date:** 2026-06-29  

---

## 1. User Stories

### Role: User (นิสิต KU)

#### Authentication
- **US-001** — ในฐานะนิสิต KU ฉันต้องการสมัครด้วย Email @ku.th เพื่อให้คนอื่นรู้ว่าฉันเป็นนิสิตจริง
- **US-002** — ในฐานะผู้ใช้ ฉันต้องการ Login/Logout และจัดการ Session หลายอุปกรณ์ได้

#### Profile & Onboarding
- **US-003** — ฉันต้องการอัปโหลดรูปโปรไฟล์สูงสุด 5 รูป เพื่อให้คนอื่นเห็นหน้าฉัน
- **US-004** — ฉันต้องการเลือกกีฬาที่เล่น ระดับฝีมือ อุปกรณ์ และเวลาว่าง เพื่อให้ระบบ Match ได้ตรง
- **US-005** — ฉันต้องการเลือกสนามประจำสูงสุด 5 สนาม เพื่อ Match กับคนที่เล่นสนามเดียวกัน
- **US-006** — ฉันต้องการตั้งเวลาว่างแบบ Recurring เพื่อไม่ต้องตั้งใหม่ทุกสัปดาห์

#### Swipe & Match
- **US-007** — ฉันต้องการ Swipe การ์ดผู้เล่นคนอื่น เพื่อหาคนเล่นกีฬาภายในม.เกษตรกำแพงแสน
- **US-008** — ฉันต้องการ Filter ผู้เล่นตามระดับฝีมือ เพื่อหาคนที่เหมาะกับฉัน
- **US-009** — เมื่อ Match สำเร็จ ฉันต้องการได้รับแจ้งเตือนทันที
- **US-010** — ฉันต้องการ Block ผู้ใช้ที่ไม่ต้องการพบ เพื่อไม่ให้เห็นกันใน Swipe
- **US-011** — ฉันต้องการ Report โปรไฟล์ปลอมจากหน้า Swipe Card ได้เลย

#### Chat
- **US-012** — หลัง Match ฉันต้องการแชทกับคู่ Match ได้แบบ Real-time
- **US-013** — ฉันต้องการส่งรูปภาพในแชทได้
- **US-014** — ฉันต้องการยกเลิกข้อความที่ส่งไปแล้วได้ (Unsend)

#### Sport Session
- **US-015** — ฉันต้องการสร้างห้องนัดเล่นกีฬาและรอให้คนอื่นมาร่วม
- **US-016** — ฉันต้องการ Browse และ Join Session ของคนอื่นโดยไม่ต้อง Match ก่อน
- **US-017** — ในฐานะ Host ฉันต้องการ Kick สมาชิกที่ไม่เหมาะสมออกจากห้องได้
- **US-018** — ฉันต้องการออกจาก Session พร้อมระบุเหตุผลได้ทุกเวลา

#### Sport Invite
- **US-019** — หลัง Match ฉันต้องการส่ง Invite ชวนอีกคนนัดเล่นกีฬา โดยกำหนดรายละเอียดได้
- **US-020** — เมื่ออีกฝ่ายตอบรับ ฉันต้องการให้ระบบสร้าง Sport Session อัตโนมัติ

#### No Show & Report
- **US-021** — ฉันต้องการ Report คนที่ไม่มาตามนัด พร้อมแนบหลักฐาน
- **US-022** — ฉันต้องการเห็นป้าย Warning บน Profile ของคนที่มี No Show สะสม 5 ครั้ง

#### Event
- **US-023** — ฉันต้องการ Browse และ Join กิจกรรมกีฬาที่ Admin/Organizer สร้าง
- **US-024** — ฉันต้องการแสดง QR Code ของตัวเองเพื่อให้ Organizer สแกน Check-in

#### Achievement & History
- **US-025** — ฉันต้องการดู Achievement ที่ปลดล็อกได้ เพื่อเป็นแรงจูงใจในการเล่นกีฬา
- **US-026** — ฉันต้องการดูประวัติการเล่นกีฬาทั้งหมดของฉัน

---

### Role: Event Organizer

- **US-027** — ฉันต้องการสร้างและจัดการ Event กีฬาของตัวเองได้
- **US-028** — ฉันต้องการส่ง Announcement ให้ผู้เข้าร่วม Event ของฉันได้
- **US-029** — ฉันต้องการสแกน QR Code นิสิต เพื่อ Check-in ผู้เข้าร่วม Event
- **US-030** — ฉันต้องการดูสถิติ Event ของตัวเอง (จำนวน Join / Check-in)
- **US-031** — ฉันต้องการ Report/Ban ผู้ใช้ที่มีพฤติกรรมไม่เหมาะสมใน Event ของฉัน

---

### Role: Admin

- **US-032** — ฉันต้องการดู Dashboard สถิติภาพรวมระบบ (DAU, Match, Report, กีฬายอดนิยม)
- **US-033** — ฉันต้องการดู Heat Map จำนวนผู้ใช้แต่ละสนามกีฬา
- **US-034** — ฉันต้องการตรวจสอบและจัดการ Report ทุกเคส
- **US-035** — ฉันต้องการจัดการรายชื่อกีฬาและสนามกีฬาในระบบ
- **US-036** — ฉันต้องการเลื่อนขั้น User → Event Organizer
- **US-037** — ฉันต้องการสร้าง Achievement และกำหนดเงื่อนไขการปลดล็อก

---

## 2. Functional Requirements (รายละเอียด)

### Module: Authentication (AUTH)

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| AUTH-01 | ระบบตรวจสอบ Email domain `@ku.th` ก่อนสมัคร | Must | Email ที่ไม่ใช่ @ku.th ต้องได้รับ error |
| AUTH-02 | แสดงป้าย "Verified KU Student" บน Profile | Must | ป้ายแสดงเฉพาะ User ที่ผ่าน Auth สำเร็จ |
| AUTH-03 | ออก JWT Access Token (15 นาที) + Refresh Token (30 วัน) | Must | Token หมดอายุตามที่กำหนด |
| AUTH-04 | เก็บ Refresh Token ใน `user_sessions` พร้อม Device info | Must | เก็บ IP, Browser, Login Time, Expired At |
| AUTH-05 | Logout เฉพาะเครื่อง — Revoke token เครื่องนั้น | Must | เครื่องอื่นยังใช้งานได้ |
| AUTH-06 | Logout ทุกเครื่อง — Revoke ทุก token | Must | ทุกอุปกรณ์ถูก Logout พร้อมกัน |
| AUTH-07 | Admin กำหนด Role ใน seed data | Must | Admin ไม่สามารถสมัครผ่าน UI ปกติ |

---

### Module: Profile (PRO)

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| PRO-01 | อัปโหลดรูปได้สูงสุด 5 รูป ผ่าน Cloudinary | Must | เกิน 5 รูป ต้องลบก่อนอัปโหลดใหม่ |
| PRO-02 | เลือกกีฬาได้หลายกีฬา จาก `sports` table | Must | ต้องเลือกอย่างน้อย 1 กีฬา |
| PRO-03 | กำหนด Sport Level 1 ค่าสำหรับทุกกีฬา | Must | ค่า: beginner / intermediate / advanced / competitive |
| PRO-04 | Weekly Schedule: เลือกวัน + ช่วงเวลาได้หลายช่วง | Must | บันทึก Recurring ใช้ซ้ำทุกสัปดาห์ |
| PRO-05 | Favorite Place สูงสุด 5 สนาม | Must | ค้นหาจาก Google Places API + รายชื่อ Admin |
| PRO-06 | Equipment: ระบุว่ามี/ไม่มีอุปกรณ์ | Must | ใช้ Filter ได้ใน Swipe + Session |
| PRO-07 | แสดงป้าย Warning เมื่อ `no_show_count >= 5` | Must | ป้ายแสดงบน Profile Card ให้คนอื่นเห็น |
| PRO-08 | สลับภาษา TH/EN ได้จาก UI | Should | ค่า Default = ภาษาไทย |

---

### Module: Swipe & Match (SWP)

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| SWP-01 | โหลด 20 Card ต่อชุด (Pagination) | Must | เมื่อปัดครบ 20 ใบ โหลดชุดใหม่อัตโนมัติ |
| SWP-02 | กรอง Card ด้วย: กีฬา + Level + Availability + Favorite Place + ไม่เคย Swipe | Must | ต้องผ่านทุกเกณฑ์ก่อนเข้า pool |
| SWP-03 | ผ่อนเกณฑ์ Step 1: ตัด Favorite Place ออก ถ้ายังไม่มีผล | Must | แจ้ง User ว่าขยายการค้นหา |
| SWP-04 | ผ่อนเกณฑ์ Step 2: ตัด Availability ออก ถ้ายังไม่มีผล | Must | แจ้ง User ว่าขยายการค้นหาอีก |
| SWP-05 | User เลือก Level Filter เองใน UI | Must | เลือกได้: ทุกระดับ / ระดับเดียวกัน / กำหนดเอง |
| SWP-06 | Swipe Right + อีกฝ่าย Swipe Right = Match | Must | ตรวจสอบ `swipes` table real-time |
| SWP-07 | Match → สร้าง `matches` record + ห้อง Chat อัตโนมัติ | Must | ทั้งสองฝ่ายรับ Notification "It's a Match!" |
| SWP-08 | Block User → ทั้งสองฝ่ายไม่เห็นกันใน Swipe | Must | บันทึกใน `blocked_users` สองทิศทาง |
| SWP-09 | Report จากหน้า Card ได้ (ก่อน Match) | Must | เปิด Report form พร้อมเลือกหมวดหมู่ |
| SWP-10 | ไม่มีระบบ Unmatch | Must | ไม่มีปุ่ม Unmatch ใน UI |

---

### Module: Chat (CHT)

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| CHT-01 | 1:1 Chat เปิดใช้หลัง Match เท่านั้น | Must | ก่อน Match ไม่มีห้อง Chat |
| CHT-02 | ส่งข้อความ Text ได้ | Must | รองรับ UTF-8 (ภาษาไทย/อังกฤษ) |
| CHT-03 | ส่งรูปภาพได้ (อัปโหลด Cloudinary) | Must | จำกัดขนาดไฟล์ 5MB |
| CHT-04 | Unsend ข้อความ → แสดง "ข้อความถูกยกเลิก" | Must | Soft delete: `deleted_at` ไม่ลบจาก DB |
| CHT-05 | Real-time ผ่าน Socket.IO | Must | Message ถึงผู้รับภายใน < 1 วินาที |
| CHT-06 | Group Chat ใน Sport Session (สมาชิกทุกคน) | Must | เมื่อ Join Session → เข้า Socket Room อัตโนมัติ |
| CHT-07 | Group Chat ใน Event (ผู้เข้าร่วมทุกคน) | Must | เมื่อ Join Event → เข้า Socket Room อัตโนมัติ |
| CHT-08 | เก็บประวัติ Chat Session 30 วันหลัง Session ปิด | Should | ลบอัตโนมัติเมื่อครบ 30 วัน |
| CHT-09 | Pagination ประวัติแชท 50 ข้อความต่อหน้า | Must | โหลดเพิ่มเมื่อ Scroll ขึ้น |

---

### Module: Sport Session (SES)

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| SES-01 | สร้าง Session กำหนด: กีฬา / วัน / เวลา / สถานที่ / max_players / ระดับ / equipment | Must | ทุกฟิลด์ Required ยกเว้น equipment |
| SES-02 | Status Flow: open → full → ongoing → completed / cancelled | Must | Status เปลี่ยนอัตโนมัติตามเงื่อนไข |
| SES-03 | Auto full: `current_players = max_players` → status = full | Must | ปิดรับ Join อัตโนมัติ |
| SES-04 | Browse Sessions พร้อม Filter: กีฬา / สนาม / ระดับ / equipment | Must | แสดงเฉพาะ status = open |
| SES-05 | Join Session → เพิ่มใน `sport_session_members` + เข้า Socket Room | Must | Notification แจ้ง Host ว่ามีคนเข้าร่วม |
| SES-06 | Host Kick Member → ลบออกจาก Room + Socket Room | Must | แจ้ง Member ที่ถูก Kick |
| SES-07 | Member Leave → บันทึก `leave_reason` + ออกจาก Socket Room | Must | อัปเดต `current_players` |
| SES-08 | Host Leave → Session ถูก Cancel → แจ้งสมาชิกทุกคน | Must | status = cancelled |
| SES-09 | Session มี Group Chat | Must | ดู CHT-06 |

---

### Module: Sport Invite (INV)

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| INV-01 | ส่ง Invite ได้เฉพาะ Match ผ่านหน้า Chat | Must | ปุ่ม "ส่ง Invite" อยู่ใน Chat UI |
| INV-02 | ฟอร์ม: กีฬา / วันที่ / เวลา / สถานที่ / max_players / ข้อความ | Must | ข้อความ optional, ที่เหลือ required |
| INV-03 | ตอบรับ → สร้าง Public Sport Session อัตโนมัติ | Must | Session ปรากฏใน Browse ทันที |
| INV-04 | ปฏิเสธ → Notification แจ้งผู้ส่ง | Must | ไม่มีการสร้าง Session |
| INV-05 | Invite แสดงใน Chat เป็น Message Card | Must | มีปุ่ม ตอบรับ / ปฏิเสธ |

---

### Module: No Show & Report (RPT)

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| RPT-01 | Report ได้จาก: Swipe Card / Chat / Sport Session | Must | Report form มีให้เข้าถึงทุก Context |
| RPT-02 | หมวดหมู่ Report (5 ตัวเลือก Fixed) | Must | โปรไฟล์ปลอม / ไม่เหมาะสมในแชท / No Show / คุกคาม / เนื้อหาไม่เหมาะสม |
| RPT-03 | No Show Report ต้องแนบ รูปภาพ หรือ Screenshot | Must | ไม่มีหลักฐาน = Submit ไม่ได้ |
| RPT-04 | Admin ตรวจสอบหลักฐานทุกเคสเอง | Must | Admin Dashboard มีหน้า Report Queue |
| RPT-05 | ผู้ถูก Report ได้รับ Notification แจ้งเท่านั้น ไม่มีสิทธิ์โต้แย้ง | Must | |
| RPT-06 | `no_show_count` เพิ่มขึ้นทุกครั้งที่ Admin อนุมัติ No Show | Must | |
| RPT-07 | `no_show_count >= 5` → `warning_badge = true` บน Profile | Must | Admin รีเซ็ต count ได้ |
| RPT-08 | No Show ต้องให้ผู้ใช้ Report เอง ไม่มี Auto-prompt | Must | |

---

### Module: Event (EVT)

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| EVT-01 | Admin + Event Organizer สร้าง Event ได้ | Must | User ทั่วไปไม่มีปุ่มสร้าง Event |
| EVT-02 | Event Organizer: สร้าง/แก้ไข/ลบ Event ของตัวเอง | Must | ไม่สามารถแก้ไข Event ของคนอื่น |
| EVT-03 | Event Organizer: จัดการสมาชิก / Verify / ส่ง Announcement / ดูสถิติ / Report User | Must | |
| EVT-04 | Announcement ส่งถึงเฉพาะ Member ใน Event นั้น | Must | ไม่ Broadcast ทั้งระบบ |
| EVT-05 | Event มี Group Chat | Must | ดู CHT-07 |
| EVT-06 | Check-in: นิสิตแสดง QR Code → Organizer สแกน | Must | QR Code = HMAC-signed(user_id) |
| EVT-07 | QR Code unique per user, ไม่เปลี่ยนตาม Event | Must | สร้าง 1 ครั้งตอน Register |
| EVT-08 | บันทึก `checked_in_at` ใน `event_members` | Must | |

---

### Module: Notification (NTF)

| ID | Type | Trigger |
|---|---|---|
| NTF-01 | Match | ทั้งสองฝ่าย Swipe Right |
| NTF-02 | New Message | ได้รับข้อความใหม่ใน Chat |
| NTF-03 | Sport Invite Received | ได้รับ Invite จากคู่ Match |
| NTF-04 | Invite Accepted | อีกฝ่ายตอบรับ Invite |
| NTF-05 | Invite Rejected | อีกฝ่ายปฏิเสธ Invite |
| NTF-06 | Session Member Joined | มีคน Join Session ของ Host |
| NTF-07 | Kicked from Session | ถูก Kick ออกจาก Session |
| NTF-08 | Session Cancelled | Host ออกจาก Session |
| NTF-09 | Achievement Unlocked | ปลดล็อก Achievement |
| NTF-10 | Event Announcement | Organizer ส่ง Announcement |
| NTF-11 | No Show Warning | no_show_count ถึง 5 ครั้ง |
| NTF-12 | Report Resolved | Admin ตัดสินใจ Report |

---

### Module: Achievement (ACH)

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| ACH-01 | Admin สร้าง Achievement พร้อมกำหนด: ชื่อ / คำอธิบาย / ไอคอน / เงื่อนไข (JSON) | Must | |
| ACH-02 | เงื่อนไขที่รองรับ: count_sessions / unique_sports / time_of_day / consecutive_days | Must | เก็บใน `conditions` JSON field |
| ACH-03 | ระบบตรวจเงื่อนไขหลังทุก Session/Event ที่ complete | Must | Background job ตรวจ |
| ACH-04 | เมื่อปลดล็อก → บันทึกใน `user_achievements` + ส่ง Notification | Must | |

---

### Module: Admin Dashboard (ADM)

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| ADM-01 | แสดง: User Online / Match วันนี้ / DAU / กีฬายอดนิยม | Must | ดึงจาก Redis + DB |
| ADM-02 | Heat Map: จำนวนผู้ใช้ต่อสนามกีฬา | Must | Aggregate จาก `sport_sessions` + `events` |
| ADM-03 | Report Queue: รายการ Report รอตรวจ + ดูหลักฐาน + อนุมัติ/ปฏิเสธ | Must | |
| ADM-04 | จัดการ Sports: เพิ่ม / แก้ไข / ลบ กีฬา | Must | |
| ADM-05 | จัดการ Venues: เพิ่ม / แก้ไข / ลบ สนาม | Must | |
| ADM-06 | จัดการ Roles: เปลี่ยน User → Event Organizer | Must | |
| ADM-07 | จัดการ Achievement: สร้าง / แก้ไข / ลบ | Must | |
| ADM-08 | รีเซ็ต No Show Count ของ User ได้ | Must | |
| ADM-09 | Admin ไม่สามารถเข้าถึงเนื้อหาใน Private Chat | Must | ไม่มี API endpoint สำหรับอ่าน Chat |

---

## 3. Non-Functional Requirements

### 3.1 Performance

| ID | Requirement |
|---|---|
| NFR-P01 | รองรับ Concurrent Users 200 คนพร้อมกัน |
| NFR-P02 | API Response Time < 500ms (ไม่รวม external API) |
| NFR-P03 | Socket.IO Message Latency < 1 วินาที |
| NFR-P04 | ใช้ Redis Cache สำหรับข้อมูลที่ Query บ่อย (Online Users, Hot Sessions) |
| NFR-P05 | Pagination ทุก List endpoint (20-50 items per page) |
| NFR-P06 | Database Index บน: sport_id, venue_id, user_id, status, start_time |

### 3.2 Security

| ID | Requirement |
|---|---|
| NFR-S01 | Password Hash ด้วย bcrypt (cost factor ≥ 12) |
| NFR-S02 | JWT Access Token อายุ 15 นาที, Refresh Token 30 วัน |
| NFR-S03 | Rate Limiting: Auth endpoint 5 req/นาที, API 100 req/นาที |
| NFR-S04 | Input Validation ทุก endpoint ด้วย express-validator |
| NFR-S05 | Helmet.js สำหรับ Security Headers |
| NFR-S06 | CORS จำกัดเฉพาะ Frontend domain |
| NFR-S07 | QR Code ใช้ HMAC-SHA256 เพื่อป้องกัน Forgery |
| NFR-S08 | Admin ไม่มี API สำหรับอ่าน Private Chat |
| NFR-S09 | Cloudinary signed upload (ไม่ใช้ unsigned) |

### 3.3 Privacy

| ID | Requirement |
|---|---|
| NFR-PR01 | ไม่แชร์ตำแหน่ง GPS แบบ Real-time |
| NFR-PR02 | แสดงเฉพาะชื่อสนามกีฬา ไม่ใช่พิกัด GPS |
| NFR-PR03 | Block ทำงานแบบ Mutual — ทั้งสองฝ่ายไม่เห็นกันใน Swipe |

### 3.4 Scalability

| ID | Requirement |
|---|---|
| NFR-SC01 | Modular Monolithic Architecture แยก Module ชัดเจน |
| NFR-SC02 | สามารถแยกเป็น Microservices ได้โดย Frontend ไม่ต้องเปลี่ยน |

### 3.5 Availability

| ID | Requirement |
|---|---|
| NFR-AV01 | Deploy บน Free Tier ทั้งหมด (Vercel + Railway + Upstash) |
| NFR-AV02 | ยอมรับ Railway Sleep Mode (Demo Project) |

---

## 4. Data Requirements

### 4.1 ข้อมูลที่ต้องเก็บต่อ User

```
- Email (@ku.th), Password (hashed)
- ชื่อ-นามสกุล, ชื่อเล่น
- รูปโปรไฟล์ (max 5, Cloudinary URL)
- กีฬาที่เล่น (many-to-many)
- Sport Level (beginner/intermediate/advanced/competitive)
- Weekly Schedule (day, start_time, end_time) — Recurring
- Favorite Places (max 5, venue_id)
- Equipment (boolean)
- Language preference (th/en)
- no_show_count (integer)
- warning_badge (boolean)
- QR Code token (HMAC-signed)
- Role (user/event_organizer/admin)
```

### 4.2 ข้อมูลที่ต้องเก็บต่อ Sport Session

```
- host_user_id
- sport_id, venue_id
- title, description
- skill_level, equipment_required
- max_players, current_players
- start_time, end_time
- status (open/full/ongoing/completed/cancelled)
- source (manual / from_invite)
- invite_id (ถ้าสร้างจาก Sport Invite)
```

### 4.3 ข้อมูลที่ต้องเก็บต่อ Message

```
- sender_id, room_type (match/session/event), room_id
- content (text)
- image_url (nullable, Cloudinary)
- deleted_at (nullable — Unsend)
- created_at
```

### 4.4 ข้อมูลที่ต้องเก็บต่อ Report

```
- reporter_id, reported_user_id
- category (fake_profile/inappropriate_chat/no_show/harassment/inappropriate_content)
- description
- evidence_url (Cloudinary — required for no_show)
- context_type (swipe/chat/session)
- context_id
- status (pending/approved/rejected)
- admin_note
- resolved_at
```

---

## 5. Interface Requirements

### 5.1 หน้าหลัก (Pages)

| หน้า | Role | คำอธิบาย |
|---|---|---|
| Register / Login | ทุก Role | Auth + Onboarding |
| Swipe Deck | User | หน้าหลักสำหรับหาเพื่อน |
| Match List | User | รายชื่อคนที่ Match แล้ว |
| Chat (1:1) | User | แชทกับคู่ Match |
| Sport Session Browse | User | ค้นหาและ Join Session |
| Sport Session Detail | User | รายละเอียด + Group Chat |
| Create Session | User | สร้างห้องนัดเล่น |
| Event Browse | User | ดูกิจกรรมทั้งหมด |
| Event Detail | User | รายละเอียด + Chat + QR |
| Profile (ตัวเอง) | User | ดู/แก้ไขโปรไฟล์ตัวเอง |
| Profile (คนอื่น) | User | ดูโปรไฟล์คนอื่นหลัง Match |
| Achievement | User | ดู Badge ที่ปลดล็อก |
| Sport History | User | ประวัติการเล่น |
| Notifications | User | รายการแจ้งเตือน |
| Settings | User | ภาษา, บัญชี, Session |
| Event Manage | Organizer | จัดการ Event + สแกน QR |
| Admin Dashboard | Admin | สถิติ + จัดการระบบ |

### 5.2 Real-time Events (Socket.IO)

| Event | Direction | คำอธิบาย |
|---|---|---|
| `new_match` | Server → Client | แจ้ง Match ใหม่ |
| `new_message` | Server → Client | ข้อความใหม่ใน Chat |
| `message_unsent` | Server → Client | ยกเลิกข้อความ |
| `session_member_joined` | Server → Client | มีคนเข้า Session |
| `session_member_left` | Server → Client | มีคนออก Session |
| `session_cancelled` | Server → Client | Session ถูกยกเลิก |
| `invite_received` | Server → Client | ได้รับ Sport Invite |
| `invite_accepted` | Server → Client | Invite ถูกตอบรับ |
| `invite_rejected` | Server → Client | Invite ถูกปฏิเสธ |
| `new_notification` | Server → Client | Notification ทั่วไป |
| `user_online` | Client → Server | บอกว่า Online |
| `user_offline` | Client → Server | บอกว่า Offline |
| `send_message` | Client → Server | ส่งข้อความ |
| `join_room` | Client → Server | เข้า Socket Room |
| `leave_room` | Client → Server | ออกจาก Socket Room |

---

## 6. Constraints

| ข้อจำกัด | รายละเอียด |
|---|---|
| Platform | Web Application เท่านั้น (ไม่ใช่ Mobile App) |
| Authentication | เฉพาะ @ku.th เท่านั้น |
| Deployment | Free Tier ทั้งหมด |
| Concurrent Users | รองรับ 200 คน (ออกแบบสำหรับ Demo) |
| Image Size | สูงสุด 5MB ต่อไฟล์ |
| Chat History | Session Chat เก็บ 30 วันหลัง Session ปิด |
| Favorite Places | สูงสุด 5 สนามต่อ User |
| Profile Photos | สูงสุด 5 รูปต่อ User |
| No Show Warning | แสดงเมื่อ no_show_count ≥ 5 |
| Language | ไทย (Default) + English |
