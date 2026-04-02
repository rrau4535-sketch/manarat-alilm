import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import ReactPlayerClient from '@/components/video/ReactPlayerClient';
import CommentsSection from '@/components/video/CommentsSection';
import BookmarkButton from '@/components/video/BookmarkButton';
import { CATEGORIES, VideoCategory } from '@/types';
import Link from 'next/link';

export default async function VideoDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const supabase = await createServerSupabaseClient();

  const { data: video } = await supabase
    .from('videos')
    .select('*, profile:profiles(username)')
    .eq('id', id)
    .single();

  if (!video) notFound();

  const cat = CATEGORIES[video.category as VideoCategory];
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-8 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Video Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-0 overflow-hidden bg-black ring-1 ring-[var(--border)]">
            <ReactPlayerClient url={video.youtube_url} />
          </div>

          <div className="card p-5 bg-[var(--surface-2)] border-none">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
              <h1 className="text-xl md:text-2xl font-black text-[var(--text-1)]">{video.title}</h1>
              {user && <BookmarkButton videoId={video.id} userId={user.id} />}
            </div>
            
            <div className="flex items-center gap-4 text-sm font-bold text-[var(--text-3)]">
              <span>{new Date(video.created_at).toLocaleDateString('ar-EG')}</span>
              {cat && (
                <span className="flex items-center gap-1.5 text-[var(--gold)]">
                  {cat.icon} {cat.label}
                </span>
              )}
            </div>
            
            {video.profile && (
              <div className="mt-6 pt-5 border-t border-[var(--border)]">
                <Link href={`/profile/${video.profile.username}`} className="flex items-center gap-3 no-underline group hover:opacity-80 transition-opacity w-fit">
                  <div className="w-10 h-10 rounded-full bg-[var(--gold)] text-white font-black flex items-center justify-center text-lg shadow-sm">
                    {video.profile.username[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-black text-[var(--text-1)] group-hover:text-[var(--gold)] transition-colors">{video.profile.username}</p>
                    <p className="text-[11px] font-bold text-[var(--text-3)]">ناشر الفيديو</p>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar / Comments */}
        <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-r border-[var(--border)] pt-8 lg:pt-0 lg:pr-8">
          <CommentsSection videoId={video.id} />
        </div>
      </div>
    </div>
  );
}
