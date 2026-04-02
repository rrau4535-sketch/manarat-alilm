'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import { Send, MessageSquare, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: { username: string };
  user_id: string;
}

export default function CommentsSection({ videoId }: { videoId: string }) {
  const { profile } = useAuth();
  const supabase = createClient();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('comments')
        .select(`
          id, content, created_at, user_id,
          user:profiles(username)
        `)
        .eq('video_id', videoId)
        .order('created_at', { ascending: false });
      
      if (data) setComments(data as unknown as Comment[]);
      setLoading(false);
    }
    load();
  }, [videoId, supabase]);

  async function postComment(e: React.FormEvent) {
    e.preventDefault();
    if (!msg.trim() || !profile) return;
    setSending(true);

    const { data, error } = await supabase.from('comments').insert({
      video_id: videoId,
      user_id: profile.id,
      content: msg.trim()
    }).select(`
      id, content, created_at, user_id,
      user:profiles(username)
    `).single();

    if (data && !error) {
      setComments(prev => [data as unknown as Comment, ...prev]);
      setMsg('');
    }
    setSending(false);
  }

  async function deleteComment(id: string) {
    if (!confirm('حذف التعليق؟')) return;
    await supabase.from('comments').delete().eq('id', id);
    setComments(prev => prev.filter(c => c.id !== id));
  }

  return (
    <div className="flex flex-col h-full bg-[var(--surface-2)] rounded-xl border border-[var(--border)] overflow-hidden">
      <div className="p-4 border-b border-[var(--border)] bg-[var(--surface)] flex items-center justify-between">
        <h3 className="font-black text-[var(--text-1)] flex items-center gap-2">
          <MessageSquare size={18} className="text-[var(--gold)]" /> التعليقات
        </h3>
        <span className="text-xs font-bold text-[var(--text-3)]">{comments.length} تعليق</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px]">
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-16 rounded-lg shimmer w-full" />)}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10 text-[var(--text-3)]">
            <MessageSquare size={30} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-bold">لا توجد تعليقات بعد.</p>
            <p className="text-xs mt-1">كُن أول من يعلق!</p>
          </div>
        ) : (
          comments.map(c => (
            <div key={c.id} className="flex gap-3 items-start animate-fade-up">
              <div className="w-8 h-8 rounded-full bg-[var(--surface-3)] text-[var(--text-1)] border border-[var(--border)] font-black flex items-center justify-center text-xs shrink-0">
                {c.user?.username?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[var(--text-1)]">{c.user?.username || 'مجهول'}</span>
                    <span className="text-[10px] font-bold text-[var(--text-3)]">
                      {new Date(c.created_at).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  {(profile?.id === c.user_id || profile?.role === 'admin') && (
                    <button onClick={() => deleteComment(c.id)} className="text-[var(--text-3)] hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer p-0">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-[var(--text-2)] leading-relaxed break-words whitespace-pre-wrap">{c.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {profile ? (
        <form onSubmit={postComment} className="p-3 border-t border-[var(--border)] bg-[var(--surface)] flex gap-2">
          <textarea 
            value={msg} 
            onChange={e => setMsg(e.target.value)}
            placeholder="أضف تعليقاً..." 
            dir="auto"
            rows={1}
            className="flex-1 bg-[var(--surface-2)] text-[var(--text-1)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none resize-none focus:border-[var(--gold)] transition-colors placeholder:text-[var(--text-3)]"
          />
          <button 
            type="submit" 
            disabled={sending || !msg.trim()}
            className="w-10 rounded-lg bg-[var(--gold)] text-white flex items-center justify-center cursor-pointer border-none disabled:opacity-50 transition-opacity hover:opacity-90 shrink-0"
          >
            <Send size={16} />
          </button>
        </form>
      ) : (
        <div className="p-4 border-t border-[var(--border)] text-center bg-[var(--surface)]">
          <p className="text-xs text-[var(--text-3)] mb-2 font-bold">سجّل دخولك لإضافة تعليق</p>
          <Link href="/auth" className="btn-primary py-1.5 px-4 text-xs inline-block no-underline">
            تسجيل الدخول
          </Link>
        </div>
      )}
    </div>
  );
}
