import { Router } from "express";
import { body, param, query, validationResult } from "express-validator";
import { requireAuth, AuthedRequest } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/asyncHandler";
import {
  browseSessions,
  createSession,
  deleteSession,
  getSession,
  joinSession,
  kickMember,
  leaveSession,
  listMySessions,
  SessionError,
  updateSession,
} from "./session.service";

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
    if (error instanceof SessionError) return res.status(error.status).json({ error: error.message });
    throw error;
  });
}

router.post(
  "/",
  body("sportId").isString(),
  body("venueId").isString(),
  body("title").notEmpty(),
  body("skillLevel").isIn(["beginner", "intermediate", "advanced", "competitive"]),
  body("maxPlayers").isInt({ min: 2 }),
  body("startTime").isISO8601(),
  body("endTime").isISO8601(),
  body("equipmentRequired").optional().isBoolean(),
  body("description").optional().isString(),
  asyncHandler(async (req: AuthedRequest, res) => {
    if (!validate(req, res)) return;
    const session = await createSession(req.user!.id, req.body);
    res.status(201).json(session);
  })
);

router.get(
  "/",
  query("sportId").optional().isString(),
  query("venueId").optional().isString(),
  query("skillLevel").optional().isString(),
  query("equipmentRequired").optional().isBoolean(),
  query("search").optional().isString(),
  asyncHandler(async (req: AuthedRequest, res) => {
    if (!validate(req, res)) return;
    const sessions = await browseSessions({
      sportId: req.query.sportId as string | undefined,
      venueId: req.query.venueId as string | undefined,
      skillLevel: req.query.skillLevel as string | undefined,
      equipmentRequired:
        req.query.equipmentRequired !== undefined
          ? req.query.equipmentRequired === "true"
          : undefined,
      search: req.query.search as string | undefined,
    });
    res.json(sessions);
  })
);

// Must come before "/:id" so "mine" isn't swallowed by the param route.
router.get(
  "/mine",
  asyncHandler(async (req: AuthedRequest, res) => {
    res.json(await listMySessions(req.user!.id));
  })
);

router.get(
  "/:id",
  param("id").isString(),
  asyncHandler((req: AuthedRequest, res) =>
    handle(res, async () => res.json(await getSession(req.params.id)))
  )
);

router.post(
  "/:id/join",
  param("id").isString(),
  asyncHandler((req: AuthedRequest, res) =>
    handle(res, async () => res.json(await joinSession(req.params.id, req.user!.id)))
  )
);

router.post(
  "/:id/kick",
  param("id").isString(),
  body("targetUserId").isString(),
  asyncHandler((req: AuthedRequest, res) =>
    handle(res, async () => {
      await kickMember(req.params.id, req.user!.id, req.body.targetUserId);
      res.status(204).send();
    })
  )
);

router.patch(
  "/:id",
  param("id").isString(),
  body("sportId").optional().isString(),
  body("venueId").optional().isString(),
  body("title").optional().notEmpty(),
  body("description").optional().isString(),
  body("skillLevel").optional().isIn(["beginner", "intermediate", "advanced", "competitive"]),
  body("maxPlayers").optional().isInt({ min: 2 }),
  body("startTime").optional().isISO8601(),
  body("endTime").optional().isISO8601(),
  body("equipmentRequired").optional().isBoolean(),
  asyncHandler((req: AuthedRequest, res) =>
    handle(res, async () => res.json(await updateSession(req.params.id, req.user!.id, req.body)))
  )
);

router.delete(
  "/:id",
  param("id").isString(),
  asyncHandler((req: AuthedRequest, res) =>
    handle(res, async () => {
      await deleteSession(req.params.id, req.user!.id);
      res.status(204).send();
    })
  )
);

router.post(
  "/:id/leave",
  param("id").isString(),
  body("reason").optional().isString(),
  asyncHandler((req: AuthedRequest, res) =>
    handle(res, async () => {
      await leaveSession(req.params.id, req.user!.id, req.body.reason);
      res.status(204).send();
    })
  )
);

export default router;
