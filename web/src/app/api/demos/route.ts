/**
 * Lists demo images available under /public/demo for gallery rendering.
 *
 * Response shape:
 *   { items: Array<{ filename: string; url: string; bytes: number; modifiedAt: string }> }
 *
 * Notes:
 *  - Only scans the /public/demo directory.
 *  - Filters by allowed extensions.
 *  - Sorted by most-recent modification time.
 *
 * TODO: pagination if the directory grows large (not needed for now).
 */

import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import path from 'path';

const ALLOWED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export const runtime = 'nodejs';

export async function GET() {
  const dir = path.join(process.cwd(), 'public', 'demo');

  let files: string[] = [];
  try {
    files = await readdir(dir);
  } catch {
    // If the folder doesn't exist yet, return an empty list
    return NextResponse.json({ items: [] }, { headers: { 'Cache-Control': 'no-store' } });
  }

  const items: Array<{ filename: string; url: string; bytes: number; modifiedAt: string }> = [];
  for (const name of files) {
    const ext = (name.split('.').pop() || '').toLowerCase();
    if (!ALLOWED_EXTS.has(`.${ext}`)) continue;

    try {
      const s = await stat(path.join(dir, name));
      if (!s.isFile()) continue;

      items.push({
        filename: name,
        url: `/demo/${name}`,
        bytes: s.size,
        modifiedAt: new Date(s.mtimeMs).toISOString(),
      });
    } catch {
      // ignore bad entries
    }
  }

  // Newest first
  items.sort((a, b) => (a.modifiedAt < b.modifiedAt ? 1 : -1));

  return NextResponse.json(
    { items },
    {
      headers: {
        // Dev-friendly; we can add stronger caching later
        'Cache-Control': 'no-store',
      },
    }
  );
}
