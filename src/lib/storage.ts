import { supabase } from './supabase';
import type { DatabaseImage } from './supabase';

// Image management functions
export async function uploadImage(
  file: File,
  metadata: Omit<DatabaseImage, 'id' | 'uploaded_at' | 'photographer_id' | 'url'>
) {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Generate filename with naming pattern: YYYYMMDD_Category_Title_Sequence.ext
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const sequence = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    const fileExt = file.name.split('.').pop();
    const filename = `${dateStr}_${metadata.gallery}_${metadata.title.replace(/\s+/g, '_')}_${sequence}.${fileExt}`;

    // Upload to Supabase Storage
    const filePath = `images/${metadata.gallery}/${filename}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    // Insert metadata into database
    const { data: imageData, error: dbError } = await supabase
      .from('images')
      .insert({
        ...metadata,
        filename,
        url: publicUrl,
        photographer_id: user.id,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return imageData;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function fetchImages(gallery?: string) {
  try {
    let query = supabase
      .from('images')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (gallery && gallery !== 'all') {
      query = query.eq('gallery', gallery);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error;
  }
}

export async function updateImage(id: string, metadata: Partial<DatabaseImage>) {
  try {
    const { data, error } = await supabase
      .from('images')
      .update(metadata)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating image:', error);
    throw error;
  }
}

export async function deleteImage(id: string) {
  try {
    // Get image info first
    const { data: image } = await supabase
      .from('images')
      .select('filename, gallery')
      .eq('id', id)
      .single();

    if (!image) throw new Error('Image not found');

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('images')
      .remove([`images/${image.gallery}/${image.filename}`]);

    if (storageError) throw storageError;

    // Delete from database
    const { error: dbError } = await supabase
      .from('images')
      .delete()
      .eq('id', id);

    if (dbError) throw dbError;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

export async function getGalleries() {
  try {
    const { data, error } = await supabase
      .from('images')
      .select('gallery');

    if (error) throw error;

    if (!data || data.length === 0) {
      // Return default galleries when no images exist
      return [
        { id: 'weddings', name: 'Weddings', count: 0 },
        { id: 'portraits', name: 'Portraits', count: 0 },
        { id: 'landscapes', name: 'Landscapes', count: 0 },
        { id: 'nature', name: 'Nature', count: 0 },
        { id: 'urban', name: 'Urban', count: 0 },
        { id: 'interior', name: 'Interior', count: 0 },
      ];
    }

    const galleries = [...new Set(data.map(img => img.gallery))];
    return galleries.map(gallery => ({
      id: gallery,
      name: gallery.charAt(0).toUpperCase() + gallery.slice(1),
      count: data.filter(img => img.gallery === gallery).length
    }));
  } catch (error) {
    console.error('Error fetching galleries:', error);
    // Return default galleries on error
    return [
      { id: 'weddings', name: 'Weddings', count: 0 },
      { id: 'portraits', name: 'Portraits', count: 0 },
      { id: 'landscapes', name: 'Landscapes', count: 0 },
      { id: 'nature', name: 'Nature', count: 0 },
      { id: 'urban', name: 'Urban', count: 0 },
      { id: 'interior', name: 'Interior', count: 0 },
    ];
  }
}

// File validation
export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 20 * 1024 * 1024; // 20MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 20MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPG, PNG, and WEBP files are allowed' };
  }

  return { valid: true };
}
