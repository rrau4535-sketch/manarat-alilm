'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ArrowRight, Play, Pause, Download, Info, Settings2 } from 'lucide-react';

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
}

interface SurahData {
  number: number;
  name: string;
  englishName: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs: Ayah[];
}

const RECITERS = [
  { id: 'ar.alafasy', name: 'مشاري العفاسي' },
  { id: 'ar.abdulbasitmurattal', name: 'عبد الباسط عبد الصمد' },
  { id: 'ar.mahermuaiqly', name: 'ماهر المعيقلي' }
];

export default function SurahPage() {
  const params = useParams();
  const surahId = params.surah as string;

  const [surah, setSurah] = useState<SurahData | null>(null);
  const [tafsir, setTafsir] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTafsir, setActiveTafsir] = useState<number | null>(null);
  const [reciter, setReciter] = useState(RECITERS[0].id);
  const [fontSize, setFontSize] = useState(32);

  useEffect(() => {
    async function loadData() {
      try {
        const [textRes, tafsirRes] = await Promise.all([
          fetch(`https://api.alquran.cloud/v1/surah/${surahId}/quran-uthmani`),
          fetch(`https://api.alquran.cloud/v1/surah/${surahId}/ar.muyassar`)
        ]);
        
        const textJson = await textRes.json();
        const tafsirJson = await tafsirRes.json();
        
        setSurah(textJson.data);
        setTafsir(tafsirJson.data.ayahs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (surahId) loadData();
  }, [surahId]);

  const audioUrl = surah?.number ? `https://cdn.islamic.network/quran/audio-surah/128/${reciter}/${surah.number}.mp3` : '';

  if (loading) return (
    <div className="max-w-[1000px] mx-auto px-4 py-10 space-y-6">
      <div className="h-32 card shimmer" />
      {[...Array(5)].map((_, i) => <div key={i} className="h-24 card shimmer" />)}
    </div>
  );

  if (!surah) return <div className="text-center py-20 font-bold">حدث خطأ أثناء تحميل السورة</div>;

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-10 pb-32 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-3)] mb-6">
        <Link href="/quran" className="hover:text-[var(--gold)] transition-colors no-underline text-[var(--text-3)] font-bold">القرآن الكريم</Link>
        <ArrowRight size={13} className="rotate-180" />
        <span className="text-[var(--text-1)] font-bold">{surah.name}</span>
      </div>

      {/* Header */}
      <div className="card mb-8 p-0 bg-gradient-to-l from-[var(--surface-3)] to-[var(--surface-2)] border-[var(--border)] overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 100% 0%, var(--gold) 0%, transparent 50%)' }} />
        <div className="p-8 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-black text-[var(--gold)] mb-4" style={{ fontFamily: 'Amiri, serif' }}>
            {surah.name}
          </h1>
          <p className="text-[var(--text-2)] font-bold text-sm md:text-base flex items-center justify-center gap-2">
            <span>{surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
            <span className="text-[var(--gold)]">•</span>
            <span>آياتها {surah.numberOfAyahs}</span>
            <span className="text-[var(--gold)]">•</span>
            <span className="font-sans" dir="ltr">{surah.englishName}</span>
          </p>
          
          {/* Quick Settings */}
          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 bg-[var(--surface)] px-4 py-2 rounded-xl border border-[var(--border)] shadow-sm">
              <span className="text-xs font-bold text-[var(--text-2)]">حجم الخط:</span>
              <button onClick={() => setFontSize(Math.max(20, fontSize - 4))} className="w-8 h-8 flex items-center justify-center bg-[var(--surface-2)] rounded-lg font-bold hover:text-[var(--gold)] border-none cursor-pointer">-</button>
              <span className="text-sm font-bold w-6 text-center">{fontSize}</span>
              <button onClick={() => setFontSize(Math.min(60, fontSize + 4))} className="w-8 h-8 flex items-center justify-center bg-[var(--surface-2)] rounded-lg font-bold hover:text-[var(--gold)] border-none cursor-pointer">+</button>
            </div>
            <a href={audioUrl} target="_blank" rel="noreferrer" download 
               className="flex items-center gap-2 bg-[var(--surface)] px-4 py-2 rounded-xl border border-[var(--border)] shadow-sm text-[var(--text-1)] hover:text-[var(--gold)] transition-colors no-underline text-xs font-bold">
              <Download size={14} /> تحميل السورة
            </a>
          </div>
        </div>
      </div>

      {/* Bismillah */}
      {surah.number !== 1 && surah.number !== 9 && (
        <div className="text-center mb-10 text-2xl md:text-4xl text-[var(--gold)] font-bold" style={{ fontFamily: 'Amiri, serif' }}>
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </div>
      )}

      {/* Ayahs */}
      <div className="space-y-6">
        {surah.ayahs.map((ayah) => {
          // Remove Bismillah from the first verse if it's not Al-Fatiha
          let text = ayah.text;
          if (ayah.numberInSurah === 1 && surah.number !== 1) {
            text = text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '').trim();
          }

          return (
            <div key={ayah.number} className="card p-6 bg-[var(--surface)] hover:border-[var(--gold)]/30 transition-all">
              <div className="flex items-start justify-between gap-4 flex-col lg:flex-row">
                <div className="w-full text-right leading-[2.5]" style={{ fontSize: `${fontSize}px`, fontFamily: 'Amiri, serif' }}>
                  {text} 
                  <span className="inline-flex items-center justify-center w-auto min-w-[2.5rem] h-10 px-2 mx-2 text-sm font-sans font-bold text-[var(--text-2)] bg-[var(--surface-2)] rounded-full translate-y-[-5px]">
                    {ayah.numberInSurah}
                  </span>
                </div>
                
                <button onClick={() => setActiveTafsir(activeTafsir === ayah.number ? null : ayah.number)} 
                   className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-[var(--text-3)] hover:text-[var(--gold)] transition-colors border border-[var(--border)] px-3 py-1.5 rounded-lg bg-transparent cursor-pointer">
                  التفسير <ChevronRight size={14} className={`transition-transform ${activeTafsir === ayah.number ? '-rotate-90' : 'rotate-90'}`} />
                </button>
              </div>

              {activeTafsir === ayah.number && (
                <div className="mt-6 p-5 bg-[var(--surface-2)] rounded-xl border border-[var(--border)] animate-fade-up">
                  <h4 className="text-sm font-bold text-[var(--gold)] flex items-center gap-2 mb-2">
                    <Info size={16} /> التفسير الميسر
                  </h4>
                  <p className="text-sm text-[var(--text-1)] leading-relaxed font-semibold">
                    {tafsir.find(t => t.number === ayah.number)?.text || 'التفسير غير متوفر'}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Audio Player */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 pointer-events-none">
        <div className="max-w-[800px] mx-auto bg-[rgba(var(--surface-rgb),0.9)] backdrop-blur-xl border border-[var(--border)] rounded-2xl p-4 shadow-2xl pointer-events-auto flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">
          
          <div className="flex-1 w-full md:w-auto">
            <audio src={audioUrl} controls controlsList="nodownload" className="w-full h-10" />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <div className="relative">
              <select 
                value={reciter} 
                onChange={(e) => setReciter(e.target.value)}
                className="appearance-none bg-[var(--surface-2)] border border-[var(--border)] rounded-xl py-2 pl-8 pr-4 text-xs font-bold text-[var(--text-1)] focus:outline-none focus:border-[var(--gold)] cursor-pointer"
              >
                {RECITERS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              <Settings2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)] pointer-events-none" />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
