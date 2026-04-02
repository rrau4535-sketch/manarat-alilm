'use client';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SearchBar({ defaultValue = '' }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) router.push(`/?q=${encodeURIComponent(value.trim())}`);
    else router.push('/');
  }

  return (
    <form onSubmit={handleSearch} className="max-w-[520px] mx-auto">
      <div className="flex items-center rounded-xl overflow-hidden bg-[var(--surface-2)] border-[1.5px] border-[var(--border)] focus-within:border-[var(--text-1)] focus-within:shadow-[0_0_0_3px_rgba(var(--text-1-rgb),0.1)] transition-all duration-200">
        <input type="text" value={value} onChange={e => setValue(e.target.value)}
          placeholder="ابحث عن فيديو، شبهة، أو موضوع..."
          className="flex-1 bg-transparent px-4 py-3 text-sm text-[var(--text-1)] outline-none placeholder:text-[var(--text-3)]"
          dir="auto" />
        
        {value && (
          <button type="button" onClick={() => setValue('')}
            className="px-2 text-[var(--text-3)] hover:text-[var(--text-1)] bg-transparent border-none cursor-pointer flex items-center transition-colors">
            <X size={15} />
          </button>
        )}
        
        <button type="submit" className="m-1 px-4 py-2 rounded-lg bg-[var(--text-1)] text-[var(--bg)] font-black text-[13px] border-none cursor-pointer flex items-center gap-1.5 transition-opacity hover:opacity-90">
          <Search size={14} /> بحث
        </button>
      </div>
    </form>
  );
}
