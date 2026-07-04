import crypto from "crypto";

const QR_SECRET = process.env.QR_SECRET ?? process.env.JWT_ACCESS_SECRET!;

export function generateQrToken(userId: string): string {
  return crypto.createHmac("sha256", QR_SECRET).update(userId).digest("hex");
}
