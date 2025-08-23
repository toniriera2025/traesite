import { supabase } from '@/lib/supabase'
import type { UploadedImage, UploadServiceStatus } from '@/types/upload'

// Image database operations
export const imageDatabase = {
  // Get all uploaded images with optional filtering
  async getAllImages(filters?: {
    category?: string
    search?: string
    uploadService?: string
    limit?: number
    offset?: number
  }) {
    let query = supabase
      .from('uploaded_images')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.search) {
      query = query.or(`filename.ilike.%${filters.search}%,description.ilike.%${filters.search}%,alt_text.ilike.%${filters.search}%`)
    }

    if (filters?.uploadService) {
      query = query.eq('upload_service', filters.uploadService)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1)
    }

    const { data, error } = await query
    if (error) throw error
    return data as UploadedImage[]
  },

  // Save uploaded image to database
  async saveImage(imageData: Omit<UploadedImage, 'id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('uploaded_images')
      .insert({
        ...imageData,
        uploaded_by: user?.id
      })
      .select()
      .maybeSingle()

    if (error) throw error
    return data as UploadedImage
  },

  // Update image metadata
  async updateImage(id: string, updates: Partial<UploadedImage>) {
    const { data, error } = await supabase
      .from('uploaded_images')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) throw error
    return data as UploadedImage
  },

  // Delete image (soft delete)
  async deleteImage(id: string) {
    const { data, error } = await supabase
      .from('uploaded_images')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) throw error
    return data as UploadedImage
  },

  // Get image by URL
  async getImageByUrl(url: string) {
    const { data, error } = await supabase
      .from('uploaded_images')
      .select('*')
      .eq('url', url)
      .eq('is_active', true)
      .maybeSingle()

    if (error) throw error
    return data as UploadedImage | null
  },

  // Get images by category
  async getImagesByCategory(category: string, limit = 20) {
    const { data, error } = await supabase
      .from('uploaded_images')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as UploadedImage[]
  }
}

// Service status operations
export const serviceStatusDatabase = {
  // Get all service statuses
  async getAllStatuses() {
    const { data, error } = await supabase
      .from('upload_service_status')
      .select('*')
      .order('service_name')

    if (error) throw error
    return data as UploadServiceStatus[]
  },

  // Update service status
  async updateServiceStatus(serviceName: string, updates: Partial<UploadServiceStatus>) {
    const { data, error } = await supabase
      .from('upload_service_status')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('service_name', serviceName)
      .select()
      .maybeSingle()

    if (error) throw error
    return data as UploadServiceStatus
  },

  // Record upload attempt
  async recordUploadAttempt(serviceName: string, success: boolean, responseTime?: number, errorMessage?: string) {
    // First get current stats
    const { data: currentStatus } = await supabase
      .from('upload_service_status')
      .select('total_uploads, successful_uploads')
      .eq('service_name', serviceName)
      .maybeSingle()

    const totalUploads = (currentStatus?.total_uploads || 0) + 1
    const successfulUploads = (currentStatus?.successful_uploads || 0) + (success ? 1 : 0)
    const successRate = (successfulUploads / totalUploads) * 100

    return this.updateServiceStatus(serviceName, {
      is_active: success,
      last_check: new Date().toISOString(),
      response_time: responseTime,
      error_message: success ? null : errorMessage,
      success_rate: successRate,
      total_uploads: totalUploads,
      successful_uploads: successfulUploads
    })
  },

  // Get active services ordered by performance
  async getActiveServices() {
    const { data, error } = await supabase
      .from('upload_service_status')
      .select('*')
      .eq('is_active', true)
      .order('success_rate', { ascending: false })
      .order('response_time', { ascending: true })

    if (error) throw error
    return data as UploadServiceStatus[]
  }
}