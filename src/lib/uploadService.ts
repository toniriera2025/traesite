import type { UploadProgress, UploadedImage } from '@/types/upload'
import { serviceStatusDatabase } from '@/lib/imageDatabase'

// Image processing utilities
export const resizeImageToBlob = (file: File, maxWidth: number = 1920, maxHeight: number = 1080): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }
    
    img.onload = () => {
      let { width, height } = img
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height
        
        if (width > height) {
          width = maxWidth
          height = width / aspectRatio
          
          if (height > maxHeight) {
            height = maxHeight
            width = height * aspectRatio
          }
        } else {
          height = maxHeight
          width = height * aspectRatio
          
          if (width > maxWidth) {
            width = maxWidth
            height = width / aspectRatio
          }
        }
      }
      
      canvas.width = width
      canvas.height = height
      
      // Draw the resized image
      ctx.drawImage(img, 0, 0, width, height)
      
      // Convert to blob with optimized quality
      let quality = 0.85
      
      const tryConvert = (q: number) => {
        canvas.toBlob((blob) => {
          if (blob) {
            // If blob is too large, try with lower quality
            if (blob.size > 10 * 1024 * 1024 && q > 0.3) { // 10MB limit
              tryConvert(q - 0.1)
            } else {
              resolve(blob)
            }
          } else {
            reject(new Error('Failed to create image blob'))
          }
        }, 'image/jpeg', q)
      }
      
      tryConvert(quality)
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    // Create object URL from file
    const objectUrl = URL.createObjectURL(file)
    img.src = objectUrl
    
    // Clean up object URL after image loads
    img.addEventListener('load', () => {
      URL.revokeObjectURL(objectUrl)
    })
  })
}

// Get image dimensions
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

// Upload service configurations
const UPLOAD_SERVICES = {
  imgbb: {
    name: 'ImgBB',
    upload: async (blob: Blob, filename: string): Promise<string> => {
      const formData = new FormData()
      formData.append('key', 'cba7b4806493910ccf2b13c00d192578')
      formData.append('image', blob, filename)
      
      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`ImgBB upload failed: ${response.status}`)
      }
      
      const result = await response.json()
      if (!result.success || !result.data?.url) {
        throw new Error(result.error?.message || 'ImgBB upload failed')
      }
      
      return result.data.url
    }
  },
  
  cloudinary: {
    name: 'Cloudinary',
    upload: async (blob: Blob, filename: string): Promise<string> => {
      // Free Cloudinary unsigned upload
      const formData = new FormData()
      formData.append('file', blob, filename)
      formData.append('upload_preset', 'ml_default') // Default unsigned preset
      
      const response = await fetch('https://api.cloudinary.com/v1_1/demo/image/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`Cloudinary upload failed: ${response.status}`)
      }
      
      const result = await response.json()
      if (!result.secure_url) {
        throw new Error('Cloudinary upload failed: no URL returned')
      }
      
      return result.secure_url
    }
  },
  
  imgur: {
    name: 'Imgur',
    upload: async (blob: Blob, filename: string): Promise<string> => {
      const formData = new FormData()
      formData.append('image', blob, filename)
      
      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          'Authorization': 'Client-ID 546c25a59c58ad7' // Free Imgur client ID
        },
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`Imgur upload failed: ${response.status}`)
      }
      
      const result = await response.json()
      if (!result.success || !result.data?.link) {
        throw new Error('Imgur upload failed: no URL returned')
      }
      
      return result.data.link
    }
  },
  
  postimage: {
    name: 'PostImage',
    upload: async (blob: Blob, filename: string): Promise<string> => {
      const formData = new FormData()
      formData.append('upload', blob, filename)
      
      const response = await fetch('https://postimages.org/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`PostImage upload failed: ${response.status}`)
      }
      
      const result = await response.json()
      if (!result.url) {
        throw new Error('PostImage upload failed: no URL returned')
      }
      
      return result.url
    }
  }
}

// Upload service class with fallback logic
export class UploadService {
  private services = Object.keys(UPLOAD_SERVICES)
  private onProgress?: (progress: UploadProgress) => void
  
