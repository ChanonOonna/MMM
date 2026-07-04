import { prisma } from "../../lib/prisma";

export class ChatAccessError extends Error {}

// CHT-01, CHT-06, CHT-07: only match participants / session members / event members may access a room
export async function assertRoomAccess(userId: string, roomType: string, roomId: string) {
  if (roomType === "match") {
    const match = await prisma.match.findUnique({ where: { id: roomId } });
    if (!match || (match.userAId !== userId && match.userBId !== userId)) {
      throw new ChatAccessError("ไม่มีสิทธิ์เข้าถึงห้องแชทนี้");
    }
    return;
  }

  if (roomType === "session") {
    const member = await prisma.sportSessionMember.findFirst({
      where: { sessionId: roomId, userId, leftAt: null },
    });
    if (!member) {
      throw new ChatAccessError("ไม่ใช่สมาชิกของ Session นี้");
    }
    return;
  }

  if (roomType === "event") {
    const member = await prisma.eventMember.findFirst({ where: { eventId: roomId, userId } });
    if (!member) {
      throw new ChatAccessError("ไม่ใช่สมาชิกของ Event นี้");
    }
    return;
  }

  throw new ChatAccessError("room_type ไม่ถูกต้อง");
}

const PAGE_SIZE = 50;

// CHT-09: pagination, 50 messages/page, newest first with cursor going backwards
export async function listMessages(roomType: string, roomId: string, cursor?: string) {
  const messages = await prisma.message.findMany({
    where: { roomType: roomType as any, roomId },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  // CHT-04: unsent messages keep the row (soft delete) but hide content
  return messages.map((m) =>
    m.deletedAt
      ? { ...m, content: "ข้อความถูกยกเลิก", imageUrl: null }
      : m
  );
}

export async function sendMessage(input: {
  senderId: string;
  roomType: string;
  roomId: string;
  content?: string;
  imageUrl?: string;
}) {
  return prisma.message.create({
    data: {
      senderId: input.senderId,
      roomType: input.roomType as any,
      roomId: input.roomId,
      content: input.content,
      imageUrl: input.imageUrl,
    },
  });
}

// CHT-04: soft delete, sender only
export async function unsendMessage(messageId: string, userId: string) {
  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message || message.senderId !== userId) {
    throw new ChatAccessError("ไม่สามารถยกเลิกข้อความนี้ได้");
  }
  return prisma.message.update({ where: { id: messageId }, data: { deletedAt: new Date() } });
}

// CHT-08: purge session chat history 30 days after the session closes.
// Intended to be invoked by a scheduled job (not wired to a cron runner here).
export async function purgeExpiredSessionChats() {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const closedSessions = await prisma.sportSession.findMany({
    where: { status: { in: ["completed", "cancelled"] }, endTime: { lt: cutoff } },
    select: { id: true },
  });

  await prisma.message.deleteMany({
    where: { roomType: "session", roomId: { in: closedSessions.map((s) => s.id) } },
  });
}
