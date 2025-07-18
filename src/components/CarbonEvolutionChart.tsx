import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, Target, Zap } from 'lucide-react';
import { getCalculationHistory } from '../utils/storage';
import { format } from 'date-fns';

interface CarbonEvolutionChartProps {
  currentFootprint: number;
}

export default function CarbonEvolutionChart({ currentFootprint }: CarbonEvolutionChartProps) {
  const [calculations, setCalculations] = useState(getCalculationHistory());
  const [animationStarted, setAnimationStarted] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  useEffect(() => {
    // Refresh calculations when component mounts
    setCalculations(getCalculationHistory());
    
    // Start animation after a short delay
    const timer = setTimeout(() => {
      setAnimationStarted(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [currentFootprint]);

  // Prepare data for visualization
  const chartData = [...calculations]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .slice(-12) // Show last 12 calculations
    .map((calc, index) => ({
      ...calc,
      index,
      month: format(new Date(calc.timestamp), 'MMM'),
      day: format(new Date(calc.timestamp), 'dd'),
    }));

  // Add current calculation if it's different from the last one
  if (currentFootprint > 0 && (chartData.length === 0 || chartData[chartData.length - 1].footprint !== currentFootprint)) {
    chartData.push({
      id: 'current',
      timestamp: new Date(),
      footprint: currentFootprint,
      data: {} as any,
      usage: {} as any,
      index: chartData.length,
      month: format(new Date(), 'MMM'),
      day: format(new Date(), 'dd'),
    });
  }

  const maxFootprint = Math.max(...chartData.map(d => d.footprint), 15000);
  const minFootprint = Math.min(...chartData.map(d => d.footprint));
  const avgFootprint = chartData.reduce((sum, d) => sum + d.footprint, 0) / chartData.length;

  const getBarColor = (footprint: number, index: number) => {
    const isLatest = index === chartData.length - 1;
    const isImproving = index > 0 && footprint < chartData[index - 1].footprint;
    
    if (isLatest) {
      return 'from-emerald-400 via-emerald-500 to-emerald-600';
    } else if (isImproving) {
      return 'from-blue-400 via-blue-500 to-blue-600';
    } else if (footprint > avgFootprint) {
      return 'from-orange-400 via-orange-500 to-orange-600';
    } else {
      return 'from-teal-400 via-teal-500 to-teal-600';
    }
  };

  const getBarHeight = (footprint: number) => {
    return Math.max(10, (footprint / maxFootprint) * 100);
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <div className="text-center space-y-4">
          <Calendar className="w-12 h-12 mx-auto opacity-50" />
          <p className="text-lg">No calculation history yet</p>
          <p className="text-sm">Complete your first calculation to see the evolution</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Chart Title and Stats */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span>Carbon Evolution</span>
            </h3>
            <p className="text-slate-300 text-sm">Your footprint journey over time</p>
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-center">
              <div className="text-emerald-400 font-bold text-lg">{chartData.length}</div>
              <div className="text-slate-400">Records</div>
            </div>
            <div className="text-center">
              <div className="text-blue-400 font-bold text-lg">{Math.round(avgFootprint).toLocaleString()}</div>
              <div className="text-slate-400">Avg kg CO₂</div>
            </div>
            <div className="text-center">
              <div className={`font-bold text-lg ${
                chartData.length > 1 && chartData[chartData.length - 1].footprint < chartData[chartData.length - 2].footprint
                  ? 'text-emerald-400' : 'text-orange-400'
              }`}>
                {chartData.length > 1 ? (
                  chartData[chartData.length - 1].footprint < chartData[chartData.length - 2].footprint ? '↓' : '↑'
                ) : '—'}
              </div>
              <div className="text-slate-400">Trend</div>
            </div>
          </div>
        </div>
      </div>

      {/* Y-Axis Labels */}
      <div className="absolute left-2 top-20 bottom-16 flex flex-col justify-between text-xs text-slate-400 z-10">
        <span>{Math.round(maxFootprint).toLocaleString()}</span>
        <span>{Math.round(maxFootprint * 0.75).toLocaleString()}</span>
        <span>{Math.round(maxFootprint * 0.5).toLocaleString()}</span>
        <span>{Math.round(maxFootprint * 0.25).toLocaleString()}</span>
        <span>0</span>
      </div>

      {/* Average Line */}
      <div 
        className="absolute left-12 right-4 border-t-2 border-dashed border-yellow-400/40 z-10"
        style={{ 
          top: `${20 + (1 - avgFootprint / maxFootprint) * (100 - 20 - 16)}%` 
        }}
      >
        <div className="absolute -top-6 right-0 text-xs text-yellow-400 bg-slate-800/80 px-2 py-1 rounded">
          Avg: {Math.round(avgFootprint).toLocaleString()} kg
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="absolute bottom-16 left-12 right-4 flex items-end justify-center space-x-4 h-[calc(100%-140px)]">
        {chartData.map((data, index) => {
          const barHeight = getBarHeight(data.footprint);
          const barColor = getBarColor(data.footprint, index);
          const isHovered = hoveredBar === index;
          const isLatest = index === chartData.length - 1;
          
          return (
            <div
              key={data.id}
              className="relative flex-1 max-w-16 group cursor-pointer"
              onMouseEnter={() => setHoveredBar(index)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {/* Hover Tooltip */}
              {isHovered && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 z-30 animate-scale-in-dark">
                  <div className="bg-slate-900/95 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-2xl min-w-48">
                    <div className="text-center space-y-2">
                      <div className="text-white font-bold text-lg">
                        {Math.round(data.footprint).toLocaleString()} kg CO₂
                      </div>
                      <div className="text-slate-300 text-sm">
                        {format(new Date(data.timestamp), 'MMM dd, yyyy')}
                      </div>
                      {index > 0 && (
                        <div className={`text-sm font-medium ${
                          data.footprint < chartData[index - 1].footprint 
                            ? 'text-emerald-400' : 'text-orange-400'
                        }`}>
                          {data.footprint < chartData[index - 1].footprint ? '↓' : '↑'} 
                          {Math.abs(Math.round(data.footprint - chartData[index - 1].footprint))} kg
                        </div>
                      )}
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900/95"></div>
                  </div>
                </div>
              )}

              {/* Bar Base Glow */}
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full blur-sm" />
              
              {/* Main Bar */}
              <div
                className={`relative w-full bg-gradient-to-t ${barColor} rounded-t-lg transition-all duration-1000 ease-out transform-gpu ${
                  isHovered ? 'scale-110 shadow-2xl' : ''
                } ${isLatest ? 'ring-2 ring-emerald-400/50 ring-offset-2 ring-offset-slate-900' : ''}`}
                style={{
                  height: animationStarted ? `${barHeight}%` : '0%',
                  transitionDelay: `${index * 100}ms`,
                  boxShadow: isHovered 
                    ? `0 0 30px rgba(16, 185, 129, 0.4), 0 20px 40px rgba(0, 0, 0, 0.3)` 
                    : `0 0 20px rgba(16, 185, 129, 0.2), 0 10px 20px rgba(0, 0, 0, 0.2)`
                }}
              >
                {/* Bar Inner Glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 rounded-t-lg" />
                
                {/* Animated Particles */}
                {isLatest && animationStarted && (
                  <div className="absolute inset-0 overflow-hidden rounded-t-lg">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full animate-float-dark opacity-60"
                        style={{
                          left: `${20 + Math.random() * 60}%`,
                          animationDelay: `${Math.random() * 3}s`,
                          animationDuration: `${3 + Math.random() * 2}s`
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Value Label on Bar */}
                {(isHovered || isLatest) && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white bg-slate-800/80 px-2 py-1 rounded whitespace-nowrap">
                    {Math.round(data.footprint / 1000 * 10) / 10}t
                  </div>
                )}
              </div>

              {/* Month Label */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                <div className="text-xs font-medium text-slate-300">{data.month}</div>
                <div className="text-xs text-slate-500">{data.day}</div>
              </div>

              {/* Latest Indicator */}
              {isLatest && (
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center space-x-1 bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full text-xs font-bold border border-emerald-400/30">
                    <Zap className="w-3 h-3" />
                    <span>Latest</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* X-Axis Line */}
      <div className="absolute bottom-16 left-12 right-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Progress Indicators */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"></div>
            <span>Current</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
            <span>Improving</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"></div>
            <span>Above Average</span>
          </div>
        </div>
        
        <div className="text-slate-500">
          Showing last {chartData.length} calculations
        </div>
      </div>
    </div>
  );
}