import { useEffect, useState } from 'react'
import { useHeroImages, useContentBlock } from '@/hooks/useData'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function HeroSection() {
  const { t } = useTranslation('portfolio')
  const { data: heroImages = [], isLoading: imagesLoading } = useHeroImages()
  const { data: heroTitle } = useContentBlock('hero_title')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // Auto-advance slides
  useEffect(() => {
    if (heroImages.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 6000)
    
    return () => clearInterval(interval)
  }, [heroImages.length])
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
  }
  
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length)
  }
  
  if (imagesLoading) {
    return (
      <section className="relative h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </section>
    )
  }
  
  if (heroImages.length === 0) {
    return (
      <section className="relative h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-8 bg-gradient-to-r from-white via-purple-400 to-pink-500 bg-clip-text text-transparent">
            {t('hero.title')}
          </h1>
          <p className="text-2xl md:text-3xl lg:text-4xl font-light text-purple-300">
            {t('hero.subtitle')}
          </p>
        </div>
      </section>
    )
  }
  
  const currentImage = heroImages[currentImageIndex]
  
  return (
    <section className="relative h-screen overflow-hidden bg-black">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={currentImage.image_url}
          alt={currentImage.alt_text || 'Hero image'}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-pink-900/20"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center text-white px-4 max-w-6xl mx-auto">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-8 leading-none">
            <span className="bg-gradient-to-r from-white via-purple-400 to-pink-500 bg-clip-text text-transparent">
              TONI RIERA
            </span>
          </h1>
          <p className="text-2xl md:text-3xl lg:text-4xl font-light text-purple-300 mb-12">
            {t('hero.subtitle')}
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto"></div>
        </div>
      </div>
      
      {/* Navigation Arrows */}
      <button
        onClick={prevImage}
        className="absolute left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/30 hover:bg-black/50 transition-colors text-white border border-purple-500/30 hover:border-purple-400"
        aria-label="Previous image"
      >
        <ChevronLeft size={28} />
      </button>
      
      <button
        onClick={nextImage}
        className="absolute right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/30 hover:bg-black/50 transition-colors text-white border border-purple-500/30 hover:border-purple-400"
        aria-label="Next image"
      >
        <ChevronRight size={28} />
      </button>
      
      {/* Dots Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              index === currentImageIndex
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 scale-125'
                : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-white/60 animate-pulse">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-purple-400"></div>
          <span className="text-xs tracking-widest uppercase">{t('hero.scroll_indicator')}</span>
        </div>
      </div>
    </section>
  )
}