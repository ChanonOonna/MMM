const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const p = new PrismaClient();

async function main() {
  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash("adminpass123", 12);
  const qrToken = crypto
    .createHmac("sha256", process.env.QR_SECRET || "seed")
    .update(id)
    .digest("hex");

  const admin = await p.user.upsert({
    where: { email: "admin@ku.th" },
    create: {
      id,
      email: "admin@ku.th",
      passwordHash,
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      qrToken,
    },
    update: {},
  });
  console.log("admin", admin.id, "password: adminpass123");

  // Event Organizer
  const organizerId = crypto.randomUUID();
  const organizerHash = await bcrypt.hash("organizer123", 12);
  const organizerQR = crypto
    .createHmac("sha256", process.env.QR_SECRET || "seed")
    .update(organizerId)
    .digest("hex");
  
  const organizer = await p.user.upsert({
    where: { email: "organizer@ku.th" },
    create: {
      id: organizerId,
      email: "organizer@ku.th",
      passwordHash: organizerHash,
      firstName: "Organizer",
      lastName: "Event",
      role: "event_organizer",
      qrToken: organizerQR,
    },
    update: {},
  });
  console.log("organizer", organizer.id, "password: organizer123");

  // Regular User
  const userId = crypto.randomUUID();
  const userHash = await bcrypt.hash("user123", 12);
  const userQR = crypto
    .createHmac("sha256", process.env.QR_SECRET || "seed")
    .update(userId)
    .digest("hex");
  
  const user = await p.user.upsert({
    where: { email: "user@ku.th" },
    create: {
      id: userId,
      email: "user@ku.th",
      passwordHash: userHash,
      firstName: "Test",
      lastName: "User",
      role: "user",
      qrToken: userQR,
    },
    update: {},
  });
  console.log("user", user.id, "password: user123");

  const football = await p.sport.upsert({
    where: { name: "Football" },
    create: { name: "Football" },
    update: {},
  });
  const badminton = await p.sport.upsert({
    where: { name: "Badminton" },
    create: { name: "Badminton" },
    update: {},
  });
  console.log("sports", football.id, badminton.id);

  let venue = await p.venue.findFirst({ where: { name: "KU Sports Complex" } });
  if (!venue) {
    venue = await p.venue.create({ data: { name: "KU Sports Complex" } });
  }
  console.log("venue", venue.id);
}

main()
  .then(() => p.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
