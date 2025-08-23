import React, { useState } from 'react'
import { getLocalizedContent } from '@/lib/supabase'
import type { Project } from '@/lib/supabase'
import type { MediaDisplayData, MediaPriority } from '@/types/youtube'
import YouTubeEmbed from './YouTubeEmbed'
import YouTubeThumbnail from './YouTubeThumbnail'

interface ProjectMediaDisplayProps {
  project: Project
  language?: string
  displayMode?: 'full' | 'thumbnail' | 'grid'
  className?: string
  autoplay?: boolean
  showVideoControls?: boolean
  onMediaLoad?: () => void
  onMediaError?: (error: string) => void
}

/**
 * Determines media priority: video → main image → placeholder
 */
function getMediaDisplayData(project: Project): MediaDisplayData {
  // Priority 1: YouTube Video
  if (project.youtube_video_id && project.youtube_url) {
    return {
      type: 'video',
      url: project.youtube_url,
      alt: project.title,
      isVideo: true,
      videoId: project.youtube_video_id
    }
  }
  
  // Priority 2: Main Image
  if (project.main_image_url) {
    return {
      type: 'main_image',
      url: project.main_image_url,
      alt: project.main_image_alt || project.title,
      isVideo: false
    }
  }
  
  // Priority 3: Placeholder
  return {
    type: 'placeholder',
    url: '/images/placeholder-project.jpg',
    alt: 'Project placeholder',
    isVideo: false
  }
}

export function ProjectMediaDisplay({
  project,
  language = 'en',
  displayMode = 'full',
  className = '',
  autoplay = false,
  showVideoControls = true,
  onMediaLoad,
  onMediaError
}: ProjectMediaDisplayProps) {
  const [hasVideoError, setHasVideoError] = useState(false)
  
  const mediaData = getMediaDisplayData(project)
  const projectTitle = getLocalizedContent(
    {
      en: project.title_en || project.title,
      es: project.title_es,
      ca: project.title_ca
    },
    language as any,
    'en'
  )

  const handleVideoError = (error: string) => {
    setHasVideoError(true)
    onMediaError?.(error)
  }

  // If video failed to load, fall back to image
  const effectiveMediaData = hasVideoError && mediaData.isVideo
    ? {
        type: 'main_image' as MediaPriority,
        url: project.main_image_url || '/images/placeholder-project.jpg',
        alt: project.main_image_alt || projectTitle,
        isVideo: false
      }
    : mediaData

  // Grid/Thumbnail Mode
  if (displayMode === 'grid' || displayMode === 'thumbnail') {
    if (effectiveMediaData.isVideo && effectiveMediaData.videoId) {
      return (
        <YouTubeThumbnail
          videoId={effectiveMediaData.videoId}
          title={projectTitle}
          className={`aspect-[4/3] ${className}`}
          showPlayButton={true}
          showDuration={false}
        />
      )
    }
    
    return (
      <div className={`relative aspect-[4/3] overflow-hidden bg-gray-100 ${className}`}>
        <img
          src={effectiveMediaData.url}
          alt={effectiveMediaData.alt}
          className="w-full h-full object-cover"
          onLoad={onMediaLoad}
          onError={(e) => {
            const img = e.target as HTMLImageElement
            if (img.src !== '/images/placeholder-project.jpg') {
              img.src = '/images/placeholder-project.jpg'
            }
          }}
        />
        {/* Image Project Indicator */}
        {!effectiveMediaData.isVideo && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">
            IMAGE
          </div>
        )}
      </div>
    )
  }

  // Full Display Mode
  if (effectiveMediaData.isVideo && effectiveMediaData.videoId) {
    return (
      <YouTubeEmbed
        videoId={effectiveMediaData.videoId}
        title={projectTitle}
        className={`aspect-video ${className}`}
        autoplay={autoplay}
        controls={showVideoControls}
        showThumbnail={!autoplay}
        onLoad={onMediaLoad}
        onError={handleVideoError}
      />
    )
  }

  // Image Display
  return (
    <div className={`relative aspect-video overflow-hidden bg-gray-100 ${className}`}>
      <img
        src={effectiveMediaData.url}
        alt={effectiveMediaData.alt}
        className="w-full h-full object-cover"
        onLoad={onMediaLoad}
        onError={(e) => {
          const img = e.target as HTMLImageElement
          if (img.src !== '/images/placeholder-project.jpg') {
            img.src = '/images/placeholder-project.jpg'
          }
        }}
      />
    </div>
  )
}

export default ProjectMediaDisplay