import React, { useState } from 'react';
import { Camera, Upload, Edit2, Trash2, Check, X, Image, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  usePersonalPhoto, 
  useAllPersonalPhotos, 
  useCreatePersonalPhoto, 
  useUpdatePersonalPhoto, 
  useSetActivePersonalPhoto, 
  useDeletePersonalPhoto 
} from '../../hooks/useData';
import { FileUpload } from '../../components/admin/FileUpload';
import { ImageCropper } from '../../components/admin/ImageCropper';

interface PersonalPhoto {
  id: string;
  image_url: string;
  alt_text: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PhotoFormData {
  image_url: string;
  alt_text: string;
  description: string;
}

const AdminPersonalPhotoPage: React.FC = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PersonalPhoto | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<PersonalPhoto | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<PhotoFormData>({
    image_url: '',
    alt_text: '',
    description: ''
  });

  // Hooks
  const { data: activePhoto, isLoading: activePhotoLoading } = usePersonalPhoto();
  const { data: allPhotos = [], isLoading: allPhotosLoading, refetch } = useAllPersonalPhotos();
  const createPhotoMutation = useCreatePersonalPhoto();
  const updatePhotoMutation = useUpdatePersonalPhoto();
  const setActivePhotoMutation = useSetActivePersonalPhoto();
  const deletePhotoMutation = useDeletePersonalPhoto();

  const handleFileUpload = (url: string) => {
    setUploadedImageUrl(url);
    setFormData(prev => ({ ...prev, image_url: url }));
  };

  const handleCropComplete = (croppedBlob: Blob, originalImage: string) => {
    // Convert blob to data URL for preview
    const reader = new FileReader();
    reader.onload = () => {
      const croppedUrl = reader.result as string;
      setCroppedImageUrl(croppedUrl);
      setFormData(prev => ({ ...prev, image_url: croppedUrl }));
    };
    reader.readAsDataURL(croppedBlob);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image_url.trim()) {
      toast.error('Please upload and crop an image');
      return;
    }

