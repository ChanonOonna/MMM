---
noteId: "23c6ec70731611f181ad6b28ef8d6d28"
tags: []

---

# Sports Match — Proposal & Requirements

**มหาวิทยาลัยเกษตรศาสตร์ (KU)**  
**ระบบจับคู่นักกีฬานิสิต**

---

## 1. Executive Summary

Sports Match คือแพลตฟอร์มเว็บสำหรับนิสิตมหาวิทยาลัยเกษตรศาสตร์ ที่ช่วยให้การหาคนเล่นกีฬาภายในม.เกษตรกำแพงแสนเป็นเรื่องง่าย รวดเร็ว และปลอดภัย ระบบผสมผสานแนวคิด Swipe-to-Match แบบ Tinder เข้ากับการสร้างห้องนัดเล่นกีฬา (Sport Session) และการจัดกิจกรรม (Event) ออกแบบสำหรับนิสิต KU โดยเฉพาะ รองรับผู้ใช้งานพร้อมกัน 200 คน บน Free Tier ทั้งหมด

---

## 2. วัตถุประสงค์

1. ให้นิสิต KU หาคนเล่นกีฬาภายในม.เกษตรกำแพงแสนได้ตรงกีฬา ตรงระดับ ตรงเวลา
2. ลดปัญหาหาคนเล่นกีฬาไม่ครบ ด้วยระบบ Sport Session แบบ Open Join
3. สร้างชุมชนกีฬาภายในมหาวิทยาลัยผ่าน Event และ Achievement
4. มีระบบ Admin ดูแลความปลอดภัยและพฤติกรรมผู้ใช้ได้จริง

---

## 3. กลุ่มผู้ใช้งาน (Target Users)

| Role | คำอธิบาย | ได้รับสิทธิ์โดย |
|---|---|---|
| **User** | นิสิต KU ที่สมัครด้วย @ku.th | สมัครเอง |
| **Event Organizer** | ผู้จัดกิจกรรมกีฬา | Admin เลื่อนขั้นให้ |
| **Admin** | ผู้ดูแลระบบ | กำหนดตั้งแต่ต้น |

---

## 4. Functional Requirements

### 4.1 Authentication

| ID | Requirement |
|---|---|
| AUTH-01 | สมัครด้วย Email `@ku.th` เท่านั้น พร้อมแสดงป้าย **Verified KU Student** |
| AUTH-02 | Login ด้วย Email + Password |
| AUTH-03 | ระบบออก JWT Access Token + Refresh Token |
| AUTH-04 | Login ได้หลายอุปกรณ์ พร้อม Logout เฉพาะเครื่อง หรือ Logout ทุกเครื่อง |
| AUTH-05 | Admin เลื่อนขั้น User → Event Organizer ผ่าน Dashboard |

---

### 4.2 Profile

| ID | Requirement |
|---|---|
| PRO-01 | อัปโหลดรูปโปรไฟล์ได้สูงสุด **5 รูป** ผ่าน Cloudinary |
| PRO-02 | เลือกกีฬาที่เล่นได้ (หลายกีฬา) จากรายชื่อที่ Admin จัดการ |
| PRO-03 | กำหนด **Sport Level** 1 ระดับสำหรับทุกกีฬา (ผู้เริ่มต้น / กลาง / สูง / แข่งขัน) |
| PRO-04 | กำหนด **Weekly Schedule** แบบ Recurring (ตั้งครั้งเดียว ใช้ซ้ำทุกสัปดาห์ แก้ไขได้ตลอด) |
| PRO-05 | เลือก **Favorite Place** สูงสุด **5 สนาม** จาก Google Maps API + รายชื่อที่ Admin เพิ่ม |
| PRO-06 | ระบุ **Equipment** ว่ามีหรือไม่มีอุปกรณ์ (แสดงบน Profile + ใช้ Filter ใน Swipe และ Session) |
| PRO-07 | เลือกภาษา UI ได้ (ไทย Default / English) |
| PRO-08 | บัญชีที่สะสม No Show ครบ 5 ครั้ง แสดง **ป้าย Warning** บน Profile ให้คนอื่นเห็น |

