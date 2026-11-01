import { useState, useEffect, useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useData } from '../contexts/DataContext';
import { getSiteContent } from '../services/contentService';
import { CONTENT_SECTIONS } from '../services/contentService';
import type { DatabaseImage } from '../lib/supabase';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface HomePageProps {
  onImageClick: (imageId: string) => void;
  onNavigate?: (page: string) => void;
}

export function HomePage({ onImageClick }: HomePageProps) {
  const { images, galleries } = useData();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [content, setContent] = useState({
    heroTitle: "STUNNING MODEL<br />PHOTOGRAPHY",
    heroDescription: "From concept to creation, we craft breathtaking images that highlight your models and elevate your brand.",
    buttonText: "Book Now",
    specializeTitle: "WE SPECIALIZE IN BRINGING YOUR CREATIVE CONCEPTS TO LIFE",
    projectsCompleted: "500+",
    projectsCompletedLabel: "Projects Completed",
    clientSatisfaction: "95%",
    clientSatisfactionLabel: "Client Satisfaction"
  });

  // Filter portrait images from database
  const portraitImages = images.filter((img: DatabaseImage) => {
    // Consider portrait if height > width or if it's in portrait gallery
    return (img.height && img.width && img.height > img.width) || img.gallery === 'portraits';
  });

  // Use all images if not enough portrait images
  const displayImages = portraitImages.length >= 2 ? portraitImages : images;

  // Shuffle images on component mount for random display
  useEffect(() => {
    if (displayImages.length > 0) {
      const randomIndex = Math.floor(Math.random() * displayImages.length);
      setCurrentImageIndex(randomIndex);
    }
  }, [displayImages.length]);

  // Load dynamic content from content service
  useEffect(() => {
    const loadContent = async () => {
      try {
        const [heroTitleContent, heroDescriptionContent, buttonTextContent, specializeTitleContent, projectsCompletedContent, clientSatisfactionContent] = await Promise.all([
          getSiteContent(CONTENT_SECTIONS.HOME_MAIN_TITLE),
          getSiteContent(CONTENT_SECTIONS.HOME_TOP_TEXT), // Using for hero description
          getSiteContent(CONTENT_SECTIONS.HOME_BUTTON_TEXT),
          getSiteContent('HOME_SPECIALIZE_TITLE'), // New section
          getSiteContent('HOME_PROJECTS_COMPLETED'), // New section
          getSiteContent('HOME_CLIENT_SATISFACTION') // New section
        ]);

        setContent({
          heroTitle: heroTitleContent?.content?.text || "STUNNING MODEL<br />PHOTOGRAPHY",
          heroDescription: heroDescriptionContent?.content?.text || "From concept to creation, we craft breathtaking images that highlight your models and elevate your brand.",
          buttonText: buttonTextContent?.content?.text || "Book Now",
          specializeTitle: specializeTitleContent?.content?.text || "WE SPECIALIZE IN BRINGING YOUR CREATIVE CONCEPTS TO LIFE",
          projectsCompleted: projectsCompletedContent?.content?.number || "500+",
          projectsCompletedLabel: projectsCompletedContent?.content?.label || "Projects Completed",
          clientSatisfaction: clientSatisfactionContent?.content?.number || "95%",
          clientSatisfactionLabel: clientSatisfactionContent?.content?.label || "Client Satisfaction"
        });
      } catch (error) {
        console.error('Failed to load homepage content:', error);
        // Keep default values on error
      }
    };

    loadContent();
  }, []);

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const leftImage = displayImages[currentImageIndex];
  const rightImage = displayImages[(currentImageIndex + 1) % displayImages.length];

  // Work strip cards: one representative thumbnail per real gallery
  const workItems = galleries.map((gallery) => ({
    ...gallery,
    thumbnail: images.find((img: DatabaseImage) => img.gallery === gallery.id)?.url,
  }));
  const marqueeItems = workItems.length > 0 ? [...workItems, ...workItems] : [];

  const serviceItems = [
    { title: 'Portraits', description: 'One person, full attention.', image: images[0]?.url },
    { title: 'Editorial', description: 'Story-driven sets for print and online.', image: images[1]?.url },
    { title: 'Commercial', description: 'Product and brand photography.', image: images[2]?.url },
    { title: 'Events', description: 'Documentary coverage as it happens.', image: images[3]?.url },
  ];
  const [hoveredService, setHoveredService] = useState(0);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroMetaRef = useRef<HTMLDivElement>(null);
  const workSectionRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLHeadingElement>(null);
  const statementWords = content.specializeTitle.split(' ');

  // Statement: words light up one by one as it scrolls through the viewport
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.statement-word',
        { opacity: 0.15 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.1,
          scrollTrigger: {
            trigger: statementRef.current,
            start: 'top 80%',
            end: 'bottom 45%',
            scrub: true,
          },
        }
      );
    }, statementRef);
    return () => ctx.revert();
  }, [statementWords.length]);

  // Hero entrance: headline settles in from below, meta row follows through
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroTitleRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );
      gsap.fromTo(
        heroMetaRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.25 }
      );
    });
    return () => ctx.revert();
  }, []);

  // Selected Work strip: fades in as it scrolls into view, marquee keeps scrolling underneath
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        workSectionRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: workSectionRef.current,
            start: 'top 85%',
          },
        }
      );
    }, workSectionRef);
    return () => ctx.revert();
  }, [marqueeItems.length]);

  return (
    <div className="min-h-screen bg-white dark:bg-black relative">
      {/* Hero Section - headline paired with a lead image */}
      <div
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setCoords({ x: Math.round(e.clientX - rect.left), y: Math.round(e.clientY - rect.top) });
        }}
        className="relative w-full min-h-screen flex items-center overflow-hidden pt-28 pb-16"
      >
        {/* Live coordinate readout - top left, hidden on touch */}
        <span className="hidden sm:block absolute top-24 left-8 z-30 font-mono text-[11px] tracking-wider text-gray-400 dark:text-gray-600">
          X:{String(coords.x).padStart(4, '0')} Y:{String(coords.y).padStart(4, '0')}
        </span>

        {/* Index counter - bottom left, playful frame-counter detail */}
        <span className="hidden sm:block absolute bottom-8 left-8 z-30 font-mono text-6xl lg:text-7xl font-black text-gray-100 dark:text-gray-900 select-none">
          {String(workItems.length).padStart(3, '0')}
        </span>

        <div className="relative z-20 max-w-7xl mx-auto px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1
              ref={heroTitleRef}
              className="text-5xl sm:text-6xl lg:text-6xl xl:text-7xl text-black dark:text-white font-black leading-[0.95] tracking-tight uppercase mb-8 break-words"
              dangerouslySetInnerHTML={{ __html: content.heroTitle }}
            />

            <div ref={heroMetaRef} className="flex flex-col gap-8">
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-light leading-relaxed max-w-md">
                {content.heroDescription}
              </p>

              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-black dark:text-white border-b-2 border-black dark:border-white pb-1 w-fit"
              >
                {content.buttonText}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {leftImage && (
            <div className="relative">
              <div
                data-cursor="View"
                className="relative aspect-[4/5] w-full overflow-hidden cursor-pointer"
                onClick={() => onImageClick(leftImage.id)}
              >
                <img
                  src={leftImage.url}
                  alt={leftImage.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Rotated accent tag - one bold color, used sparingly */}
              <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 -rotate-6 bg-[#FE2F00] text-white px-4 py-2 shadow-lg">
                <span className="block text-xs font-black uppercase tracking-wider">
                  {leftImage.gallery}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Work - auto-scrolling strip, pauses and reveals detail on hover */}
      <div ref={workSectionRef} className="relative w-full py-24 border-t border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-12">
          <span className="block mb-3 font-mono text-xs uppercase tracking-wider text-gray-500">(Portfolio)</span>
          <h2 className="text-4xl lg:text-6xl text-black dark:text-white font-black uppercase tracking-tight">
            Selected Work
          </h2>
        </div>

        {marqueeItems.length > 0 && (
          <div className="marquee-track flex gap-6 w-max px-6 lg:px-12">
            {marqueeItems.map((item, index) => (
              <Link
                key={`${item.id}-${index}`}
                href={`/galleries/${item.id}`}
                data-cursor="Open"
                className="group relative flex-shrink-0 w-[280px] sm:w-[340px] aspect-[3/4] overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900"
              >
                {item.thumbnail && (
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    className="w-full h-full object-cover transition duration-500 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span className="text-xs font-mono text-white/70">
                    {String((index % workItems.length) + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-xl lg:text-2xl font-black uppercase tracking-tight text-white">
                    {item.name}
                  </h3>
                  <p className="max-h-0 group-hover:max-h-12 opacity-0 group-hover:opacity-100 overflow-hidden transition-all duration-300 text-sm text-white/80 mt-1">
                    {item.count} {item.count === 1 ? 'photo' : 'photos'} in this collection
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Introduction Section with Images */}
      <div className="relative w-full py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 border-2 border-gray-400 dark:border-gray-600 rounded-full flex items-center justify-center">
              <span className="text-gray-600 dark:text-gray-300 text-xl font-bold">+</span>
            </div>
            <div>
              <span className="block mb-3 font-mono text-xs uppercase tracking-wider text-gray-500">(What we do)</span>
              <h2 ref={statementRef} className="text-4xl lg:text-6xl text-black dark:text-white font-black uppercase tracking-tight">
                {statementWords.map((word, i) => (
                  <span key={i} className="statement-word inline-block mr-[0.25em]">{word}</span>
                ))}
              </h2>
            </div>
          </div>
          
          {/* Images Section - Original Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-16">
            {/* Left Side - Images */}
            <div className="relative">
              <div className="relative h-[600px]">
                {/* Left Image */}
                {leftImage && (
                  <div 
                    className="absolute left-0 top-0 w-[380px] lg:w-[450px] h-[480px] lg:h-[550px] overflow-hidden rounded-lg shadow-2xl cursor-pointer transition duration-300 ease-in-out hover:scale-105 z-10"
                    onClick={() => onImageClick(leftImage.id)}
                  >
                    <img
                      src={leftImage.url}
                      alt={leftImage.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Right Image */}
                {rightImage && (
                  <div 
                    className="absolute right-0 top-0 w-[380px] lg:w-[450px] h-[480px] lg:h-[550px] overflow-hidden rounded-lg shadow-2xl cursor-pointer transition duration-300 ease-in-out hover:scale-105 z-10"
                    onClick={() => onImageClick(rightImage.id)}
                  >
                    <img
                      src={rightImage.url}
                      alt={rightImage.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                  />
                  </div>
                )}

                {/* Diamond Shape */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gray-400 transform rotate-45 z-5"></div>

                {/* Navigation Arrows */}
                {displayImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePreviousImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 dark:bg-black/10 text-black dark:text-white hover:bg-white/20 dark:hover:bg-black/20 transition duration-300 z-30 backdrop-blur-sm"
                      aria-label="Previous images"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 dark:bg-black/10 text-black dark:text-white hover:bg-white/20 dark:hover:bg-black/20 transition duration-300 z-30 backdrop-blur-sm"
                      aria-label="Next images"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Right Side - Statistics */}
            <div className="space-y-8">
              <div className="text-center">
                <div className="text-6xl lg:text-8xl text-black dark:text-white font-black mb-2">{content.projectsCompleted}</div>
                <p className="text-gray-600 dark:text-gray-300 text-lg">{content.projectsCompletedLabel}</p>
              </div>
              <div className="text-center">
                <div className="text-6xl lg:text-8xl text-black dark:text-white font-black mb-2">{content.clientSatisfaction}</div>
                <p className="text-gray-600 dark:text-gray-300 text-lg">{content.clientSatisfactionLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Capabilities - hover a line, the image behind it changes */}
      <div className="relative w-full py-24 px-6 lg:px-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="flex flex-col">
            {serviceItems.map((service, index) => (
              <button
                key={service.title}
                onMouseEnter={() => setHoveredService(index)}
                onFocus={() => setHoveredService(index)}
                className="group flex items-center gap-6 py-6 border-b border-gray-800 text-left transition-colors hover:bg-white/5"
              >
                <span className="text-gray-600 text-sm font-mono">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="text-2xl lg:text-3xl font-black uppercase tracking-tight text-white group-hover:translate-x-2 transition-transform">
                    {service.title}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">{service.description}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="relative aspect-[4/5] w-full overflow-hidden hidden lg:block">
            {serviceItems.map((service, index) =>
              service.image ? (
                <img
                  key={service.title}
                  src={service.image}
                  alt={service.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                    hoveredService === index ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ) : null
            )}
          </div>
        </div>
      </div>

      {/* Closing statement - full-bleed image with an oversized line over it */}
      <div className="relative w-full min-h-[70vh] flex items-end overflow-hidden border-t border-gray-800">
        {rightImage && (
          <img
            src={rightImage.url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-16 w-full">
          <h2 className="text-5xl sm:text-7xl lg:text-8xl text-white font-black uppercase tracking-tighter leading-[0.9] mb-8">
            Let&apos;s make<br />something worth<br />looking at.
          </h2>
          <Link
            href="/contact"
            data-cursor="Open"
            className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white border-b-2 border-white pb-1 w-fit"
          >
            Start a project
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
