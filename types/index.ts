// types/index.ts

export type UserRole = 'admin' | 'user';

export type VideoCategory = 'Atheism' | 'Christianity' | 'Doubts';

export interface Profile {
  id: string;
  username: string;
  role: UserRole;
  created_at: string;
}

export interface Video {
  id: string;
  title: string;
  youtube_url: string;
  category: VideoCategory;
  thumbnail?: string;
  created_at: string;
  created_by?: string;
}

export interface LiveStream {
  id: string;
  stream_url: string;
  title?: string;
  is_active: boolean;
  updated_at: string;
}

export interface Comment {
  id: string;
  video_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  video_id: string;
  created_at: string;
}

export const CATEGORIES: Record<VideoCategory, { label: string; icon: string; color: string; description: string }> = {
  Atheism: {
    label: 'الرد على الإلحاد',
    icon: '🔬',
    color: '#2C3E50',
    description: 'حوارات ومناظرات علمية وفلسفية'
  },
  Christianity: {
    label: 'الحوار مع النصارى',
    icon: '✝️',
    color: '#8B6914',
    description: 'نقاشات عقدية وتفسيرية مقارنة'
  },
  Doubts: {
    label: 'الشبهات والردود',
    icon: '💡',
    color: '#C19A6B',
    description: 'إجابات على أكثر الشبهات شيوعاً'
  }
};
