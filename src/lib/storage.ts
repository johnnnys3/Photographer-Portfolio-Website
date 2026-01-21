import { supabase } from './supabase';
import type { DatabaseImage } from './supabase';

// Function to detect image dimensions from file
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    // Try to use FileReader API first to avoid CSP issues with blob URLs
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for dimension detection'));
      };
      
      // Use the data URL instead of blob URL to avoid CSP issues
      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file for dimension detection'));
    };
    
    reader.readAsDataURL(file);
  });
}

// Utility function to provide intelligent fallback dimensions
function getFallbackDimensions(gallery?: string): { width: number; height: number } {
  // Return appropriate dimensions based on gallery type
  switch (gallery?.toLowerCase()) {
    case 'portraits':
    case 'weddings':
      // Portraits often work better in portrait orientation
      return { width: 900, height: 1200 };
    case 'landscapes':
    case 'nature':
      // Landscapes work best in landscape orientation
      return { width: 1600, height: 1200 };
    case 'urban':
    case 'interior':
      // Urban and interior shots often work well in landscape
      return { width: 1200, height: 900 };
    default:
      // Default fallback - 4:3 landscape ratio
      return { width: 1200, height: 900 };
  }
}

// Function to detect image dimensions from URL with enhanced CORS handling
function getImageDimensionsFromUrl(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let timeoutId: NodeJS.Timeout;
    
    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
    
    img.onload = () => {
      cleanup();
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    
    img.onerror = () => {
      cleanup();
      // Try without CORS attribute as fallback
      const fallbackImg = new Image();
      let fallbackTimeoutId: NodeJS.Timeout;
      
      const fallbackCleanup = () => {
        if (fallbackTimeoutId) {
          clearTimeout(fallbackTimeoutId);
        }
      };
      
      fallbackImg.onload = () => {
        fallbackCleanup();
        resolve({
          width: fallbackImg.naturalWidth,
          height: fallbackImg.naturalHeight
        });
      };
      
      fallbackImg.onerror = () => {
        fallbackCleanup();
        reject(new Error(`Failed to load image from URL for dimension detection (CORS blocked): ${url}`));
      };
      
      // Set timeout for fallback attempt
      fallbackTimeoutId = setTimeout(() => {
        fallbackCleanup();
        reject(new Error(`Timeout loading image for dimension detection: ${url}`));
      }, 5000);
      
      fallbackImg.src = url;
    };
    
    // Set timeout for initial attempt
    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error(`Timeout loading image for dimension detection: ${url}`));
    }, 8000);
    
    // First try with CORS
    img.crossOrigin = 'anonymous';
    img.src = url;
  });
}

// Function to ensure a gallery exists in the galleries table
async function ensureGalleryExists(galleryName: string): Promise<void> {
  try {
    
    // Check if gallery exists
    const { data: existingGallery, error: checkError } = await supabase
      .from('galleries')
      .select('name')
      .eq('name', galleryName)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
      throw checkError;
    }

    if (existingGallery) {
      return;
    }

    // Gallery doesn't exist, create it
    const { data: _newGallery, error: insertError } = await supabase
      .from('galleries')
      .insert({ name: galleryName })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

  } catch (error) {
    throw error;
  }
}

// Image management functions
export async function uploadImage(
  file: File,
  metadata: Omit<DatabaseImage, 'id' | 'uploaded_at' | 'photographer_id' | 'url'>
) {
  try {
    
    // Ensure the gallery exists in the galleries table
    await ensureGalleryExists(metadata.gallery);
    
    // Detect image dimensions first with fallback handling
    let dimensions: { width: number; height: number };
    try {
      dimensions = await getImageDimensions(file);
    } catch (dimError) {
      // Provide intelligent fallback dimensions based on gallery type
      dimensions = getFallbackDimensions(metadata.gallery);
    }
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    if (!user) {
      throw new Error('User not authenticated');
    }


    // Generate filename with naming pattern: YYYYMMDD_Category_Title_Sequence.ext
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const sequence = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    const fileExt = file.name.split('.').pop();
    const filename = `${dateStr}_${metadata.gallery}_${metadata.title.replace(/\s+/g, '_')}_${sequence}.${fileExt}`;


    // Upload to Supabase Storage
    const filePath = `images/${metadata.gallery}/${filename}`;
    
    const { data: _uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);


    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);


    // Insert metadata into database
    const dbData = {
      ...metadata,
      filename,
      url: publicUrl,
      photographer_id: user.id,
      width: dimensions.width,
      height: dimensions.height,
    };
    

    const { data: imageData, error: dbError } = await supabase
      .from('images')
      .insert(dbData)
      .select()
      .single();


    if (dbError) {
      throw dbError;
    }

    return imageData;
  } catch (error) {
    throw error;
  }
}

