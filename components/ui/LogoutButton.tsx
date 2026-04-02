// components/ui/LogoutButton.tsx
'use client';

import { logoutUser } from '@/lib/auth-actions';
import { LogOut } from 'lucide-react';
import { useState } from 'react';

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await logoutUser();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500
                 hover:bg-red-50 px-3 py-2 rounded-xl transition-all"
      title="تسجيل الخروج"
    >
      <LogOut size={16} />
    </button>
  );
}
