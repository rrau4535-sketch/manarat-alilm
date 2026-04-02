import { Cairo } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import AuthProvider from '@/components/providers/AuthProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import Link from 'next/link';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
});

export const metadata = {
  title: { default: 'منصة الدعوة', template: '%s | منصة الدعوة' },
  description: 'منصة إسلامية للدعوة والرد على الشبهات',
  manifest: '/manifest.json',
  icons: { icon: '/logo.png', apple: '/logo.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable} suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-[var(--bg)] text-[var(--text-1)] min-h-screen transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <Navbar />
            <main>{children}</main>
            <footer className="mt-[60px] py-5 px-4 border-t border-[var(--border)] bg-[var(--surface)] transition-colors duration-300">
              <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="Logo" className="w-[28px] h-[28px] rounded-lg object-cover shadow-sm bg-[var(--surface-3)]" />
                  <span className="text-xs font-bold text-[var(--text-3)]">
                    © {new Date().getFullYear()} منصة الدعوة
                  </span>
                </div>
                <div className="flex gap-[18px]">
                  {[{ href: '/about', label: 'من نحن' }, { href: '/search', label: 'البحث' }, { href: '/live', label: 'بث مباشر' }].map(({ href, label }) => (
                    <Link key={href} href={href} className="text-[11px] font-semibold text-[var(--text-3)] no-underline hover:text-[var(--text-1)] transition-colors">
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </footer>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
