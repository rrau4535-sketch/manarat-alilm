// lib/video-actions.ts
'use server';

import { createServerSupabaseClient } from './supabase/server';
import { VideoCategory } from '@/types';
import { revalidatePath } from 'next/cache';

export async function getVideos(category?: VideoCategory) {
  const supabase = await createServerSupabaseClient();
  let query = supabase.from('videos').select('*').order('created_at', { ascending: false });
  if (category) query = query.eq('category', category);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function searchVideos(searchTerm: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('videos').select('*').ilike('title', `%${searchTerm}%`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addVideo(formData: FormData) {
  const title = formData.get('title') as string;
  const youtube_url = formData.get('youtube_url') as string;
  const category = formData.get('category') as VideoCategory;

  if (!title || !youtube_url || !category) return { error: 'جميع الحقول مطلوبة' };

  const videoId = extractYouTubeId(youtube_url);
  if (!videoId) return { error: 'رابط يوتيوب غير صحيح' };

  const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'يجب تسجيل الدخول' };

  const { error } = await supabase.from('videos').insert({
    title, youtube_url, category, thumbnail, created_by: user.id,
  });

  if (error) {
    if (error.code === '42501') return { error: 'ليس لديك صلاحية' };
    return { error: error.message };
  }

  revalidatePath('/');
  revalidatePath(`/${category}`);
  return { success: true };
}

export async function deleteVideo(videoId: string) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from('videos').delete().eq('id', videoId);
  if (error) return { error: error.message };
  revalidatePath('/');
  return { success: true };
}

export async function getLiveStream() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from('live_stream').select('*').eq('is_active', true).single();
  return data;
}

export async function updateLiveStream(formData: FormData) {
  const stream_url = formData.get('stream_url') as string;
  const title = formData.get('title') as string;
  const is_active = formData.get('is_active') === 'true';
  const supabase = await createServerSupabaseClient();

  const { data: existing } = await supabase.from('live_stream').select('id').limit(1).single();
  if (existing) {
    await supabase.from('live_stream').update({ stream_url, title, is_active, updated_at: new Date().toISOString() }).eq('id', existing.id);
  } else {
    await supabase.from('live_stream').insert({ stream_url, title, is_active });
  }
  revalidatePath('/live');
  return { success: true };
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^[a-zA-Z0-9_-]{11}$/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}
