import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, type Project, type HeroImage, type ContentBlock, type Testimonial, type SEOSettings, type ProjectImage } from '@/lib/supabase'
import { imageDatabase, serviceStatusDatabase } from '@/lib/imageDatabase'
import type { UploadedImage, UploadServiceStatus } from '@/types/upload'
import { getCurrentLanguage } from '@/lib/i18n'
import toast from 'react-hot-toast'

// Helper function to get content in current language with fallback
function getLocalizedContent(item: any, field: string, language?: string): string {
  const lang = language || getCurrentLanguage()
  const localizedField = `${field}_${lang}`
  const fallbackField = `${field}_en`
  
  // Try current language first, then English, then the original field
  return item[localizedField] || item[fallbackField] || item[field] || ''
}

// Helper function to get all language versions of a field
function getAllLanguageVersions(item: any, field: string) {
  return {
    en: item[`${field}_en`] || item[field] || '',
    es: item[`${field}_es`] || '',
    ca: item[`${field}_ca`] || ''
  }
}

// Helper function to process multilingual content
function processMultilingualItem(item: any): any {
  const language = getCurrentLanguage()
  
  return {
    ...item,
    // Add localized versions for easy access
    title: getLocalizedContent(item, 'title', language),
    description: getLocalizedContent(item, 'description', language),
    content: getLocalizedContent(item, 'content', language),
    seo_title: getLocalizedContent(item, 'seo_title', language),
    seo_description: getLocalizedContent(item, 'seo_description', language),
    meta_title: getLocalizedContent(item, 'meta_title', language),
    meta_description: getLocalizedContent(item, 'meta_description', language),
    og_title: getLocalizedContent(item, 'og_title', language),
    og_description: getLocalizedContent(item, 'og_description', language),
    
    // Testimonial-specific fields
    testimonial_text: getLocalizedContent(item, 'testimonial_text', language),
    client_role: getLocalizedContent(item, 'client_role', language),
    client_company: getLocalizedContent(item, 'client_company', language),
    
    // Keep all language versions for admin use
    translations: {
      title: getAllLanguageVersions(item, 'title'),
      description: getAllLanguageVersions(item, 'description'),
      content: getAllLanguageVersions(item, 'content'),
      testimonial_text: getAllLanguageVersions(item, 'testimonial_text'),
      client_role: getAllLanguageVersions(item, 'client_role'),
      client_company: getAllLanguageVersions(item, 'client_company')
    }
  }
}

// Content queries
export function useContentBlocks() {
  const language = getCurrentLanguage()
  
  return useQuery({
    queryKey: ['content-blocks', language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_blocks')
        .select('*')
        .order('section')
        
      if (error) throw error
      return (data as ContentBlock[]).map(processMultilingualItem)
    }
  })
}

export function useContentBlock(section: string) {
  const language = getCurrentLanguage()
  
  return useQuery({
    queryKey: ['content-block', section, language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('section', section)
        .maybeSingle()
        
      if (error) throw error
      return data ? processMultilingualItem(data) : null
    }
  })
}

// Hero images
export function useHeroImages() {
  return useQuery({
    queryKey: ['hero-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_images')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
        
      if (error) throw error
      return data as HeroImage[]
    }
  })
}

// All hero images (for admin)
export function useAllHeroImages() {
  return useQuery({
    queryKey: ['all-hero-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_images')
        .select('*')
        .order('sort_order')
        
      if (error) throw error
      return data as HeroImage[]
    }
  })
}

// Projects
export function useProjects() {
  const language = getCurrentLanguage()
  
  return useQuery({
    queryKey: ['projects', language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'published')
        .order('sort_order')
        
      if (error) throw error
      return (data as Project[]).map(processMultilingualItem)
    }
  })
}

export function useFeaturedProjects() {
  const language = getCurrentLanguage()
  
  return useQuery({
    queryKey: ['featured-projects', language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('sort_order')
        
      if (error) throw error
      return (data as Project[]).map(processMultilingualItem)
    }
  })
}

export function useProject(slug: string) {
  const language = getCurrentLanguage()
  
  return useQuery({
    queryKey: ['project', slug, language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle()
        
      if (error) throw error
      return data ? processMultilingualItem(data) : null
    },
    enabled: !!slug
  })
}

export function useProjectById(id: string) {
  const language = getCurrentLanguage()
  
  return useQuery({
    queryKey: ['project-by-id', id, language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .maybeSingle()
        
      if (error) throw error
      return data ? processMultilingualItem(data) : null
    },
    enabled: !!id
  })
}

