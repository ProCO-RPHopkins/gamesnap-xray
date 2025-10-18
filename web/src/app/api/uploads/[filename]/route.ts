/**
 * Streams a previously uploaded image back to the client.
 * Route: GET /api/uploads/:filename
 *
 * Security:
 *  - Allows only safe filenames (alnum, dot, underscore, dash).
 *  - Serves from a local tmp/uploads directory (dev mode).
 *
 * TODO: consider authenticated access if uploads become user-scoped.
 * TODO: move to object storage (e.g., S3-compatible) for production.
 * TODO: tune cache headers (CDN, immutable, fingerprinted names).
 */

import { NextResponse } from 'next/server';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import path from 'path';

const SAFE_NAME = /^[a-zA-Z0-9._-]+$/;

/** Minimal extension → MIME map (expanded as needed). */
const MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ filename: string }> } // Next.js 15: params is async
) {
  const { filename } = await ctx.params; // ← must await
  const name = filename ?? '';

  // Reject suspicious names (prevents directory traversal).
  if (!SAFE_NAME.test(name)) {
    return new NextResponse('Bad filename', { status: 400 });
  }

  const filePath = path.join(process.cwd(), 'tmp', 'uploads', name);

  try {
    await stat(filePath); // throws if not found
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }

  const ext = (name.split('.').pop() || '').toLowerCase();
  const mime = MIME_BY_EXT[ext] ?? 'application/octet-stream';

  const stream = createReadStream(filePath);

  return new NextResponse(stream as any, {
    headers: {
      'Content-Type': mime,
      // TODO: revisit caching once filenames are content-addressed.
      'Cache-Control': 'private, max-age=60',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
