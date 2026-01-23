/**
 * MIGRATION NOTE:
 * Source: src/components/AdminDashboardNew.tsx
 * Destination: src/components/AdminDashboardNew.tsx (updated for Next.js)
 * This component needs 'use client' because it uses extensive state management, file uploads, and browser-only features.
 * The admin dashboard functionality is preserved exactly from the original implementation.
 * Any deviation is unintentional and should be flagged.
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { uploadImage, updateImage, deleteImage, validateFile, updateImageDimensions } from '../lib/storage';
import { getAllSiteContent, updateSiteContent, CONTENT_SECTIONS, DEFAULT_CONTENT } from '../services/contentService';
import { supabase } from '../lib/supabase';
import type { DatabaseImage } from '../lib/supabase';

export function AdminDashboard() {
  const { user, signOut } = useAuth();
  const { images: allImages, galleries, loading, refetch } = useData();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'galleries' | 'upload' | 'settings' | 'content'>('galleries');
  const [selectedGallery, setSelectedGallery] = useState('all');
  const [draggedImage, setDraggedImage] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<DatabaseImage>>({});
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    gallery: '',
    tags: [] as string[],
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  // Add mounted flag to prevent state updates on unmounted component
  const mountedRef = useRef(true);
  const [updatingDimensions, setUpdatingDimensions] = useState(false);
  const [siteContent, setSiteContent] = useState<Record<string, any>>(DEFAULT_CONTENT);
  const [contentLoading, setContentLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Filter images based on selected gallery (client-side filtering like main website)
  const images = selectedGallery === 'all' 
    ? allImages 
    : allImages.filter(img => img.gallery === selectedGallery);

  useEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    
    setDarkMode(shouldBeDark);
    // Apply theme to document root
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    // Load content when content tab is active
    if (activeTab === 'content') {
      loadContent();
    }
    
    // Cleanup function
    return () => {
      mountedRef.current = false;
    };
  }, [activeTab]); // Only re-run when tab changes

  const loadContent = async () => {
    try {
      setContentLoading(true);
      const allContent = await getAllSiteContent();
      
      // Convert array of SiteContent to object keyed by section
      const contentMap: Record<string, any> = { ...DEFAULT_CONTENT };
      
      allContent.forEach(item => {
        if (item.content) {
          contentMap[item.section] = item.content;
        }
      });
      
      setSiteContent(contentMap);
    } catch (error) {
      showNotification('error', 'Failed to load content. Using defaults.');
    } finally {
      setContentLoading(false);
    }
  };

  const handleSaveAllContent = async () => {
    try {
      setContentLoading(true);
      setSaveSuccess(false);
      
      
      // Save each content section to database
      const savePromises = Object.entries(siteContent).map(async ([section, content]) => {
        try {
          
          // Determine content type based on section
          let contentType: 'text' | 'image' | 'stats' | 'services' = 'text';
          if (section === CONTENT_SECTIONS.ABOUT_STATS) {
            contentType = 'stats';
          } else if (section === CONTENT_SECTIONS.ABOUT_SERVICES || section === CONTENT_SECTIONS.SOCIAL_MEDIA) {
            contentType = 'services';
          } else if (section === CONTENT_SECTIONS.ABOUT_IMAGE) {
            contentType = 'image';
          }
          
          const result = await updateSiteContent(section, content, contentType);
          return result;
        } catch (error) {
          throw error;
        }
      });
      
      await Promise.all(savePromises);
      
      setSaveSuccess(true);
      showNotification('success', 'All content saved successfully!');
      
      // Reset success state after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      showNotification('error', 'Failed to save content. Please try again.');
    } finally {
      setContentLoading(false);
    }
  };

  const handleUpdateDimensions = async () => {
    if (!confirm('This will update dimensions for all existing images. It may take a few minutes. Continue?')) {
      return;
    }
    
    setUpdatingDimensions(true);
    try {
      const result = await updateImageDimensions();
      showNotification('success', `Updated dimensions for ${result.updated} out of ${result.total} images`);
      await refetch(); // Refresh the data
    } catch (error) {
      showNotification('error', 'Failed to update image dimensions');
    } finally {
      setUpdatingDimensions(false);
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

    const draggedIndex = allImages.findIndex(img => img.id === draggedImage);
    const targetIndex = allImages.findIndex(img => img.id === targetId);

    if (draggedIndex === targetIndex) return;

    const newAllImages = [...allImages];
    const [removed] = newAllImages.splice(draggedIndex, 1);
    newAllImages.splice(targetIndex, 0, removed);

    // Note: Since we're using useData hook, we can't directly manipulate the images array
    // This drag and drop functionality would need to be implemented differently
    // For now, just show a notification
    setDraggedImage(null);
    showNotification('info', 'Drag and drop reordering will be available in a future update');
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
      await deleteImage(imageId);
      showNotification('success', 'Image deleted successfully');
      await refetch(); // Refresh data
    } catch (error) {
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
      setEditingImage(null);
      setEditForm({});
      showNotification('success', 'Image updated successfully');
      await refetch(); // Refresh data
    } catch (error) {
      showNotification('error', 'Failed to update image');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setSelectedFiles(files);
  };

  const handleUploadImages = async () => {
    if (selectedFiles.length === 0) return;

    if (!uploadForm.gallery) {
      showNotification('error', 'Please select a gallery');
      return;
    }

    setUploading(true);
    const uploadPromises = selectedFiles.map(file => 
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
      setSelectedFiles([]); // Clear selected files
      await refetch();
    } catch (error: any) {
      
      // Show more specific error messages
      if (error?.message?.includes('JWT')) {
        showNotification('error', 'Authentication error. Please sign in again.');
      } else if (error?.message?.includes('storage')) {
        showNotification('error', 'Storage error. Check Supabase storage bucket setup.');
      } else if (error?.message?.includes('permission')) {
        showNotification('error', 'Permission denied. Check RLS policies in Supabase.');
      } else {
        showNotification('error', `Upload failed: ${error?.message || 'Unknown error'}`);
      }
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
    <div className="flex h-screen bg-gray-50 dark:bg-black">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-black shadow-lg transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className={`font-semibold text-gray-800 dark:text-white ${!sidebarOpen && 'hidden'}`}>
              Admin Panel
            </h2>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
        
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('galleries')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'galleries' 
                  ? 'bg-black dark:bg-white text-white dark:text-black' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
              {sidebarOpen && <span>Manage Galleries</span>}
            </button>
            
            <button
              onClick={() => setActiveTab('upload')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'upload' 
                  ? 'bg-black dark:bg-white text-white dark:text-black' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Upload className="w-5 h-5" />
              {sidebarOpen && <span>Upload Images</span>}
            </button>
            
            <button
              onClick={() => setActiveTab('content')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'content' 
                  ? 'bg-black dark:bg-white text-white dark:text-black' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Edit2 className="w-5 h-5" />
              {sidebarOpen && <span>Manage Content</span>}
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'settings' 
                  ? 'bg-black dark:bg-white text-white dark:text-black' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Settings className="w-5 h-5" />
              {sidebarOpen && <span>Settings</span>}
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-black shadow-sm border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
              {activeTab === 'galleries' && 'Manage Galleries'}
              {activeTab === 'upload' && 'Upload Images'}
              {activeTab === 'content' && 'Manage Content'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                )}
              </button>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Logged in as {user?.email}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 bg-gray-50 dark:bg-black">
          {/* Notification */}
          {notification && (
            <div className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
              notification.type === 'success' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
              notification.type === 'error' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
              'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
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
              {/* Gallery Filter - Matching main website style */}
              <div className="mb-12 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setSelectedGallery('all')}
                  className={`px-4 py-2 rounded-full transition duration-300 ease-in-out ${
                    selectedGallery === 'all'
                      ? 'bg-black text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  All ({allImages.length})
                </button>
                {galleries.map((gallery) => (
                  <button
                    key={gallery.id}
                    onClick={() => setSelectedGallery(gallery.id)}
                    className={`px-4 py-2 rounded-full transition duration-300 ease-in-out ${
                      selectedGallery === gallery.id
                        ? 'bg-black text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {gallery.name} ({gallery.count})
                  </button>
                ))}
              </div>

              {/* Masonry Grid - Matching main website */}
              {loading ? (
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : images.length > 0 ? (
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      draggable
                      onDragStart={() => handleDragStart(image.id)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(image.id)}
                      className="break-inside-avoid mb-4 cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 group"
                    >
                      <div className="relative overflow-hidden rounded-lg">
                        <img
                          src={image.url}
                          alt={image.title}
                          className="w-full object-cover"
                          loading="lazy"
                        />
                        
                        {/* Admin Controls Overlay */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(image);
                              }}
                              className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
                            >
                              <Edit2 className="w-4 h-4 text-gray-700" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(image.id);
                              }}
                              className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Drag Handle */}
                        <div className="absolute left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          <div className="p-2 bg-black/50 backdrop-blur-sm rounded-full">
                            <GripVertical className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        
                        {/* Image Info Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out flex flex-col justify-end p-4 z-10">
                          <h3 className="text-white text-sm font-semibold mb-1">{image.title}</h3>
                          <p className="text-white/80 text-xs">
                            {image.gallery.charAt(0).toUpperCase() + image.gallery.slice(1)}
                          </p>
                          {image.width && image.height && (
                            <p className="text-white/60 text-xs mt-1">
                              {image.width} × {image.height}px
                            </p>
                          )}
                          {image.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {image.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-white">
                                  {tag}
                                </span>
                              ))}
                              {image.tags.length > 3 && (
                                <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-white">
                                  +{image.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
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
                                className="flex-1 px-3 py-2 border rounded-lg bg-white dark:bg-black border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                placeholder="Add tag"
                              />
                              <button
                                onClick={addEditTag}
                                className="px-3 py-2 bg-black text-white rounded hover:bg-gray-800"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {editForm.tags?.map(tag => (
                                <span key={tag} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded flex items-center gap-1">
                                  {tag}
                                  <button
                                    onClick={() => removeEditTag(tag)}
                                    className="hover:text-gray-600"
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
                <div className="text-center py-16">
                  <div className="text-gray-400 dark:text-gray-500 mb-4">No images found</div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {selectedGallery === 'all' 
                      ? "No images have been uploaded yet." 
                      : `No images found in "${galleries.find(g => g.id === selectedGallery)?.name}" category.`
                    }
                  </p>
                  {selectedGallery !== 'all' && (
                    <button
                      onClick={() => setSelectedGallery('all')}
                      className="text-black dark:text-white hover:text-gray-800 dark:hover:text-gray-200 underline mt-4"
                    >
                      View all images
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="w-full">
              <div className="bg-white dark:bg-black rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">Upload Images</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gallery
                    </label>
                    <select
                      value={uploadForm.gallery}
                      onChange={(e) => setUploadForm({ ...uploadForm, gallery: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Default Title
                    </label>
                    <input
                      type="text"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      placeholder="Enter image title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Default Description
                    </label>
                    <textarea
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      placeholder="Enter image description"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tags
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        className="flex-1 px-3 py-2 border rounded-lg bg-white dark:bg-black border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                        placeholder="Add tag"
                      />
                      <button
                        onClick={addTag}
                        className="px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {uploadForm.tags.map(tag => (
                        <span key={tag} className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded-full flex items-center gap-2">
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="hover:text-gray-600"
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

                  {/* Show Selected Files */}
                  {selectedFiles.length > 0 && (
                    <div className="mb-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                      <h4 className="font-medium mb-2">Selected Files ({selectedFiles.length})</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                              <ImageIcon className="w-4 h-4 text-gray-400" />
                              <span className="text-sm truncate max-w-xs">{file.name}</span>
                              <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                            </div>
                            <button
                              onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload Button */}
                  {selectedFiles.length > 0 && (
                    <button
                      onClick={handleUploadImages}
                      disabled={uploading || !uploadForm.gallery}
                      className="w-full px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Uploading {selectedFiles.length} files...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'Image' : 'Images'}
                        </>
                      )}
                    </button>
                  )}

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
            <div className="w-full">
              <div className="bg-white dark:bg-black rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">Settings</h2>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium mb-2 text-gray-800 dark:text-white">Account Information</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email: {user?.email}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">User ID: {user?.id}</p>
                  </div>
                  <div className="p-4 border rounded-lg border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium mb-2 text-gray-800 dark:text-white">Storage Usage</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Images: {images.length}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Galleries: {galleries.length}</p>
                  </div>
                  <div className="p-4 border rounded-lg border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium mb-2 text-gray-800 dark:text-white">Image Management</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Update dimensions for existing images that don't have width/height information
                    </p>
                    <button
                      onClick={handleUpdateDimensions}
                      disabled={updatingDimensions}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {updatingDimensions ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Updating Dimensions...
                        </>
                      ) : (
                        <>
                          <Settings className="w-4 h-4" />
                          Update Image Dimensions
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content Management Tab */}
          {activeTab === 'content' && (
            <div className="w-full">
              <div className="bg-white dark:bg-black rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">Website Content Management</h2>
                
                {contentLoading && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-blue-700">Loading content from database...</span>
                  </div>
                )}
                
                <div className="space-y-6">
                  {/* Home Top Text Section */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-4">Home Page - Top Text</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Top Banner Text</label>
                      <input
                        type="text"
                        value={siteContent[CONTENT_SECTIONS.HOME_TOP_TEXT]?.text || ''}
                        onChange={(e) => setSiteContent(prev => ({
                          ...prev,
                          [CONTENT_SECTIONS.HOME_TOP_TEXT]: {
                            ...prev[CONTENT_SECTIONS.HOME_TOP_TEXT],
                            text: e.target.value
                          }
                        }))}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Top banner text"
                      />
                    </div>
                  </div>

                  {/* Home Main Title Section */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-4">Home Page - Main Typography</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Left Text</label>
                        <input
                          type="text"
                          value={siteContent[CONTENT_SECTIONS.HOME_MAIN_TITLE]?.leftText || ''}
                          onChange={(e) => setSiteContent(prev => ({
                            ...prev,
                            [CONTENT_SECTIONS.HOME_MAIN_TITLE]: {
                              ...prev[CONTENT_SECTIONS.HOME_MAIN_TITLE],
                              leftText: e.target.value
                            }
                          }))}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="Left main title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Middle Text</label>
                        <input
                          type="text"
                          value={siteContent[CONTENT_SECTIONS.HOME_MAIN_TITLE]?.middleText || ''}
                          onChange={(e) => setSiteContent(prev => ({
                            ...prev,
                            [CONTENT_SECTIONS.HOME_MAIN_TITLE]: {
                              ...prev[CONTENT_SECTIONS.HOME_MAIN_TITLE],
                              middleText: e.target.value
                            }
                          }))}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="Middle text"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Right Text</label>
                        <input
                          type="text"
                          value={siteContent[CONTENT_SECTIONS.HOME_MAIN_TITLE]?.rightText || ''}
                          onChange={(e) => setSiteContent(prev => ({
                            ...prev,
                            [CONTENT_SECTIONS.HOME_MAIN_TITLE]: {
                              ...prev[CONTENT_SECTIONS.HOME_MAIN_TITLE],
                              rightText: e.target.value
                            }
                          }))}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="Right main title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Italic Text</label>
                        <input
                          type="text"
                          value={siteContent[CONTENT_SECTIONS.HOME_MAIN_TITLE]?.italicText || ''}
                          onChange={(e) => setSiteContent(prev => ({
                            ...prev,
                            [CONTENT_SECTIONS.HOME_MAIN_TITLE]: {
                              ...prev[CONTENT_SECTIONS.HOME_MAIN_TITLE],
                              italicText: e.target.value
                            }
                          }))}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="Italic text"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Home Button Text Section */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-4">Home Page - Button Text</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                      <input
                        type="text"
                        value={siteContent[CONTENT_SECTIONS.HOME_BUTTON_TEXT]?.text || ''}
                        onChange={(e) => setSiteContent(prev => ({
                          ...prev,
                          [CONTENT_SECTIONS.HOME_BUTTON_TEXT]: {
                            ...prev[CONTENT_SECTIONS.HOME_BUTTON_TEXT],
                            text: e.target.value
                          }
                        }))}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Button text"
                      />
                    </div>
                  </div>

                  {/* Home Hero Section */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-4">Home Page - Hero Section (Legacy)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Main Title</label>
                        <input
                          type="text"
                          value={siteContent[CONTENT_SECTIONS.HOME_HERO]?.title || ''}
                          onChange={(e) => setSiteContent(prev => ({
                            ...prev,
                            [CONTENT_SECTIONS.HOME_HERO]: {
                              ...prev[CONTENT_SECTIONS.HOME_HERO],
                              title: e.target.value
                            }
                          }))}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="Main hero title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                        <textarea
                          value={siteContent[CONTENT_SECTIONS.HOME_HERO]?.subtitle || ''}
                          onChange={(e) => setSiteContent(prev => ({
                            ...prev,
                            [CONTENT_SECTIONS.HOME_HERO]: {
                              ...prev[CONTENT_SECTIONS.HOME_HERO],
                              subtitle: e.target.value
                            }
                          }))}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="Hero subtitle"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* About Page Section */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-4">About Page - Bio</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bio Paragraphs</label>
                        {siteContent[CONTENT_SECTIONS.ABOUT_BIO]?.paragraphs?.map((paragraph: string, index: number) => (
                          <div key={index} className="mb-2">
                            <textarea
                              value={paragraph}
                              onChange={(e) => {
                                const newParagraphs = [...siteContent[CONTENT_SECTIONS.ABOUT_BIO].paragraphs];
                                newParagraphs[index] = e.target.value;
                                setSiteContent(prev => ({
                                  ...prev,
                                  [CONTENT_SECTIONS.ABOUT_BIO]: {
                                    ...prev[CONTENT_SECTIONS.ABOUT_BIO],
                                    paragraphs: newParagraphs
                                  }
                                }));
                              }}
                              className="w-full px-3 py-2 border rounded-lg"
                              placeholder={`Paragraph ${index + 1}`}
                              rows={3}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* About Page Stats Section */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-4">About Page - Statistics</h3>
                    <div className="space-y-4">
                      {siteContent[CONTENT_SECTIONS.ABOUT_STATS]?.map((stat: any, index: number) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                            <select
                              value={stat.icon || 'Camera'}
                              onChange={(e) => {
                                const newStats = [...siteContent[CONTENT_SECTIONS.ABOUT_STATS]];
                                newStats[index] = {
                                  ...stat,
                                  icon: e.target.value
                                };
                                setSiteContent(prev => ({
                                  ...prev,
                                  [CONTENT_SECTIONS.ABOUT_STATS]: newStats
                                }));
                              }}
                              className="w-full px-3 py-2 border rounded-lg"
                            >
                              <option value="Camera">Camera</option>
                              <option value="Award">Award</option>
                              <option value="Users">Users</option>
                              <option value="MapPin">MapPin</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
                            <input
                              type="text"
                              value={stat.label || ''}
                              onChange={(e) => {
                                const newStats = [...siteContent[CONTENT_SECTIONS.ABOUT_STATS]];
                                newStats[index] = {
                                  ...stat,
                                  label: e.target.value
                                };
                                setSiteContent(prev => ({
                                  ...prev,
                                  [CONTENT_SECTIONS.ABOUT_STATS]: newStats
                                }));
                              }}
                              className="w-full px-3 py-2 border rounded-lg"
                              placeholder="e.g., Projects Completed"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                            <input
                              type="text"
                              value={stat.value || ''}
                              onChange={(e) => {
                                const newStats = [...siteContent[CONTENT_SECTIONS.ABOUT_STATS]];
                                newStats[index] = {
                                  ...stat,
                                  value: e.target.value
                                };
                                setSiteContent(prev => ({
                                  ...prev,
                                  [CONTENT_SECTIONS.ABOUT_STATS]: newStats
                                }));
                              }}
                              className="w-full px-3 py-2 border rounded-lg"
                              placeholder="e.g., 500+"
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              onClick={() => {
                                const newStats = siteContent[CONTENT_SECTIONS.ABOUT_STATS].filter((_: any, i: number) => i !== index);
                                setSiteContent(prev => ({
                                  ...prev,
                                  [CONTENT_SECTIONS.ABOUT_STATS]: newStats
                                }));
                              }}
                              className="w-full px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newStats = [...(siteContent[CONTENT_SECTIONS.ABOUT_STATS] || [])];
                          newStats.push({
                            icon: 'Camera',
                            label: '',
                            value: ''
                          });
                          setSiteContent(prev => ({
                            ...prev,
                            [CONTENT_SECTIONS.ABOUT_STATS]: newStats
                          }));
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Stat
                      </button>
                    </div>
                  </div>

                  {/* Contact Information Section */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={siteContent[CONTENT_SECTIONS.CONTACT_INFO]?.email || ''}
                          onChange={(e) => setSiteContent(prev => ({
                            ...prev,
                            [CONTENT_SECTIONS.CONTACT_INFO]: {
                              ...prev[CONTENT_SECTIONS.CONTACT_INFO],
                              email: e.target.value
                            }
                          }))}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="contact@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={siteContent[CONTENT_SECTIONS.CONTACT_INFO]?.phone || ''}
                          onChange={(e) => setSiteContent(prev => ({
                            ...prev,
                            [CONTENT_SECTIONS.CONTACT_INFO]: {
                              ...prev[CONTENT_SECTIONS.CONTACT_INFO],
                              phone: e.target.value
                            }
                          }))}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input
                          type="text"
                          value={siteContent[CONTENT_SECTIONS.CONTACT_INFO]?.location || ''}
                          onChange={(e) => setSiteContent(prev => ({
                            ...prev,
                            [CONTENT_SECTIONS.CONTACT_INFO]: {
                              ...prev[CONTENT_SECTIONS.CONTACT_INFO],
                              location: e.target.value
                            }
                          }))}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="San Francisco, CA"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <textarea
                          value={siteContent[CONTENT_SECTIONS.CONTACT_INFO]?.address || ''}
                          onChange={(e) => setSiteContent(prev => ({
                            ...prev,
                            [CONTENT_SECTIONS.CONTACT_INFO]: {
                              ...prev[CONTENT_SECTIONS.CONTACT_INFO],
                              address: e.target.value
                            }
                          }))}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="123 Market Street, Suite 456&#10;San Francisco, CA 94102"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Media Section */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-4">Social Media Links</h3>
                    <div className="space-y-4">
                      {siteContent[CONTENT_SECTIONS.SOCIAL_MEDIA]?.map((social: any, index: number) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                            <input
                              type="text"
                              value={social.platform || ''}
                              onChange={(e) => {
                                const newSocialMedia = [...siteContent[CONTENT_SECTIONS.SOCIAL_MEDIA]];
                                newSocialMedia[index] = {
                                  ...social,
                                  platform: e.target.value
                                };
                                setSiteContent(prev => ({
                                  ...prev,
                                  [CONTENT_SECTIONS.SOCIAL_MEDIA]: newSocialMedia
                                }));
                              }}
                              className="w-full px-3 py-2 border rounded-lg"
                              placeholder="instagram"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                            <input
                              type="url"
                              value={social.url || ''}
                              onChange={(e) => {
                                const newSocialMedia = [...siteContent[CONTENT_SECTIONS.SOCIAL_MEDIA]];
                                newSocialMedia[index] = {
                                  ...social,
                                  url: e.target.value
                                };
                                setSiteContent(prev => ({
                                  ...prev,
                                  [CONTENT_SECTIONS.SOCIAL_MEDIA]: newSocialMedia
                                }));
                              }}
                              className="w-full px-3 py-2 border rounded-lg"
                              placeholder="https://instagram.com/username"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Handle</label>
                            <input
                              type="text"
                              value={social.handle || ''}
                              onChange={(e) => {
                                const newSocialMedia = [...siteContent[CONTENT_SECTIONS.SOCIAL_MEDIA]];
                                newSocialMedia[index] = {
                                  ...social,
                                  handle: e.target.value
                                };
                                setSiteContent(prev => ({
                                  ...prev,
                                  [CONTENT_SECTIONS.SOCIAL_MEDIA]: newSocialMedia
                                }));
                              }}
                              className="w-full px-3 py-2 border rounded-lg"
                              placeholder="@username"
                            />
                          </div>
                          <button
                            onClick={() => {
                              const newSocialMedia = siteContent[CONTENT_SECTIONS.SOCIAL_MEDIA].filter((_: any, i: number) => i !== index);
                              setSiteContent(prev => ({
                                ...prev,
                                [CONTENT_SECTIONS.SOCIAL_MEDIA]: newSocialMedia
                              }));
                            }}
                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newSocialMedia = [...siteContent[CONTENT_SECTIONS.SOCIAL_MEDIA]];
                          newSocialMedia.push({
                            platform: '',
                            url: '',
                            handle: ''
                          });
                          setSiteContent(prev => ({
                            ...prev,
                            [CONTENT_SECTIONS.SOCIAL_MEDIA]: newSocialMedia
                          }));
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Social Media Link
                      </button>
                    </div>
                  </div>

                  {/* About Page Services Section */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-4">About Page - Services</h3>
                    <div className="space-y-4">
                      {siteContent[CONTENT_SECTIONS.ABOUT_SERVICES]?.map((service: any, index: number) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Service Title</label>
                            <input
                              type="text"
                              value={service.title || ''}
                              onChange={(e) => {
                                const newServices = [...siteContent[CONTENT_SECTIONS.ABOUT_SERVICES]];
                                newServices[index] = {
                                  ...service,
                                  title: e.target.value
                                };
                                setSiteContent(prev => ({
                                  ...prev,
                                  [CONTENT_SECTIONS.ABOUT_SERVICES]: newServices
                                }));
                              }}
                              className="w-full px-3 py-2 border rounded-lg"
                              placeholder="e.g., Landscape Photography"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                              value={service.description || ''}
                              onChange={(e) => {
                                const newServices = [...siteContent[CONTENT_SECTIONS.ABOUT_SERVICES]];
                                newServices[index] = {
                                  ...service,
                                  description: e.target.value
                                };
                                setSiteContent(prev => ({
                                  ...prev,
                                  [CONTENT_SECTIONS.ABOUT_SERVICES]: newServices
                                }));
                              }}
                              className="w-full px-3 py-2 border rounded-lg"
                              placeholder="Describe the service..."
                              rows={3}
                            />
                          </div>
                          <div className="md:col-span-3">
                            <button
                              onClick={() => {
                                const newServices = siteContent[CONTENT_SECTIONS.ABOUT_SERVICES].filter((_: any, i: number) => i !== index);
                                setSiteContent(prev => ({
                                  ...prev,
                                  [CONTENT_SECTIONS.ABOUT_SERVICES]: newServices
                                }));
                              }}
                              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                              Remove Service
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newServices = [...(siteContent[CONTENT_SECTIONS.ABOUT_SERVICES] || [])];
                          newServices.push({
                            title: '',
                            description: ''
                          });
                          setSiteContent(prev => ({
                            ...prev,
                            [CONTENT_SECTIONS.ABOUT_SERVICES]: newServices
                          }));
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Service
                      </button>
                    </div>
                  </div>

                  {/* About Page Image Section */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-4">About Page Image</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image Upload</label>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                // Validate file first
                                const validation = validateFile(file);
                                if (!validation.valid) {
                                  showNotification('error', validation.error || 'Invalid file');
                                  return;
                                }

                                // Get current user
                                const { data: { user }, error: userError } = await supabase.auth.getUser();
                                if (userError || !user) {
                                  throw new Error('User not authenticated');
                                }

                                // Generate filename for profile image
                                const date = new Date();
                                const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
                                const fileExt = file.name.split('.').pop();
                                const filename = `profile_${dateStr}.${fileExt}`;

                                // Upload to Supabase Storage in a separate profile folder
                                const filePath = `profile/${filename}`;
                                const { error: uploadError } = await supabase.storage
                                  .from('images')
                                  .upload(filePath, file);

                                if (uploadError) {
                                  throw uploadError;
                                }

                                // Get public URL
                                const { data: { publicUrl } } = supabase.storage
                                  .from('images')
                                  .getPublicUrl(filePath);

                                // Update content with new image URL (no gallery upload)
                                setSiteContent(prev => ({
                                  ...prev,
                                  [CONTENT_SECTIONS.ABOUT_IMAGE]: {
                                    ...prev[CONTENT_SECTIONS.ABOUT_IMAGE],
                                    imageUrl: publicUrl
                                  }
                                }));

                                showNotification('success', 'Profile image uploaded successfully!');
                              } catch (error) {
                                showNotification('error', 'Failed to upload profile image');
                              }
                            }
                          }}
                          className="w-full px-3 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                        />
                      </div>
                      {siteContent[CONTENT_SECTIONS.ABOUT_IMAGE]?.imageUrl && (
                        <div className="mt-4">
                          <img
                            src={siteContent[CONTENT_SECTIONS.ABOUT_IMAGE].imageUrl}
                            alt="About profile image"
                            className="w-32 h-32 object-cover rounded-lg"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  </div>
              </div>
              
              {/* Fixed Save Button */}
              <div className="sticky bottom-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 p-4 mt-6">
                <div className="w-full flex justify-end gap-4">
                  <button
                    onClick={loadContent}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2 text-lg font-medium"
                    disabled={contentLoading}
                  >
                    {contentLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        Reload
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleSaveAllContent}
                    className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2 text-lg font-medium shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed border-2 border-black"
                    disabled={contentLoading}
                  >
                    <Save className="w-5 h-5" />
                    {saveSuccess ? 'Saved!' : contentLoading ? 'Saving...' : 'Save All Content'}
                    {contentLoading && !saveSuccess && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                    )}
                    {saveSuccess && (
                      <CheckCircle className="w-5 h-5 ml-2" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
