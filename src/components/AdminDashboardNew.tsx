import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  LayoutGrid,
  Upload,
  Settings,
  Image as ImageIcon,
  Trash2,
  GripVertical,
  Plus,
  Edit2,
  Save,
  XCircle,
  CheckCircle,
  AlertCircle,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchImages, uploadImage, updateImage, deleteImage, getGalleries, validateFile } from '../lib/storage';
import type { DatabaseImage } from '../lib/supabase';

interface Gallery {
  id: string;
  name: string;
  count: number;
}

export function AdminDashboard() {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'galleries' | 'upload' | 'settings'>('galleries');
  const [images, setImages] = useState<DatabaseImage[]>([]);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [selectedGallery, setSelectedGallery] = useState('all');
  const [draggedImage, setDraggedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<DatabaseImage>>({});
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    gallery: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedGallery]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [imagesData, galleriesData] = await Promise.all([
        fetchImages(selectedGallery === 'all' ? undefined : selectedGallery),
        getGalleries(),
      ]);
      setImages(imagesData);
      setGalleries(galleriesData);
      
      // Show helpful message if no database setup
      if (galleriesData.length > 0 && imagesData.length === 0) {
        showNotification('info', 'Database connected! Upload your first images to get started.');
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      showNotification('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDragStart = (imageId: string) => {
    setDraggedImage(imageId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggedImage) return;

    const draggedIndex = images.findIndex(img => img.id === draggedImage);
    const targetIndex = images.findIndex(img => img.id === targetId);

    if (draggedIndex === targetIndex) return;

    const newImages = [...images];
    const [removed] = newImages.splice(draggedIndex, 1);
    newImages.splice(targetIndex, 0, removed);

    setImages(newImages);
    setDraggedImage(null);
    
    // Update order in database (you might want to add an order field)
    showNotification('success', 'Image order updated');
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
      await deleteImage(imageId);
      setImages(images.filter(img => img.id !== imageId));
      showNotification('success', 'Image deleted successfully');
      await loadData(); // Refresh galleries count
    } catch (error) {
      console.error('Failed to delete image:', error);
      showNotification('error', 'Failed to delete image');
    }
  };

  const handleEdit = (image: DatabaseImage) => {
    setEditingImage(image.id);
    setEditForm({
      title: image.title,
      description: image.description || '',
      tags: image.tags,
      gallery: image.gallery,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingImage) return;
    
    try {
      await updateImage(editingImage, editForm);
      setImages(images.map(img => 
        img.id === editingImage ? { ...img, ...editForm } : img
      ));
      setEditingImage(null);
      setEditForm({});
      showNotification('success', 'Image updated successfully');
    } catch (error) {
      console.error('Failed to update image:', error);
      showNotification('error', 'Failed to update image');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate files
    const invalidFiles = files.filter(file => !validateFile(file).valid);
    if (invalidFiles.length > 0) {
      showNotification('error', `Invalid files: ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }

    if (files.length > 20) {
      showNotification('error', 'Maximum 20 files allowed per upload');
      return;
    }

    if (!uploadForm.gallery) {
      showNotification('error', 'Please select a gallery');
      return;
    }

    setUploading(true);
    const uploadPromises = files.map(file => 
      uploadImage(file, {
        title: uploadForm.title || file.name.split('.')[0],
        description: uploadForm.description,
        gallery: uploadForm.gallery,
        tags: uploadForm.tags,
        filename: file.name, 
      })
    );

    try {
      const results = await Promise.all(uploadPromises);
      showNotification('success', `Successfully uploaded ${results.length} images`);
      setUploadForm({ title: '', description: '', gallery: '', tags: [] });
      setTagInput('');
      await loadData();
    } catch (error) {
      console.error('Upload failed:', error);
      showNotification('error', 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !uploadForm.tags.includes(tagInput.trim())) {
      setUploadForm({
        ...uploadForm,
        tags: [...uploadForm.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setUploadForm({
      ...uploadForm,
      tags: uploadForm.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const addEditTag = () => {
    if (tagInput.trim() && editForm.tags && !editForm.tags.includes(tagInput.trim())) {
      setEditForm({
        ...editForm,
        tags: [...(editForm.tags || []), tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeEditTag = (tagToRemove: string) => {
    if (editForm.tags) {
      setEditForm({
        ...editForm,
        tags: editForm.tags.filter(tag => tag !== tagToRemove)
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className={`font-semibold text-gray-800 ${!sidebarOpen && 'hidden'}`}>
              Admin Panel
            </h2>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('galleries')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'galleries' 
                  ? 'bg-orange-500 text-white' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
              {sidebarOpen && <span>Manage Galleries</span>}
            </button>
            
            <button
              onClick={() => setActiveTab('upload')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'upload' 
                  ? 'bg-orange-500 text-white' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Upload className="w-5 h-5" />
              {sidebarOpen && <span>Upload Images</span>}
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'settings' 
                  ? 'bg-orange-500 text-white' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Settings className="w-5 h-5" />
              {sidebarOpen && <span>Settings</span>}
            </button>
          </div>
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-800">
              {activeTab === 'galleries' && 'Manage Galleries'}
              {activeTab === 'upload' && 'Upload Images'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
            <div className="text-sm text-gray-600">
              Logged in as {user?.email}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {/* Notification */}
          {notification && (
            <div className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
              notification.type === 'success' ? 'bg-green-100 text-green-800' :
              notification.type === 'error' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {notification.type === 'error' && <XCircle className="w-5 h-5" />}
              {notification.type === 'info' && <AlertCircle className="w-5 h-5" />}
              {notification.message}
            </div>
          )}

          {/* Galleries Tab */}
          {activeTab === 'galleries' && (
            <div>
              {/* Gallery Filter */}
              <div className="mb-6 flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedGallery('all')}
                  className={`px-4 py-2 rounded-lg ${
                    selectedGallery === 'all'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white border hover:bg-gray-50'
                  }`}
                >
                  All ({images.length})
                </button>
                {galleries.map(gallery => (
                  <button
                    key={gallery.id}
                    onClick={() => setSelectedGallery(gallery.id)}
                    className={`px-4 py-2 rounded-lg ${
                      selectedGallery === gallery.id
                        ? 'bg-orange-500 text-white'
                        : 'bg-white border hover:bg-gray-50'
                    }`}
                  >
                    {gallery.name} ({gallery.count})
                  </button>
                ))}
              </div>

              {/* Images Grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg"></div>
                  ))}
                </div>
              ) : images.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      draggable
                      onDragStart={() => handleDragStart(image.id)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(image.id)}
                      className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-move"
                    >
                      <div className="aspect-square relative overflow-hidden rounded-t-lg">
                        <img
                          src={image.url}
                          alt={image.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(image)}
                            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 mr-2"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(image.id)}
                            className="p-2 bg-white rounded-full shadow-md hover:bg-red-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="absolute left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 truncate">{image.title}</h3>
                        <p className="text-sm text-gray-500 truncate">{image.gallery}</p>
                        {image.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {image.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                            {image.tags.length > 2 && (
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                +{image.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Edit Form */}
                      {editingImage === image.id && (
                        <div className="p-4 border-t bg-gray-50">
                          <input
                            type="text"
                            value={editForm.title || ''}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            className="w-full mb-2 px-3 py-2 border rounded"
                            placeholder="Title"
                          />
                          <textarea
                            value={editForm.description || ''}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="w-full mb-2 px-3 py-2 border rounded"
                            placeholder="Description"
                            rows={2}
                          />
                          <div className="mb-2">
                            <div className="flex gap-2 mb-2">
                              <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addEditTag()}
                                className="flex-1 px-3 py-2 border rounded"
                                placeholder="Add tag"
                              />
                              <button
                                onClick={addEditTag}
                                className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {editForm.tags?.map(tag => (
                                <span key={tag} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded flex items-center gap-1">
                                  {tag}
                                  <button
                                    onClick={() => removeEditTag(tag)}
                                    className="hover:text-orange-600"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveEdit}
                              className="flex-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center gap-2"
                            >
                              <Save className="w-4 h-4" />
                              Save
                            </button>
                            <button
                              onClick={() => setEditingImage(null)}
                              className="flex-1 px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
                  <p className="text-gray-500">
                    {selectedGallery === 'all' 
                      ? "Upload your first images to get started" 
                      : `No images in ${selectedGallery} gallery`}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Upload Images</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gallery
                    </label>
                    <select
                      value={uploadForm.gallery}
                      onChange={(e) => setUploadForm({ ...uploadForm, gallery: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Select a gallery</option>
                      {galleries.map(gallery => (
                        <option key={gallery.id} value={gallery.id}>
                          {gallery.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Title
                    </label>
                    <input
                      type="text"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Default title for all images"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Description
                    </label>
                    <textarea
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Default description for all images"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Tags
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        className="flex-1 px-3 py-2 border rounded-lg"
                        placeholder="Add tag"
                      />
                      <button
                        onClick={addTag}
                        className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {uploadForm.tags.map(tag => (
                        <span key={tag} className="text-sm bg-orange-100 text-orange-800 px-3 py-1 rounded-full flex items-center gap-2">
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="hover:text-orange-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Images (Max 20 files, 20MB each)
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="w-full px-3 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                    />
                  </div>

                  <div className="text-sm text-gray-500">
                    <p>• Supported formats: JPG, PNG, WEBP</p>
                    <p>• Maximum file size: 20MB</p>
                    <p>• Maximum files per upload: 20</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Settings</h2>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Account Information</h3>
                    <p className="text-sm text-gray-600">Email: {user?.email}</p>
                    <p className="text-sm text-gray-600">User ID: {user?.id}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Storage Usage</h3>
                    <p className="text-sm text-gray-600">Total Images: {images.length}</p>
                    <p className="text-sm text-gray-600">Galleries: {galleries.length}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
