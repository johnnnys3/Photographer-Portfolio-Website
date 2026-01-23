import { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useData } from '../contexts/DataContext';
import { getSiteContent } from '../services/contentService';
import { CONTENT_SECTIONS } from '../services/contentService';
import type { DatabaseImage } from '../lib/supabase';

interface HomePageProps {
  onImageClick: (imageId: string) => void;
  onNavigate?: (page: string) => void;
}

export function HomePage({ onImageClick }: HomePageProps) {
  const { images } = useData();
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

  return (
    <div className="min-h-screen bg-white dark:bg-black relative">
      {/* Hero Section - Clean Layout */}
      <div className="relative w-full h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Center Content - Clean Layout */}
        <div className="relative z-20 max-w-7xl mx-auto px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Title and Button */}
            <div className="text-left">
              <h1 
                className="text-5xl sm:text-6xl lg:text-7xl text-black dark:text-white font-black leading-none mb-6"
                dangerouslySetInnerHTML={{ __html: content.heroTitle }}
              />
              
              {/* Book Now Button */}
              <div className="mt-8">
                <Link
                  href="/contact"
                  className="group bg-white dark:bg-white text-black py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-lg text-base font-medium flex items-center gap-2 w-fit"
                >
                  {content.buttonText}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            
            {/* Right Side - Description Text */}
            <div className="text-left lg:text-right">
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-light leading-relaxed max-w-md lg:ml-auto">
                {content.heroDescription}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Introduction Section with Images */}
      <div className="relative w-full py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 border-2 border-gray-400 dark:border-gray-600 rounded-full flex items-center justify-center">
              <span className="text-gray-600 dark:text-gray-300 text-xl font-bold">+</span>
            </div>
            <h2 className="text-4xl lg:text-6xl text-black dark:text-white font-black uppercase tracking-tight">
              {content.specializeTitle}
            </h2>
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

      {/* BRINGS YOUR VISION TO LIFE Section */}
      <div className="relative w-full py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl lg:text-6xl text-white font-black text-center mb-16">
            BRINGS YOUR VISION TO LIFE
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="service-card p-8 rounded-lg text-center">
              <div className="w-16 h-16 border-2 border-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
              </div>
              <h3 className="text-xl text-white font-bold mb-4">Model Profiles & Bios</h3>
              <p className="text-gray-400">Professional model profiles with compelling biographies that capture your unique essence and appeal to clients.</p>
              <div className="mt-6 flex justify-center">
                <div className="w-8 h-8 border border-gray-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div className="service-card p-8 rounded-lg text-center">
              <div className="w-16 h-16 border-2 border-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
              </div>
              <h3 className="text-xl text-white font-bold mb-4">Portfolio & Lookbook Designs</h3>
              <p className="text-gray-400">Stunning portfolio and lookbook designs that showcase your versatility and professional modeling capabilities.</p>
              <div className="mt-6 flex justify-center">
                <div className="w-8 h-8 border border-gray-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div className="service-card p-8 rounded-lg text-center">
              <div className="w-16 h-16 border-2 border-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
              </div>
              <h3 className="text-xl text-white font-bold mb-4">Website & About Page Copy</h3>
              <p className="text-gray-400">Compelling website content and about page copy that tells your story and connects with your target audience.</p>
              <div className="mt-6 flex justify-center">
                <div className="w-8 h-8 border border-gray-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CRAFTING STORIES IN EXCEPTIONAL TALENT Text Carousel */}
      <div className="relative w-full py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-4xl lg:text-6xl text-white font-black mb-8">
              CRAFTING STORIES IN EXCEPTIONAL TALENT
            </h2>
            
            {/* Simple carousel indicators */}
            <div className="flex justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <div className="w-2 h-2 rounded-full bg-gray-600"></div>
              <div className="w-2 h-2 rounded-full bg-gray-600"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
