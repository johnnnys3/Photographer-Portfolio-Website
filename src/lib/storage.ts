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
        console.warn(`Image dimensions detected without CORS for: ${url}`);
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
    console.log(`Checking if gallery '${galleryName}' exists...`);
    
    // Check if gallery exists
    const { data: existingGallery, error: checkError } = await supabase
      .from('galleries')
      .select('name')
      .eq('name', galleryName)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking gallery existence:', checkError);
      throw checkError;
    }

    if (existingGallery) {
      console.log(`Gallery '${galleryName}' already exists`);
      return;
    }

    // Gallery doesn't exist, create it
    console.log(`Creating gallery '${galleryName}'...`);
    const { data: newGallery, error: insertError } = await supabase
      .from('galleries')
      .insert({ name: galleryName })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating gallery:', insertError);
      throw insertError;
    }

    console.log(`Gallery '${galleryName}' created successfully:`, newGallery);
  } catch (error) {
    console.error(`Failed to ensure gallery '${galleryName}' exists:`, error);
    throw error;
  }
}

// Image management functions
export async function uploadImage(
  file: File,
  metadata: Omit<DatabaseImage, 'id' | 'uploaded_at' | 'photographer_id' | 'url'>
) {
  try {
    console.log('Starting upload process...');
    
    // Ensure the gallery exists in the galleries table
    await ensureGalleryExists(metadata.gallery);
    
    // Detect image dimensions first with fallback handling
    let dimensions: { width: number; height: number };
    try {
      dimensions = await getImageDimensions(file);
      console.log('Detected dimensions:', dimensions);
    } catch (dimError) {
      console.warn('Failed to detect dimensions from file, using fallback:', dimError);
      // Provide intelligent fallback dimensions based on gallery type
      dimensions = getFallbackDimensions(metadata.gallery);
    }
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('User check:', { user, userError });
    
    if (userError) {
      console.error('User auth error:', userError);
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    if (!user) {
      console.error('No user found');
      throw new Error('User not authenticated');
    }

    console.log('User authenticated:', user.id, user.email);

    // Generate filename with naming pattern: YYYYMMDD_Category_Title_Sequence.ext
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const sequence = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    const fileExt = file.name.split('.').pop();
    const filename = `${dateStr}_${metadata.gallery}_${metadata.title.replace(/\s+/g, '_')}_${sequence}.${fileExt}`;

    console.log('Generated filename:', filename);

    // Upload to Supabase Storage
    const filePath = `images/${metadata.gallery}/${filename}`;
    console.log('Uploading to storage path:', filePath);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    console.log('Storage upload result:', { uploadData, uploadError });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    console.log('Public URL:', publicUrl);

    // Insert metadata into database
    const dbData = {
      ...metadata,
      filename,
      url: publicUrl,
      photographer_id: user.id,
      width: dimensions.width,
      height: dimensions.height,
    };
    
    console.log('Inserting into database:', dbData);

    const { data: imageData, error: dbError } = await supabase
      .from('images')
      .insert(dbData)
      .select()
      .single();

    console.log('Database insert result:', { imageData, dbError });

    if (dbError) {
      console.error('Database insert error:', dbError);
      throw dbError;
    }

    console.log('Upload successful:', imageData);
    return imageData;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// Test function to check Supabase connection
export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    console.log('Supabase client:', supabase);
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('API Key format:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
    
    // Test 1: Try to access auth service (doesn't need database permissions)
    console.log('Testing auth service...');
    try {
      const authTimeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Auth service timeout after 10 seconds')), 10000);
      });
      
      const authPromise = supabase.auth.getSession();
      const result = await Promise.race([authPromise, authTimeoutPromise]);
      const { data: { session }, error: authError } = result;
      console.log('Auth test result:', { session, authError });
    } catch (authErr) {
      const errorMessage = authErr instanceof Error ? authErr.message : 'Unknown auth error';
      console.error('Auth service error:', authErr);
      return { success: false, error: `Auth service failed: ${errorMessage}` };
    }
    
    // Test 2: Try a simple database query with timeout
    console.log('Testing database access...');
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection test timeout after 60 seconds')), 60000);
    });
    
    const queryPromise = supabase.from('images').select('count', { count: 'exact' }).single();
    
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
    
    console.log('Database test result:', { data, error });
    
    if (error) {
      console.error('Database connection failed:', error);
      return { success: false, error: error.message };
    }
    
    // Test 3: Check RLS policies
    console.log('Testing RLS policies...');
    try {
      const { data: rlsData, error: rlsError } = await supabase
        .from('images')
        .select('id')
        .limit(1);
      
      console.log('RLS test result:', { 
        hasData: rlsData && rlsData.length > 0, 
        dataLength: rlsData ? rlsData.length : 0,
        error: rlsError 
      });
      
      if (rlsError) {
        console.warn('RLS policy issue detected:', rlsError);
      }
    } catch (rlsErr) {
      console.error('RLS test failed:', rlsErr);
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Connection test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function fetchImages(gallery?: string) {
  try {
    console.log('\n=== FETCH IMAGES DEBUG ===');
    console.log('Gallery parameter received:', JSON.stringify(gallery));
    console.log('Gallery type:', typeof gallery);
    console.log('Gallery length:', gallery?.length);
    console.log('Gallery charCodes:', gallery?.split('').map(c => c.charCodeAt(0)));
    
    // First, let's see ALL images and their gallery values
    const { data: allImages, error: allError } = await supabase
      .from('images')
      .select('id, title, gallery')
      .order('uploaded_at', { ascending: false });
    
    if (allError) {
      console.error('Error fetching all images:', allError);
    } else {
      console.log('ALL IMAGES IN DATABASE:');
      console.log('Total images:', allImages?.length);
      console.log('Unique galleries:', [...new Set(allImages?.map(img => img.gallery))]);
      console.log('Sample images:', allImages?.slice(0, 5).map(img => ({
        title: img.title,
        gallery: img.gallery,
        galleryCharCodes: img.gallery.split('').map((c: string) => c.charCodeAt(0))
      })));
    }
    
    // Now try the filtered query
    let query = supabase
      .from('images')
      .select('*')
      .order('uploaded_at', { ascending: false });

    // Always exclude 'about' gallery images from main gallery display
    query = query.neq('gallery', 'about');

    if (gallery && gallery !== 'all') {
      console.log('APPLYING GALLERY FILTER:', JSON.stringify(gallery));
      query = query.eq('gallery', gallery);
    } else {
      console.log('NO GALLERY FILTER - fetching all images (excluding about gallery)');
    }

    console.log('Executing filtered query...');
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout after 10 seconds')), 10000);
    });
    
    const { data, error } = await Promise.race([query, timeoutPromise]) as any;
    
    console.log('=== FILTERED QUERY RESULTS ===');
    console.log('Number of images returned:', data ? data.length : 0);
    console.log('Error:', error);
    
    if (data && data.length > 0) {
      console.log('Galleries in filtered results:', 
        [...new Set(data.map((img: any) => img.gallery))].join(', ')
      );
    }
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    // Add strong deduplication by ID
    const uniqueImages = data ? data.filter((image: any, index: number, self: any[]) => 
      self.findIndex((img: any) => img.id === image.id) === index
    ) : [];
    
    console.log(`Final result: ${uniqueImages.length} unique images for gallery: ${gallery || 'all'} (excluding about gallery)`);
    console.log('=== END FETCH IMAGES DEBUG ===\n');
    
    return uniqueImages;
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
    console.log('\n=== GET GALLERIES DEBUG ===');
    console.log('Fetching galleries from Supabase...');
    
    // Query galleries table directly, excluding 'about' gallery
    const query = supabase
      .from('galleries')
      .select('*')
      .neq('name', 'about')
      .order('name', { ascending: true });
    
    console.log('Executing galleries query...');
    
    // Add 10-second timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Galleries query timeout after 10 seconds')), 10000);
    });
    
    const { data, error } = await Promise.race([query, timeoutPromise]) as any;
    
    console.log('Supabase galleries response:', { 
      dataLength: data ? data.length : 0,
      data: data, 
      error 
    });

    if (error) {
      console.error('Supabase galleries error:', error);
      throw error;
    }

    // If no galleries, return empty array
    if (!data || data.length === 0) {
      console.log('No galleries found, returning empty array');
      return [];
    }

    console.log('Raw galleries from database:');
    data.forEach((gallery: any) => {
      console.log(`  - "${gallery.name}" | charCodes:`, gallery.name.split('').map((c: string) => c.charCodeAt(0)));
    });

    // Get image counts for each gallery
    const galleriesWithCounts = await Promise.all(
      data.map(async (gallery: any) => {
        try {
          const { count, error: countError } = await supabase
            .from('images')
            .select('*', { count: 'exact', head: true })
            .eq('gallery', gallery.name);
          
          if (countError) {
            console.warn(`Failed to count images for gallery ${gallery.name}:`, countError);
            return {
              id: gallery.name,
              name: gallery.name,
              count: 0
            };
          }
          
          console.log(`Gallery "${gallery.name}" has ${count} images`);
          
          return {
            id: gallery.name,
            name: gallery.name,
            count: count || 0
          };
        } catch (error) {
          console.warn(`Error counting images for gallery ${gallery.name}:`, error);
          return {
            id: gallery.name,
            name: gallery.name,
            count: 0
          };
        }
      })
    );
    
    console.log('Processed galleries with counts:');
    galleriesWithCounts.forEach(g => {
      console.log(`  - ID: "${g.id}" | Name: "${g.name}" | Count: ${g.count}`);
    });
    console.log('=== END GET GALLERIES DEBUG ===\n');
    
    return galleriesWithCounts;
  } catch (error) {
    console.error('Error fetching galleries:', error);
    throw error;
  }
}

