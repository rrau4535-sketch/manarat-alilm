'use client';

import { useEffect, useState } from 'react';
import { Clock, Trash2, ArrowRight } from 'lucide-react';
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

function getYId(url: string) {
  if (!url) return '';
  const m = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  return m ? m[1] : '';
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('watch_history');
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  function clearHistory() {
    if (confirm('هل تريد مسح سجل المشاهدة كاملاً؟')) {
      localStorage.removeItem('watch_history');
      setHistory([]);
    }
  }

  function removeItem(id: string) {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('watch_history', JSON.stringify(updated));
  }

  // تجميع حسب اليوم
  const grouped = history.reduce((acc, item) => {
    const date = new Date(item.watchedAt).toLocaleDateString('ar-EG', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, HistoryItem[]>);

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--gold-dim)] rounded-xl flex items-center justify-center">
            <Clock size={20} className="text-[var(--gold)]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[var(--text-1)]">سجل المشاهدة</h1>
            <p className="text-sm font-bold text-[var(--text-3)]">{history.length} فيديو تمت مشاهدته</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-sm font-bold text-[var(--text-3)] hover:text-[var(--gold)] transition-colors no-underline">
            <ArrowRight size={16} className="rotate-180" />
            الرئيسية
          </Link>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center gap-1.5 text-sm font-bold text-red-500
                         hover:bg-red-500/10 px-3 py-2 rounded-xl transition-all bg-transparent border-none cursor-pointer"
            >
              <Trash2 size={15} />
              مسح الكل
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {history.length === 0 ? (
        <div className="card text-center py-20 bg-[var(--surface-2)] border-none">
          <Clock size={48} className="mx-auto mb-4 text-[var(--text-3)] opacity-20" />
          <h2 className="text-xl font-black text-[var(--text-1)] mb-2">سجل المشاهدة فارغ</h2>
          <p className="text-[var(--text-3)] text-sm mb-6 font-bold">الفيديوهات التي تشاهدها ستظهر هنا تلقائياً</p>
          <Link href="/" className="btn-primary py-2 px-6 no-underline text-sm">
            تصفح الفيديوهات
          </Link>
        </div>
      ) : (
        /* History List */
        <div className="space-y-8">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              {/* Date Header */}
              <h3 className="text-sm font-black text-[var(--text-3)] mb-4 flex items-center gap-3">
                <span className="flex-1 h-px bg-[var(--border)]" />
                {date}
                <span className="flex-1 h-px bg-[var(--border)]" />
              </h3>

              <div className="space-y-3">
                {items.map((item) => {
                  const cat = CATEGORIES[item.category as keyof typeof CATEGORIES];
                  return (
                    <div key={`${item.id}-${item.watchedAt}`}
                         className="card flex items-center gap-4 p-3 hover:shadow-[var(--sh-sm)] transition-all group bg-[var(--surface-2)] border-none">

                      {/* Thumbnail */}
                      <Link href={`/video/${item.id}`} className="w-28 sm:w-36 aspect-video rounded-xl overflow-hidden flex-shrink-0 bg-[var(--surface-3)] relative block no-underline">
                        <img
                          src={item.thumbnail || `https://i.ytimg.com/vi/${getYId(item.youtube_url)}/hqdefault.jpg`}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/video/${item.id}`} className="font-black text-[var(--text-1)] text-sm leading-snug line-clamp-2 no-underline hover:text-[var(--gold)] transition-colors">
                          {item.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-bold text-[var(--text-3)] flex items-center gap-1">
                            {cat?.icon} {cat?.label}
                          </span>
                          <span className="text-[var(--border)] font-bold text-[10px]">•</span>
                          <span className="text-[10px] font-bold text-[var(--text-3)]">
                            {new Date(item.watchedAt).toLocaleTimeString('ar-EG', {
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[var(--text-3)] hover:text-red-500 p-2 rounded-lg
                                   opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 bg-transparent border-none cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