---

### 4.3 Swipe & Match

| ID | Requirement |
|---|---|
| SWP-01 | หน้า Swipe แสดงการ์ดผู้เล่น **20 คนต่อชุด** (Pagination) |
| SWP-02 | คัดผู้เล่นจาก 6 เกณฑ์: กีฬาตรงกัน / Level ที่ Filter / Availability ตรงกัน / Favorite Place เดียวกัน / ยังไม่เคย Swipe / สุ่ม |
| SWP-03 | ถ้าไม่มีผู้เล่นผ่านเกณฑ์ครบ ระบบ **ผ่อนเกณฑ์อัตโนมัติ**: ตัด Favorite Place ก่อน → ตัด Availability |
| SWP-04 | ผู้ใช้กำหนด Filter ด้าน Sport Level เองได้ |
| SWP-05 | ทั้งสองฝ่าย Swipe Right → **Match** → ระบบสร้างห้องแชท 1:1 อัตโนมัติ |
| SWP-06 | **Block** ทำงานแบบ Mutual — ทั้งสองฝ่ายไม่เห็นกันใน Swipe (แต่ยังเห็นกันใน Session/Event) |
| SWP-07 | ผู้ใช้ **Report** จากหน้า Swipe Card ได้ก่อน Match (เช่น โปรไฟล์ปลอม) |
| SWP-08 | ไม่มีระบบ Unmatch หลัง Match แล้ว |

---

### 4.4 Chat

| ID | Requirement |
|---|---|
| CHT-01 | แชท **1:1** ได้เฉพาะหลัง Match เท่านั้น |
| CHT-02 | ส่งได้ทั้ง **ข้อความ (Text)** และ **รูปภาพ** (Cloudinary) |
| CHT-03 | **ยกเลิกข้อความ (Unsend)** ที่ส่งไปแล้วได้ |
| CHT-04 | Chat ใน Sport Session และ Event เป็น **Group Chat** ของสมาชิกทุกคน |
| CHT-05 | ประวัติ Chat ใน Sport Session เก็บไว้ **30 วัน** หลัง Session ปิด |
| CHT-06 | Real-time ผ่าน **Socket.IO** ไม่ใช้ Polling |

---

### 4.5 Sport Session

| ID | Requirement |
|---|---|
| SES-01 | ผู้ใช้ทุกคนสร้าง Sport Session ได้ โดยระบุ: กีฬา / วันที่ / เวลา / สถานที่ / จำนวนผู้เล่น / ระดับฝีมือ / อุปกรณ์ที่ต้องการ |
| SES-02 | Status: `open` → `full` → `ongoing` → `completed` / `cancelled` |
| SES-03 | ผู้ใช้ Browse และ **Join** Session ได้ทันที (ไม่ต้อง Match ก่อน) |
| SES-04 | เมื่อจำนวนผู้เล่นครบ ระบบ Auto-close รับสมาชิก (status = full) |
| SES-05 | Host สามารถ **Kick** สมาชิกออกจาก Session ได้ |
| SES-06 | สมาชิก **Leave** Session ได้ทุกเวลา พร้อมระบุเหตุผล |
| SES-07 | ถ้า Host Leave → Session ถูก Cancel อัตโนมัติ |
| SES-08 | Filter Session ได้ตาม: กีฬา / ระดับ / สนาม / Equipment |
| SES-09 | Session มี **Group Chat** สำหรับสมาชิก |

---

### 4.6 Sport Invite

