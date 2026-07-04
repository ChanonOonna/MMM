import { Router } from "express";
import { param, validationResult } from "express-validator";
import { prisma } from "../../lib/prisma";
import { requireAuth, AuthedRequest } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/asyncHandler";

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

router.get(
  "/",
  asyncHandler(async (req: AuthedRequest, res) => {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json(notifications);
  })
);

router.post(
  "/:id/read",
  param("id").isString(),
  asyncHandler(async (req: AuthedRequest, res) => {
    if (!validate(req, res)) return;
    const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
    if (!notification || notification.userId !== req.user!.id) {
      return res.status(404).json({ error: "ไม่พบการแจ้งเตือน" });
    }
    await prisma.notification.update({ where: { id: notification.id }, data: { readAt: new Date() } });
    res.status(204).send();
  })
);

router.post(
  "/read-all",
  asyncHandler(async (req: AuthedRequest, res) => {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, readAt: null },
      data: { readAt: new Date() },
    });
    res.status(204).send();
  })
);

export default router;
