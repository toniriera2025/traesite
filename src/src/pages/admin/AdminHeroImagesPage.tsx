import { useState } from 'react'
import { useAllHeroImages, useCreateHeroImage, useUpdateHeroImage, useDeleteHeroImage } from '@/hooks/useData'
import { Plus, Edit2, Trash2, Eye, EyeOff, MoveUp, MoveDown, Image } from 'lucide-react'
import { FileUpload } from '@/components/admin/FileUpload'
import toast from 'react-hot-toast'

interface HeroImageFormData {
  image_url: string
  alt_text: string
  caption: string
  sort_order: number
  is_active: boolean
}

export function AdminHeroImagesPage() {
  const { data: heroImages = [], isLoading } = useAllHeroImages()
  const createHeroImageMutation = useCreateHeroImage()
  const updateHeroImageMutation = useUpdateHeroImage()
  const deleteHeroImageMutation = useDeleteHeroImage()
  
  const [showForm, setShowForm] = useState(false)
  const [editingImage, setEditingImage] = useState<any>(null)
  const [formData, setFormData] = useState<HeroImageFormData>({
    image_url: '',
    alt_text: '',
    caption: '',
    sort_order: 0,
    is_active: true
  })
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) || 0 : value
    }))
  }
  
  const resetForm = () => {
    setFormData({
      image_url: '',
      alt_text: '',
      caption: '',
      sort_order: heroImages.length,
      is_active: true
    })
    setEditingImage(null)
    setShowForm(false)
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingImage) {
        await updateHeroImageMutation.mutateAsync({
          id: editingImage.id,
          ...formData
        })
      } else {
        await createHeroImageMutation.mutateAsync(formData)
      }
      resetForm()
    } catch (error) {
      // Error handling is done in mutations
    }
  }
  
  const handleEdit = (image: any) => {
    setEditingImage(image)
    setFormData({
      image_url: image.image_url || '',
      alt_text: image.alt_text || '',
      caption: image.caption || '',
      sort_order: image.sort_order || 0,
      is_active: image.is_active !== false
    })
    setShowForm(true)
  }
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this hero image?')) {
      await deleteHeroImageMutation.mutateAsync(id)
    }
  }
  
  const toggleActive = async (image: any) => {
    await updateHeroImageMutation.mutateAsync({
      id: image.id,
      is_active: !image.is_active
    })
  }
  
  const updateSortOrder = async (image: any, direction: 'up' | 'down') => {
    const currentIndex = heroImages.findIndex(img => img.id === image.id)
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    
    if (targetIndex < 0 || targetIndex >= heroImages.length) return
    
    const targetImage = heroImages[targetIndex]
    
    // Swap sort orders
    await Promise.all([
      updateHeroImageMutation.mutateAsync({
        id: image.id,
        sort_order: targetImage.sort_order
      }),
      updateHeroImageMutation.mutateAsync({
        id: targetImage.id,
        sort_order: image.sort_order
      })
    ])
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hero Images</h1>
          <p className="text-gray-600 mt-2">Manage the hero gallery images on your homepage</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
        >
          <Plus size={20} />
          <span>Add Hero Image</span>
        </button>
      </div>
      
      {/* Hero Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {heroImages.map((image, index) => (
          <div key={image.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="aspect-video relative">
              <img
                src={image.image_url}
                alt={image.alt_text || 'Hero image'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.jpg'
                }}
              />
              <div className="absolute top-2 left-2 flex space-x-1">
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  image.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {image.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                  #{image.sort_order}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <div className="mb-3">
                <h3 className="font-medium text-gray-900 truncate">
                  {image.caption || image.alt_text || 'Untitled'}
                </h3>
                {image.alt_text && (
                  <p className="text-sm text-gray-500 mt-1 truncate">{image.alt_text}</p>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateSortOrder(image, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <MoveUp size={16} />
                  </button>
                  <button
                    onClick={() => updateSortOrder(image, 'down')}
                    disabled={index === heroImages.length - 1}
                    className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <MoveDown size={16} />
                  </button>
                  <button
                    onClick={() => toggleActive(image)}
                    className="p-1 text-gray-600 hover:text-gray-900"
                    title={image.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {image.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(image)}
                    className="p-2 text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="p-2 text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {heroImages.length === 0 && (
        <div className="text-center py-12">
          <Image className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hero images</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding your first hero image.</p>
        </div>
      )}
      
      {/* Hero Image Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingImage ? 'Edit Hero Image' : 'Add New Hero Image'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <FileUpload
                  value={formData.image_url}
                  onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                  label="Hero Image"
                  folder="hero-images"
                  required
                  placeholder="Upload a hero image or enter URL manually"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    name="alt_text"
                    value={formData.alt_text}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Descriptive text for accessibility"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Caption
                  </label>
                  <textarea
                    name="caption"
                    value={formData.caption}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Optional caption for the image"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    name="sort_order"
                    value={formData.sort_order}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active (visible on website)</span>
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createHeroImageMutation.isPending || updateHeroImageMutation.isPending}
                    className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                  >
                    {createHeroImageMutation.isPending || updateHeroImageMutation.isPending 
                      ? 'Saving...' 
                      : editingImage ? 'Update' : 'Create'
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}