    try {
      if (selectedPhoto) {
        await updatePhotoMutation.mutateAsync({
          id: selectedPhoto.id,
          ...formData
        });
        toast.success('Photo updated successfully!');
        setIsEditModalOpen(false);
      } else {
        await createPhotoMutation.mutateAsync(formData);
        toast.success('Photo uploaded successfully!');
        setIsUploadModalOpen(false);
      }
      
      resetForm();
      refetch();
    } catch (error) {
      toast.error('Failed to save photo');
      console.error('Error saving photo:', error);
    }
  };

  const handleSetActive = async (photoId: string) => {
    try {
      await setActivePhotoMutation.mutateAsync(photoId);
      toast.success('Active photo updated!');
      refetch();
    } catch (error) {
      toast.error('Failed to set active photo');
      console.error('Error setting active photo:', error);
    }
  };

  const handleDelete = async () => {
    if (!photoToDelete) return;
    
    try {
      await deletePhotoMutation.mutateAsync(photoToDelete.id);
      toast.success('Photo deleted successfully!');
      setIsDeleteConfirmOpen(false);
      setPhotoToDelete(null);
      refetch();
    } catch (error) {
      toast.error('Failed to delete photo');
      console.error('Error deleting photo:', error);
    }
  };

  const openEditModal = (photo: PersonalPhoto) => {
    setSelectedPhoto(photo);
    setFormData({
      image_url: photo.image_url,
      alt_text: photo.alt_text || '',
      description: photo.description || ''
    });
    setUploadedImageUrl(photo.image_url);
    setCroppedImageUrl(photo.image_url);
    setIsEditModalOpen(true);
  };

  const openUploadModal = () => {
    setSelectedPhoto(null);
    resetForm();
    setIsUploadModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      image_url: '',
      alt_text: '',
      description: ''
    });
    setUploadedImageUrl(null);
    setCroppedImageUrl(null);
  };

  const closeModals = () => {
    setIsUploadModalOpen(false);
    setIsEditModalOpen(false);
    resetForm();
  };

  const openDeleteConfirm = (photo: PersonalPhoto) => {
    setPhotoToDelete(photo);
    setIsDeleteConfirmOpen(true);
  };

  if (activePhotoLoading || allPhotosLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Personal Photo Management</h1>
          <p className="text-gray-400">Manage your personal photo displayed on the About page</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openUploadModal}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
        >
          <Upload size={20} />
          Upload New Photo
        </motion.button>
      </div>

      {/* Current Active Photo */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Eye size={20} className="text-green-400" />
          Currently Active Photo
        </h2>
        {activePhoto ? (
          <div className="flex items-start gap-6">
            <div className="relative">
              <img
                src={activePhoto.image_url}
                alt={activePhoto.alt_text || 'Personal photo'}
                className="w-32 h-32 object-cover rounded-full border-4 border-gradient-to-r from-purple-500 to-pink-500 p-1 bg-gradient-to-r from-purple-500 to-pink-500"
              />
              <div className="absolute -top-2 -right-2 bg-green-500 w-6 h-6 rounded-full flex items-center justify-center">
                <Check size={14} className="text-white" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-gray-300 mb-2"><strong>Alt Text:</strong> {activePhoto.alt_text || 'Not set'}</p>
              <p className="text-gray-300 mb-2"><strong>Description:</strong> {activePhoto.description || 'Not set'}</p>
              <p className="text-gray-400 text-sm">Uploaded: {new Date(activePhoto.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openEditModal(activePhoto)}
                className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
              >
                <Edit2 size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openDeleteConfirm(activePhoto)}
                className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Camera size={48} className="mx-auto mb-4 opacity-50" />
            <p>No active photo set. Upload your first photo to get started.</p>
          </div>
        )}
      </div>

      {/* All Photos Grid */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Image size={20} className="text-purple-400" />
          All Photos ({allPhotos.length})
        </h2>
        {allPhotos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allPhotos.map((photo) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative bg-gray-700/50 rounded-lg p-4 border-2 transition-all duration-300 ${
                  photo.is_active 
                    ? 'border-green-500 bg-green-500/10' 
                    : 'border-gray-600 hover:border-purple-500/50'
                }`}
              >
                <div className="relative mb-3">
                  <img
                    src={photo.image_url}
                    alt={photo.alt_text || 'Personal photo'}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  {photo.is_active && (
                    <div className="absolute -top-2 -right-2 bg-green-500 w-6 h-6 rounded-full flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-300 truncate">
                    <strong>Alt:</strong> {photo.alt_text || 'Not set'}
                  </p>
                  <p className="text-sm text-gray-300 truncate">
                    <strong>Desc:</strong> {photo.description || 'Not set'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(photo.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex justify-between">
                  <div className="flex gap-1">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openEditModal(photo)}
                      className="p-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition-colors"
                    >
                      <Edit2 size={12} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openDeleteConfirm(photo)}
                      className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors"
                    >
                      <Trash2 size={12} />
                    </motion.button>
                  </div>
                  {!photo.is_active && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSetActive(photo.id)}
                      className="px-2 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded text-xs transition-colors"
                    >
                      Set Active
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Camera size={64} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg mb-2">No photos uploaded yet</p>
            <p className="text-sm">Click the "Upload New Photo" button to add your first photo.</p>
          </div>
        )}
      </div>

      {/* Upload/Edit Modal */}
      <AnimatePresence>
        {(isUploadModalOpen || isEditModalOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModals}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {selectedPhoto ? 'Edit Photo' : 'Upload New Photo'}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeModals}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </motion.button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* File Upload */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-300">
                    Image Upload
                  </label>
                  <FileUpload
                    value=""
                    onChange={handleFileUpload}
                    label="Upload Image"
                    accept="image/*"
                    folder="personal-photos"
                    category="personal"
                  />
                  
                  {/* Image Cropping */}
                  {uploadedImageUrl && (
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-300">
                        Crop Image (Circular Preview)
                      </label>
                      <ImageCropper
                        imageSrc={uploadedImageUrl}
                        onCropComplete={handleCropComplete}
                        onCancel={() => setUploadedImageUrl(null)}
                        aspectRatio={1}
                        cropShape="round"
                      />
                    </div>
                  )}
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Alt Text (for accessibility)
                    </label>
                    <input
                      type="text"
                      value={formData.alt_text}
                      onChange={(e) => setFormData(prev => ({ ...prev, alt_text: e.target.value }))}
                      placeholder="e.g., Professional headshot of Toni Riera"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the photo..."
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={closeModals}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!formData.image_url || createPhotoMutation.isPending || updatePhotoMutation.isPending}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {(createPhotoMutation.isPending || updatePhotoMutation.isPending) ? 'Saving...' : (selectedPhoto ? 'Update Photo' : 'Upload Photo')}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteConfirmOpen && photoToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsDeleteConfirmOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={24} className="text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Delete Photo</h3>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to delete this photo? This action cannot be undone.
                  {photoToDelete.is_active && (
                    <span className="block mt-2 text-yellow-400 text-sm font-medium">
                      ⚠️ This is your currently active photo.
                    </span>
                  )}
                </p>
                <div className="flex gap-3 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsDeleteConfirmOpen(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDelete}
                    disabled={deletePhotoMutation.isPending}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletePhotoMutation.isPending ? 'Deleting...' : 'Delete Photo'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPersonalPhotoPage;