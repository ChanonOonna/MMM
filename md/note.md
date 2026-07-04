---
noteId: "25a647e0732311f181ad6b28ef8d6d28"
tags: []

---

# เอกสารสรุประบบ Sports Match

---

## ฟีเจอร์หลัก

### ยืนยันตัวตนนิสิต (Verify KU Student)
สมัครด้วยอีเมล `@ku.th` หรือ KU Account พร้อมแสดงป้าย **Verified KU Student**

### ยืนยันรหัสผ่านในหน้าสมัครสมาชิก (Confirm Password)
หน้าสมัครสมาชิก (Register) มีช่องกรอก **ยืนยันรหัสผ่าน** เพิ่มเติมจากช่องรหัสผ่านหลัก ระบบตรวจสอบว่าทั้งสองช่องตรงกันก่อนดำเนินการต่อ หากไม่ตรงกันจะแสดงข้อความแจ้งเตือน "รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง" รองรับการแสดง/ซ่อนรหัสผ่านแยกกันทั้งสองช่อง

### กำหนดเวลาว่าง (Availability)
ตอนสมัคร เลือก เล่นได้ ☑ จันทร์ ☑ อังคาร 17:00–20:00  
เวลาปัด จะเห็น **Available Today** หรือ **คืนนี้ว่าง** ทำให้ Match ง่ายขึ้น

### สนามกีฬาประจำ (Favorite Place)
เลือกสนามประจำ เช่น 🏸 โรงยิมใหม่ ⚽ สนามฟุตบอลกลาง 🏀 สนามบาส 🎾 Tennis Court A  
เวลาหาคน สามารถ Filter ได้ตามสนามเดียวกัน

### ระบบนัดเล่นกีฬา (Schedule)
ไม่ใช่แค่แชท แต่สร้าง **Sport Session** เช่น วันนี้ 18:00 แบดมินตัน 2 คน เหลืออีก 1 คน กด Join ได้เลย

### Group Match
สร้างห้องหาผู้เล่นหลายคน ไม่ใช่ Match คนเดียว เช่น
- ฟุตบอล ต้องการ 10 คน
- บาส 3v3

กด Join เพื่อเข้าร่วม

### รายงานผู้ใช้ (Report)
รายงานผู้ไม่มาตามนัดหรือพฤติกรรมไม่เหมาะสม Admin ตรวจได้

### No Show
บันทึกผู้ไม่มาตามนัด สะสมครบมีการแจ้งเตือนบัญชี

### ระดับฝีมือ (Sport Level)
ผู้เริ่มต้น · ระดับกลาง · ระดับสูง · แข่งขัน

### อุปกรณ์ (Equipment)
ระบุว่ามีอุปกรณ์หรือไม่ เช่น ไม้แบด ลูก หรือ ไม่มีอุปกรณ์

### การแจ้งเตือน (Notification)
- คนใหม่เข้า
- มี Match
- มีข้อความ
- มี Invite
- มีคนตอบรับ

### ค้นหา (Search)
ค้นหาตามกีฬา และสนามกีฬา

### Heat Map
ดูจำนวนผู้ใช้งานแต่ละสนาม (เฉพาะ Admin)

### Event
Admin สร้างกิจกรรมกีฬา เช่น **KU Badminton Day** → กด Join

### Achievement
ปลดล็อกความสำเร็จจากการเล่น

### Sport History
ดูประวัติการเล่น เช่น เล่นกีฬานี้มา 5 ครั้ง / 2 ครั้ง

### ความเป็นส่วนตัว
แชร์ตำแหน่งเฉพาะตอนนัด ไม่แชร์แบบ Real-time

### Admin Dashboard
สถิติผู้ใช้ รายงาน กีฬาได้รับความนิยม และ DAU  
Admin ดู: จำนวน User Online · Match วันนี้ · Report · Sports Popular · Daily Active User · Heat Map

---

## สถาปัตยกรรมระบบ (System Architecture)

ระบบ Sports Match ถูกออกแบบในรูปแบบ **Modular Monolithic Architecture** ซึ่งแบ่งการทำงานออกเป็นโมดูลอย่างชัดเจน แต่ยังทำงานอยู่ภายใน Backend เดียว ทำให้พัฒนา ดูแล และ Deploy ได้ง่าย เหมาะสำหรับโปรเจกต์ที่มีผู้ใช้งานประมาณ **200 คนพร้อมกัน** และสามารถขยายเป็น Microservices ได้ในอนาคต

---

## เทคโนโลยีที่ใช้

### Frontend
| เทคโนโลยี | บทบาท |
|---|---|
| Vue 3 | UI Framework |
| Vite | Build Tool |
| JavaScript (ES6+) | ภาษาหลัก |
| Tailwind CSS | Styling |
| PrimeVue | Component Library |
| Vue Router | Routing |
| Pinia | State Management |
| Axios | HTTP Client |
| Socket.IO Client | Real-time |
| Motion One | Animation |

### Backend
| เทคโนโลยี | บทบาท |
|---|---|
| Node.js | Runtime |
| Express.js | Web Framework |
| Socket.IO | Real-time |
| Prisma ORM | Database ORM |
| PostgreSQL | Database |
| Redis | Cache |
| JWT | Authentication Token |
| bcrypt | Password Hashing |
| express-validator | Input Validation |
| Helmet | Security Headers |
| CORS | Cross-Origin Policy |
| express-rate-limit | Rate Limiting |
| compression | Response Compression |
| dotenv | Environment Variables |
| Winston | Logging |

