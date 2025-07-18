import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, Award, Target, Zap, Filter, Download, Share2, Eye, BarChart3, LineChart, PieChart, Clock, Star, Trophy, Flame, CheckCircle, ArrowRight, ChevronDown, ChevronUp, Activity, Globe, Leaf, Users, Medal, Crown, Sparkles } from 'lucide-react';
import { getCalculationHistory, downloadCSV } from '../utils/storage';
import { format, subDays, subWeeks, subMonths, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import AnimatedLineChart from './AnimatedLineChart';
import SocialShare from './SocialShare';

interface TimeRange {
  id: string;
  label: string;
  days: number;
  icon: React.ReactNode;
  color: string;
}

interface MetricCard {
  id: string;
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
  trend: 'up' | 'down' | 'stable';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  date: Date;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface SampleCalculation {
  id: string;
  timestamp: Date;
  footprint: number;
  data: any;
  usage: any;
  location?: {
    city: string;
    country: string;
  };
}

// Generate sample data for demonstration
const generateSampleData = (): SampleCalculation[] => {
  const data: SampleCalculation[] = [];
  const now = new Date();
  
  // Generate 30 days of sample data with realistic trends
  for (let i = 29; i >= 0; i--) {
    const date = subDays(now, i);
    const baseFootprint = 8500;
    const variation = Math.sin(i * 0.2) * 1000 + Math.random() * 800 - 400;
    const trendReduction = i * 15; // Gradual improvement over time
    const footprint = Math.max(3000, baseFootprint + variation - trendReduction);
    
    data.push({
      id: `calc_${i}`,
      timestamp: date,
      footprint: Math.round(footprint),
      data: {
        transportation: { car: footprint * 0.35 },
        energy: { electricity: footprint * 0.28 },
        lifestyle: { diet: footprint * 0.37 }
      },
      usage: {},
      location: { city: 'San Francisco', country: 'USA' }
    });
  }
  
  return data;
};

export default function HistorySection() {
  const [storedCalculations] = useState(getCalculationHistory());
  const [sampleData] = useState(generateSampleData());
  const [selectedTimeRange, setSelectedTimeRange] = useState('30');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  const [hoveredDataPoint, setHoveredDataPoint] = useState<number | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Use sample data if no real data exists
  const calculations = storedCalculations.length > 0 ? storedCalculations : sampleData;

  const timeRanges: TimeRange[] = [
    { id: '7', label: 'Week', days: 7, icon: <Clock className="w-4 h-4" />, color: 'from-blue-500 to-indigo-600' },
    { id: '30', label: 'Month', days: 30, icon: <Calendar className="w-4 h-4" />, color: 'from-emerald-500 to-teal-600' },
    { id: '90', label: 'Quarter', days: 90, icon: <BarChart3 className="w-4 h-4" />, color: 'from-purple-500 to-pink-600' },
    { id: '365', label: 'Year', days: 365, icon: <Globe className="w-4 h-4" />, color: 'from-orange-500 to-red-600' },
    { id: 'all', label: 'All Time', days: 9999, icon: <Star className="w-4 h-4" />, color: 'from-yellow-500 to-amber-600' }
  ];

  const categories = [
    { id: 'all', label: 'All Categories', icon: <Activity className="w-4 h-4" />, color: 'text-gray-600' },
    { id: 'transport', label: 'Transportation', icon: <Globe className="w-4 h-4" />, color: 'text-blue-600' },
    { id: 'energy', label: 'Energy', icon: <Zap className="w-4 h-4" />, color: 'text-orange-600' },
    { id: 'lifestyle', label: 'Lifestyle', icon: <Leaf className="w-4 h-4" />, color: 'text-green-600' }
  ];

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Carbon Conscious',
      description: 'Completed your first footprint calculation',
      icon: '🌱',
      date: new Date(2024, 0, 15),
      category: 'milestone',
      rarity: 'common'
    },
    {
      id: '2',
      title: 'Streak Master',
      description: '7 days of consistent tracking',
      icon: '🔥',
      date: new Date(2024, 1, 1),
      category: 'consistency',
      rarity: 'rare'
    },
    {
      id: '3',
      title: 'Eco Warrior',
      description: 'Reduced footprint by 20%',
      icon: '🏆',
      date: new Date(2024, 1, 15),
      category: 'reduction',
      rarity: 'epic'
    },
    {
      id: '4',
      title: 'Climate Champion',
      description: 'Below global average for 30 days',
      icon: '👑',
      date: new Date(2024, 2, 1),
      category: 'achievement',
      rarity: 'legendary'
    }
  ];

  useEffect(() => {
    // Staggered animation phases
    const phases = [
      () => setAnimationPhase(1), // Metrics cards
      () => setAnimationPhase(2), // Chart area
      () => setAnimationPhase(3), // Timeline
      () => setAnimationPhase(4), // Achievements
    ];

    phases.forEach((phase, index) => {
      setTimeout(phase, index * 200);
    });
  }, []);

  // Filter calculations based on selected time range
  const filteredCalculations = calculations.filter(calc => {
    const calcDate = new Date(calc.timestamp);
    const now = new Date();
    
    if (selectedTimeRange === 'all') return true;
    
    const daysBack = parseInt(selectedTimeRange);
    const startDate = subDays(now, daysBack);
    
    return isWithinInterval(calcDate, { start: startDate, end: now });
  });

  // Calculate metrics
  const calculateMetrics = (): MetricCard[] => {
    if (filteredCalculations.length === 0) return [];

    const latest = filteredCalculations[filteredCalculations.length - 1];
    const previous = filteredCalculations.length > 1 ? filteredCalculations[filteredCalculations.length - 2] : null;
    const average = filteredCalculations.reduce((sum, calc) => sum + calc.footprint, 0) / filteredCalculations.length;
    const lowest = Math.min(...filteredCalculations.map(calc => calc.footprint));
    const trend = previous ? ((latest.footprint - previous.footprint) / previous.footprint) * 100 : 0;

    return [
      {
        id: 'current',
        title: 'Current Footprint',
        value: `${Math.round(latest.footprint).toLocaleString()} kg`,
        change: trend,
        icon: <Activity className="w-6 h-6" />,
        color: 'from-emerald-500 to-teal-600',
        trend: trend < -5 ? 'down' : trend > 5 ? 'up' : 'stable'
      },
      {
        id: 'average',
        title: 'Period Average',
        value: `${Math.round(average).toLocaleString()} kg`,
        change: ((latest.footprint - average) / average) * 100,
        icon: <BarChart3 className="w-6 h-6" />,
        color: 'from-blue-500 to-indigo-600',
        trend: latest.footprint < average ? 'down' : latest.footprint > average ? 'up' : 'stable'
      },
      {
        id: 'best',
        title: 'Best Performance',
        value: `${Math.round(lowest).toLocaleString()} kg`,
        change: ((latest.footprint - lowest) / lowest) * 100,
        icon: <Trophy className="w-6 h-6" />,
        color: 'from-yellow-500 to-amber-600',
        trend: latest.footprint === lowest ? 'stable' : 'up'
      },
      {
        id: 'progress',
        title: 'Total Records',
        value: filteredCalculations.length.toString(),
        change: 0,
        icon: <Target className="w-6 h-6" />,
        color: 'from-purple-500 to-pink-600',
        trend: 'stable'
      }
    ];
  };

  const metrics = calculateMetrics();

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleExport = () => {
    downloadCSV(filteredCalculations, `carbon-history-${selectedTimeRange}days.csv`);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-yellow-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const maxFootprint = Math.max(...filteredCalculations.map(calc => calc.footprint), 1);

  // Render different view modes
  const renderChartView = () => (
    <div className="space-y-8">
      {/* Interactive Chart */}
      <div className="relative h-80">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-50/50 to-transparent rounded-2xl" />
        
        {/* Y-Axis Labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-sm text-gray-500 w-16">
          <span>{Math.round(maxFootprint).toLocaleString()}</span>
          <span>{Math.round(maxFootprint * 0.75).toLocaleString()}</span>
          <span>{Math.round(maxFootprint * 0.5).toLocaleString()}</span>
          <span>{Math.round(maxFootprint * 0.25).toLocaleString()}</span>
          <span>0</span>
        </div>

        {/* Chart Area */}
        <div className="ml-16 mr-4 h-full flex items-end space-x-2">
          {filteredCalculations.map((calc, index) => {
            const height = (calc.footprint / maxFootprint) * 100;
            const isHovered = hoveredDataPoint === index;
            
            return (
              <div
                key={calc.id}
                className="relative flex-1 group cursor-pointer"
                onMouseEnter={() => setHoveredDataPoint(index)}
                onMouseLeave={() => setHoveredDataPoint(null)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 z-20 animate-scale-in">
                    <div className="bg-gray-900 text-white p-4 rounded-xl shadow-2xl min-w-48">
                      <div className="text-center space-y-2">
                        <div className="font-bold text-lg">
                          {Math.round(calc.footprint).toLocaleString()} kg CO₂
                        </div>
                        <div className="text-gray-300 text-sm">
                          {format(new Date(calc.timestamp), 'MMM dd, yyyy')}
                        </div>
                        {index > 0 && (
                          <div className={`text-sm font-medium ${
                            calc.footprint < filteredCalculations[index - 1].footprint 
                              ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {calc.footprint < filteredCalculations[index - 1].footprint ? '↓' : '↑'} 
                            {Math.abs(Math.round(calc.footprint - filteredCalculations[index - 1].footprint))} kg
                          </div>
                        )}
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                )}

                {/* Bar */}
                <div
                  className={`w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-700 ease-out shadow-lg ${
                    isHovered ? 'from-emerald-500 to-emerald-400 scale-110 shadow-xl' : ''
                  }`}
                  style={{ 
                    height: `${height}%`,
                    transitionDelay: `${index * 50}ms`
                  }}
                />

                {/* Date Label */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
                  {format(new Date(calc.timestamp), 'MM/dd')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-100">
        <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
          <div className="text-2xl font-bold text-emerald-600 mb-1">
            {filteredCalculations.length > 1 ? 
              (((filteredCalculations[0].footprint - filteredCalculations[filteredCalculations.length - 1].footprint) / filteredCalculations[0].footprint * 100) > 0 ? '+' : '') +
              (((filteredCalculations[0].footprint - filteredCalculations[filteredCalculations.length - 1].footprint) / filteredCalculations[0].footprint * 100).toFixed(1)) + '%'
              : '0%'
            }
          </div>
          <div className="text-sm text-gray-600">Total Change</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {Math.round(filteredCalculations.reduce((sum, calc) => sum + calc.footprint, 0) / filteredCalculations.length).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Average (kg CO₂)</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {Math.round(Math.max(...filteredCalculations.map(calc => calc.footprint)) - Math.min(...filteredCalculations.map(calc => calc.footprint))).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Range (kg CO₂)</div>
        </div>
      </div>
    </div>
  );

  const renderTimelineView = () => (
    <div className="space-y-6">
      {filteredCalculations.slice().reverse().map((calc, index) => {
        const isImprovement = index < filteredCalculations.length - 1 && 
          calc.footprint < filteredCalculations[filteredCalculations.length - 2 - index].footprint;
        
        return (
          <div
            key={calc.id}
            className="flex items-center space-x-6 p-6 bg-gradient-to-r from-white to-gray-50 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Date Circle */}
            <div className="flex-shrink-0">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-white ${
                isImprovement ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'
              }`}>
                <div className="text-center">
                  <div className="text-xs">{format(new Date(calc.timestamp), 'MMM')}</div>
                  <div className="text-lg">{format(new Date(calc.timestamp), 'dd')}</div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">
                  {Math.round(calc.footprint).toLocaleString()} kg CO₂
                </span>
                {isImprovement && (
                  <div className="flex items-center space-x-1 text-emerald-600 text-sm font-medium">
                    <TrendingDown className="w-4 h-4" />
                    <span>Improved</span>
                  </div>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    isImprovement ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                  }`}
                  style={{ 
                    width: `${(calc.footprint / maxFootprint) * 100}%`,
                    transitionDelay: `${index * 200}ms`
                  }}
                />
              </div>
            </div>

            {/* Breakdown */}
            <div className="flex-shrink-0 text-right">
              <div className="text-sm text-gray-600">
                <div>Transport: {Math.round(calc.footprint * 0.35)} kg</div>
                <div>Energy: {Math.round(calc.footprint * 0.28)} kg</div>
                <div>Lifestyle: {Math.round(calc.footprint * 0.37)} kg</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredCalculations.map((calc, index) => {
        const isLatest = index === filteredCalculations.length - 1;
        const isBest = calc.footprint === Math.min(...filteredCalculations.map(c => c.footprint));
        
        return (
          <div
            key={calc.id}
            className={`relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              isLatest ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50' :
              isBest ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-amber-50' :
              'border-gray-200 bg-white hover:border-blue-300'
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Badge */}
            {(isLatest || isBest) && (
              <div className={`absolute -top-3 -right-3 px-3 py-1 rounded-full text-xs font-bold text-white ${
                isLatest ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-yellow-500 to-amber-600'
              }`}>
                {isLatest ? 'Latest' : 'Best'}
              </div>
            )}

            {/* Date */}
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-gray-900">
                {format(new Date(calc.timestamp), 'dd')}
              </div>
              <div className="text-sm text-gray-600">
                {format(new Date(calc.timestamp), 'MMM yyyy')}
              </div>
            </div>

            {/* Footprint */}
            <div className="text-center mb-6">
              <div className="text-3xl font-black text-gray-900 mb-1">
                {Math.round(calc.footprint).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">kg CO₂</div>
            </div>

            {/* Breakdown Chart */}
            <div className="space-y-3">
              {[
                { label: 'Transport', value: calc.footprint * 0.35, color: 'bg-blue-500' },
                { label: 'Energy', value: calc.footprint * 0.28, color: 'bg-orange-500' },
                { label: 'Lifestyle', value: calc.footprint * 0.37, color: 'bg-green-500' }
              ].map((item, i) => (
                <div key={item.label} className="flex items-center space-x-3">
                  <div className="w-16 text-xs text-gray-600">{item.label}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all duration-1000`}
                      style={{ 
                        width: `${(item.value / calc.footprint) * 100}%`,
                        transitionDelay: `${(index * 100) + (i * 200)}ms`
                      }}
                    />
                  </div>
                  <div className="w-12 text-xs text-gray-600 text-right">
                    {Math.round(item.value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl blur-3xl" />
          <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-60 animate-pulse" />
                    <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl">
                      <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Progress History
                    </h1>
                    <p className="text-xl text-gray-600 font-medium">
                      Track your carbon journey and celebrate achievements
                    </p>
                  </div>
                </div>
                
                {/* Data Source Indicator */}
                <div className="flex items-center space-x-2 px-4 py-2 bg-blue-100 rounded-full">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-sm text-blue-700 font-medium">
                    {storedCalculations.length > 0 ? 'Your Real Data' : 'Sample Data - Start tracking to see your progress!'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleExport}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <Download className="w-5 h-5" />
                  <span>Export Data</span>
                </button>
                
                <SocialShare 
                  userFootprint={calculations.length > 0 ? calculations[calculations.length - 1].footprint : 0}
                  userProfile={{
                    achievements: achievements,
                    streaks: { current: 7, longest: 14, lastUpdate: new Date() }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Time Range & Category Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Time Range Filter */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span>Time Period</span>
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {timeRanges.map((range, index) => (
                <button
                  key={range.id}
                  onClick={() => setSelectedTimeRange(range.id)}
                  className={`relative p-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                    selectedTimeRange === range.id
                      ? `bg-gradient-to-r ${range.color} text-white shadow-lg`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col items-center space-y-2">
                    {range.icon}
                    <span className="text-sm">{range.label}</span>
                  </div>
                  {selectedTimeRange === range.id && (
                    <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Filter className="w-5 h-5 text-purple-500" />
              <span>Categories</span>
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {categories.map((category, index) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`relative p-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-2">
                    {category.icon}
                    <span className="text-sm">{category.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <div
              key={metric.id}
              className={`relative group bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 ${
                animationPhase >= 1 ? 'animate-slide-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`flex items-center justify-center w-12 h-12 bg-gradient-to-r ${metric.color} rounded-xl shadow-lg`}>
                    {metric.icon}
                  </div>
                  {metric.trend !== 'stable' && (
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold ${
                      metric.trend === 'down' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {metric.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                      <span>{Math.abs(metric.change).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">{metric.title}</h3>
                  <p className="text-2xl font-black text-gray-900">{metric.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Chart Section */}
        <div className={`bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden ${
          animationPhase >= 2 ? 'animate-slide-up' : 'opacity-0'
        }`} style={{ animationDelay: '600ms' }}>
          
          {/* Animated Line Chart */}
          <AnimatedLineChart 
            data={filteredCalculations.map((calc, index) => ({
              id: calc.id,
              timestamp: new Date(calc.timestamp),
              footprint: calc.footprint,
              index,
              date: format(new Date(calc.timestamp), 'MMM dd'),
              fullDate: format(new Date(calc.timestamp), 'MMMM dd, yyyy')
            }))}
            width={800}
            height={500}
            showAnimation={true}
          />
        </div>

        {/* Additional Views Section */}
        <div className={`bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden ${
          animationPhase >= 2 ? 'animate-slide-up' : 'opacity-0'
        }`} style={{ animationDelay: '800ms' }}>
          
          {/* Chart Header */}
          <div className="p-8 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Detailed Analysis</h2>
                <p className="text-gray-600">Explore your data in different formats</p>
              </div>
              
              <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
                {[
                  { id: 'timeline', icon: <Clock className="w-4 h-4" />, label: 'Timeline' },
                  { id: 'grid', icon: <BarChart3 className="w-4 h-4" />, label: 'Grid' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      viewMode === mode.id
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {mode.icon}
                    <span className="hidden sm:inline">{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chart Content */}
          <div className="p-8">
            {filteredCalculations.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
                  <BarChart3 className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Data Available</h3>
                <p className="text-gray-600">Start tracking your carbon footprint to see progress here</p>
              </div>
            ) : (
              <>
                {viewMode === 'timeline' && renderTimelineView()}
                {viewMode === 'grid' && renderGridView()}
              </>
            )}
          </div>
        </div>

        {/* Achievements Section */}
        <div className={`bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden ${
          animationPhase >= 4 ? 'animate-slide-up' : 'opacity-0'
        }`} style={{ animationDelay: '1200ms' }}>
          
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl shadow-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
                  <p className="text-gray-600">Celebrate your climate action milestones</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Award className="w-4 h-4" />
                <span>{achievements.length} unlocked</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {achievements.map((achievement, index) => (
                <div
                  key={achievement.id}
                  className="group relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-500 transform hover:scale-105"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(achievement.rarity)} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
                  
                  <div className="relative space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-4xl">{achievement.icon}</div>
                      <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                        achievement.rarity === 'common' ? 'bg-gray-100 text-gray-700' :
                        achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                        achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {achievement.rarity}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{achievement.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                      <div className="text-xs text-gray-500">
                        {format(achievement.date, 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-black">Your Climate Impact</h2>
              <p className="text-blue-100 text-lg">Every action counts towards a sustainable future</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <div className="text-4xl font-black">{calculations.length}</div>
                <div className="text-blue-100">Total Calculations</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-4xl font-black">{achievements.length}</div>
                <div className="text-blue-100">Achievements Unlocked</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-4xl font-black">
                  {calculations.length > 0 ? Math.round(calculations.reduce((sum, calc) => sum + calc.footprint, 0) / 1000) : 0}t
                </div>
                <div className="text-blue-100">Total CO₂ Tracked</div>
              </div>
            </div>
            
            <div className="pt-6">
              <SocialShare 
                userFootprint={calculations.length > 0 ? calculations[calculations.length - 1].footprint : 0}
                userProfile={{
                  achievements: achievements,
                  streaks: { current: 7, longest: 14, lastUpdate: new Date() }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}