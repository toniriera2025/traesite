import React, { useState } from 'react';
import { useGlobalSEOSettings, useUpdateGlobalSEOSetting } from '@/hooks/useData';
import { Settings, Save, Globe, Image, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

interface GlobalSeoFormProps {
  seoSettings?: any[];
  isLoading: boolean;
}

export const GlobalSeoForm: React.FC<GlobalSeoFormProps> = ({
  seoSettings,
  isLoading
}) => {
  const updateGlobalSEOMutation = useUpdateGlobalSEOSetting();
  
  // Convert settings array to key-value map
  const settingsMap = (seoSettings || []).reduce((acc, setting) => {
    let value = setting.setting_value || '';
    if (setting.setting_type === 'json') {
      try {
        value = Array.isArray(JSON.parse(value)) ? JSON.parse(value).join(', ') : value;
      } catch {
        value = '';
      }
    }
    acc[setting.setting_key] = value;
    return acc;
  }, {} as Record<string, any>);

  const [formData, setFormData] = useState({
    site_title: settingsMap.site_title || '',
    site_description: settingsMap.site_description || '',
    default_keywords: settingsMap.default_keywords || '',
    og_image_url: settingsMap.og_image_url || '',
    twitter_handle: settingsMap.twitter_handle || '',
    google_analytics_id: settingsMap.google_analytics_id || '',
    google_search_console_id: settingsMap.google_search_console_id || ''
  });

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async (key: string, value: string, type = 'text') => {
    try {
      let processedValue = value;
      if (key === 'default_keywords' && value) {
        // Convert comma-separated string to JSON array
        const keywords = value.split(',').map(k => k.trim()).filter(Boolean);
        processedValue = JSON.stringify(keywords);
        type = 'json';
      }
      
      await updateGlobalSEOMutation.mutateAsync({
        settingKey: key,
        settingValue: processedValue,
        settingType: type
      });
    } catch (error) {
      console.error(`Failed to update ${key}:`, error);
    }
  };

  const handleSaveAll = async () => {
    const savePromises = Object.entries(formData).map(([key, value]) => 
      handleSave(key, value)
    );
    
    try {
      await Promise.all(savePromises);
      toast.success('All global SEO settings saved successfully');
    } catch (error) {
      toast.error('Some settings failed to save');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Globe className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Global SEO Settings</h2>
      </div>

      <div className="space-y-6">
        {/* Site Identity */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Site Identity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site Title
              </label>
              <input
                type="text"
                value={formData.site_title}
                onChange={(e) => handleInputChange('site_title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your Site Title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Twitter Handle
              </label>
              <input
                type="text"
                value={formData.twitter_handle}
                onChange={(e) => handleInputChange('twitter_handle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="@yourusername"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site Description
            </label>
            <textarea
              value={formData.site_description}
              onChange={(e) => handleInputChange('site_description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="A brief description of your website"
            />
          </div>
        </div>

        {/* SEO Defaults */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Hash className="h-5 w-5" />
            SEO Defaults
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Keywords
              </label>
              <input
                type="text"
                value={formData.default_keywords}
                onChange={(e) => handleInputChange('default_keywords', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="keyword1, keyword2, keyword3"
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated keywords</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default OG Image URL
              </label>
              <input
                type="url"
                value={formData.og_image_url}
                onChange={(e) => handleInputChange('og_image_url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://yoursite.com/default-og-image.jpg"
              />
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Image className="h-5 w-5" />
            Analytics & Tracking
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Google Analytics ID
              </label>
              <input
                type="text"
                value={formData.google_analytics_id}
                onChange={(e) => handleInputChange('google_analytics_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="G-XXXXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Google Search Console ID
              </label>
              <input
                type="text"
                value={formData.google_search_console_id}
                onChange={(e) => handleInputChange('google_search_console_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="GSC-XXXXXXXXXX"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveAll}
            disabled={updateGlobalSEOMutation.isPending}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {updateGlobalSEOMutation.isPending ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};