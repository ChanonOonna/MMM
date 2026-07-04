import { Router } from "express";
import { body, validationResult } from "express-validator";
import { requireAuth, AuthedRequest } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/asyncHandler";
import { fileReport, ReportError } from "./report.service";

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

// RPT-01: reachable from swipe card / chat / sport session
router.post(
  "/",
  body("reportedUserId").isString(),
  body("category").isIn([
    "fake_profile",
    "inappropriate_chat",
    "no_show",
    "harassment",
    "inappropriate_content",
  ]),
  body("contextType").isIn(["swipe", "chat", "session"]),
  body("contextId").isString(),
  body("description").optional().isString(),
  body("evidenceUrl").optional().isURL(),
  asyncHandler(async (req: AuthedRequest, res) => {
    if (!validate(req, res)) return;
    try {
      const report = await fileReport(req.user!.id, req.body);
      res.status(201).json(report);
    } catch (error) {
      if (error instanceof ReportError) return res.status(error.status).json({ error: error.message });
      throw error;
    }
  })
);

export default router;
