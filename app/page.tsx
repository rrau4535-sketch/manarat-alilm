'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { CATEGORIES } from '@/types';
import SearchBar from '@/components/ui/SearchBar';
import VideoCard from '@/components/video/VideoCard';
import { TrendingUp, Radio, ChevronLeft, ShieldCheck } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function HomeContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const sb = createClient();
    const q = sb.from('videos').select('*').order('created_at', { ascending: false });
    (query ? q.ilike('title', `%${query}%`).limit(24) : q.limit(12))
      .then(({ data }) => { setVideos(data || []); setLoading(false); });
  }, [query]);

  return (
    <div className="min-h-screen bg-[var(--bg)] transition-colors duration-300">

      {/* ── HERO — TikTok clean ── */}
      {!query && (
        <section className="bg-gradient-to-b from-[var(--surface)] to-[var(--bg)] pt-14 px-4 pb-12 border-b border-[var(--border)]">
          <div className="max-w-[620px] mx-auto text-center">

            {/* Pill tag */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--surface-2)] border border-[var(--border-2)] text-[11px] font-extrabold text-[var(--text-2)] tracking-wider mb-6">
              <ShieldCheck size={14} className="text-[var(--gold)]" />
              منصة الدعوة الإسلامية
            </div>

            <h1 className="font-black text-[var(--text-1)] leading-tight mb-4 tracking-tight text-[clamp(1.9rem,5vw,3rem)]">
              الحق يعلو{' '}
              <span className="text-[var(--gold)]">ولا يُعلى عليه</span>
            </h1>

            <p className="text-[var(--text-3)] text-[15px] mb-8 leading-relaxed">
              ردود علمية على الشبهات وحوارات مع المخالفين
            </p>

            <SearchBar defaultValue={query} />

            {/* Quick tags */}
            <div className="flex justify-center gap-2 mt-5 flex-wrap">
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <Link key={key} href={`/${key}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border-2)] text-xs font-bold text-[var(--text-2)] no-underline transition-all hover:-translate-y-px hover:shadow-sm">
                  {cat.icon} {cat.label}
                </Link>
              ))}
              <Link href="/live" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-500 hover:bg-red-500/20 transition-all">
                <Radio size={11} className="animate-pulse" />
                بث مباشر
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className="max-w-[1200px] mx-auto px-4 py-7">

        {/* ── CATEGORIES ── */}
        {!query && (
          <section className="mb-9">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(CATEGORIES).map(([key, cat], i) => (
                <Link key={key} href={`/${key}`}
                  className="card fade-up group cursor-pointer block no-underline"
                  style={{ animationDelay: `${i * 0.07}s` }}>
                  <span className="text-[22px] block mb-2">{cat.icon}</span>
                  <h3 className="font-extrabold text-[13px] text-[var(--text-1)] mb-1">{cat.label}</h3>
                  <p className="text-[11px] text-[var(--text-3)] leading-relaxed">{cat.description}</p>
                  <div className="mt-2.5 text-[11px] font-extrabold text-[var(--gold)] flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    استكشف <ChevronLeft size={11} />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── DIVIDER ── */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-[15px] text-[var(--text-1)] flex items-center gap-1.5">
            {query ? (
              <>نتائج: <span className="text-[var(--gold)]">"{query}"</span></>
            ) : (
              <><TrendingUp size={16} className="text-[var(--gold)]" />أحدث الفيديوهات</>
            )}
          </h2>
          {!query && (
            <Link href="/search" className="text-xs font-bold text-[var(--gold)] no-underline flex items-center gap-0.5 hover:text-[var(--gold-2)] transition-colors">
              عرض الكل <ChevronLeft size={12} />
            </Link>
          )}
        </div>

        {/* ── GRID ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="shimmer rounded-xl h-[210px]" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="card text-center py-12 px-6">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-bold text-sm text-[var(--text-2)]">لا توجد نتائج</p>
            <Link href="/search" className="btn-gold mt-4 text-xs inline-flex">
              بحث متقدم
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {videos.map((video, i) => (
              <div key={video.id} className="fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                <VideoCard video={video} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-4 border-[var(--surface-3)] border-t-[var(--gold)] animate-spin" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