// Project Images
export function useProjectImages(projectId: string) {
  return useQuery({
    queryKey: ['project-images', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_images')
        .select('*')
        .eq('project_id', projectId)
        .order('sort_order')
        
      if (error) throw error
      return data as ProjectImage[]
    },
    enabled: !!projectId
  })
}

// Testimonials
export function useTestimonials() {
  const language = getCurrentLanguage()
  
  return useQuery({
    queryKey: ['testimonials', language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
        
      if (error) throw error
      return (data as Testimonial[]).map(processMultilingualItem)
    }
  })
}

// SEO Settings
export function useSEOSettings(pagePath: string) {
  return useQuery({
    queryKey: ['seo-settings', pagePath],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_settings')
        .select('*')
        .eq('page_path', pagePath)
        .maybeSingle()
        
      if (error) throw error
      return data as SEOSettings | null
    }
  })
}

// Admin mutations (for CMS)
export function useUpdateContentBlock() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ section, content }: { section: string; content: string }) => {
      const { data, error } = await supabase
        .from('content_blocks')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('section', section)
        .select()
        .maybeSingle()
        
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-blocks'] })
      toast.success('Content updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update content')
    }
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (project: Partial<Project>) => {
      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single()
        
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create project')
    }
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Project> & { id: string }) => {
      const { data, error } = await supabase
        .from('projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
        
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project-by-id', data.id] })
      toast.success('Project updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update project')
    }
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete project')
    }
  })
}

// Hero Images mutations
export function useCreateHeroImage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (heroImage: Partial<HeroImage>) => {
      const { data, error } = await supabase
        .from('hero_images')
        .insert(heroImage)
        .select()
        .single()
        
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-images'] })
      queryClient.invalidateQueries({ queryKey: ['all-hero-images'] })
      toast.success('Hero image created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create hero image')
    }
  })
}

export function useUpdateHeroImage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HeroImage> & { id: string }) => {
      const { data, error } = await supabase
        .from('hero_images')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
        
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-images'] })
      queryClient.invalidateQueries({ queryKey: ['all-hero-images'] })
      toast.success('Hero image updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update hero image')
    }
  })
}

export function useDeleteHeroImage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('hero_images')
        .delete()
        .eq('id', id)
        
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-images'] })
      queryClient.invalidateQueries({ queryKey: ['all-hero-images'] })
      toast.success('Hero image deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete hero image')
    }
  })
}

// Project Images mutations
export function useCreateProjectImage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (projectImage: Partial<ProjectImage>) => {
      const { data, error } = await supabase
        .from('project_images')
        .insert(projectImage)
        .select()
        .single()
        
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project-images', data.project_id] })
      toast.success('Project image added successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add project image')
    }
  })
}

export function useUpdateProjectImage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProjectImage> & { id: string }) => {
      const { data, error } = await supabase
        .from('project_images')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
        
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project-images', data.project_id] })
      toast.success('Project image updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update project image')
    }
  })
}

export function useDeleteProjectImage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase
        .from('project_images')
        .delete()
        .eq('id', id)
        
      if (error) throw error
      return { projectId }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project-images', data.projectId] })
      toast.success('Project image deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete project image')
    }
  })
}

// Main Image Promotion Mutation
export function usePromoteToMainImage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      projectId, 
      newMainImageUrl, 
      newMainImageAlt, 
      previousMainImageUrl 
    }: { 
      projectId: string
      newMainImageUrl: string
      newMainImageAlt?: string
      previousMainImageUrl?: string 
    }) => {
      // Start transaction-like operations
      const operations = []
      
      // 1. Update project's main image
      operations.push(
        supabase
          .from('projects')
          .update({ 
            main_image_url: newMainImageUrl,
            main_image_alt: newMainImageAlt || '',
            updated_at: new Date().toISOString()
          })
          .eq('id', projectId)
      )
      
      // 2. If there was a previous main image, add it as additional image
      if (previousMainImageUrl) {
        // Get the highest sort_order for this project
        const { data: existingImages } = await supabase
          .from('project_images')
          .select('sort_order')
          .eq('project_id', projectId)
          .order('sort_order', { ascending: false })
          .limit(1)
        
        const nextSortOrder = existingImages && existingImages.length > 0 
          ? existingImages[0].sort_order + 1 
          : 0
        
        operations.push(
          supabase
            .from('project_images')
            .insert({
              project_id: projectId,
              image_url: previousMainImageUrl,
              alt_text: 'Former main image',
              sort_order: nextSortOrder
            })
        )
      }
      
      // Execute operations
      const results = await Promise.all(operations)
      
      // Check for errors
      for (const result of results) {
        if (result.error) throw result.error
      }
      
      return { projectId }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project-images', data.projectId] })
      queryClient.invalidateQueries({ queryKey: ['project-by-id', data.projectId] })
      toast.success('Main image updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update main image')
    }
  })
}

