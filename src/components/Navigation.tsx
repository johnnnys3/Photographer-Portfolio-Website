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
    { id: 'about', label: 'About', href: '/about' },
    { id: 'portfolio', label: 'Portfolio', href: '/galleries' },
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
    <nav className="bg-white dark:bg-black fixed top-0 left-0 right-0 z-50 w-full border-b border-gray-200 dark:border-gray-800">
      <div className="w-full px-6 lg:px-12">
        <div className="flex justify-between items-center h-20 w-full">
          {/* Left - Back Button and Abstract Logo */}
          <div className="flex items-center justify-center h-full gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-300"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Link 
              href="/"
              className="cursor-pointer"
            >
              <div className="w-10 h-10 bg-black dark:bg-white rounded-sm transform rotate-45"></div>
            </Link>
          </div>

          {/* Center - Navigation Links */}
          <div className="hidden md:flex items-center justify-center h-full flex-1 gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={`font-medium transition duration-300 hover:text-gray-600 dark:hover:text-gray-400 ${
                  currentPg === link.id ? 'text-black dark:text-white' : 'text-gray-500 dark:text-gray-500'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right - Profile Icon, Dark Mode Toggle and Mobile Menu */}
          <div className="flex items-center justify-end h-full gap-4">
            <div className="hidden md:block">
              <div className="w-10 h-10 rounded-full border-2 border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 cursor-pointer hover:border-gray-600 dark:hover:border-gray-400 transition duration-300 flex items-center justify-center">
                <span className="text-gray-600 dark:text-gray-300 font-bold">C</span>
              </div>
            </div>
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
            <button
              className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
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
      </div>

      {/* Mobile Menu - Full navigation overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-white dark:bg-black z-50">
          <div className="flex flex-col h-full">
            {/* Mobile Menu Header */}
            <div className="flex justify-between items-center h-20 px-6 lg:px-12 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center">
                <Link 
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="cursor-pointer"
                >
                  <div className="w-10 h-10 bg-black dark:bg-white rounded-sm transform rotate-45"></div>
                </Link>
              </div>
              <button
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Mobile Navigation Links */}
            <div className="flex-1 flex flex-col justify-center items-center space-y-8 px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-2xl font-bold transition duration-300 ${
                    currentPg === link.id
                      ? 'text-black dark:text-white'
                      : 'text-gray-500 dark:text-gray-500 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Profile Icon */}
              <div className="w-12 h-12 rounded-full border-2 border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 cursor-pointer hover:border-gray-600 dark:hover:border-gray-400 transition duration-300 flex items-center justify-center">
                <span className="text-gray-600 dark:text-gray-300 font-bold text-lg">C</span>
              </div>
              
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-3 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-300 flex items-center justify-center"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="w-6 h-6" />
                ) : (
                  <Moon className="w-6 h-6" />
                )}
              </button>
              
              {/* Back Button (only when not on homepage) */}
              {pathname !== '/' && (
                <button
                  onClick={() => {
                    router.back();
                    setMobileMenuOpen(false);
                  }}
                  className="p-3 rounded-md text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-300 flex items-center justify-center"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
