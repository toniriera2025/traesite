import { useState, useEffect, useCallback } from 'react'
import { X, Search, Filter, Grid, List, Download, Trash2, Edit3, Eye, Calendar, Folder, Image as ImageIcon } from 'lucide-react'
import { imageDatabase } from '@/lib/imageDatabase'
import { useAuth } from '@/lib/auth'
import type { UploadedImage } from '@/types/upload'
import toast from 'react-hot-toast'

interface ImageGalleryModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectImage: (image: UploadedImage) => void
  category?: string
  mode?: 'browse' | 'select' // Add mode to distinguish between browsing and selecting
}

export function ImageGalleryModal({ isOpen, onClose, onSelectImage, category, mode = 'browse' }: ImageGalleryModalProps) {
  const { user, loading: authLoading } = useAuth()
  const [images, setImages] = useState<UploadedImage[]>([])
  const [filteredImages, setFilteredImages] = useState<UploadedImage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(category || 'all')
  const [selectedService, setSelectedService] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [editingImage, setEditingImage] = useState<UploadedImage | null>(null)
  
  const ITEMS_PER_PAGE = 20
  
  // Load images
  const loadImages = useCallback(async (reset = false) => {
    // Don't load if not authenticated
    if (!user) {
      console.log('User not authenticated, skipping image load')
      setLoading(false)
      return
    }
    
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
      console.error('Failed to load images:', error)
      toast.error('Failed to load images')
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedCategory, selectedService, page])
  
  // Load images on mount and filter changes
  useEffect(() => {
    if (isOpen && !authLoading) {
      loadImages(true)
    }
  }, [isOpen, searchTerm, selectedCategory, selectedService, authLoading, user])
  
  // Handle image selection
  const handleImageSelect = (image: UploadedImage) => {
    if (mode === 'select') {
      // In select mode, just toggle selection instead of immediately selecting
      toggleImageSelection(image.id)
    } else {
      // In browse mode, immediately select
      console.log('Image selected in gallery modal:', image)
      console.log('Calling onSelectImage callback')
      onSelectImage(image)
      onClose()
    }
  }
  
  // Handle confirmed image selection (for select mode)
  const handleConfirmSelection = () => {
    if (selectedImages.size === 1 && mode === 'select') {
      const selectedImageId = Array.from(selectedImages)[0]
      const selectedImage = images.find(img => img.id === selectedImageId)
      if (selectedImage) {
        console.log('Confirming image selection in gallery modal:', selectedImage)
        onSelectImage(selectedImage)
        onClose()
      }
    }
  }
  
  // Handle multiple image selection (limited to single in select mode)
  const toggleImageSelection = (imageId: string) => {
    const newSelection = new Set(selectedImages)
    
    if (mode === 'select') {
      // In select mode, only allow single selection
      if (newSelection.has(imageId)) {
        newSelection.clear() // Deselect if already selected
      } else {
        newSelection.clear() // Clear any existing selection
        newSelection.add(imageId) // Add only this image
      }
    } else {
      // In browse mode, allow multiple selection
      if (newSelection.has(imageId)) {
        newSelection.delete(imageId)
      } else {
        newSelection.add(imageId)
      }
    }
    
    setSelectedImages(newSelection)
  }
  
  // Handle image deletion
  const handleDeleteImage = async (imageId: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await imageDatabase.deleteImage(imageId)
        setImages(prev => prev.filter(img => img.id !== imageId))
        setFilteredImages(prev => prev.filter(img => img.id !== imageId))
        toast.success('Image deleted successfully')
      } catch (error) {
        console.error('Failed to delete image:', error)
        toast.error('Failed to delete image')
      }
    }
  }
  
  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedImages.size === 0) return
    
    if (window.confirm(`Are you sure you want to delete ${selectedImages.size} images?`)) {
      try {
        await Promise.all(
          Array.from(selectedImages).map(id => imageDatabase.deleteImage(id))
        )
        setImages(prev => prev.filter(img => !selectedImages.has(img.id)))
        setFilteredImages(prev => prev.filter(img => !selectedImages.has(img.id)))
        setSelectedImages(new Set())
        toast.success(`${selectedImages.size} images deleted successfully`)
      } catch (error) {
        console.error('Failed to delete images:', error)
        toast.error('Failed to delete images')
      }
    }
  }
  
  // Handle image edit
  const handleEditImage = async (image: UploadedImage) => {
    setEditingImage(image)
  }
  
  // Save edited image
  const saveEditedImage = async (updates: Partial<UploadedImage>) => {
    if (!editingImage) return
    
    try {
      const updatedImage = await imageDatabase.updateImage(editingImage.id, updates)
      setImages(prev => prev.map(img => img.id === editingImage.id ? updatedImage : img))
      setFilteredImages(prev => prev.map(img => img.id === editingImage.id ? updatedImage : img))
      setEditingImage(null)
      toast.success('Image updated successfully')
    } catch (error) {
      console.error('Failed to update image:', error)
      toast.error('Failed to update image')
    }
  }
  
  // Load more images
  const loadMore = () => {
    setPage(prev => prev + 1)
    loadImages(false)
  }
  
  // Get unique categories and services for filters
  const categories = [...new Set(images.map(img => img.category).filter(Boolean))]
  const services = [...new Set(images.map(img => img.upload_service))]
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-start justify-center z-[9999] p-4 pt-20">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[70vh] overflow-hidden flex flex-col shadow-xl border border-gray-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {mode === 'select' ? 'Select Image' : 'Image Gallery'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
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
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
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
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List size={18} />
              </button>
            </div>
            
            {selectedImages.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedImages.size} selected
                </span>
                {mode === 'select' ? (
                  <button
                    onClick={handleConfirmSelection}
                    disabled={selectedImages.size !== 1}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    Use Selected Image
                  </button>
                ) : (
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {authLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Loading authentication...</p>
            </div>
          ) : !user ? (
            <div className="text-center py-12">
              <ImageIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
              <p className="text-gray-500">Please log in to view the image gallery</p>
            </div>
          ) : loading && images.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Loading images...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
              <p className="text-gray-500">Try adjusting your search or filters, or upload some images first</p>
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <div 
                        className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-blue-300 transition-all duration-200"
                        onClick={() => handleImageSelect(image)}
                      >
                        <img
                          src={image.url}
                          alt={image.alt_text || image.filename}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditImage(image)
                            }}
                            className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteImage(image.id)
                            }}
                            className="p-2 bg-white rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Selection checkbox */}
                      <div className="absolute top-2 left-2">
                        <input
                          type="checkbox"
                          checked={selectedImages.has(image.id)}
                          onChange={() => toggleImageSelection(image.id)}
                          className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      
                      {/* Service badge */}
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 text-xs bg-black bg-opacity-70 text-white rounded">
                          {image.upload_service}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* List View */}
              {viewMode === 'list' && (
                <div className="space-y-3">
                  {filteredImages.map((image) => (
                    <div key={image.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                         onClick={() => handleImageSelect(image)}>
                      <input
                        type="checkbox"
                        checked={selectedImages.has(image.id)}
                        onChange={() => toggleImageSelection(image.id)}
                        className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={image.url}
                          alt={image.alt_text || image.filename}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{image.filename}</h3>
                        <p className="text-sm text-gray-500 truncate">
                          {image.description || image.alt_text || 'No description'}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(image.created_at).toLocaleDateString()}
                          </span>
                          <span>{image.upload_service}</span>
                          {image.file_size && (
                            <span>{(image.file_size / 1024 / 1024).toFixed(1)}MB</span>
                          )}
                          {image.width && image.height && (
                            <span>{image.width}×{image.height}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditImage(image)
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteImage(image.id)
                          }}
                          className="p-2 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Load More */}
              {hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Edit Modal */}
      {editingImage && (
        <ImageEditModal
          image={editingImage}
          onSave={saveEditedImage}
          onClose={() => setEditingImage(null)}
        />
      )}
    </div>
  )
}

// Image Edit Modal Component
function ImageEditModal({ 
  image, 
  onSave, 
  onClose 
}: { 
  image: UploadedImage
  onSave: (updates: Partial<UploadedImage>) => void
  onClose: () => void 
}) {
  const [formData, setFormData] = useState({
    filename: image.filename || '',
    description: image.description || '',
    alt_text: image.alt_text || '',
    category: image.category || 'general'
  })
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Edit Image</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Preview */}
        <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-4">
          <img
            src={image.url}
            alt={image.alt_text || image.filename}
            className="w-full h-full object-cover"
          />
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filename
            </label>
            <input
              type="text"
              value={formData.filename}
              onChange={(e) => setFormData(prev => ({ ...prev, filename: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alt Text
            </label>
            <input
              type="text"
              value={formData.alt_text}
              onChange={(e) => setFormData(prev => ({ ...prev, alt_text: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="general">General</option>
              <option value="hero-images">Hero Images</option>
              <option value="projects">Projects</option>
              <option value="testimonials">Testimonials</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}