import { prisma } from "../../lib/prisma";
import { notify } from "../../lib/notify";

interface Conditions {
  count_sessions?: number;
  unique_sports?: number;
  time_of_day?: { after?: string; before?: string }; // HH:mm
  consecutive_days?: number;
}

export async function createAchievement(input: {
  name: string;
  description?: string;
  icon?: string;
  conditions: Conditions;
}) {
  return prisma.achievement.create({ data: input as any });
}

export async function updateAchievement(id: string, input: Partial<{
  name: string;
  description: string;
  icon: string;
  conditions: Conditions;
}>) {
  return prisma.achievement.update({ where: { id }, data: input as any });
}

export async function deleteAchievement(id: string) {
  await prisma.achievement.delete({ where: { id } });
}

export async function listAchievements() {
  return prisma.achievement.findMany();
}

export async function listUserAchievements(userId: string) {
  return prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
    orderBy: { unlockedAt: "desc" },
  });
}

// ACH-02, ACH-03: evaluate all achievements against a user's completed session/event history
export async function checkAchievementsForUser(userId: string) {
  const [sessions, achievements, alreadyUnlocked] = await Promise.all([
    prisma.sportSessionMember.findMany({
      where: { userId, leftAt: null, session: { status: "completed" } },
      include: { session: true },
    }),
    prisma.achievement.findMany(),
    prisma.userAchievement.findMany({ where: { userId }, select: { achievementId: true } }),
  ]);

  const unlockedIds = new Set(alreadyUnlocked.map((u) => u.achievementId));
  const uniqueSports = new Set(sessions.map((s) => s.session.sportId));
  const daysPlayed = Array.from(
    new Set(sessions.map((s) => s.session.startTime.toISOString().slice(0, 10)))
  ).sort();

  const maxConsecutiveDays = (() => {
    let best = daysPlayed.length ? 1 : 0;
    let current = 1;
    for (let i = 1; i < daysPlayed.length; i++) {
      const prev = new Date(daysPlayed[i - 1]);
      const cur = new Date(daysPlayed[i]);
      const diff = (cur.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000);
      current = diff === 1 ? current + 1 : 1;
      best = Math.max(best, current);
    }
    return best;
  })();

  for (const achievement of achievements) {
    if (unlockedIds.has(achievement.id)) continue;

    const conditions = achievement.conditions as Conditions;
    let unlocked = true;

    if (conditions.count_sessions !== undefined) {
      unlocked = unlocked && sessions.length >= conditions.count_sessions;
    }
    if (conditions.unique_sports !== undefined) {
      unlocked = unlocked && uniqueSports.size >= conditions.unique_sports;
    }
    if (conditions.consecutive_days !== undefined) {
      unlocked = unlocked && maxConsecutiveDays >= conditions.consecutive_days;
    }
    if (conditions.time_of_day) {
      unlocked =
        unlocked &&
        sessions.some((s) => {
          const hhmm = s.session.startTime.toISOString().slice(11, 16);
          const afterOk = conditions.time_of_day!.after ? hhmm >= conditions.time_of_day!.after : true;
          const beforeOk = conditions.time_of_day!.before ? hhmm <= conditions.time_of_day!.before : true;
          return afterOk && beforeOk;
        });
    }

    if (unlocked) {
      await prisma.userAchievement.create({ data: { userId, achievementId: achievement.id } });
      await notify(userId, "achievement_unlocked", { achievementId: achievement.id });
    }
  }
}
