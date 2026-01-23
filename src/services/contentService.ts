import { supabase } from '../lib/supabase';

export interface SiteContent {
  id: string;
  section: string;
  content_type: 'text' | 'image' | 'stats' | 'services';
  title?: string;
  content: any; // Can be string, object, or array depending on content_type
  updated_at: string;
}

// Site content sections
export const CONTENT_SECTIONS = {
  HOME_HERO: 'home_hero',
  HOME_TOP_TEXT: 'home_top_text',
  HOME_MAIN_TITLE: 'home_main_title',
  HOME_BUTTON_TEXT: 'home_button_text',
  HOME_ABOUT: 'home_about',
  ABOUT_BIO: 'about_bio',
  ABOUT_STATS: 'about_stats',
  ABOUT_SERVICES: 'about_services',
  ABOUT_PROFILE: 'about_profile',
  CONTACT_INFO: 'contact_info',
  SOCIAL_MEDIA: 'social_media',
  ABOUT_IMAGE: 'about_image',
} as const;

// Get content for a specific section
export async function getSiteContent(section: string): Promise<SiteContent | null> {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('section', section)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    return null;
  }
}

// Get all site content
export async function getAllSiteContent(): Promise<SiteContent[]> {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .order('section', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    return [];
  }
}

// Update site content
export async function updateSiteContent(section: string, content: any, contentType: string = 'text'): Promise<SiteContent> {
  try {
    
    // Get current user to check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      throw new Error(`Authentication failed: ${authError.message}`);
    }
    
    if (!user) {
      throw new Error('User must be authenticated to update site content');
    }
    
    
    const { data, error } = await supabase
      .from('site_content')
      .upsert({
        section,
        content_type: contentType,
        content,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'section' // Specify the unique constraint column
      })
      .select()
      .single();

    if (error) {
      
      // Handle specific RLS policy errors
      if (error.code === '42501') {
        throw new Error('Permission denied: You do not have permission to update site content. Please contact your administrator to update Row Level Security policies.');
      }
      
      throw error;
    }
    
    
    // Trigger a custom event to notify other components to refresh
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('siteContentUpdated', { 
        detail: { section, content, contentType } 
      }));
    } else {
    }
    
    return data;
  } catch (error) {
    throw error;
  }
}

// Default content for initialization
export const DEFAULT_CONTENT = {
  [CONTENT_SECTIONS.HOME_HERO]: {
    title: "Capturing Moments, Creating Memories",
    subtitle: "Professional photography that tells your story through stunning visuals and creative composition."
  },
  [CONTENT_SECTIONS.HOME_TOP_TEXT]: {
    text: "OUR PASSIONATE PHOTOGRAPHERS DELIVER STUNNING VISUALS"
  },
  [CONTENT_SECTIONS.HOME_MAIN_TITLE]: {
    leftText: "VINTAGE",
    middleText: "THROUGH",
    rightText: "LENS",
    italicText: "experiences"
  },
  [CONTENT_SECTIONS.HOME_BUTTON_TEXT]: {
    text: "BOOK NOW"
  },
  [CONTENT_SECTIONS.HOME_ABOUT]: {
    title: "About the Photographer",
    description: "With over 10 years of experience in professional photography, I specialize in landscape, urban, and portrait photography. My work has been featured in numerous publications and exhibitions worldwide."
  },
  [CONTENT_SECTIONS.ABOUT_BIO]: {
    title: "My Journey",
    paragraphs: [
      "Hello! I'm a professional photographer with over 10 years of experience capturing world's most beautiful moments. My passion for photography began as a hobby during my travels and evolved into a full-time career.",
      "I specialize in landscape, urban, and portrait photography, with a focus on natural lighting and authentic moments. My work has been featured in National Geographic, Travel + Leisure, and numerous international exhibitions.",
      "Based in San Francisco, I travel extensively to capture diverse cultures, breathtaking landscapes, and compelling human stories. Each project is an opportunity to create timeless visual narratives."
    ]
  },
  [CONTENT_SECTIONS.ABOUT_STATS]: [
    { icon: 'Camera', label: 'Projects Completed', value: '500+' },
    { icon: 'Award', label: 'Awards Won', value: '25+' },
    { icon: 'Users', label: 'Happy Clients', value: '200+' },
    { icon: 'MapPin', label: 'Countries Visited', value: '30+' }
  ],
  [CONTENT_SECTIONS.ABOUT_SERVICES]: [
    {
      title: "Landscape Photography",
      description: "Capturing the majesty of nature, from mountains to oceans, with dramatic lighting and composition."
    },
    {
      title: "Urban & Architecture",
      description: "Documenting the beauty of modern cities, architectural marvels, and street life around the world."
    },
    {
      title: "Portrait & Editorial",
      description: "Creating compelling portraits and editorial work that tells authentic human stories."
    }
  ],
  [CONTENT_SECTIONS.ABOUT_PROFILE]: {
    imageUrl: "https://images.unsplash.com/photo-1544124094-8aea0374da93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc2ODMyNzM4M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  [CONTENT_SECTIONS.CONTACT_INFO]: {
    email: "contact@photographer.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    address: "123 Market Street, Suite 456\nSan Francisco, CA 94102"
  },
  [CONTENT_SECTIONS.SOCIAL_MEDIA]: [
    { platform: 'instagram', url: 'https://instagram.com/photographer', handle: '@photographer' },
    { platform: 'facebook', url: 'https://facebook.com/photographer', handle: 'Photographer Page' },
    { platform: 'twitter', url: 'https://twitter.com/photographer', handle: '@photographer' },
    { platform: 'linkedin', url: 'https://linkedin.com/in/photographer', handle: 'Photographer Profile' }
  ],
  [CONTENT_SECTIONS.ABOUT_IMAGE]: {
    imageUrl: "https://images.unsplash.com/photo-1544124094-8aea0374da93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc2ODMyNzM4M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  }
};
