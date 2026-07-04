import { prisma } from "../../lib/prisma";
import { notify } from "../../lib/notify";
import { io } from "../../socket";
import { checkAchievementsForUser } from "../achievement/achievement.service";

export class SessionError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const publicUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  nickname: true,
  photos: { take: 1, orderBy: { position: "asc" as const }, select: { url: true } },
} as const;

// SES-02: lazily advance status based on start/end time when a session is read
async function syncStatus(session: { id: string; status: string; startTime: Date; endTime: Date }) {
  const now = new Date();
  let next = session.status;

  if ((session.status === "open" || session.status === "full") && now >= session.startTime) {
    next = "ongoing";
  }
  if (session.status === "ongoing" && now >= session.endTime) {
    next = "completed";
  }

  if (next !== session.status) {
    await prisma.sportSession.update({ where: { id: session.id }, data: { status: next as any } });
    session.status = next;

    if (next === "completed") {
      // ACH-03: evaluate achievements for everyone who stayed through the session
      const members = await prisma.sportSessionMember.findMany({
        where: { sessionId: session.id, leftAt: null },
      });
      for (const member of members) {
        await checkAchievementsForUser(member.userId);
      }
    }
  }
  return session;
}

export async function createSession(hostUserId: string, input: {
  sportId: string;
  venueId: string;
  title: string;
  description?: string;
  skillLevel: string;
  equipmentRequired?: boolean;
  maxPlayers: number;
  startTime: string;
  endTime: string;
}) {
  return prisma.$transaction(async (tx) => {
    const session = await tx.sportSession.create({
      data: {
        hostUserId,
        sportId: input.sportId,
        venueId: input.venueId,
        title: input.title,
        description: input.description,
        skillLevel: input.skillLevel as any,
        equipmentRequired: input.equipmentRequired ?? false,
        maxPlayers: input.maxPlayers,
        currentPlayers: 1,
        startTime: new Date(input.startTime),
        endTime: new Date(input.endTime),
      },
    });

    await tx.sportSessionMember.create({
      data: { sessionId: session.id, userId: hostUserId },
    });

    return session;
  });
}

