
import React, { useState, useEffect } from 'react';
import { Car, Home, Utensils, Package, Trash2, Zap, TrendingUp, Target, Sparkles, Flame, Star, Award, Globe, Layers, Wind, ArrowUp, ArrowDown } from 'lucide-react';
import { calculateTotalFootprint } from '../utils/carbonCalculations';

interface CalculatorProps {
  onFootprintChange: (footprint: number) => void;
}

export default function Calculator({ onFootprintChange }: CalculatorProps) {
  const [usage, setUsage] = useState({
    transport: {
      carKm: 100,
      carType: 'petrol',
      publicTransportKm: 50,
      flightKm: 20,
      bikeKm: 30
    },
    energy: {
      electricityKwh: 350,
      heatingKwh: 200,
      heatingType: 'gas'
    },
    lifestyle: {
      diet: 'omnivore' as const,
      shopping: 2,
      waste: 15
    }
  });

  const [footprint, setFootprint] = useState(0);
  const [previousFootprint, setPreviousFootprint] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(() => {
      const carbonData = {
        transportation: {
          car: usage.transport.carKm,
          publicTransport: usage.transport.publicTransportKm,
          flights: usage.transport.flightKm,
          bike: usage.transport.bikeKm
        },
        energy: {
          electricity: usage.energy.electricityKwh,
          heating: usage.energy.heatingKwh,
          cooling: 0
        },
        lifestyle: {
          diet: usage.lifestyle.diet,
          shopping: usage.lifestyle.shopping,
          waste: usage.lifestyle.waste
        }
      };

      setPreviousFootprint(footprint);
      const total = calculateTotalFootprint(carbonData, usage);
      setFootprint(total);
      onFootprintChange(total);
      setIsCalculating(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [usage, onFootprintChange]);

  const updateUsage = (category: string, field: string, value: any) => {
    setUsage(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const footprintChange = footprint - previousFootprint;
  const globalAverage = 7500;
  const parisTarget = 2300;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 3D Background Layers */}
      <div className="fixed inset-0 -z-10">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800" />
        
        {/* 3D Floating Elements */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
              }}
            >
              <div 
                className="w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-400/10 rounded-full blur-2xl animate-pulse transform-gpu"
                style={{
                  transform: `translateZ(${Math.random() * 100}px) rotateX(${Math.random() * 360}deg) rotateY(${Math.random() * 360}deg)`,
                  animationDuration: `${8 + Math.random() * 10}s`
                }}
              />
            </div>
          ))}
        </div>

        {/* Morphing Shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl animate-pulse transform-gpu" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-l from-blue-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl animate-pulse transform-gpu" style={{ animationDuration: '12s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-conic from-emerald-500/5 via-teal-500/10 to-cyan-500/5 rounded-full blur-3xl animate-spin" style={{ animationDuration: '30s' }} />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-emerald-400/60 rounded-full animate-float-dark"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 20}s`,
                animationDuration: `${15 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section - Floating Carbon Display */}
        <div className="relative min-h-screen flex items-center justify-center mb-20">
          <div className="text-center space-y-12 transform-gpu">
            {/* Title with 3D effect */}
            <div className="space-y-6">
              <div className="relative inline-block">
                <h1 className="text-8xl lg:text-9xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-2xl transform-gpu hover:scale-105 transition-transform duration-700">
                  {Math.round(footprint).toLocaleString()}
                </h1>
                {/* 3D shadow effect */}
                <div className="absolute inset-0 text-8xl lg:text-9xl font-black text-slate-800/20 transform translate-x-2 translate-y-2 -z-10">
                  {Math.round(footprint).toLocaleString()}
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-300 tracking-wide">
                kg CO₂ per year
              </p>
            </div>

            {/* Change Indicator */}
            {footprintChange !== 0 && (
              <div className="flex items-center justify-center space-x-4 text-2xl font-bold">
                {footprintChange > 0 ? (
                  <ArrowUp className="w-8 h-8 text-red-400 animate-bounce" />
                ) : (
                  <ArrowDown className="w-8 h-8 text-emerald-400 animate-bounce" />
                )}
                <span className={footprintChange > 0 ? 'text-red-400' : 'text-emerald-400'}>
                  {footprintChange > 0 ? '+' : ''}{Math.round(footprintChange)} kg CO₂
                </span>
              </div>
            )}

            {/* Floating Comparison Metrics */}
            <div className="flex flex-wrap justify-center gap-12 mt-16">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-xl transform-gpu group-hover:scale-110 transition-transform duration-500" />
                <div className="relative bg-blue-500/10 backdrop-blur-3xl border border-blue-400/30 rounded-full px-8 py-6 transform-gpu group-hover:scale-105 transition-all duration-500">
                  <div className="text-center space-y-2">
                    <Globe className="w-8 h-8 text-blue-400 mx-auto animate-pulse" />
                    <div className="text-3xl font-black text-blue-300">
                      {((footprint / globalAverage) * 100).toFixed(0)}%
                    </div>
                    <p className="text-blue-200 font-semibold">Global Avg</p>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-full blur-xl transform-gpu group-hover:scale-110 transition-transform duration-500" />
                <div className="relative bg-emerald-500/10 backdrop-blur-3xl border border-emerald-400/30 rounded-full px-8 py-6 transform-gpu group-hover:scale-105 transition-all duration-500">
                  <div className="text-center space-y-2">
                    <Target className="w-8 h-8 text-emerald-400 mx-auto animate-pulse" />
                    <div className="text-3xl font-black text-emerald-300">
                      {((parisTarget / footprint) * 100).toFixed(0)}%
                    </div>
                    <p className="text-emerald-200 font-semibold">Paris Target</p>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl transform-gpu group-hover:scale-110 transition-transform duration-500" />
                <div className="relative bg-purple-500/10 backdrop-blur-3xl border border-purple-400/30 rounded-full px-8 py-6 transform-gpu group-hover:scale-105 transition-all duration-500">
                  <div className="text-center space-y-2">
                    <Star className="w-8 h-8 text-purple-400 mx-auto animate-pulse" />
                    <div className="text-3xl font-black text-purple-300">
                      {Math.round(footprint / 12).toLocaleString()}
                    </div>
                    <p className="text-purple-200 font-semibold">Monthly</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Input Sections */}
        <div className="space-y-32">
          {/* Transportation - Flowing Wave Design */}
          <div 
            className={`relative group transition-all duration-1000 transform-gpu ${activeSection === 'transport' ? 'scale-105' : ''}`}
            onMouseEnter={() => setActiveSection('transport')}
            onMouseLeave={() => setActiveSection(null)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/10 to-purple-500/5 rounded-[3rem] blur-2xl transform-gpu group-hover:blur-xl transition-all duration-700" />
            
            <div className="relative bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-12 transform-gpu">
              {/* Floating Icon */}
              <div className="absolute -top-8 left-12">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur-lg opacity-60 animate-pulse transform-gpu" />
                  <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 via-blue-400 to-indigo-600 rounded-3xl shadow-2xl transform-gpu group-hover:rotate-12 transition-transform duration-500">
                    <Car className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <h3 className="text-4xl font-black text-white mb-4 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Transportation
                </h3>
                <p className="text-slate-300 text-xl mb-12">Shape your mobility carbon footprint</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="group/input">
                      <label className="block text-lg font-bold text-slate-200 mb-4 transform-gpu group-hover/input:text-blue-300 transition-colors duration-300">
                        Car Usage (km/month)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={usage.transport.carKm}
                          onChange={(e) => updateUsage('transport', 'carKm', Number(e.target.value))}
                          className="w-full bg-slate-800/50 backdrop-blur-xl border-2 border-slate-600/30 rounded-2xl px-6 py-4 text-white text-lg focus:border-blue-400/50 focus:outline-none focus:ring-4 focus:ring-blue-400/20 transition-all duration-300 transform-gpu hover:bg-slate-700/50"
                          placeholder="Enter kilometers"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent rounded-2xl pointer-events-none opacity-0 group-hover/input:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>

                    <div className="group/input">
                      <label className="block text-lg font-bold text-slate-200 mb-4 transform-gpu group-hover/input:text-blue-300 transition-colors duration-300">
                        Vehicle Type
                      </label>
                      <select
                        value={usage.transport.carType}
                        onChange={(e) => updateUsage('transport', 'carType', e.target.value)}
                        className="w-full bg-slate-800/50 backdrop-blur-xl border-2 border-slate-600/30 rounded-2xl px-6 py-4 text-white text-lg focus:border-blue-400/50 focus:outline-none focus:ring-4 focus:ring-blue-400/20 transition-all duration-300 transform-gpu hover:bg-slate-700/50"
                      >
                        <option value="petrol">🚗 Petrol Vehicle</option>
                        <option value="diesel">🚙 Diesel Vehicle</option>
                        <option value="electric">⚡ Electric Vehicle</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="group/input">
                      <label className="block text-lg font-bold text-slate-200 mb-4 transform-gpu group-hover/input:text-blue-300 transition-colors duration-300">
                        Public Transport (km/month)
                      </label>
                      <input
                        type="number"
                        value={usage.transport.publicTransportKm}
                        onChange={(e) => updateUsage('transport', 'publicTransportKm', Number(e.target.value))}
                        className="w-full bg-slate-800/50 backdrop-blur-xl border-2 border-slate-600/30 rounded-2xl px-6 py-4 text-white text-lg focus:border-blue-400/50 focus:outline-none focus:ring-4 focus:ring-blue-400/20 transition-all duration-300 transform-gpu hover:bg-slate-700/50"
                        placeholder="Bus, train, metro"
                      />
                    </div>

                    <div className="group/input">
                      <label className="block text-lg font-bold text-slate-200 mb-4 transform-gpu group-hover/input:text-blue-300 transition-colors duration-300">
                        Flights (km/month)
                      </label>
                      <input
                        type="number"
                        value={usage.transport.flightKm}
                        onChange={(e) => updateUsage('transport', 'flightKm', Number(e.target.value))}
                        className="w-full bg-slate-800/50 backdrop-blur-xl border-2 border-slate-600/30 rounded-2xl px-6 py-4 text-white text-lg focus:border-blue-400/50 focus:outline-none focus:ring-4 focus:ring-blue-400/20 transition-all duration-300 transform-gpu hover:bg-slate-700/50"
                        placeholder="Air travel distance"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Energy - Organic Flow Design */}
          <div 
            className={`relative group transition-all duration-1000 transform-gpu ${activeSection === 'energy' ? 'scale-105' : ''}`}
            onMouseEnter={() => setActiveSection('energy')}
            onMouseLeave={() => setActiveSection(null)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-red-500/10 to-pink-500/5 rounded-[3rem] blur-2xl transform-gpu group-hover:blur-xl transition-all duration-700" />
            
            <div className="relative bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-12 transform-gpu">
              <div className="absolute -top-8 left-12">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl blur-lg opacity-60 animate-pulse transform-gpu" />
                  <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 via-orange-400 to-red-600 rounded-3xl shadow-2xl transform-gpu group-hover:rotate-12 transition-transform duration-500">
                    <Home className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <h3 className="text-4xl font-black text-white mb-4 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  Home Energy
                </h3>
                <p className="text-slate-300 text-xl mb-12">Power your living space sustainably</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="group/input">
                    <label className="block text-lg font-bold text-slate-200 mb-4 transform-gpu group-hover/input:text-orange-300 transition-colors duration-300">
                      Electricity (kWh/month)
                    </label>
                    <input
                      type="number"
                      value={usage.energy.electricityKwh}
                      onChange={(e) => updateUsage('energy', 'electricityKwh', Number(e.target.value))}
                      className="w-full bg-slate-800/50 backdrop-blur-xl border-2 border-slate-600/30 rounded-2xl px-6 py-4 text-white text-lg focus:border-orange-400/50 focus:outline-none focus:ring-4 focus:ring-orange-400/20 transition-all duration-300 transform-gpu hover:bg-slate-700/50"
                      placeholder="Monthly electricity usage"
                    />
                    <p className="text-slate-400 mt-3 flex items-center space-x-2">
                      <Zap className="w-4 h-4" />
                      <span>Average household: 300-400 kWh/month</span>
                    </p>
                  </div>

                  <div className="group/input">
                    <label className="block text-lg font-bold text-slate-200 mb-4 transform-gpu group-hover/input:text-orange-300 transition-colors duration-300">
                      Heating (kWh/month)
                    </label>
                    <input
                      type="number"
                      value={usage.energy.heatingKwh}
                      onChange={(e) => updateUsage('energy', 'heatingKwh', Number(e.target.value))}
                      className="w-full bg-slate-800/50 backdrop-blur-xl border-2 border-slate-600/30 rounded-2xl px-6 py-4 text-white text-lg focus:border-orange-400/50 focus:outline-none focus:ring-4 focus:ring-orange-400/20 transition-all duration-300 transform-gpu hover:bg-slate-700/50"
                      placeholder="Monthly heating usage"
                    />
                    <p className="text-slate-400 mt-3 flex items-center space-x-2">
                      <Flame className="w-4 h-4" />
                      <span>Varies by season and insulation</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lifestyle - Fluid Design */}
          <div 
            className={`relative group transition-all duration-1000 transform-gpu ${activeSection === 'lifestyle' ? 'scale-105' : ''}`}
            onMouseEnter={() => setActiveSection('lifestyle')}
            onMouseLeave={() => setActiveSection(null)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-green-500/10 to-teal-500/5 rounded-[3rem] blur-2xl transform-gpu group-hover:blur-xl transition-all duration-700" />
            
            <div className="relative bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-12 transform-gpu">
              <div className="absolute -top-8 left-12">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600 rounded-3xl blur-lg opacity-60 animate-pulse transform-gpu" />
                  <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 via-emerald-400 to-green-600 rounded-3xl shadow-2xl transform-gpu group-hover:rotate-12 transition-transform duration-500">
                    <Utensils className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <h3 className="text-4xl font-black text-white mb-4 bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                  Lifestyle Choices
                </h3>
                <p className="text-slate-300 text-xl mb-12">Define your daily environmental impact</p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="group/input">
                    <label className="block text-lg font-bold text-slate-200 mb-4 transform-gpu group-hover/input:text-emerald-300 transition-colors duration-300">
                      Diet Type
                    </label>
                    <select
                      value={usage.lifestyle.diet}
                      onChange={(e) => updateUsage('lifestyle', 'diet', e.target.value)}
                      className="w-full bg-slate-800/50 backdrop-blur-xl border-2 border-slate-600/30 rounded-2xl px-6 py-4 text-white text-lg focus:border-emerald-400/50 focus:outline-none focus:ring-4 focus:ring-emerald-400/20 transition-all duration-300 transform-gpu hover:bg-slate-700/50"
                    >
                      <option value="vegan">🌱 Vegan</option>
                      <option value="vegetarian">🥗 Vegetarian</option>
                      <option value="pescatarian">🐟 Pescatarian</option>
                      <option value="omnivore">🥩 Omnivore</option>
                    </select>
                  </div>

                  <div className="group/input">
                    <label className="block text-lg font-bold text-slate-200 mb-4 transform-gpu group-hover/input:text-emerald-300 transition-colors duration-300">
                      Shopping Frequency
                    </label>
                    <select
                      value={usage.lifestyle.shopping}
                      onChange={(e) => updateUsage('lifestyle', 'shopping', Number(e.target.value))}
                      className="w-full bg-slate-800/50 backdrop-blur-xl border-2 border-slate-600/30 rounded-2xl px-6 py-4 text-white text-lg focus:border-emerald-400/50 focus:outline-none focus:ring-4 focus:ring-emerald-400/20 transition-all duration-300 transform-gpu hover:bg-slate-700/50"
                    >
                      <option value={1}>🛍️ Low (minimal)</option>
                      <option value={2}>🛒 Medium (average)</option>
                      <option value={3}>🛍️ High (frequent)</option>
                    </select>
                  </div>

                  <div className="group/input">
                    <label className="block text-lg font-bold text-slate-200 mb-4 transform-gpu group-hover/input:text-emerald-300 transition-colors duration-300">
                      Waste (kg/month)
                    </label>
                    <input
                      type="number"
                      value={usage.lifestyle.waste}
                      onChange={(e) => updateUsage('lifestyle', 'waste', Number(e.target.value))}
                      className="w-full bg-slate-800/50 backdrop-blur-xl border-2 border-slate-600/30 rounded-2xl px-6 py-4 text-white text-lg focus:border-emerald-400/50 focus:outline-none focus:ring-4 focus:ring-emerald-400/20 transition-all duration-300 transform-gpu hover:bg-slate-700/50"
                      placeholder="Monthly waste production"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions - Floating Cards */}
          <div className="relative">
            <div className="text-center mb-16">
              <h3 className="text-5xl font-black text-white mb-6 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Impact Actions
              </h3>
              <p className="text-slate-300 text-xl">Discover powerful ways to reduce your footprint</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { action: 'Switch to Electric', saving: '2,400 kg CO₂/year', icon: '⚡', gradient: 'from-blue-500 via-blue-400 to-indigo-500', delay: '0s' },
                { action: 'Reduce Flights 50%', saving: '1,800 kg CO₂/year', icon: '✈️', gradient: 'from-purple-500 via-purple-400 to-pink-500', delay: '0.2s' },
                { action: 'Go Vegetarian', saving: '1,200 kg CO₂/year', icon: '🌱', gradient: 'from-emerald-500 via-emerald-400 to-green-500', delay: '0.4s' }
              ].map((item, index) => (
                <div 
                  key={index} 
                  className="group relative transform-gpu hover:scale-105 transition-all duration-700"
                  style={{ animationDelay: item.delay }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient}/20 rounded-3xl blur-xl transform-gpu group-hover:blur-2xl group-hover:scale-110 transition-all duration-700`} />
                  <div className={`relative bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 transform-gpu hover:border-white/20 transition-all duration-500`}>
                    <div className="text-center space-y-6">
                      <div className="text-6xl transform-gpu group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                        {item.icon}
                      </div>
                      <h4 className="font-black text-white text-2xl group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-teal-400 group-hover:bg-clip-text transition-all duration-500">
                        {item.action}
                      </h4>
                      <p className="text-emerald-300 font-bold text-lg">
                        {item.saving}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
