import { useTestimonials, useContentBlock } from '@/hooks/useData'
import { useTranslation } from 'react-i18next'
import { Quote } from 'lucide-react'

export function TestimonialsSection() {
  const { t } = useTranslation('portfolio')
  const { data: testimonials = [], isLoading } = useTestimonials()
  const { data: testimonialsTitle } = useContentBlock('testimonials_title')
  const { data: testimonialsSubtitle } = useContentBlock('testimonials_subtitle')
  
  if (isLoading) {
    return (
      <section className="py-24 md:py-32 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
          </div>
        </div>
      </section>
    )
  }
  
  if (testimonials.length === 0) {
    return null
  }
  
  return (
    <section className="py-24 md:py-32 bg-black relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/10 via-black to-purple-950/10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          {/* Section divider */}
          <div className="flex items-center justify-center mb-16">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent w-32"></div>
            <div className="mx-6 w-2 h-2 bg-purple-500 rounded-full"></div>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent w-32"></div>
          </div>
          
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {testimonialsTitle?.content || t('testimonials.title')}
          </h2>
          <p className="text-2xl md:text-3xl text-purple-300 font-light">
            {testimonialsSubtitle?.content || t('testimonials.subtitle')}
          </p>
        </div>
        
        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="group relative bg-gradient-to-b from-purple-950/20 to-black/40 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-500 hover:transform hover:scale-105"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 text-purple-500/30 group-hover:text-purple-400/50 transition-colors duration-300">
                <Quote size={40} />
              </div>
              
              {/* Testimonial Text */}
              <blockquote className="text-purple-100 text-lg md:text-xl mb-8 leading-relaxed font-light relative z-10">
                "{testimonial.testimonial_text}"
              </blockquote>
              
              {/* Client Info */}
              <div className="flex items-center space-x-4 relative z-10">
                {testimonial.client_image_url && (
                  <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-purple-500/30">
                    <img
                      src={testimonial.client_image_url}
                      alt={testimonial.client_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <div className="font-semibold text-white text-lg">
                    {testimonial.client_name}
                  </div>
                  <div className="text-purple-300 text-sm mb-1">
                    {testimonial.client_role}
                  </div>
                  {testimonial.client_company && (
                    <div className="text-purple-400 text-sm font-medium">
                      {testimonial.client_company}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/5 group-hover:to-pink-600/5 rounded-2xl transition-all duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}