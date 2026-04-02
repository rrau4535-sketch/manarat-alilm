'use client';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfileRedirect() {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (profile) router.replace(`/profile/${profile.username}`);
    else router.replace('/auth');
  }, [profile, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-[#C19A6B]/30 border-t-[#C19A6B] rounded-full animate-spin" />
    </div>
  );
}
