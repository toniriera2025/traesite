import { useProjects, useSEOSettings } from '@/hooks/useData'
import { Link } from 'react-router-dom'
import { ArrowRight, ExternalLink, Video, Image as ImageIcon } from 'lucide-react'
import { ProjectMediaDisplay } from '@/components/ProjectMediaDisplay'
import { getCurrentLanguage } from '@/lib/i18n'
import { useEffect } from 'react'

export function PortfolioPage() {
  const { data: projects = [], isLoading } = useProjects()
  const { data: seoSettings } = useSEOSettings('/portfolio')
  const currentLanguage = getCurrentLanguage()
  
  const getMediaType = (project: any) => {
    return project.youtube_video_id ? 'video' : 'image'
  }
  
  // Update page meta tags and scroll to top
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    
    if (seoSettings) {
      document.title = seoSettings.title || 'Portfolio | TONI RIERA'
      
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content', seoSettings.description || '')
      }
    }
  }, [seoSettings])
  
  if (isLoading) {
    return (
      <div className="py-24 md:py-32 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="py-24 md:py-32 bg-black relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/5 to-black"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          {/* Section divider */}
          <div className="flex items-center justify-center mb-16">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent w-32"></div>
            <div className="mx-6 w-2 h-2 bg-purple-500 rounded-full"></div>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent w-32"></div>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            PORTFOLIO
          </h1>
          <p className="text-2xl md:text-3xl text-purple-300 font-light">
            ALL PROJECTS
          </p>
        </div>
        
        {/* Projects Grid - Alternating Layout */}
        <div className="space-y-16">
          {projects.map((project, index) => {
            const mediaType = getMediaType(project)
            
            return (
              <div
                key={project.id}
                className={`group relative ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                } lg:flex lg:items-center lg:gap-16`}
              >
                {/* Project Media */}
                <div className="lg:w-1/2 relative">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                    <ProjectMediaDisplay
                      project={project}
                      language={currentLanguage}
                      displayMode="full"
                      className="group-hover:scale-110 transition-transform duration-700"
                      autoplay={false}
                      showVideoControls={true}
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:from-purple-900/40 transition-all duration-500 pointer-events-none"></div>
                    
                    {/* Media Type Indicator */}
                    <div className="absolute top-4 right-4 z-10">
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        mediaType === 'video' 
                          ? 'bg-red-600 text-white' 
                          : 'bg-blue-600 text-white'
                      }`}>
                        {mediaType === 'video' ? (
                          <Video className="w-3 h-3" />
                        ) : (
                          <ImageIcon className="w-3 h-3" />
                        )}
                        {mediaType === 'video' ? 'VIDEO' : 'IMAGE'}
                      </div>
                    </div>
                    
                    {/* Overlay Link */}
                    <Link
                      to={`/portfolio/${project.slug}`}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
                    >
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-6 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <ExternalLink size={32} className="text-white" />
                      </div>
                    </Link>
                    
                    {/* Project number */}
                    <div className="absolute top-6 left-6 text-6xl font-bold text-white/10 leading-none z-10">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    
                    {/* Featured badge */}
                    {project.is_featured && (
                      <div className="absolute top-6 right-20 z-10">
                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              
                {/* Project Info */}
                <div className="lg:w-1/2 mt-8 lg:mt-0">
                  <div className={`${index % 2 === 0 ? 'lg:pl-8' : 'lg:pr-8'}`}>
                    <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-500 group-hover:bg-clip-text transition-all duration-500">
                      {project.title}
                    </h3>
                    
                    <p className="text-xl md:text-2xl text-purple-200 mb-8 leading-relaxed">
                      {project.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 mb-8">
                      {project.category && (
                        <span className="text-purple-400 text-lg font-medium">
                          {project.category}
                        </span>
                      )}
                      {project.client && (
                        <span className="text-purple-400 text-lg">
                          Client: {project.client}
                        </span>
                      )}
                      {/* Media Type Badge */}
                      <span className={`flex items-center gap-1 text-sm font-medium ${
                        mediaType === 'video'
                          ? 'text-red-300'
                          : 'text-blue-300'
                      }`}>
                        {mediaType === 'video' ? (
                          <Video className="w-3 h-3" />
                        ) : (
                          <ImageIcon className="w-3 h-3" />
                        )}
                        {mediaType === 'video' ? 'Video Demo' : 'Image Gallery'}
                      </span>
                    </div>
                    
                    <Link
                      to={`/portfolio/${project.slug}`}
                      className="group/link inline-flex items-center gap-3 text-xl font-semibold text-white hover:text-purple-400 transition-colors duration-300"
                    >
                      {mediaType === 'video' ? 'Watch Demo' : 'View Project'}
                      <ArrowRight size={20} className="group-hover/link:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        {projects.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-purple-200">No projects available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}