import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getVideos } from '@/lib/video-actions';
import { CATEGORIES, VideoCategory } from '@/types';
import VideoCard from '@/components/video/VideoCard';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Props { params: Promise<{ category: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = CATEGORIES[category as VideoCategory];
  if (!cat) return {};
  return { title: cat.label, description: cat.description };
}

export async function generateStaticParams() {
  return Object.keys(CATEGORIES).map(cat => ({ category: cat }));
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  if (!Object.keys(CATEGORIES).includes(category)) notFound();
  const validCategory = category as VideoCategory;
  const categoryInfo = CATEGORIES[validCategory];
  const videos = await getVideos(validCategory);

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-10">
      <div className="flex items-center gap-2 text-sm text-[var(--text-3)] mb-8">
        <Link href="/" className="hover:text-[var(--gold)] font-bold transition-colors no-underline text-[var(--text-3)]">الرئيسية</Link>
        <ArrowRight size={14} className="rotate-180"/>
        <span className="text-[var(--text-1)] font-bold">{categoryInfo.label}</span>
      </div>

      <div className="card mb-10 text-center bg-[var(--surface-2)] border-none">
        <div className="text-5xl mb-3">{categoryInfo.icon}</div>
        <h1 className="text-3xl font-black text-[var(--text-1)] mb-2">{categoryInfo.label}</h1>
        <p className="text-[var(--text-2)] font-medium max-w-xl mx-auto">{categoryInfo.description}</p>
        <div className="mt-4 text-[var(--gold)] font-bold bg-[var(--gold-dim)] inline-block px-4 py-1.5 rounded-full text-sm">
          {videos.length} فيديو متاح
        </div>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-20 text-[var(--text-3)]">
          <p className="text-6xl mb-4">🎬</p>
          <p className="text-lg font-black text-[var(--text-1)]">لا توجد فيديوهات في هذا التصنيف حتى الآن</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {videos.map((video, i) => (
            <div key={video.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <VideoCard video={video}/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
