import { useState, useEffect, useRef } from 'react';
import { Camera, Award, Users, MapPin, LucideIcon } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getSiteContent, CONTENT_SECTIONS, DEFAULT_CONTENT } from '../services/contentService';
import Link from 'next/link';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface StatItem {
  icon: LucideIcon | string;
  label: string;
  value: string;
}

// Icon mapping to convert string names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  Camera,
  Award,
  Users,
  MapPin,
};

export function AboutPage() {
  const [siteContent, setSiteContent] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const [bioContent, statsContent, servicesContent, imageContent] = await Promise.all([
          getSiteContent(CONTENT_SECTIONS.ABOUT_BIO),
          getSiteContent(CONTENT_SECTIONS.ABOUT_STATS),
          getSiteContent(CONTENT_SECTIONS.ABOUT_SERVICES),
          getSiteContent(CONTENT_SECTIONS.ABOUT_IMAGE)
        ]);
        
        setSiteContent({
          bio: bioContent,
          stats: statsContent,
          services: servicesContent,
          image: imageContent
        });
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    // Listen for content updates from admin panel
    const handleContentUpdate = () => {
      loadContent();
    };

    window.addEventListener('siteContentUpdated', handleContentUpdate);

    loadContent();

    return () => {
      window.removeEventListener('siteContentUpdated', handleContentUpdate);
    };
  }, []);

  const stats: StatItem[] = siteContent.stats?.content || [];

  // Header settle-in once content has loaded
  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }
      );
    });
    return () => ctx.revert();
  }, [loading]);

  // Stats and services stagger in as they scroll into view
  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      if (statsRef.current) {
        gsap.fromTo(
          gsap.utils.toArray<HTMLElement>('.about-stat', statsRef.current),
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out',
            stagger: 0.08,
            scrollTrigger: { trigger: statsRef.current, start: 'top 80%' },
          }
        );
      }
      if (servicesRef.current) {
        gsap.fromTo(
          gsap.utils.toArray<HTMLElement>('.about-service', servicesRef.current),
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: 'power2.inOut',
            stagger: -0.08,
            scrollTrigger: { trigger: servicesRef.current, start: 'top 80%' },
          }
        );
      }
    });
    return () => ctx.revert();
  }, [loading, stats.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black pt-24 pb-16 px-4 sm:px-6 lg:px-8 w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-24 pb-16 px-4 sm:px-6 lg:px-8 w-full">
      <div className="w-full">
        {/* Header */}
        <div ref={headerRef} className="mb-16 border-b border-gray-200 dark:border-gray-800 pb-8">
          <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.9] text-gray-900 dark:text-white mb-4">About</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
            Passionate photographer dedicated to capturing the beauty of our world
          </p>
        </div>

        {/* Main Content - Tailwind: flex flex-col md:flex-row gap-12 items-center */}
        <div className="flex flex-col md:flex-row gap-12 items-start mb-16">
          {/* Profile Image */}
          <div className="w-full md:w-1/2">
            <img
              src={siteContent.image?.content?.imageUrl || DEFAULT_CONTENT[CONTENT_SECTIONS.ABOUT_IMAGE]?.imageUrl || "https://images.unsplash.com/photo-1544124094-8aea0374da93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc2ODMyNzM4M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"}
              alt="Photographer"
              className="w-full"
              loading="lazy"
            />
          </div>

          {/* Bio */}
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl font-black uppercase tracking-tight mb-4 text-gray-900 dark:text-white">
              {siteContent.bio?.content?.title || 'My Journey'}
            </h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-300 mb-6">
              {(siteContent.bio?.content?.paragraphs || []).map((paragraph: string, index: number) => (
                <p key={index}>{paragraph}</p>
              ))}
              {(!siteContent.bio?.content?.paragraphs || siteContent.bio?.content?.paragraphs?.length === 0) && (
                <p>Bio content will be available soon.</p>
              )}
            </div>
            <Link
              href="/contact"
              className="inline-block bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black py-3 px-8 text-sm font-bold uppercase tracking-wider transition duration-300"
            >
              Get In Touch
            </Link>
          </div>
        </div>

        {/* Stats - Only show if stats exist */}
        {stats.length > 0 && (
          <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {stats.map((stat: StatItem, index: number) => {
              // Handle both string names and actual components
              const Icon = typeof stat.icon === 'string'
                ? iconMap[stat.icon] || Camera
                : stat.icon as LucideIcon;

              return (
                <div
                  key={index}
                  className="about-stat pt-6 border-t-2 border-black dark:border-white"
                >
                  <Icon className="w-8 h-8 text-black dark:text-white mb-3" />
                  <div className="text-4xl font-black text-gray-900 dark:text-white mb-2">{stat.value}</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">{stat.label}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Services - Only show if services exist */}
        {siteContent.services?.content && siteContent.services.content.length > 0 && (
          <div ref={servicesRef} className="border-t border-gray-200 dark:border-gray-800 pt-12">
            <h2 className="text-3xl font-black uppercase tracking-tight mb-8 text-gray-900 dark:text-white">What We Do</h2>
            <div className="flex flex-col">
              {siteContent.services.content.map((service: any, index: number) => (
                <div key={index} className="about-service group flex items-start gap-6 py-6 border-b border-gray-200 dark:border-gray-800 transition-colors hover:bg-gray-50 dark:hover:bg-white/5">
                  <span className="text-gray-400 dark:text-gray-600 text-sm font-mono pt-1">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="transition-transform duration-300 group-hover:translate-x-2">
                    <h3 className="text-xl font-bold uppercase tracking-tight mb-2 text-gray-900 dark:text-white">{service.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
