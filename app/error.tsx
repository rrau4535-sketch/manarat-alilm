'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">⚠️</span>
        </div>
        <h2 className="text-2xl font-bold text-[#2C3E50] mb-3">حدث خطأ غير متوقع</h2>
        <p className="text-gray-500 mb-8">
          نعتذر عن هذا الخطأ. يمكنك المحاولة مرة أخرى أو العودة للرئيسية.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button onClick={reset} className="btn-primary">
            حاول مرة أخرى
          </button>
          <Link href="/" className="btn-secondary">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
