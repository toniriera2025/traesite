import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjects, useUpdateProject } from '@/hooks/useData';
import MultilingualForm from './MultilingualForm';
import YouTubeInput from './YouTubeInput';
import { ProjectImageManager } from './ProjectImageManager';
import { Globe, Plus, Edit, Video, Image, Settings } from 'lucide-react';
import { validateYouTubeUrl } from '@/lib/youtubeUtils';
import toast from 'react-hot-toast';

const MultilingualProjectsPage: React.FC = () => {
  const { t } = useTranslation('admin');
  const { data: projects = [], isLoading } = useProjects();
  const updateProject = useUpdateProject();
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [managingProjectImages, setManagingProjectImages] = useState<string | null>(null);

  const projectFields = [
    { name: 'title', label: t('projects.project_title'), type: 'text' as const, required: true },
    { name: 'description', label: t('projects.project_description'), type: 'textarea' as const, required: true },
    { name: 'seo_title', label: 'SEO Title', type: 'text' as const },
    { name: 'seo_description', label: 'SEO Description', type: 'textarea' as const },
    { name: 'meta_title', label: 'Meta Title', type: 'text' as const },
    { name: 'meta_description', label: 'Meta Description', type: 'textarea' as const }
  ];

  const handleSaveProject = async (projectId: string, data: Record<string, any>) => {
    try {
      await updateProject.mutateAsync({ id: projectId, ...data });
      setEditingProject(null);
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project');
    }
  };

  const handleYouTubeUrlChange = async (projectId: string, url: string, videoId?: string, thumbnailUrl?: string) => {
    try {
      // Find the current project to compare values
      const currentProject = projects.find(p => p.id === projectId);
      const currentUrl = currentProject?.youtube_url || '';
      
      // Only update if the URL actually changed (not just during validation)
      if (currentUrl === url) {
        return; // No change, don't update or show notification
      }
      
      const updateData: any = {
        youtube_url: url || null,
        youtube_video_id: videoId || null,
        youtube_thumbnail_url: thumbnailUrl || null
      };
      
      await updateProject.mutateAsync({ id: projectId, ...updateData });
      
      // Only show notification for meaningful changes
      if (url && videoId) {
        toast.success('YouTube video linked successfully!');
      } else if (!url && currentUrl) {
        toast.success('YouTube video removed successfully!');
      }
    } catch (error) {
      console.error('Error updating YouTube URL:', error);
      toast.error('Failed to update YouTube URL');
    }
  };

  const handleManageImages = (projectId: string) => {
    setManagingProjectImages(projectId);
  };

  const getProjectMediaType = (project: any) => {
    if (project.youtube_video_id) return 'video';
    if (project.main_image_url) return 'image';
    return 'none';
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
      </div>
    );
  }

  // If managing project images, show the image management view
  if (managingProjectImages) {
    return (
      <ProjectImageManager
        projectId={managingProjectImages}
        onBack={() => setManagingProjectImages(null)}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Globe className="h-8 w-8 text-purple-600" />
            {t('projects.title')} - Multilingual
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your portfolio projects in multiple languages
          </p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
          <Plus className="h-4 w-4" />
          {t('projects.add_project')}
        </button>
      </div>

      {/* Projects List */}
      <div className="space-y-6">
        {projects.map(project => {
          const mediaType = getProjectMediaType(project);
          const isEditing = editingProject === project.id;
          
          return (
            <div key={project.id} className="space-y-4">
              {/* Project Media & YouTube URL Section */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {mediaType === 'video' ? (
                        <Video className="h-5 w-5" />
                      ) : mediaType === 'image' ? (
                        <Image className="h-5 w-5" />
                      ) : (
                        <Globe className="h-5 w-5" />
                      )}
                      {project.title || 'Untitled Project'}
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                        {mediaType === 'video' ? 'VIDEO' : mediaType === 'image' ? 'IMAGE' : 'NO MEDIA'}
                      </span>
                    </h3>
                    
                    <div className="flex items-center gap-2 text-xs text-white/80">
                      <span>Slug: {project.slug}</span>
                      <span>•</span>
                      <span>Status: {project.status}</span>
                      {project.is_featured && (
                        <>
                          <span>•</span>
                          <span className="bg-yellow-500/30 px-2 py-1 rounded">FEATURED</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Project Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleManageImages(project.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm font-medium"
                      title="Manage project images"
                    >
                      <Settings className="h-4 w-4" />
                      Manage Images
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <YouTubeInput
                    value={project.youtube_url || ''}
                    onChange={(url, videoId, thumbnailUrl) => 
                      handleYouTubeUrlChange(project.id, url, videoId, thumbnailUrl)
                    }
                    label="Project Video (YouTube URL)"
                    placeholder="https://youtube.com/watch?v=... (optional)"
                    disabled={updateProject.isPending}
                    showPreview={true}
                  />
                  
                  {/* Media Priority Info */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
                    <h4 className="font-medium text-gray-700 mb-2">Media Priority:</h4>
                    <div className="space-y-1 text-gray-600">
                      <div className={`flex items-center gap-2 ${mediaType === 'video' ? 'text-green-600 font-medium' : ''}`}>
                        <Video className="h-3 w-3" />
                        <span>1. YouTube Video {project.youtube_video_id ? '(Active)' : '(None)'}</span>
                      </div>
                      <div className={`flex items-center gap-2 ${mediaType === 'image' && !project.youtube_video_id ? 'text-green-600 font-medium' : ''}`}>
                        <Image className="h-3 w-3" />
                        <span>2. Main Image {project.main_image_url ? '(Available)' : '(None)'}</span>
                      </div>
                      <div className={`flex items-center gap-2 ${mediaType === 'none' ? 'text-orange-600 font-medium' : ''}`}>
                        <Globe className="h-3 w-3" />
                        <span>3. Fallback to placeholder</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Multilingual Content Form */}
              <MultilingualForm
                title={`${t('projects.edit_project')}: ${project.title || 'Untitled'}`}
                fields={projectFields}
                initialData={project}
                onSave={(data) => handleSaveProject(project.id, data)}
                isLoading={updateProject.isPending}
              />
            </div>
          )
        })}
        
        {projects.length === 0 && (
          <div className="text-center py-12">
            <Globe className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('projects.no_projects')}</h3>
            <p className="text-gray-500">
              Create your first multilingual project to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultilingualProjectsPage;