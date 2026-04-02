'use client';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import { Radio, Users, Send, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function toEmbed(url: string) {
  if (!url) return '';
  if (url.includes('/embed/')) return url;
  const m = url.match(/(?:v=|youtu\.be\/|live\/|shorts\/)([^&?#\n]+)/);
  return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1` : url;
}

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return 'الآن';
  if (diff < 3600) return `${Math.floor(diff/60)} د`;
  return `${Math.floor(diff/3600)} س`;
}

interface ChatMsg { id: string; username: string; message: string; created_at: string; }
interface Stream { id: string; stream_url: string; title: string; is_active: boolean; created_by?: string; }

export default function LivePage() {
  const { profile } = useAuth();
  const [stream, setStream] = useState<Stream | null>(null);
  const [streamer, setStreamer] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewers, setViewers] = useState(0);
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const channelsRef = useRef<any[]>([]);

  useEffect(() => {
    const sb = createClient();

    async function load() {
      const { data: streamData } = await sb
        .from('live_stream').select('*').eq('is_active', true).maybeSingle();
      setStream(streamData);

      if (streamData?.created_by) {
        const { data: p } = await sb.from('profiles').select('username').eq('id', streamData.created_by).single();
        if (p) setStreamer(p.username);
      }

      if (streamData?.id) {
        const { data: msgs } = await sb.from('live_chat')
          .select('*').eq('stream_id', streamData.id)
          .order('created_at', { ascending: true }).limit(100);
        setChat(msgs || []);

        const randomId = Math.random().toString(36).slice(2);
        const chatChannel = sb.channel(`chat:${streamData.id}_${randomId}`)
          .on('postgres_changes', {
            event: 'INSERT', schema: 'public',
            table: 'live_chat',
            filter: `stream_id=eq.${streamData.id}`
          }, (payload) => {
            setChat(prev => [...prev, payload.new as ChatMsg]);
          });
        chatChannel.subscribe();
        channelsRef.current.push(chatChannel);

        const presenceKey = profile?.username || `guest-${Math.random().toString(36).slice(2)}`;
        const presenceChannel = sb.channel(`presence:${streamData.id}`, {
          config: { presence: { key: presenceKey } }
        });
        presenceChannel
          .on('presence', { event: 'sync' }, () => {
            setViewers(Object.keys(presenceChannel.presenceState()).length);
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              await presenceChannel.track({ username: presenceKey, online_at: new Date().toISOString() });
            }
          });
        channelsRef.current.push(presenceChannel);
      }

      const statusRandomId = Math.random().toString(36).slice(2);
      const streamChannel = sb.channel(`stream_status_${statusRandomId}`)
        .on('postgres_changes', {
          event: 'UPDATE', schema: 'public', table: 'live_stream'
        }, (payload) => {
          if (!payload.new.is_active) setStream(null);
          else setStream(payload.new as Stream);
        });
      streamChannel.subscribe();
      channelsRef.current.push(streamChannel);

      setLoading(false);
    }

    load();

    return () => {
      const sb2 = createClient();
      channelsRef.current.forEach(ch => sb2.removeChannel(ch));
      channelsRef.current = [];
    };
  }, [profile?.username]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [chat]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!msg.trim() || !profile || !stream) return;
    setSending(true);
    await createClient().from('live_chat').insert({
      stream_id: stream.id,
      user_id: null,
      username: profile.username,
      message: msg.trim()
    });
    setMsg('');
    setSending(false);
  }

  if (loading) return (
    <div className="max-w-[1100px] mx-auto px-4 py-8">
      <div className="shimmer rounded-[14px] h-[400px]" />
    </div>
  );

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-7 min-h-screen bg-[var(--bg)] transition-colors duration-300">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stream ? 'bg-red-500' : 'bg-[var(--surface-3)]'}`}>
          <Radio size={18} color="white" className={stream ? "animate-pulse" : ""} />
        </div>
        <div className="flex-1">
          <h1 className="font-black text-lg text-[var(--text-1)]">
            {stream?.title || 'البث المباشر'}
          </h1>
          {streamer && (
            <Link href={`/profile/${streamer}`} className="text-xs text-[var(--gold)] no-underline font-bold hover:underline">
              👤 {streamer}
            </Link>
          )}
        </div>
        {stream && (
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              مباشر الآن
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[var(--surface-2)] text-[var(--text-2)] border border-[var(--border)]">
              <Users size={12} /> {viewers}
            </span>
          </div>
        )}
      </div>

      {stream ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Player */}
          <div className="lg:col-span-2 relative">
            <div className="card p-0 overflow-hidden bg-black border-none ring-1 ring-[var(--border)]">
              <div className="relative pt-[56.25%] bg-black">
                <iframe src={toEmbed(stream.stream_url)} title={stream.title}
                  className="absolute inset-0 w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen />
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 mt-3 rounded-lg text-xs font-medium border border-yellow-500/20 bg-yellow-500/10 text-yellow-500">
              <AlertCircle size={15} className="mt-px shrink-0" />
              شارك هذه الصفحة مع الآخرين لمتابعة البث مباشرةً.
            </div>
          </div>

          {/* Chat */}
          <div className="card p-0 overflow-hidden flex flex-col h-[480px]">
            <div className="p-3 border-b border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-between">
              <h3 className="font-extrabold text-[13px] text-[var(--text-1)] flex items-center gap-1.5">
                💬 الدردشة
              </h3>
              <span className="text-[11px] font-bold text-[var(--text-3)]">{viewers} مشاهد</span>
            </div>

            {/* Messages */}
            <div ref={chatRef} className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
              {chat.length === 0 ? (
                <p className="text-center text-[var(--text-3)] text-xs mt-6">
                  لا توجد رسائل بعد
                </p>
              ) : chat.map(m => (
                <div key={m.id} className="flex gap-2 items-start animate-fade-up">
                  <div className="w-6 h-6 rounded-full shrink-0 bg-[var(--gold)] flex items-center justify-center text-white text-[10px] font-black">
                    {m.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-1.5">
                      <Link href={`/profile/${m.username}`} className="text-[11px] font-bold text-[var(--gold)] no-underline hover:underline">
                        {m.username}
                      </Link>
                      <span className="text-[10px] text-[var(--text-3)]">{timeAgo(m.created_at)}</span>
                    </div>
                    <p className="text-xs text-[var(--text-1)] leading-relaxed mt-0.5 break-words">{m.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            {profile ? (
              <form onSubmit={sendMessage} className="p-2 border-t border-[var(--border)] flex gap-2 bg-[var(--surface)]">
                <input value={msg} onChange={e => setMsg(e.target.value)}
                  placeholder="اكتب رسالة..." maxLength={200} dir="auto"
                  className="flex-1 px-3 py-2 rounded-lg text-xs bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] outline-none focus:border-[var(--gold)] transition-colors" />
                <button type="submit" disabled={sending || !msg.trim()}
                  className="w-9 h-9 rounded-lg border-none cursor-pointer bg-[var(--gold)] text-white flex items-center justify-center hover:bg-[var(--gold-2)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <Send size={15} />
                </button>
              </form>
            ) : (
              <div className="p-3 border-t border-[var(--border)] text-center bg-[var(--surface-2)]">
                <Link href="/auth" className="text-xs text-[var(--gold)] font-bold no-underline hover:underline">
                  سجّل دخول للمشاركة في الشات
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card text-center py-16 px-6 max-w-lg mx-auto mt-10">
          <div className="w-16 h-16 rounded-full bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center mx-auto mb-5">
            <Radio size={28} className="text-[var(--text-3)]" />
          </div>
          <h2 className="font-black text-lg text-[var(--text-1)] mb-2">
            لا يوجد بث مباشر التوقيت الحالي
          </h2>
          <p className="text-[13px] text-[var(--text-3)] mb-6">
            تابع البثوث السابقة والأرشيف في صفحات المشايخ والناشرين
          </p>
          <Link href="/" className="btn-primary text-[13px]">
            العودة للرئيسية
          </Link>
        </div>
      )}
    </div>
  );
}