// Test function to check Supabase connection
export async function testSupabaseConnection() {
  try {
    
    // Test 1: Try to access auth service (doesn't need database permissions)
    try {
      const authTimeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Auth service timeout after 10 seconds')), 10000);
      });
      
      const authPromise = supabase.auth.getSession();
      const result = await Promise.race([authPromise, authTimeoutPromise]);
      const { data: { session: _session }, error: _authError } = result;
    } catch (authErr) {
      const errorMessage = authErr instanceof Error ? authErr.message : 'Unknown auth error';
      return { success: false, error: `Auth service failed: ${errorMessage}` };
    }
    
    // Test 2: Try a simple database query with timeout
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection test timeout after 60 seconds')), 60000);
    });
    
    const queryPromise = supabase.from('images').select('count', { count: 'exact' }).single();
    
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
    
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    // Test 3: Check RLS policies
    try {
      const { data: _rlsData, error: rlsError } = await supabase
        .from('images')
        .select('id')
        .limit(1);
      
      if (rlsError) {
      }
    } catch (rlsErr) {
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function fetchImages(gallery?: string) {
  try {
    
    // First, let's see ALL images and their gallery values
    const { data: _allImages, error: allError } = await supabase
      .from('images')
      .select('id, title, gallery')
      .order('uploaded_at', { ascending: false });
    
    if (allError) {
    } else {
    }
    
    // Now try the filtered query
    let query = supabase
      .from('images')
      .select('*')
      .order('uploaded_at', { ascending: false });

    // Always exclude 'about' gallery images from main gallery display
    query = query.neq('gallery', 'about');

    if (gallery && gallery !== 'all') {
      query = query.eq('gallery', gallery);
    } else {
    }

    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout after 10 seconds')), 10000);
    });
    
    const { data, error } = await Promise.race([query, timeoutPromise]) as any;
    
    
    if (data && data.length > 0) {
    }
    
    if (error) {
      throw error;
    }
    
    // Add strong deduplication by ID
    const uniqueImages = data ? data.filter((image: any, index: number, self: any[]) => 
      self.findIndex((img: any) => img.id === image.id) === index
    ) : [];
    
    
    return uniqueImages;
  } catch (error) {
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
    throw error;
  }
}

export async function getGalleries() {
  try {
    
    // Query galleries table directly, excluding 'about' gallery
    const query = supabase
      .from('galleries')
      .select('*')
      .neq('name', 'about')
      .order('name', { ascending: true });
    
    
    // Add 10-second timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Galleries query timeout after 10 seconds')), 10000);
    });
    
    const { data, error } = await Promise.race([query, timeoutPromise]) as any;
    

    if (error) {
      throw error;
    }

    // If no galleries, return empty array
    if (!data || data.length === 0) {
      return [];
    }

    // Get image counts for each gallery
    const galleriesWithCounts = await Promise.all(
      data.map(async (gallery: any) => {
        try {
          const { count, error: countError } = await supabase
            .from('images')
            .select('*', { count: 'exact', head: true })
            .eq('gallery', gallery.name);
          
          if (countError) {
            return {
              id: gallery.name,
              name: gallery.name,
              count: 0
            };
          }
          
          
          return {
            id: gallery.name,
            name: gallery.name,
            count: count || 0
          };
        } catch (error) {
          return {
            id: gallery.name,
            name: gallery.name,
            count: 0
          };
        }
      })
    );
    
    return galleriesWithCounts;
  } catch (error) {
    throw error;
  }
}

export async function updateImageDimensions() {
  try {
    
    // Fetch all images without dimensions
    const { data: images, error } = await supabase
      .from('images')
      .select('*')
      .or('width.is.null,height.is.null,width.eq.0,height.eq.0');

    if (error) throw error;
    
    if (!images || images.length === 0) {
      return { updated: 0, total: 0 };
    }

    
    let updatedCount = 0;
    
    for (const image of images) {
      try {
        
        // Detect dimensions from URL with fallback handling
        let dimensions: { width: number; height: number };
        try {
          dimensions = await getImageDimensionsFromUrl(image.url);
        } catch (dimError) {
          // Provide intelligent fallback dimensions based on gallery type
          dimensions = getFallbackDimensions(image.gallery);
        }
        
        // Update the image with dimensions
        const { error: updateError } = await supabase
          .from('images')
          .update({
            width: dimensions.width,
            height: dimensions.height
          })
          .eq('id', image.id);
        
        if (updateError) {
        } else {
          updatedCount++;
        }
        
        // Small delay to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
      }
    }
    
    return { updated: updatedCount, total: images.length };
    
  } catch (error) {
    throw error;
  }
}

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