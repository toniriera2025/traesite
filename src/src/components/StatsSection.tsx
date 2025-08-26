import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function StatsSection() {
  const { t } = useTranslation('portfolio')
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.5 }
    )
    
    const element = document.getElementById('stats-section')
    if (element) {
      observer.observe(element)
    }
    
    return () => observer.disconnect()
  }, [])
  
  const stats = [
    {
      number: '120+',
      label: t('stats.projects_completed'),
      description: t('stats.projects_description')
    },
    {
      number: '40+',
      label: t('stats.happy_clients'),
      description: t('stats.clients_description')
    }
  ]
  
  return (
    <section id="stats-section" className="py-24 md:py-32 bg-black relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/10 to-black"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-purple-500/50 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">{t('stats.section_title')}</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`text-center transform transition-all duration-1000 delay-${index * 200} ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
              }`}
            >
              <div className="relative">
                <div className="text-8xl md:text-9xl lg:text-[10rem] font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent leading-none mb-4">
                  {stat.number}
                </div>
                <div className="absolute inset-0 text-8xl md:text-9xl lg:text-[10rem] font-bold text-purple-500/10 blur-sm">
                  {stat.number}
                </div>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-semibold text-white mb-4">
                {stat.label}
              </h3>
              
              <p className="text-lg text-purple-300 max-w-sm mx-auto leading-relaxed">
                {stat.description}
              </p>
              
              {/* Decorative line */}
              <div className="mt-8 flex justify-center">
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}