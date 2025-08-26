/**
 * YouTube utilities for URL validation, video ID extraction, and thumbnail generation
 */

// YouTube URL patterns
const YOUTUBE_PATTERNS = [
  // Standard YouTube URLs
  /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/,
  // YouTube embed URLs
  /youtube\.com\/embed\/([^"&?/\s]{11})/,
  // YouTube short URLs
  /youtu\.be\/([^"&?/\s]{11})/,
  // YouTube watch URLs with additional parameters
  /youtube\.com\/watch\?v=([^"&?/\s]{11})/
];

export interface YouTubeVideoData {
  videoId: string;
  thumbnailUrl: string;
  isValid: boolean;
  originalUrl: string;
}

export interface YouTubeValidationResult {
  isValid: boolean;
  videoId?: string;
  thumbnailUrl?: string;
  error?: string;
  normalizedUrl?: string;
}

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Remove whitespace and common prefixes
  const cleanUrl = url.trim();
  
  // Try each pattern
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = cleanUrl.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Generate YouTube thumbnail URL from video ID
 */
export function getYouTubeThumbnailUrl(videoId: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'maxres'): string {
  if (!videoId) {
    return '';
  }
  
  const qualityMap = {
    'default': 'default.jpg',
    'medium': 'mqdefault.jpg', 
    'high': 'hqdefault.jpg',
    'standard': 'sddefault.jpg',
    'maxres': 'maxresdefault.jpg'
  };
  
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}`;
}

/**
 * Generate YouTube embed URL from video ID
 */
export function getYouTubeEmbedUrl(videoId: string, options?: {
  autoplay?: boolean;
  mute?: boolean;
  controls?: boolean;
  modestbranding?: boolean;
  rel?: boolean;
  showinfo?: boolean;
}){
  if (!videoId) {
    return '';
  }
  
  const params = new URLSearchParams();
  
  if (options?.autoplay) params.append('autoplay', '1');
  if (options?.mute) params.append('mute', '1');
  if (options?.controls === false) params.append('controls', '0');
  if (options?.modestbranding) params.append('modestbranding', '1');
  if (options?.rel === false) params.append('rel', '0');
  if (options?.showinfo === false) params.append('showinfo', '0');
  
  const queryString = params.toString();
  return `https://www.youtube.com/embed/${videoId}${queryString ? `?${queryString}` : ''}`;
}

/**
 * Validate YouTube URL and extract video data
 */
export function validateYouTubeUrl(url: string): YouTubeValidationResult {
  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      error: 'URL is required'
    };
  }
  
  // Clean the URL
  const cleanUrl = url.trim();
  
  if (!cleanUrl) {
    return {
      isValid: false,
      error: 'URL cannot be empty'
    };
  }
  
  // Check if it looks like a YouTube URL
  if (!cleanUrl.includes('youtube.') && !cleanUrl.includes('youtu.be')) {
    return {
      isValid: false,
      error: 'URL must be a valid YouTube URL'
    };
  }
  
  // Extract video ID
  const videoId = extractYouTubeVideoId(cleanUrl);
  
  if (!videoId) {
    return {
      isValid: false,
      error: 'Could not extract video ID from URL. Please check the URL format.'
    };
  }
  
  // Generate thumbnail URL
  const thumbnailUrl = getYouTubeThumbnailUrl(videoId);
  
  // Generate normalized URL (clean watch URL)
  const normalizedUrl = `https://www.youtube.com/watch?v=${videoId}`;
  
  return {
    isValid: true,
    videoId,
    thumbnailUrl,
    normalizedUrl
  };
}

/**
 * Check if a YouTube thumbnail exists (for validation)
 */
export async function checkYouTubeThumbnailExists(videoId: string): Promise<boolean> {
  if (!videoId) return false;
  
  try {
    const thumbnailUrl = getYouTubeThumbnailUrl(videoId, 'high');
    const response = await fetch(thumbnailUrl, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get multiple thumbnail qualities for a video
 */
export function getYouTubeThumbnails(videoId: string) {
  if (!videoId) return {};
  
  return {
    default: getYouTubeThumbnailUrl(videoId, 'default'),
    medium: getYouTubeThumbnailUrl(videoId, 'medium'),
    high: getYouTubeThumbnailUrl(videoId, 'high'),
    standard: getYouTubeThumbnailUrl(videoId, 'standard'),
    maxres: getYouTubeThumbnailUrl(videoId, 'maxres')
  };
}

/**
 * Format video duration from seconds to readable format
 */
export function formatVideoDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

/**
 * Test URLs for development/testing
 */
export const TEST_YOUTUBE_URLS = {
  valid: [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtube.com/embed/dQw4w9WgXcQ',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s',
    'https://m.youtube.com/watch?v=dQw4w9WgXcQ'
  ],
  invalid: [
    'https://vimeo.com/123456789',
    'https://youtube.com/invalid',
    'not-a-url',
    'https://youtube.com/watch?v=invalid',
    'https://youtube.com/watch?v='
  ]
};
