---
noteId: "25a5f9c0732311f181ad6b28ef8d6d28"
tags: []

---

# Sports Match — Design Brief

ระบบนี้ใช้งานได้ทั้งบน PC และมือถือ โดยรองรับ 3 ขนาดหน้าจอหลัก ได้แก่ Desktop (1440px), Mobile ขนาดปกติ (390px) และ Mobile ขนาดเล็ก (375px) ทุกหน้าจอต้องใช้งานได้ลื่นไหลเท่าเทียมกัน ไม่ใช่แค่ย่อขนาดลงมา

---

## ภาพรวมของแอป

Sports Match คือแพลตฟอร์มสำหรับนิสิตมหาวิทยาลัยเกษตรศาสตร์ที่อยากหาเพื่อนเล่นกีฬา แนวคิดหลักคล้าย Tinder แต่จุดประสงค์คือนัดเล่นกีฬา ไม่ใช่หาคู่ ดังนั้นบรรยากาศโดยรวมควรดูมีพลัง สดใส และน่าเชื่อถือ ไม่หวานหรือโรแมนติก

กลุ่มผู้ใช้หลักคือนิสิตอายุ 18–25 ปี คุ้นเคยกับแอปโซเชียลมีเดียอยู่แล้ว ดังนั้น UI ไม่ต้องอธิบายมาก แต่ต้องรู้สึกคุ้นเคยและใช้งานได้ทันที

---

## โทนสีและสไตล์

