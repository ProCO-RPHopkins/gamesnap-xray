import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const id = randomUUID();
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase();

  const dir = path.join(process.cwd(), 'tmp', 'uploads');
  await mkdir(dir, { recursive: true });

  const filename = `${id}.${ext}`;
  await writeFile(path.join(dir, filename), buf);

  return NextResponse.json({ id, filename, mime: file.type ?? 'image/jpeg' });
}
