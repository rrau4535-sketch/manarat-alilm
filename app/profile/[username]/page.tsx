'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import { CATEGORIES } from '@/types';
import VideoCard from '@/components/video/VideoCard';
import { Video, Radio, Shield, Clock, Trash2, ChevronLeft, ArrowRight, Settings, X, Lock, User } from 'lucide-react';
import Link from 'next/link';

interface HistoryItem {
  id: string; title: string; youtube_url: string;
  category: string; thumbnail: string; watchedAt: string;
}

function getThumb(url: string, thumb: string) {
  if (thumb) return thumb;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : '';
}

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { profile: currentUser } = useAuth();

  const [pageUser, setPageUser] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const isOwnProfile = currentUser?.username === username;
  const isPublisher = ['publisher', 'admin'].includes(pageUser?.role ?? '');
  const isAdmin = pageUser?.role === 'admin';

  const [showSettings, setShowSettings] = useState(false);
  const [newName, setNewName] = useState(username);
  const [newPassword, setNewPassword] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [settingsMsg, setSettingsMsg] = useState({ text: '', type: '' });
  const [saving, setSaving] = useState(false);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSettingsMsg({ text: '', type: '' });
    const supabase = createClient();
    
    if (newPassword) {
      if (newPassword !== pwdConfirm) {
        setSettingsMsg({ text: 'كلمة المرور غير متطابقة', type: 'error' });
        setSaving(false);
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setSettingsMsg({ text: error.message, type: 'error' });
        setSaving(false);
        return;
      }
    }
    
    if (newName && newName !== username && currentUser?.id) {
      const { error } = await supabase.from('profiles').update({ username: newName }).eq('id', currentUser.id);
      if (error) {
        setSettingsMsg({ text: 'هذا الاسم مستخدم بالفعل أو حدث خطأ', type: 'error' });
        setSaving(false);
        return;
      }
      window.location.href = `/profile/${newName}`;
      return; 
    }
    
    setSettingsMsg({ text: 'تم الحفظ بنجاح', type: 'success' });
    setNewPassword('');
    setPwdConfirm('');
    setSaving(false);
  }

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data: pu } = await supabase
        .from('profiles').select('*').eq('username', username).single();
      if (!pu) { setNotFound(true); setLoading(false); return; }
      setPageUser(pu);

      if (['publisher', 'admin'].includes(pu.role)) {
        const { data: vids } = await supabase
          .from('videos').select('*').eq('created_by', pu.id)
          .order('created_at', { ascending: false });
        setVideos(vids || []);
      }
      setLoading(false);
    }
    load();

    try {
      const raw = localStorage.getItem('watch_history');
      if (raw) setHistory(JSON.parse(raw).slice(0, 8));
    } catch {}
  }, [username]);

  if (loading) return (
    <div className="max-w-[1000px] mx-auto px-4 py-10 space-y-4">
      <div className="card h-48 shimmer" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="card h-40 shimmer" />)}
      </div>
    </div>
  );

  if (notFound) return (
    <div className="text-center py-32">
      <p className="text-5xl mb-4">👤</p>
      <h2 className="text-xl font-bold text-[var(--text-1)] mb-4">المستخدم غير موجود</h2>
      <Link href="/" className="btn-primary py-2 px-5 text-sm">الرئيسية</Link>
    </div>
  );

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-10">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-3)] mb-6">
        <Link href="/" className="hover:text-[var(--gold)] transition-colors no-underline text-[var(--text-3)] font-bold">الرئيسية</Link>
        <ArrowRight size={13} className="rotate-180" />
        <span className="text-[var(--text-1)] font-bold">{username}</span>
      </div>

      {/* بطاقة البروفيل */}
      <div className="card mb-8 p-0 overflow-hidden bg-[var(--surface-2)] border-none">
        <div className="h-28 bg-gradient-to-l from-[var(--surface-3)] to-[var(--gold-dim)]" />
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-12 mb-4 flex-wrap gap-3">
            <div className="w-20 h-20 bg-[var(--gold)] rounded-2xl border-4 border-[var(--surface)]
                            flex items-center justify-center shadow-lg">
              <span className="text-3xl font-black text-white">
                {username[0].toUpperCase()}
              </span>
            </div>
            {isOwnProfile && (
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setShowSettings(true)}
                  className="flex items-center gap-1.5 text-sm font-bold text-[var(--text-1)]
                             border border-[var(--border)] hover:bg-[var(--surface-3)] px-4 py-2 rounded-xl transition-colors cursor-pointer bg-transparent">
                  <Settings size={15} /> الإعدادات
                </button>
                {isPublisher && (
                  <>
                    <Link href="/admin?tab=add" className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5 no-underline">
                      <Video size={15} /> إضافة فيديو
                    </Link>
                    {isAdmin && (
                      <>
                        <Link href="/admin?tab=live"
                          className="flex items-center gap-1.5 text-sm font-bold text-red-500
                                     border border-red-500/20 hover:bg-red-500/10 px-4 py-2 rounded-xl transition-colors no-underline">
                          <Radio size={15} /> بث
                        </Link>
                        <Link href="/admin?tab=manage"
                          className="flex items-center gap-1.5 text-sm font-bold text-[var(--text-2)]
                                     border border-[var(--border)] hover:bg-[var(--surface-3)] px-4 py-2 rounded-xl transition-colors no-underline">
                          <Shield size={15} /> إدارة
                        </Link>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          <h1 className="text-2xl font-black text-[var(--text-1)]">{username}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
              isAdmin ? 'bg-[var(--gold)] text-white' :
              isPublisher ? 'bg-emerald-500/10 text-emerald-500' :
              'bg-[var(--surface-3)] text-[var(--text-2)]'
            }`}>
              {isAdmin ? '🛡️ مشرف' : isPublisher ? '🎬 ناشر' : '👤 مستخدم'}
            </span>
            {isPublisher && <span className="text-xs font-semibold text-[var(--text-3)]">{videos.length} فيديو</span>}
          </div>
        </div>
      </div>

      {/* فيديوهات المنشورة */}
      {isPublisher && (
        <section className="mb-10">
          <h2 className="text-xl font-black text-[var(--text-1)] mb-5 flex items-center gap-2">
            <Video size={20} className="text-[var(--gold)]" />
            الفيديوهات المنشورة
            <span className="text-sm font-bold text-[var(--text-3)]">({videos.length})</span>
          </h2>
          {videos.length === 0 ? (
            <div className="card text-center py-12 text-[var(--text-3)] bg-[var(--surface-2)] border-none">
              <Video size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-bold">لا توجد فيديوهات منشورة بعد</p>
              {isOwnProfile && (
                <Link href="/admin?tab=add" className="btn-primary text-sm mt-4 inline-block px-5 py-2 no-underline">
                  أضف أول فيديو
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {videos.map((video, i) => (
                <div key={video.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <VideoCard video={video} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* سجل المشاهدة - لصاحب البروفيل فقط */}
      {isOwnProfile && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-[var(--text-1)] flex items-center gap-2">
              <Clock size={20} className="text-[var(--gold)]" />
              سجل المشاهدة
            </h2>
            {history.length > 0 && (
              <div className="flex items-center gap-3">
                <Link href="/history" className="text-sm text-[var(--gold)] hover:text-[var(--gold-2)] no-underline hover:underline flex items-center gap-1 font-bold">
                  عرض الكل <ChevronLeft size={14} />
                </Link>
                <button onClick={() => { localStorage.removeItem('watch_history'); setHistory([]); }}
                  className="text-sm text-red-500 hover:text-red-400 flex items-center gap-1 transition-colors font-bold bg-transparent border-none cursor-pointer">
                  <Trash2 size={14} /> مسح
                </button>
              </div>
            )}
          </div>

          {history.length === 0 ? (
            <div className="card text-center py-12 text-[var(--text-3)] bg-[var(--surface-2)] border-none">
              <Clock size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-bold">لم تشاهد أي فيديو بعد</p>
              <Link href="/" className="btn-primary text-sm mt-4 inline-block px-5 py-2 no-underline">تصفح الفيديوهات</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {history.map((item) => {
                const cat = CATEGORIES[item.category as keyof typeof CATEGORIES];
                return (
                  <div key={`${item.id}-${item.watchedAt}`} className="card p-3 hover:shadow-[var(--sh-sm)] transition-all bg-[var(--surface-2)] border-[var(--border)]">
                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-[var(--surface-3)] mb-2 relative">
                      <img src={getThumb(item.youtube_url, item.thumbnail)} alt={item.title}
                        className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <p className="text-xs font-bold text-[var(--text-1)] line-clamp-2 leading-relaxed">{item.title}</p>
                    <p className="text-[10px] text-[var(--text-3)] font-bold mt-1.5 flex items-center gap-1">{cat?.icon} {cat?.label}</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowSettings(false)}>
          <div className="bg-[var(--surface)] text-[var(--text-1)] border border-[var(--border)] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Settings className="text-[var(--gold)]" size={20} /> إعدادات الحساب
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-[var(--text-3)] hover:text-[var(--text-1)] bg-transparent border-none cursor-pointer p-1">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={saveSettings} className="p-5 space-y-4">
              {settingsMsg.text && (
                <div className={`p-3 rounded-lg text-sm font-bold mb-4 ${settingsMsg.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  {settingsMsg.text}
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[var(--text-2)] flex items-center gap-1.5">
                  <User size={14} /> اسم المستخدم
                </label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--text-1)] focus:outline-none focus:border-[var(--gold)] transition-colors" />
              </div>
              
              <div className="pt-3 border-t border-[var(--border)] space-y-4">
                <p className="text-xs text-[var(--text-3)] font-bold mb-2">تغيير كلمة المرور (اختياري)</p>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[var(--text-2)] flex items-center gap-1.5">
                    <Lock size={14} /> كلمة المرور الجديدة
                  </label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={6}
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--text-1)] focus:outline-none focus:border-[var(--gold)] transition-colors" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[var(--text-2)] flex items-center gap-1.5">
                    <Lock size={14} /> تأكيد كلمة المرور
                  </label>
                  <input type="password" value={pwdConfirm} onChange={e => setPwdConfirm(e.target.value)} minLength={6}
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--text-1)] focus:outline-none focus:border-[var(--gold)] transition-colors" />
                </div>
              </div>
              
              <div className="pt-2">
                <button type="submit" disabled={saving || (!newPassword && newName === username)}
                  className="w-full btn-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving ? <div className="w-5 h-5 border-2 border-[var(--bg)] border-t-transparent rounded-full animate-spin" /> : 'حفظ التغييرات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