export async function updateImageDimensions() {
  try {
    console.log('Starting dimension update for existing images...');
    
    // Fetch all images without dimensions
    const { data: images, error } = await supabase
      .from('images')
      .select('*')
      .or('width.is.null,height.is.null,width.eq.0,height.eq.0');

    if (error) throw error;
    
    if (!images || images.length === 0) {
      console.log('No images need dimension updates');
      return { updated: 0, total: 0 };
    }

    console.log(`Found ${images.length} images needing dimension updates`);
    
    let updatedCount = 0;
    
    for (const image of images) {
      try {
        console.log(`Processing image: ${image.title}`);
        
        // Detect dimensions from URL with fallback handling
        let dimensions: { width: number; height: number };
        try {
          dimensions = await getImageDimensionsFromUrl(image.url);
          console.log(`Detected dimensions for ${image.title}:`, dimensions);
        } catch (dimError) {
          console.warn(`Failed to detect dimensions for ${image.title}, using fallback:`, dimError);
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
          console.error(`Failed to update ${image.title}:`, updateError);
        } else {
          console.log(`Successfully updated ${image.title}`);
          updatedCount++;
        }
        
        // Small delay to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Failed to process ${image.title}:`, error);
      }
    }
    
    console.log(`Dimension update complete: ${updatedCount}/${images.length} images updated`);
    return { updated: updatedCount, total: images.length };
    
  } catch (error) {
    console.error('Error updating image dimensions:', error);
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