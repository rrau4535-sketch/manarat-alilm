'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Bookmark } from 'lucide-react';

export default function BookmarkButton({ videoId, userId }: { videoId: string, userId: string }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function check() {
      const { data } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('video_id', videoId)
        .eq('user_id', userId)
        .maybeSingle();
      if (data) setIsBookmarked(true);
      setLoading(false);
    }
    check();
  }, [videoId, userId, supabase]);

  async function toggle() {
    if (loading) return;
    setLoading(true);
    
    if (isBookmarked) {
      await supabase.from('bookmarks').delete().eq('video_id', videoId).eq('user_id', userId);
      setIsBookmarked(false);
    } else {
      await supabase.from('bookmarks').insert({ video_id: videoId, user_id: userId });
      setIsBookmarked(true);
    }
    
    setLoading(false);
  }

  return (
    <button 
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors ${
        isBookmarked 
          ? 'bg-[var(--gold)] text-white border-[var(--gold)] hover:bg-[var(--gold-2)]' 
          : 'bg-transparent text-[var(--text-2)] border-[var(--border)] hover:bg-[var(--surface-3)]'
      } disabled:opacity-50`}
    >
      <Bookmark size={16} className={isBookmarked ? 'fill-current' : ''} />
      {isBookmarked ? 'محفوظ' : 'حفظ للشاهد لاحقاً'}
    </button>
  );
}
