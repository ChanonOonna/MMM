import { Router } from "express";
import { body, param, query, validationResult } from "express-validator";
import { requireAuth, AuthedRequest } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/asyncHandler";
import { io } from "../../socket";
import {
  assertRoomAccess,
  ChatAccessError,
  listMessages,
  sendMessage,
  unsendMessage,
} from "./chat.service";

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
  "/:roomType/:roomId/messages",
  param("roomType").isIn(["match", "session", "event"]),
  param("roomId").isString(),
  query("cursor").optional().isString(),
  asyncHandler(async (req: AuthedRequest, res) => {
    if (!validate(req, res)) return;
    try {
      await assertRoomAccess(req.user!.id, req.params.roomType, req.params.roomId);
    } catch (error) {
      if (error instanceof ChatAccessError) return res.status(403).json({ error: error.message });
      throw error;
    }

    const messages = await listMessages(
      req.params.roomType,
      req.params.roomId,
      req.query.cursor as string | undefined
    );
    res.json(messages);
  })
);

router.post(
  "/:roomType/:roomId/messages",
  param("roomType").isIn(["match", "session", "event"]),
  param("roomId").isString(),
  body("content").optional().isString(),
  body("imageUrl").optional().isURL(),
  asyncHandler(async (req: AuthedRequest, res) => {
    if (!validate(req, res)) return;
    if (!req.body.content && !req.body.imageUrl) {
      return res.status(400).json({ error: "ต้องมีข้อความหรือรูปภาพอย่างน้อยหนึ่งอย่าง" });
    }

    try {
      await assertRoomAccess(req.user!.id, req.params.roomType, req.params.roomId);
    } catch (error) {
      if (error instanceof ChatAccessError) return res.status(403).json({ error: error.message });
      throw error;
    }

    const message = await sendMessage({
      senderId: req.user!.id,
      roomType: req.params.roomType,
      roomId: req.params.roomId,
      content: req.body.content,
      imageUrl: req.body.imageUrl,
    });

    io().to(`${req.params.roomType}:${req.params.roomId}`).emit("new_message", message);
    res.status(201).json(message);
  })
);

router.post(
  "/messages/:id/unsend",
  param("id").isString(),
  asyncHandler(async (req: AuthedRequest, res) => {
    if (!validate(req, res)) return;
    try {
      const message = await unsendMessage(req.params.id, req.user!.id);
      io().to(`${message.roomType}:${message.roomId}`).emit("message_unsent", { id: message.id });
      res.json({ ok: true });
    } catch (error) {
      if (error instanceof ChatAccessError) return res.status(403).json({ error: error.message });
      throw error;
    }
  })
);

export default router;
