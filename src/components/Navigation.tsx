/**
 * MIGRATION NOTE:
 * Source: src/components/Navigation.tsx
 * Destination: src/components/Navigation.tsx (updated for Next.js)
 * This component needs 'use client' because it uses useState, usePathname, and browser-only features.
 * The navigation logic is preserved exactly from the original implementation.
 * Any deviation is unintentional and should be flagged.
 */

'use client';

import { useState, useEffect } from 'react';
import { Menu, X, ArrowLeft, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface NavigationProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export function Navigation({ currentPage }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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

  const navLinks = [
    { id: 'portfolio', label: 'Portfolio', href: '/galleries' },
    { id: 'about', label: 'About', href: '/about' },
    { id: 'contact', label: 'Contact', href: '/contact' },
  ];

  const getCurrentPage = () => {
    if (pathname === '/') return 'home';
    if (pathname === '/galleries') return 'portfolio';
    if (pathname === '/about') return 'about';
    if (pathname === '/contact') return 'contact';
    return 'home';
  };

  const currentPg = currentPage || getCurrentPage();

  return (
    <nav className="bg-white dark:bg-black shadow-sm fixed top-0 left-0 right-0 z-50 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Navigation - Back Button + Logo */}
          <div className="flex items-center space-x-4">
            {pathname !== '/' && (
              <button
                onClick={() => router.back()}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-300"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            
            {/* Logo - LENS */}
            <Link 
              href="/"
              className="flex items-center space-x-2 cursor-pointer"
            >
              <span className="text-xl font-bold text-black dark:text-white">
                LENS
              </span>
            </Link>
          </div>

          {/* Center Navigation - Home + Navigation Links */}
          <div className="hidden md:flex flex-1 items-center justify-center space-x-8">
            {/* Home Button - always show in center */}
            <Link
              href="/"
              className="px-4 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white transition duration-300 font-medium"
              aria-label="Go home"
            >
              Home
            </Link>
            
            {/* Navigation Links */}
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={`transition duration-300 ease-in-out ${
                  currentPg === link.id
                    ? 'text-black dark:text-white font-medium'
                    : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Navigation - Theme Toggle & Book Session */}
          <div className="flex items-center space-x-4">
            {/* Dark/Light Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-300"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            
            {/* Book Session Button */}
            <div className="hidden md:block">
              <Link
                href="/contact"
                className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-gray-800 dark:hover:bg-gray-200"
              >
                Book Session
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button - Tailwind: md:hidden */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Tailwind: md:hidden bg-white border-t */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-black border-t border-gray-200 dark:border-gray-700">
          <div className="px-2 pt-4 pb-3 space-y-1">
            {/* Logo - LENS */}
            <div className="flex items-center justify-center pb-4 border-b border-gray-200 dark:border-gray-700">
              <Link 
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 cursor-pointer py-2"
              >
                <span className="text-xl font-bold text-black dark:text-white">
                  LENS
                </span>
              </Link>
            </div>
            
            {/* Mobile Navigation Links */}
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block w-full text-left px-3 py-2 rounded-md transition duration-300 ${
                  currentPg === link.id
                    ? 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Mobile Action Buttons */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 dark:border-gray-700 mt-2 pt-4">
              <div className="flex items-center space-x-2">
                {pathname !== '/' && (
                  <button
                    onClick={() => {
                      router.back();
                      setMobileMenuOpen(false);
                    }}
                    className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-300"
                    aria-label="Go back"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white transition duration-300 font-medium"
                  aria-label="Go home"
                >
                  Home
                </Link>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    toggleDarkMode();
                    setMobileMenuOpen(false);
                  }}
                  className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition duration-300"
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </button>
                
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-md bg-black dark:bg-white text-white dark:text-black font-medium transition duration-300"
                >
                  Book Session
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
