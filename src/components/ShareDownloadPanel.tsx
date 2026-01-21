import { useState } from 'react';
import { Download, Share2, Copy, Facebook, Twitter, Linkedin, Check } from 'lucide-react';
import { shareManager, shareImage, downloadImageWithConfirmation, copyImageUrl, getSupportedFormats } from '../lib/shareUtils';
import type { DatabaseImage } from '../lib/supabase';

interface ShareDownloadPanelProps {
  image: DatabaseImage;
  onClose: () => void;
}

export function ShareDownloadPanel({ image, onClose }: ShareDownloadPanelProps) {
  const [downloadFormat, setDownloadFormat] = useState('jpg');
  const [downloadQuality, setDownloadQuality] = useState(0.9);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);

  const shareOptions = {
    title: image.title || 'Photography',
    description: image.description || `Check out this amazing photo from my portfolio!`,
    url: image.url,
    image,
  };

  const shareUrls = shareManager.generateShareUrls(shareOptions);
  const embedCode = shareManager.generateEmbedCode(image);
  const supportedFormats = getSupportedFormats();

  // Handle social media share
  const handleSocialShare = (platform: string) => {
    const url = shareUrls[platform as keyof typeof shareUrls];
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Handle Web Share API
  const handleWebShare = async () => {
    const success = await shareImage(image);
    if (success) {
      setShareSuccess('Shared successfully!');
      setTimeout(() => setShareSuccess(null), 3000);
    }
  };

  // Handle copy link
  const handleCopyLink = async () => {
    const success = await copyImageUrl(image);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Handle copy embed code
  const handleCopyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
    } catch (error) {
    }
  };

  // Handle download
  const handleDownload = () => {
    downloadImageWithConfirmation(image);
  };

  // Handle custom download
  const handleCustomDownload = () => {
    shareManager.downloadImage(image, {
      format: downloadFormat as any,
      quality: downloadQuality,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Share & Download</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image Preview */}
        <div className="p-6 border-b">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            <img
              src={image.url}
              alt={image.title || 'Image'}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="font-medium text-gray-900 dark:text-white">{image.title || 'Untitled'}</h3>
          {image.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{image.description}</p>
          )}
        </div>

        {/* Share Options */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">Share</h3>
          
          {/* Web Share API */}
          {shareManager.isWebShareSupported() && (
            <button
              onClick={handleWebShare}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors mb-4"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
          )}

          {/* Social Media Buttons */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <button
              onClick={() => handleSocialShare('facebook')}
              className="flex flex-col items-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Facebook className="w-5 h-5" />
              <span className="text-xs">Facebook</span>
            </button>
            <button
              onClick={() => handleSocialShare('twitter')}
              className="flex flex-col items-center gap-2 p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
            >
              <Twitter className="w-5 h-5" />
              <span className="text-xs">Twitter</span>
            </button>
            <button
              onClick={() => handleSocialShare('linkedin')}
              className="flex flex-col items-center gap-2 p-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
            >
              <Linkedin className="w-5 h-5" />
              <span className="text-xs">LinkedIn</span>
            </button>
          </div>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {copiedLink ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
            {copiedLink ? 'Link Copied!' : 'Copy Link'}
          </button>

          {/* Success Message */}
          {shareSuccess && (
            <div className="mt-3 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
              {shareSuccess}
            </div>
          )}
        </div>

        {/* Download Options */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">Download</h3>
          
          {/* Quick Download */}
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mb-4"
          >
            <Download className="w-5 h-5" />
            Download Original
          </button>

          {/* Advanced Options Toggle */}
          <button
            onClick={() => setShowDownloadOptions(!showDownloadOptions)}
            className="w-full text-left px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {showDownloadOptions ? 'Hide' : 'Show'} Advanced Options
          </button>

          {/* Advanced Options */}
          {showDownloadOptions && (
            <div className="mt-4 space-y-4">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Format</label>
                <select
                  value={downloadFormat}
                  onChange={(e) => setDownloadFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {supportedFormats.map((format) => (
                    <option key={format} value={format}>
                      {format.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quality Slider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quality: {Math.round(downloadQuality * 100)}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={downloadQuality * 100}
                  onChange={(e) => setDownloadQuality(Number(e.target.value) / 100)}
                  className="w-full"
                />
              </div>

              {/* Custom Download Button */}
              <button
                onClick={handleCustomDownload}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Download className="w-5 h-5" />
                Download Custom
              </button>
            </div>
          )}
        </div>

        {/* Embed Options */}
        <div className="p-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">Embed</h3>
          
          {/* Embed Code Toggle */}
          <button
            onClick={() => setShowEmbedCode(!showEmbedCode)}
            className="w-full text-left px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mb-4"
          >
            {showEmbedCode ? 'Hide' : 'Show'} Embed Code
          </button>

          {/* Embed Code */}
          {showEmbedCode && (
            <div className="space-y-3">
              <textarea
                value={embedCode}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs bg-gray-50"
                rows={6}
              />
              <button
                onClick={handleCopyEmbed}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {copiedEmbed ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                {copiedEmbed ? 'Embed Code Copied!' : 'Copy Embed Code'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
