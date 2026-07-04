import { prisma } from "../../lib/prisma";
import { notify } from "../../lib/notify";

export class EventError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function createEvent(organizerId: string, input: {
  sportId: string;
  venueId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  maxCapacity?: number;
  coverUrl: string;
  coverPosX?: number;
  coverPosY?: number;
  images?: string[];
}) {
  return prisma.event.create({
    data: {
      organizerId,
      sportId: input.sportId,
      venueId: input.venueId,
      title: input.title,
      description: input.description,
      startTime: new Date(input.startTime),
      endTime: new Date(input.endTime),
      maxCapacity: input.maxCapacity,
      coverUrl: input.coverUrl,
      coverPosX: input.coverPosX,
      coverPosY: input.coverPosY,
      images: input.images ?? [],
    },
    include: { sport: true, venue: true, organizer: { select: { id: true, firstName: true, lastName: true } } },
  });
}

// EVT-02: organizer may only edit their own event; admin may edit any
async function assertCanManage(eventId: string, userId: string, role: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new EventError(404, "ไม่พบ Event");
  if (role !== "admin" && event.organizerId !== userId) {
    throw new EventError(403, "ไม่สามารถแก้ไข Event ของผู้อื่นได้");
  }
  return event;
}

export async function updateEvent(eventId: string, userId: string, role: string, input: Partial<{
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  coverUrl: string;
  coverPosX: number;
  coverPosY: number;
  images: string[];
}>) {
  await assertCanManage(eventId, userId, role);
  return prisma.event.update({
    where: { id: eventId },
    data: {
      title: input.title,
      description: input.description,
      startTime: input.startTime ? new Date(input.startTime) : undefined,
      endTime: input.endTime ? new Date(input.endTime) : undefined,
      maxCapacity: input.maxCapacity,
      coverUrl: input.coverUrl,
      coverPosX: input.coverPosX,
      coverPosY: input.coverPosY,
      images: input.images,
    },
    include: { sport: true, venue: true, organizer: { select: { id: true, firstName: true, lastName: true } } },
  });
}

export async function deleteEvent(eventId: string, userId: string, role: string) {
  await assertCanManage(eventId, userId, role);
  await prisma.event.delete({ where: { id: eventId } });
}

export async function listEvents() {
  return prisma.event.findMany({
    include: {
      sport: true,
      venue: true,
      organizer: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { members: true } },
    },
    orderBy: { startTime: "asc" },
  });
}

export async function getEvent(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      sport: true,
      venue: true,
      organizer: { select: { id: true, firstName: true, lastName: true } },
      members: {
        select: {
          id: true,
          userId: true,
          joinedAt: true,
          checkedInAt: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              nickname: true,
              photos: { take: 1, orderBy: { position: "asc" }, select: { url: true } },
            },
          },
        },
      },
    },
  });
  if (!event) throw new EventError(404, "ไม่พบ Event");
  return event;
}

export async function joinEvent(eventId: string, userId: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new EventError(404, "ไม่พบ Event");

  const existing = await prisma.eventMember.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });
  if (existing) throw new EventError(400, "คุณเข้าร่วม Event นี้แล้ว");

  if (event.maxCapacity) {
    const count = await prisma.eventMember.count({ where: { eventId } });
    if (count >= event.maxCapacity) throw new EventError(400, "Event เต็มแล้ว");
  }

  return prisma.eventMember.create({ data: { eventId, userId } });
}

// EVT-04: announcement only reaches members of this event
export async function sendAnnouncement(eventId: string, userId: string, role: string, message: string) {
  await assertCanManage(eventId, userId, role);

  const announcement = await prisma.eventAnnouncement.create({
    data: { eventId, authorId: userId, message },
    include: { author: { select: { id: true, firstName: true, lastName: true } } },
  });

  const members = await prisma.eventMember.findMany({ where: { eventId } });
  for (const member of members) {
    await notify(member.userId, "event_announcement", { eventId, message });
  }

  return announcement;
}

export async function listAnnouncements(eventId: string) {
  return prisma.eventAnnouncement.findMany({
    where: { eventId },
    include: { author: { select: { id: true, firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
  });
}

// EVT-06, EVT-07, EVT-08: organizer scans the student's HMAC-signed QR token
export async function checkInMember(eventId: string, organizerId: string, role: string, qrToken: string) {
  await assertCanManage(eventId, organizerId, role);

  const user = await prisma.user.findUnique({ where: { qrToken } });
  if (!user) throw new EventError(404, "QR Code ไม่ถูกต้อง");

  const member = await prisma.eventMember.findUnique({
    where: { eventId_userId: { eventId, userId: user.id } },
  });
  if (!member) throw new EventError(404, "ผู้ใช้นี้ไม่ได้ Join Event นี้");
  if (member.checkedInAt) throw new EventError(400, "Check-in ไปแล้ว");

  return prisma.eventMember.update({
    where: { id: member.id },
    data: { checkedInAt: new Date() },
  });
}

// EVT-03/ADM: join/check-in counts for organizer stats
export async function getEventStats(eventId: string) {
  const [joinCount, checkedInCount] = await Promise.all([
    prisma.eventMember.count({ where: { eventId } }),
    prisma.eventMember.count({ where: { eventId, checkedInAt: { not: null } } }),
  ]);
  return { joinCount, checkedInCount };
}
