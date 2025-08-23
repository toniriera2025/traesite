import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, X, Image as ImageIcon, Link2, Clipboard, AlertCircle, CheckCircle, Loader2, RefreshCcw, Eye, Zap, Crop, FolderOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { UploadService, validateImageUrl, handleClipboardPaste } from '@/lib/uploadService'
import { imageDatabase } from '@/lib/imageDatabase'
import { ImageCropper } from './ImageCropper'
import { ImageGalleryModal } from './ImageGalleryModal'
import { fileToDataUrl, blobToFile } from '@/lib/cropUtils'
import type { FileUploadProps, UploadProgress, UploadedImage } from '@/types/upload'

export function FileUpload({
  value = '',
  onChange,
  onFileNameChange,
  onMetadataChange,
  label = 'Upload Image',
  folder = '',
  accept = 'image/*',
  required = false,
  placeholder = 'No file selected or enter image URL manually',
  className = '',
  allowMultiple = false,
  category = 'general'
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [uploadMethod, setUploadMethod] = useState<'drag' | 'url' | 'clipboard' | 'gallery'>('drag')
  const [urlInput, setUrlInput] = useState('')
  const [validatingUrl, setValidatingUrl] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [retryCount, setRetryCount] = useState(0)
  const [showCropper, setShowCropper] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<{ src: string; file?: File; originalUrl?: string } | null>(null)
  const [enableCropping, setEnableCropping] = useState(true)
  const [showGalleryModal, setShowGalleryModal] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)
  const uploadServiceRef = useRef<UploadService | null>(null)
  
  // Initialize upload service
  useEffect(() => {
    uploadServiceRef.current = new UploadService((progress) => {
      setUploadProgress(progress)
    })
  }, [])
  
  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length > 0) {
      if (allowMultiple) {
        handleMultipleFiles(imageFiles)
      } else {
        handleFile(imageFiles[0])
      }
    } else {
      toast.error('Please drop valid image files')
    }
  }, [allowMultiple])
  
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      if (allowMultiple) {
        handleMultipleFiles(files)
      } else {
        handleFile(files[0])
      }
    }
  }, [allowMultiple])
  
  // Handle single file upload
  const handleFile = async (file: File, skipCropping: boolean = false): Promise<void> => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      throw new Error('Invalid file type')
    }
    
    if (file.size > 32 * 1024 * 1024) { // 32MB limit
      toast.error('File size must be less than 32MB')
      throw new Error('File size too large')
    }
    
    // If cropping is enabled and not skipped, show cropper
    if (enableCropping && !skipCropping) {
      try {
        const dataUrl = await fileToDataUrl(file)
        setImageToCrop({ src: dataUrl, file })
        setShowCropper(true)
        return // Don't continue with upload - wait for cropping
      } catch (error) {
        console.error('Failed to prepare image for cropping:', error)
        toast.error('Failed to prepare image for cropping. Uploading original...')
        // Continue with normal upload
      }
    }
    
    setIsUploading(true)
    setUploadProgress(null)
    setRetryCount(0)
    
    try {
      const result = await uploadServiceRef.current!.uploadWithFallback(file, {
        maxRetries: 2
      })
      
      if (!result || !result.url) {
        throw new Error('Upload failed - no URL returned')
      }
      
      // Save to database
      const savedImage = await imageDatabase.saveImage({
        url: result.url,
        filename: result.metadata.filename || file.name,
        original_filename: result.metadata.original_filename || file.name,
        file_size: result.metadata.file_size,
        width: result.metadata.width,
        height: result.metadata.height,
        mime_type: result.metadata.mime_type || file.type,
        upload_service: result.metadata.upload_service || result.service,
        category
      })
      
      if (!savedImage) {
        throw new Error('Failed to save image to database')
      }
      
      // Update form only after successful upload and database save
      onChange(result.url)
      onFileNameChange?.(file.name)
      onMetadataChange?.(savedImage)
      
      toast.success(`Image uploaded successfully via ${result.service}!`)
      
    } catch (error) {
      console.error('Upload failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      toast.error(errorMessage)
      throw error // Re-throw to let calling function handle it
    } finally {
      setIsUploading(false)
      setUploadProgress(null)
    }
  }
  
  // Handle multiple file upload
  const handleMultipleFiles = async (files: File[]) => {
    setIsUploading(true)
    const results: string[] = []
    
    for (const file of files) {
      try {
        const result = await uploadServiceRef.current!.uploadWithFallback(file, {
          maxRetries: 2
        })
        
        // Save to database
        await imageDatabase.saveImage({
          url: result.url,
          filename: result.metadata.filename || file.name,
          original_filename: result.metadata.original_filename || file.name,
          file_size: result.metadata.file_size,
          width: result.metadata.width,
          height: result.metadata.height,
          mime_type: result.metadata.mime_type || file.type,
          upload_service: result.metadata.upload_service || result.service,
          category
        })
        
        results.push(result.url)
        setUploadedFiles(prev => [...prev, result.url])
        
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error)
        toast.error(`Failed to upload ${file.name}`)
      }
    }
    
    if (results.length > 0) {
      onChange(results[0]) // Set first uploaded image as value
      toast.success(`${results.length} images uploaded successfully!`)
    }
    
    setIsUploading(false)
    setUploadProgress(null)
  }
  
  // Handle URL input
  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return
    
    setValidatingUrl(true)
    
    try {
      const validation = await validateImageUrl(urlInput)
      if (!validation.valid) {
        toast.error('Invalid image URL or image could not be loaded')
        return
      }
      
      // If cropping is enabled, show cropper for URL images too
      if (enableCropping) {
        setImageToCrop({ src: urlInput, originalUrl: urlInput })
        setShowCropper(true)
        setValidatingUrl(false)
        return
      }
      
      // Save URL to database
      const imageData = {
        url: urlInput,
        filename: urlInput.split('/').pop() || 'url-image',
        original_filename: urlInput,
        width: validation.dimensions?.width,
        height: validation.dimensions?.height,
        upload_service: 'manual-url',
        category
      }
      
      const savedImage = await imageDatabase.saveImage(imageData)
      
      onChange(urlInput)
      onMetadataChange?.(savedImage)
      setUrlInput('')
      toast.success('Image URL added successfully!')
      
    } catch (error) {
      console.error('URL validation failed:', error)
      toast.error('Failed to validate image URL')
    } finally {
      setValidatingUrl(false)
    }
  }
  
  // Handle clipboard paste
  const handleClipboardPasteEvent = useCallback(async (e: ClipboardEvent) => {
    if (!document.activeElement?.closest('.upload-area')) return
    
    const file = await handleClipboardPaste(e)
    if (file) {
      setUploadMethod('clipboard')
      handleFile(file)
    }
  }, [handleFile])
  
  // Add clipboard listener
  useEffect(() => {
    document.addEventListener('paste', handleClipboardPasteEvent)
    return () => {
      document.removeEventListener('paste', handleClipboardPasteEvent)
    }
  }, [handleClipboardPasteEvent])
  
  // Handle retry
  const handleRetry = () => {
    if (fileInputRef.current?.files?.[0]) {
      setRetryCount(prev => prev + 1)
      handleFile(fileInputRef.current.files[0], true) // Skip cropping on retry
    }
  }
  
  // Handle crop completion
  const handleCropComplete = async (croppedBlob: Blob, originalSrc: string) => {
    // Don't close the cropper immediately - wait for successful processing
    
    try {
      if (imageToCrop?.file) {
        // For file-based crops, create a new file from the blob
        try {
          const croppedFile = blobToFile(croppedBlob, imageToCrop.file.name)
          await handleFile(croppedFile, true) // Skip cropping since already cropped
          
          // Only close cropper after successful upload
          setShowCropper(false)
          setImageToCrop(null)
        } catch (error) {
          console.error('Failed to upload cropped file:', error)
          toast.error('Failed to upload cropped image. Please try again or cancel.')
          // Don't close cropper on error - let user try again
          return
        }
        
      } else if (imageToCrop?.originalUrl) {
        // For URL-based crops, upload the blob directly
        setIsUploading(true)
        setUploadProgress(null)
        
        try {
          const filename = imageToCrop.originalUrl.split('/').pop() || 'cropped-image'
          const croppedFile = blobToFile(croppedBlob, filename)
          
          const result = await uploadServiceRef.current!.uploadWithFallback(croppedFile, {
            maxRetries: 2
          })
          
          if (!result || !result.url) {
            throw new Error('Upload failed - no URL returned')
          }
          
          // Save to database
          const savedImage = await imageDatabase.saveImage({
            url: result.url,
            filename: result.metadata.filename || filename,
            original_filename: result.metadata.original_filename || filename,
            file_size: result.metadata.file_size,
            width: result.metadata.width,
            height: result.metadata.height,
            mime_type: result.metadata.mime_type || croppedFile.type,
            upload_service: result.metadata.upload_service || result.service,
            category
          })
          
          if (!savedImage) {
            throw new Error('Failed to save image to database')
          }
          
          // Update form only after successful upload and database save
          onChange(result.url)
          onFileNameChange?.(filename)
          onMetadataChange?.(savedImage)
          setUrlInput('')
          
          toast.success(`Cropped image uploaded successfully via ${result.service}!`)
          
          // Only close cropper after successful upload
          setShowCropper(false)
          setImageToCrop(null)
          
        } catch (error) {
          console.error('Upload failed:', error)
          toast.error(error instanceof Error ? error.message : 'Upload failed')
          // Don't close cropper on error - let user try again or cancel
          return
        } finally {
          setIsUploading(false)
          setUploadProgress(null)
        }
      } else {
        console.error('No image to crop found')
        toast.error('No image found for cropping')
        setShowCropper(false)
        setImageToCrop(null)
      }
    } catch (error) {
      console.error('Crop processing error:', error)
      toast.error('Failed to process cropped image. Please try again.')
      // Don't close cropper on error - let user try again or cancel
    }
  }
  
  // Handle crop cancel
  const handleCropCancel = () => {
    setShowCropper(false)
    setImageToCrop(null)
  }
  
  // Handle gallery image selection
  const handleGalleryImageSelect = async (image: UploadedImage) => {
    console.log('Gallery image selected:', image)
    setShowGalleryModal(false)
    
    // If cropping is enabled, show cropper for gallery images
    if (enableCropping) {
      console.log('Cropping enabled - opening cropper for gallery image')
      setImageToCrop({ src: image.url, originalUrl: image.url })
      setShowCropper(true)
      return
    }
    
    console.log('Cropping disabled - directly using gallery image')
    // Direct selection without cropping
    onChange(image.url)
    onFileNameChange?.(image.filename)
    onMetadataChange?.(image)
    toast.success('Image selected from gallery!')
  }
  
  // Clear file
  const clearFile = () => {
    onChange('')
    onFileNameChange?.('')
    setUrlInput('')
    setUploadedFiles([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  // Open file dialog
  const openFileDialog = () => {
    fileInputRef.current?.click()
  }
  
  const methods = [
    { id: 'drag', name: 'Drag & Drop', icon: Upload, description: 'Drag files here or click to browse' },
    { id: 'url', name: 'URL', icon: Link2, description: 'Enter image URL directly' },
    { id: 'clipboard', name: 'Paste', icon: Clipboard, description: 'Paste from clipboard (Ctrl+V)' },
    { id: 'gallery', name: 'Gallery', icon: FolderOpen, description: 'Choose from uploaded images' }
  ]
  
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        
        <div className="flex items-center gap-3">
          {/* Cropping Toggle */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 flex items-center gap-1.5">
              <Crop size={12} />
              <span>Crop</span>
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enableCropping}
                onChange={(e) => setEnableCropping(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-9 h-5 rounded-full transition-colors ${
                enableCropping ? 'bg-blue-600' : 'bg-gray-200'
              }`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform transform ${
                  enableCropping ? 'translate-x-4' : 'translate-x-0.5'
                } mt-0.5`} />
              </div>
            </label>
          </div>
          
          {/* Upload Method Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {methods.map((method) => {
              const IconComponent = method.icon
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => {
                    setUploadMethod(method.id as any)
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    uploadMethod === method.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title={method.description}
                >
                  <IconComponent size={14} />
                  <span className="hidden sm:inline">{method.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
      
      {/* Upload Progress */}
      {uploadProgress && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">
              {uploadProgress.status === 'uploading' && 'Uploading...'}
              {uploadProgress.status === 'processing' && 'Processing...'}
              {uploadProgress.status === 'completed' && 'Completed!'}
              {uploadProgress.status === 'error' && 'Error occurred'}
              {uploadProgress.status === 'retrying' && `Retrying... (${retryCount + 1})`}
            </span>
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <span>{uploadProgress.service}</span>
              {uploadProgress.status === 'uploading' && (
                <Loader2 className="animate-spin" size={16} />
              )}
              {uploadProgress.status === 'completed' && (
                <CheckCircle size={16} />
              )}
              {uploadProgress.status === 'error' && (
                <AlertCircle size={16} />
              )}
            </div>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress.percentage}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Main Upload Area */}
      {uploadMethod === 'drag' && (
        <div
          className={`upload-area relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 ${
            dragActive
              ? 'border-blue-400 bg-blue-50 scale-105'
              : 'border-gray-300 hover:border-gray-400'
          } ${
            isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={!isUploading ? openFileDialog : undefined}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInputChange}
            accept={accept}
            multiple={allowMultiple}
            className="hidden"
          />
          
          <div className="text-center">
            {value ? (
              <div className="space-y-4">
                {/* Image Preview */}
                {value.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                  <div className="mx-auto w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={value}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Failed to load image preview:', value)
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Image uploaded</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      clearFile()
                    }}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 break-all">{value}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`transition-all duration-300 ${
                  dragActive ? 'scale-110' : ''
                }`}>
                  <Upload className={`mx-auto h-16 w-16 ${
                    dragActive ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                </div>
                
                <div>
                  <p className="text-xl font-medium text-gray-900">
                    {isUploading ? 'Uploading...' : dragActive ? 'Drop files here!' : 'Drop your images here'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">or</p>
                  <button
                    type="button"
                    disabled={isUploading}
                    className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Choose {allowMultiple ? 'Files' : 'File'}
                  </button>
                </div>
                
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <span>PNG, JPG, GIF, WebP</span>
                  <span>•</span>
                  <span>Max 32MB</span>
                  <span>•</span>
                  <span>Auto-resize to 1920×1080</span>
                </div>
                
                {/* Clipboard hint */}
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg p-2">
                  <Clipboard size={12} />
                  <span>You can also paste images here (Ctrl+V)</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Retry button for failed uploads */}
          {uploadProgress?.status === 'error' && (
            <div className="absolute inset-x-0 bottom-4 flex justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRetry()
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <RefreshCcw size={16} />
                Retry Upload
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* URL Input Method */}
      {uploadMethod === 'url' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                ref={urlInputRef}
                type="url"
                placeholder="Enter image URL (https://...)" 
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleUrlSubmit()
                  }
                }}
              />
            </div>
            <button
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim() || validatingUrl}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {validatingUrl ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Eye size={16} />
              )}
              {validatingUrl ? 'Validating...' : 'Add Image'}
            </button>
          </div>
          
          <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
            <p className="font-medium mb-1">Supported image URLs:</p>
            <ul className="text-xs space-y-1">
              <li>• Direct links to JPG, PNG, GIF, or WebP images</li>
              <li>• URLs ending with image file extensions</li>
              <li>• Images must be publicly accessible</li>
            </ul>
          </div>
        </div>
      )}
      
      {/* Gallery Selection Method */}
      {uploadMethod === 'gallery' && (
        <div className="space-y-4">
          <div className="text-center">
            <button
              onClick={() => {
                console.log('Gallery button clicked - opening gallery modal')
                setShowGalleryModal(true)
              }}
              className="w-full px-6 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex flex-col items-center gap-4"
            >
              <FolderOpen className="h-16 w-16 text-gray-400" />
              <div>
                <p className="text-xl font-medium text-gray-900">Browse Image Gallery</p>
                <p className="text-sm text-gray-500 mt-2">Select from previously uploaded images</p>
              </div>
            </button>
          </div>
          
          <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
            <p className="font-medium mb-1">Gallery Selection Features:</p>
            <ul className="text-xs space-y-1">
              <li>• Browse all uploaded images with search and filters</li>
              <li>• Crop selected images if cropping is enabled</li>
              <li>• Organize by categories and upload services</li>
              <li>• Grid and list view options</li>
            </ul>
          </div>
        </div>
      )}
      
      {/* Multiple Files Display */}
      {allowMultiple && uploadedFiles.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Uploaded Files ({uploadedFiles.length})
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {uploadedFiles.map((url, index) => (
              <div key={index} className="aspect-square bg-white rounded border overflow-hidden">
                <img
                  src={url}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Service Status Indicator */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Zap size={12} />
          <span>Multi-service upload with automatic fallback</span>
        </div>
      </div>
      
      {/* Image Cropper Modal */}
      {showCropper && imageToCrop && (
        <ImageCropper
          imageSrc={imageToCrop.src}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={null} // Free aspect ratio by default
          minZoom={0.5}
          maxZoom={3}
          cropShape="rect"
          showGrid={true}
        />
      )}
      
      {/* Gallery Modal */}
      {showGalleryModal && (
        <>
          {console.log('Rendering gallery modal, showGalleryModal:', showGalleryModal)}
          <ImageGalleryModal
            isOpen={showGalleryModal}
            onClose={() => {
              console.log('Gallery modal onClose called')
              setShowGalleryModal(false)
            }}
            onSelectImage={handleGalleryImageSelect}
            category={category}
            mode="select"
          />
        </>
      )}
    </div>
  )
}