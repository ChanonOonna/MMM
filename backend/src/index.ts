import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import { prisma } from "./lib/prisma";
import { setIo } from "./socket";
import { verifyAccessToken } from "./lib/jwt";
import { asyncHandler } from "./middleware/asyncHandler";

import authRoutes from "./modules/auth/auth.routes";
import catalogRoutes from "./modules/catalog/catalog.routes";
import profileRoutes from "./modules/profile/profile.routes";
import swipeRoutes from "./modules/swipe/swipe.routes";
import chatRoutes from "./modules/chat/chat.routes";
import sessionRoutes from "./modules/session/session.routes";
import inviteRoutes from "./modules/invite/invite.routes";
import reportRoutes from "./modules/report/report.routes";
import eventRoutes from "./modules/event/event.routes";
import achievementRoutes from "./modules/achievement/achievement.routes";
import notificationRoutes from "./modules/notification/notification.routes";
import adminRoutes from "./modules/admin/admin.routes";

const app = express();
const httpServer = createServer(app);

const corsOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const io = new Server(httpServer, {
  cors: { origin: corsOrigins },
});
setIo(io);

app.use(helmet());
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", asyncHandler(async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: "ok" });
}));

app.use("/api/auth", authRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/swipe", swipeRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/invites", inviteRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

// Client connects with `io(url, { auth: { token: accessToken } })`.
// Every socket auto-joins its own `user:<id>` room so lib/notify.ts can push to it directly.
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Missing access token"));

  try {
    const payload = verifyAccessToken(token);
    (socket.data as { userId: string }).userId = payload.sub;
    next();
  } catch {
    next(new Error("Invalid or expired access token"));
  }
});

io.on("connection", (socket) => {
  socket.join(`user:${socket.data.userId}`);

  // CHT-06, CHT-07: join_room expects "session:<id>" / "event:<id>" / "match:<id>"
  socket.on("join_room", (roomKey: string) => {
    socket.join(roomKey);
  });

  socket.on("leave_room", (roomKey: string) => {
    socket.leave(roomKey);
  });
});

// Must be registered after all routes. Catches anything asyncHandler forwarded via next(err).
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// Belt-and-suspenders: never let a stray unhandled rejection take the whole process down.
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

const port = Number(process.env.PORT ?? 4000);

async function startServer() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Please add it to backend/.env");
    process.exit(1);
  }

  try {
    await prisma.$connect();
    console.log("Connected to PostgreSQL");
  } catch (error) {
    console.error("Failed to connect to PostgreSQL:", error);
    process.exit(1);
  }

  httpServer.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
  });
}

async function shutdown(signal: NodeJS.Signals) {
  console.log(`Received ${signal}, shutting down...`);
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startServer();
