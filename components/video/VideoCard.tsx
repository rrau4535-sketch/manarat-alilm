'use client';
import { useState } from 'react';
import ReactPlayer from 'react-player/youtube';
import { Video, CATEGORIES } from '@/types';
import { Play, Share2, Check } from 'lucide-react';
import Link from 'next/link';

interface Props { video: Video; showDelete?: boolean; onDelete?: (id: string) => void; }

function saveToHistory(v: Video) {
  try {
    const raw = localStorage.getItem('watch_history');
    let h = raw ? JSON.parse(raw) : [];
    h = h.filter((x: any) => x.id !== v.id);
    h.unshift({ id: v.id, title: v.title, youtube_url: v.youtube_url, category: v.category, thumbnail: v.thumbnail || '', watchedAt: new Date().toISOString() });
    localStorage.setItem('watch_history', JSON.stringify(h.slice(0, 50)));
  } catch {}
}

function getYId(url: string) {
  if (!url) return '';
  const m = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  return m ? m[1] : '';
}

export default function VideoCard({ video, showDelete, onDelete }: Props) {
  const [playing, setPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const cat = CATEGORIES[video.category as keyof typeof CATEGORIES];

  async function handleShare() {
    const url = window.location.origin;
    try {
      if (navigator.share) await navigator.share({ title: video.title, url });
      else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    } catch {}
  }

  return (
    <div className="card p-0 overflow-hidden bg-[var(--surface-2)] border-[var(--border)] transition-shadow hover:shadow-[var(--sh-md)] group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>

      {/* Thumbnail */}
      <div className="relative pt-[56.25%] bg-[var(--surface-3)] overflow-hidden">
        {playing ? (
          <div className="absolute inset-0">
            <ReactPlayer url={video.youtube_url} width="100%" height="100%" playing controls
              className="absolute top-0 right-0" />
          </div>
        ) : (
          <div className="absolute inset-0 cursor-pointer"
            onClick={() => { setPlaying(true); saveToHistory(video); }}>

            <img
              src={video.thumbnail || `https://i.ytimg.com/vi/${getYId(video.youtube_url)}/hqdefault.jpg`}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (target.src.includes('hqdefault.jpg')) {
                  target.src = `https://i.ytimg.com/vi/${getYId(video.youtube_url)}/maxresdefault.jpg`;
                } else if (target.src.includes('maxresdefault.jpg')) {
                  target.src = `https://i.ytimg.com/vi/${getYId(video.youtube_url)}/0.jpg`;
                }
              }}
              alt={video.title}
              loading="lazy"
              className={`w-full h-full object-cover transition-transform duration-500 ${hovered ? 'scale-105' : 'scale-100'}`}
            />

            {/* Overlay */}
            <div className={`absolute inset-0 bg-black transition-opacity duration-200 ${hovered ? 'opacity-30' : 'opacity-10'}`} />

            {/* Play btn */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${hovered ? 'bg-[var(--gold)] shadow-[var(--sh-gold)] scale-110' : 'bg-white/95 shadow-lg scale-100'}`}>
                <Play size={16} fill={hovered ? 'white' : 'var(--gold)'} className={hovered ? 'text-white -mr-0.5' : 'text-[var(--gold)] -mr-0.5'} />
              </div>
            </div>

            {/* Category */}
            <div className="absolute top-2 right-2">
              <span className="category-badge bg-white/95 text-[var(--text-1)] shadow-sm backdrop-blur-sm px-2 py-1 flex items-center gap-1 rounded-full text-[10px] font-bold">
                {cat?.icon} {cat?.label}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 pb-3">
        <Link 
          href={`/video/${video.id}`} 
          onClick={() => saveToHistory(video)}
          className="font-bold text-sm leading-relaxed text-[var(--text-1)] mb-2 line-clamp-2 no-underline hover:text-[var(--gold)] transition-colors block"
        >
          {video.title}
        </Link>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-[var(--text-3)] font-bold">
            {new Date(video.created_at).toLocaleDateString('ar-EG')}
          </span>
          <div className="flex gap-1.5">
            <button onClick={handleShare} className={`btn-ghost px-2 py-1 text-[10px] flex items-center gap-1 font-bold ${copied ? 'text-[var(--gold)] bg-[var(--gold-dim)]' : 'text-[var(--text-3)]'}`}>
              {copied ? <Check size={11} /> : <Share2 size={11} />}
              {copied ? 'تم' : 'مشاركة'}
            </button>
            {showDelete && onDelete && (
              <button onClick={() => confirm('حذف؟') && onDelete(video.id)}
                className="btn-ghost px-2 py-1 text-[10px] flex items-center gap-1 font-bold text-red-500 hover:bg-red-500/10">
                حذف
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
