'use client';
// components/profile/ClientHistory.tsx
import { useEffect, useState } from 'react';
import { Clock, Trash2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { CATEGORIES } from '@/types';

interface HistoryItem {
  id: string; title: string; youtube_url: string;
  category: string; thumbnail: string; watchedAt: string;
}

function getThumb(url: string, thumb: string) {
  if (thumb) return thumb;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : '';
}

export default function ClientHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem('watch_history');
      if (raw) setHistory(JSON.parse(raw).slice(0, 8));
    } catch {}
  }, []);

  function clearAll() {
    localStorage.removeItem('watch_history');
    setHistory([]);
  }

  if (!mounted) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-[#2C3E50] flex items-center gap-2">
          <Clock size={20} className="text-[#C19A6B]" />
          سجل المشاهدة
        </h2>
        {history.length > 0 && (
          <div className="flex items-center gap-3">
            <Link href="/history" className="text-sm text-[#C19A6B] hover:underline flex items-center gap-1">
              عرض الكل <ChevronLeft size={14} />
            </Link>
            <button onClick={clearAll}
              className="text-sm text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors">
              <Trash2 size={14} /> مسح
            </button>
          </div>
        )}
      </div>

      {history.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <Clock size={36} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">لم تشاهد أي فيديو بعد</p>
          <Link href="/" className="btn-primary text-sm mt-4 inline-block">تصفح الفيديوهات</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {history.map((item) => {
            const cat = CATEGORIES[item.category as keyof typeof CATEGORIES];
            return (
              <div key={`${item.id}-${item.watchedAt}`} className="card p-3 hover:shadow-md transition-all">
                <div className="w-full aspect-video rounded-lg overflow-hidden bg-gray-100 mb-2">
                  <img src={getThumb(item.youtube_url, item.thumbnail)} alt={item.title}
                    className="w-full h-full object-cover" loading="lazy" />
                </div>
                <p className="text-xs font-semibold text-[#2C3E50] line-clamp-2 leading-snug">{item.title}</p>
                <p className="text-xs text-gray-400 mt-1">{cat?.icon} {cat?.label}</p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