// Reorder Project Images Mutation
export function useReorderProjectImages() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      projectId, 
      imageUpdates 
    }: { 
      projectId: string
      imageUpdates: { id: string; sort_order: number }[] 
    }) => {
      // Update all images with new sort orders
      const updatePromises = imageUpdates.map(({ id, sort_order }) => 
        supabase
          .from('project_images')
          .update({ sort_order })
          .eq('id', id)
      )
      
      const results = await Promise.all(updatePromises)
      
      // Check for errors
      for (const result of results) {
        if (result.error) throw result.error
      }
      
      return { projectId }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project-images', data.projectId] })
      toast.success('Images reordered successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reorder images')
    }
  })
}

// Reorder Projects Mutation
export function useReorderProjects() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (projectOrders: { id: string; sort_order: number }[]) => {
      const { data, error } = await supabase.functions.invoke('reorder-projects', {
        body: { projectOrders }
      })
      
      if (error) throw error
      if (data?.error) throw new Error(data.error.message)
      
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['featured-projects'] })
      toast.success('Projects reordered successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reorder projects')
    }
  })
}

// Testimonials mutations
export function useCreateTestimonial() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (testimonial: Partial<Testimonial>) => {
      const { data, error } = await supabase
        .from('testimonials')
        .insert(testimonial)
        .select()
        .single()
        
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] })
      toast.success('Testimonial created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create testimonial')
    }
  })
}

export function useUpdateTestimonial() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Testimonial> & { id: string }) => {
      const { data, error } = await supabase
        .from('testimonials')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
        
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] })
      toast.success('Testimonial updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update testimonial')
    }
  })
}

export function useDeleteTestimonial() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id)
        
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] })
      toast.success('Testimonial deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete testimonial')
    }
  })
}

// Uploaded Images hooks
export function useUploadedImages(filters?: {
  category?: string
  search?: string
  uploadService?: string
  limit?: number
  offset?: number
}) {
  return useQuery({
    queryKey: ['uploaded-images', filters],
    queryFn: () => imageDatabase.getAllImages(filters)
  })
}

export function useUploadedImagesByCategory(category: string, limit = 20) {
  return useQuery({
    queryKey: ['uploaded-images-category', category],
    queryFn: () => imageDatabase.getImagesByCategory(category, limit)
  })
}

export function useCreateUploadedImage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (imageData: Omit<UploadedImage, 'id' | 'created_at' | 'updated_at'>) => 
      imageDatabase.saveImage(imageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uploaded-images'] })
      toast.success('Image saved successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save image')
    }
  })
}

export function useUpdateUploadedImage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<UploadedImage> }) => 
      imageDatabase.updateImage(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uploaded-images'] })
      toast.success('Image updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update image')
    }
  })
}

export function useDeleteUploadedImage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => imageDatabase.deleteImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uploaded-images'] })
      toast.success('Image deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete image')
    }
  })
}

// Upload Service Status hooks
export function useUploadServiceStatuses() {
  return useQuery({
    queryKey: ['upload-service-statuses'],
    queryFn: () => serviceStatusDatabase.getAllStatuses(),
    refetchInterval: 5 * 60 * 1000 // Refetch every 5 minutes
  })
}

export function useActiveUploadServices() {
  return useQuery({
    queryKey: ['active-upload-services'],
    queryFn: () => serviceStatusDatabase.getActiveServices(),
    refetchInterval: 5 * 60 * 1000 // Refetch every 5 minutes
  })
}

export function useUpdateServiceStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ serviceName, updates }: { 
      serviceName: string; 
      updates: Partial<UploadServiceStatus> 
    }) => serviceStatusDatabase.updateServiceStatus(serviceName, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upload-service-statuses'] })
      queryClient.invalidateQueries({ queryKey: ['active-upload-services'] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update service status')
    }
  })
}

// SEO Management hooks

// Global SEO Settings
export function useGlobalSEOSettings() {
  return useQuery({
    queryKey: ['global-seo-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('global_seo_settings')
        .select('*')
        .order('setting_key')
        
      if (error) throw error
      return data
    }
  })
}

export function useGlobalSEOSetting(settingKey: string) {
  return useQuery({
    queryKey: ['global-seo-setting', settingKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('global_seo_settings')
        .select('*')
        .eq('setting_key', settingKey)
        .maybeSingle()
        
      if (error) throw error
      return data
    },
    enabled: !!settingKey
  })
}

