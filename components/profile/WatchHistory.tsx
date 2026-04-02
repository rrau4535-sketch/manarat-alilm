'use client';

// components/profile/WatchHistory.tsx
import { useEffect, useState } from 'react';
import { Clock, Trash2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { CATEGORIES } from '@/types';

interface HistoryItem {
  id: string;
  title: string;
  youtube_url: string;
  category: string;
  thumbnail: string;
  watchedAt: string;
}

function getYouTubeId(url: string) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : '';
}

export default function WatchHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('watch_history');
    if (stored) setHistory(JSON.parse(stored).slice(0, 6)); // أحدث 6 بس في البروفيل
  }, []);

  if (!mounted) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-[#2C3E50] flex items-center gap-2">
          <Clock size={20} className="text-[#C19A6B]" />
          سجل المشاهدة
        </h2>
        {history.length > 0 && (
          <Link href="/history"
            className="flex items-center gap-1 text-sm text-[#C19A6B] hover:underline">
            عرض الكل <ChevronLeft size={14} />
          </Link>
        )}
      </div>

      {history.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <Clock size={36} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">سجل المشاهدة فارغ</p>
          <p className="text-sm mt-1">الفيديوهات التي تشاهدها تظهر هنا</p>
          <Link href="/" className="btn-primary text-sm mt-4 inline-block">
            تصفح الفيديوهات
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.map((item) => {
            const cat = CATEGORIES[item.category as keyof typeof CATEGORIES];
            return (
              <div key={`${item.id}-${item.watchedAt}`}
                   className="card p-3 flex items-center gap-3 hover:shadow-md transition-all">
                <div className="w-20 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  <img
                    src={item.thumbnail || `https://img.youtube.com/vi/${getYouTubeId(item.youtube_url)}/hqdefault.jpg`}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#2C3E50] line-clamp-2 leading-snug">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{cat?.icon} {cat?.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
