'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CATEGORIES, VideoCategory } from '@/types';
import VideoCard from '@/components/video/VideoCard';
import { Search, Filter, X } from 'lucide-react';
import Link from 'next/link';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q') || '';
  const catFilter = searchParams.get('cat') || '';
  const [query, setQuery] = useState(q);
  const [videos, setVideos] = useState<any[]>([]);
  const [publishers, setPublishers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'videos'|'publishers'>('videos');

  useEffect(() => { if (q || catFilter) doSearch(q, catFilter); }, [q, catFilter]);

  async function doSearch(term: string, cat: string) {
    setLoading(true);
    const sb = createClient();
    let vq = sb.from('videos').select('*').order('created_at', { ascending: false });
    if (term) vq = vq.ilike('title', `%${term}%`);
    if (cat) vq = vq.eq('category', cat);
    const { data: vids } = await vq.limit(30);
    setVideos(vids || []);
    if (term) {
      const { data: pubs } = await sb.from('profiles').select('*')
        .ilike('username', `%${term}%`).in('role', ['publisher', 'admin']).limit(10);
      setPublishers(pubs || []);
    } else setPublishers([]);
    setLoading(false);
  }

  function go(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (query.trim()) p.set('q', query.trim());
    if (catFilter) p.set('cat', catFilter);
    router.push(`/search?${p.toString()}`);
  }

  function setCat(cat: string) {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (cat) p.set('cat', cat);
    router.push(`/search?${p.toString()}`);
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-10">
      <form onSubmit={go} className="mb-8">
        <div className="flex items-center bg-[var(--surface-2)] rounded-2xl shadow-sm border border-[var(--border)] focus-within:border-[var(--gold)] transition-all overflow-hidden p-1">
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="ابحث عن فيديو، شبهة، أو ناشر..."
            className="flex-1 px-5 py-3 text-base bg-transparent outline-none text-[var(--text-1)] placeholder:text-[var(--text-3)]"
            dir="auto" autoFocus/>
          {query && (
            <button type="button" onClick={() => { setQuery(''); router.push('/search'); }} className="p-3 text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors">
              <X size={18}/>
            </button>
          )}
          <button type="submit" className="bg-[var(--gold)] hover:bg-[var(--gold-2)] text-white p-3 rounded-xl transition-colors shrink-0">
            <Search size={20}/>
          </button>
        </div>
      </form>

      <div className="flex items-center gap-2 flex-wrap mb-6">
        <span className="text-sm text-[var(--text-3)] flex items-center gap-1 font-bold">
          <Filter size={14}/> تصفية:
        </span>
        <button onClick={() => setCat('')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${!catFilter ? 'bg-[var(--gold)] text-white' : 'bg-[var(--surface-2)] text-[var(--text-2)] hover:bg-[var(--surface-3)] border border-[var(--border)]'}`}>
          الكل
        </button>
        {Object.entries(CATEGORIES).map(([k,v]) => (
          <button key={k} onClick={() => setCat(k)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${catFilter===k ? 'bg-[var(--gold)] text-white' : 'bg-[var(--surface-2)] text-[var(--text-2)] hover:bg-[var(--surface-3)] border border-[var(--border)]'}`}>
            {v.icon} {v.label}
          </button>
        ))}
      </div>

      {publishers.length > 0 && (
        <div className="flex bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-1 mb-6 gap-1 w-fit">
          <button onClick={() => setTab('videos')} className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${tab==='videos' ? 'bg-[var(--surface)] text-[var(--text-1)] shadow-sm' : 'text-[var(--text-3)] hover:text-[var(--text-1)]'}`}>
            🎬 فيديوهات ({videos.length})
          </button>
          <button onClick={() => setTab('publishers')} className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${tab==='publishers' ? 'bg-[var(--surface)] text-[var(--text-1)] shadow-sm' : 'text-[var(--text-3)] hover:text-[var(--text-1)]'}`}>
            👤 ناشرون ({publishers.length})
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1,2,3,4,5,6].map(i => <div key={i} className="card h-52 shimmer"/>)}
        </div>
      ) : !q && !catFilter ? (
        <div className="text-center py-20 text-[var(--text-3)]">
          <Search size={48} className="mx-auto mb-4 opacity-30"/>
          <p className="text-lg font-black text-[var(--text-1)]">ابحث عن أي شيء</p>
          <p className="text-sm mt-2 font-medium">فيديوهات، مناظرات، مشايخ، وناشرين...</p>
        </div>
      ) : tab === 'videos' ? (
        videos.length === 0 ? (
          <div className="text-center py-20 text-[var(--text-3)]">
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-bold text-[var(--text-1)]">لا توجد نتائج {q ? `عن "${q}"` : ''}</p>
          </div>
        ) : (
          <>
            <p className="text-sm font-bold text-[var(--text-3)] mb-4">{videos.length} نتيجة {q?`عن "${q}"`:''} {catFilter?`في ${CATEGORIES[catFilter as VideoCategory]?.label}`:''}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {videos.map((v,i) => (
                <div key={v.id} className="animate-fade-up" style={{animationDelay:`${i*0.04}s`}}>
                  <VideoCard video={v}/>
                </div>
              ))}
            </div>
          </>
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {publishers.map(p => (
            <Link key={p.id} href={`/profile/${p.username}`}
              className="card hover:shadow-[var(--sh-sm)] hover:-translate-y-0.5 transition-all flex items-center gap-4 no-underline">
              <div className="w-12 h-12 bg-[var(--gold)] rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl font-black">{p.username[0].toUpperCase()}</span>
              </div>
              <div>
                <p className="font-black text-[var(--text-1)]">{p.username}</p>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full mt-1 inline-block ${p.role==='admin' ? 'bg-[var(--gold-dim)] text-[var(--gold)]' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  {p.role==='admin'?'🛡️ مشرف':'🎬 ناشر'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-4 border-[var(--gold-dim)] border-t-[var(--gold)] rounded-full animate-spin"/></div>}>
      <SearchContent/>
    </Suspense>
  );
}
