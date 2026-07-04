import 'dotenv/config';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
if (!cloudName || !apiKey || !apiSecret) {
  console.error('Missing Cloudinary env vars');
  process.exit(1);
}

const timestamp = Math.floor(Date.now() / 1000);
const params = { folder: 'sports-match/events', timestamp };
const sorted = Object.keys(params)
  .sort()
  .map((key) => `${key}=${params[key]}`)
  .join('&');
const signature = crypto.createHash('sha1').update(sorted + apiSecret).digest('hex');

const filePath = path.join(process.cwd(), 'test-upload.txt');
fs.writeFileSync(filePath, 'hello cloudinary');

const formData = new FormData();
formData.append('file', new Blob([fs.readFileSync(filePath)]), 'test-upload.txt');
formData.append('api_key', apiKey);
formData.append('timestamp', String(timestamp));
formData.append('signature', signature);
formData.append('folder', 'sports-match/events');

const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
  method: 'POST',
  body: formData,
});

console.log('status', response.status);
console.log(await response.text());
