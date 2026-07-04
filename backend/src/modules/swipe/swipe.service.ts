import { prisma } from "../../lib/prisma";
import { notify } from "../../lib/notify";

const PAGE_SIZE = 20;

interface DeckOptions {
  viewerId: string;
  sportId?: string;
  levelFilter?: string; // 'all' | 'same' | comma separated levels
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function scheduleOverlaps(
  a: { dayOfWeek: number; startTime: string; endTime: string }[],
  b: { dayOfWeek: number; startTime: string; endTime: string }[]
) {
  return a.some((slotA) =>
    b.some(
      (slotB) =>
        slotA.dayOfWeek === slotB.dayOfWeek &&
        timeToMinutes(slotA.startTime) < timeToMinutes(slotB.endTime) &&
        timeToMinutes(slotB.startTime) < timeToMinutes(slotA.endTime)
    )
  );
}

// SWP-01..SWP-05: 20 cards/page, progressively relax favorite-place then availability
export async function getSwipeDeck(opts: DeckOptions) {
  const viewer = await prisma.user.findUniqueOrThrow({
    where: { id: opts.viewerId },
    include: { sports: true, weeklySchedule: true, favoritePlaces: true },
  });

  const swipedIds = (
    await prisma.swipe.findMany({ where: { swiperId: opts.viewerId }, select: { swipedId: true } })
  ).map((s) => s.swipedId);

  const blockedIds = (
    await prisma.blockedUser.findMany({
      where: { OR: [{ blockerId: opts.viewerId }, { targetId: opts.viewerId }] },
    })
  ).map((b) => (b.blockerId === opts.viewerId ? b.targetId : b.blockerId));

  const sportIds = opts.sportId ? [opts.sportId] : viewer.sports.map((s) => s.sportId);
  const levels =
    opts.levelFilter && opts.levelFilter !== "all"
      ? opts.levelFilter === "same"
        ? viewer.sports.filter((s) => sportIds.includes(s.sportId)).map((s) => s.level)
        : opts.levelFilter.split(",")
      : undefined;

  const candidates = await prisma.user.findMany({
    where: {
      id: { notIn: [opts.viewerId, ...swipedIds, ...blockedIds] },
      sports: {
        some: {
          sportId: { in: sportIds },
          ...(levels ? { level: { in: levels as any } } : {}),
        },
      },
    },
    include: {
      sports: { include: { sport: true } },
      photos: { orderBy: { position: "asc" } },
      weeklySchedule: true,
      favoritePlaces: { include: { venue: true } },
    },
    take: 500,
  });

  const myVenueIds = new Set(viewer.favoritePlaces.map((f) => f.venueId));

  let relaxed = 0;
  let filtered = candidates.filter(
    (c) =>
      c.favoritePlaces.some((f) => myVenueIds.has(f.venueId)) &&
      scheduleOverlaps(viewer.weeklySchedule, c.weeklySchedule)
  );

  if (filtered.length === 0) {
    relaxed = 1; // SWP-03: drop favorite place
    filtered = candidates.filter((c) => scheduleOverlaps(viewer.weeklySchedule, c.weeklySchedule));
  }

  if (filtered.length === 0) {
    relaxed = 2; // SWP-04: drop availability too
    filtered = candidates;
  }

  return {
    cards: filtered.slice(0, PAGE_SIZE).map((c) => ({
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      nickname: c.nickname,
      warningBadge: c.warningBadge,
      hasEquipment: c.hasEquipment,
      photos: c.photos,
      sports: c.sports.map((s) => ({ sport: s.sport.name, icon: s.sport.icon, level: s.level })),
      venue: c.favoritePlaces[0]?.venue.name ?? null,
      schedule: c.weeklySchedule.map((s) => ({ dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime })),
    })),
    relaxed,
  };
}

// SWP-06, SWP-07: mutual right-swipe creates a match + notifies both sides
export async function swipeUser(swiperId: string, swipedId: string, direction: "left" | "right") {
  if (swiperId === swipedId) {
    throw new Error("ไม่สามารถ Swipe ตัวเองได้");
  }

  await prisma.swipe.upsert({
    where: { swiperId_swipedId: { swiperId, swipedId } },
    create: { swiperId, swipedId, direction },
    update: { direction },
  });

  if (direction !== "right") {
    return { match: null };
  }

  const reciprocal = await prisma.swipe.findUnique({
    where: { swiperId_swipedId: { swiperId: swipedId, swipedId: swiperId } },
  });

  if (!reciprocal || reciprocal.direction !== "right") {
    return { match: null };
  }

  const [userAId, userBId] = [swiperId, swipedId].sort();
  const match = await prisma.match.upsert({
    where: { userAId_userBId: { userAId, userBId } },
    create: { userAId, userBId },
    update: {},
  });

  await notify(swiperId, "match", { matchId: match.id, withUserId: swipedId });
  await notify(swipedId, "match", { matchId: match.id, withUserId: swiperId });

  return { match };
}

// SWP-08: mutual block, both directions
export async function blockUser(blockerId: string, targetId: string) {
  await prisma.$transaction([
    prisma.blockedUser.upsert({
      where: { blockerId_targetId: { blockerId, targetId } },
      create: { blockerId, targetId },
      update: {},
    }),
    prisma.blockedUser.upsert({
      where: { blockerId_targetId: { blockerId: targetId, targetId: blockerId } },
      create: { blockerId: targetId, targetId: blockerId },
      update: {},
    }),
  ]);
}

const matchUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  nickname: true,
  photos: { take: 1, orderBy: { position: "asc" as const }, select: { url: true } },
} as const;

export async function listMatches(userId: string) {
  const matches = await prisma.match.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
    include: { userA: { select: matchUserSelect }, userB: { select: matchUserSelect } },
    orderBy: { createdAt: "desc" },
  });

  return matches.map((m) => {
    const other = m.userAId === userId ? m.userB : m.userA;
    return {
      matchId: m.id,
      createdAt: m.createdAt,
      user: {
        id: other.id,
        firstName: other.firstName,
        lastName: other.lastName,
        nickname: other.nickname,
        photos: other.photos,
      },
    };
  });
}
