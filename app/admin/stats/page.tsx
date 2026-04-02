'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { Video, Users, Radio, TrendingUp, ArrowLeft } from 'lucide-react';
import { CATEGORIES, VideoCategory } from '@/types';
import Link from 'next/link';

export default function StatsPage() {
  const { profile, ready } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ totalVideos:0, totalUsers:0, totalStreams:0, byCategory:{} as Record<string,number>, recentVideos:[] as any[] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    if (!profile || profile.role !== 'admin') { router.replace('/'); return; }
    const sb = createClient();
    Promise.all([
      sb.from('videos').select('*').order('created_at', {ascending: false}),
      sb.from('profiles').select('id'),
      sb.from('live_stream').select('id'),
    ]).then(([videos, users, streams]) => {
      const byCategory: Record<string,number> = {};
      (videos.data||[]).forEach(v => { byCategory[v.category] = (byCategory[v.category]||0)+1; });
      setStats({ totalVideos: videos.data?.length||0, totalUsers: users.data?.length||0, totalStreams: streams.data?.length||0, byCategory, recentVideos: (videos.data||[]).slice(0,5) });
      setLoading(false);
    });
  }, [ready, profile]);

  if (!ready||loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-[var(--gold-dim)] border-t-[var(--gold)] rounded-full animate-spin"/></div>;

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin" className="w-9 h-9 bg-[var(--surface-2)] border border-[var(--border)] hover:bg-[var(--surface-3)] rounded-xl flex items-center justify-center transition-colors">
          <ArrowLeft size={18} className="text-[var(--text-1)]"/>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[var(--text-1)]">📊 إحصائيات المنصة</h1>
          <p className="text-sm font-bold text-[var(--text-3)]">نظرة شاملة على أداء الموقع</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {[
          { icon: Video, label: 'إجمالي الفيديوهات', value: stats.totalVideos, color: 'text-blue-500 bg-blue-500/10' },
          { icon: Users, label: 'إجمالي المستخدمين', value: stats.totalUsers, color: 'text-emerald-500 bg-emerald-500/10' },
          { icon: Radio, label: 'جلسات البث', value: stats.totalStreams, color: 'text-red-500 bg-red-500/10' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card bg-[var(--surface-2)] border-none text-center hover:shadow-[var(--sh-sm)] transition-shadow">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 ${color}`}><Icon size={22}/></div>
            <p className="text-3xl font-black text-[var(--text-1)]">{value}</p>
            <p className="text-xs font-bold text-[var(--text-3)] mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="card bg-[var(--surface-2)] border-none">
        <h2 className="font-black text-[var(--text-1)] mb-5">الفيديوهات حسب التصنيف</h2>
        <div className="space-y-4">
          {Object.entries(CATEGORIES).map(([key, cat]) => {
            const count = stats.byCategory[key]||0;
            const pct = stats.totalVideos>0 ? Math.round((count/stats.totalVideos)*100) : 0;
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-[var(--text-1)]">{cat.icon} {cat.label}</span>
                  <span className="text-sm font-black text-[var(--gold)]">{count} فيديو</span>
                </div>
                <div className="w-full bg-[var(--surface)] overflow-hidden rounded-full h-2.5 shadow-inner">
                  <div className="bg-[var(--gold)] h-full rounded-full transition-all duration-500" style={{width:`${pct}%`}}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
