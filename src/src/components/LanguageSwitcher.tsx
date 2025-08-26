import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getSupportedLanguages, getCurrentLanguage, changeLanguage } from '../lib/i18n';
import { ChevronDown, Globe } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supportedLanguages = getSupportedLanguages();
  const currentLang = getCurrentLanguage();
  
  const currentLanguageInfo = supportedLanguages.find(lang => lang.code === currentLang) || supportedLanguages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await changeLanguage(languageCode);
      setIsOpen(false);
      
      // Force a page reload to ensure all components re-render with new language
      // This is more reliable than trying to invalidate queries selectively
      window.location.reload();
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-transparent border border-purple-500/20 rounded-lg hover:bg-purple-500/10 hover:text-purple-400 transition-all duration-300"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLanguageInfo.nativeName}</span>
        <span className="sm:hidden">{currentLanguageInfo.code.toUpperCase()}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-black/95 backdrop-blur-lg border border-purple-500/20 rounded-lg shadow-lg z-50">
          <div className="py-2">
            {supportedLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-purple-500/10 hover:text-purple-400 transition-all duration-200"
              >
                <span className="text-lg">{language.flag}</span>
                <div className="flex flex-col">
                  <span className="font-medium text-white">{language.nativeName}</span>
                  <span className="text-xs text-gray-400">{language.name}</span>
                </div>
                {currentLang === language.code && (
                  <span className="ml-auto text-purple-400">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;