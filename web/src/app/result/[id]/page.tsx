'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

/**
 * ResultPage
 * -----------
 * Displays the uploaded (or demo/static) image, a placeholder "analysis" checklist,
 * and basic share actions. This is a stub until OCR + game matching are implemented.
 *
 * URL shapes:
 *   /result/:id?f=<filename>               ← uploaded file served by /api/uploads
 *   /result/demo?demo=1                    ← built-in static demo image
 *   /result/demo?src=/demo/my_shot.jpg     ← any static image under /public
 *
 * Query params:
 *   - f: filename under tmp/uploads (e.g., "uuid.jpg")
 *   - demo: "1" to use /demo/nba_01.jpg
 *   - src: absolute path under /public (allowlisted), e.g. "/demo/2024_finals.jpg"
 *
 * Notes:
 *   - Uses Next.js client hooks (useParams/useSearchParams) to avoid async param warnings.
 *   - Simple path allowlist prevents arbitrary external URLs.
 */
export default function ResultPage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();

  // Dynamic segment and query params (client-safe)
  const id = String(params.id);
  const filename = search.get('f') ?? '';
  const isDemo = search.get('demo') === '1';
  const staticSrc = search.get('src') ?? '';

  // Allow only local, public paths for `src` (no full URLs).
  const isSafeStatic =
    staticSrc.startsWith('/demo/') ||
    staticSrc.startsWith('/images/') ||
    staticSrc.startsWith('/gallery/');

  // Resolve image source (priority: `src` param, then demo, then uploaded file).
  const imgSrc = useMemo(() => {
    if (isSafeStatic) return staticSrc;
    if (isDemo) return '/demo/nba_01.jpg';
    if (filename) return `/api/uploads/${encodeURIComponent(filename)}`;
    return '';
  }, [isSafeStatic, staticSrc, isDemo, filename]);

  // Share feedback state
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setCopied(false);
      alert('Could not copy link to clipboard.');
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Moment X-Ray</h1>
          <Link
            className="rounded-md bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15"
            href="/"
          >
            New upload
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Left: image */}
          <div className="rounded-2xl bg-neutral-900/50 p-4">
            <div className="text-neutral-400 text-sm mb-2">Frame</div>
            {imgSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imgSrc}
                alt="uploaded or demo frame"
                className="rounded-lg w-full object-contain"
              />
            ) : (
              <div className="rounded-lg bg-neutral-900 p-8 text-center text-sm text-neutral-400">
                No image available. Return to the home page and upload a file.
              </div>
            )}
          </div>

          {/* Right: analysis + share */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-neutral-900/50 p-4">
              <div className="mb-3 text-neutral-400 text-sm">Analysis</div>
              <ol className="space-y-2">
                {['Detect scorebug', 'Identify game', 'Render poster'].map((label) => (
                  <li key={label} className="flex items-center gap-2 text-sm">
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-neutral-300">{label}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-6 rounded-lg bg-neutral-900 p-4">
                <div className="text-sm text-neutral-400">Win probability</div>
                <div className="mt-1 text-3xl font-semibold">—%</div>
                <div className="mt-2 text-xs text-neutral-500">
                  Placeholder. Appears once the baseline model is wired.
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900/50 p-4">
              <div className="mb-3 text-neutral-400 text-sm">Share</div>
              <div className="flex flex-wrap gap-2">
                {/* For now, downloading original image; will swap for poster export. */}
                <a
                  className="rounded-md bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15"
                  href={imgSrc || '#'}
                  download
                >
                  Download image
                </a>
                <button
                  className="rounded-md bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15"
                  onClick={copyShareLink}
                >
                  {copied ? 'Link copied!' : 'Copy share link'}
                </button>
              </div>
              <div className="mt-3 text-xs text-neutral-500">
                Free mode will include a small watermark on poster exports. Pro removes watermark and unlocks templates.
              </div>
            </div>
          </div>
        </div>

        {/* Debug info (useful during early development) */}
        <div className="mt-10 rounded-2xl bg-neutral-900/50 p-4 text-sm text-neutral-300">
          <div className="font-medium">Debug</div>
          <div className="mt-1 text-neutral-400">
            Result ID: <span className="text-white">{id}</span>
          </div>
          {filename && (
            <div className="text-neutral-400">
              File: <span className="text-white">{filename}</span>
            </div>
          )}
          {isDemo && <div className="text-neutral-400">Mode: demo</div>}
          {isSafeStatic && (
            <div className="text-neutral-400">
              Static: <span className="text-white">{staticSrc}</span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
