'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Profile { id: string; username: string; role: string; }
interface Ctx { profile: Profile | null; ready: boolean; }
const Auth = createContext<Ctx>({ profile: null, ready: false });
export const useAuth = () => useContext(Auth);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) { setReady(true); return; }
      sb.from('profiles').select('id,username,role').eq('id', session.user.id).single()
        .then(({ data }) => { setProfile(data as Profile); setReady(true); });
    });
    const { data: { subscription } } = sb.auth.onAuthStateChange((_e, session) => {
      if (!session?.user) { setProfile(null); setReady(true); return; }
      sb.from('profiles').select('id,username,role').eq('id', session.user.id).single()
        .then(({ data }) => { setProfile(data as Profile); setReady(true); });
    });
    return () => subscription.unsubscribe();
  }, []);

  return <Auth.Provider value={{ profile, ready }}>{children}</Auth.Provider>;
}
