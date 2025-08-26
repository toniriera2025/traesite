import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const { t } = useTranslation('common')
  
  return (
    <footer className="bg-black border-t border-purple-500/20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-950/10 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-white via-purple-400 to-pink-500 bg-clip-text text-transparent">
              TONI RIERA
            </h3>
            <p className="text-purple-200 text-lg leading-relaxed">
              {t('footer.brand_description')}
            </p>
          </div>
          
          {/* Navigation */}
          <div>
            <h4 className="text-xl font-semibold mb-6 text-white">{t('footer.navigation_title')}</h4>
            <nav className="space-y-4">
              <Link to="/" className="block text-purple-300 hover:text-purple-400 transition-colors duration-300 text-lg py-2 px-1 rounded-md hover:bg-purple-500/10 touch-manipulation">
                {t('footer.home')}
              </Link>
              <Link to="/about" className="block text-purple-300 hover:text-purple-400 transition-colors duration-300 text-lg py-2 px-1 rounded-md hover:bg-purple-500/10 touch-manipulation">
                {t('footer.about')}
              </Link>
              <Link to="/portfolio" className="block text-purple-300 hover:text-purple-400 transition-colors duration-300 text-lg py-2 px-1 rounded-md hover:bg-purple-500/10 touch-manipulation">
                {t('footer.portfolio')}
              </Link>
              <Link to="/contact" className="block text-purple-300 hover:text-purple-400 transition-colors duration-300 text-lg py-2 px-1 rounded-md hover:bg-purple-500/10 touch-manipulation">
                {t('footer.contact')}
              </Link>
            </nav>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="text-xl font-semibold mb-6 text-white">{t('footer.cta_title')}</h4>
            <div className="space-y-6">
              <p className="text-purple-200 text-lg leading-relaxed">
                {t('footer.cta_description')}
              </p>
              <Link 
                to="/contact" 
                className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 text-lg touch-manipulation min-h-[48px] flex items-center justify-center"
              >
                {t('footer.cta_button')}
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-purple-500/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-purple-400 text-lg">
              &copy; {currentYear} Toni Riera. {t('footer.copyright')}
            </p>
            <div className="flex items-center space-x-2 text-purple-400">
              <span>{t('footer.powered_by')}</span>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}