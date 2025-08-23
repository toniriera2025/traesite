import { useState, useEffect } from 'react'
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useReorderProjects
} from '@/hooks/useData'
import { Plus, Edit2, Trash2, Eye, Star, Image, GripVertical, ArrowUpDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { FileUpload } from '@/components/admin/FileUpload'
import { ProjectImageManager } from '@/components/admin/ProjectImageManager'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import toast from 'react-hot-toast'

interface ProjectFormData {
  title: string
  slug: string
  description: string
  category: string
  client: string
  is_featured: boolean
  main_image_url: string
  main_image_alt: string
  seo_title: string
  seo_description: string
}

export function AdminProjectsPage() {
  const { data: projects = [], isLoading } = useProjects()
  const createProjectMutation = useCreateProject()
  const updateProjectMutation = useUpdateProject()
  const deleteProjectMutation = useDeleteProject()
  const reorderProjectsMutation = useReorderProjects()
  
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)
  const [managingProjectImages, setManagingProjectImages] = useState<string | null>(null)
  const [localProjects, setLocalProjects] = useState<any[]>([])
  const [isDragging, setIsDragging] = useState(false)
  
  // Update local projects when data changes
  useEffect(() => {
    setLocalProjects([...projects])
  }, [projects])
  
  // Drag and drop handlers
  const handleDragStart = () => {
    setIsDragging(true)
  }
  
  const handleDragEnd = async (result: DropResult) => {
    setIsDragging(false)
    
    if (!result.destination) {
      return
    }
    
    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index
    
    if (sourceIndex === destinationIndex) {
      return
    }
    
    // Create new array with reordered items
    const reorderedProjects = Array.from(localProjects)
    const [movedProject] = reorderedProjects.splice(sourceIndex, 1)
    reorderedProjects.splice(destinationIndex, 0, movedProject)
    
    // Update local state immediately (optimistic update)
    setLocalProjects(reorderedProjects)
    
    // Generate new sort orders
    const projectOrders = reorderedProjects.map((project, index) => ({
      id: project.id,
      sort_order: index
    }))
    
    try {
      // Save to backend
      await reorderProjectsMutation.mutateAsync(projectOrders)
    } catch (error) {
      // Revert optimistic update on error
      setLocalProjects([...projects])
      toast.error('Failed to reorder projects')
    }
  }
  
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    slug: '',
    description: '',
    category: '',
    client: '',
    is_featured: false,
    main_image_url: '',
    main_image_alt: '',
    seo_title: '',
    seo_description: ''
  })
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }
  
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
      seo_title: title ? `${title} | TONI RIERA` : ''
    }))
  }
  
  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      category: '',
      client: '',
      is_featured: false,
      main_image_url: '',
      main_image_alt: '',
      seo_title: '',
      seo_description: ''
    })
    setEditingProject(null)
    setShowForm(false)
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingProject) {
        await updateProjectMutation.mutateAsync({
          id: editingProject.id,
          ...formData
        })
      } else {
        await createProjectMutation.mutateAsync(formData)
      }
      resetForm()
    } catch (error) {
      // Error handling is done in mutations
    }
  }
  
  const handleEdit = (project: any) => {
    setEditingProject(project)
    setFormData({
      title: project.title || '',
      slug: project.slug || '',
      description: project.description || '',
      category: project.category || '',
      client: project.client || '',
      is_featured: project.is_featured || false,
      main_image_url: project.main_image_url || '',
      main_image_alt: project.main_image_alt || '',
      seo_title: project.seo_title || '',
      seo_description: project.seo_description || ''
    })
    setShowForm(true)
  }
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await deleteProjectMutation.mutateAsync(id)
    }
  }
  
  const handleManageImages = (project: any) => {
    setManagingProjectImages(project.id)
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }
  
  // If managing project images, show the image management view
  if (managingProjectImages) {
    return (
      <ProjectImageManager
        projectId={managingProjectImages}
        onBack={() => setManagingProjectImages(null)}
      />
    )
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-2">Manage your portfolio projects</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
        >
          <Plus size={20} />
          <span>Add Project</span>
        </button>
      </div>
      
      {/* Project Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleTitleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug *
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="e.g., Automotive, Furniture"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client
                    </label>
                    <input
                      type="text"
                      name="client"
                      value={formData.client}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <FileUpload
                  value={formData.main_image_url}
                  onChange={(url) => setFormData(prev => ({ ...prev, main_image_url: url }))}
                  label="Main Project Image"
                  folder="projects"
                  placeholder="Upload main project image or enter URL manually"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image Alt Text
                  </label>
                  <input
                    type="text"
                    name="main_image_alt"
                    value={formData.main_image_alt}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Featured Project</span>
                  </label>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-3">SEO Settings</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      name="seo_title"
                      value={formData.seo_title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SEO Description
                    </label>
                    <textarea
                      name="seo_description"
                      value={formData.seo_description}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createProjectMutation.isPending || updateProjectMutation.isPending}
                    className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                  >
                    {editingProject ? 'Update' : 'Create'} Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Projects List with Drag & Drop */}
      <div className="space-y-4">
        {/* Header with reorder instructions */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-600">
              <ArrowUpDown size={18} />
              <span className="text-sm font-medium">Drag and drop to reorder projects</span>
              {reorderProjectsMutation.isPending && (
                <div className="flex items-center space-x-2 text-purple-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  <span className="text-sm">Saving order...</span>
                </div>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {localProjects.length} {localProjects.length === 1 ? 'project' : 'projects'}
            </div>
          </div>
        </div>

        {localProjects.length > 0 ? (
          <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <Droppable droppableId="projects-list">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`space-y-3 transition-colors duration-200 ${
                    snapshot.isDraggingOver ? 'bg-purple-50 rounded-lg p-2' : ''
                  }`}
                >
                  {localProjects.map((project, index) => (
                    <Draggable key={project.id} draggableId={project.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`bg-white rounded-lg border transition-all duration-200 ${
                            snapshot.isDragging
                              ? 'shadow-lg border-purple-300 transform rotate-2'
                              : isDragging
                              ? 'border-gray-200 opacity-80'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                          }`}
                        >
                          <div className="p-6">
                            <div className="flex items-center space-x-4">
                              {/* Drag Handle */}
                              <div
                                {...provided.dragHandleProps}
                                className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors cursor-grab ${
                                  snapshot.isDragging
                                    ? 'bg-purple-200 text-purple-700'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                                }`}
                              >
                                <GripVertical size={16} />
                              </div>

                              {/* Order Number */}
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
                                {index + 1}
                              </div>

                              {/* Project Image */}
                              <div className="flex-shrink-0 w-16 h-16">
                                <img
                                  className="w-full h-full rounded-lg object-cover"
                                  src={project.main_image_url || '/images/placeholder-project.jpg'}
                                  alt={project.title}
                                />
                              </div>

                              {/* Project Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                                    {project.title}
                                  </h3>
                                  {project.is_featured && (
                                    <Star className="h-5 w-5 text-yellow-400 fill-current flex-shrink-0" />
                                  )}
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  {project.category && (
                                    <span className="bg-gray-100 px-2 py-1 rounded-full">
                                      {project.category}
                                    </span>
                                  )}
                                  {project.client && <span>Client: {project.client}</span>}
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    project.status === 'published' 
                                      ? 'bg-green-100 text-green-800' 
                                      : project.status === 'draft'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {project.status}
                                  </span>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center space-x-2">
                                <Link
                                  to={`/portfolio/${project.slug}`}
                                  target="_blank"
                                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                                  title="View project"
                                >
                                  <Eye size={18} />
                                </Link>
                                <button
                                  onClick={() => handleManageImages(project)}
                                  className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                  title="Manage images"
                                >
                                  <Image size={18} />
                                </button>
                                <button
                                  onClick={() => handleEdit(project)}
                                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                                  title="Edit project"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(project.id)}
                                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                  title="Delete project"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
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
          <div className="bg-white rounded-lg border border-gray-200 text-center py-12">
            <div className="text-gray-500 mb-4">
              <Plus className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-500 mb-6">Create your first project to get started with your portfolio.</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create First Project
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
