// Utility functions for image cropping operations

export interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export interface Point {
  x: number
  y: number
}

/**
 * Create an image element from a URL
 */
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', error => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

/**
 * Convert degrees to radians
 */
export const getRadianAngle = (degreeValue: number): number => {
  return (degreeValue * Math.PI) / 180
}

/**
 * Calculate the rotated size of a rectangle
 */
export const rotateSize = (width: number, height: number, rotation: number) => {
  const rotRad = getRadianAngle(rotation)
  
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height)
  }
}

/**
 * Get cropped image as a blob
 */
export const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: CropArea,
  rotation = 0,
  flip = { horizontal: false, vertical: false },
  outputFormat = 'image/jpeg',
  quality = 0.85
): Promise<Blob> => {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('No 2d context')
  }
  
  const rotRad = getRadianAngle(rotation)
  
  // Calculate bounding box
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  )
  
  // Set canvas size to match the bounding box
  canvas.width = bBoxWidth
  canvas.height = bBoxHeight
  
  // Translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
  ctx.rotate(rotRad)
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
  ctx.translate(-image.width / 2, -image.height / 2)
  
  // Draw rotated image
  ctx.drawImage(image, 0, 0)
  
  const croppedCanvas = document.createElement('canvas')
  const croppedCtx = croppedCanvas.getContext('2d')
  
  if (!croppedCtx) {
    throw new Error('No 2d context')
  }
  
  // Set the size of the cropped canvas
  croppedCanvas.width = pixelCrop.width
  croppedCanvas.height = pixelCrop.height
  
  // Draw the cropped image onto the new canvas
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )
  
  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Canvas is empty'))
        }
      },
      outputFormat,
      quality
    )
  })
}

/**
 * Get image blob from canvas with specific dimensions
 */
export const resizeImageToBlob = (
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.85
): Promise<Blob> => {
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

/**
 * Get image dimensions from a file
 */
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

/**
 * Convert file to blob URL for cropping
 */
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to convert file to data URL'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Create a file from blob with proper naming
 */
export const blobToFile = (blob: Blob, filename: string, mimeType?: string): File => {
  const type = mimeType || blob.type || 'image/jpeg'
  
  // Ensure proper file extension
  const extension = type.split('/')[1] || 'jpg'
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
  const finalFilename = `${nameWithoutExt}_cropped.${extension}`
  
  return new File([blob], finalFilename, { type })
}

/**
 * Common aspect ratio presets
 */
export const ASPECT_RATIOS = {
  FREE: null,
  SQUARE: 1,
  LANDSCAPE_4_3: 4 / 3,
  LANDSCAPE_16_9: 16 / 9,
  LANDSCAPE_3_2: 3 / 2,
  PORTRAIT_3_4: 3 / 4,
  PORTRAIT_9_16: 9 / 16,
  PORTRAIT_2_3: 2 / 3
} as const

/**
 * Validate if an image URL is accessible
 */
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