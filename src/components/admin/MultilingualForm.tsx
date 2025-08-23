import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getSupportedLanguages } from '@/lib/i18n';
import { Globe, Edit, Save, X } from 'lucide-react';

interface MultilingualFormProps {
  title: string;
  fields: {
    name: string;
    label: string;
    type: 'text' | 'textarea';
    required?: boolean;
  }[];
  initialData?: Record<string, any>;
  onSave: (data: Record<string, any>) => Promise<void>;
  isLoading?: boolean;
}

const MultilingualForm: React.FC<MultilingualFormProps> = ({
  title,
  fields,
  initialData = {},
  onSave,
  isLoading = false
}) => {
  const { t } = useTranslation('admin');
  const supportedLanguages = getSupportedLanguages();
  const [activeLanguage, setActiveLanguage] = useState('en');
  const [formData, setFormData] = useState<Record<string, Record<string, string>>>(() => {
    const data: Record<string, Record<string, string>> = {};
    
    supportedLanguages.forEach(lang => {
      data[lang.code] = {};
      fields.forEach(field => {
        const fieldKey = `${field.name}_${lang.code}`;
        data[lang.code][field.name] = initialData[fieldKey] || '';
      });
    });
    
    return data;
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [activeLanguage]: {
        ...prev[activeLanguage],
        [fieldName]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      // Transform data to flat structure with language suffixes
      const flatData: Record<string, string> = {};
      
      Object.entries(formData).forEach(([langCode, langData]) => {
        Object.entries(langData).forEach(([fieldName, value]) => {
          flatData[`${fieldName}_${langCode}`] = value;
        });
      });
      
      await onSave(flatData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving multilingual content:', error);
    }
  };

  const getCompletionStatus = (langCode: string) => {
    const langData = formData[langCode];
    const requiredFields = fields.filter(f => f.required);
    const completedRequired = requiredFields.filter(f => langData[f.name]?.trim()).length;
    return requiredFields.length > 0 ? (completedRequired / requiredFields.length) * 100 : 100;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {title}
          </h2>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
              >
                <Edit className="h-4 w-4" />
                {t('projects.edit_project')}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? t('save') + '...' : t('save')}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                  {t('cancel')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Language Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {supportedLanguages.map(language => {
            const completion = getCompletionStatus(language.code);
            return (
              <button
                key={language.code}
                onClick={() => setActiveLanguage(language.code)}
                className={`flex items-center gap-3 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeLanguage === language.code
                    ? 'border-purple-500 text-purple-600 bg-purple-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <div className="text-left">
                  <div className="font-medium">{language.nativeName}</div>
                  <div className="text-xs text-gray-400">
                    {Math.round(completion)}% {t('complete', { defaultValue: 'complete' })}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        <div className="space-y-6">
          {fields.map(field => {
            const value = formData[activeLanguage]?.[field.name] || '';
            
            return (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {field.type === 'textarea' ? (
                  <textarea
                    value={value}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder={`${field.label} in ${supportedLanguages.find(l => l.code === activeLanguage)?.nativeName}`}
                  />
                ) : (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder={`${field.label} in ${supportedLanguages.find(l => l.code === activeLanguage)?.nativeName}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MultilingualForm;