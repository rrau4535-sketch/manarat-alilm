'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, User, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const DOMAIN = 'dawahapp.com';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const username = (fd.get('username') as string).trim().toLowerCase();
    const password = fd.get('password') as string;
    const sb = createClient();

    if (mode === 'login') {
      const { error } = await sb.auth.signInWithPassword({
        email: `${username}@${DOMAIN}`, password,
      });
      if (error) { setError('اسم المستخدم أو كلمة المرور غير صحيحة'); setLoading(false); return; }
      router.push(`/profile/${username}`);
    } else {
      const confirm = fd.get('confirm') as string;
      if (password !== confirm) { setError('كلمتا المرور غير متطابقتين'); setLoading(false); return; }
      if (username.length < 3) { setError('اسم المستخدم 3 أحرف على الأقل'); setLoading(false); return; }
      if (password.length < 6) { setError('كلمة المرور 6 أحرف على الأقل'); setLoading(false); return; }
      const { data: ex } = await sb.from('profiles').select('username').eq('username', username).maybeSingle();
      if (ex) { setError('اسم المستخدم محجوز'); setLoading(false); return; }
      const { error } = await sb.auth.signUp({
        email: `${username}@${DOMAIN}`, password,
        options: { data: { username, role: 'user' } },
      });
      if (error) { setError('حدث خطأ في التسجيل'); setLoading(false); return; }
      await sb.auth.signInWithPassword({ email: `${username}@${DOMAIN}`, password });
      router.push(`/profile/${username}`);
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-[var(--surface)] to-[var(--bg)]">
      <div className="w-full max-w-[400px] animate-fade-up">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block no-underline group px-4">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-20 h-20 bg-[var(--surface-3)] rounded-2xl mx-auto mb-4 shadow-[var(--sh-gold)] transition-transform group-hover:scale-105 object-cover" 
            />
            <h1 className="text-2xl font-black text-[var(--text-1)] tracking-tight">منصة الدعوة</h1>
            <p className="text-xs font-bold text-[var(--text-3)] mt-2">مرحباً بك في مجتمعنا الدعوي</p>
          </Link>
        </div>

        <div className="card p-6 sm:p-8 bg-[var(--surface-2)] border-none shadow-[var(--sh-md)]">
          <div className="flex bg-[var(--surface-3)] rounded-xl p-1 mb-8">
            {(['login','register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2.5 text-xs font-black rounded-lg transition-all border-none cursor-pointer
                  ${mode===m ? 'bg-[var(--surface)] text-[var(--text-1)] shadow-sm' : 'text-[var(--text-3)] hover:text-[var(--text-1)] bg-transparent'}`}>
                {m==='login' ? 'دخول' : 'إنشاء حساب'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-[var(--text-2)] mb-2.5 mr-1">اسم المستخدم</label>
              <div className="relative group">
                <User size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-3)] transition-colors group-focus-within:text-[var(--gold)]"/>
                <input name="username" type="text" required minLength={3} maxLength={30}
                  placeholder="أدخل اسم المستخدم" 
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3.5 pr-11 text-sm text-[var(--text-1)] outline-none focus:border-[var(--gold)] focus:ring-4 focus:ring-[var(--gold-dim)] transition-all placeholder:text-[var(--text-3)]" 
                  dir="ltr"/>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-[var(--text-2)] mb-2.5 mr-1">كلمة المرور</label>
              <div className="relative group">
                <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-3)] transition-colors group-focus-within:text-[var(--gold)]"/>
                <input name="password" type={showPass?'text':'password'} required minLength={6}
                  placeholder="كلمة المرور" 
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3.5 pr-11 pl-11 text-sm text-[var(--text-1)] outline-none focus:border-[var(--gold)] focus:ring-4 focus:ring-[var(--gold-dim)] transition-all placeholder:text-[var(--text-3)]" 
                  dir="ltr"/>
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors bg-transparent border-none cursor-pointer p-2">
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            {mode==='register' && (
              <div className="animate-fade-down duration-200">
                <label className="block text-xs font-black text-[var(--text-2)] mb-2.5 mr-1">تأكيد كلمة المرور</label>
                <div className="relative group">
                  <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-3)] transition-colors group-focus-within:text-[var(--gold)]"/>
                  <input name="confirm" type={showPass?'text':'password'} required
                    placeholder="أعد كتابة كلمة المرور" 
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3.5 pr-11 text-sm text-[var(--text-1)] outline-none focus:border-[var(--gold)] focus:ring-4 focus:ring-[var(--gold-dim)] transition-all placeholder:text-[var(--text-3)]" 
                    dir="ltr"/>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl px-4 py-3.5 text-xs font-bold animate-shake">
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-sm font-black shadow-[var(--sh-gold-sm)]">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  {mode==='login' ? 'جارٍ الدخول...' : 'جارٍ الإنشاء...'}
                </span>
              ) : mode==='login' ? 'تسجيل الدخول' : 'إنشاء الحساب'}
            </button>
          </form>

          <p className="text-center mt-8">
            <Link href="/" className="text-[var(--text-3)] hover:text-[var(--gold)] text-xs font-bold no-underline flex items-center justify-center gap-1.5 transition-colors">
              <ArrowRight size={14} /> العودة للرئيسية
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
