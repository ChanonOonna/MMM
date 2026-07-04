const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

// Mirrors src/app/data.ts SPORTS/VENUES in the frontend so real IDs line up with the UI.
const SPORTS = [
  "แบดมินตัน", "ฟุตบอล", "บาสเกตบอล", "เทนนิส", "วิ่ง", "ว่ายน้ำ",
  "วอลเลย์บอล", "ปิงปอง", "ฟุตซอล", "มวยไทย", "กอล์ฟ", "จักรยาน",
];

const VENUES = [
  "สนามกีฬากลาง มก.", "สระว่ายน้ำ มก.", "สนามบาสเกตบอล อาคารจุฬา",
  "สนามฟุตบอลหญ้าเทียม", "สนามแบดมินตัน อาคารกีฬา",
  "สนามเทนนิส มก.", "ลู่วิ่งสนามกีฬา", "สนามวอลเลย์บอล",
];

async function main() {
  // Note: earlier smoke-test rows ("Football", "Badminton", "KU Sports Complex") are left in
  // place since sessions/invites created during testing reference them (FK restrict on delete).

  for (const name of SPORTS) {
    await p.sport.upsert({ where: { name }, create: { name }, update: {} });
  }
  for (const name of VENUES) {
    const existing = await p.venue.findFirst({ where: { name } });
    if (!existing) await p.venue.create({ data: { name } });
  }

  const sports = await p.sport.findMany();
  const venues = await p.venue.findMany();
  console.log(`sports: ${sports.length}, venues: ${venues.length}`);
}

main()
  .then(() => p.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
