import { Router } from "express";
import { body, param, validationResult } from "express-validator";
import { prisma } from "../../lib/prisma";
import { requireAuth, AuthedRequest } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/asyncHandler";
import { generateUploadSignature } from "../../lib/cloudinary";

const router = Router();
router.use(requireAuth);

function validate(req: any, res: any) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
}

const profileInclude = {
  photos: { orderBy: { position: "asc" as const } },
  sports: { include: { sport: true } },
  weeklySchedule: true,
  favoritePlaces: { include: { venue: true } },
};

router.get(
  "/me",
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: profileInclude,
    });
    res.json(user);
  })
);

// PRO-08: language toggle, plus basic identity fields
router.patch(
  "/me",
  body("firstName").optional().notEmpty(),
  body("lastName").optional().notEmpty(),
  body("nickname").optional().isString(),
  body("language").optional().isIn(["th", "en"]),
  body("hasEquipment").optional().isBoolean(),
  asyncHandler(async (req: AuthedRequest, res) => {
    if (!validate(req, res)) return;
    const { firstName, lastName, nickname, language, hasEquipment } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { firstName, lastName, nickname, language, hasEquipment },
    });
    res.json(user);
  })
);

// PRO-02, PRO-03: sports must have >= 1 entry, one level per sport
router.put(
  "/sports",
  body("sports").isArray({ min: 1 }),
  body("sports.*.sportId").isString(),
  body("sports.*.level").isIn(["beginner", "intermediate", "advanced", "competitive"]),
  asyncHandler(async (req: AuthedRequest, res) => {
    if (!validate(req, res)) return;
    const userId = req.user!.id;
    const sports: { sportId: string; level: string }[] = req.body.sports;

    await prisma.$transaction([
      prisma.userSport.deleteMany({ where: { userId } }),
      prisma.userSport.createMany({
        data: sports.map((s) => ({ userId, sportId: s.sportId, level: s.level as any })),
      }),
    ]);

    res.json({ ok: true });
  })
);

// PRO-04: recurring weekly schedule, replace-all semantics
router.put(
  "/schedule",
  body("schedule").isArray(),
  body("schedule.*.dayOfWeek").isInt({ min: 0, max: 6 }),
  body("schedule.*.startTime").matches(/^\d{2}:\d{2}$/),
  body("schedule.*.endTime").matches(/^\d{2}:\d{2}$/),
  asyncHandler(async (req: AuthedRequest, res) => {
    if (!validate(req, res)) return;
    const userId = req.user!.id;
    const schedule: { dayOfWeek: number; startTime: string; endTime: string }[] =
      req.body.schedule;

    await prisma.$transaction([
      prisma.weeklySchedule.deleteMany({ where: { userId } }),
      prisma.weeklySchedule.createMany({
        data: schedule.map((s) => ({ userId, ...s })),
      }),
    ]);

    res.json({ ok: true });
  })
);

// PRO-05: max 5 favorite venues
router.put(
  "/favorite-venues",
  body("venueIds").isArray({ max: 5 }),
  body("venueIds.*").isString(),
  asyncHandler(async (req: AuthedRequest, res) => {
    if (!validate(req, res)) return;
    const userId = req.user!.id;
    const venueIds: string[] = req.body.venueIds;

    await prisma.$transaction([
      prisma.favoritePlace.deleteMany({ where: { userId } }),
      prisma.favoritePlace.createMany({
        data: venueIds.map((venueId) => ({ userId, venueId })),
      }),
    ]);

    res.json({ ok: true });
  })
);

router.get(
  "/photos/upload-signature",
  asyncHandler(async (_req: AuthedRequest, res) => {
    const signature = generateUploadSignature({ folder: "sports-match/profiles" });
    if (!signature) {
      return res.status(503).json({ error: "Cloudinary is not configured" });
    }
    res.json(signature);
  })
);

// PRO-01: max 5 photos, must delete before adding more
router.post(
  "/photos",
  body("url").isURL(),
  asyncHandler(async (req: AuthedRequest, res) => {
    if (!validate(req, res)) return;
    const userId = req.user!.id;

    const count = await prisma.profilePhoto.count({ where: { userId } });
    if (count >= 5) {
      return res.status(400).json({ error: "อัปโหลดได้สูงสุด 5 รูป กรุณาลบก่อนอัปโหลดใหม่" });
    }

    const photo = await prisma.profilePhoto.create({
      data: { userId, url: req.body.url, position: count },
    });
    res.status(201).json(photo);
  })
);

router.delete(
  "/photos/:id",
  param("id").isString(),
  asyncHandler(async (req: AuthedRequest, res) => {
    if (!validate(req, res)) return;
    const photo = await prisma.profilePhoto.findUnique({ where: { id: req.params.id } });
    if (!photo || photo.userId !== req.user!.id) {
      return res.status(404).json({ error: "ไม่พบรูปภาพ" });
    }
    await prisma.profilePhoto.delete({ where: { id: photo.id } });
    res.status(204).send();
  })
);

// View another user's public profile
router.get(
  "/:userId",
  param("userId").isString(),
  asyncHandler(async (req: AuthedRequest, res) => {
    if (!validate(req, res)) return;
    const user = await prisma.user.findUnique({
      where: { id: req.params.userId },
      include: profileInclude,
    });
    if (!user) return res.status(404).json({ error: "ไม่พบผู้ใช้" });

    const { passwordHash, qrToken, email, ...publicProfile } = user;
    res.json(publicProfile);
  })
);

export default router;
