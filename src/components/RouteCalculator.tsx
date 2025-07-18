import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, Clock, Leaf, Car, Bus, Bike, Footprints, Search, Star, Filter } from 'lucide-react';
import { gpsTracker, calculateCityDistance, RouteOption } from '../utils/gpsTracking';
import { IndianCityAI, IndianCity, POPULAR_CITIES } from '../utils/indianCitiesDatabase';

interface RouteCalculatorProps {
  onRouteSelect: (distance: number, mode: string) => void;
}

export default function RouteCalculator({ onRouteSelect }: RouteCalculatorProps) {
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [fromCityObj, setFromCityObj] = useState<IndianCity | null>(null);
  const [toCityObj, setToCityObj] = useState<IndianCity | null>(null);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [fromSuggestions, setFromSuggestions] = useState<IndianCity[]>([]);
  const [toSuggestions, setToSuggestions] = useState<IndianCity[]>([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'metro' | 'capital' | 'tier1' | 'tier2'>('all');

  // Get filtered popular cities based on selected filter
  const getFilteredCities = () => {
    switch (selectedFilter) {
      case 'metro': return POPULAR_CITIES.filter(city => city.isMetro);
      case 'capital': return POPULAR_CITIES.filter(city => city.isCapital);
      case 'tier1': return POPULAR_CITIES.filter(city => city.tier === 1);
      case 'tier2': return POPULAR_CITIES.filter(city => city.tier === 2);
      default: return POPULAR_CITIES;
    }
  };

  const calculateRoutes = async () => {
    if (!fromCityObj || !toCityObj) return;

    setLoading(true);
    try {
      // Calculate accurate distance using Haversine formula
      const directDistance = IndianCityAI.calculateDistance(fromCityObj.id, toCityObj.id);
      
      // Enhanced route calculations with real-world factors
      const routeOptions: RouteOption[] = [];

      // Walking - only viable for short distances
      if (directDistance <= 15) {
        const walkingDistance = directDistance * 1.3; // Account for actual walking paths
        routeOptions.push({
          mode: 'Walking',
          distance: walkingDistance,
          duration: walkingDistance / 5 * 60, // 5 km/h average walking speed
          emissions: 0,
          description: `${walkingDistance.toFixed(1)}km walk via roads`,
          ecoFriendly: true
        });
      }

      // Cycling - viable for medium distances
      if (directDistance <= 100) {
        const cyclingDistance = directDistance * 1.15; // Account for cycling paths
        routeOptions.push({
          mode: 'Cycling',
          distance: cyclingDistance,
          duration: cyclingDistance / 15 * 60, // 15 km/h average cycling speed
          emissions: cyclingDistance * 0.021, // Manufacturing and maintenance emissions
          description: `${cyclingDistance.toFixed(1)}km bike ride`,
          ecoFriendly: true
        });
      }

      // Public Transport - enhanced calculation
      const publicTransportDistance = directDistance * 1.25; // Account for route deviations
      let publicTransportSpeed = 35; // Base speed in km/h
      let publicTransportEmission = 0.089; // kg CO2 per km

      // Adjust based on distance and city tier
      if (directDistance > 500) {
        publicTransportSpeed = 65; // Express trains for long distances
        publicTransportEmission = 0.041; // More efficient trains
      } else if (fromCityObj.tier <= 2 && toCityObj.tier <= 2) {
        publicTransportSpeed = 45; // Better metro/bus systems in major cities
      }

      routeOptions.push({
        mode: 'Public Transport',
        distance: publicTransportDistance,
        duration: (publicTransportDistance / publicTransportSpeed * 60) + 30, // Add waiting time
        emissions: publicTransportDistance * publicTransportEmission,
        description: directDistance > 500 ? 'Train (Express/Rajdhani)' : 
                    fromCityObj.tier <= 2 ? 'Metro/AC Bus' : 'Bus/Local train',
        ecoFriendly: true
      });

      // Driving - enhanced calculation with Indian road conditions
      const drivingDistance = directDistance * 1.2; // Account for road routes
      let avgSpeed = 50; // km/h
      let fuelEmission = 0.171; // kg CO2 per km

      // Adjust based on route type and cities
      if (directDistance > 300) {
        avgSpeed = 70; // Highway driving
        fuelEmission = 0.165; // More efficient at highway speeds
      } else if (fromCityObj.tier <= 2 || toCityObj.tier <= 2) {
        avgSpeed = 35; // City traffic
        fuelEmission = 0.185; // More emissions in traffic
      }

      routeOptions.push({
        mode: 'Driving',
        distance: drivingDistance,
        duration: drivingDistance / avgSpeed * 60,
        emissions: drivingDistance * fuelEmission,
        description: directDistance > 300 ? 
                    `${drivingDistance.toFixed(1)}km via highway` : 
                    `${drivingDistance.toFixed(1)}km via city roads`,
        ecoFriendly: false
      });

      // Flight - only for longer distances
      if (directDistance > 200) {
        let flightEmission = 0.255; // kg CO2 per km
        let flightDuration = 2; // hours

        // More accurate flight calculations
        if (directDistance > 1500) {
          flightEmission = 0.205; // More efficient for long distances
          flightDuration = directDistance / 800 + 1; // Cruise speed + overhead
        } else if (directDistance > 800) {
          flightEmission = 0.235;
          flightDuration = directDistance / 700 + 1;
        } else {
          flightDuration = directDistance / 600 + 1.5; // Shorter flights less efficient
        }

        // Add airport time
        const totalFlightTime = flightDuration * 60 + 180; // 3 hours for check-in/boarding

        routeOptions.push({
          mode: 'Flight',
          distance: directDistance,
          duration: totalFlightTime,
          emissions: directDistance * flightEmission,
          description: directDistance > 1500 ? 'Direct flight (Wide-body)' : 
                      directDistance > 800 ? 'Direct flight (Narrow-body)' : 'Regional flight',
          ecoFriendly: false
        });
      }

      // Electric Vehicle option for driving routes
      if (fromCityObj.tier <= 2 || toCityObj.tier <= 2) {
        const evDistance = drivingDistance;
        routeOptions.push({
          mode: 'Electric Vehicle',
          distance: evDistance,
          duration: evDistance / avgSpeed * 60,
          emissions: evDistance * 0.068, // Indian grid emission factor for EVs
          description: `${evDistance.toFixed(1)}km electric drive`,
          ecoFriendly: true
        });
      }

      // Sort by emissions (eco-friendly first)
      setRoutes(routeOptions.sort((a, b) => a.emissions - b.emissions));
    } catch (error) {
      console.error('Error calculating routes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle city input changes with AI search
  const handleFromCityChange = (value: string) => {
    setFromCity(value);
    if (value.length >= 2) {
      const suggestions = IndianCityAI.searchCities(value, 8);
      setFromSuggestions(suggestions);
      setShowFromSuggestions(true);
    } else {
      setFromSuggestions([]);
      setShowFromSuggestions(false);
    }
  };

  const handleToCityChange = (value: string) => {
    setToCity(value);
    if (value.length >= 2) {
      const suggestions = IndianCityAI.searchCities(value, 8);
      setToSuggestions(suggestions);
      setShowToSuggestions(true);
    } else {
      setToSuggestions([]);
      setShowToSuggestions(false);
    }
  };

  // Handle city selection
  const selectFromCity = (city: IndianCity) => {
    setFromCity(city.name);
    setFromCityObj(city);
    setShowFromSuggestions(false);
  };

  const selectToCity = (city: IndianCity) => {
    setToCity(city.name);
    setToCityObj(city);
    setShowToSuggestions(false);
  };

  // Quick route selection
  const setQuickRoute = (from: IndianCity, to: IndianCity) => {
    setFromCity(from.name);
    setToCity(to.name);
    setFromCityObj(from);
    setToCityObj(to);
  };

  const getModeIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'walking': return <Footprints className="w-5 h-5" />;
      case 'cycling': return <Bike className="w-5 h-5" />;
      case 'public transport': return <Bus className="w-5 h-5" />;
      case 'driving': return <Car className="w-5 h-5" />;
      case 'electric vehicle': return <Car className="w-5 h-5" />;
      case 'flight': return <Navigation className="w-5 h-5" />;
      default: return <MapPin className="w-5 h-5" />;
    }
  };

  const getModeColor = (mode: string, ecoFriendly: boolean) => {
    if (ecoFriendly) {
      return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    }
    return 'text-orange-600 bg-orange-50 border-orange-200';
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Navigation className="w-6 h-6 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Indian Route Calculator</h3>
        </div>
        <div className="text-xs text-slate-300 bg-slate-700/50 px-3 py-1 rounded-full">
          🇮🇳 {POPULAR_CITIES.length}+ Indian Cities
        </div>
      </div>

      {/* City Filter */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-300">Filter cities:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All Cities', count: POPULAR_CITIES.length },
            { id: 'metro', label: 'Metro Cities', count: POPULAR_CITIES.filter(c => c.isMetro).length },
            { id: 'capital', label: 'Capitals', count: POPULAR_CITIES.filter(c => c.isCapital).length },
            { id: 'tier1', label: 'Tier 1', count: POPULAR_CITIES.filter(c => c.tier === 1).length },
            { id: 'tier2', label: 'Tier 2', count: POPULAR_CITIES.filter(c => c.tier === 2).length }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id as any)}
              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                selectedFilter === filter.id
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-slate-700/50 text-slate-300 border-slate-600'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <label className="block text-sm font-medium text-slate-300 mb-2">From</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={fromCity}
              onChange={(e) => handleFromCityChange(e.target.value)}
              onFocus={() => setShowFromSuggestions(fromSuggestions.length > 0)}
              placeholder="Search Indian cities..."
              className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-slate-400"
            />
            {fromCityObj && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <span className="text-xs text-emerald-400 font-medium">{fromCityObj.state}</span>
                <div className={`w-2 h-2 rounded-full ${
                  fromCityObj.tier === 1 ? 'bg-emerald-500' :
                  fromCityObj.tier === 2 ? 'bg-blue-500' : 'bg-yellow-500'
                }`} />
              </div>
            )}
          </div>
          
          {/* From City Suggestions */}
          {showFromSuggestions && fromSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {fromSuggestions.map(city => (
                <button
                  key={city.id}
                  onClick={() => selectFromCity(city)}
                  className="w-full px-4 py-3 text-left hover:bg-slate-700/50 border-b border-slate-700 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">{city.name}</div>
                      <div className="text-xs text-slate-400">{city.state} • {city.district}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {city.isCapital && <span className="text-xs text-yellow-400">Capital</span>}
                      {city.isMetro && <span className="text-xs text-emerald-400">Metro</span>}
                      <div className={`w-2 h-2 rounded-full ${
                        city.tier === 1 ? 'bg-emerald-500' :
                        city.tier === 2 ? 'bg-blue-500' : 'bg-yellow-500'
                      }`} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-slate-300 mb-2">To</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={toCity}
              onChange={(e) => handleToCityChange(e.target.value)}
              onFocus={() => setShowToSuggestions(toSuggestions.length > 0)}
              placeholder="Search Indian cities..."
              className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-slate-400"
            />
            {toCityObj && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <span className="text-xs text-emerald-400 font-medium">{toCityObj.state}</span>
                <div className={`w-2 h-2 rounded-full ${
                  toCityObj.tier === 1 ? 'bg-emerald-500' :
                  toCityObj.tier === 2 ? 'bg-blue-500' : 'bg-yellow-500'
                }`} />
              </div>
            )}
          </div>
          
          {/* To City Suggestions */}
          {showToSuggestions && toSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {toSuggestions.map(city => (
                <button
                  key={city.id}
                  onClick={() => selectToCity(city)}
                  className="w-full px-4 py-3 text-left hover:bg-slate-700/50 border-b border-slate-700 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">{city.name}</div>
                      <div className="text-xs text-slate-400">{city.state} • {city.district}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {city.isCapital && <span className="text-xs text-yellow-400">Capital</span>}
                      {city.isMetro && <span className="text-xs text-emerald-400">Metro</span>}
                      <div className={`w-2 h-2 rounded-full ${
                        city.tier === 1 ? 'bg-emerald-500' :
                        city.tier === 2 ? 'bg-blue-500' : 'bg-yellow-500'
                      }`} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={calculateRoutes}
        disabled={!fromCityObj || !toCityObj || loading}
        className="w-full px-6 py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed mb-6 transition-colors"
      >
        {loading ? 'Calculating Routes...' : 'Calculate Routes'}
      </button>

      {/* Distance Info */}
      {fromCityObj && toCityObj && (
        <div className="mb-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-300">
              <span className="font-medium text-white">{fromCityObj.name}</span>
              <span className="mx-2">→</span>
              <span className="font-medium text-white">{toCityObj.name}</span>
            </div>
            <div className="text-sm text-slate-300">
              ~{IndianCityAI.calculateDistance(fromCityObj.id, toCityObj.id).toFixed(0)} km
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {fromCityObj.state} to {toCityObj.state} • {fromCityObj.region} to {toCityObj.region}
          </div>
        </div>
      )}

      {/* Routes Display */}
      {routes.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Route Options</h4>
          {routes.map((route, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                route.ecoFriendly 
                  ? 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20' 
                  : 'bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20'
              }`}
              onClick={() => onRouteSelect(route.distance, route.mode.toLowerCase().replace(' ', '_'))}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={route.ecoFriendly ? 'text-emerald-400' : 'text-orange-400'}>
                    {getModeIcon(route.mode)}
                  </div>
                  <div>
                    <h5 className="font-semibold text-white">{route.mode}</h5>
                    <p className="text-xs text-slate-400">{route.description}</p>
                  </div>
                </div>
                {route.ecoFriendly && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-emerald-500/20 rounded-full">
                    <Leaf className="w-3 h-3 text-emerald-400" />
                    <span className="text-xs text-emerald-400 font-medium">Eco</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Distance:</span>
                  <div className="font-medium text-white">{route.distance.toFixed(1)} km</div>
                </div>
                <div>
                  <span className="text-slate-400">Duration:</span>
                  <div className="font-medium text-white">
                    {route.duration >= 60 ? 
                      `${Math.floor(route.duration / 60)}h ${Math.round(route.duration % 60)}m` : 
                      `${Math.round(route.duration)}m`
                    }
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">CO₂:</span>
                  <div className="font-medium text-white">
                    {route.emissions >= 1000 ? 
                      `${(route.emissions / 1000).toFixed(1)}t` : 
                      `${route.emissions.toFixed(1)}kg`
                    }
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-slate-700">
        <h4 className="text-sm font-semibold text-slate-300 mb-3">Quick Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            { from: 'mumbai', to: 'delhi', label: 'Mumbai → Delhi' },
            { from: 'bangalore', to: 'chennai', label: 'Bangalore → Chennai' },
            { from: 'kolkata', to: 'hyderabad', label: 'Kolkata → Hyderabad' },
            { from: 'pune', to: 'ahmedabad', label: 'Pune → Ahmedabad' }
          ].map(route => {
            const fromCity = IndianCityAI.getCityDetails(route.from);
            const toCity = IndianCityAI.getCityDetails(route.to);
            if (!fromCity || !toCity) return null;
            
            return (
              <button
                key={`${route.from}-${route.to}`}
                onClick={() => setQuickRoute(fromCity, toCity)}
                className="p-3 bg-slate-700/50 rounded-lg text-sm text-white border border-slate-600 text-left hover:bg-slate-700/70 transition-colors"
              >
                <div className="font-medium">{route.label}</div>
                <div className="text-xs text-slate-400 mt-1">
                  ~{IndianCityAI.calculateDistance(route.from, route.to).toFixed(0)} km
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Popular Cities Quick Access */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <h4 className="text-sm font-semibold text-slate-300 mb-3">
          <Star className="w-4 h-4 inline mr-1" />
          Popular Cities ({selectedFilter === 'all' ? 'All' : selectedFilter})
        </h4>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {getFilteredCities().slice(0, 20).map(city => (
            <button
              key={city.id}
              onClick={() => !fromCityObj ? selectFromCity(city) : selectToCity(city)}
              className="px-3 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300 border border-slate-600 hover:bg-slate-700/70 transition-colors"
            >
              {city.name}
              {city.isCapital && <span className="ml-1 text-yellow-400">👑</span>}
              {city.isMetro && <span className="ml-1 text-emerald-400">🏙️</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}