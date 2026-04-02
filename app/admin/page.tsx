'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import { CATEGORIES, VideoCategory } from '@/types';
import { Plus, Trash2, Radio, Youtube, Tag, Type, ArrowLeft, Square, Film, Settings, ListVideo } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const { profile, ready } = useAuth();
  const router = useRouter();
  const tab = useSearchParams().get('tab') || 'add';
  const [activeTab, setActiveTab] = useState<'add'|'manage'|'live'>(tab as any);
  const [videos, setVideos] = useState<any[]>([]);
  const [currentStream, setCurrentStream] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ok:boolean;text:string}|null>(null);

  const isAdmin = profile?.role === 'admin';
  const canPublish = profile?.role === 'publisher' || isAdmin;

  useEffect(() => {
    if (!ready) return;
    if (!profile || !canPublish) router.replace('/auth');
  }, [ready, profile]);

  useEffect(() => {
    if (!profile) return;
    const sb = createClient();
    sb.from('videos').select('*').order('created_at', {ascending: false}).then(({data}) => setVideos(data || []));
    sb.from('live_stream').select('*').order('updated_at', {ascending: false}).limit(1).maybeSingle().then(({data}) => setCurrentStream(data));
  }, [profile]);

  function toast(ok: boolean, text: string) {
    setMsg({ok, text});
    setTimeout(() => setMsg(null), 3500);
  }

  async function addVideo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const youtube_url = fd.get('youtube_url') as string;
    const m = youtube_url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (!m) { toast(false, 'رابط يوتيوب غير صحيح'); setLoading(false); return; }
    const sb = createClient();
    const { data: { session } } = await sb.auth.getSession();
    const { error } = await sb.from('videos').insert({
      title: fd.get('title'), youtube_url, category: fd.get('category'),
      thumbnail: `https://i.ytimg.com/vi/${m[1]}/maxresdefault.jpg`,
      created_by: session?.user.id
    });
    if (error) { toast(false, 'فشلت الإضافة'); }
    else {
      toast(true, '✅ تم إضافة الفيديو!');
      (e.target as HTMLFormElement).reset();
      const {data} = await sb.from('videos').select('*').order('created_at', {ascending: false});
      setVideos(data || []);
    }
    setLoading(false);
  }

  async function delVideo(id: string) {
    if (!confirm('حذف الفيديو؟')) return;
    await createClient().from('videos').delete().eq('id', id);
    setVideos(v => v.filter(x => x.id !== id));
    toast(true, 'تم الحذف');
  }

  async function saveLive(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const is_active = (e.currentTarget.querySelector('#is_active') as HTMLInputElement)?.checked;
    const sb = createClient();
    const { data: { session } } = await sb.auth.getSession();
    
    let stream_url = fd.get('stream_url') as string;
    if (!stream_url.includes('/embed/')) {
      const m = stream_url.match(/(?:v=|youtu\.be\/|live\/)([^&?#\n]+)/);
      if (m) stream_url = `https://www.youtube.com/embed/${m[1]}`;
    }

    const payload = {
      stream_url, title: fd.get('title'), is_active,
      created_by: session?.user.id,
      updated_at: new Date().toISOString(),
      ended_at: !is_active ? new Date().toISOString() : null
    };

    if (currentStream) {
      await sb.from('live_stream').update(payload).eq('id', currentStream.id);
    } else {
      await sb.from('live_stream').insert(payload);
    }
    
    const {data} = await sb.from('live_stream').select('*').order('updated_at', {ascending: false}).limit(1).maybeSingle();
    setCurrentStream(data);
    toast(true, is_active ? '🔴 البث شغّال الآن!' : '⏹️ تم إيقاف البث وحفظه');
    setLoading(false);
  }

  async function stopLive() {
    if (!currentStream || !confirm('إيقاف البث الآن؟')) return;
    const sb = createClient();
    await sb.from('live_stream').update({
      is_active: false,
      ended_at: new Date().toISOString()
    }).eq('id', currentStream.id);
    setCurrentStream({...currentStream, is_active: false, ended_at: new Date().toISOString()});
    toast(true, '⏹️ تم إيقاف البث وحفظه في السجل');
  }

  if (!ready) return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-10 h-10 border-4 border-[var(--gold-dim)] border-t-[var(--gold)] rounded-full animate-spin" />
    </div>
  );
  if (!profile || !canPublish) return null;

  return (
    <div className="max-w-[900px] mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-10 pb-6 border-b border-[var(--border)]">
        <Link href={`/profile/${profile.username}`}
          className="w-11 h-11 bg-[var(--surface-3)] hover:bg-[var(--gold-dim)] rounded-xl flex items-center justify-center transition-all no-underline group shadow-sm">
          <ArrowLeft size={20} className="text-[var(--text-2)] group-hover:text-[var(--gold)]"/>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-[var(--text-1)] tracking-tight">
            {isAdmin ? '⚙️ لوحة التحكم' : '🎬 نشر المحتوى'}
          </h1>
          <p className="text-sm font-bold text-[var(--text-3)]">مرحباً {profile.username}، بإمكانك إدارة المنصة من هنا</p>
        </div>
        {currentStream?.is_active && (
          <span className="hidden sm:flex bg-red-500/10 text-red-500 text-[10px] font-black px-4 py-2 rounded-full items-center gap-2 border border-red-500/20 shadow-sm animate-pulse">
            <span className="w-2 h-2 bg-red-500 rounded-full"/> بث مباشر نشط
          </span>
        )}
      </div>

      {msg && (
        <div className={`mb-8 p-4 rounded-2xl text-xs font-black shadow-sm animate-fade-down ${
          msg.ok ? 'bg-green-500/10 border border-green-500/20 text-green-500'
                 : 'bg-red-500/10 border border-red-500/20 text-red-500'}`}>
          {msg.text}
        </div>
      )}

      <div className="flex bg-[var(--surface-2)] rounded-2xl p-1.5 mb-10 gap-1.5 shadow-sm">
        <button onClick={() => setActiveTab('add')}
          className={`flex-1 py-3 text-xs font-black rounded-xl transition-all border-none cursor-pointer flex items-center justify-center gap-2 ${activeTab==='add'?'bg-[var(--surface)] text-[var(--gold)] shadow-sm':'text-[var(--text-3)] hover:text-[var(--text-1)] bg-transparent'}`}>
          <Plus size={16}/> إضافة فيديو
        </button>
        {isAdmin && <>
          <button onClick={() => setActiveTab('manage')}
            className={`flex-1 py-3 text-xs font-black rounded-xl transition-all border-none cursor-pointer flex items-center justify-center gap-2 ${activeTab==='manage'?'bg-[var(--surface)] text-[var(--gold)] shadow-sm':'text-[var(--text-3)] hover:text-[var(--text-1)] bg-transparent'}`}>
            <ListVideo size={16}/> الفيديوهات ({videos.length})
          </button>
          <button onClick={() => setActiveTab('live')}
            className={`flex-1 py-3 text-xs font-black rounded-xl transition-all border-none cursor-pointer flex items-center justify-center gap-2 ${activeTab==='live'?'bg-[var(--surface)] text-[var(--gold)] shadow-sm':'text-[var(--text-3)] hover:text-[var(--text-1)] bg-transparent'}`}>
            <Radio size={16}/> البث {currentStream?.is_active ? '●' : ''}
          </button>
        </>}
      </div>

      <div className="animate-fade-up">
        {activeTab === 'add' && (
          <div className="card bg-[var(--surface-2)] border-none p-6 sm:p-8">
            <h2 className="font-black text-[var(--text-1)] mb-8 flex items-center gap-3">
              <Youtube size={22} className="text-red-500"/> إضافة فيديو يوتيوب جديد
            </h2>
            <form onSubmit={addVideo} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-[var(--text-2)] mb-3 mr-1">عنوان الفيديو</label>
                <input name="title" type="text" required placeholder="اكتب عنواناً جذاباً للفيديو" 
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-sm text-[var(--text-1)] outline-none focus:border-[var(--gold)] focus:ring-4 focus:ring-[var(--gold-dim)] transition-all"/>
              </div>
              <div>
                <label className="block text-xs font-black text-[var(--text-2)] mb-3 mr-1">رابط YouTube</label>
                <input name="youtube_url" type="url" required dir="ltr"
                  placeholder="https://www.youtube.com/watch?v=..." 
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-sm text-[var(--text-1)] outline-none focus:border-[var(--gold)] focus:ring-4 focus:ring-[var(--gold-dim)] transition-all"/>
              </div>
              <div>
                <label className="block text-xs font-black text-[var(--text-2)] mb-3 mr-1">التصنيف الدعوي</label>
                <select name="category" required 
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-sm text-[var(--text-1)] outline-none focus:border-[var(--gold)] focus:ring-4 focus:ring-[var(--gold-dim)] transition-all cursor-pointer">
                  <option value="">-- اختر التصنيف المناسب --</option>
                  {Object.entries(CATEGORIES).map(([k,v]) => (
                    <option key={k} value={k}>{v.icon} {v.label}</option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-4 flex items-center justify-center gap-3 text-sm font-black shadow-[var(--sh-gold-sm)]">
                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Plus size={20}/>}
                {loading ? 'جارٍ الحفظ...' : 'نشر الفيديو الآن'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'manage' && isAdmin && (
          <div className="space-y-4">
            {videos.length === 0
              ? <div className="card bg-[var(--surface-2)] border-none text-center py-20 text-[var(--text-3)] font-bold">
                  <Film size={40} className="mx-auto mb-4 opacity-20"/>
                  <p>لا توجد فيديوهات منشورة حالياً</p>
                </div>
              : videos.map(v => {
                const cat = CATEGORIES[v.category as VideoCategory];
                return (
                  <div key={v.id} className="card bg-[var(--surface-2)] border-none flex items-center gap-4 p-3 pr-4 group hover:shadow-[var(--sh-sm)] transition-all">
                    <div className="w-24 h-14 rounded-xl overflow-hidden bg-[var(--surface-3)] flex-shrink-0 relative">
                      <img src={v.thumbnail} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm text-[var(--text-1)] truncate mb-1">{v.title}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[var(--gold)] bg-[var(--gold-dim)] px-2 py-0.5 rounded-full">{cat?.label}</span>
                        <span className="text-[10px] font-bold text-[var(--text-3)] opacity-60">
                          {new Date(v.created_at).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => delVideo(v.id)}
                      className="w-10 h-10 flex items-center justify-center text-[var(--text-3)] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all bg-transparent border-none cursor-pointer">
                      <Trash2 size={18}/>
                    </button>
                  </div>
                );
              })
            }
          </div>
        )}

        {activeTab === 'live' && isAdmin && (
          <div className="space-y-6">
            {currentStream?.is_active && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex items-center justify-between shadow-sm animate-pulse">
                <div>
                  <p className="font-black text-red-500 flex items-center gap-2 text-sm">
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"/> بث مباشر حالي
                  </p>
                  <p className="text-xs font-bold text-[var(--text-1)] mt-2 opacity-80">{currentStream.title}</p>
                </div>
                <button onClick={stopLive}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-xs font-black px-5 py-2.5 rounded-xl transition-all border-none cursor-pointer shadow-lg shadow-red-500/20">
                  <Square size={14}/> إيقاف البث
                </button>
              </div>
            )}

            <div className="card bg-[var(--surface-2)] border-none p-6 sm:p-8">
              <h2 className="font-black text-[var(--text-1)] mb-8 flex items-center gap-3">
                <Radio size={22} className="text-red-500"/>
                {currentStream?.is_active ? 'تعديل بيانات البث' : 'تجهيز بث مباشر جديد'}
              </h2>
              <form onSubmit={saveLive} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-[var(--text-2)] mb-3 mr-1">عنوان البث</label>
                  <input name="title" type="text" defaultValue={currentStream?.title || ''}
                    placeholder="اكتب عنواناً وجيهاً للبث المباشر" 
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-sm text-[var(--text-1)] outline-none focus:border-[var(--gold)] focus:ring-4 focus:ring-[var(--gold-dim)] transition-all"/>
                </div>
                <div>
                  <label className="block text-xs font-black text-[var(--text-2)] mb-3 mr-1">رابط YouTube Livestream</label>
                  <input name="stream_url" type="url" required dir="ltr"
                    defaultValue={currentStream?.stream_url || ''}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-sm text-[var(--text-1)] outline-none focus:border-[var(--gold)] focus:ring-4 focus:ring-[var(--gold-dim)] transition-all"/>
                  <p className="text-[10px] font-bold text-[var(--text-3)] mt-2 mr-1">💡 النظام سيقوم بتحويل الرابط تلقائياً لمشغل مباشر</p>
                </div>
                
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl transition-colors hover:border-[var(--gold)]">
                  <input type="checkbox" id="is_active" defaultChecked={currentStream?.is_active}
                    className="w-5 h-5 accent-[var(--gold)] rounded-lg cursor-pointer"/>
                  <span className="text-sm font-black text-[var(--text-1)]">تفعيل البث للجمهور فوراً</span>
                </label>

                <button type="submit" disabled={loading}
                  className="btn-primary w-full py-4 flex items-center justify-center gap-3 text-sm font-black shadow-[var(--sh-gold-sm)]">
                  {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Radio size={20}/>}
                  {loading ? 'جارٍ الحفظ...' : 'حفظ ونشر الإعدادات'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
