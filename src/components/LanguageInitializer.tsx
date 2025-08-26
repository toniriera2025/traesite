import { useEffect, useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';

interface LanguageInitializerProps {
  children: ReactNode;
}

export const LanguageInitializer = ({ children }: LanguageInitializerProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const initializeLanguage = async () => {
      // Wait for i18n to be fully initialized
      if (!i18n.isInitialized) {
        await i18n.init();
      }

      // Check if there's a stored language preference
      const storedLanguage = localStorage.getItem('i18nextLng');
      const supportedLanguages = ['en', 'es', 'ca'];
      
      let targetLanguage = 'ca'; // Default to Catalan always
      
      // Only use stored language if it exists and is supported
      if (storedLanguage && supportedLanguages.includes(storedLanguage)) {
        targetLanguage = storedLanguage;
      }
      // Don't check browser language - always default to Catalan unless user has explicitly set a preference

      // Set the language if it's different from current
      if (i18n.language !== targetLanguage) {
        await i18n.changeLanguage(targetLanguage);
      }
      
      setIsInitialized(true);
    };

    initializeLanguage();
  }, []);

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <p className="text-white text-lg">Carregant...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
