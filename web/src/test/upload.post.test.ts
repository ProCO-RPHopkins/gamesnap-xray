/** @vitest-environment node */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import { rm, stat } from 'fs/promises';
import { POST as uploadPOST } from '../app/api/upload/route';

const TMP_DIR = path.join(process.cwd(), 'tmp', 'uploads');

describe('POST /api/upload (handler)', () => {
  beforeEach(async () => {
    try { await rm(TMP_DIR, { recursive: true, force: true }); } catch {}
  });
  afterEach(async () => {
    try { await rm(TMP_DIR, { recursive: true, force: true }); } catch {}
  });

  it('saves an image and returns id + filename', async () => {
    const pngBytes = Buffer.from('89504E470D0A1A0A0000000D49484452', 'hex'); // tiny PNG header
    
    // Now running in 'node' env, this global 'File' is Node's native implementation
    const file = new File([new Uint8Array(pngBytes)], 'tiny.png', { type: 'image/png' });

    const fd = new FormData();
    fd.append('file', file);

    // Minimal Request-like object: only what the handler uses.
    const req = {
      method: 'POST',
      // ts-expect-error minimal Request-like shim for handler tests
      formData: async () => fd,
    } as unknown as Request;

    const res = await uploadPOST(req);
    expect(res.status).toBe(200);

    const json = (await res.json()) as { id: string; filename: string; mime?: string };
    expect(json.id).toMatch(/^[\w-]+$/);
    expect(json.filename).toBeDefined();

    const saved = path.join(TMP_DIR, json.filename);
    const s = await stat(saved);
    expect(s.isFile()).toBe(true);
  }, 15000);
});