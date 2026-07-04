import { Router } from "express";
import { body, query, validationResult } from "express-validator";
import { requireAuth, AuthedRequest } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/asyncHandler";
import { blockUser, getSwipeDeck, listMatches, swipeUser } from "./swipe.service";

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
  "/deck",
  query("sportId").optional().isString(),
  query("levelFilter").optional().isString(),
  asyncHandler(async (req: AuthedRequest, res) => {
    if (!validate(req, res)) return;
    const result = await getSwipeDeck({
      viewerId: req.user!.id,
      sportId: req.query.sportId as string | undefined,
      levelFilter: req.query.levelFilter as string | undefined,
    });
    res.json(result);
  })
);

router.post(
  "/",
  body("targetUserId").isString(),
  body("direction").isIn(["left", "right"]),
  asyncHandler(async (req: AuthedRequest, res) => {
    if (!validate(req, res)) return;
    try {
      const result = await swipeUser(req.user!.id, req.body.targetUserId, req.body.direction);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  })
);

router.post(
  "/block",
  body("targetUserId").isString(),
  asyncHandler(async (req: AuthedRequest, res) => {
    if (!validate(req, res)) return;
    await blockUser(req.user!.id, req.body.targetUserId);
    res.status(204).send();
  })
);

router.get(
  "/matches",
  asyncHandler(async (req: AuthedRequest, res) => {
    res.json(await listMatches(req.user!.id));
  })
);

export default router;
