'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Search } from 'lucide-react';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export default function QuranIndex() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchSurahs() {
      try {
        const res = await fetch('https://api.alquran.cloud/v1/surah');
        const json = await res.json();
        setSurahs(json.data);
      } catch (err) {
        console.error('Failed to fetch surahs', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSurahs();
  }, []);

  const filteredSurahs = surahs.filter(s => 
    s.name.includes(search) || 
    s.englishName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-10 min-h-screen">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-5xl font-black text-[var(--gold)] mb-4 flex items-center justify-center gap-3">
          <BookOpen className="w-8 h-8 md:w-12 md:h-12" />
          القرآن الكريم
        </h1>
        <p className="text-[var(--text-2)] font-bold">تصفح وقراءة واستماع للقرآن الكريم</p>
      </div>

      <div className="relative mb-8 max-w-xl mx-auto">
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <Search className="w-5 h-5 text-[var(--text-3)]" />
        </div>
        <input 
          type="text" 
          placeholder="ابحث عن سورة (مثال: البقرة، Al-Baqarah)..." 
          className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl py-4 pr-12 pl-4 text-[var(--text-1)] focus:outline-none focus:border-[var(--gold)] font-bold transition-colors shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="card h-24 shimmer" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSurahs.map((surah) => (
            <Link key={surah.number} href={`/quran/${surah.number}`} className="no-underline">
              <div className="card p-5 bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--gold)] hover:shadow-lg transition-all flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[var(--surface-3)] flex items-center justify-center font-bold text-[var(--text-2)] group-hover:bg-[var(--gold)] group-hover:text-[var(--bg)] transition-colors shrink-0">
                    {surah.number}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-[var(--text-1)] group-hover:text-[var(--gold)] transition-colors">{surah.name}</h2>
                    <p className="text-xs text-[var(--text-3)] font-bold mt-1">{surah.englishName} • {surah.englishNameTranslation}</p>
                  </div>
                </div>
                <div className="text-left shrink-0">
                  <p className="text-xs font-bold text-[var(--text-2)]">{surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</p>
                  <p className="text-[10px] text-[var(--text-3)] mt-1">{surah.numberOfAyahs} آيات</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {!loading && filteredSurahs.length === 0 && (
        <div className="text-center py-12 text-[var(--text-3)] font-bold mt-10 card bg-[var(--surface-2)] border-none">
          <BookOpen size={40} className="mx-auto mb-4 opacity-20" />
          لم يتم العثور على أي سورة مطابقة لبحثك
        </div>
      )}
    </div>
  );
}
