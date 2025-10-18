'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Home page: file uploader + "Try demo".
 *
 * After a successful upload, navigates to /result/:id?f=<filename>.
 */
export default function Home() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    setError(null);
    if (!files || files.length === 0) return;
    const file = files[0];

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
      if (!res.ok) throw new Error(data?.error || 'Upload failed');

      // Navigate to result page with id + filename query
      router.push(`/result/${data.id}?f=${encodeURIComponent(data.filename)}`);
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
              href="/result/demo?demo=1"
              className="text-sm text-neutral-300 underline hover:text-white"
            >
              Try a demo first
            </a>
          </div>
        </div>

        {/* Status */}
        <section className="mt-8 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-600/10 border border-red-700/40 p-4 text-sm text-red-300">
              {error}
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
