import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Target, Calendar, Zap, Award, Star } from 'lucide-react';
import { format } from 'date-fns';

interface DataPoint {
  id: string;
  timestamp: Date;
  footprint: number;
  index: number;
  date: string;
  fullDate: string;
}

interface AnimatedLineChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  showAnimation?: boolean;
}

export default function AnimatedLineChart({ 
  data, 
  width = 800, 
  height = 400, 
  showAnimation = true 
}: AnimatedLineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [showPoints, setShowPoints] = useState(false);

  const padding = { top: 40, right: 60, bottom: 60, left: 80 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate scales
  const maxFootprint = Math.max(...data.map(d => d.footprint), 15000);
  const minFootprint = Math.min(...data.map(d => d.footprint), 0);
  const footprintRange = maxFootprint - minFootprint;

  const xScale = (index: number) => (index / Math.max(data.length - 1, 1)) * chartWidth;
  const yScale = (footprint: number) => chartHeight - ((footprint - minFootprint) / footprintRange) * chartHeight;

  // Generate path data
  const generatePath = (progress: number = 1) => {
    if (data.length === 0) return '';
    
    const visiblePoints = Math.ceil(data.length * progress);
    const visibleData = data.slice(0, visiblePoints);
    
    if (visibleData.length === 0) return '';
    
    let path = `M ${xScale(0)} ${yScale(visibleData[0].footprint)}`;
    
    for (let i = 1; i < visibleData.length; i++) {
      const x = xScale(i);
      const y = yScale(visibleData[i].footprint);
      
      // Use smooth curves for better aesthetics
      if (i === 1) {
        path += ` L ${x} ${y}`;
      } else {
        const prevX = xScale(i - 1);
        const prevY = yScale(visibleData[i - 1].footprint);
        const cpX1 = prevX + (x - prevX) * 0.5;
        const cpY1 = prevY;
        const cpX2 = prevX + (x - prevX) * 0.5;
        const cpY2 = y;
        path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x} ${y}`;
      }
    }
    
    return path;
  };

  // Generate area path for gradient fill
  const generateAreaPath = (progress: number = 1) => {
    if (data.length === 0) return '';
    
    const visiblePoints = Math.ceil(data.length * progress);
    const visibleData = data.slice(0, visiblePoints);
    
    if (visibleData.length === 0) return '';
    
    const linePath = generatePath(progress);
    const lastX = xScale(visiblePoints - 1);
    
    return `${linePath} L ${lastX} ${chartHeight} L ${xScale(0)} ${chartHeight} Z`;
  };

  // Animation effect
  useEffect(() => {
    if (!showAnimation) {
      setAnimationProgress(1);
      setShowPoints(true);
      return;
    }

    const duration = 2000; // 2 seconds
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      setAnimationProgress(easeOutCubic);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Show points after line animation completes
        setTimeout(() => setShowPoints(true), 300);
      }
    };

    const timer = setTimeout(() => {
      requestAnimationFrame(animate);
    }, 500);

    return () => clearTimeout(timer);
  }, [data, showAnimation]);

  // Calculate statistics
  const avgFootprint = data.reduce((sum, d) => sum + d.footprint, 0) / data.length;
  const trend = data.length > 1 ? data[data.length - 1].footprint - data[0].footprint : 0;
  const bestFootprint = Math.min(...data.map(d => d.footprint));
  const worstFootprint = Math.max(...data.map(d => d.footprint));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-gray-200">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No Data Available</h3>
          <p className="text-gray-600">Start tracking your carbon footprint to see the trend</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span>Carbon Footprint Trend</span>
            </h3>
            <p className="text-gray-600">Your journey towards a sustainable future</p>
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{data.length}</div>
              <div className="text-gray-500">Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{Math.round(avgFootprint).toLocaleString()}</div>
              <div className="text-gray-500">Avg kg CO₂</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${trend < 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                {trend < 0 ? '↓' : '↑'} {Math.abs(Math.round(trend)).toLocaleString()}
              </div>
              <div className="text-gray-500">Trend</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative p-6">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="w-full h-auto"
          viewBox={`0 0 ${width} ${height}`}
        >
          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
            </linearGradient>

            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Grid Lines */}
          <g transform={`translate(${padding.left}, ${padding.top})`}>
            {/* Horizontal grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = chartHeight * ratio;
              const value = maxFootprint - (footprintRange * ratio);
              return (
                <g key={i}>
                  <line
                    x1={0}
                    y1={y}
                    x2={chartWidth}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                    opacity="0.5"
                  />
                  <text
                    x={-10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-xs fill-gray-500"
                  >
                    {Math.round(value).toLocaleString()}
                  </text>
                </g>
              );
            })}

            {/* Average line */}
            <line
              x1={0}
              y1={yScale(avgFootprint)}
              x2={chartWidth}
              y2={yScale(avgFootprint)}
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="8,4"
              opacity="0.7"
            />
            <text
              x={chartWidth - 5}
              y={yScale(avgFootprint) - 8}
              textAnchor="end"
              className="text-xs fill-orange-600 font-medium"
            >
              Average: {Math.round(avgFootprint).toLocaleString()} kg
            </text>

            {/* Area fill */}
            <path
              d={generateAreaPath(animationProgress)}
              fill="url(#areaGradient)"
              opacity="0.6"
            />

            {/* Main line */}
            <path
              d={generatePath(animationProgress)}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              style={{
                strokeDasharray: showAnimation ? `${animationProgress * 2000} 2000` : 'none',
                strokeDashoffset: showAnimation ? `${(1 - animationProgress) * 2000}` : '0'
              }}
            />

            {/* Data points */}
            {showPoints && data.map((point, index) => {
              const x = xScale(index);
              const y = yScale(point.footprint);
              const isHovered = hoveredPoint === index;
              const isFirst = index === 0;
              const isLast = index === data.length - 1;
              const isBest = point.footprint === bestFootprint;
              const isWorst = point.footprint === worstFootprint;

              return (
                <g key={point.id}>
                  {/* Point glow effect */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 12 : 8}
                    fill={
                      isLast ? '#10b981' :
                      isBest ? '#3b82f6' :
                      isWorst ? '#ef4444' :
                      '#8b5cf6'
                    }
                    opacity="0.2"
                    className="transition-all duration-300"
                  />
                  
                  {/* Main point */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 6 : 4}
                    fill={
                      isLast ? '#10b981' :
                      isBest ? '#3b82f6' :
                      isWorst ? '#ef4444' :
                      '#8b5cf6'
                    }
                    stroke="white"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-300 hover:scale-125"
                    onMouseEnter={() => setHoveredPoint(index)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    style={{
                      animation: showPoints ? `pointAppear 0.5s ease-out ${index * 0.1}s both` : 'none'
                    }}
                  />

                  {/* Special badges */}
                  {(isLast || isBest || isWorst) && (
                    <g>
                      <circle
                        cx={x + 15}
                        cy={y - 15}
                        r="10"
                        fill={
                          isLast ? '#10b981' :
                          isBest ? '#3b82f6' :
                          '#ef4444'
                        }
                        className="animate-pulse"
                      />
                      <text
                        x={x + 15}
                        y={y - 11}
                        textAnchor="middle"
                        className="text-xs fill-white font-bold"
                      >
                        {isLast ? '★' : isBest ? '↓' : '↑'}
                      </text>
                    </g>
                  )}

                  {/* Hover tooltip */}
                  {isHovered && (
                    <g>
                      <rect
                        x={x - 60}
                        y={y - 80}
                        width="120"
                        height="60"
                        rx="8"
                        fill="rgba(0, 0, 0, 0.9)"
                        stroke="rgba(255, 255, 255, 0.2)"
                        strokeWidth="1"
                      />
                      <text
                        x={x}
                        y={y - 55}
                        textAnchor="middle"
                        className="text-sm fill-white font-bold"
                      >
                        {Math.round(point.footprint).toLocaleString()} kg
                      </text>
                      <text
                        x={x}
                        y={y - 40}
                        textAnchor="middle"
                        className="text-xs fill-gray-300"
                      >
                        {format(point.timestamp, 'MMM dd, yyyy')}
                      </text>
                      <text
                        x={x}
                        y={y - 25}
                        textAnchor="middle"
                        className="text-xs fill-gray-400"
                      >
                        {index > 0 ? 
                          `${point.footprint > data[index - 1].footprint ? '+' : ''}${Math.round(point.footprint - data[index - 1].footprint)} kg` :
                          'First record'
                        }
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* X-axis labels */}
            {data.map((point, index) => {
              if (data.length > 10 && index % Math.ceil(data.length / 8) !== 0) return null;
              
              const x = xScale(index);
              return (
                <g key={`label-${index}`}>
                  <text
                    x={x}
                    y={chartHeight + 20}
                    textAnchor="middle"
                    className="text-xs fill-gray-600"
                  >
                    {point.date}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Axis labels */}
          <text
            x={padding.left + chartWidth / 2}
            y={height - 10}
            textAnchor="middle"
            className="text-sm fill-gray-700 font-medium"
          >
            Timeline
          </text>
          
          <text
            x={20}
            y={padding.top + chartHeight / 2}
            textAnchor="middle"
            className="text-sm fill-gray-700 font-medium"
            transform={`rotate(-90, 20, ${padding.top + chartHeight / 2})`}
          >
            Carbon Footprint (kg CO₂)
          </text>
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-8 mt-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
            <span className="text-gray-600">Footprint Trend</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            <span className="text-gray-600">Average</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
            <span className="text-gray-600">Latest</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Best</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-gray-600">Highest</span>
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes pointAppear {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}