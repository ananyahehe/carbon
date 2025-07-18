import React, { useState } from 'react';
import { MapPin, TrendingUp, TrendingDown, Users, Award, Globe, Star, Crown, ArrowUpDown, Building2, DollarSign, TreePine } from 'lucide-react';
import { INDIAN_CAPITAL_CITIES, IndianCapitalCity, getCapitalCityComparison, sortCapitalCities } from '../utils/indianCapitalCities';

interface CityComparisonProps {
  userFootprint: number;
}

type SortField = 'name' | 'population' | 'gdp' | 'area' | 'footprint' | 'greenScore';
type SortOrder = 'asc' | 'desc';

export default function CityComparison({ userFootprint }: CityComparisonProps) {
  const [sortField, setSortField] = useState<SortField>('footprint');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filterType, setFilterType] = useState<'all' | 'national' | 'state'>('all');
  
  const comparison = getCapitalCityComparison(userFootprint);
  
  const filteredCities = filterType === 'all' 
    ? INDIAN_CAPITAL_CITIES 
    : INDIAN_CAPITAL_CITIES.filter(city => city.type === filterType);
    
  const sortedCities = sortCapitalCities(filteredCities, sortField, sortOrder);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 opacity-50" />;
    return sortOrder === 'asc' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-slide-up">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl" />
        <div className="relative card-premium p-8 lg:p-12">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Indian Capital Cities Comparison
              </h2>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Compare your carbon footprint with Indian capital cities and discover sustainable urban living insights
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="card-premium p-8 text-center animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl mx-auto mb-6 shadow-xl">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Closest Match</h3>
          <p className="text-3xl font-black text-emerald-600 mb-2">{comparison.closest.name}</p>
          <p className="text-gray-600 font-medium">{comparison.closest.state}</p>
          <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <p className="text-sm text-emerald-700 font-medium">
              {Math.abs(comparison.closest.averageFootprint - userFootprint).toLocaleString()} kg CO₂ difference
            </p>
          </div>
        </div>

        <div className="card-premium p-8 text-center animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl mx-auto mb-6 shadow-xl">
            <TrendingDown className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Cities You Beat</h3>
          <p className="text-3xl font-black text-blue-600 mb-2">{comparison.worse.length}</p>
          <p className="text-gray-600 font-medium">out of {INDIAN_CAPITAL_CITIES.length} cities</p>
          <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-700 font-medium">
              {Math.round((comparison.worse.length / INDIAN_CAPITAL_CITIES.length) * 100)}% percentile
            </p>
          </div>
        </div>

        <div className="card-premium p-8 text-center animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl mx-auto mb-6 shadow-xl">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Cities Ahead</h3>
          <p className="text-3xl font-black text-orange-600 mb-2">{comparison.better.length}</p>
          <p className="text-gray-600 font-medium">cities with higher footprints</p>
          <div className="mt-4 p-3 bg-orange-50 rounded-xl border border-orange-100">
            <p className="text-sm text-orange-700 font-medium">
              Room for improvement
            </p>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="card-premium p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-gray-900">Indian Capital Cities Rankings</h3>
          
          <div className="flex items-center space-x-4">
            {/* Filter Button Group */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                    filterType === 'all'
                      ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  All ({INDIAN_CAPITAL_CITIES.length})
                </button>
                <button
                  onClick={() => setFilterType('national')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                    filterType === 'national'
                      ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  National (1)
                </button>
                <button
                  onClick={() => setFilterType('state')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                    filterType === 'state'
                      ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  State ({INDIAN_CAPITAL_CITIES.filter(c => c.type === 'state').length})
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Star className="w-4 h-4" />
              <span>Ranked by carbon efficiency</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed City Rankings Table */}
      <div className="card-premium overflow-hidden animate-slide-right" style={{ animationDelay: '0.4s' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
              <tr>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center space-x-2 text-xs font-bold text-gray-700 uppercase tracking-wider hover:text-blue-600 transition-colors"
                  >
                    <span>City</span>
                    {getSortIcon('name')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('population')}
                    className="flex items-center space-x-2 text-xs font-bold text-gray-700 uppercase tracking-wider hover:text-blue-600 transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    <span>Population</span>
                    {getSortIcon('population')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('gdp')}
                    className="flex items-center space-x-2 text-xs font-bold text-gray-700 uppercase tracking-wider hover:text-blue-600 transition-colors"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>GDP (B USD)</span>
                    {getSortIcon('gdp')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('area')}
                    className="flex items-center space-x-2 text-xs font-bold text-gray-700 uppercase tracking-wider hover:text-blue-600 transition-colors"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Area (km²)</span>
                    {getSortIcon('area')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('footprint')}
                    className="flex items-center space-x-2 text-xs font-bold text-gray-700 uppercase tracking-wider hover:text-blue-600 transition-colors"
                  >
                    <span>Carbon Footprint</span>
                    {getSortIcon('footprint')}
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('greenScore')}
                    className="flex items-center space-x-2 text-xs font-bold text-gray-700 uppercase tracking-wider hover:text-blue-600 transition-colors"
                  >
                    <TreePine className="w-4 h-4" />
                    <span>Green Score</span>
                    {getSortIcon('greenScore')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedCities.map((city, index) => {
                const isUserCity = Math.abs(city.averageFootprint - userFootprint) < 200;
                const difference = city.averageFootprint - userFootprint;
                
                return (
                  <tr
                    key={city.id}
                    className={`transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-emerald-50 ${
                      isUserCity 
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500' 
                        : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-xl font-bold text-sm ${
                          city.type === 'national' 
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' 
                            : 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white'
                        }`}>
                          {city.type === 'national' ? '🏛️' : index + 1}
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-lg font-bold text-gray-900">{city.name}</h4>
                            {city.type === 'national' && (
                              <div className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                                NATIONAL
                              </div>
                            )}
                            {isUserCity && (
                              <div className="px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full animate-pulse">
                                YOUR MATCH!
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{city.state}</p>
                          <p className="text-xs text-gray-500">Est. {city.established}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-lg font-bold text-gray-900">
                        {formatNumber(city.population)}
                      </div>
                      <div className="text-sm text-gray-500">people</div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-lg font-bold text-gray-900">
                        ${city.gdp.toFixed(1)}B
                      </div>
                      <div className="text-sm text-gray-500">USD</div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-lg font-bold text-gray-900">
                        {city.area.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">km²</div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-lg font-bold text-gray-900">
                        {city.averageFootprint.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">kg CO₂/year</div>
                      {!isUserCity && (
                        <div className={`text-sm font-bold mt-1 ${
                          difference > 0 ? 'text-red-600' : 'text-emerald-600'
                        }`}>
                          {difference > 0 ? '+' : ''}{difference.toLocaleString()} vs you
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="text-lg font-bold text-gray-900">
                          {city.greenScore}/100
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          city.greenScore >= 80 ? 'bg-emerald-500' :
                          city.greenScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-1000 ${
                            city.greenScore >= 80 ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                            city.greenScore >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                            'bg-gradient-to-r from-orange-500 to-red-500'
                          }`}
                          style={{ width: `${city.greenScore}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Your Position Visualization */}
      <div className="card-premium p-8 animate-slide-up" style={{ animationDelay: '0.5s' }}>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Position Among Indian Capitals</h3>
        
        <div className="relative mb-8">
          <div className="w-full bg-gradient-to-r from-emerald-200 via-yellow-200 to-red-200 rounded-full h-8 shadow-inner">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-600 h-8 rounded-full transition-all duration-1000 shadow-lg relative"
              style={{ 
                width: `${Math.min(100, ((INDIAN_CAPITAL_CITIES.length - comparison.better.length) / INDIAN_CAPITAL_CITIES.length) * 100)}%` 
              }}
            >
              <div className="absolute right-0 top-0 w-4 h-8 bg-white rounded-full shadow-lg transform translate-x-2 flex items-center justify-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              </div>
            </div>
          </div>
          
          <div className="flex justify-between text-sm text-gray-600 mt-3 font-medium">
            <span>🌱 Best (Low emissions)</span>
            <span>🔥 Worst (High emissions)</span>
          </div>
        </div>

        <div className="text-center space-y-4">
          <div className="text-lg font-bold text-gray-900">
            You rank #{INDIAN_CAPITAL_CITIES.length - comparison.better.length} out of {INDIAN_CAPITAL_CITIES.length} Indian capital cities
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="text-2xl font-bold text-emerald-600">
                {Math.round(((INDIAN_CAPITAL_CITIES.length - comparison.better.length) / INDIAN_CAPITAL_CITIES.length) * 100)}%
              </div>
              <p className="text-emerald-700 font-medium">Percentile rank</p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">
                {comparison.worse.length}
              </div>
              <p className="text-blue-700 font-medium">Cities behind you</p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
              <div className="text-2xl font-bold text-orange-600">
                {comparison.better.length}
              </div>
              <p className="text-orange-700 font-medium">Cities ahead of you</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}