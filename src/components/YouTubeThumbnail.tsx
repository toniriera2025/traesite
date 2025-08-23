import React from 'react'
import { Play } from 'lucide-react'
import { getYouTubeThumbnailUrl } from '@/lib/youtubeUtils'

interface YouTubeThumbnailProps {
  videoId: string
  title?: string
  className?: string
  quality?: 'default' | 'medium' | 'high' | 'standard' | 'maxres'
  showPlayButton?: boolean
  showDuration?: boolean
  duration?: string
  onClick?: () => void
}

export function YouTubeThumbnail({
  videoId,
  title,
  className = '',
  quality = 'high',
  showPlayButton = true,
  showDuration = false,
  duration,
  onClick
}: YouTubeThumbnailProps) {
  const thumbnailUrl = getYouTubeThumbnailUrl(videoId, quality)
  const fallbackThumbnailUrl = getYouTubeThumbnailUrl(videoId, 'medium')

  return (
    <div 
      className={`relative group cursor-pointer overflow-hidden bg-gray-100 ${className}`}
      onClick={onClick}
    >
      {/* Thumbnail Image */}
      <img
        src={thumbnailUrl}
        alt={title || 'Video thumbnail'}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        onError={(e) => {
          const img = e.target as HTMLImageElement
          if (img.src !== fallbackThumbnailUrl) {
            img.src = fallbackThumbnailUrl
          }
        }}
      />
      
      {/* Video Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
      
      {/* Play Button */}
      {showPlayButton && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-red-600 rounded-full p-3 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 shadow-lg">
            <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
          </div>
        </div>
      )}
      
      {/* Duration Badge */}
      {showDuration && duration && (
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          {duration}
        </div>
      )}
      
      {/* Title Overlay */}
      {title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <h4 className="text-white text-sm font-medium line-clamp-2">{title}</h4>
        </div>
      )}
      
      {/* Video Type Indicator */}
      <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded font-medium">
        VIDEO
      </div>
    </div>
  )
}

export default YouTubeThumbnail