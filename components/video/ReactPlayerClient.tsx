'use client';
import { useState, useEffect } from 'react';
import ReactPlayer from 'react-player/youtube';

export default function ReactPlayerClient({ url }: { url: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-full pt-[56.25%] relative bg-[var(--surface-3)] animate-pulse" />;
  }

  return (
    <div className="relative pt-[56.25%] w-full">
      <ReactPlayer 
        url={url} 
        width="100%" 
        height="100%" 
        controls 
        className="absolute top-0 left-0"
      />
    </div>
  );
}
