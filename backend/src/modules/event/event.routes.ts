import { Router } from "express";
import { body, param, validationResult } from "express-validator";
import { requireAuth, requireRole, AuthedRequest } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/asyncHandler";
import { generateUploadSignature } from "../../lib/cloudinary";
import {
  checkInMember,
  createEvent,
  deleteEvent,
  EventError,
  getEvent,
  getEventStats,
  joinEvent,
  listAnnouncements,
  listEvents,
  sendAnnouncement,
  updateEvent,
} from "./event.service";

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
    if (error instanceof EventError) return res.status(error.status).json({ error: error.message });
    throw error;
  });
}

// EVT-01: only admin/event_organizer may create events
router.post(
  "/",
  requireRole("admin", "event_organizer"),
  body("sportId").isString(),
  body("venueId").isString(),
  body("title").notEmpty(),
  body("startTime").isISO8601(),
  body("endTime").isISO8601(),
  body("description").optional().isString(),
  body("maxCapacity").optional().isInt({ min: 1 }),
  body("coverUrl").isURL().withMessage("กรุณาแนบรูปปกกิจกรรม"),
  body("coverPosX").optional().isFloat({ min: 0, max: 100 }),
  body("coverPosY").optional().isFloat({ min: 0, max: 100 }),
  body("images").optional().isArray(),
  body("images.*").optional().isURL(),
  asyncHandler((req: AuthedRequest, res) =>
    handle(res, async () => res.status(201).json(await createEvent(req.user!.id, req.body)))
  )
);

router.get(
  "/",
  asyncHandler(async (_req: AuthedRequest, res) => {
    res.json(await listEvents());
  })
);

// Signed Cloudinary upload for event cover/gallery images (mirrors profile photo upload flow)
router.get(
  "/upload-signature",
  requireRole("admin", "event_organizer"),
  asyncHandler(async (_req: AuthedRequest, res) => {
    const signature = generateUploadSignature({ folder: "sports-match/events" });
    if (!signature) {
      return res.status(503).json({ error: "Cloudinary is not configured" });
    }
    res.json(signature);
  })
);

router.get(
  "/:id",
  param("id").isString(),
  asyncHandler((req: AuthedRequest, res) => handle(res, async () => res.json(await getEvent(req.params.id))))
);

router.patch(
  "/:id",
  param("id").isString(),
  body("coverUrl").optional().isURL(),
  body("coverPosX").optional().isFloat({ min: 0, max: 100 }),
  body("coverPosY").optional().isFloat({ min: 0, max: 100 }),
  body("images").optional().isArray(),
  body("images.*").optional().isURL(),
  asyncHandler((req: AuthedRequest, res) =>
    handle(res, async () =>
      res.json(await updateEvent(req.params.id, req.user!.id, req.user!.role, req.body))
    )
  )
);

router.delete(
  "/:id",
  param("id").isString(),
  asyncHandler((req: AuthedRequest, res) =>
    handle(res, async () => {
      await deleteEvent(req.params.id, req.user!.id, req.user!.role);
      res.status(204).send();
    })
  )
);

router.post(
  "/:id/join",
  param("id").isString(),
  asyncHandler((req: AuthedRequest, res) =>
    handle(res, async () => res.status(201).json(await joinEvent(req.params.id, req.user!.id)))
  )
);

router.post(
  "/:id/announcement",
  param("id").isString(),
  body("message").notEmpty(),
  asyncHandler((req: AuthedRequest, res) =>
    handle(res, async () =>
      res.status(201).json(await sendAnnouncement(req.params.id, req.user!.id, req.user!.role, req.body.message))
    )
  )
);

router.get(
  "/:id/announcements",
  param("id").isString(),
  asyncHandler((req: AuthedRequest, res) =>
    handle(res, async () => res.json(await listAnnouncements(req.params.id)))
  )
);

router.post(
  "/:id/checkin",
  param("id").isString(),
  body("qrToken").isString(),
  asyncHandler((req: AuthedRequest, res) =>
    handle(res, async () =>
      res.json(await checkInMember(req.params.id, req.user!.id, req.user!.role, req.body.qrToken))
    )
  )
);

router.get(
  "/:id/stats",
  param("id").isString(),
  asyncHandler((req: AuthedRequest, res) =>
    handle(res, async () => res.json(await getEventStats(req.params.id)))
  )
);

export default router;