### Storage
| เทคโนโลยี | บทบาท |
|---|---|
| Cloudinary | จัดเก็บรูปภาพ |

---

## Deployment

ระบบถูกออกแบบให้ใช้บริการ **Free Tier** ทั้งหมด

| ส่วน | เทคโนโลยี / บริการ |
|---|---|
| Frontend | Vercel |
| Backend | Railway |
| Database | PostgreSQL (Railway หรือ Supabase) |
| Cache | Redis (Upstash Free) |
| Image Storage | Cloudinary |
| Version Control | GitHub |

### Deployment Diagram

```
               User Browser
                     │
                     ▼
            Vue 3 + Vite (Vercel)
                     │
                HTTPS / REST API
                     ▼
          Express.js API (Railway)
                     │
      ┌──────────────┼──────────────┐
      ▼              ▼              ▼
 PostgreSQL       Redis         Socket.IO
      │
      ▼
 Cloudinary
```

---

## การรองรับผู้ใช้งานพร้อมกัน (Concurrent Users)

ระบบได้รับการออกแบบให้รองรับผู้ใช้งานพร้อมกันประมาณ **200 คน** โดยเน้นลดภาระของฐานข้อมูลและเพิ่มประสิทธิภาพของการตอบสนอง ดังนี้

- ใช้ **Redis Cache** สำหรับเก็บข้อมูลผู้ใช้ออนไลน์ (Online Users), Session และข้อมูลที่ถูกเรียกใช้งานบ่อย
- ใช้ **Socket.IO** สำหรับระบบ Chat, Notification, Match และสถานะออนไลน์แบบ Real-time โดยไม่ต้องใช้ Polling
- ใช้ **Pagination** ในการโหลดข้อมูล เช่น รายชื่อผู้ใช้ การ์ดสำหรับการปัด และประวัติการแชท เพื่อลดจำนวนข้อมูลที่ส่งในแต่ละครั้ง
- ใช้ **Prisma ORM** ช่วยจัดการ Query ให้มีประสิทธิภาพ
- สร้าง **Database Index** สำหรับฟิลด์ที่มีการค้นหาบ่อย เช่น กีฬา ระดับฝีมือ สนามกีฬา และสถานะผู้ใช้
- ใช้ **Compression** ลดขนาดข้อมูลที่ส่งผ่านเครือข่าย

### ตัวอย่างการทำงานของระบบ Swipe

```
Login
  ↓
โหลดผู้เล่น 20 คน
  ↓
ผู้ใช้ปัดจนหมด
  ↓
โหลดผู้เล่นชุดใหม่อีก 20 คน
```

ช่วยลดการ Query ฐานข้อมูลทุกครั้งที่มีการปัดการ์ด

---

## ตารางฐานข้อมูลหลัก (Main Database Tables)

| ตาราง | รายละเอียด |
|---|---|
| users | ข้อมูลบัญชีผู้ใช้ |
| profiles | ข้อมูลโปรไฟล์ |
| sports | ประเภทกีฬา |
| user_sports | กีฬาที่ผู้ใช้เล่น |
| swipes | ประวัติการปัด |
| matches | ข้อมูลการจับคู่ |
| messages | ข้อความแชท |
| notifications | การแจ้งเตือน |
| invites | คำเชิญเล่นกีฬา |
| reports | รายงานผู้ใช้ |
| weekly_schedule | ตารางเวลาว่าง |
| favorite_places | สนามกีฬาประจำ |
| game_history | ประวัติการเล่นกีฬา |
| achievements | ความสำเร็จ |
| events | กิจกรรมกีฬา |
| event_members | สมาชิกกิจกรรม |
| blocked_users | ผู้ใช้ที่ถูกบล็อก |
| sessions | Session การเข้าสู่ระบบ |

---

## จำนวน API โดยประมาณ

| หมวด | จำนวน |
|---|---|
| Authentication | 12 |
| User | 15 |
| Profile | 15 |
| Swipe | 8 |
| Match | 10 |
| Chat | 20 |
| Notification | 10 |
| Sport Invite | 10 |
| Event | 10 |
| Search | 10 |
| Report | 10 |
| Admin | 30 |
| **รวม** | **~150 APIs** |

---

## Architecture Overview

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
     PostgreSQL        Redis        Cloudinary
    (System Data)     (Cache)      (Images)
```

---

## การรองรับการขยายระบบ (Scalability)

เมื่อจำนวนผู้ใช้งานเพิ่มขึ้น ระบบสามารถพัฒนาไปสู่ **Microservices Architecture** ได้โดยไม่ต้องเปลี่ยนแปลง Frontend

```
                    Vue 3 + Vite
                          │
                     API Gateway
                          │
 ┌──────────────┬──────────────┬──────────────┬──────────────┐
 ▼              ▼              ▼              ▼
Auth Service  Match Service  Chat Service  Notification Service
      │              │              │              │
      └──────────────┼──────────────┼──────────────┘
                     ▼
               PostgreSQL + Redis
                     │
                 Cloudinary
```

### ข้อดีของแนวทางนี้

- Frontend ไม่ต้องแก้ไขเมื่อมีการแยก Service
- เพิ่มจำนวน Server เฉพาะ Service ที่มีโหลดสูงได้ เช่น Chat หรือ Notification
- ดูแลรักษาระบบได้ง่ายขึ้น
- รองรับผู้ใช้งานหลายพันคนในอนาคต
- ลดผลกระทบเมื่อ Service ใด Service หนึ่งเกิดปัญหา
- สามารถพัฒนาแต่ละ Service แยกกันได้โดยทีมหลายทีมในอนาคต