| ID | Requirement |
|---|---|
| INV-01 | ส่ง Sport Invite ได้เฉพาะคนที่ Match แล้ว ผ่านหน้า Chat |
| INV-02 | ฟอร์ม Invite ประกอบด้วย: กีฬา / วันที่ / เวลา / สถานที่ / จำนวนผู้เล่น / ข้อความ (optional) — ทุกฟิลด์แก้ไขได้ |
| INV-03 | อีกฝ่าย **ตอบรับ** → ระบบสร้าง **Public Sport Session** อัตโนมัติ (คนอื่น Join ได้ถ้ายังไม่เต็ม) |
| INV-04 | อีกฝ่าย **ปฏิเสธ** → ส่ง Notification แจ้งผู้ส่ง ไม่มีการสร้าง Session |

---

### 4.7 No Show & Report

| ID | Requirement |
|---|---|
| RPT-01 | ผู้ใช้ Report ได้จาก: Swipe Card / Chat / Sport Session |
| RPT-02 | หมวดหมู่ Report: โปรไฟล์ปลอม / พฤติกรรมไม่เหมาะสมในแชท / No Show / คุกคาม / เนื้อหาไม่เหมาะสม |
| RPT-03 | No Show ต้องแนบหลักฐาน: **รูปภาพ / Screenshot** |
| RPT-04 | **Admin** เป็นคนตรวจสอบหลักฐานทุกเคส |
| RPT-05 | ผู้ถูก Report ได้รับแจ้งเตือนอย่างเดียว ไม่มีสิทธิ์โต้แย้ง |
| RPT-06 | No Show ใช้กับ: Sport Invite (Match) และ Sport Session |
| RPT-07 | สะสม No Show ครบ **5 ครั้ง** → แจ้งเตือนบัญชี + แสดงป้าย Warning บน Profile |
| RPT-08 | No Show ต้องให้คนในห้อง Report เอง ไม่มี Auto-prompt จากระบบ |

---

### 4.8 Event

| ID | Requirement |
|---|---|
| EVT-01 | **Admin** และ **Event Organizer** สร้าง Event ได้ |
| EVT-02 | Event Organizer มีสิทธิ์: สร้าง / แก้ไข / ลบ Event ของตัวเอง / จัดการสมาชิก / ส่ง Announcement / ดูสถิติ / Verify สมาชิก / Report-Ban User |
| EVT-03 | ผู้เข้าร่วม Event ได้รับ **Announcement** เฉพาะ Event ที่ตัวเอง Join เท่านั้น |
| EVT-04 | Event มี **Group Chat** สำหรับผู้เข้าร่วม |
| EVT-05 | ระบบ **Check-in ด้วย QR Code**: นิสิตเปิด QR Code ของตัวเอง → Host/Organizer สแกนด้วยกล้องในแอป |
| EVT-06 | QR Code ไม่ซ้ำกัน unique per user (HMAC-signed จาก User ID) |

---

### 4.9 Notification

| ID | Requirement |
|---|---|
| NTF-01 | In-app Notification เท่านั้น ผ่าน **Socket.IO** Real-time |
| NTF-02 | แจ้งเตือนเมื่อ: มี Match / มีข้อความ / มี Sport Invite / มีคนตอบรับ / มีคนเข้าร่วม Session / มี Achievement / มี Announcement / ถูก Kick / No Show Warning |

---

### 4.10 Achievement

| ID | Requirement |
|---|---|
| ACH-01 | **Admin** สร้างและกำหนดเงื่อนไข Achievement เองได้ผ่าน Dashboard |
| ACH-02 | ตัวอย่าง Achievement: เข้าร่วม Session ครั้งแรก / เล่น 5-10-50 ครั้ง / ลองเล่น 3 กีฬา / Night Owl / Early Bird / Explorer |
| ACH-03 | เมื่อปลดล็อก Achievement → ส่ง Notification แจ้งผู้ใช้ |

---

### 4.11 Search

| ID | Requirement |
|---|---|
| SRC-01 | ค้นหา Sport Session ตามกีฬาและสนามกีฬา |
| SRC-02 | ค้นหา Event ตามกีฬาและสนามกีฬา |