// SES-04: browse only open sessions with filters
export async function browseSessions(filters: {
  sportId?: string;
  venueId?: string;
  skillLevel?: string;
  equipmentRequired?: boolean;
  search?: string;
}) {
  const sessions = await prisma.sportSession.findMany({
    where: {
      status: "open",
      ...(filters.sportId ? { sportId: filters.sportId } : {}),
      ...(filters.venueId ? { venueId: filters.venueId } : {}),
      ...(filters.skillLevel ? { skillLevel: filters.skillLevel as any } : {}),
      ...(filters.equipmentRequired !== undefined
        ? { equipmentRequired: filters.equipmentRequired }
        : {}),
      ...(filters.search
        ? {
            OR: [
              { title: { contains: filters.search, mode: "insensitive" } },
              { sport: { name: { contains: filters.search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: { sport: true, venue: true, host: { select: publicUserSelect } },
    orderBy: { startTime: "asc" },
  });

  return Promise.all(sessions.map((s) => syncStatus(s)));
}

export async function getSession(id: string) {
  const session = await prisma.sportSession.findUnique({
    where: { id },
    include: {
      sport: true,
      venue: true,
      host: { select: publicUserSelect },
      members: { where: { leftAt: null }, include: { user: { select: publicUserSelect } } },
    },
  });
  if (!session) throw new SessionError(404, "ไม่พบ Session");
  await syncStatus(session);
  return session;
}

// US-026: a user's session participation history, for the profile page
export async function listMySessions(userId: string) {
  const memberships = await prisma.sportSessionMember.findMany({
    where: { userId },
    include: { session: { include: { sport: true, venue: true } } },
    orderBy: { joinedAt: "desc" },
  });

  return memberships.map((m) => ({
    sessionId: m.sessionId,
    joinedAt: m.joinedAt,
    leftAt: m.leftAt,
    status: m.session.status,
    title: m.session.title,
    sport: m.session.sport.name,
    venue: m.session.venue.name,
    startTime: m.session.startTime,
    endTime: m.session.endTime,
    maxPlayers: m.session.maxPlayers,
    currentPlayers: m.session.currentPlayers,
  }));
}

// host edits their own room's details
export async function updateSession(sessionId: string, hostUserId: string, input: Partial<{
  sportId: string;
  venueId: string;
  title: string;
  description: string;
  skillLevel: string;
  equipmentRequired: boolean;
  maxPlayers: number;
  startTime: string;
  endTime: string;
}>) {
  const session = await prisma.sportSession.findUnique({ where: { id: sessionId } });
  if (!session) throw new SessionError(404, "ไม่พบ Session");
  if (session.hostUserId !== hostUserId) throw new SessionError(403, "เฉพาะเจ้าของห้องเท่านั้น");
  if (input.maxPlayers !== undefined && input.maxPlayers < session.currentPlayers) {
    throw new SessionError(400, "จำนวนสูงสุดต้องไม่น้อยกว่าจำนวนสมาชิกปัจจุบัน");
  }

  return prisma.sportSession.update({
    where: { id: sessionId },
    data: {
      sportId: input.sportId,
      venueId: input.venueId,
      title: input.title,
      description: input.description,
      skillLevel: input.skillLevel as any,
      equipmentRequired: input.equipmentRequired,
      maxPlayers: input.maxPlayers,
      startTime: input.startTime ? new Date(input.startTime) : undefined,
      endTime: input.endTime ? new Date(input.endTime) : undefined,
    },
    include: { sport: true, venue: true, host: { select: publicUserSelect } },
  });
}

// SES-05: join, auto-full when at capacity
export async function joinSession(sessionId: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const session = await tx.sportSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new SessionError(404, "ไม่พบ Session");
    if (session.status !== "open") throw new SessionError(400, "Session นี้ไม่เปิดรับสมาชิกแล้ว");

    const existing = await tx.sportSessionMember.findUnique({
      where: { sessionId_userId: { sessionId, userId } },
    });
    if (existing && !existing.leftAt) throw new SessionError(400, "คุณเข้าร่วม Session นี้แล้ว");

    if (existing) {
      await tx.sportSessionMember.update({
        where: { id: existing.id },
        data: { leftAt: null, leaveReason: null, kicked: false },
      });
    } else {
      await tx.sportSessionMember.create({ data: { sessionId, userId } });
    }

    const currentPlayers = session.currentPlayers + 1;
    const status = currentPlayers >= session.maxPlayers ? "full" : "open";

    const updated = await tx.sportSession.update({
      where: { id: sessionId },
      data: { currentPlayers, status: status as any },
    });

    await notify(session.hostUserId, "session_member_joined", { sessionId, userId });
    io().to(`session:${sessionId}`).emit("session_member_joined", { sessionId, userId });

    return updated;
  });
}

// SES-06: host kicks a member
export async function kickMember(sessionId: string, hostUserId: string, targetUserId: string) {
  return prisma.$transaction(async (tx) => {
    const session = await tx.sportSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new SessionError(404, "ไม่พบ Session");
    if (session.hostUserId !== hostUserId) throw new SessionError(403, "เฉพาะ Host เท่านั้น");
    if (targetUserId === hostUserId) throw new SessionError(400, "Host ไม่สามารถ Kick ตัวเองได้");

    const member = await tx.sportSessionMember.findUnique({
      where: { sessionId_userId: { sessionId, userId: targetUserId } },
    });
    if (!member || member.leftAt) throw new SessionError(404, "ไม่พบสมาชิกนี้ใน Session");

    await tx.sportSessionMember.update({
      where: { id: member.id },
      data: { leftAt: new Date(), kicked: true },
    });

    const currentPlayers = Math.max(1, session.currentPlayers - 1);
    await tx.sportSession.update({
      where: { id: sessionId },
      data: { currentPlayers, status: "open" },
    });

    await notify(targetUserId, "session_kicked", { sessionId });
    io().to(`session:${sessionId}`).emit("session_member_left", { sessionId, userId: targetUserId });
  });
}

// SES-09: host permanently deletes a room they created
export async function deleteSession(sessionId: string, hostUserId: string) {
  return prisma.$transaction(async (tx) => {
    const session = await tx.sportSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new SessionError(404, "ไม่พบ Session");
    if (session.hostUserId !== hostUserId) throw new SessionError(403, "เฉพาะเจ้าของห้องเท่านั้น");

    const remaining = await tx.sportSessionMember.findMany({
      where: { sessionId, leftAt: null, userId: { not: hostUserId } },
    });

    await tx.message.deleteMany({ where: { roomType: "session", roomId: sessionId } });
    await tx.sportSession.delete({ where: { id: sessionId } });

    for (const m of remaining) {
      await notify(m.userId, "session_deleted", { sessionId });
    }
    io().to(`session:${sessionId}`).emit("session_deleted", { sessionId });
  });
}

// SES-07, SES-08: member leaves normally, or host leaving cancels the session
export async function leaveSession(sessionId: string, userId: string, reason?: string) {
  return prisma.$transaction(async (tx) => {
    const session = await tx.sportSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new SessionError(404, "ไม่พบ Session");

    const member = await tx.sportSessionMember.findUnique({
      where: { sessionId_userId: { sessionId, userId } },
    });
    if (!member || member.leftAt) throw new SessionError(400, "คุณไม่ได้อยู่ใน Session นี้");

    await tx.sportSessionMember.update({
      where: { id: member.id },
      data: { leftAt: new Date(), leaveReason: reason },
    });

    if (session.hostUserId === userId) {
      await tx.sportSession.update({ where: { id: sessionId }, data: { status: "cancelled" } });

      const remaining = await tx.sportSessionMember.findMany({
        where: { sessionId, leftAt: null },
      });
      for (const m of remaining) {
        await notify(m.userId, "session_cancelled", { sessionId });
      }
      io().to(`session:${sessionId}`).emit("session_cancelled", { sessionId });
    } else {
      const currentPlayers = Math.max(1, session.currentPlayers - 1);
      await tx.sportSession.update({
        where: { id: sessionId },
        data: { currentPlayers, status: "open" },
      });
      io().to(`session:${sessionId}`).emit("session_member_left", { sessionId, userId });
    }
  });
}
