import React, { useState } from 'react';
import { useProjects, useUpdateProjectSEO } from '@/hooks/useData';
import { analyzeProjectSEO } from '@/lib/seoUtils';
import {
  Target,
  Edit2,
  Save,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Hash,
  Eye,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ProjectSeoListProps {
  projects?: any[];
  isLoading: boolean;
}

interface SEOScoreProps {
  score: number;
  label: string;
}

function SEOScore({ score, label }: SEOScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };
  
  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle size={16} />;
    if (score >= 60) return <AlertTriangle size={16} />;
    return <AlertTriangle size={16} />;
  };
  
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getScoreColor(score)}`}>
      {getScoreIcon(score)}
      <span className="font-medium">{score}/100</span>
      <span className="text-sm">{label}</span>
    </div>
  );
}

interface ProjectSEOModalProps {
  project: any;
  onClose: () => void;
  onSave: (projectId: number, updates: any) => void;
  isUpdating: boolean;
}

function ProjectSEOModal({ project, onClose, onSave, isUpdating }: ProjectSEOModalProps) {
  const [formData, setFormData] = useState({
    seo_title: project.seo_title || '',
    seo_description: project.seo_description || '',
    seo_keywords: project.seo_keywords ? project.seo_keywords.join(', ') : '',
    main_image_alt: project.main_image_alt || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const keywords = formData.seo_keywords 
      ? formData.seo_keywords.split(',').map(k => k.trim()).filter(Boolean)
      : [];
    
    onSave(project.id, {
      ...formData,
      seo_keywords: keywords
    });
  };

  const seoAnalysis = analyzeProjectSEO({
    ...project,
    seo_title: formData.seo_title,
    seo_description: formData.seo_description,
    seo_keywords: formData.seo_keywords ? formData.seo_keywords.split(',').map(k => k.trim()).filter(Boolean) : [],
    main_image_alt: formData.main_image_alt
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                SEO Settings: {project.title}
              </h2>
              <p className="text-gray-600 mt-1">
                Optimize SEO settings for this project
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SEO Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={formData.seo_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={project.title}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to use project title. Recommended: 30-60 characters.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Description
                  </label>
                  <textarea
                    value={formData.seo_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={project.description}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to use project description. Recommended: 120-160 characters.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Keywords
                  </label>
                  <input
                    type="text"
                    value={formData.seo_keywords}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_keywords: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="design, creative, portfolio, branding"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Comma-separated keywords. Recommended: 3-7 keywords.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Main Image Alt Text
                  </label>
                  <input
                    type="text"
                    value={formData.main_image_alt}
                    onChange={(e) => setFormData(prev => ({ ...prev, main_image_alt: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descriptive text for the main project image"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Describe the main image for accessibility and SEO.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4" />
                    {isUpdating ? 'Saving...' : 'Save SEO Settings'}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            {/* SEO Analysis & Preview */}
            <div className="space-y-6">
              {/* SEO Score */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  SEO Score
                </h3>
                <SEOScore score={seoAnalysis.overall_score} label="Overall" />
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Title:</span>
                    <span className={`font-medium ${
                      seoAnalysis.title_score >= 80 ? 'text-green-600' :
                      seoAnalysis.title_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {seoAnalysis.title_score}/100
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Description:</span>
                    <span className={`font-medium ${
                      seoAnalysis.description_score >= 80 ? 'text-green-600' :
                      seoAnalysis.description_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {seoAnalysis.description_score}/100
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Keywords:</span>
                    <span className={`font-medium ${
                      seoAnalysis.keywords_score >= 80 ? 'text-green-600' :
                      seoAnalysis.keywords_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {seoAnalysis.keywords_score}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* Search Preview */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Eye size={16} />
                  Search Result Preview
                </h4>
                <div className="space-y-1">
                  <div className="text-blue-600 text-lg font-medium hover:underline cursor-pointer">
                    {formData.seo_title || project.title}
                  </div>
                  <div className="text-green-700 text-sm">
                    https://yoursite.com/portfolio/{project.slug}
                  </div>
                  <div className="text-gray-600 text-sm leading-relaxed">
                    {formData.seo_description || project.description || 'Project description will appear here...'}
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              {seoAnalysis.suggestions.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Suggestions</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {seoAnalysis.suggestions.slice(0, 3).map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ProjectSeoList: React.FC<ProjectSeoListProps> = ({
  projects,
  isLoading
}) => {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const updateProjectSEOMutation = useUpdateProjectSEO();

  const handleUpdateProjectSEO = async (projectId: number, updates: any) => {
    try {
      await updateProjectSEOMutation.mutateAsync({ id: projectId, ...updates });
      setSelectedProject(null);
      toast.success('Project SEO updated successfully');
    } catch (error) {
      console.error('Error updating project SEO:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const projectsWithSEO = projects?.map(project => {
    const seoAnalysis = analyzeProjectSEO(project);
    return {
      ...project,
      seoScore: seoAnalysis.overall_score
    };
  }).sort((a, b) => a.seoScore - b.seoScore) || [];

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Target className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Project SEO Management</h2>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Project SEO Performance</h3>
          <p className="text-sm text-gray-600 mt-1">
            Optimize individual projects for better search engine visibility
          </p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {projectsWithSEO.length > 0 ? (
            projectsWithSEO.map((project) => {
              const seoAnalysis = analyzeProjectSEO(project);
              
              return (
                <div key={project.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">{project.title}</h4>
                        <SEOScore score={project.seoScore} label="SEO" />
                        {project.slug && (
                          <a
                            href={`/portfolio/${project.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-600"
                            title="View project"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          <strong>Title:</strong> {project.seo_title || project.title}
                        </div>
                        <div>
                          <strong>Description:</strong> {project.seo_description || project.description || 'No description'}
                        </div>
                        {project.seo_keywords && project.seo_keywords.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4" />
                            <div className="flex gap-1">
                              {project.seo_keywords.slice(0, 3).map((keyword: string, index: number) => (
                                <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  {keyword}
                                </span>
                              ))}
                              {project.seo_keywords.length > 3 && (
                                <span className="text-xs text-gray-500">+{project.seo_keywords.length - 3} more</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {seoAnalysis.issues.length > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <span className="text-yellow-700">
                              {seoAnalysis.issues.length} issue{seoAnalysis.issues.length > 1 ? 's' : ''} found
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
                      >
                        <Edit2 className="h-4 w-4" />
                        Optimize SEO
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-6 py-12 text-center">
              <Target className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create some projects first to manage their SEO settings.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Project SEO Modal */}
      {selectedProject && (
        <ProjectSEOModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onSave={handleUpdateProjectSEO}
          isUpdating={updateProjectSEOMutation.isPending}
        />
      )}
    </div>
  );
};