---

### 4.12 Admin Dashboard

| ID | Requirement |
|---|---|
| ADM-01 | ดูสถิติ: จำนวน User Online / Match วันนี้ / DAU / กีฬายอดนิยม |
| ADM-02 | **Heat Map** แสดงจำนวนผู้ใช้แต่ละสนาม (เฉพาะ Admin) |
| ADM-03 | จัดการ Report ทั้งหมด: ตรวจหลักฐาน / อนุมัติ / ปฏิเสธ |
| ADM-04 | จัดการรายชื่อกีฬา (เพิ่ม / แก้ไข / ลบ) |
| ADM-05 | จัดการรายชื่อสนามกีฬา (Fixed List) |
| ADM-06 | เลื่อนขั้น User → Event Organizer |
| ADM-07 | สร้างและจัดการ Achievement |
| ADM-08 | Admin ไม่สามารถอ่านข้อความใน Private Chat ได้ (Privacy) |

---

## 5. Non-Functional Requirements

| หมวด | Requirement |
|---|---|
| **Performance** | รองรับผู้ใช้งานพร้อมกัน 200 คน |
| **Scalability** | Modular Monolithic → ขยายเป็น Microservices ได้ในอนาคต |
| **Security** | JWT + bcrypt + Helmet + Rate Limiting + CORS + Input Validation |
| **Privacy** | แชร์ตำแหน่งเฉพาะตอนนัด ไม่แชร์ Real-time / Admin ไม่อ่าน Private Chat |
| **Availability** | Free Tier (Demo) — ยอมรับ Railway Sleep Mode |
| **Language** | ภาษาไทย Default / สลับภาษาอังกฤษได้ (i18n) |

---

## 6. Technology Stack

### Frontend
| เทคโนโลยี | บทบาท |
|---|---|
| Vue 3 + Vite | UI Framework + Build Tool |
| JavaScript (ES6+) | ภาษาหลัก |
| Tailwind CSS | Styling |
| PrimeVue | Component Library |
| Vue Router | Routing |
| Pinia | State Management |
| Axios | HTTP Client |
| Socket.IO Client | Real-time |
| Vue i18n | Internationalization |
| Motion One | Animation |

### Backend
| เทคโนโลยี | บทบาท |
|---|---|
| Node.js + Express.js | Web Framework |
| Socket.IO | Real-time Chat + Notification |
| Prisma ORM | Database ORM |
| PostgreSQL | Database |
| Redis (Upstash) | Cache: Online users, Sessions, Hot data |
| JWT + bcrypt | Auth |
| express-validator | Input Validation |
| Helmet + CORS + Rate Limiting | Security |
| compression + Winston | Performance + Logging |
| node-qrcode | QR Code Generation |
| jsQR / ZXing | QR Code Scanning |

### Storage & Deployment
| ส่วน | บริการ |
|---|---|
| Frontend | Vercel |
| Backend | Railway |
| Database | PostgreSQL (Railway / Supabase) |
| Cache | Upstash Redis (Free) |
| Image Storage | Cloudinary |
| Maps | Google Places API |
| Version Control | GitHub |

---

## 7. Database Schema (ตารางหลัก)

