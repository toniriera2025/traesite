import React, { useState, useCallback, useEffect } from 'react'
import { Play, AlertCircle, Loader2 } from 'lucide-react'
import { getYouTubeEmbedUrl } from '@/lib/youtubeUtils'
import type { YouTubeEmbedOptions, YouTubePlayerState } from '@/types/youtube'

interface YouTubeEmbedProps {
  videoId: string
  title?: string
  className?: string
  aspectRatio?: '16/9' | '4/3' | '1/1'
  autoplay?: boolean
  controls?: boolean
  mute?: boolean
  modestbranding?: boolean
  showThumbnail?: boolean
  onError?: (error: string) => void
  onLoad?: () => void
}

export function YouTubeEmbed({
  videoId,
  title = 'Video',
  className = '',
  aspectRatio = '16/9',
  autoplay = false,
  controls = true,
  mute = false,
  modestbranding = true,
  showThumbnail = true,
  onError,
  onLoad
}: YouTubeEmbedProps) {
  const [playerState, setPlayerState] = useState<YouTubePlayerState>({
    isLoading: false,
    isPlaying: false,
    hasError: false
  })
  const [showIframe, setShowIframe] = useState(!showThumbnail || autoplay)

  const embedOptions: YouTubeEmbedOptions = {
    autoplay,
    controls,
    mute,
    modestbranding,
    rel: false,
    showinfo: false
  }

  const embedUrl = getYouTubeEmbedUrl(videoId, embedOptions)
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

  const handlePlayClick = useCallback(() => {
    setPlayerState(prev => ({ ...prev, isLoading: true }))
    setShowIframe(true)
  }, [])

  const handleIframeLoad = useCallback(() => {
    setPlayerState(prev => ({ 
      ...prev, 
      isLoading: false,
      isPlaying: true 
    }))
    onLoad?.()
  }, [onLoad])

  const handleIframeError = useCallback(() => {
    const errorMessage = 'Failed to load video'
    setPlayerState(prev => ({ 
      ...prev, 
      isLoading: false,
      hasError: true,
      errorMessage 
    }))
    onError?.(errorMessage)
  }, [onError])

  // Error boundary for invalid video IDs
  useEffect(() => {
    if (!videoId || videoId.length !== 11) {
      const errorMessage = 'Invalid video ID'
      setPlayerState(prev => ({ 
        ...prev, 
        hasError: true,
        errorMessage 
      }))
      onError?.(errorMessage)
    }
  }, [videoId, onError])

  const aspectRatioClasses = {
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '1/1': 'aspect-square'
  }

  if (playerState.hasError) {
    return (
      <div className={`relative bg-gray-100 rounded-lg flex items-center justify-center ${aspectRatioClasses[aspectRatio]} ${className}`}>
        <div className="text-center p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Video Unavailable</p>
          <p className="text-sm text-gray-500 mt-1">
            {playerState.errorMessage || 'Unable to load video'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${aspectRatioClasses[aspectRatio]} ${className}`}>
      {!showIframe && (
        <>
          {/* Video Thumbnail */}
          <img
            src={thumbnailUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              // Fallback to lower quality thumbnail
              const img = e.target as HTMLImageElement
              if (img.src.includes('maxresdefault')) {
                img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
              } else if (img.src.includes('hqdefault')) {
                img.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
              }
            }}
          />
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors cursor-pointer group"
               onClick={handlePlayClick}>
            <div className="bg-red-600 rounded-full p-4 group-hover:bg-red-700 transition-colors shadow-lg">
              <Play className="w-8 h-8 text-white ml-1" fill="white" />
            </div>
          </div>
          
          {/* Video Title Overlay */}
          {title && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <h3 className="text-white font-medium truncate">{title}</h3>
            </div>
          )}
        </>
      )}
      
      {showIframe && (
        <>
          {playerState.isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center text-white">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-sm">Loading video...</p>
              </div>
            </div>
          )}
          
          <iframe
            src={embedUrl}
            title={title}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        </>
      )}
    </div>
  )
}

export default YouTubeEmbed