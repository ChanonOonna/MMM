import { Router } from "express";
import { body, param, validationResult } from "express-validator";
import { requireAuth, AuthedRequest } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/asyncHandler";
import { createInvite, InviteError, listInvites, respondInvite } from "./invite.service";

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

function handle(res: any, fn: () => Promise<any>) {
  return fn().catch((error: any) => {
    if (error instanceof InviteError) return res.status(error.status).json({ error: error.message });
    throw error;
  });
}

router.post(
  "/",
  body("matchId").isString(),
  body("sportId").isString(),
  body("venueId").isString(),
  body("date").isISO8601(),
  body("maxPlayers").isInt({ min: 2 }),
  body("message").optional().isString(),
  asyncHandler((req: AuthedRequest, res) =>
    handle(res, async () => res.status(201).json(await createInvite(req.user!.id, req.body)))
  )
);

router.get(
  "/",
  asyncHandler(async (req: AuthedRequest, res) => {
    res.json(await listInvites(req.user!.id));
  })
);

router.post(
  "/:id/respond",
  param("id").isString(),
  body("accept").isBoolean(),
  asyncHandler((req: AuthedRequest, res) =>
    handle(res, async () =>
      res.json(await respondInvite(req.params.id, req.user!.id, req.body.accept))
    )
  )
);

export default router;
