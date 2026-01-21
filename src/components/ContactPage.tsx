/**
 * MIGRATION NOTE:
 * Source: src/components/ContactPage.tsx
 * Destination: src/components/ContactPage.tsx (updated for Next.js)
 * This component needs 'use client' because it uses useState, form handling, and browser-only features.
 * The contact form functionality is preserved exactly from the original implementation.
 * Any deviation is unintentional and should be flagged.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Instagram, Twitter, Facebook, Linkedin } from 'lucide-react';
import { getSiteContent, CONTENT_SECTIONS, DEFAULT_CONTENT } from '../services/contentService';
import { FormTextInput, FormEmailInput, FormTextarea } from './FormInput';
import { createContactFormValidator } from '../lib/formValidation';

// Default contact information fallback
const DEFAULT_CONTACT_INFO = {
  email: "contact@photographer.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  address: "123 Market Street, Suite 456\nSan Francisco, CA 94102"
};

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string | null }>({});
  
  // Initialize form validator
  const [validator] = useState(() => createContactFormValidator());
  // Initialize with default content from contentService
  const defaultContactInfo = DEFAULT_CONTENT[CONTENT_SECTIONS.CONTACT_INFO] || DEFAULT_CONTACT_INFO;
  const defaultSocialMedia = DEFAULT_CONTENT[CONTENT_SECTIONS.SOCIAL_MEDIA] || [];
  
  const [contactInfo, setContactInfo] = useState<any>(defaultContactInfo);
  const [socialMedia, setSocialMedia] = useState<any[]>(defaultSocialMedia);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        const [contactData, socialData] = await Promise.all([
          getSiteContent(CONTENT_SECTIONS.CONTACT_INFO),
          getSiteContent(CONTENT_SECTIONS.SOCIAL_MEDIA),
        ]);
        
        // Update contact info if data is available, otherwise keep default
        if (contactData?.content) {
          setContactInfo(contactData.content);
        } else {
          // Ensure default is set if no data from service
          setContactInfo(defaultContactInfo);
        }
        
        // Update social media if data is available, otherwise keep default
        if (socialData?.content) {
          setSocialMedia(socialData.content);
        } else {
          // Ensure default is set if no data from service
          setSocialMedia(defaultSocialMedia);
        }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate entire form
    const validation = validator.validateForm(formData);
    
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitted(true);
      setFormErrors({});
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (error) {
      setFormErrors({ 
        submit: 'Failed to send message. Please try again later.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear field error when user starts typing
    if (formErrors[fieldName]) {
      setFormErrors(prev => ({ ...prev, [fieldName]: null }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black pt-24 pb-16 px-4 sm:px-6 lg:px-8 w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading contact information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-24 pb-16 px-4 sm:px-6 lg:px-8 w-full">
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl mb-4 text-gray-900 dark:text-white">Get In Touch</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Have a project in mind? Let's work together to create something amazing.
          </p>
        </div>

        {/* Contact Info & Form - Tailwind: flex flex-col md:flex-row gap-12 */}
        <div className="flex flex-col md:flex-row gap-12">
          {/* Contact Information */}
          <div className="w-full md:w-1/3 space-y-8">
            <div>
              <h2 className="text-2xl mb-6 text-gray-900 dark:text-white">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-black dark:text-white flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Email</div>
                    <a 
                      href={`mailto:${contactInfo?.email || defaultContactInfo.email}`} 
                      className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition duration-300"
                    >
                      {contactInfo?.email || defaultContactInfo.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-black dark:text-white flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Phone</div>
                    {(contactInfo?.phone || defaultContactInfo.phone) && (
                      <a 
                        href={`tel:${(contactInfo?.phone || defaultContactInfo.phone).replace(/\s/g, '')}`} 
                        className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition duration-300"
                      >
                        {contactInfo?.phone || defaultContactInfo.phone}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-black dark:text-white flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Location</div>
                    {(contactInfo?.location || defaultContactInfo.location) && (
                      <div className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                        {contactInfo?.location || defaultContactInfo.location}
                      </div>
                    )}
                    {(contactInfo?.address || defaultContactInfo.address) && (
                      <div className="text-gray-600 dark:text-gray-300 whitespace-pre-line mt-1">
                        {contactInfo?.address || defaultContactInfo.address}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            {socialMedia && socialMedia.length > 0 && (
              <div>
                <h3 className="text-xl mb-4 text-gray-900 dark:text-white">Follow Me</h3>
                <div className="flex gap-4">
                  {socialMedia.map((social, index) => {
                    const getIcon = () => {
                      const platform = social.platform?.toLowerCase();
                      if (platform === 'instagram') return <Instagram className="w-6 h-6 text-gray-600 dark:text-gray-300" />;
                      if (platform === 'twitter') return <Twitter className="w-6 h-6 text-gray-600 dark:text-gray-300" />;
                      if (platform === 'facebook') return <Facebook className="w-6 h-6 text-gray-600 dark:text-gray-300" />;
                      if (platform === 'linkedin') return <Linkedin className="w-6 h-6 text-gray-600 dark:text-gray-300" />;
                      return null;
                    };

                    if (!social.url) return null;

                    return (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-black dark:hover:bg-gray-600 hover:text-white transition duration-300 ease-in-out transform hover:scale-110"
                        aria-label={social.platform || 'Social media'}
                      >
                        {getIcon()}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Contact Form - Tailwind: w-full md:w-2/3 p-8 bg-gray-50 rounded-lg shadow */}
          <div className="w-full md:w-2/3 p-8 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-2xl mb-6 text-gray-900 dark:text-white">Send a Message</h2>
            
            {submitted ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-6 py-4 rounded-lg flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Message Sent Successfully!</h3>
                  <p className="text-sm mt-1">Thank you for your message! I'll get back to you soon.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form submission error */}
                {formErrors.submit && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formErrors.submit}</span>
                  </div>
                )}

                {/* Name Input */}
                <FormTextInput
                  name="name"
                  label="Name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(value) => handleChange('name', value)}
                  validator={validator}
                  required
                  validateOnBlur
                  validateOnChange
                />

                {/* Email Input */}
                <FormEmailInput
                  name="email"
                  label="Email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(value) => handleChange('email', value)}
                  validator={validator}
                  required
                  validateOnBlur
                  validateOnChange
                />

                {/* Subject Input */}
                <FormTextInput
                  name="subject"
                  label="Subject"
                  placeholder="What's this about?"
                  value={formData.subject}
                  onChange={(value) => handleChange('subject', value)}
                  validator={validator}
                  required
                  validateOnBlur
                  validateOnChange
                />

                {/* Message Textarea */}
                <FormTextarea
                  name="message"
                  label="Message"
                  placeholder="Tell me about your project..."
                  value={formData.message}
                  onChange={(value) => handleChange('message', value)}
                  validator={validator}
                  rows={6}
                  required
                  validateOnBlur
                  validateOnChange
                />

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-300 text-white py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
