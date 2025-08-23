import { useState } from 'react'
import {
  useProjectById,
  useProjectImages,
  useCreateProjectImage,
  useUpdateProjectImage,
  useDeleteProjectImage,
  usePromoteToMainImage,
  useReorderProjectImages
} from '@/hooks/useData'
import { ArrowLeft, Plus, Crown, Trash2, Edit2, GripVertical } from 'lucide-react'
import { FileUpload } from './FileUpload'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import toast from 'react-hot-toast'

interface ProjectImageFormData {
  image_url: string
  alt_text: string
  caption: string
  sort_order: number
}

interface ProjectImageManagerProps {
  projectId: string
  onBack: () => void
}

export function ProjectImageManager({ projectId, onBack }: ProjectImageManagerProps) {
  const { data: project, isLoading: isProjectLoading } = useProjectById(projectId)
  const { data: projectImages = [], isLoading: isImagesLoading } = useProjectImages(projectId)
  const createProjectImageMutation = useCreateProjectImage()
  const updateProjectImageMutation = useUpdateProjectImage()
  const deleteProjectImageMutation = useDeleteProjectImage()
  const promoteToMainImageMutation = usePromoteToMainImage()
  const reorderProjectImagesMutation = useReorderProjectImages()
  
  const [showImageForm, setShowImageForm] = useState(false)
  const [editingImage, setEditingImage] = useState<any>(null)
  const [imageFormData, setImageFormData] = useState<ProjectImageFormData>({
    image_url: '',
    alt_text: '',
    caption: '',
    sort_order: 0
  })
  
  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setImageFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }))
  }
  
  const resetImageForm = () => {
    setImageFormData({
      image_url: '',
      alt_text: '',
      caption: '',
      sort_order: projectImages.length
    })
    setEditingImage(null)
    setShowImageForm(false)
  }
  
  const handleImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!imageFormData.image_url || imageFormData.image_url.trim() === '') {
      toast.error('Please select an image before submitting')
      return
    }
    
    try {
      if (editingImage) {
        await updateProjectImageMutation.mutateAsync({
          id: editingImage.id,
          ...imageFormData
        })
        toast.success('Image updated successfully')
      } else {
        await createProjectImageMutation.mutateAsync({
          project_id: projectId,
          ...imageFormData
        })
        toast.success('Image added successfully')
      }
      resetImageForm()
    } catch (error) {
      console.error('Failed to save image:', error)
      toast.error('Failed to save image. Please try again.')
    }
  }
  
  const handleEditImage = (image: any) => {
    setEditingImage(image)
    setImageFormData({
      image_url: image.image_url || '',
      alt_text: image.alt_text || '',
      caption: image.caption || '',
      sort_order: image.sort_order || 0
    })
    setShowImageForm(true)
  }
  
  const handleDeleteImage = async (imageId: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      await deleteProjectImageMutation.mutateAsync({ id: imageId, projectId: project.id })
    }
  }
  
  // Handle promoting additional image to main image
  const handlePromoteToMain = async (image: any) => {
    const confirmMessage = `Set this image as the main project image?\n\nThe current main image will be moved to additional images.`
    
    if (window.confirm(confirmMessage)) {
      try {
        await promoteToMainImageMutation.mutateAsync({
          projectId: projectId,
          newMainImageUrl: image.image_url,
          newMainImageAlt: image.alt_text || '',
          previousMainImageUrl: project.main_image_url
        })
        
        // Remove the promoted image from additional images
        await deleteProjectImageMutation.mutateAsync({ 
          id: image.id, 
          projectId: projectId 
        })
      } catch (error) {
        // Error handling is done in mutations
      }
    }
  }
  
  // Handle drag and drop reordering
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return
    
    const items = Array.from(projectImages)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    
    // Update sort_order for all affected items
    const imageUpdates = items.map((item, index) => ({
      id: item.id,
      sort_order: index
    }))
    
    try {
      await reorderProjectImagesMutation.mutateAsync({
        projectId: projectId,
        imageUpdates
      })
    } catch (error) {
      // Error handling is done in mutations
    }
  }
  
  const isLoading = isProjectLoading || isImagesLoading
  
  if (isLoading || !project) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span>Back to Projects</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Images</h1>
            <p className="text-gray-600 mt-1">{project.title}</p>
          </div>
        </div>
        <button
          onClick={() => setShowImageForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
        >
          <Plus size={20} />
          <span>Add Image</span>
        </button>
      </div>
      
      {/* Main Project Image */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <h2 className="text-xl font-bold mb-4">Main Project Image</h2>
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            <img
              className="w-48 h-32 object-cover rounded-lg border-2 border-yellow-400"
              src={project.main_image_url || '/placeholder.jpg'}
              alt={project.main_image_alt || project.title}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <span className="font-medium text-gray-900">Main Image</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Alt Text: {project.main_image_alt || 'No alt text'}
            </p>
            <p className="text-xs text-gray-500 break-all">
              {project.main_image_url}
            </p>
          </div>
        </div>
      </div>
      
      {/* Additional Project Images */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Additional Images</h2>
        
        {projectImages.length > 0 ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="project-images">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {projectImages.map((image, index) => (
                    <Draggable key={image.id} draggableId={image.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center space-x-4 p-4 border rounded-lg transition-all ${
                            snapshot.isDragging ? 'shadow-lg bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                          }`}
                        >
                          {/* Drag Handle */}
                          <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                            <GripVertical className="h-5 w-5 text-gray-400" />
                          </div>
                          
                          {/* Image Preview */}
                          <div className="flex-shrink-0">
                            <img
                              className="w-20 h-20 object-cover rounded-lg"
                              src={image.image_url}
                              alt={image.alt_text || `Image ${index + 1}`}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = '/placeholder.jpg'
                              }}
                            />
                          </div>
                          
                          {/* Image Details */}
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {image.alt_text || `Image ${index + 1}`}
                            </div>
                            {image.caption && (
                              <div className="text-sm text-gray-600 mt-1">{image.caption}</div>
                            )}
                            <div className="text-xs text-gray-500 mt-1">Sort order: {image.sort_order}</div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handlePromoteToMain(image)}
                              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-md hover:bg-yellow-200 transition-colors"
                              title="Set as main image"
                            >
                              <Crown size={14} />
                              <span>Set as Main</span>
                            </button>
                            <button
                              onClick={() => handleEditImage(image)}
                              className="text-gray-600 hover:text-gray-900"
                              title="Edit image"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteImage(image.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete image"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No additional images found. Add your first image to get started.</p>
          </div>
        )}
      </div>
      
      {/* Image Form Modal */}
      {showImageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingImage ? 'Edit Image' : 'Add New Image'}
              </h2>
              
              <form onSubmit={handleImageSubmit} className="space-y-4">
                <FileUpload
                  value={imageFormData.image_url}
                  onChange={(url) => setImageFormData(prev => ({ ...prev, image_url: url }))}
                  label="Image"
                  folder="projects"
                  placeholder="Upload image or enter URL manually"
                  category="projects"
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    name="alt_text"
                    value={imageFormData.alt_text}
                    onChange={handleImageInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Describe the image for accessibility"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Caption
                  </label>
                  <textarea
                    name="caption"
                    value={imageFormData.caption}
                    onChange={handleImageInputChange}
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
                    value={imageFormData.sort_order}
                    onChange={handleImageInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetImageForm}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createProjectImageMutation.isPending || updateProjectImageMutation.isPending}
                    className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                  >
                    {editingImage ? 'Update' : 'Add'} Image
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
