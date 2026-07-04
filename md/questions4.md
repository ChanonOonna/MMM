---
noteId: "3fdcda40731211f181ad6b28ef8d6d28"
tags: []

---

# คำถามรอบ 4 — Sports Match

> 4 จุดที่เกิดจากการรวมข้อมูลทุกไฟล์ — ต้องรู้ก่อน implement จริง

---

## 1. Swipe Algorithm — ระบบเลือกแสดง Card ยังไง?

ใน note.md บอกว่าโหลดผู้เล่น 20 คน แต่ยังไม่รู้ว่า "20 คน" คัดมาจากเกณฑ์อะไร

**Q:** ระบบเลือกแสดง Card ในหน้า Swipe จากอะไรบ้าง?

| เกณฑ์ | ใช้ | ไม่ใช้ |
|---|---|---|
| กีฬาที่ตรงกัน (user_sports) |✅| |
| Sport Level ที่ผู้ใช้ Filter เลือก |✅| |
| Availability ตรงกัน (วัน/เวลา) |✅| |
| Favorite Place เดียวกัน |✅| |
| ยังไม่เคย Swipe มาก่อน |✅ | |
| สุ่มจากทั้งหมดที่ผ่านเกณฑ์ |✅| |

---

## 2. Sport Invite → Auto Session — Session ที่สร้างอัตโนมัติเป็น Public หรือ Private?

Q9.2 ตอบว่า "ระบบสร้าง Session ให้อัตโนมัติ" เมื่ออีกคนตอบรับ Sport Invite

**Q:** Session ที่สร้างจาก Sport Invite โชว์ในหน้า Browse Session ให้คนอื่น Join ด้วยได้ไหม?
- [ ] Private — เห็นเฉพาะ 2 คนที่ Match กัน
- [✅] Public — โชว์ในหน้า Browse ให้คนอื่น Join ได้ด้วย (เช่น ถ้าต้องการ 4 คน)
- [ ] อื่นๆ: ___

---

## 3. Event Organizer — ส่ง Announcement ให้ใคร?

Q3.3 ในไฟล์ questions3.md บอกว่า Event Organizer ส่ง Announcement ได้

**Q:** Announcement ที่ Event Organizer ส่ง ไปถึงใคร?
- [✅] เฉพาะผู้ที่ Join Event ของตัวเอง
- [ ] ผู้ใช้ทุกคนในระบบ
- [ ] อื่นๆ: ___

---

## 4. Equipment — ใช้สำหรับ Filter ด้วยไหม?

note.md บอกว่าผู้ใช้ระบุว่ามีอุปกรณ์หรือไม่ แต่ไม่ได้บอกว่าใช้ทำอะไรนอกจากแสดงบน Profile

**Q:** ข้อมูลอุปกรณ์ (Equipment) ใช้ทำอะไรบ้าง?
- [] แสดงบน Profile อย่างเดียว
- [ ] ใช้ Filter ใน Swipe ได้ (เช่น หาคนที่มีลูกแบด)
- [ ] ใช้ Filter ใน Sport Session ได้
- [✅] ทั้งหมดที่ติ๊ก
- [ ] อื่นๆ: ___
