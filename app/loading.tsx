export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="relative w-16 h-16 flex items-center justify-center mb-6">
        <div className="absolute inset-0 border-4 border-[var(--gold-dim)] border-t-[var(--gold)] rounded-full animate-spin"></div>
        <img src="/logo.png" alt="Loading" className="w-8 h-8 rounded-full object-cover animate-pulse shadow-sm" />
      </div>
      <h2 className="text-[var(--text-1)] font-black text-lg animate-pulse tracking-tight">
        جاري التحميل...
      </h2>
      <p className="text-[var(--text-3)] text-xs font-bold mt-2">
        يرجى الانتظار قليلاً
      </p>
    </div>
  );
}

