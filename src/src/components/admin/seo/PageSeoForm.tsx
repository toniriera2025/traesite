import React, { useState } from 'react';
import {
  useAllPageSEOSettings,
  useCreatePageSEOSettings,
  useUpdatePageSEOSettings,
  useDeletePageSEOSettings
} from '@/hooks/useData';
import { FileText, Plus, Edit2, Trash2, Save, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface PageSeoFormProps {
  pageSeo?: any[];
  isLoading: boolean;
}

interface SEOPreviewProps {
  title: string;
  description: string;
  url: string;
}

function SEOPreview({ title, description, url }: SEOPreviewProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
        <Eye size={16} />
        Search Result Preview
      </h4>
      <div className="space-y-1">
        <div className="text-blue-600 text-lg font-medium hover:underline cursor-pointer">
          {title || 'Page Title'}
        </div>
        <div className="text-green-700 text-sm">
          {url}
        </div>
        <div className="text-gray-600 text-sm leading-relaxed">
          {description || 'Page description will appear here...'}
        </div>
      </div>
    </div>
  );
}

export const PageSeoForm: React.FC<PageSeoFormProps> = ({
  pageSeo,
  isLoading
}) => {
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [showPageForm, setShowPageForm] = useState(false);
  const [pageFormData, setPageFormData] = useState({
    page_path: '',
    title: '',
    description: '',
    keywords: '',
    og_title: '',
    og_description: '',
    og_image_url: '',
    twitter_card: 'summary_large_image',
    canonical_url: ''
  });

  const createPageSEOMutation = useCreatePageSEOSettings();
  const updatePageSEOMutation = useUpdatePageSEOSettings();
  const deletePageSEOMutation = useDeletePageSEOSettings();

  const handlePageFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const keywords = pageFormData.keywords 
      ? pageFormData.keywords.split(',').map(k => k.trim()).filter(Boolean)
      : [];
    
    const seoData = {
      ...pageFormData,
      keywords
    };
    
    try {
      if (selectedPage) {
        await updatePageSEOMutation.mutateAsync({
          id: selectedPage.id,
          ...seoData
        });
      } else {
        await createPageSEOMutation.mutateAsync(seoData);
      }
      setShowPageForm(false);
      setSelectedPage(null);
      resetForm();
    } catch (error) {
      console.error('Error saving page SEO:', error);
    }
  };

  const resetForm = () => {
    setPageFormData({
      page_path: '',
      title: '',
      description: '',
      keywords: '',
      og_title: '',
      og_description: '',
      og_image_url: '',
      twitter_card: 'summary_large_image',
      canonical_url: ''
    });
  };

  const handleEditPage = (page: any) => {
    setSelectedPage(page);
    setPageFormData({
      page_path: page.page_path || '',
      title: page.title || '',
      description: page.description || '',
      keywords: page.keywords ? page.keywords.join(', ') : '',
      og_title: page.og_title || '',
      og_description: page.og_description || '',
      og_image_url: page.og_image_url || '',
      twitter_card: page.twitter_card || 'summary_large_image',
      canonical_url: page.canonical_url || ''
    });
    setShowPageForm(true);
  };

  const handleDeletePage = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this page SEO settings?')) {
      await deletePageSEOMutation.mutateAsync(id);
    }
  };

  const handleNewPage = () => {
    setSelectedPage(null);
    resetForm();
    setShowPageForm(true);
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Page SEO Settings</h2>
        </div>
        <button
          onClick={handleNewPage}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          Add Page SEO
        </button>
      </div>

      {showPageForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {selectedPage ? 'Edit Page SEO' : 'Add New Page SEO'}
          </h3>
          
          <form onSubmit={handlePageFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Page Path *
                </label>
                <input
                  type="text"
                  value={pageFormData.page_path}
                  onChange={(e) => setPageFormData(prev => ({ ...prev, page_path: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="/about, /contact, etc."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={pageFormData.title}
                  onChange={(e) => setPageFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Page title for SEO"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={pageFormData.description}
                onChange={(e) => setPageFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Meta description for search results"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keywords
                </label>
                <input
                  type="text"
                  value={pageFormData.keywords}
                  onChange={(e) => setPageFormData(prev => ({ ...prev, keywords: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="keyword1, keyword2, keyword3"
                />
                <p className="text-xs text-gray-500 mt-1">Comma-separated keywords</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OG Image URL
                </label>
                <input
                  type="url"
                  value={pageFormData.og_image_url}
                  onChange={(e) => setPageFormData(prev => ({ ...prev, og_image_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://yoursite.com/image.jpg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OG Title
                </label>
                <input
                  type="text"
                  value={pageFormData.og_title}
                  onChange={(e) => setPageFormData(prev => ({ ...prev, og_title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Title for social sharing"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Canonical URL
                </label>
                <input
                  type="url"
                  value={pageFormData.canonical_url}
                  onChange={(e) => setPageFormData(prev => ({ ...prev, canonical_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://yoursite.com/canonical-url"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OG Description
              </label>
              <textarea
                value={pageFormData.og_description}
                onChange={(e) => setPageFormData(prev => ({ ...prev, og_description: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Description for social sharing"
              />
            </div>

            {/* SEO Preview */}
            {(pageFormData.title || pageFormData.description) && (
              <SEOPreview
                title={pageFormData.title}
                description={pageFormData.description}
                url={`https://yoursite.com${pageFormData.page_path}`}
              />
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={createPageSEOMutation.isPending || updatePageSEOMutation.isPending}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {createPageSEOMutation.isPending || updatePageSEOMutation.isPending ? 'Saving...' : 'Save Page SEO'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPageForm(false);
                  setSelectedPage(null);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Page SEO List */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Existing Page SEO Settings</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {pageSeo && pageSeo.length > 0 ? (
            pageSeo.map((page) => (
              <div key={page.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{page.page_path}</span>
                    {page.title && (
                      <span className="text-gray-500">• {page.title}</span>
                    )}
                  </div>
                  {page.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{page.description}</p>
                  )}
                  {page.keywords && page.keywords.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {page.keywords.slice(0, 3).map((keyword: string, index: number) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {keyword}
                        </span>
                      ))}
                      {page.keywords.length > 3 && (
                        <span className="text-xs text-gray-500">+{page.keywords.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEditPage(page)}
                    className="p-2 text-gray-400 hover:text-blue-600 focus:outline-none focus:text-blue-600"
                    title="Edit page SEO"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePage(page.id)}
                    disabled={deletePageSEOMutation.isPending}
                    className="p-2 text-gray-400 hover:text-red-600 focus:outline-none focus:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete page SEO"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No page SEO settings</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create SEO settings for specific pages to optimize their search performance.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleNewPage}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Plus className="h-4 w-4" />
                  Add First Page SEO
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};