export function useUpdateGlobalSEOSetting() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ settingKey, settingValue, settingType }: { 
      settingKey: string
      settingValue: string
      settingType?: string
    }) => {
      const { data, error } = await supabase
        .from('global_seo_settings')
        .update({ 
          setting_value: settingValue,
          setting_type: settingType || 'text',
          updated_at: new Date().toISOString() 
        })
        .eq('setting_key', settingKey)
        .select()
        .single()
        
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-seo-settings'] })
      toast.success('Global SEO setting updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update global SEO setting')
    }
  })
}

// Page-specific SEO Settings (existing seo_settings table)
export function useAllPageSEOSettings() {
  return useQuery({
    queryKey: ['all-page-seo-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_settings')
        .select('*')
        .order('page_path')
        
      if (error) throw error
      return data
    }
  })
}

export function useCreatePageSEOSettings() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (seoData: Partial<SEOSettings>) => {
      const { data, error } = await supabase
        .from('seo_settings')
        .insert(seoData)
        .select()
        .single()
        
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-page-seo-settings'] })
      queryClient.invalidateQueries({ queryKey: ['seo-settings'] })
      toast.success('Page SEO settings created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create page SEO settings')
    }
  })
}

export function useUpdatePageSEOSettings() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SEOSettings> & { id: string }) => {
      const { data, error } = await supabase
        .from('seo_settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
        
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['all-page-seo-settings'] })
      queryClient.invalidateQueries({ queryKey: ['seo-settings', data.page_path] })
      toast.success('Page SEO settings updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update page SEO settings')
    }
  })
}

export function useDeletePageSEOSettings() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('seo_settings')
        .delete()
        .eq('id', id)
        
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-page-seo-settings'] })
      queryClient.invalidateQueries({ queryKey: ['seo-settings'] })
      toast.success('Page SEO settings deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete page SEO settings')
    }
  })
}

// SEO Audit hooks
export function useSEOAudits(pageType?: string, pageId?: string) {
  return useQuery({
    queryKey: ['seo-audits', pageType, pageId],
    queryFn: async () => {
      let query = supabase
        .from('seo_audit')
        .select('*')
        .order('audit_date', { ascending: false })
        .limit(50)
      
      if (pageType) {
        query = query.eq('page_type', pageType)
      }
      
      if (pageId) {
        query = query.eq('page_id', pageId)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data
    }
  })
}

export function useLatestSEOAudit(pageType: string, pageId: string) {
  return useQuery({
    queryKey: ['latest-seo-audit', pageType, pageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_audit')
        .select('*')
        .eq('page_type', pageType)
        .eq('page_id', pageId)
        .order('audit_date', { ascending: false })
        .limit(1)
        .maybeSingle()
        
      if (error) throw error
      return data
    },
    enabled: !!pageType && !!pageId
  })
}

export function useCreateSEOAudit() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (auditData: {
      page_type: string
      page_id: string
      overall_score: number
      title_score: number
      description_score: number
      keywords_score: number
      images_score: number
      content_score: number
      technical_score: number
      suggestions: any
      issues: any
    }) => {
      const { data, error } = await supabase
        .from('seo_audit')
        .insert(auditData)
        .select()
        .single()
        
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-audits'] })
      queryClient.invalidateQueries({ queryKey: ['latest-seo-audit'] })
      toast.success('SEO audit completed successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create SEO audit')
    }
  })
}

