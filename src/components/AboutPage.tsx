import React, { useState, useEffect } from 'react';
import { Camera, Award, Users, MapPin, LucideIcon } from 'lucide-react';
import { getSiteContent, CONTENT_SECTIONS } from '../services/contentService';

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

interface StatItem {
  icon: LucideIcon;
  label: string;
  value: string;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  const [siteContent, setSiteContent] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const [bioContent, statsContent, servicesContent, profileContent] = await Promise.all([
          getSiteContent(CONTENT_SECTIONS.ABOUT_BIO),
          getSiteContent(CONTENT_SECTIONS.ABOUT_STATS),
          getSiteContent(CONTENT_SECTIONS.ABOUT_SERVICES),
          getSiteContent(CONTENT_SECTIONS.ABOUT_PROFILE)
        ]);
        
        setSiteContent({
          bio: bioContent,
          stats: statsContent,
          services: servicesContent,
          profile: profileContent
        });
      } catch (error) {
        console.error('Failed to load content:', error);
      } finally {
        setLoading(false);
      }
    };

    // Listen for content updates from admin panel
    const handleContentUpdate = (event: Event) => {
      console.log('About page - Content updated event received:', (event as CustomEvent).detail);
      loadContent();
    };

    window.addEventListener('siteContentUpdated', handleContentUpdate);

    loadContent();

    return () => {
      console.log('About page - Cleaning up event listener');
      window.removeEventListener('siteContentUpdated', handleContentUpdate);
    };
  }, []);

  const stats: StatItem[] = siteContent.stats?.content || [
    { icon: Camera, label: 'Projects Completed', value: '500+' },
    { icon: Award, label: 'Awards Won', value: '25+' },
    { icon: Users, label: 'Happy Clients', value: '200+' },
    { icon: MapPin, label: 'Countries Visited', value: '30+' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl mb-4 text-gray-900">About Me</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Passionate photographer dedicated to capturing the beauty of our world
          </p>
        </div>

        {/* Main Content - Tailwind: flex flex-col md:flex-row gap-12 items-center */}
        <div className="flex flex-col md:flex-row gap-12 items-center mb-16">
          {/* Profile Image */}
          <div className="w-full md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1544124094-8aea0374da93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc2ODMyNzM4M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Photographer"
              className="rounded-lg shadow-xl w-full"
              loading="lazy"
            />
          </div>

          {/* Bio */}
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl mb-4 text-gray-900">My Journey</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Hello! I'm a professional photographer with over 10 years of experience
                capturing the world's most beautiful moments. My passion for photography
                began as a hobby during my travels and evolved into a full-time career.
              </p>
              <p>
                I specialize in landscape, urban, and portrait photography, with a focus
                on natural lighting and authentic moments. My work has been featured in
                National Geographic, Travel + Leisure, and numerous international exhibitions.
              </p>
              <p>
                Based in San Francisco, I travel extensively to capture diverse cultures,
                breathtaking landscapes, and compelling human stories. Each project is an
                opportunity to create timeless visual narratives.
              </p>
              <button
                onClick={() => onNavigate('contact')}
                className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-8 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg mt-6"
              >
                Get In Touch
              </button>
            </div>
          </div>
        </div>

        {/* Stats - Tailwind: grid grid-cols-2 lg:grid-cols-4 gap-8 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat: StatItem, index: number) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="text-center p-6 bg-gray-50 rounded-lg hover:shadow-lg transition duration-300"
              >
                <Icon className="w-10 h-10 text-orange-500 mx-auto mb-3" />
                <div className="text-3xl text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Services */}
        <div className="bg-gray-50 rounded-lg p-8 sm:p-12">
          <h2 className="text-3xl mb-8 text-gray-900 text-center">Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl mb-3 text-gray-900">Landscape Photography</h3>
              <p className="text-gray-600">
                Capturing the majesty of nature, from mountains to oceans, with dramatic
                lighting and composition.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl mb-3 text-gray-900">Urban & Architecture</h3>
              <p className="text-gray-600">
                Documenting the beauty of modern cities, architectural marvels, and
                street life around the world.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl mb-3 text-gray-900">Portrait & Editorial</h3>
              <p className="text-gray-600">
                Creating compelling portraits and editorial work that tells authentic
                human stories.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
