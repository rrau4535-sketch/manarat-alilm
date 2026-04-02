import Link from 'next/link';
import { ArrowRight, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="card bg-[var(--surface-2)] border-none text-center max-w-md w-full py-16 animate-fade-up">
        <div className="w-20 h-20 bg-[var(--surface-3)] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <SearchX size={32} className="text-[var(--gold)]" />
        </div>
        
        <h1 className="text-4xl font-black text-[var(--text-1)] mb-2">404</h1>
        <h2 className="text-xl font-bold text-[var(--text-2)] mb-6">عذراً، الصفحة غير موجودة!</h2>
        <p className="text-sm font-medium text-[var(--text-3)] mb-8 px-4">
          يبدو أن الرابط الذي تبحث عنه غير صحيح، أو تم نقل الصفحة إلى مكان آخر.
        </p>
        
        <Link href="/" className="btn-primary inline-flex items-center gap-2 py-3 px-8 text-sm font-black mx-auto">
          <ArrowRight size={16} /> العودة إلى الرئيسية
        </Link>
      </div>
    </div>
  );
}
