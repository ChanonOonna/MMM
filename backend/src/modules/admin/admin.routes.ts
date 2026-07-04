import { Router, Request, Response } from "express";
import { body, param, query, validationResult } from "express-validator";
import { requireAuth, requireRole, AuthedRequest } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/asyncHandler";
import { prisma } from "../../lib/prisma";
import { io } from "../../socket";
import { generateUploadSignature } from "../../lib/cloudinary";
import {
  approveReport,
  listReportQueue,
  rejectReport,
  ReportError,
  resetNoShowCount,
} from "../report/report.service";
import {
  createAchievement,
  deleteAchievement,
  updateAchievement,
} from "../achievement/achievement.service";

const router = Router();
router.use(requireAuth, requireRole("admin"));

function validate(req: any, res: any) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
}

function handle(res: Response, fn: () => Promise<any>) {
  return fn().catch((error: any) => {
    if (error instanceof ReportError) return res.status(error.status).json({ error: error.message });
    throw error;
  });
}

// ADM-01: overview stats. Online users approximated via active Socket.IO connections
// (NFR-P04 recommends Redis for this at production scale).
router.get(
  "/dashboard",
  asyncHandler(async (_req: Request, res: Response) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [matchesToday, activeUsersToday, popularSports] = await Promise.all([
      prisma.match.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.swipe.groupBy({ by: ["swiperId"], where: { createdAt: { gte: startOfDay } } }),
      prisma.userSport.groupBy({
        by: ["sportId"],
        _count: { userId: true },
        orderBy: { _count: { userId: "desc" } },
        take: 5,
      }),
    ]);

    const sportIds = popularSports.map((p) => p.sportId);
    const sports = await prisma.sport.findMany({ where: { id: { in: sportIds } } });
    const sportNameById = new Map(sports.map((s) => [s.id, s.name]));

    res.json({
      onlineUsers: io().engine.clientsCount,
      matchesToday,
      dau: activeUsersToday.length,
      popularSports: popularSports.map((p) => ({
        sport: sportNameById.get(p.sportId),
        count: p._count.userId,
      })),
    });
  })
);

// ADM-02: user count per venue via sessions + events
router.get(
  "/heatmap",
  asyncHandler(async (_req: Request, res: Response) => {
    const [sessionCounts, venues] = await Promise.all([
      prisma.sportSession.groupBy({ by: ["venueId"], _sum: { currentPlayers: true } }),
      prisma.venue.findMany(),
    ]);

    const venueNameById = new Map(venues.map((v) => [v.id, v.name]));
    res.json(
      sessionCounts.map((s) => ({
        venue: venueNameById.get(s.venueId),
        players: s._sum.currentPlayers ?? 0,
      }))
    );
  })
);

// ADM-03
router.get(
  "/reports",
  query("status").optional().isString(),
  asyncHandler(async (req: Request, res: Response) => {
    if (!validate(req, res)) return;
    res.json(await listReportQueue(req.query.status as string | undefined));
  })
);

router.post(
  "/reports/:id/approve",
  param("id").isString(),
  body("adminNote").optional().isString(),
  asyncHandler((req: Request, res: Response) =>
    handle(res, async () => {
      await approveReport(req.params.id, req.body.adminNote);
      res.status(204).send();
    })
  )
);

router.post(
  "/reports/:id/reject",
  param("id").isString(),
  body("adminNote").optional().isString(),
  asyncHandler((req: Request, res: Response) =>
    handle(res, async () => {
      await rejectReport(req.params.id, req.body.adminNote);
      res.status(204).send();
    })
  )
);

// ADM-06/08: user management list
const adminUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  nickname: true,
  role: true,
  warningBadge: true,
  noShowCount: true,
  createdAt: true,
  photos: { take: 1, orderBy: { position: "asc" as const }, select: { url: true } },
};

router.get(
  "/users",
  query("search").optional().isString(),
  asyncHandler(async (req: Request, res: Response) => {
    if (!validate(req, res)) return;
    const search = (req.query.search as string | undefined)?.trim();
    const users = await prisma.user.findMany({
      where: search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { nickname: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      select: adminUserSelect,
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  })
);

router.post(
  "/users/:id/reset-no-show",
  param("id").isString(),
  asyncHandler(async (req: Request, res: Response) => {
    if (!validate(req, res)) return;
    res.json(await resetNoShowCount(req.params.id));
  })
);

// ADM-06: promote/demote between user, event_organizer, and admin
router.patch(
  "/users/:id/role",
  param("id").isString(),
  body("role").isIn(["user", "event_organizer", "admin"]),
  asyncHandler(async (req: Request, res: Response) => {
    if (!validate(req, res)) return;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: req.body.role },
      select: adminUserSelect,
    });
    res.json(user);
  })
);

