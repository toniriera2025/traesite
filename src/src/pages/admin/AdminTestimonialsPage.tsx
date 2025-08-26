import { useState } from 'react'
import { useTestimonials, useCreateTestimonial, useUpdateTestimonial, useDeleteTestimonial } from '@/hooks/useData'
import { Plus, Edit2, Trash2, Eye, EyeOff, MoveUp, MoveDown, Star } from 'lucide-react'
import { FileUpload } from '@/components/admin/FileUpload'
import toast from 'react-hot-toast'

interface TestimonialFormData {
  client_name: string
  client_role: string
  client_company: string
  client_image_url: string
  testimonial_text: string
  rating: number
  sort_order: number
  is_active: boolean
}

export function AdminTestimonialsPage() {
  const { data: testimonials = [], isLoading } = useTestimonials()
  const createTestimonialMutation = useCreateTestimonial()
  const updateTestimonialMutation = useUpdateTestimonial()
  const deleteTestimonialMutation = useDeleteTestimonial()
  
  const [showForm, setShowForm] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<any>(null)
  const [formData, setFormData] = useState<TestimonialFormData>({
    client_name: '',
    client_role: '',
    client_company: '',
    client_image_url: '',
    testimonial_text: '',
    rating: 5,
    sort_order: 0,
    is_active: true
  })
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) || 0 : value
    }))
  }
  
  const resetForm = () => {
    setFormData({
      client_name: '',
      client_role: '',
      client_company: '',
      client_image_url: '',
      testimonial_text: '',
      rating: 5,
      sort_order: testimonials.length,
      is_active: true
    })
    setEditingTestimonial(null)
    setShowForm(false)
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingTestimonial) {
        await updateTestimonialMutation.mutateAsync({
          id: editingTestimonial.id,
          ...formData
        })
      } else {
        await createTestimonialMutation.mutateAsync(formData)
      }
      resetForm()
    } catch (error) {
      // Error handling is done in mutations
    }
  }
  
  const handleEdit = (testimonial: any) => {
    setEditingTestimonial(testimonial)
    setFormData({
      client_name: testimonial.client_name || '',
      client_role: testimonial.client_role || '',
      client_company: testimonial.client_company || '',
      client_image_url: testimonial.client_image_url || '',
      testimonial_text: testimonial.testimonial_text || '',
      rating: testimonial.rating || 5,
      sort_order: testimonial.sort_order || 0,
      is_active: testimonial.is_active !== false
    })
    setShowForm(true)
  }
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      await deleteTestimonialMutation.mutateAsync(id)
    }
  }
  
  const toggleActive = async (testimonial: any) => {
    await updateTestimonialMutation.mutateAsync({
      id: testimonial.id,
      is_active: !testimonial.is_active
    })
  }
  
  const updateSortOrder = async (testimonial: any, direction: 'up' | 'down') => {
    const currentIndex = testimonials.findIndex(t => t.id === testimonial.id)
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    
    if (targetIndex < 0 || targetIndex >= testimonials.length) return
    
    const targetTestimonial = testimonials[targetIndex]
    
    // Swap sort orders
    await Promise.all([
      updateTestimonialMutation.mutateAsync({
        id: testimonial.id,
        sort_order: targetTestimonial.sort_order
      }),
      updateTestimonialMutation.mutateAsync({
        id: targetTestimonial.id,
        sort_order: testimonial.sort_order
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
          <h1 className="text-3xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-gray-600 mt-2">Manage client testimonials and reviews</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
        >
          <Plus size={20} />
          <span>Add Testimonial</span>
        </button>
      </div>
      
      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <div key={testimonial.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              {/* Client Info */}
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {testimonial.client_image_url ? (
                    <img
                      src={testimonial.client_image_url}
                      alt={testimonial.client_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.jpg'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-lg font-medium">
                        {testimonial.client_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="font-semibold text-gray-900">{testimonial.client_name}</h3>
                  <p className="text-sm text-gray-600">
                    {testimonial.client_role}{testimonial.client_company && ` at ${testimonial.client_company}`}
                  </p>
                </div>
              </div>
              
              {/* Rating */}
              {testimonial.rating && (
                <div className="flex items-center mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={`${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">({testimonial.rating}/5)</span>
                </div>
              )}
              
              {/* Testimonial Text */}
              <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-4">
                "{testimonial.testimonial_text}"
              </p>
              
              {/* Status and Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    testimonial.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {testimonial.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                    #{testimonial.sort_order}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => updateSortOrder(testimonial, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <MoveUp size={14} />
                  </button>
                  <button
                    onClick={() => updateSortOrder(testimonial, 'down')}
                    disabled={index === testimonials.length - 1}
                    className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <MoveDown size={14} />
                  </button>
                  <button
                    onClick={() => toggleActive(testimonial)}
                    className="p-1 text-gray-600 hover:text-gray-900"
                    title={testimonial.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {testimonial.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    onClick={() => handleEdit(testimonial)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial.id)}
                    className="p-1 text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {testimonials.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <Star className="w-full h-full" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No testimonials</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding your first client testimonial.</p>
        </div>
      )}
      
      {/* Testimonial Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Name *
                    </label>
                    <input
                      type="text"
                      name="client_name"
                      value={formData.client_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Role
                    </label>
                    <input
                      type="text"
                      name="client_role"
                      value={formData.client_role}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="e.g., CEO, Marketing Director"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="client_company"
                    value={formData.client_company}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Company or organization name"
                  />
                </div>
                
                <FileUpload
                  value={formData.client_image_url}
                  onChange={(url) => setFormData(prev => ({ ...prev, client_image_url: url }))}
                  label="Client Photo"
                  folder="testimonials"
                  placeholder="Upload client photo or enter URL manually"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Testimonial Text *
                  </label>
                  <textarea
                    name="testimonial_text"
                    value={formData.testimonial_text}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="What did the client say about your work?"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rating
                    </label>
                    <select
                      name="rating"
                      value={formData.rating}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    >
                      <option value={5}>5 Stars</option>
                      <option value={4}>4 Stars</option>
                      <option value={3}>3 Stars</option>
                      <option value={2}>2 Stars</option>
                      <option value={1}>1 Star</option>
                    </select>
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
                    disabled={createTestimonialMutation.isPending || updateTestimonialMutation.isPending}
                    className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                  >
                    {createTestimonialMutation.isPending || updateTestimonialMutation.isPending 
                      ? 'Saving...' 
                      : editingTestimonial ? 'Update' : 'Create'
                    } Testimonial
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