// Enhanced Project SEO hooks
export function useProjectSEOData(projectId: string) {
  return useQuery({
    queryKey: ['project-seo', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id, title, description, slug,
          seo_title, seo_description, seo_keywords,
          meta_title, meta_description, og_image_url,
          og_title, og_description, twitter_card,
          canonical_url, focus_keyword, schema_type, seo_score
        `)
        .eq('id', projectId)
        .single()
        
      if (error) throw error
      return data
    },
    enabled: !!projectId
  })
}

export function useUpdateProjectSEO() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...seoUpdates }: {
      id: string
      seo_title?: string
      seo_description?: string
      seo_keywords?: string[]
      meta_title?: string
      meta_description?: string
      og_image_url?: string
      og_title?: string
      og_description?: string
      twitter_card?: string
      canonical_url?: string
      focus_keyword?: string
      schema_type?: string
      seo_score?: number
    }) => {
      const { data, error } = await supabase
        .from('projects')
        .update({ ...seoUpdates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
        
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project-seo', data.id] })
      queryClient.invalidateQueries({ queryKey: ['project-by-id', data.id] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project SEO updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update project SEO')
    }
  })
}

// Bulk SEO operations
export function useBulkUpdateProjectSEO() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (updates: Array<{
      id: string
      [key: string]: any
    }>) => {
      const updatePromises = updates.map(({ id, ...seoData }) => 
        supabase
          .from('projects')
          .update({ ...seoData, updated_at: new Date().toISOString() })
          .eq('id', id)
      )
      
      const results = await Promise.all(updatePromises)
      
      // Check for errors
      for (const result of results) {
        if (result.error) throw result.error
      }
      
      return { count: updates.length }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project-seo'] })
      toast.success(`Updated SEO for ${data.count} projects successfully`)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update project SEO in bulk')
    }
  })
}

// SEO Analytics and Insights
export function useSEOInsights() {
  return useQuery({
    queryKey: ['seo-insights'],
    queryFn: async () => {
      // Get overall project SEO scores
      const { data: projectScores, error: projectError } = await supabase
        .from('projects')
        .select('id, title, seo_score, status')
        .eq('status', 'published')
        
      if (projectError) throw projectError
      
      // Get recent audit scores
      const { data: auditScores, error: auditError } = await supabase
        .from('seo_audit')
        .select('page_type, overall_score, audit_date')
        .order('audit_date', { ascending: false })
        .limit(20)
        
      if (auditError) throw auditError
      
      // Calculate insights
      const avgProjectScore = projectScores.length > 0 
        ? projectScores.reduce((sum, p) => sum + (p.seo_score || 0), 0) / projectScores.length
        : 0
        
      const lowScoreProjects = projectScores.filter(p => (p.seo_score || 0) < 60)
      
      return {
        avgProjectScore: Math.round(avgProjectScore),
        totalProjects: projectScores.length,
        lowScoreProjects: lowScoreProjects.length,
        recentAudits: auditScores,
        projectScores
      }
    }
  })
}

// Personal Photos hooks
export interface PersonalPhoto {
  id: string
  image_url: string
  alt_text: string | null
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export function usePersonalPhoto() {
  return useQuery({
    queryKey: ['personal-photo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personal_photos')
        .select('*')
        .eq('is_active', true)
        .maybeSingle()
        
      if (error) throw error
      return data as PersonalPhoto | null
    }
  })
}

export function useAllPersonalPhotos() {
  return useQuery({
    queryKey: ['all-personal-photos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personal_photos')
        .select('*')
        .order('created_at', { ascending: false })
        
      if (error) throw error
      return data as PersonalPhoto[]
    }
  })
}

export function useCreatePersonalPhoto() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (photoData: {
      image_url: string
      alt_text?: string
      description?: string
    }) => {
      // First, deactivate all existing photos
      await supabase
        .from('personal_photos')
        .update({ is_active: false })
        .eq('is_active', true)
      
      // Then create the new photo as active
      const { data, error } = await supabase
        .from('personal_photos')
        .insert({
          ...photoData,
          is_active: true
        })
        .select()
        .single()
        
      if (error) throw error
      return data as PersonalPhoto
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-photo'] })
      queryClient.invalidateQueries({ queryKey: ['all-personal-photos'] })
      toast.success('Personal photo uploaded successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to upload personal photo')
    }
  })
}

export function useUpdatePersonalPhoto() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: {
      id: string
      image_url?: string
      alt_text?: string
      description?: string
    }) => {
      const { data, error } = await supabase
        .from('personal_photos')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
        
      if (error) throw error
      return data as PersonalPhoto
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-photo'] })
      queryClient.invalidateQueries({ queryKey: ['all-personal-photos'] })
      toast.success('Personal photo updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update personal photo')
    }
  })
}

export function useSetActivePersonalPhoto() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (photoId: string) => {
      // First, deactivate all photos
      await supabase
        .from('personal_photos')
        .update({ is_active: false })
        .eq('is_active', true)
      
      // Then activate the selected photo
      const { data, error } = await supabase
        .from('personal_photos')
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq('id', photoId)
        .select()
        .single()
        
      if (error) throw error
      return data as PersonalPhoto
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-photo'] })
      queryClient.invalidateQueries({ queryKey: ['all-personal-photos'] })
      toast.success('Active personal photo updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to set active personal photo')
    }
  })
}

export function useDeletePersonalPhoto() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (photoId: string) => {
      const { error } = await supabase
        .from('personal_photos')
        .delete()
        .eq('id', photoId)
        
      if (error) throw error
      return photoId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-photo'] })
      queryClient.invalidateQueries({ queryKey: ['all-personal-photos'] })
      toast.success('Personal photo deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete personal photo')
    }
  })
}