router.delete(
  "/users/:id",
  param("id").isString(),
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    if (!validate(req, res)) return;
    if (req.params.id === req.user!.id) {
      return res.status(400).json({ error: "ไม่สามารถลบบัญชีของตัวเองได้" });
    }
    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) return res.status(404).json({ error: "ไม่พบผู้ใช้" });
    if (target.role === "admin") {
      return res.status(400).json({ error: "ไม่สามารถลบบัญชีแอดมินได้" });
    }
    await prisma.user.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

// General rooms (user-created sport sessions) moderation: list + delete inappropriate rooms
router.get(
  "/sessions",
  asyncHandler(async (_req: Request, res: Response) => {
    const sessions = await prisma.sportSession.findMany({
      include: {
        sport: true,
        venue: true,
        host: { select: { id: true, firstName: true, lastName: true, nickname: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(sessions);
  })
);

router.delete(
  "/sessions/:id",
  param("id").isString(),
  asyncHandler(async (req: Request, res: Response) => {
    if (!validate(req, res)) return;
    await prisma.sportSession.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

// ADM-04: sports catalog
router.post(
  "/sports",
  body("name").notEmpty(),
  body("icon").optional().isString(),
  asyncHandler(async (req: Request, res: Response) => {
    if (!validate(req, res)) return;
    res.status(201).json(
      await prisma.sport.create({ data: { name: req.body.name, icon: req.body.icon || undefined } })
    );
  })
);

router.patch(
  "/sports/:id",
  param("id").isString(),
  body("name").optional().notEmpty(),
  body("icon").optional().isString(),
  asyncHandler(async (req: Request, res: Response) => {
    if (!validate(req, res)) return;
    res.json(
      await prisma.sport.update({
        where: { id: req.params.id },
        data: { name: req.body.name, icon: req.body.icon },
      })
    );
  })
);

router.delete(
  "/sports/:id",
  param("id").isString(),
  asyncHandler(async (req: Request, res: Response) => {
    if (!validate(req, res)) return;
    await prisma.sport.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

// Signed Cloudinary upload for venue photos
router.get(
  "/venues/upload-signature",
  asyncHandler(async (_req: Request, res: Response) => {
    const signature = generateUploadSignature({ folder: "sports-match/venues" });
    if (!signature) return res.status(503).json({ error: "Cloudinary is not configured" });
    res.json(signature);
  })
);

// ADM-05: venues catalog
router.post(
  "/venues",
  body("name").notEmpty(),
  body("placeId").optional().isString(),
  body("photoUrl").optional().isURL(),
  body("lat").optional().isFloat({ min: -90, max: 90 }),
  body("lng").optional().isFloat({ min: -180, max: 180 }),
  asyncHandler(async (req: Request, res: Response) => {
    if (!validate(req, res)) return;
    res.status(201).json(
      await prisma.venue.create({
        data: {
          name: req.body.name,
          placeId: req.body.placeId,
          photoUrl: req.body.photoUrl,
          lat: req.body.lat,
          lng: req.body.lng,
        },
      })
    );
  })
);

router.patch(
  "/venues/:id",
  param("id").isString(),
  body("name").optional().notEmpty(),
  body("placeId").optional().isString(),
  body("photoUrl").optional().isURL(),
  body("lat").optional().isFloat({ min: -90, max: 90 }),
  body("lng").optional().isFloat({ min: -180, max: 180 }),
  asyncHandler(async (req: Request, res: Response) => {
    if (!validate(req, res)) return;
    res.json(
      await prisma.venue.update({
        where: { id: req.params.id },
        data: {
          name: req.body.name,
          placeId: req.body.placeId,
          photoUrl: req.body.photoUrl,
          lat: req.body.lat,
          lng: req.body.lng,
        },
      })
    );
  })
);

router.delete(
  "/venues/:id",
  param("id").isString(),
  asyncHandler(async (req: Request, res: Response) => {
    if (!validate(req, res)) return;
    await prisma.venue.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

// ADM-07: achievements
router.post(
  "/achievements",
  body("name").notEmpty(),
  body("conditions").isObject(),
  body("description").optional().isString(),
  body("icon").optional().isString(),
  asyncHandler(async (req: Request, res: Response) => {
    if (!validate(req, res)) return;
    res.status(201).json(await createAchievement(req.body));
  })
);

router.patch(
  "/achievements/:id",
  param("id").isString(),
  asyncHandler(async (req: Request, res: Response) => {
    if (!validate(req, res)) return;
    res.json(await updateAchievement(req.params.id, req.body));
  })
);

router.delete(
  "/achievements/:id",
  param("id").isString(),
  asyncHandler(async (req: Request, res: Response) => {
    if (!validate(req, res)) return;
    await deleteAchievement(req.params.id);
    res.status(204).send();
  })
);

export default router;