สีหลักเป็นเขียว (#16A34A) เพราะสื่อถึงกีฬา พลังงาน และความสดชื่น ใช้เป็นสีของปุ่มหลัก, badge สำคัญ และ active state ทั้งหมด สีรองใช้ขาวและเทาอ่อนเป็นพื้นหลัง ให้ดูสะอาดและไม่รกตา

สำหรับ badge พิเศษ ใช้สีแดง (#DC2626) สำหรับ warning และ No Show, สีชมพู (#EC4899) สำหรับ Match notification และสีทอง (#F59E0B) สำหรับ Achievement

ฟอนต์ใช้ Noto Sans Thai สำหรับภาษาไทย และ Inter สำหรับภาษาอังกฤษและตัวเลข ทั้งคู่อ่านง่ายและดูทันสมัย ไม่ต้องใช้ฟอนต์ตกแต่งหรือ display font

สไตล์โดยรวมเป็น card-based มุมมน 12px สำหรับ card และ 8px สำหรับปุ่ม shadow เบาๆ ไม่เน้น ให้รู้สึก light และ airy

---

## Layout แต่ละขนาดหน้าจอ

**Desktop (1440px)** — ใช้ sidebar ซ้ายกว้าง 240px เป็น navigation หลัก content อยู่ตรงกลาง บางหน้าเช่น Chat หรือ Session Detail ใช้ split panel แบ่งซ้าย-ขวา เพื่อใช้พื้นที่ได้คุ้มค่า ไม่ควรมีพื้นที่ว่างมากเกินไป

**Mobile 390px** — navigation ย้ายไปอยู่ด้านล่างเป็น bottom tab bar 5 ปุ่ม content เต็มความกว้าง padding ซ้ายขวา 16px modal ทุกอันเป็น bottom sheet เลื่อนขึ้นมาจากล่าง

**Mobile 375px** — เหมือน 390px แต่ font size ลดลง 1–2px ในส่วน heading และปุ่มเป็น full-width ทั้งหมดเพื่อให้กดง่ายบนหน้าจอแคบ

---

## หน้าจอหลักที่ต้องออกแบบ

### หน้า Login และ Register

ใช้รูปกีฬาเป็น background ทั้งหน้า มี overlay มืดประมาณ 60% เพื่อให้อ่าน text ได้ชัด ตรงกลางเป็น card สีขาวลอยอยู่ มี tab สลับระหว่าง "เข้าสู่ระบบ" และ "สมัครสมาชิก" ด้านล่าง card มีหมายเหตุเล็กๆ ว่าใช้ได้เฉพาะ @ku.th

บน mobile ให้ card เต็มความสูงครึ่งล่างของหน้าจอ ส่วนบนเป็นรูปและ logo

### หน้า Onboarding (5 ขั้นตอน)

แสดง progress bar หรือ step indicator ด้านบน ให้ผู้ใช้รู้ว่าเดินมาถึงไหนแล้ว

ขั้นที่ 1 เลือกกีฬา — แสดงเป็น grid 3 คอลัมน์ แต่ละ card มี emoji กีฬาและชื่อ เมื่อเลือกแล้วให้ border เขียวและมี checkmark เล็กๆ มุมบนขวา

ขั้นที่ 2 ระดับฝีมือ — 4 ตัวเลือกเรียงแนวตั้ง แต่ละอันมีชื่อและคำอธิบายสั้นๆ ว่าระดับนี้เหมาะกับใคร

ขั้นที่ 3 เวลาว่าง — เลือกวันในสัปดาห์เป็น pill แนวนอน แล้วมี time picker สำหรับช่วงเวลา

ขั้นที่ 4 สนามประจำ — มี search bar ด้านบน แสดงผลลัพธ์เป็น list กดเลือกได้สูงสุด 5 สนาม ที่เลือกแล้วแสดงเป็น pill ด้านบนมีปุ่ม × ลบออก

ขั้นที่ 5 รูปโปรไฟล์ — วงกลมใหญ่กลางหน้าจอสำหรับอัปโหลด รูปหลัก 1 รูป และช่องเล็ก 4 ช่องด้านล่าง มีปุ่ม Skip สำหรับคนที่ยังไม่อยากใส่ตอนนี้

### หน้า Swipe (หน้าแรกหลัง login)

นี่คือหัวใจของแอป card ควรดึงดูดสายตาที่สุด

ตัว card เต็มความกว้างบน mobile รูปโปรไฟล์อยู่บน 65% ส่วนล่างมี gradient มืดแล้วแสดงข้อมูล ชื่อ, กีฬาที่เล่น, ระดับ, สนามประจำ และวันที่ว่าง ถ้ามีป้าย Warning ให้แสดง badge สีส้มมุมบนซ้าย

ปุ่ม Pass (✕) และ Like (❤) อยู่ใต้ card ปุ่ม Like ใหญ่กว่าเล็กน้อยและเป็นสีเขียว

บน desktop card อยู่กลางหน้า ขวามือเป็น panel แสดง Match ล่าสุด

### หน้า Chat

แบ่งเป็น 2 ส่วนบน desktop คือรายชื่อซ้ายและ conversation ขวา บน mobile เข้าไปหน้าแชทได้เลยเต็มจอ

bubble ของเราอยู่ขวาพื้นหลังเขียว ของอีกฝ่ายอยู่ซ้ายพื้นหลังเทาอ่อน รองรับทั้งข้อความและรูปภาพ ข้อความที่ unsend แล้วแสดงเป็น italic สีเทา "ข้อความถูกยกเลิก"

ถ้ามีการส่ง Sport Invite ให้แสดงเป็น card พิเศษในแชท มีรายละเอียดการนัดและปุ่ม ตอบรับ / ปฏิเสธ

### หน้า Sport Session — Browse และ Detail

Browse แสดงเป็น card grid บน desktop (3 คอลัมน์) และ list บน mobile แต่ละ card บอกกีฬา วัน เวลา สนาม ระดับ และจำนวนคนที่เปิดรับ มี progress bar แสดงว่าเต็มแค่ไหน

Detail page บน desktop แบ่ง left-right ซ้ายรายละเอียด ขวา group chat บน mobile ใช้ tab สลับ

### หน้า Event

คล้าย Sport Session แต่ดูใหญ่กว่าและเป็นทางการกว่า มี cover image จริงแทน emoji มีปุ่ม Check-in ที่เมื่อกดแล้วจะเปิด QR Code ของตัวเองขึ้นมาเต็มจอ พร้อมปรับ brightness อัตโนมัติให้สแกนง่าย

### หน้า Profile

แบ่งเป็นส่วน header ที่มีรูป ชื่อ และ badge ต่างๆ แล้วด้านล่างมี tab สลับระหว่างข้อมูล, ประวัติการเล่น และ Achievement ที่ปลดล็อกแล้ว

### Admin Dashboard

ออกแบบสำหรับ desktop เป็นหลัก แถว top แสดง stat cards 4 อัน (User Online, Match วันนี้, DAU, Report รอตรวจ) ด้านล่างมี Heat Map ของสนามกีฬา และตาราง Report ที่รอตรวจสอบพร้อมรูปหลักฐาน

---

## Component สำคัญ

**Avatar** — วงกลมทุกขนาด มี online dot สีเขียวมุมล่างขวา ถ้าบัญชีมี Warning ให้มี badge สีส้มแทน

**Sport Badge** — pill เล็กๆ พื้นเขียวอ่อน ข้อความเขียวเข้ม มี emoji กีฬานำหน้า

**Level Badge** — pill เหมือนกันแต่สีต่างกันตามระดับ เขียวสำหรับผู้เริ่มต้น, น้ำเงินสำหรับกลาง, เหลืองสำหรับสูง, ชมพูสำหรับแข่งขัน

**Bottom Navigation (Mobile)** — 5 ปุ่ม: Swipe, Session, Chat, Event, Profile สูง 64px บวก safe area ปุ่ม active เป็นสีเขียว

**Sidebar Navigation (Desktop)** — กว้าง 240px พื้นขาว border ขวา nav item active มีพื้นหลังเขียวอ่อน ด้านล่างสุดเป็น avatar + ชื่อผู้ใช้

---

## Animation และ Interaction

การ swipe card ใช้ physics-based motion ดูเป็นธรรมชาติ ไม่กระตุก เมื่อ Match สำเร็จมี animation สนุกๆ สักวินาทีครึ่ง notification เลื่อนลงมาจากบนหน้าจอ bottom sheet เลื่อนขึ้นมาจากล่างอย่างลื่นไหล ทั้งหมดใช้ transition ไม่เกิน 350ms เพื่อไม่ให้ช้าเกินไป

---

## Figma Prompt (สำหรับ Make Designs / Figma AI)

```
Design a responsive web app called Sports Match for Thai university students.
The app helps students find sports partners, similar to Tinder but for sports.

Style: Modern, clean, card-based UI. Primary color green #16A34A.
Font: Noto Sans Thai + Inter. Rounded corners (cards 12px, buttons 8px).
Responsive: Desktop 1440px with left sidebar 240px, Mobile 390px with bottom navigation 5 tabs.

Screens to design:

1. Login/Register — sport photo background with dark overlay, centered white card with email/password form, tab switcher login/register, note about @ku.th only

2. Onboarding 5 steps — sport selection grid 3 columns with emoji cards, skill level 4 options stacked, weekly schedule day pills + time picker, venue search with selected pills, profile photo upload with 1 main circle + 4 small slots

3. Swipe deck — full-bleed photo card with gradient overlay showing name/sport badges/level/venue/availability, Pass button (gray X) and Like button (green heart) below card, right panel shows recent matches on desktop

4. Chat — left list of matches, right conversation panel (desktop split), green bubbles right sent, gray bubbles left received, Sport Invite card component with accept/reject buttons

5. Sport Session browse — card grid 3 cols desktop/1 col mobile, each card has sport emoji, title, date/time/venue, level badge, player count progress bar, join button

6. Sport Session detail + group chat — left detail/right chat split on desktop, tab switch on mobile, members avatar list, join/leave button

7. User profile — cover photo header, avatar overlapping, name with verified badge, sport tags, 3 tabs: info/history/achievements

8. Event page — similar to session but with real cover image, QR code modal full screen for check-in

9. Admin dashboard — 4 stat cards top row, heatmap grid for venues, report queue table with evidence thumbnails

10. Notification page — list of notifications with avatar, text, time, unread blue indicator

Use auto-layout for all components. Include hover and active states. Thai language UI.
```
