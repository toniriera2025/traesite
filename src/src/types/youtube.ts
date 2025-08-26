/**
 * YouTube integration type definitions
 */

export interface YouTubeVideoData {
  videoId: string;
  thumbnailUrl: string;
  embedUrl: string;
  originalUrl: string;
  isValid: boolean;
}

export interface YouTubeValidationResult {
  isValid: boolean;
  videoId?: string;
  thumbnailUrl?: string;
  embedUrl?: string;
  error?: string;
  normalizedUrl?: string;
}

export interface YouTubeEmbedOptions {
  autoplay?: boolean;
  mute?: boolean;
  controls?: boolean;
  modestbranding?: boolean;
  rel?: boolean;
  showinfo?: boolean;
  loop?: boolean;
  playlist?: string;
}

export interface YouTubePlayerState {
  isLoading: boolean;
  isPlaying: boolean;
  hasError: boolean;
  errorMessage?: string;
}

// Extended Project type with YouTube support
export interface ProjectWithYouTube {
  id: string;
  title: string;
  slug: string;
  description?: string;
  main_image_url?: string;
  main_image_alt?: string;
  
  // YouTube fields
  youtube_url?: string;
  youtube_video_id?: string;
  youtube_thumbnail_url?: string;
  
  // Media priority
  has_video: boolean;
  primary_media_type: 'video' | 'image';
  
  // Other fields
  category?: string;
  client?: string;
  created_at: string;
  updated_at: string;
  is_featured: boolean;
  sort_order: number;
  status: 'draft' | 'published' | 'archived';
}

export type MediaPriority = 'video' | 'main_image' | 'additional_images' | 'placeholder';

export interface MediaDisplayData {
  type: MediaPriority;
  url: string;
  alt?: string;
  isVideo: boolean;
  videoId?: string;
}
