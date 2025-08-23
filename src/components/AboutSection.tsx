import { useContentBlock } from '@/hooks/useData'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export function AboutSection() {
  const { t } = useTranslation('portfolio')
  const { data: aboutTitle } = useContentBlock('about_title')
  const { data: aboutContent } = useContentBlock('about_content')
  
  return (
    <section className="py-24 md:py-32 bg-black relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/10 via-black to-purple-950/10"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-1/2 left-0 w-px h-64 bg-gradient-to-b from-transparent via-purple-500/30 to-transparent"></div>
      <div className="absolute top-1/2 right-0 w-px h-64 bg-gradient-to-b from-transparent via-purple-500/30 to-transparent"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Section divider */}
          <div className="flex items-center justify-center mb-16">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent w-32"></div>
            <div className="mx-6 w-2 h-2 bg-purple-500 rounded-full"></div>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent w-32"></div>
          </div>
          
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-12 leading-tight">
            {aboutTitle?.content || t('about.title')}
          </h2>
          
          <p className="text-xl md:text-2xl lg:text-3xl text-purple-200 leading-relaxed mb-16 max-w-5xl mx-auto font-light">
            {aboutContent?.content || t('about.description')}
          </p>
          
          <Link
            to="/about"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
          >
            {t('about.cta_button')}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}