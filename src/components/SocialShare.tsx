import React, { useState, useRef } from 'react';
import { Share2, Download, Copy, Check, Twitter, Facebook, Linkedin, Instagram, ExternalLink } from 'lucide-react';
import html2canvas from 'html2canvas';
import { getCalculationHistory } from '../utils/storage';
import { format } from 'date-fns';

interface SocialShareProps {
  userFootprint: number;
  userProfile: any;
}

interface ShareableData {
  id: string;
  footprint: number;
  improvements: number;
  achievements: number;
  streak: number;
  timestamp: string;
  username?: string;
}

export default function SocialShare({ userFootprint, userProfile }: SocialShareProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  const calculations = getCalculationHistory();
  const improvements = calculations.length > 1 
    ? Math.round(((calculations[0]?.footprint - userFootprint) / calculations[0]?.footprint) * 100)
    : 0;

  const generateShareableLink = async (): Promise<string> => {
    const shareData: ShareableData = {
      id: crypto.randomUUID(),
      footprint: userFootprint,
      improvements: Math.max(0, improvements),
      achievements: userProfile.achievements.length,
      streak: userProfile.streaks.current,
      timestamp: new Date().toISOString(),
      username: 'Climate Champion' // Anonymous by default
    };

    // In a real app, this would be sent to your backend
    // For demo purposes, we'll encode it in the URL
    const encodedData = btoa(JSON.stringify(shareData));
    const baseUrl = window.location.origin;
    return `${baseUrl}/share/${shareData.id}?data=${encodedData}`;
  };

  const handleShare = async () => {
    setIsGenerating(true);
    try {
      const url = await generateShareableLink();
      setShareUrl(url);
      setShowShareModal(true);
    } catch (error) {
      console.error('Error generating share link:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadAsImage = async () => {
    if (shareCardRef.current) {
      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true
      });
      
      const link = document.createElement('a');
      link.download = `carbon-progress-${format(new Date(), 'yyyy-MM-dd')}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const shareToSocial = (platform: string) => {
    if (!shareUrl) return;

    const text = `🌱 I've reduced my carbon footprint by ${improvements}% and achieved ${userProfile.achievements.length} climate goals! Join me in making a difference for our planet. #ClimateAction #CarbonFootprint #Sustainability`;
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      instagram: shareUrl // Instagram doesn't support direct URL sharing
    };

    if (platform === 'instagram') {
      // For Instagram, we'll copy the text and open Instagram
      navigator.clipboard.writeText(`${text}\n\n${shareUrl}`);
      alert('Text copied! Paste it in your Instagram post.');
      window.open('https://www.instagram.com/', '_blank');
    } else {
      window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
    }
  };

  return (
    <>
      <button
        onClick={handleShare}
        disabled={isGenerating}
        className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
      >
        {isGenerating ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Share2 className="w-5 h-5" />
            <span>Share Your Progress</span>
          </>
        )}
      </button>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Share Card Preview */}
            <div ref={shareCardRef} className="relative">
              <ShareCard 
                footprint={userFootprint}
                improvements={improvements}
                achievements={userProfile.achievements.length}
                streak={userProfile.streaks.current}
              />
            </div>

            {/* Share Options */}
            <div className="p-6 border-t border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Share Your Achievement</h3>
              
              {/* Copy Link */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shareable Link
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={shareUrl || ''}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Social Media Buttons */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Share on Social Media
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => shareToSocial('twitter')}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                    <span>Twitter</span>
                  </button>
                  <button
                    onClick={() => shareToSocial('facebook')}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Facebook className="w-4 h-4" />
                    <span>Facebook</span>
                  </button>
                  <button
                    onClick={() => shareToSocial('linkedin')}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span>LinkedIn</span>
                  </button>
                  <button
                    onClick={() => shareToSocial('instagram')}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>Instagram</span>
                  </button>
                </div>
              </div>

              {/* Download Options */}
              <div className="flex items-center justify-between">
                <button
                  onClick={downloadAsImage}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download as Image</span>
                </button>
                
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Shareable Card Component
interface ShareCardProps {
  footprint: number;
  improvements: number;
  achievements: number;
  streak: number;
}

function ShareCard({ footprint, improvements, achievements, streak }: ShareCardProps) {
  return (
    <div className="relative w-full bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-500 p-8 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)`
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">🌱</span>
            </div>
            <h1 className="text-3xl font-black">CarbonTracker</h1>
          </div>
          <h2 className="text-xl font-semibold opacity-90">My Climate Progress</h2>
          <p className="text-sm opacity-75 mt-1">{format(new Date(), 'MMMM dd, yyyy')}</p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="text-center">
            <div className="text-4xl font-black mb-2">
              {Math.round(footprint / 1000 * 10) / 10}t
            </div>
            <div className="text-sm opacity-80">Annual CO₂ Footprint</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black mb-2 text-yellow-300">
              {improvements > 0 ? `${improvements}%` : '0%'}
            </div>
            <div className="text-sm opacity-80">Improvement</div>
          </div>
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{achievements}</div>
            <div className="text-xs opacity-80">Achievements</div>
          </div>
          <div className="text-center bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{streak}</div>
            <div className="text-xs opacity-80">Day Streak</div>
          </div>
          <div className="text-center bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">A+</div>
            <div className="text-xs opacity-80">Climate Grade</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress to 2030 Goal</span>
            <span>{Math.min(100, Math.round((2300 / footprint) * 100))}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-yellow-300 to-orange-300 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, (2300 / footprint) * 100)}%` }}
            />
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">🌍 Join me in fighting climate change!</p>
          <p className="text-sm opacity-80">Track your carbon footprint and make a difference</p>
          <div className="mt-4 text-xs opacity-60">
            CarbonTracker.app • #ClimateAction #Sustainability
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-4 right-4 w-16 h-16 bg-white/5 rounded-full" />
      <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/5 rounded-full" />
    </div>
  );
}