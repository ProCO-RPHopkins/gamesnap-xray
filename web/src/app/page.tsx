'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

/**
 * Landing page with a modern hero, subtle motion, uploader,
 * and a Demo Gallery auto-populated from /public/demo via /api/demos.
 */
type DemoItem = {
  filename: string;
  url: string; // e.g., "/demo/nba_01.jpg"
  bytes: number;
  modifiedAt: string;
};

export default function Home() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [demos, setDemos] = useState<DemoItem[] | null>(null);
  const [demoErr, setDemoErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/demos', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (alive) setDemos(json.items as DemoItem[]);
      } catch (e: any) {
        if (alive) setDemoErr(e?.message || 'Failed to load demos');
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

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

      router.push(`/result/${data.id}?f=${encodeURIComponent(data.filename)}`);
    } catch (e: any) {
      setError(e?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      {/* HERO */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 pt-20 pb-12 md:pt-28 md:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="flex flex-col items-center text-center"
          >
            <div className="gs-pill px-3 py-1 text-xs text-neutral-300">
              One image → instant sports context
            </div>

            <h1 className="mt-4 text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
              GameSnap <span className="text-[var(--gs-accent)]">X-Ray</span>
            </h1>

            <p className="mt-4 max-w-2xl text-neutral-300 text-lg">
              Upload a TV photo or screenshot and get a share-ready poster with score, clock,
              teams, and a transparent win-probability snapshot.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => inputRef.current?.click()}
                className="gs-btn px-6 py-3 text-sm font-semibold disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Uploading…' : 'Upload image'}
              </button>
              <a
                href="/result/demo?demo=1"
                className="px-6 py-3 text-sm font-semibold rounded-xl border border-[var(--gs-border)] hover:bg-white/5"
              >
                Try a demo
              </a>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {error && (
              <div className="mt-4 text-sm text-red-300">
                {error}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: 'Detect scorebug',
              desc:
                'We isolate the scoreboard region and extract digits, clock, and team identifiers.',
            },
            {
              title: 'Identify game',
              desc:
                'We match the frame against live/recent schedules and pull structured stats.',
            },
            {
              title: 'Render poster',
              desc:
                'We build a premium, share-ready poster using team colors and clean typography.',
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
              transition={{ duration: 0.35 + i * 0.05, ease: 'easeOut' }}
              className="gs-card p-5"
            >
              <div className="text-sm text-neutral-400">Step {i + 1}</div>
              <div className="mt-1 text-xl font-semibold">{item.title}</div>
              <p className="mt-2 text-sm text-neutral-300">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* DEMO GALLERY */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Demo Moments</h2>
        </div>

        {demoErr && (
          <div className="rounded-lg bg-red-600/10 border border-red-700/40 p-4 text-sm text-red-300 mb-6">
            {demoErr}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {demos === null
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="gs-card p-2 animate-pulse h-48" />
              ))
            : demos.length === 0
            ? (
              <div className="text-neutral-400 text-sm">
                No demo images found.
              </div>
            ) : (
              demos.slice(0, 12).map((d) => (
                <a
                  key={d.filename}
                  href={`/result/demo?src=${encodeURIComponent(`/demo/${d.filename}`)}`}
                  className="gs-card overflow-hidden group"
                  aria-label={`Open demo ${d.filename}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={d.url}
                    alt=""
                    className="h-48 w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                  />
                </a>
              ))
            )}
        </div>
      </section>

      {/* FEATURE CALLOUTS */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              k: 'Fast & simple',
              v: 'A friction-free three-step flow; first-time users get to “wow” in seconds.',
            },
            {
              k: 'Honest analytics',
              v: 'A transparent baseline model and a public Model Health page for calibration.',
            },
            {
              k: 'Creator-ready',
              v: 'Export clean posters; free includes watermark, Pro removes it and unlocks templates.',
            },
          ].map((f, i) => (
            <motion.div
              key={f.k}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 + i * 0.06, ease: 'easeOut' }}
              className="gs-card p-5"
            >
              <div className="text-[var(--gs-accent)] text-sm font-semibold">{f.k}</div>
              <p className="mt-2 text-sm text-neutral-300">{f.v}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[var(--gs-border)]">
        <div className="mx-auto max-w-6xl px-4 py-8 text-xs text-neutral-500">
          Free mode adds a small watermark • Pro unlocks templates & no watermark
        </div>
      </footer>
    </main>
  );
}
