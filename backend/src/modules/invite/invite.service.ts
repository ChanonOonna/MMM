import { prisma } from "../../lib/prisma";
import { notify } from "../../lib/notify";

export class InviteError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// INV-01, INV-02: invite can only be sent to a matched user
export async function createInvite(senderId: string, input: {
  matchId: string;
  sportId: string;
  venueId: string;
  date: string;
  maxPlayers: number;
  message?: string;
}) {
  const match = await prisma.match.findUnique({ where: { id: input.matchId } });
  if (!match || (match.userAId !== senderId && match.userBId !== senderId)) {
    throw new InviteError(403, "ส่ง Invite ได้เฉพาะคู่ Match เท่านั้น");
  }

  const receiverId = match.userAId === senderId ? match.userBId : match.userAId;

  const invite = await prisma.sportInvite.create({
    data: {
      matchId: input.matchId,
      senderId,
      receiverId,
      sportId: input.sportId,
      venueId: input.venueId,
      date: new Date(input.date),
      maxPlayers: input.maxPlayers,
      message: input.message,
    },
  });

  await notify(receiverId, "invite_received", { inviteId: invite.id });
  return invite;
}

// INV-03, INV-04: accept auto-creates a public session; reject just notifies the sender
export async function respondInvite(inviteId: string, receiverId: string, accept: boolean) {
  const invite = await prisma.sportInvite.findUnique({ where: { id: inviteId } });
  if (!invite || invite.receiverId !== receiverId) {
    throw new InviteError(404, "ไม่พบ Invite");
  }
  if (invite.status !== "pending") {
    throw new InviteError(400, "Invite นี้ถูกตอบรับไปแล้ว");
  }

  if (!accept) {
    await prisma.sportInvite.update({
      where: { id: inviteId },
      data: { status: "rejected", respondedAt: new Date() },
    });
    await notify(invite.senderId, "invite_rejected", { inviteId });
    return { session: null };
  }

  return prisma.$transaction(async (tx) => {
    await tx.sportInvite.update({
      where: { id: inviteId },
      data: { status: "accepted", respondedAt: new Date() },
    });

    const session = await tx.sportSession.create({
      data: {
        hostUserId: invite.senderId,
        sportId: invite.sportId,
        venueId: invite.venueId,
        title: "นัดเล่นจาก Sport Invite",
        skillLevel: "beginner",
        maxPlayers: invite.maxPlayers,
        currentPlayers: 2,
        startTime: invite.date,
        endTime: new Date(invite.date.getTime() + 2 * 60 * 60 * 1000),
        source: "from_invite",
        inviteId,
      },
    });

    await tx.sportSessionMember.createMany({
      data: [
        { sessionId: session.id, userId: invite.senderId },
        { sessionId: session.id, userId: invite.receiverId },
      ],
    });

    await notify(invite.senderId, "invite_accepted", { inviteId, sessionId: session.id });
    return { session };
  });
}

export async function listInvites(userId: string) {
  return prisma.sportInvite.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    include: { sport: true, venue: true },
    orderBy: { createdAt: "desc" },
  });
}
