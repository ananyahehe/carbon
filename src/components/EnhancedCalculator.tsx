import React, { useState, useEffect, useCallback } from 'react';
import { Car, Home, Utensils, Package, Trash2, Zap, TrendingUp, Target, Sparkles, Flame, Star, Award, Globe, Save, RotateCcw, MapPin, Navigation } from 'lucide-react';
import { calculateTotalFootprint } from '../utils/carbonCalculations';
import { validateInput, sanitizeNumericInput, VALIDATION_RULES, INPUT_TOOLTIPS } from '../utils/validation';
import { saveCalculation, getUserSettings, saveUserSettings } from '../utils/storage';
import { gpsTracker, calculateCityDistance } from '../utils/gpsTracking';
import InputField from './InputField';
import VehicleSelector from './VehicleSelector';
import RouteCalculator from './RouteCalculator';
import ImmersiveCarbonChart from './ImmersiveCarbonChart';

interface EnhancedCalculatorProps {
  onFootprintChange: (footprint: number) => void;
}

export default function EnhancedCalculator({ onFootprintChange }: EnhancedCalculatorProps) {
  // Load saved data from localStorage on component mount
  const loadSavedData = () => {
    try {
      const saved = localStorage.getItem('calculator_data');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
    return {
      transport: {
        carKm: '',
        carType: 'petrol',
        carEfficiency: 8.0,
        publicTransportKm: '',
        flightKm: '',
        bikeKm: ''
      },
      energy: {
        electricityKwh: '',
        heatingKwh: '',
        heatingType: 'gas'
      },
      lifestyle: {
        diet: 'omnivore' as const,
        shopping: 2,
        waste: ''
      }
    };
  };

  const [usage, setUsage] = useState(loadSavedData);

  const [footprint, setFootprint] = useState<number | null>(null);
  const [previousFootprint, setPreviousFootprint] = useState(0);
  const [isCalculated, setIsCalculated] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string[]}>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{city: string; country: string} | null>(null);
  const [showRouteCalculator, setShowRouteCalculator] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  const settings = getUserSettings();

  // Save data to localStorage whenever usage changes
  useEffect(() => {
    try {
      localStorage.setItem('calculator_data', JSON.stringify(usage));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [usage]);

  useEffect(() => {
    // Get user's location for context
    if (settings.gpsTracking && navigator.geolocation) {
      gpsTracker.requestPermission().then(granted => {
        if (granted) {
          // Mock location for demo - in production, use reverse geocoding
          setCurrentLocation({ city: 'San Francisco', country: 'USA' });
        }
      });
    }
  }, [settings.gpsTracking]);

  // Validate if all required fields have values
  const validateRequiredFields = useCallback(() => {
    const requiredFields = [
      usage.transport.carKm,
      usage.transport.publicTransportKm,
      usage.transport.flightKm,
      usage.energy.electricityKwh,
      usage.energy.heatingKwh,
      usage.lifestyle.waste
    ];
    
    return requiredFields.some(field => field !== '' && field !== '0');
  }, [usage]);

  const validateAllInputs = useCallback(() => {
    const errors: {[key: string]: string[]} = {};
    
    // Validate transport inputs
    Object.entries(usage.transport).forEach(([key, value]) => {
      if (key.includes('Km') && value !== '') {
        const rule = VALIDATION_RULES[key as keyof typeof VALIDATION_RULES];
        if (rule) {
          const result = validateInput(sanitizeNumericInput(value as string), rule);
          if (!result.isValid) {
            errors[key] = result.errors;
          }
        }
      }
    });

    // Validate energy inputs
    Object.entries(usage.energy).forEach(([key, value]) => {
      if (key.includes('Kwh') && value !== '') {
        const rule = VALIDATION_RULES[key as keyof typeof VALIDATION_RULES];
        if (rule) {
          const result = validateInput(sanitizeNumericInput(value as string), rule);
          if (!result.isValid) {
            errors[key] = result.errors;
          }
        }
      }
    });

    // Validate lifestyle inputs
    if (usage.lifestyle.waste !== '') {
      const result = validateInput(sanitizeNumericInput(usage.lifestyle.waste), VALIDATION_RULES.waste);
      if (!result.isValid) {
        errors.waste = result.errors;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [usage]);

  // Manual calculation trigger
  const handleCalculate = () => {
    const isValid = validateAllInputs();
    const hasRequiredData = validateRequiredFields();
    
    if (!hasRequiredData) {
      setSaveMessage('Please enter at least one value to calculate your footprint.');
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }
    
    if (isValid) {
      const carbonData = {
        transportation: {
          car: sanitizeNumericInput(usage.transport.carKm),
          publicTransport: sanitizeNumericInput(usage.transport.publicTransportKm),
          flights: sanitizeNumericInput(usage.transport.flightKm),
          bike: sanitizeNumericInput(usage.transport.bikeKm)
        },
        energy: {
          electricity: sanitizeNumericInput(usage.energy.electricityKwh),
          heating: sanitizeNumericInput(usage.energy.heatingKwh),
          cooling: 0
        },
        lifestyle: {
          diet: usage.lifestyle.diet,
          shopping: usage.lifestyle.shopping,
          waste: sanitizeNumericInput(usage.lifestyle.waste)
        }
      };

      setPreviousFootprint(footprint || 0);
      const total = calculateTotalFootprint(carbonData, usage);
      setFootprint(total);
      setIsCalculated(true);
      onFootprintChange(total);
      setHasUnsavedChanges(true);
    } else {
      setSaveMessage('Please fix validation errors before calculating.');
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const updateUsage = (category: string, field: string, value: any) => {
    setUsage(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [field]: value
      }
    }));
    setIsCalculated(false); // Reset calculation status when inputs change
  };

  const handleSave = async (currentFootprint?: number, carbonData?: any) => {
    if (!isCalculated || footprint === null) {
      setSaveMessage('Please calculate your footprint before saving.');
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }

    setSaveStatus('saving');
    
    try {
      const footprintToSave = currentFootprint || footprint;
      
      if (!validateRequiredFields()) {
        throw new Error('Please enter at least one value before saving.');
      }
      
      if (!validateAllInputs()) {
        throw new Error('Please fix validation errors before saving.');
      }

      const dataToSave = carbonData || {
        transportation: {
          car: sanitizeNumericInput(usage.transport.carKm),
          publicTransport: sanitizeNumericInput(usage.transport.publicTransportKm),
          flights: sanitizeNumericInput(usage.transport.flightKm),
          bike: sanitizeNumericInput(usage.transport.bikeKm)
        },
        energy: {
          electricity: sanitizeNumericInput(usage.energy.electricityKwh),
          heating: sanitizeNumericInput(usage.energy.heatingKwh),
          cooling: 0
        },
        lifestyle: {
          diet: usage.lifestyle.diet,
          shopping: usage.lifestyle.shopping,
          waste: sanitizeNumericInput(usage.lifestyle.waste)
        }
      };

      const calculationId = saveCalculation({
        timestamp: new Date(),
        footprint: footprintToSave,
        data: dataToSave,
        usage,
        location: currentLocation || undefined
      });

      if (calculationId) {
        setHasUnsavedChanges(false);
        setSaveStatus('success');
        setSaveMessage('Calculation saved successfully!');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        throw new Error('Failed to save calculation.');
      }
    } catch (error) {
      setSaveStatus('error');
      setSaveMessage(error instanceof Error ? error.message : 'Failed to save calculation.');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all values? This will clear all your inputs.')) {
      setUsage({
        transport: {
          carKm: '',
          carType: 'petrol',
          carEfficiency: 8.0,
          publicTransportKm: '',
          flightKm: '',
          bikeKm: ''
        },
        energy: {
          electricityKwh: '',
          heatingKwh: '',
          heatingType: 'gas'
        },
        lifestyle: {
          diet: 'omnivore',
          shopping: 2,
          waste: ''
        }
      });
      setValidationErrors({});
      setHasUnsavedChanges(false);
      setFootprint(null);
      setIsCalculated(false);
      localStorage.removeItem('calculator_data');
    }
  };

  const footprintChange = footprint !== null ? footprint - previousFootprint : 0;
  const globalAverage = 7500;
  const parisTarget = 2300;

  const getProgressColor = (value: number, max: number) => {
    const percentage = (value / max) * 100;
    if (percentage <= 33) return 'from-emerald-500 to-green-500';
    if (percentage <= 66) return 'from-yellow-500 to-orange-500';
    return 'from-orange-500 to-red-500';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-slide-up-dark">
      {/* Enhanced Hero Footprint Display */}
      <div className="relative overflow-hidden">
        {/* Animated Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-900/20 to-slate-900 rounded-[2.5rem]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-500/5 to-transparent rounded-[2.5rem] animate-pulse" style={{ animationDuration: '4s' }} />
        
        {/* Floating Orbs */}
        <div className="absolute inset-0 overflow-hidden rounded-[2.5rem]">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-gradient-to-r from-emerald-400/30 to-teal-400/30 blur-sm animate-float-dark"
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
        </div>
        
        {/* Main Content Container */}
        <div className="relative backdrop-blur-xl bg-gradient-to-br from-slate-800/40 via-slate-700/30 to-slate-800/40 border border-white/10 rounded-[2.5rem] p-12 lg:p-20 shadow-2xl">
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 rounded-[2.5rem] pointer-events-none" />
          
          <div className="relative text-center space-y-10">
            {/* Header Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-center space-x-6">
                {/* Redesigned Icon */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-700 animate-pulse" />
                  <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500/90 via-emerald-400/90 to-teal-500/90 rounded-2xl backdrop-blur-sm border border-white/20 shadow-xl">
                    <Sparkles className="w-10 h-10 text-white drop-shadow-lg animate-pulse" style={{ animationDuration: '3s' }} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-5xl font-black bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
                    Your Carbon Footprint
                  </h2>
                  {hasUnsavedChanges && (
                    <div className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full border border-yellow-400/30 backdrop-blur-sm">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                      <span className="text-yellow-200 text-sm font-semibold tracking-wide">Unsaved Changes</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Main Footprint Display */}
            <div className="relative space-y-8">
              {/* Circular Progress Ring Background */}
              <div className="relative flex items-center justify-center">
                <div className="absolute w-80 h-80 rounded-full border-4 border-white/10 animate-pulse" style={{ animationDuration: '6s' }} />
                <div className="absolute w-72 h-72 rounded-full border-2 border-emerald-400/20 animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
                
                {/* Main Number Display */}
                <div className="relative z-10 text-center space-y-4">
                  <div className="text-8xl lg:text-9xl font-black bg-gradient-to-br from-white via-emerald-100 to-white bg-clip-text text-transparent drop-shadow-2xl tracking-tight">
                    {footprint !== null ? Math.round(footprint).toLocaleString() : '-- '}
                  </div>
                  <div className="text-2xl font-bold text-emerald-200/80 tracking-widest">
                    kg CO₂ per year
                  </div>
                </div>
              </div>
              
              {/* Change Indicator */}
              {footprintChange !== 0 && isCalculated && footprint !== null && (
                <div className={`inline-flex items-center space-x-4 px-8 py-4 rounded-2xl backdrop-blur-sm border transition-all duration-700 animate-scale-in-dark ${
                  footprintChange > 0 
                    ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-200 border-red-400/30 shadow-lg shadow-red-500/20' 
                    : 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-200 border-emerald-400/30 shadow-lg shadow-emerald-500/20'
                }`}>
                  <TrendingUp className={`w-7 h-7 transition-transform duration-500 ${footprintChange > 0 ? 'rotate-180' : ''}`} />
                  <span className="font-bold text-xl tracking-wide">
                    {footprintChange > 0 ? '+' : ''}{Math.round(footprintChange)} kg CO₂
                  </span>
                  <div className={`w-3 h-3 rounded-full animate-pulse ${footprintChange > 0 ? 'bg-red-400' : 'bg-emerald-400'}`} />
                </div>
              )}
            </div>

            {/* Enhanced Progress Cards */}
            {footprint !== null && isCalculated && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                {/* Global Average Card */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                  <div className="relative backdrop-blur-sm bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-indigo-500/10 rounded-3xl border border-blue-400/20 p-8 group-hover:scale-105 transition-transform duration-500">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl mx-auto mb-6 shadow-xl">
                      <Globe className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-4xl font-black text-blue-200 mb-3">
                      {((footprint / globalAverage) * 100).toFixed(0)}%
                    </div>
                    <p className="text-blue-100 font-bold text-lg">of global average</p>
                    <div className="mt-6 w-full bg-blue-900/30 rounded-full h-4 overflow-hidden">
                      <div 
                        className={`h-4 rounded-full transition-all duration-1500 bg-gradient-to-r ${getProgressColor(footprint, globalAverage * 2)} shadow-lg`}
                        style={{ width: `${Math.min(100, (footprint / (globalAverage * 2)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              
                {/* Paris Target Card */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                  <div className="relative backdrop-blur-sm bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-green-500/10 rounded-3xl border border-emerald-400/20 p-8 group-hover:scale-105 transition-transform duration-500">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl mx-auto mb-6 shadow-xl">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-4xl font-black text-emerald-200 mb-3">
                      {((parisTarget / footprint) * 100).toFixed(0)}%
                    </div>
                    <p className="text-emerald-100 font-bold text-lg">to Paris target</p>
                    <div className="mt-6 w-full bg-emerald-900/30 rounded-full h-4 overflow-hidden">
                      <div 
                        className="h-4 rounded-full transition-all duration-1500 bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg"
                        style={{ width: `${Math.min(100, (parisTarget / footprint) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              
                {/* Monthly Average Card */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                  <div className="relative backdrop-blur-sm bg-gradient-to-br from-purple-500/10 via-purple-400/5 to-pink-500/10 rounded-3xl border border-purple-400/20 p-8 group-hover:scale-105 transition-transform duration-500">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mx-auto mb-6 shadow-xl">
                      <Star className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-4xl font-black text-purple-200 mb-3">
                      {Math.round(footprint / 12).toLocaleString()}
                    </div>
                    <p className="text-purple-100 font-bold text-lg">kg per month</p>
                    <div className="mt-6 w-full bg-purple-900/30 rounded-full h-4 overflow-hidden">
                      <div 
                        className={`h-4 rounded-full transition-all duration-1500 bg-gradient-to-r ${getProgressColor(footprint / 12, 1000)} shadow-lg`}
                        style={{ width: `${Math.min(100, (footprint / 12 / 1000) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-12">
              <button
                onClick={handleCalculate}
                className="group relative flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/10"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Zap className="relative w-6 h-6" />
                <span className="relative">Calculate Footprint</span>
              </button>
              
              <button
                onClick={() => handleSave()}
                disabled={!isCalculated || footprint === null || saveStatus === 'saving'}
                className={`group relative flex items-center space-x-3 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 backdrop-blur-sm border border-white/10 ${
                  isCalculated && footprint !== null && saveStatus !== 'saving'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-2xl hover:scale-105'
                    : 'bg-gray-600/50 text-gray-300 cursor-not-allowed'
                }`}
              >
                {isCalculated && footprint !== null && saveStatus !== 'saving' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
                <Save className="relative w-6 h-6" />
                <span className="relative">{saveStatus === 'saving' ? 'Saving...' : 'Save Calculation'}</span>
              </button>
              
              <button
                onClick={handleReset}
                className="group relative flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/10"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <RotateCcw className="relative w-6 h-6" />
                <span className="relative">Reset All</span>
              </button>

              {currentLocation && (
                <div className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-200 rounded-2xl border border-blue-400/30 backdrop-blur-sm">
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium">{currentLocation.city}, {currentLocation.country}</span>
                </div>
              )}
            </div>
            
            {/* Save Status Message */}
            {saveStatus !== 'idle' && (
              <div className={`mt-8 p-6 rounded-2xl border backdrop-blur-sm ${
                saveStatus === 'success' 
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30' 
                  : saveStatus === 'error'
                    ? 'bg-red-500/20 text-red-200 border-red-400/30'
                    : 'bg-blue-500/20 text-blue-200 border-blue-400/30'
              }`}>
                <p className="text-center font-semibold text-lg">{saveMessage}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Carbon Evolution Chart */}
      {footprint !== null && isCalculated && (
        <div className="relative bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-[4rem] mb-16 overflow-hidden animate-slide-up-dark" style={{ animationDelay: '0.4s' }}>
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 rounded-[4rem] pointer-events-none">
            {/* Enhanced Particle System */}
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-gradient-to-r from-emerald-400/30 to-teal-400/30 blur-sm animate-float-dark"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${6 + Math.random() * 12}px`,
                  height: `${6 + Math.random() * 12}px`,
                  animationDelay: `${Math.random() * 10}s`,
                  animationDuration: `${10 + Math.random() * 5}s`
                }}
              />
            ))}
          </div>
          
          <div className="relative z-10 h-[700px]">
            <ImmersiveCarbonChart currentFootprint={footprint} />
          </div>
        </div>
      )}
      {/* Enhanced Transportation Section */}
      <div className="card-premium-dark p-10 animate-slide-right-dark" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur-lg opacity-60 animate-pulse" />
              <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 via-blue-400 to-indigo-600 rounded-3xl shadow-2xl">
                <Car className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-black text-white mb-2">Transportation</h3>
              <p className="text-slate-300 text-lg">Your mobility carbon footprint</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowRouteCalculator(!showRouteCalculator)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-xl border border-blue-400/30 hover:bg-blue-500/30 transition-colors"
          >
            <Navigation className="w-4 h-4" />
            <span>Route Calculator</span>
          </button>
        </div>

        {showRouteCalculator && (
          <div className="mb-8">
            <RouteCalculator onRouteSelect={(distance, mode) => {
              updateUsage('transport', mode === 'driving' ? 'carKm' : 'publicTransportKm', distance.toString());
            }} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-8">
            <InputField
              label="Car usage (km/month)"
              value={usage.transport.carKm}
              onChange={(value) => updateUsage('transport', 'carKm', value)}
              placeholder="Enter kilometers"
              tooltip={INPUT_TOOLTIPS.carKm}
              errors={validationErrors.carKm}
              type="number"
            />

            <VehicleSelector
              value={usage.transport.carType}
              efficiency={usage.transport.carEfficiency}
              onChange={(type, efficiency) => {
                updateUsage('transport', 'carType', type);
                updateUsage('transport', 'carEfficiency', efficiency);
              }}
            />
          </div>

          <div className="space-y-8">
            <InputField
              label="Public transport (km/month)"
              value={usage.transport.publicTransportKm}
              onChange={(value) => updateUsage('transport', 'publicTransportKm', value)}
              placeholder="Bus, train, metro"
              tooltip={INPUT_TOOLTIPS.publicTransportKm}
              errors={validationErrors.publicTransportKm}
              type="number"
            />

            <InputField
              label="Flights (km/month)"
              value={usage.transport.flightKm}
              onChange={(value) => updateUsage('transport', 'flightKm', value)}
              placeholder="Air travel distance"
              tooltip={INPUT_TOOLTIPS.flightKm}
              errors={validationErrors.flightKm}
              type="number"
            />
          </div>
        </div>
      </div>

      {/* Enhanced Energy Section */}
      <div className="card-premium-dark p-10 animate-slide-right-dark" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center space-x-6 mb-10">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl blur-lg opacity-60 animate-pulse" />
            <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 via-orange-400 to-red-600 rounded-3xl shadow-2xl">
              <Home className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white mb-2">Home Energy</h3>
            <p className="text-slate-300 text-lg">Electricity and heating consumption</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <InputField
            label="Electricity (kWh/month)"
            value={usage.energy.electricityKwh}
            onChange={(value) => updateUsage('energy', 'electricityKwh', value)}
            placeholder="Monthly electricity usage"
            tooltip={INPUT_TOOLTIPS.electricityKwh}
            errors={validationErrors.electricityKwh}
            type="number"
            icon={<Zap className="w-3 h-3" />}
            helperText="Average household: 300-400 kWh/month"
          />

          <InputField
            label="Heating (kWh/month)"
            value={usage.energy.heatingKwh}
            onChange={(value) => updateUsage('energy', 'heatingKwh', value)}
            placeholder="Monthly heating usage"
            tooltip={INPUT_TOOLTIPS.heatingKwh}
            errors={validationErrors.heatingKwh}
            type="number"
            icon={<Flame className="w-3 h-3" />}
            helperText="Varies by season and insulation"
          />
        </div>
      </div>

      {/* Enhanced Lifestyle Section */}
      <div className="card-premium-dark p-10 animate-slide-right-dark" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center space-x-6 mb-10">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl blur-lg opacity-60 animate-pulse" />
            <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 via-green-400 to-emerald-600 rounded-3xl shadow-2xl">
              <Utensils className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white mb-2">Lifestyle</h3>
            <p className="text-slate-300 text-lg">Diet, shopping, and waste habits</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div>
            <label className="block text-sm font-bold text-slate-200 mb-4">
              Diet type
            </label>
            <select
              value={usage.lifestyle.diet}
              onChange={(e) => updateUsage('lifestyle', 'diet', e.target.value)}
              className="w-full min-h-[40px] px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:bg-gray-50 transition-colors"
            >
              <option value="vegan">🌱 Vegan</option>
              <option value="vegetarian">🥗 Vegetarian</option>
              <option value="pescatarian">🐟 Pescatarian</option>
              <option value="omnivore">🥩 Omnivore</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-200 mb-4">
              Shopping frequency
            </label>
            <select
              value={usage.lifestyle.shopping}
              onChange={(e) => updateUsage('lifestyle', 'shopping', Number(e.target.value))}
              className="w-full min-h-[40px] px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:bg-gray-50 transition-colors"
            >
              <option value={1}>🛍️ Low (minimal)</option>
              <option value={2}>🛒 Medium (average)</option>
              <option value={3}>🛍️ High (frequent)</option>
            </select>
          </div>

          <InputField
            label="Waste (kg/month)"
            value={usage.lifestyle.waste}
            onChange={(value) => updateUsage('lifestyle', 'waste', value)}
            placeholder="Monthly waste production"
            tooltip={INPUT_TOOLTIPS.waste}
            errors={validationErrors.waste}
            type="number"
          />
        </div>
      </div>
    </div>
  );
}