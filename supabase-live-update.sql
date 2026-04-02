-- ============================================
-- 🆕 تحديث قاعدة البيانات - شغّل في SQL Editor
-- ============================================

-- 1. إضافة حقول جديدة لجدول البث
ALTER TABLE public.live_stream 
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS thumbnail TEXT,
ADD COLUMN IF NOT EXISTS viewer_count INT DEFAULT 0;

-- 2. جدول الشات المباشر
CREATE TABLE IF NOT EXISTS public.live_chat (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID REFERENCES public.live_stream(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS على الشات
ALTER TABLE public.live_chat ENABLE ROW LEVEL SECURITY;

-- الجميع يقرأ
CREATE POLICY "chat_select_all" ON public.live_chat
  FOR SELECT USING (true);

-- المسجلون فقط يكتبون
CREATE POLICY "chat_insert_auth" ON public.live_chat
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Realtime على الشات
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_chat;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_stream;

-- 4. Index للأداء
CREATE INDEX IF NOT EXISTS live_chat_stream_idx ON public.live_chat(stream_id, created_at DESC);
CREATE INDEX IF NOT EXISTS live_stream_active_idx ON public.live_stream(is_active);
CREATE INDEX IF NOT EXISTS live_stream_ended_idx ON public.live_stream(ended_at DESC);
