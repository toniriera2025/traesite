import React, { useState, useEffect, useCallback } from 'react'
import { Youtube, AlertCircle, CheckCircle, Loader2, Eye } from 'lucide-react'
import { validateYouTubeUrl, extractYouTubeVideoId, getYouTubeThumbnailUrl } from '@/lib/youtubeUtils'
import YouTubeEmbed from '../YouTubeEmbed'
import type { YouTubeValidationResult } from '@/types/youtube'

interface YouTubeInputProps {
  value?: string
  onChange: (url: string, videoId?: string, thumbnailUrl?: string) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
  showPreview?: boolean
}

export function YouTubeInput({
  value = '',
  onChange,
  label = 'YouTube URL',
  placeholder = 'https://youtube.com/watch?v=...',
  disabled = false,
  required = false,
  className = '',
  showPreview = true
}: YouTubeInputProps) {
  const [inputValue, setInputValue] = useState(value)
  const [validation, setValidation] = useState<YouTubeValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [showVideoPreview, setShowVideoPreview] = useState(false)

  // Debounced validation
  const validateUrl = useCallback(async (url: string) => {
    if (!url.trim()) {
      setValidation(null)
      onChange('', undefined, undefined)
      return
    }

    setIsValidating(true)
    
    try {
      const result = validateYouTubeUrl(url.trim())
      setValidation(result)
      
      // Only call onChange for valid URLs or when clearing
      if (result.isValid && result.videoId) {
        onChange(result.normalizedUrl || url, result.videoId, result.thumbnailUrl)
      } else if (!result.isValid) {
        // For invalid URLs, don't update the parent component
        // This prevents unnecessary API calls during typing
      }
    } catch (error) {
      setValidation({
        isValid: false,
        error: 'Validation failed'
      })
    } finally {
      setIsValidating(false)
    }
  }, [onChange])

  // Debounce validation
  useEffect(() => {
    const timer = setTimeout(() => {
      validateUrl(inputValue)
    }, 1000) // Increased from 500ms to 1000ms to reduce validation frequency

    return () => clearTimeout(timer)
  }, [inputValue, validateUrl])

  // Update local state when prop changes
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value)
    }
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleClear = () => {
    setInputValue('')
    setValidation(null)
    onChange('', undefined, undefined)
    setShowVideoPreview(false)
  }

  const togglePreview = () => {
    setShowVideoPreview(!showVideoPreview)
  }

  return (
    <div className={className}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <div className="flex items-center gap-2">
          <Youtube className="w-4 h-4 text-red-600" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </div>
      </label>

      {/* Input Field */}
      <div className="relative">
        <input
          type="url"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 ${
            validation?.isValid === false ? 'border-red-300 bg-red-50' : 
            validation?.isValid === true ? 'border-green-300 bg-green-50' : 
            'border-gray-300'
          }`}
        />
        
        {/* Status Icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isValidating && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
          {!isValidating && validation?.isValid === true && (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}
          {!isValidating && validation?.isValid === false && inputValue.trim() && (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
        </div>
      </div>

      {/* Error Message */}
      {validation?.error && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {validation.error}
        </p>
      )}

      {/* Success Message & Controls */}
      {validation?.isValid && validation.videoId && (
        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Valid YouTube URL</span>
              <span className="text-xs text-green-600">ID: {validation.videoId}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {showPreview && (
                <button
                  type="button"
                  onClick={togglePreview}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  {showVideoPreview ? 'Hide' : 'Preview'}
                </button>
              )}
              
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-gray-500 hover:text-red-600 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
          
          {/* Video Preview */}
          {showPreview && showVideoPreview && validation.videoId && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 text-xs text-gray-600 font-medium border-b">
                Video Preview
              </div>
              <div className="p-3">
                <YouTubeEmbed
                  videoId={validation.videoId}
                  title="Preview"
                  className="max-w-md mx-auto"
                  showThumbnail={true}
                  autoplay={false}
                  controls={true}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      <p className="mt-1 text-xs text-gray-500">
        Supported formats: youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/...
      </p>
    </div>
  )
}

export default YouTubeInput