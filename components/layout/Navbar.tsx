'use client';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { Radio, Clock, LogOut, Shield, Search, Menu, X, BarChart2, Moon, Sun, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

export default function Navbar() {
  const { profile, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const canPublish = profile?.role === 'publisher' || profile?.role === 'admin';

  useEffect(() => setMounted(true), []);

  async function logout() {
    await createClient().auth.signOut();
    setMenuOpen(false);
    router.push('/');
    router.refresh();
  }

  const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/search', label: 'اكتشف', icon: Search },
    { href: '/quran', label: 'القرآن', icon: BookOpen },
    { href: '/live', label: 'بث مباشر', icon: Radio, red: true },
  ];

  return (
    <>
      {/* ─── NAV ─── */}
      <nav className="sticky top-0 z-50 bg-[rgba(var(--surface-rgb),0.92)] backdrop-blur-md border-b border-[var(--border)] shadow-[0_1px_0_rgba(0,0,0,0.05)] transition-colors duration-300">
        <div className="max-w-[1200px] mx-auto px-4 h-[52px] flex items-center justify-between gap-3">

          {/* Logo */}
          <Link href="/" className="no-underline flex items-center gap-2 shrink-0">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg object-cover shadow-sm bg-[var(--surface-3)]" />
            <span className="font-black text-[14px] text-[var(--text-1)] tracking-tight hidden sm:block">
              منصة الدعوة
            </span>
          </Link>

          {/* Center — Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon, red }) => (
              <Link key={href} href={href}
                className={`nav-item ${pathname === href ? 'active' : ''} ${red ? 'text-red-500 font-bold' : ''}`}
              >
                {Icon && <Icon size={13} className={red ? 'animate-pulse' : ''} />}
                {label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-1">

            <Link href="/search" className="nav-item md:hidden"><Search size={16} /></Link>
            <Link href="/history" className="nav-item hidden sm:inline-flex"><Clock size={14} /></Link>

            {ready && canPublish && (
              <Link href="/admin" className="nav-item hidden sm:inline-flex text-[var(--gold)] font-bold">
                <Shield size={14} />
                <span className="hidden lg:inline">{profile?.role === 'admin' ? 'الإدارة' : 'نشر'}</span>
              </Link>
            )}
            {ready && profile?.role === 'admin' && (
              <Link href="/admin/stats" className="nav-item hidden sm:inline-flex">
                <BarChart2 size={14} />
              </Link>
            )}

            <div suppressHydrationWarning>
              {!ready ? (
                <div className="shimmer rounded-full w-7 h-7" />
              ) : profile ? (
                <div className="flex items-center gap-1">
                  <Link href={`/profile/${profile.username}`} className="nav-item flex items-center gap-2">
                    <div className="w-[26px] h-[26px] rounded-full bg-[var(--text-1)] flex items-center justify-center text-[var(--bg)] font-black text-[11px] shrink-0 transition-colors">
                      {profile.username[0].toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-xs font-bold max-w-[70px] truncate">
                      {profile.username}
                    </span>
                  </Link>
                  <button onClick={logout} className="nav-item hidden sm:inline-flex !text-red-500 hover:!bg-red-500/10">
                    <LogOut size={13} />
                  </button>
                </div>
              ) : (
                <Link href="/auth" className="btn-primary py-1.5 px-3.5 text-xs">
                  دخول
                </Link>
              )}
            </div>

            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="nav-item"
                aria-label="Toggle Dark Mode"
              >
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            )}

            {/* Mobile menu toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="nav-item md:hidden">
              {menuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Mobile Menu ─── */}
      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}>
          <div className="absolute top-[52px] left-0 right-0 bg-[var(--surface)] border-b border-[var(--border)] p-2.5 shadow-xl" onClick={e => e.stopPropagation()}>
            {[
              { href: '/', label: 'الرئيسية' },
              { href: '/quran', label: 'القرآن الكريم' },
              { href: '/search', label: 'اكتشف' },
              { href: '/live', label: 'بث مباشر' },
              { href: '/history', label: 'سجل المشاهدة' },
              ...(canPublish ? [{ href: '/admin', label: profile?.role === 'admin' ? 'الإدارة' : 'نشر محتوى' }] : []),
            ].map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                className="nav-item flex w-full p-2.5 text-[13px]">
                {label}
              </Link>
            ))}
            {profile && (
              <button onClick={logout} className="nav-item flex w-full p-2.5 text-[13px] !text-red-500 hover:!bg-red-500/10 mt-1">
                تسجيل الخروج
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
