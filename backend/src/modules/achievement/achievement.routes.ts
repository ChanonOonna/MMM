import { Router } from "express";
import { requireAuth, AuthedRequest } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/asyncHandler";
import { listAchievements, listUserAchievements } from "./achievement.service";

const router = Router();
router.use(requireAuth);

// US-025: browse all achievements
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await listAchievements());
  })
);

// US-026: my unlocked achievements
router.get(
  "/me",
  asyncHandler(async (req: AuthedRequest, res) => {
    res.json(await listUserAchievements(req.user!.id));
  })
);

export default router;
