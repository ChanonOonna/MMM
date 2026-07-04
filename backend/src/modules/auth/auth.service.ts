import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { generateQrToken } from "../../lib/qrToken";
import {
  refreshExpiryDate,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../lib/jwt";

const BCRYPT_COST = 12;

export class AuthError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function registerUser(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  nickname?: string;
}) {
  const email = input.email.toLowerCase().trim();

  if (!email.endsWith("@ku.th")) {
    throw new AuthError(400, "ต้องใช้อีเมล @ku.th เท่านั้น");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AuthError(409, "อีเมลนี้ถูกใช้งานแล้ว");
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
  const id = crypto.randomUUID();
  const qrToken = generateQrToken(id);

  const user = await prisma.user.create({
    data: {
      id,
      email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      nickname: input.nickname,
      qrToken,
    },
  });

  return user;
}

export async function loginUser(input: {
  email: string;
  password: string;
  deviceInfo?: string;
  ip?: string;
}) {
  const email = input.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AuthError(401, "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
  }

  const session = await prisma.userSession.create({
    data: {
      userId: user.id,
      refreshToken: crypto.randomUUID(), // placeholder, replaced below
      deviceInfo: input.deviceInfo,
      ip: input.ip,
      expiresAt: refreshExpiryDate(),
    },
  });

  const refreshToken = signRefreshToken({ sub: user.id, sessionId: session.id });
  await prisma.userSession.update({
    where: { id: session.id },
    data: { refreshToken },
  });

  const accessToken = signAccessToken({ sub: user.id, role: user.role });

  return { user, accessToken, refreshToken };
}

export async function rotateAccessToken(refreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AuthError(401, "Refresh token ไม่ถูกต้องหรือหมดอายุ");
  }

  const session = await prisma.userSession.findUnique({ where: { id: payload.sessionId } });
  if (
    !session ||
    session.refreshToken !== refreshToken ||
    session.revokedAt ||
    session.expiresAt < new Date()
  ) {
    throw new AuthError(401, "Session ถูกยกเลิกหรือหมดอายุ");
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    throw new AuthError(401, "ไม่พบผู้ใช้");
  }

  return signAccessToken({ sub: user.id, role: user.role });
}

export async function logoutSession(refreshToken: string) {
  const session = await prisma.userSession.findUnique({ where: { refreshToken } });
  if (session && !session.revokedAt) {
    await prisma.userSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });
  }
}

export async function logoutAllSessions(userId: string) {
  await prisma.userSession.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
