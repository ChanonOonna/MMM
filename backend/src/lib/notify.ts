import { prisma } from "./prisma";
import { io } from "../socket";

export async function notify(userId: string, type: string, payload?: unknown) {
  const notification = await prisma.notification.create({
    data: { userId, type, payload: payload as any },
  });
  io().to(`user:${userId}`).emit("new_notification", notification);
  return notification;
}
