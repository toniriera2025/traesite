import { useContentBlock, useSEOSettings, usePersonalPhoto } from '@/hooks/useData'
import { useEffect } from 'react'

export function AboutPage() {
  const { data: aboutTitle } = useContentBlock('about_title')
  const { data: aboutContent } = useContentBlock('about_content')
  const { data: seoSettings } = useSEOSettings('/about')
  const { data: personalPhoto } = usePersonalPhoto()
  
  // Update page meta tags
  useEffect(() => {
    if (seoSettings) {
      document.title = seoSettings.title || 'About | TONI RIERA'
      
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content', seoSettings.description || '')
      }
    }
  }, [seoSettings])
  
  return (
    <div className="py-24 md:py-32 bg-black min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          {/* Section divider */}
          <div className="flex items-center justify-center mb-16">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent w-32"></div>
            <div className="mx-6 w-2 h-2 bg-purple-500 rounded-full"></div>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent w-32"></div>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-12 leading-tight">
            {aboutTitle?.content || 'About Me'}
          </h1>
        </div>
        
        {/* Content */}
        <div className="max-w-none">
          {/* Personal Photo */}
          <div className="flex justify-center mb-16">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-75 blur"></div>
              <img
                src={personalPhoto?.image_url || "/images/toni-riera-photo.jpeg"}
                alt={personalPhoto?.alt_text || "Toni Riera"}
                className="relative w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full object-cover border-4 border-black shadow-2xl"
                onError={(e) => {
                  // Fallback to static image if dynamic image fails to load
                  const target = e.target as HTMLImageElement
                  if (target.src !== "/images/toni-riera-photo.jpeg") {
                    target.src = "/images/toni-riera-photo.jpeg"
                    target.alt = "Toni Riera"
                  }
                }}
              />
            </div>
          </div>
          
          <p className="text-2xl md:text-3xl text-purple-200 leading-relaxed mb-16 text-center font-light">
            {aboutContent?.content || 
              'Leveraging extensive experience in graphic design and visual composition, I craft compelling, high-quality visuals as a creative retoucher specialized in advanced AI-driven image and video creation.'}
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-20">
            <div className="bg-gradient-to-b from-purple-950/20 to-black/40 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Expertise
              </h2>
              <ul className="space-y-6">
                <li className="flex items-start">
                  <span className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                  <span className="text-purple-200 text-lg">AI-driven image generation and enhancement</span>
                </li>
                <li className="flex items-start">
                  <span className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                  <span className="text-purple-200 text-lg">Creative retouching and visual composition</span>
                </li>
                <li className="flex items-start">
                  <span className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                  <span className="text-purple-200 text-lg">Advanced photo manipulation and editing</span>
                </li>
                <li className="flex items-start">
                  <span className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                  <span className="text-purple-200 text-lg">Video creation and post-production</span>
                </li>
                <li className="flex items-start">
                  <span className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                  <span className="text-purple-200 text-lg">Graphic design and brand visualization</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-b from-purple-950/20 to-black/40 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Approach
              </h2>
              <p className="text-purple-200 text-lg mb-6 leading-relaxed">
                I believe in pushing the boundaries of what's possible with visual storytelling. 
                By combining traditional design principles with cutting-edge AI technology, 
                I create images that not only capture attention but also tell compelling stories.
              </p>
              <p className="text-purple-200 text-lg leading-relaxed">
                Every project is an opportunity to transform wild ideas into stunning visual realities, 
                whether it's for advertising campaigns, product showcases, or artistic explorations.
              </p>
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="text-center mt-20 bg-gradient-to-r from-purple-950/30 to-pink-950/30 rounded-2xl py-16 px-8 border border-purple-500/20">
            <h3 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Ready to Create the Impossible?
            </h3>
            <p className="text-purple-200 text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
              Let's collaborate to bring your most ambitious creative visions to life through the power of AI-driven visual creation.
            </p>
            <a
              href="/contact"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-12 py-6 rounded-full text-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
            >
              Start Your Project
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}