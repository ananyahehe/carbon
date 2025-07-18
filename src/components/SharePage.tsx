import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ExternalLink, Download, Share2 } from 'lucide-react';
import { format } from 'date-fns';

interface ShareData {
  id: string;
  footprint: number;
  improvements: number;
  achievements: number;
  streak: number;
  timestamp: string;
  username?: string;
}

export default function SharePage() {
  const { shareId } = useParams();
  const [searchParams] = useSearchParams();
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadShareData = () => {
      try {
        const encodedData = searchParams.get('data');
        if (!encodedData) {
          throw new Error('No share data found');
        }

        const decodedData = JSON.parse(atob(encodedData));
        setShareData(decodedData);
      } catch (err) {
        setError('Invalid or expired share link');
      } finally {
        setLoading(false);
      }
    };

    loadShareData();
  }, [shareId, searchParams]);

  const handleJoinApp = () => {
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading shared progress...</p>
        </div>
      </div>
    );
  }

  if (error || !shareData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Share Link Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleJoinApp}
            className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Start Your Climate Journey
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50">
      {/* SEO Meta Tags would be set here in a real app */}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
              <span className="text-2xl text-white">🌱</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900">CarbonTracker</h1>
          </div>
          <p className="text-gray-600">Someone shared their climate progress with you!</p>
        </div>

        {/* Main Share Card */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-500 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%),
                                 radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)`
              }} />
            </div>

            <div className="relative z-10">
              {/* User Info */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <span className="text-3xl">👤</span>
                </div>
                <h2 className="text-2xl font-bold">{shareData.username || 'Climate Champion'}</h2>
                <p className="text-sm opacity-75">Shared on {format(new Date(shareData.timestamp), 'MMMM dd, yyyy')}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-black mb-2">
                    {Math.round(shareData.footprint / 1000 * 10) / 10}t
                  </div>
                  <div className="text-sm opacity-80">Annual CO₂ Footprint</div>
                  <div className="text-xs opacity-60 mt-1">
                    {shareData.footprint < 7500 ? 'Below global average!' : 'Working towards goals'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black mb-2 text-yellow-300">
                    {shareData.improvements > 0 ? `${shareData.improvements}%` : '0%'}
                  </div>
                  <div className="text-sm opacity-80">Improvement</div>
                  <div className="text-xs opacity-60 mt-1">
                    {shareData.improvements > 0 ? 'Great progress!' : 'Just getting started'}
                  </div>
                </div>
              </div>

              {/* Achievement Highlights */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold">{shareData.achievements}</div>
                  <div className="text-xs opacity-80">Achievements</div>
                </div>
                <div className="text-center bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold">{shareData.streak}</div>
                  <div className="text-xs opacity-80">Day Streak</div>
                </div>
                <div className="text-center bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold">
                    {shareData.footprint <= 2300 ? 'A+' : 
                     shareData.footprint <= 5000 ? 'A' :
                     shareData.footprint <= 7500 ? 'B+' : 'B'}
                  </div>
                  <div className="text-xs opacity-80">Climate Grade</div>
                </div>
              </div>

              {/* Progress Visualization */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress to Paris Agreement Goal (2.3t CO₂)</span>
                  <span>{Math.min(100, Math.round((2300 / shareData.footprint) * 100))}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-yellow-300 to-orange-300 h-4 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (2300 / shareData.footprint) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Motivational Message */}
              <div className="text-center">
                <p className="text-lg font-semibold mb-2">🌍 Making a difference for our planet!</p>
                <p className="text-sm opacity-80">Every action counts in the fight against climate change</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to start your climate journey?
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of people tracking their carbon footprint and making a positive impact on the environment.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleJoinApp}
                className="flex items-center justify-center space-x-2 px-8 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-semibold"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Start Tracking Now</span>
              </button>
              
              <button
                onClick={() => navigator.share?.({ 
                  title: 'Check out my climate progress!',
                  text: `I've been tracking my carbon footprint and made ${shareData.improvements}% improvement! Join me in fighting climate change.`,
                  url: window.location.href 
                }) || navigator.clipboard.writeText(window.location.href)}
                className="flex items-center justify-center space-x-2 px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                <Share2 className="w-5 h-5" />
                <span>Share This</span>
              </button>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="max-w-4xl mx-auto mt-12">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            What you'll get with CarbonTracker
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Track Your Impact</h4>
              <p className="text-gray-600 text-sm">Monitor your carbon footprint across transportation, energy, and lifestyle choices.</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Set Goals</h4>
              <p className="text-gray-600 text-sm">Create personalized reduction targets and track your progress over time.</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Earn Achievements</h4>
              <p className="text-gray-600 text-sm">Unlock badges and celebrate milestones on your sustainability journey.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}