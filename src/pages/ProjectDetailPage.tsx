import { useParams, Navigate } from 'react-router-dom'
import { useProject, useProjectImages } from '@/hooks/useData'
import { ArrowLeft, Calendar, Tag, User, Video, Image as ImageIcon, Play, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProjectMediaDisplay } from '@/components/ProjectMediaDisplay'
import { getCurrentLanguage } from '@/lib/i18n'
import { useEffect, useState } from 'react'

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: project, isLoading, error } = useProject(slug!)
  const { data: projectImages = [] } = useProjectImages(project?.id || '')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showVideo, setShowVideo] = useState(false)
  const currentLanguage = getCurrentLanguage()
  
  const hasVideo = project?.youtube_video_id
  const hasImages = project?.main_image_url || projectImages.length > 0
  
  // Media priority: video first, then images
  const mediaType = hasVideo ? 'video' : 'image'
  
  // Combine main image with additional images (for fallback or gallery)
  const allImages = project ? [
    ...(project.main_image_url ? [{
      url: project.main_image_url,
      alt: project.main_image_alt || project.title,
      caption: 'Main Image'
    }] : []),
    ...projectImages.map(img => ({
      url: img.image_url,
      alt: img.alt_text || project.title,
      caption: img.caption || `Project Image ${projectImages.indexOf(img) + (project.main_image_url ? 2 : 1)}`
    }))
  ].filter(img => img.url) : []
  
  // Update page meta tags
  useEffect(() => {
    if (project) {
      document.title = project.seo_title || `${project.title} | TONI RIERA`
      
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content', project.seo_description || project.description || '')
      }
    }
  }, [project])
  
  if (isLoading) {
    return (
      <div className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }
  
  if (error || !project) {
    return <Navigate to="/portfolio" replace />
  }
  
  return (
    <div className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/portfolio"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          Back to Portfolio
        </Link>
        
        {/* Project Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            {project.title}
          </h1>
          
          {/* Media Type Indicator */}
          <div className="flex justify-center mb-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              mediaType === 'video' 
                ? 'bg-red-100 text-red-800 border border-red-200' 
                : 'bg-blue-100 text-blue-800 border border-blue-200'
            }`}>
              {mediaType === 'video' ? (
                <Video className="w-4 h-4" />
              ) : (
                <ImageIcon className="w-4 h-4" />
              )}
              {mediaType === 'video' ? 'VIDEO PROJECT' : 'IMAGE PROJECT'}
            </div>
          </div>
          
          {/* Project Meta */}
          <div className="flex flex-wrap justify-center gap-4 text-gray-600">
            {project.category && (
              <div className="flex items-center gap-2">
                <Tag size={16} />
                <span>{project.category}</span>
              </div>
            )}
            {project.client && (
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>Client: {project.client}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{new Date(project.created_at).getFullYear()}</span>
            </div>
          </div>
        </div>
        
        {/* Primary Media Display */}
        <div className="mb-12">
          {/* Main Media (Video or Image) */}
          <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-6">
            <ProjectMediaDisplay
              project={project}
              language={currentLanguage}
              displayMode="full"
              className=""
              autoplay={false}
              showVideoControls={true}
            />
            
            {/* Media Toggle Buttons */}
            {hasVideo && hasImages && (
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <button
                  onClick={() => setShowVideo(true)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    showVideo || (!showVideo && mediaType === 'video')
                      ? 'bg-red-600 text-white'
                      : 'bg-white/80 text-gray-700 hover:bg-white'
                  }`}
                >
                  <Video className="w-3 h-3" />
                  Video
                </button>
                <button
                  onClick={() => setShowVideo(false)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    !showVideo && mediaType === 'image'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/80 text-gray-700 hover:bg-white'
                  }`}
                >
                  <ImageIcon className="w-3 h-3" />
                  Images
                </button>
              </div>
            )}
          </div>
          
          {/* Media Info */}
          <div className="text-center mb-6">
            {hasVideo && (
              <p className="text-lg text-gray-600 mb-2">
                {mediaType === 'video' && !showVideo ? 'Video demonstration available' : 'Project video demonstration'}
              </p>
            )}
            {hasImages && mediaType === 'image' && (
              <p className="text-lg text-gray-600">
                {allImages.length > 1 ? `${allImages.length} project images` : 'Project image'}
              </p>
            )}
          </div>
          
          {/* Image Gallery Thumbnails (when showing images or as fallback) */}
          {allImages.length > 1 && (mediaType === 'image' || !hasVideo) && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-24 h-16 rounded-md overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index
                      ? 'border-gray-900 opacity-100'
                      : 'border-gray-300 opacity-60 hover:opacity-80'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Project Description */}
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg prose-gray max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Description</h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              {project.description || 'This project showcases advanced AI-driven image creation and retouching techniques.'}
            </p>
            
            <div className="bg-gray-50 rounded-lg p-8 mt-12">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Technical Details</h3>
              <ul className="space-y-2">
                <li><strong>Technique:</strong> AI-assisted image generation and advanced retouching</li>
                <li><strong>Tools:</strong> Professional retouching software with AI enhancement</li>
                <li><strong>Category:</strong> {project.category || 'Creative Imaging'}</li>
                {project.client && <li><strong>Client:</strong> {project.client}</li>}
              </ul>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="text-center mt-16 bg-gray-900 text-white rounded-lg py-12 px-8">
          <h3 className="text-2xl font-bold mb-4">Interested in Similar Work?</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Let's discuss how I can bring your creative vision to life with AI-powered imagery and professional retouching.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-white text-gray-900 px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  )
}