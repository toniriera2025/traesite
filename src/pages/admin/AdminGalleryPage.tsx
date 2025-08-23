import { useState, useEffect } from 'react'
import { Upload, Search, Filter, Grid, List, Download, Trash2, Edit3, Eye, Calendar, Folder, Image as ImageIcon, Plus, X, Crop } from 'lucide-react'
import { imageDatabase } from '@/lib/imageDatabase'
import { UploadService } from '@/lib/uploadService'
import { ImageCropper } from '@/components/admin/ImageCropper'
import { fileToDataUrl, blobToFile } from '@/lib/cropUtils'
import type { UploadedImage } from '@/types/upload'
import toast from 'react-hot-toast'

export default function AdminGalleryPage() {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [filteredImages, setFilteredImages] = useState<UploadedImage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedService, setSelectedService] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<{ src: string; file: File } | null>(null)
  const [enableCropping, setEnableCropping] = useState(true)
  
  const ITEMS_PER_PAGE = 20
  
  // Load images
  const loadImages = async (reset = false) => {
    try {
      setLoading(true)
      
      const filters = {
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchTerm || undefined,
        uploadService: selectedService === 'all' ? undefined : selectedService,
        limit: ITEMS_PER_PAGE,
        offset: reset ? 0 : (page - 1) * ITEMS_PER_PAGE
      }
      
      const newImages = await imageDatabase.getAllImages(filters)
      
      if (reset) {
        setImages(newImages)
        setFilteredImages(newImages)
        setPage(1)
      } else {
        setImages(prev => [...prev, ...newImages])
        setFilteredImages(prev => [...prev, ...newImages])
      }
      
      setHasMore(newImages.length === ITEMS_PER_PAGE)
    } catch (error) {
      console.error('Error loading images:', error)
      toast.error('Failed to load images')
    } finally {
      setLoading(false)
    }
  }
  
  // Load images on mount and filter changes
  useEffect(() => {
    loadImages(true)
  }, [searchTerm, selectedCategory, selectedService])
  
  // Handle file upload
  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return
    
    setIsUploading(true)
    const uploadService = new UploadService(() => {})
    
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not a valid image file`)
          continue
        }
        
        // If cropping is enabled, show cropper for each file
        if (enableCropping) {
          try {
            const dataUrl = await fileToDataUrl(file)
            setImageToCrop({ src: dataUrl, file })
            setShowCropper(true)
            setIsUploading(false)
            return // Handle one file at a time when cropping
          } catch (error) {
            console.error('Failed to prepare image for cropping:', error)
            toast.error(`Failed to prepare ${file.name} for cropping. Uploading original...`)
            // Continue with normal upload
          }
        }
        
        const result = await uploadService.uploadWithFallback(file, { maxRetries: 2 })
        
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
          category: 'general'
        })
        
        toast.success(`${file.name} uploaded successfully!`)
      }
      
      // Reload images
      if (!enableCropping) {
        loadImages(true)
        setShowUploadModal(false)
      }
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Upload failed. Please try again.')
    } finally {
      if (!enableCropping) {
        setIsUploading(false)
      }
    }
  }
  
  // Handle drag and drop
  const [dragActive, setDragActive] = useState(false)
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files.length) {
      handleFileUpload(files)
    }
  }
  
  // Delete image
  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return
    
    try {
      await imageDatabase.deleteImage(imageId)
      setImages(prev => prev.filter(img => img.id !== imageId))
      setFilteredImages(prev => prev.filter(img => img.id !== imageId))
      toast.success('Image deleted successfully')
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error('Failed to delete image')
    }
  }
  
  // Bulk delete
  const handleBulkDelete = async () => {
    if (!selectedImages.size || !confirm(`Delete ${selectedImages.size} selected images?`)) return
    
    try {
      for (const imageId of selectedImages) {
        await imageDatabase.deleteImage(imageId)
      }
      
      setImages(prev => prev.filter(img => !selectedImages.has(img.id)))
      setFilteredImages(prev => prev.filter(img => !selectedImages.has(img.id)))
      setSelectedImages(new Set())
      toast.success(`${selectedImages.size} images deleted successfully`)
    } catch (error) {
      console.error('Error in bulk delete:', error)
      toast.error('Failed to delete some images')
    }
  }
  
  // Handle crop completion
  const handleCropComplete = async (croppedBlob: Blob, originalSrc: string) => {
    setShowCropper(false)
    
    if (!imageToCrop) return
    
    setIsUploading(true)
    const uploadService = new UploadService(() => {})
    
    try {
      const croppedFile = blobToFile(croppedBlob, imageToCrop.file.name)
      
      const result = await uploadService.uploadWithFallback(croppedFile, { maxRetries: 2 })
      
      // Save to database
      await imageDatabase.saveImage({
        url: result.url,
        filename: result.metadata.filename || croppedFile.name,
        original_filename: result.metadata.original_filename || croppedFile.name,
        file_size: result.metadata.file_size,
        width: result.metadata.width,
        height: result.metadata.height,
        mime_type: result.metadata.mime_type || croppedFile.type,
        upload_service: result.metadata.upload_service || result.service,
        category: 'general'
      })
      
      toast.success(`Cropped image uploaded successfully!`)
      
      // Reload images
      loadImages(true)
      setShowUploadModal(false)
      
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
      setImageToCrop(null)
    }
  }
  
  // Handle crop cancel
  const handleCropCancel = () => {
    setShowCropper(false)
    setImageToCrop(null)
    setIsUploading(false)
  }
  
  const categories = [...new Set(images.map(img => img.category))]
  const services = [...new Set(images.map(img => img.upload_service))]
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Image Gallery</h1>
              <p className="text-gray-600 mt-2">Manage your uploaded images and media files</p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Upload Images
            </button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Images</h3>
              <p className="text-2xl font-bold text-gray-900">{images.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Categories</h3>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Services</h3>
              <p className="text-2xl font-bold text-gray-900">{services.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Selected</h3>
              <p className="text-2xl font-bold text-gray-900">{selectedImages.size}</p>
            </div>
          </div>
          
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                />
              </div>
              
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              {/* Service Filter */}
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Services</option>
                {services.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
              
              {/* View Mode */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
            
            {/* Bulk Actions */}
            {selectedImages.size > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {selectedImages.size} image{selectedImages.size !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete Selected
                </button>
                <button
                  onClick={() => setSelectedImages(new Set())}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Images Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading images...</span>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No images found</h3>
            <p className="mt-1 text-sm text-gray-500">Upload some images to get started.</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' 
            : 'space-y-4'
          }>
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow ${
                  viewMode === 'grid' ? 'aspect-square' : 'flex items-center p-4'
                }`}
              >
                {viewMode === 'grid' ? (
                  <div className="h-full flex flex-col">
                    <div className="flex-1 relative group">
                      <img
                        src={image.url}
                        alt={image.filename}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-t-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <button
                            onClick={() => window.open(image.url, '_blank')}
                            className="bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteImage(image.id)}
                            className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="absolute top-2 left-2">
                        <input
                          type="checkbox"
                          checked={selectedImages.has(image.id)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedImages)
                            if (e.target.checked) {
                              newSelected.add(image.id)
                            } else {
                              newSelected.delete(image.id)
                            }
                            setSelectedImages(newSelected)
                          }}
                          className="w-4 h-4"
                        />
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{image.filename}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {image.upload_service} • {(image.file_size ? image.file_size / 1024 / 1024 : 0).toFixed(1)}MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <input
                      type="checkbox"
                      checked={selectedImages.has(image.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedImages)
                        if (e.target.checked) {
                          newSelected.add(image.id)
                        } else {
                          newSelected.delete(image.id)
                        }
                        setSelectedImages(newSelected)
                      }}
                      className="mr-4"
                    />
                    <img
                      src={image.url}
                      alt={image.filename}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="ml-4 flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{image.filename}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {image.upload_service} • {(image.file_size ? image.file_size / 1024 / 1024 : 0).toFixed(1)}MB
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(image.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.open(image.url, '_blank')}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteImage(image.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Load More */}
        {hasMore && !loading && (
          <div className="text-center mt-8">
            <button
              onClick={() => {
                setPage(prev => prev + 1)
                loadImages(false)
              }}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Load More Images
            </button>
          </div>
        )}
      </div>
      
      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Upload Images</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              {/* Cropping Toggle */}
              <div className="flex items-center gap-3 mt-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 flex items-center gap-1.5">
                    <Crop size={14} />
                    <span>Enable cropping for uploaded images</span>
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableCropping}
                      onChange={(e) => setEnableCropping(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors ${
                      enableCropping ? 'bg-blue-600' : 'bg-gray-200'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                        enableCropping ? 'translate-x-5' : 'translate-x-0.5'
                      } mt-0.5`} />
                    </div>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Drag & Drop Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  dragActive 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                } ${
                  isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.multiple = true
                  input.accept = 'image/*'
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files
                    if (files) handleFileUpload(files)
                  }
                  input.click()
                }}
              >
                <Upload className={`mx-auto h-12 w-12 ${
                  dragActive ? 'text-blue-500' : 'text-gray-400'
                }`} />
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  {isUploading ? 'Uploading...' : dragActive ? 'Drop files here!' : 'Drop your images here'}
                </h3>
                <p className="text-sm text-gray-500 mt-2">or click to browse files</p>
                
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mt-4">
                  <span>PNG, JPG, GIF, WebP</span>
                  <span>•</span>
                  <span>Max 32MB per file</span>
                  <span>•</span>
                  <span>Multiple files supported</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
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
    </div>
  )
}