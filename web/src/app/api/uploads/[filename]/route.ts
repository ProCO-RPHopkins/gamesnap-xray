import { stat, readFile } from 'fs/promises';
import path from 'path';

const SAFE_NAME = /^[a-zA-Z0-9._-]+$/;

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
  ctx: { params: Promise<{ filename: string }> }, // Next.js 15: params are async
) {
  const { filename } = await ctx.params;
  const name = filename ?? '';

  if (!SAFE_NAME.test(name)) {
    return new Response('Bad filename', { status: 400 });
  }

  const filePath = path.join(process.cwd(), 'tmp', 'uploads', name);

  try {
    await stat(filePath);
  } catch {
    return new Response('Not found', { status: 404 });
  }

  const ext = (name.split('.').pop() || '').toLowerCase();
  const mime = MIME_BY_EXT[ext] ?? 'application/octet-stream';

  // --- START FIX ---
  // Read file into a Node.js Buffer
  const buf = await readFile(filePath);

  // Create a new Uint8Array *copy* from the buffer.
  // This explicitly creates a standard ArrayBufferView,
  // resolving the 'ArrayBuffer | SharedArrayBuffer' ambiguity.
  // Uint8Array is a valid BodyInit type (as BufferSource).
  const body = new Uint8Array(buf);
  // --- END FIX ---

  return new Response(body, {
    // <-- Pass the Uint8Array here
    headers: {
      'Content-Type': mime,
      'Cache-Control': 'private, max-age=60',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