  constructor(onProgress?: (progress: UploadProgress) => void) {
    this.onProgress = onProgress
  }
  
  async uploadWithFallback(file: File, options: {
    maxRetries?: number
    resizeOptions?: { maxWidth?: number; maxHeight?: number }
  } = {}): Promise<{ url: string; service: string; metadata: Partial<UploadedImage> }> {
    const { maxRetries = 2, resizeOptions = {} } = options
    const { maxWidth = 1920, maxHeight = 1080 } = resizeOptions
    
    // Get active services sorted by performance
    const activeServices = await serviceStatusDatabase.getActiveServices()
    const servicesToTry = activeServices.map(s => s.service_name).filter(s => this.services.includes(s))
    
    // If no active services, try all services
    if (servicesToTry.length === 0) {
      servicesToTry.push(...this.services)
    }
    
    console.log('Services to try:', servicesToTry)
    
    // Resize image
    const resizedBlob = await resizeImageToBlob(file, maxWidth, maxHeight)
    const dimensions = await getImageDimensions(file)
    
    let lastError: Error | null = null
    
    // Try each service with retry logic
    for (const serviceName of servicesToTry) {
      console.log(`Attempting upload with ${serviceName}...`)
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const startTime = Date.now()
        
        try {
          this.onProgress?.({
            loaded: 0,
            total: 100,
            percentage: 0,
            service: serviceName,
            status: attempt > 0 ? 'retrying' : 'uploading'
          })
          
          const service = UPLOAD_SERVICES[serviceName as keyof typeof UPLOAD_SERVICES]
          if (!service) {
            throw new Error(`Unknown service: ${serviceName}`)
          }
          
          const url = await service.upload(resizedBlob, file.name)
          const responseTime = Date.now() - startTime
          
          // Record successful upload
          await serviceStatusDatabase.recordUploadAttempt(serviceName, true, responseTime)
          
          this.onProgress?.({
            loaded: 100,
            total: 100,
            percentage: 100,
            service: serviceName,
            status: 'completed'
          })
          
          console.log(`Upload successful with ${serviceName}:`, url)
          
          return {
            url,
            service: serviceName,
            metadata: {
              filename: file.name.replace(/[^a-zA-Z0-9.-]/g, '_'),
              original_filename: file.name,
              file_size: resizedBlob.size,
              width: dimensions.width,
              height: dimensions.height,
              mime_type: file.type,
              upload_service: serviceName
            }
          }
          
        } catch (error) {
          const responseTime = Date.now() - startTime
          lastError = error as Error
          
          console.error(`${serviceName} upload attempt ${attempt + 1} failed:`, error)
          
          // Record failed upload attempt
          await serviceStatusDatabase.recordUploadAttempt(
            serviceName, 
            false, 
            responseTime, 
            lastError.message
          )
          
          this.onProgress?.({
            loaded: 0,
            total: 100,
            percentage: 0,
            service: serviceName,
            status: 'error'
          })
          
          // Wait before retry (exponential backoff)
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
          }
        }
      }
    }
    
    throw new Error(`All upload services failed. Last error: ${lastError?.message || 'Unknown error'}`)
  }
}

// Utility to validate URLs
export const validateImageUrl = async (url: string): Promise<{ valid: boolean; dimensions?: { width: number; height: number } }> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve({
        valid: true,
        dimensions: { width: img.width, height: img.height }
      })
    }
    img.onerror = () => {
      resolve({ valid: false })
    }
    img.src = url
    
    // Timeout after 10 seconds
    setTimeout(() => {
      resolve({ valid: false })
    }, 10000)
  })
}

// Utility to handle clipboard paste
export const handleClipboardPaste = async (event: ClipboardEvent): Promise<File | null> => {
  const items = event.clipboardData?.items
  if (!items) return null
  
  for (const item of Array.from(items)) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) {
        // Create a proper filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const extension = file.type.split('/')[1] || 'png'
        return new File([file], `clipboard-${timestamp}.${extension}`, { type: file.type })
      }
    }
  }
  
  return null
}