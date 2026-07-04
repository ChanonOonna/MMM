import crypto from "crypto";

// NFR-S09: signed upload only — never expose an unsigned upload preset.
export function generateUploadSignature(params: Record<string, string | number>) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const toSign: Record<string, string | number> = { ...params, timestamp };
  const sortedQuery = Object.keys(toSign)
    .sort()
    .map((key) => `${key}=${toSign[key]}`)
    .join("&");

  const signature = crypto
    .createHash("sha1")
    .update(sortedQuery + apiSecret)
    .digest("hex");

  return { cloudName, apiKey, timestamp, signature };
}
