import { useState, useCallback, useRef } from 'react'
import Cropper from 'react-easy-crop'
import { Crop, RotateCcw, Check, X, ZoomIn, ZoomOut, Square, Maximize2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Area {
  x: number
  y: number
  width: number
  height: number
}

interface Point {
  x: number
  y: number
}

interface CropperProps {
  imageSrc: string
  onCropComplete: (croppedBlob: Blob, originalImage: string) => void
  onCancel: () => void
  aspectRatio?: number | null
  minZoom?: number
  maxZoom?: number
  cropShape?: 'rect' | 'round'
  showGrid?: boolean
}

export function ImageCropper({
  imageSrc,
  onCropComplete,
  onCancel,
  aspectRatio = null,
  minZoom = 0.5,
  maxZoom = 3,
  cropShape = 'rect',
  showGrid = true
}: CropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<number | null>(aspectRatio)
  const [showGridState, setShowGridState] = useState(showGrid)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const onCropChange = useCallback((crop: Point) => {
    setCrop(crop)
  }, [])
  
  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom)
  }, [])
  
  const onCropCompleteChange = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )
  
  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.setAttribute('crossOrigin', 'anonymous')
      image.src = url
    })
  
  const getRadianAngle = (degreeValue: number) => {
    return (degreeValue * Math.PI) / 180
  }
  
  const rotateSize = (width: number, height: number, rotation: number) => {
    const rotRad = getRadianAngle(rotation)
    
    return {
      width:
        Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
      height:
        Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    }
  }
  
  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0,
    flip = { horizontal: false, vertical: false }
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
      croppedCanvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Canvas is empty'))
        }
      }, 'image/jpeg', 0.85)
    })
  }
  
  const handleCropConfirm = async () => {
    if (!croppedAreaPixels) {
      toast.error('Please select a crop area')
      return
    }
    
    console.log('Crop confirm started with aspect ratio:', selectedAspectRatio)
    console.log('Cropped area pixels:', croppedAreaPixels)
    console.log('Image source:', imageSrc)
    
    setIsProcessing(true)
    
    try {
      const croppedBlob = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      )
      
      console.log('Cropped blob generated:', croppedBlob)
      
      if (!croppedBlob) {
        throw new Error('Failed to generate cropped image')
      }
      
      onCropComplete(croppedBlob, imageSrc)
    } catch (error) {
      console.error('Error cropping image:', error)
      toast.error('Failed to crop image. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }
  
  const handleReset = () => {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
    setSelectedAspectRatio(aspectRatio)
  }
  
  const aspectRatioOptions = [
    { label: 'Free', value: null },
    { label: '1:1 (Square)', value: 1 },
    { label: '4:3', value: 4 / 3 },
    { label: '16:9', value: 16 / 9 },
    { label: '3:2', value: 3 / 2 },
    { label: '2:3 (Portrait)', value: 2 / 3 },
  ]
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-5xl w-full mx-4 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Crop className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Crop & Reframe Image</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onCancel}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Cancel"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex">
          {/* Cropper Area */}
          <div className="flex-1 relative bg-gray-900" style={{ height: '500px' }}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={selectedAspectRatio || undefined}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={onCropCompleteChange}
              cropShape={cropShape}
              showGrid={showGridState}
              minZoom={minZoom}
              maxZoom={maxZoom}
              style={{
                containerStyle: {
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#1f2937'
                }
              }}
            />
          </div>
          
          {/* Controls Panel */}
          <div className="w-80 bg-gray-50 p-6 space-y-6">
            {/* Aspect Ratio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-2 gap-2">
                {aspectRatioOptions.map((option) => (
                  <button
                    key={option.label}
                    onClick={() => {
                      console.log('Aspect ratio selected:', option.label, option.value)
                      setSelectedAspectRatio(option.value)
                    }}
                    className={`px-3 py-2 text-xs rounded border transition-colors ${
                      selectedAspectRatio === option.value
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Zoom Control */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zoom: {Math.round(zoom * 100)}%
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setZoom(Math.max(minZoom, zoom - 0.1))}
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  <ZoomOut size={16} />
                </button>
                <input
                  type="range"
                  min={minZoom}
                  max={maxZoom}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <button
                  onClick={() => setZoom(Math.min(maxZoom, zoom + 0.1))}
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  <ZoomIn size={16} />
                </button>
              </div>
            </div>
            
            {/* Rotation Control */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rotation: {rotation}°
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={1}
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <button
                  onClick={() => setRotation(0)}
                  className="p-1 text-gray-500 hover:text-gray-700"
                  title="Reset rotation"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
            
            {/* Grid Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Show Grid
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showGridState}
                  onChange={(e) => setShowGridState(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${
                  showGridState ? 'bg-blue-600' : 'bg-gray-200'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                    showGridState ? 'translate-x-5' : 'translate-x-0.5'
                  } mt-0.5`} />
                </div>
              </label>
            </div>
            
            {/* Quick Actions */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setZoom(1)}
                  className="px-3 py-2 text-xs bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                >
                  <Square size={14} />
                  Fit
                </button>
                <button
                  onClick={() => setZoom(maxZoom)}
                  className="px-3 py-2 text-xs bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                >
                  <Maximize2 size={14} />
                  Fill
                </button>
              </div>
            </div>
            
            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="w-full px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
              Reset All
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Drag to reposition • Scroll to zoom • Use controls to fine-tune
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCropConfirm}
                disabled={isProcessing || !croppedAreaPixels}
                className="px-6 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Apply Crop
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Utility component for cropping preset buttons
export function CropPresetButton({ 
  aspectRatio, 
  label, 
  icon: Icon,
  isActive,
  onClick 
}: {
  aspectRatio: number | null
  label: string
  icon: any
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
        isActive
          ? 'border-blue-500 bg-blue-50 text-blue-700'
          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <Icon size={20} />
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}