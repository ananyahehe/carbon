import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, Target, Zap, Award, BarChart3, Sparkles, Crown, Star } from 'lucide-react';
import { getCalculationHistory } from '../utils/storage';
import { format } from 'date-fns';

interface ImmersiveCarbonChartProps {
  currentFootprint: number;
}

export default function ImmersiveCarbonChart({ currentFootprint }: ImmersiveCarbonChartProps) {
  const [calculations, setCalculations] = useState(getCalculationHistory());
  const [animationPhase, setAnimationPhase] = useState(0);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [selectedBar, setSelectedBar] = useState<number | null>(null);

  useEffect(() => {
    setCalculations(getCalculationHistory());
    
    // Multi-phase animation sequence
    const phases = [
      () => setAnimationPhase(1), // Start base animation
      () => setAnimationPhase(2), // Grow bars
      () => setAnimationPhase(3), // Add glow effects
      () => setAnimationPhase(4), // Final polish
    ];

    phases.forEach((phase, index) => {
      setTimeout(phase, index * 800);
    });
  }, [currentFootprint]);

  // Prepare comprehensive data
  const chartData = [...calculations]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .slice(-15) // Show last 15 calculations for better comparison
    .map((calc, index) => ({
      ...calc,
      index,
      date: format(new Date(calc.timestamp), 'MMM dd'),
      fullDate: format(new Date(calc.timestamp), 'MMMM dd, yyyy'),
      isImprovement: index > 0 && calc.footprint < calculations[index - 1]?.footprint,
      rank: 0, // Will be calculated
      percentile: 0, // Will be calculated
    }));

  // Add current calculation if different
  if (currentFootprint > 0 && (chartData.length === 0 || chartData[chartData.length - 1].footprint !== currentFootprint)) {
    chartData.push({
      id: 'current',
      timestamp: new Date(),
      footprint: currentFootprint,
      data: {} as any,
      usage: {} as any,
      index: chartData.length,
      date: format(new Date(), 'MMM dd'),
      fullDate: format(new Date(), 'MMMM dd, yyyy'),
      isImprovement: chartData.length > 0 && currentFootprint < chartData[chartData.length - 1].footprint,
      rank: 0,
      percentile: 0,
    });
  }

  // Calculate rankings and percentiles
  const sortedByFootprint = [...chartData].sort((a, b) => a.footprint - b.footprint);
  chartData.forEach(item => {
    const rank = sortedByFootprint.findIndex(sorted => sorted.id === item.id) + 1;
    item.rank = rank;
    item.percentile = Math.round(((chartData.length - rank + 1) / chartData.length) * 100);
  });

  const maxFootprint = Math.max(...chartData.map(d => d.footprint), 15000);
  const minFootprint = Math.min(...chartData.map(d => d.footprint));
  const avgFootprint = chartData.reduce((sum, d) => sum + d.footprint, 0) / chartData.length;
  const bestFootprint = Math.min(...chartData.map(d => d.footprint));
  const worstFootprint = Math.max(...chartData.map(d => d.footprint));

  const getBarHeight = (footprint: number) => {
    return Math.max(8, (footprint / maxFootprint) * 85);
  };

  const getBarColor = (item: any, index: number) => {
    const isLatest = index === chartData.length - 1;
    const isBest = item.footprint === bestFootprint;
    const isWorst = item.footprint === worstFootprint;
    
    if (isLatest) {
      return {
        gradient: 'from-emerald-400 via-emerald-500 to-emerald-600',
        glow: 'shadow-emerald-500/40',
        ring: 'ring-emerald-400/60'
      };
    } else if (isBest) {
      return {
        gradient: 'from-blue-400 via-blue-500 to-blue-600',
        glow: 'shadow-blue-500/40',
        ring: 'ring-blue-400/60'
      };
    } else if (isWorst) {
      return {
        gradient: 'from-red-400 via-red-500 to-red-600',
        glow: 'shadow-red-500/40',
        ring: 'ring-red-400/60'
      };
    } else if (item.isImprovement) {
      return {
        gradient: 'from-teal-400 via-teal-500 to-teal-600',
        glow: 'shadow-teal-500/40',
        ring: 'ring-teal-400/60'
      };
    } else if (item.footprint < avgFootprint) {
      return {
        gradient: 'from-green-400 via-green-500 to-green-600',
        glow: 'shadow-green-500/40',
        ring: 'ring-green-400/60'
      };
    } else {
      return {
        gradient: 'from-orange-400 via-orange-500 to-orange-600',
        glow: 'shadow-orange-500/40',
        ring: 'ring-orange-400/60'
      };
    }
  };

  const getBarIcon = (item: any, index: number) => {
    const isLatest = index === chartData.length - 1;
    const isBest = item.footprint === bestFootprint;
    const isWorst = item.footprint === worstFootprint;
    
    if (isLatest) return <Zap className="w-4 h-4" />;
    if (isBest) return <Crown className="w-4 h-4" />;
    if (isWorst) return <TrendingUp className="w-4 h-4" />;
    if (item.isImprovement) return <TrendingDown className="w-4 h-4" />;
    return <BarChart3 className="w-4 h-4" />;
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <div className="text-center space-y-6 animate-pulse">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-slate-700 to-slate-800 rounded-3xl flex items-center justify-center">
            <BarChart3 className="w-12 h-12 text-slate-500" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold">No Data Yet</p>
            <p className="text-slate-500">Complete calculations to see your carbon journey</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Immersive Background Effects */}
      <div className="absolute inset-0">
        {/* Animated Grid */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(16, 185, 129, 0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(16, 185, 129, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            animation: 'grid-pulse 4s ease-in-out infinite'
          }}
        />
        
        {/* Floating Orbs */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-emerald-400/20 to-teal-400/20 blur-sm animate-float-dark"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${8 + Math.random() * 16}px`,
              height: `${8 + Math.random() * 16}px`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          />
        ))}
        
        {/* Radial Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-emerald-500/5 to-transparent" />
      </div>

      {/* Header Section */}
      <div className="relative z-20 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl blur-lg opacity-60 animate-pulse" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500/90 to-teal-500/90 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-2xl">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-black bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
                  Carbon Journey
                </h3>
                <p className="text-emerald-200/80 font-semibold">Your complete footprint comparison</p>
              </div>
            </div>
          </div>
          
          {/* Stats Dashboard */}
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-black text-emerald-400">{chartData.length}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wide">Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-blue-400">{Math.round(avgFootprint).toLocaleString()}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wide">Average</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-green-400">{Math.round(bestFootprint).toLocaleString()}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wide">Best</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-black ${
                chartData.length > 1 && chartData[chartData.length - 1].footprint < chartData[chartData.length - 2].footprint
                  ? 'text-emerald-400' : 'text-orange-400'
              }`}>
                {chartData.length > 1 ? (
                  chartData[chartData.length - 1].footprint < chartData[chartData.length - 2].footprint ? '↓' : '↑'
                ) : '—'}
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wide">Trend</div>
            </div>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/20 rounded-full border border-emerald-400/30">
              <Crown className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300 text-sm font-bold">Best: {Math.round(bestFootprint).toLocaleString()} kg</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 rounded-full border border-blue-400/30">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 text-sm font-bold">Avg: {Math.round(avgFootprint).toLocaleString()} kg</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-orange-500/20 rounded-full border border-orange-400/30">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              <span className="text-orange-300 text-sm font-bold">Range: {Math.round(worstFootprint - bestFootprint).toLocaleString()} kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="relative z-10 px-8 pb-20 h-[calc(100%-200px)]">
        {/* Y-Axis Labels */}
        <div className="absolute left-2 top-0 bottom-16 flex flex-col justify-between text-xs text-slate-400 font-mono">
          <span>{Math.round(maxFootprint).toLocaleString()}</span>
          <span>{Math.round(maxFootprint * 0.75).toLocaleString()}</span>
          <span>{Math.round(maxFootprint * 0.5).toLocaleString()}</span>
          <span>{Math.round(maxFootprint * 0.25).toLocaleString()}</span>
          <span>0</span>
        </div>

        {/* Average Reference Line */}
        <div 
          className="absolute left-12 right-8 border-t-2 border-dashed border-yellow-400/40 z-10"
          style={{ 
            top: `${(1 - avgFootprint / maxFootprint) * 85}%` 
          }}
        >
          <div className="absolute -top-6 right-0 text-xs text-yellow-400 bg-slate-800/80 px-3 py-1 rounded-full border border-yellow-400/30">
            Average: {Math.round(avgFootprint).toLocaleString()} kg
          </div>
        </div>

        {/* Bar Chart Container */}
        <div className="absolute bottom-16 left-12 right-8 flex items-end justify-center space-x-3 h-[85%]">
          {chartData.map((item, index) => {
            const barHeight = getBarHeight(item.footprint);
            const colors = getBarColor(item, index);
            const isHovered = hoveredBar === index;
            const isSelected = selectedBar === index;
            const isLatest = index === chartData.length - 1;
            const isBest = item.footprint === bestFootprint;
            const isWorst = item.footprint === worstFootprint;
            
            return (
              <div
                key={item.id}
                className="relative flex-1 max-w-20 group cursor-pointer"
                onMouseEnter={() => setHoveredBar(index)}
                onMouseLeave={() => setHoveredBar(null)}
                onClick={() => setSelectedBar(selectedBar === index ? null : index)}
              >
                {/* Hover/Selected Tooltip */}
                {(isHovered || isSelected) && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-6 z-40 animate-scale-in-dark">
                    <div className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl min-w-64">
                      <div className="text-center space-y-4">
                        <div className="flex items-center justify-center space-x-2">
                          <div className={`w-8 h-8 bg-gradient-to-r ${colors.gradient} rounded-xl flex items-center justify-center`}>
                            {getBarIcon(item, index)}
                          </div>
                          <div className="text-white font-bold text-xl">
                            {Math.round(item.footprint).toLocaleString()} kg CO₂
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-slate-300 font-medium">{item.fullDate}</div>
                          <div className="flex items-center justify-center space-x-4 text-sm">
                            <div className="text-center">
                              <div className="text-emerald-400 font-bold">#{item.rank}</div>
                              <div className="text-slate-400">Rank</div>
                            </div>
                            <div className="text-center">
                              <div className="text-blue-400 font-bold">{item.percentile}%</div>
                              <div className="text-slate-400">Percentile</div>
                            </div>
                          </div>
                        </div>
                        
                        {index > 0 && (
                          <div className={`text-sm font-bold px-3 py-1 rounded-full ${
                            item.footprint < chartData[index - 1].footprint 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30' 
                              : 'bg-orange-500/20 text-orange-400 border border-orange-400/30'
                          }`}>
                            {item.footprint < chartData[index - 1].footprint ? '↓' : '↑'} 
                            {Math.abs(Math.round(item.footprint - chartData[index - 1].footprint))} kg
                          </div>
                        )}
                        
                        {/* Special Badges */}
                        <div className="flex flex-wrap justify-center gap-2">
                          {isLatest && (
                            <div className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-400/30">
                              LATEST
                            </div>
                          )}
                          {isBest && (
                            <div className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full border border-blue-400/30">
                              BEST
                            </div>
                          )}
                          {isWorst && (
                            <div className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full border border-red-400/30">
                              HIGHEST
                            </div>
                          )}
                          {item.isImprovement && (
                            <div className="px-2 py-1 bg-teal-500/20 text-teal-400 text-xs font-bold rounded-full border border-teal-400/30">
                              IMPROVED
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900/95"></div>
                    </div>
                  </div>
                )}

                {/* Bar Base Glow */}
                <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full blur-sm" />
                
                {/* Main Bar */}
                <div
                  className={`relative w-full bg-gradient-to-t ${colors.gradient} rounded-t-2xl transition-all duration-1000 ease-out transform-gpu ${
                    isHovered || isSelected ? `scale-110 ${colors.glow} shadow-2xl ring-4 ${colors.ring}` : `${colors.glow} shadow-lg`
                  } ${isLatest ? `ring-2 ${colors.ring} ring-offset-2 ring-offset-slate-900` : ''}`}
                  style={{
                    height: animationPhase >= 2 ? `${barHeight}%` : '0%',
                    transitionDelay: `${index * 150}ms`,
                    boxShadow: isHovered || isSelected
                      ? `0 0 40px rgba(16, 185, 129, 0.6), 0 30px 60px rgba(0, 0, 0, 0.4)` 
                      : `0 0 25px rgba(16, 185, 129, 0.3), 0 15px 30px rgba(0, 0, 0, 0.3)`
                  }}
                >
                  {/* Bar Inner Effects */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 rounded-t-2xl" />
                  
                  {/* Animated Particles for Special Bars */}
                  {(isLatest || isBest) && animationPhase >= 3 && (
                    <div className="absolute inset-0 overflow-hidden rounded-t-2xl">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-white rounded-full animate-float-dark opacity-80"
                          style={{
                            left: `${20 + Math.random() * 60}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${3 + Math.random() * 2}s`
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Value Label */}
                  {(isHovered || isSelected || isLatest) && (
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white bg-slate-800/90 px-3 py-1 rounded-lg whitespace-nowrap border border-white/20 backdrop-blur-sm">
                      {(item.footprint / 1000).toFixed(1)}t
                    </div>
                  )}

                  {/* Icon Badge */}
                  {(isLatest || isBest || isWorst) && (
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                      <div className={`w-8 h-8 bg-gradient-to-r ${colors.gradient} rounded-xl flex items-center justify-center shadow-lg border border-white/20`}>
                        {getBarIcon(item, index)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Date Label */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center">
                  <div className="text-xs font-bold text-slate-300">{item.date}</div>
                  <div className="text-xs text-slate-500">#{item.rank}</div>
                </div>

                {/* Rank Badge */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    item.rank === 1 ? 'bg-yellow-500 text-yellow-900' :
                    item.rank === 2 ? 'bg-gray-400 text-gray-900' :
                    item.rank === 3 ? 'bg-orange-500 text-orange-900' :
                    'bg-slate-600 text-slate-300'
                  }`}>
                    {item.rank}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* X-Axis Line */}
        <div className="absolute bottom-16 left-12 right-8 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-8 right-8 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"></div>
            <span className="text-slate-300">Latest</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
            <span className="text-slate-300">Best</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full"></div>
            <span className="text-slate-300">Improved</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
            <span className="text-slate-300">Below Avg</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"></div>
            <span className="text-slate-300">Above Avg</span>
          </div>
        </div>
        
        <div className="text-slate-400">
          Showing {chartData.length} calculations • Click bars for details
        </div>
      </div>
    </div>
  );
}