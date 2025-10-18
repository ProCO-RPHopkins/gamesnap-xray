'use client';

import { useRef, useState } from 'react';

/**
 * Home page: file uploader + "Try demo".
 *
 * Behavior:
 *  - Accepts a single image via click or drag&drop.
 *  - Sends a multipart/form-data POST to /api/upload.
 *  - Displays the returned id/filename and a link to view the stored file.
 *  - "Try demo" opens a static demo image (public/demo/nba_01.jpg).
 *
 * Notes:
 *  - This step stops short of a "result" page; it is for end-to-end upload verification.
 *  - Uploaded files are stored under tmp/uploads (git-ignored).
 */
export default function Home() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ id: string; filename: string; mime: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    setError(null);
    setResponse(null);
    if (!files || files.length === 0) return;
    const file = files[0];

    // Basic MIME allowlist check; server validates further.
    if (!/^image\//.test(file.type)) {
      setError('Please choose an image file.');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Upload failed');
      }
      setResponse(data);
    } catch (e: any) {
      setError(e?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">GameSnap X-Ray</h1>
          <p className="mt-3 text-neutral-300">
            Upload a TV photo or screenshot and we&apos;ll turn it into instant context and a share-ready poster.
          </p>
        </header>

        {/* Upload surface */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`rounded-2xl border-2 border-dashed p-12 text-center transition
            ${dragOver ? 'border-emerald-400 bg-emerald-950/20' : 'border-neutral-700 bg-neutral-900/50'}
          `}
        >
          <p className="mb-4 text-neutral-200">Drag & drop an image here, or</p>
          <button
            onClick={() => inputRef.current?.click()}
            className="rounded-xl bg-white/10 px-5 py-3 font-medium hover:bg-white/15 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Uploading…' : 'Choose image'}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          <div className="mt-8">
            <a
              href="/demo/nba_01.jpg"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-neutral-300 underline hover:text-white"
            >
              Try a demo image
            </a>
          </div>
        </div>

        {/* Status + response */}
        <section className="mt-8 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-600/10 border border-red-700/40 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {response && (
            <div className="rounded-lg bg-neutral-900/60 border border-neutral-800 p-4">
              <div className="text-sm text-neutral-400 mb-2">Upload successful</div>
              <div className="grid gap-1 text-sm">
                <div>
                  <span className="text-neutral-400">id:</span>{' '}
                  <span className="text-white">{response.id}</span>
                </div>
                <div>
                  <span className="text-neutral-400">filename:</span>{' '}
                  <a
                    className="text-emerald-400 underline hover:text-emerald-300 break-all"
                    href={`/api/uploads/${encodeURIComponent(response.filename)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {response.filename}
                  </a>
                </div>
                <div>
                  <span className="text-neutral-400">mime:</span>{' '}
                  <span className="text-white">{response.mime}</span>
                </div>
              </div>
              <div className="mt-3 text-xs text-neutral-500">
                The link opens the stored file streamed by <code>/api/uploads/[filename]</code>.
              </div>
            </div>
          )}
        </section>

        <footer className="mt-16 text-center text-xs text-neutral-500">
          Free mode adds a small watermark • Pro unlocks templates &amp; no watermark
        </footer>
      </div>
    </main>
  );
}
