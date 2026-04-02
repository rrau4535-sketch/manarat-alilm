-- ============================================
-- 🗄️ DAWAH PLATFORM - SUPABASE SCHEMA
-- شغّل هذا الكود في Supabase SQL Editor
-- ============================================

-- 1. جدول الملفات الشخصية
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. جدول الفيديوهات
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Atheism', 'Christianity', 'Doubts')),
  thumbnail TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 3. جدول البث المباشر (يخزن رابط البث الحالي)
CREATE TABLE IF NOT EXISTS public.live_stream (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_url TEXT NOT NULL,
  title TEXT,
  is_active BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 🔒 ROW LEVEL SECURITY (RLS)
-- ============================================

-- تفعيل RLS على كل الجداول
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_stream ENABLE ROW LEVEL SECURITY;

-- ---- PROFILES POLICIES ----
-- الجميع يقرأ
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT USING (true);

-- المستخدم يُضيف ملفه الشخصي فقط عند التسجيل
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- المستخدم يُعدل ملفه فقط
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ---- VIDEOS POLICIES ----
-- الجميع يقرأ الفيديوهات
CREATE POLICY "videos_select_all" ON public.videos
  FOR SELECT USING (true);

-- فقط الأدمن يُضيف
CREATE POLICY "videos_insert_admin" ON public.videos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- فقط الأدمن يحذف
CREATE POLICY "videos_delete_admin" ON public.videos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ---- LIVE STREAM POLICIES ----
-- الجميع يقرأ
CREATE POLICY "live_select_all" ON public.live_stream
  FOR SELECT USING (true);

-- فقط الأدمن يُضيف ويُعدل
CREATE POLICY "live_insert_admin" ON public.live_stream
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "live_update_admin" ON public.live_stream
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- ⚡ FUNCTION: Auto-create profile on signup
-- تلقائياً ينشئ profile عند تسجيل مستخدم جديد
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ربط الـ Function بالـ Auth trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 🔍 INDEXES للأداء
-- ============================================
CREATE INDEX IF NOT EXISTS videos_category_idx ON public.videos(category);
CREATE INDEX IF NOT EXISTS videos_created_at_idx ON public.videos(created_at DESC);
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);

-- ============================================
-- 🌱 إضافة بيانات أولية
-- ============================================
INSERT INTO public.live_stream (stream_url, title, is_active)
VALUES ('https://www.youtube.com/embed/live_stream?channel=YOUR_CHANNEL', 'البث المباشر', false)
ON CONFLICT DO NOTHING;