```
users               — บัญชีผู้ใช้ + role + no_show_count + warning_badge
profiles            — ข้อมูลโปรไฟล์ + equipment + sport_level + language
profile_photos      — รูปโปรไฟล์ (max 5 ต่อคน)
sports              — ประเภทกีฬา (Admin จัดการ)
user_sports         — กีฬาที่ผู้ใช้เล่น
weekly_schedule     — ตารางเวลาว่าง (Recurring)
venues              — สนามกีฬา (Admin เพิ่ม + Google Maps)
favorite_places     — สนามประจำของผู้ใช้ (max 5)
swipes              — ประวัติการปัด (left/right)
matches             — คู่ที่ Match กัน
messages            — ข้อความ (text + image_url + deleted_at)
sport_sessions      — ห้องนัดเล่นกีฬา (status: open/full/ongoing/completed/cancelled)
sport_session_members — สมาชิกในห้อง + leave_reason
invites             — Sport Invite ระหว่างคู่ Match
notifications       — การแจ้งเตือน
events              — กิจกรรมกีฬา (Admin/Organizer)
event_members       — ผู้เข้าร่วม Event + checked_in_at
reports             — รายงานผู้ใช้ + evidence_url + category
achievements        — ความสำเร็จ + conditions (JSON)
user_achievements   — Achievement ที่ผู้ใช้ปลดล็อก
blocked_users       — ผู้ใช้ที่ถูกบล็อก (Mutual)
user_sessions       — Login Session (JWT / Refresh Token / Device)
game_history        — ประวัติการเล่นที่เสร็จสิ้น
```

---

## 8. API Summary (~160 APIs)

| หมวด | จำนวน | ตัวอย่าง |
|---|---|---|
| Authentication | 12 | register, login, logout, refresh, verify-email |
| User | 15 | get-profile, update-profile, block, unblock |
| Profile Photos | 5 | upload, delete, reorder |
| Sports & Venues | 10 | list-sports, add-sport (admin), list-venues |
| Swipe | 8 | get-deck, swipe-left, swipe-right, get-matches |
| Match | 10 | list-matches, get-match-detail |
| Chat | 20 | send-message, send-image, unsend, get-history |
| Sport Session | 15 | create, browse, join, leave, kick, cancel |
| Sport Invite | 10 | send, accept, reject, list |
| Event | 15 | create, browse, join, checkin-scan, announce |
| Notification | 10 | list, mark-read, mark-all-read |
| Report | 10 | report-user, list-reports (admin), resolve |
| Search | 5 | search-sessions, search-events |
| Achievement | 8 | list, create (admin), user-achievements |
| Admin Dashboard | 20 | stats, dau, heatmap, manage-roles |
| **รวม** | **~163** | |

---

## 9. MVP Priority & Roadmap

### Phase 1 — Core (สำคัญที่สุด)
1. **Auth + Profile** — สมัคร, Login, ตั้งค่าโปรไฟล์
2. **Swipe + Match** — หาคนเล่นกีฬาภายในม.เกษตรกำแพงแสน

### Phase 2 — Engagement
3. **Sport Session** — สร้างห้อง, Browse, Join
4. **Chat** — 1:1 และ Group Chat + รูปภาพ

### Phase 3 — Social
5. **Notification** — Real-time แจ้งเตือน
6. **Sport Invite** — ชวนคู่ Match เล่น
7. **No Show + Report** — ระบบความรับผิดชอบ

### Phase 4 — Growth
8. **Event + QR Check-in** — กิจกรรมกีฬา
9. **Achievement** — ปลดล็อกความสำเร็จ
10. **Admin Dashboard** — สถิติ, Heat Map, จัดการระบบ

---

## 10. System Architecture

```
                        User
                          │
                          ▼
                Vue 3 + Vite (Vercel)
                          │
                    HTTPS / Socket.IO
                          │
                          ▼
                Express.js (Railway)
                          │
      ┌───────────────────┼────────────────────┐
      │                   │                    │
      ▼                   ▼                    ▼
 Authentication      REST API            Socket.IO
      │                   │                    │
      └───────────────────┼────────────────────┘
                          ▼
                    Service Layer
                          │
                     Prisma ORM
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
     PostgreSQL        Redis          Cloudinary
    (System Data)  (Cache/Sessions)   (Images)
                          │
                     Google Maps API
                     (Venue Search)
```

### Scalability Path
เมื่อผู้ใช้เพิ่มขึ้น สามารถแยกเป็น Microservices ได้โดย Frontend ไม่ต้องแก้ไข

```
Vue 3 + Vite → API Gateway → Auth / Match / Chat / Notification Services
```
