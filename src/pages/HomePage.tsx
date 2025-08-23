import { HeroSection } from '@/components/HeroSection'
import { StatsSection } from '@/components/StatsSection'
import { AboutSection } from '@/components/AboutSection'
import { PortfolioSection } from '@/components/PortfolioSection'
import { TestimonialsSection } from '@/components/TestimonialsSection'
import { useSEOSettings } from '@/hooks/useData'
import { useEffect } from 'react'

export function HomePage() {
  const { data: seoSettings } = useSEOSettings('/')
  
  // Update page meta tags
  useEffect(() => {
    if (seoSettings) {
      document.title = seoSettings.title || 'TONI RIERA - Creating the impossible'
      
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content', seoSettings.description || 'Creating the impossible through advanced AI-driven image and video creation.')
      }
    }
  }, [seoSettings])
  
  return (
    <div className="bg-black">
      <HeroSection />
      <StatsSection />
      <AboutSection />
      <PortfolioSection />
      <TestimonialsSection />
    </div>
  )
}