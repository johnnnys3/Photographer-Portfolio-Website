/**
 * Image download and share utilities
 */

import type { DatabaseImage } from './supabase';

export interface ShareOptions {
  title: string;
  description: string;
  url: string;
  image: DatabaseImage;
}

export interface DownloadOptions {
  quality?: number;
  format?: 'jpg' | 'png' | 'webp';
  filename?: string;
}

export class ImageShareManager {
  /**
   * Generate shareable URLs for social media platforms
   */
  public generateShareUrls(options: ShareOptions): Record<string, string> {
    const { title, description, url } = options;
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);

    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedDescription}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedDescription}`,
      reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
    };
  }

  /**
   * Generate Web Share API data
   */
  public generateWebShareData(options: ShareOptions): ShareData {
    return {
      title: options.title,
      text: options.description,
      url: options.url,
    };
  }

  /**
   * Copy image to clipboard
   */
  public async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Download image with specified options
   */
  public downloadImage(image: DatabaseImage, options: DownloadOptions = {}): void {
    const {
      quality = 0.9,
      format = 'jpg',
      filename,
    } = options;

    // Create download link
    const link = document.createElement('a');
    link.href = image.url;
    
    // Set download attribute
    const downloadFilename = filename || `${image.title || 'image'}_${image.id}.${format}`;
    link.download = downloadFilename;

    // Convert to canvas for quality adjustment if needed
    if (quality < 1 || format !== image.url.split('.').pop()?.toLowerCase()) {
      this.downloadImageWithCanvas(image, { quality, format, filename });
      return;
    }

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Download image with canvas manipulation
   */
  private async downloadImageWithCanvas(image: DatabaseImage, options: DownloadOptions): Promise<void> {
    const { quality = 0.9, format = 'jpg', filename } = options;

    try {
      // Create image element
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = image.url;
      });

      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Set canvas dimensions
      canvas.width = image.width || 800;
      canvas.height = image.height || 600;

      // Draw image to canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename || `${image.title || 'image'}_${image.id}.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, `image/${format}`, quality);
    } catch (error) {
      console.error('Failed to download image:', error);
      // Fallback to direct download
      this.downloadImage(image, { quality: 1, format: 'jpg', filename });
    }
  }

  /**
   * Generate embed code for websites
   */
  public generateEmbedCode(image: DatabaseImage): string {
    const aspectRatio = image.width && image.height ? image.width / image.height : 16/9;
    const width = 600;
    const height = Math.round(width / aspectRatio);

    return `<iframe 
      src="${image.url}" 
      width="${width}" 
      height="${height}" 
      frameborder="0" 
      allowfullscreen
      title="${image.title || 'Image'}"
    ></iframe>`;
  }

  /**
   * Generate direct image URL for sharing
   */
  public generateDirectImageUrl(image: DatabaseImage): string {
    return image.url;
  }

  /**
   * Check if Web Share API is supported
   */
  public isWebShareSupported(): boolean {
    return 'share' in navigator && typeof navigator.share === 'function';
  }

  /**
   * Share using Web Share API
   */
  public async webShare(shareData: ShareData): Promise<boolean> {
    if (!this.isWebShareSupported()) {
      return false;
    }

    try {
      await navigator.share(shareData);
      return true;
    } catch (error) {
      console.error('Web Share failed:', error);
      return false;
    }
  }

  /**
   * Generate QR code for image URL
   */
  public generateQRCode(url: string): string {
    // This would need a QR code library
    // For now, return a placeholder
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  }
}

// Global share manager instance
export const shareManager = new ImageShareManager();

/**
 * Utility functions for sharing
 */
export async function shareImage(image: DatabaseImage, platform?: string): Promise<boolean> {
  const shareOptions: ShareOptions = {
    title: image.title || 'Photography',
    description: image.description || `Check out this amazing photo from my portfolio!`,
    url: image.url,
    image,
  };

  // If specific platform requested
  if (platform) {
    const shareUrls = shareManager.generateShareUrls(shareOptions);
    const url = shareUrls[platform];
    
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return true;
    }
  }

  // Try Web Share API first
  if (shareManager.isWebShareSupported()) {
    const shareData = shareManager.generateWebShareData(shareOptions);
    return await shareManager.webShare(shareData);
  }

  // Fallback to copying link to clipboard
  const shareUrls = shareManager.generateShareUrls(shareOptions);
  const allUrls = Object.values(shareUrls).join('\n');
  
  const success = await shareManager.copyToClipboard(allUrls);
  
  if (success) {
    // Show success message
    alert('Share links copied to clipboard!');
  }

  return success;
}

/**
 * Download image with user confirmation
 */
export function downloadImageWithConfirmation(image: DatabaseImage): void {
  const filename = prompt(
    'Enter filename (without extension):',
    `${image.title || 'image'}_${image.id}`
  );

  if (filename !== null) {
    shareManager.downloadImage(image, { filename });
  }
}

/**
 * Copy image URL to clipboard
 */
export async function copyImageUrl(image: DatabaseImage): Promise<boolean> {
  const url = shareManager.generateDirectImageUrl(image);
  return await shareManager.copyToClipboard(url);
}

/**
 * Get image dimensions for download
 */
export function getImageDimensions(image: DatabaseImage): { width: number; height: number } {
  return {
    width: image.width || 800,
    height: image.height || 600,
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get supported download formats
 */
export function getSupportedFormats(): string[] {
  return ['jpg', 'png', 'webp'];
}

/**
 * Validate download options
 */
export function validateDownloadOptions(options: DownloadOptions): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const formats = getSupportedFormats();

  if (options.format && !formats.includes(options.format)) {
    errors.push(`Format must be one of: ${formats.join(', ')}`);
  }

  if (options.quality && (options.quality < 0.1 || options.quality > 1)) {
    errors.push('Quality must be between 0.1 and 1.0');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
