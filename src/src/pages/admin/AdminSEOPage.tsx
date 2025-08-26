import React, { useState } from 'react';
import { GlobalSeoForm } from '@/components/admin/seo/GlobalSeoForm';
import { PageSeoForm } from '@/components/admin/seo/PageSeoForm';
import { ProjectSeoList } from '@/components/admin/seo/ProjectSeoList';
import {
  useSeoSettings,
  usePageSeo,
  useProjects,
  useSeoInsights
} from '@/hooks/useSeo';
import {
  Search,
  Settings,
  Globe,
  BarChart3,
  FileText,
  Target,
  AlertTriangle
} from 'lucide-react';

type TabType = 'dashboard' | 'global' | 'pages' | 'projects';

export function AdminSEOPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
  // Fetch data for all tabs
  const { data: seoSettings, isLoading: isLoadingSeoSettings } = useSeoSettings();
  const { data: pageSeo, isLoading: isLoadingPageSeo } = usePageSeo();
  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const { data: seoInsights, isLoading: insightsLoading } = useSeoInsights();

  const tabs = [
    {
      id: 'dashboard' as TabType,
      label: 'SEO Dashboard',
      description: 'Overview of your website\'s SEO performance and insights',
      icon: BarChart3,
      count: null
    },
    {
      id: 'global' as TabType,
      label: 'Global SEO',
      description: 'Manage default SEO settings for your website',
      icon: Globe,
      count: seoSettings ? 1 : 0
    },
    {
      id: 'pages' as TabType,
      label: 'Page SEO',
      description: 'Configure SEO for specific pages',
      icon: FileText,
      count: pageSeo?.length || 0
    },
    {
      id: 'projects' as TabType,
      label: 'Project SEO',
      description: 'Optimize SEO for individual projects',
      icon: Target,
      count: projects?.length || 0
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Avg SEO Score</p>
                    <p className="text-2xl font-bold text-gray-900">{seoInsights?.avgProjectScore || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Target className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Projects</p>
                    <p className="text-2xl font-bold text-gray-900">{seoInsights?.totalProjects || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Need Improvement</p>
                    <p className="text-2xl font-bold text-gray-900">{seoInsights?.lowScoreProjects || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Page Settings</p>
                    <p className="text-2xl font-bold text-gray-900">{pageSeo?.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('global')}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Globe className="h-6 w-6 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Global Settings</div>
                    <div className="text-sm text-gray-500">Configure site-wide SEO defaults</div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('pages')}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FileText className="h-6 w-6 text-green-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Page SEO</div>
                    <div className="text-sm text-gray-500">Optimize individual pages</div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('projects')}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Target className="h-6 w-6 text-purple-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Project SEO</div>
                    <div className="text-sm text-gray-500">Optimize project visibility</div>
                  </div>
                </button>
              </div>
            </div>

            {/* SEO Tips */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-800 mb-4">SEO Best Practices</h3>
              <ul className="space-y-2 text-blue-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Keep titles between 30-60 characters for optimal display</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Write descriptions between 120-160 characters with clear call-to-action</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Use 3-7 relevant keywords per page, avoid keyword stuffing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Add descriptive alt text to all images for better accessibility</span>
                </li>
              </ul>
            </div>
          </div>
        );
      case 'global':
        return (
          <GlobalSeoForm 
            seoSettings={seoSettings}
            isLoading={isLoadingSeoSettings}
          />
        );
      case 'pages':
        return (
          <PageSeoForm 
            pageSeo={pageSeo}
            isLoading={isLoadingPageSeo}
          />
        );
      case 'projects':
        return (
          <ProjectSeoList 
            projects={projects}
            isLoading={isLoadingProjects}
          />
        );
      default:
        return null;
    }
  };

  if (isLoadingSeoSettings || isLoadingPageSeo || isLoadingProjects || insightsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SEO Management</h1>
        <p className="text-gray-600">
          Optimize your website's search engine visibility with comprehensive SEO settings.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5 mr-2" />
                <span>{tab.label}</span>
                {tab.count !== null && tab.count > 0 && (
                  <span
                    className={`
                      ml-2 py-0.5 px-2 rounded-full text-xs font-medium
                      ${
                        isActive
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-900'
                      }
                    `}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Description */}
      <div className="mb-6">
        <p className="text-gray-600">
          {tabs.find(tab => tab.id === activeTab)?.description}
        </p>
      </div>

      {/* Tab Content */}
      <div className={activeTab === 'dashboard' ? '' : 'bg-white rounded-lg shadow-sm border border-gray-200'}>
        {renderTabContent()}
      </div>
    </div>
  );
}