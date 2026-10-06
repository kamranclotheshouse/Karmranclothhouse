/**
 * POST /api/admin/upload
 *
 * Accepts a multipart form-data request with a single `file` field.
 * Uploads it to Cloudinary under the `kch-products` folder, converts to
 * WebP (f_auto, q_auto) and returns the resulting secure URL.
 *
 * Admin-only: requires a valid session cookie.
 */
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/api';
import { v2 as cloudinary } from 'cloudinary';

export const dynamic = 'force-dynamic';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function fail(message: string, status = 400): NextResponse {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
    return fail(
      'Photo upload abhi configured nahi hai. Server par CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY aur CLOUDINARY_API_SECRET set karein (.env.local), phir ye kaam karega.',
      503
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return fail('Could not parse multipart form. Send the file as form-data field "file".');
  }

  const file = formData.get('file');
  if (!(file instanceof Blob)) {
    return fail('No file found. Send the image as form-data field "file".');
  }

  // Size guard — 15 MB max
  if (file.size > 15 * 1024 * 1024) {
    return fail('File is too large. Maximum size is 15 MB.');
  }

  // Convert Blob → Buffer → base64 data URI for the Cloudinary SDK
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = file.type || 'image/jpeg';
  const dataUri = `data:${mimeType};base64,${buffer.toString('base64')}`;

  // Har upload ko WebP mein store karein (smaller files, same visuals).
  // Animated GIFs ko chhorein — unki animation WebP conversion mein kho sakti hai.
  const convertToWebp = mimeType.toLowerCase() !== 'image/gif';

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'kch-products',
      ...(convertToWebp ? { format: 'webp' } : {}),
      // Auto-format to WebP where supported; auto quality compression
      fetch_format: 'auto',
      quality: 'auto:good',
      // Never upscale originals
      flags: 'progressive',
      // Keep aspect ratio; limit to 2000px on the long side
      transformation: [{ width: 2000, height: 2000, crop: 'limit' }],
    });

    // Return the f_auto,q_auto delivery URL so Next/Image gets WebP automatically
    const deliveryUrl = result.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');

    return NextResponse.json({ ok: true, url: deliveryUrl });
  } catch (err) {
    console.error('[upload] Cloudinary error:', err);
    return fail('Upload failed. Check your Cloudinary credentials and try again.', 500);
  }
}
