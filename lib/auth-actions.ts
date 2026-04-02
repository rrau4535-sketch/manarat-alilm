// lib/auth-actions.ts
'use server';

import { createServerSupabaseClient } from './supabase/server';
import { redirect } from 'next/navigation';

const FAKE_EMAIL_DOMAIN = 'dawah-platform.app';

// ✅ تسجيل مستخدم جديد
export async function registerUser(formData: FormData) {
  const username = (formData.get('username') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'اسم المستخدم وكلمة المرور مطلوبان' };
  }

  if (username.length < 3) {
    return { error: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' };
  }

  if (password.length < 6) {
    return { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
  }

  const supabase = await createServerSupabaseClient();

  // 🔍 التحقق من عدم تكرار الـ username
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .single();

  if (existingUser) {
    return { error: 'اسم المستخدم هذا محجوز، جرب اسماً آخر' };
  }

  // 📧 نحوّل الـ username لـ email داخلياً (المستخدم مش شايف ده)
  const fakeEmail = `${username}@${FAKE_EMAIL_DOMAIN}`;

  const { error } = await supabase.auth.signUp({
    email: fakeEmail,
    password,
    options: {
      data: {
        username,
        role: 'user', // الكل يبدأ كـ user
      },
      // تفعيل فوري بدون تأكيد email
      emailRedirectTo: undefined,
    },
  });

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'اسم المستخدم هذا محجوز' };
    }
    return { error: `خطأ في التسجيل: ${error.message}` };
  }

  return { success: true };
}

// ✅ تسجيل دخول
export async function loginUser(formData: FormData) {
  const username = (formData.get('username') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'أدخل اسم المستخدم وكلمة المرور' };
  }

  const supabase = await createServerSupabaseClient();

  const fakeEmail = `${username}@${FAKE_EMAIL_DOMAIN}`;

  const { error } = await supabase.auth.signInWithPassword({
    email: fakeEmail,
    password,
  });

  if (error) {
    return { error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
  }

  redirect('/');
}

// ✅ تسجيل خروج
export async function logoutUser() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect('/');
}

// ✅ جلب بيانات المستخدم الحالي
export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}
