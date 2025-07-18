export interface IndianCapitalCity {
  id: string;
  name: string;
  state: string;
  type: 'national' | 'state';
  population: number;
  area: number; // in sq km
  gdp: number; // in billion USD
  averageFootprint: number; // kg CO2 per year
  greenScore: number;
  established: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export const INDIAN_CAPITAL_CITIES: IndianCapitalCity[] = [
  // National Capital
  {
    id: 'new-delhi',
    name: 'New Delhi',
    state: 'Delhi',
    type: 'national',
    population: 32900000,
    area: 1484,
    gdp: 293.6,
    averageFootprint: 2200,
    greenScore: 65,
    established: 1911,
    coordinates: { lat: 28.6139, lng: 77.2090 }
  },
  
  // State Capitals
  {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    type: 'state',
    population: 20400000,
    area: 603,
    gdp: 310.0,
    averageFootprint: 2800,
    greenScore: 58,
    established: 1960,
    coordinates: { lat: 19.0760, lng: 72.8777 }
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    state: 'West Bengal',
    type: 'state',
    population: 14850000,
    area: 1886,
    gdp: 150.1,
    averageFootprint: 2100,
    greenScore: 52,
    established: 1947,
    coordinates: { lat: 22.5726, lng: 88.3639 }
  },
  {
    id: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    type: 'state',
    population: 11500000,
    area: 1189,
    gdp: 78.6,
    averageFootprint: 2400,
    greenScore: 61,
    established: 1969,
    coordinates: { lat: 13.0827, lng: 80.2707 }
  },
  {
    id: 'bangalore',
    name: 'Bangalore',
    state: 'Karnataka',
    type: 'state',
    population: 13600000,
    area: 741,
    gdp: 110.0,
    averageFootprint: 2600,
    greenScore: 68,
    established: 1956,
    coordinates: { lat: 12.9716, lng: 77.5946 }
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    type: 'state',
    population: 10500000,
    area: 650,
    gdp: 74.2,
    averageFootprint: 2300,
    greenScore: 63,
    established: 2014,
    coordinates: { lat: 17.3850, lng: 78.4867 }
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    state: 'Gujarat',
    type: 'state',
    population: 8400000,
    area: 505,
    gdp: 68.0,
    averageFootprint: 2700,
    greenScore: 59,
    established: 1960,
    coordinates: { lat: 23.0225, lng: 72.5714 }
  },
  {
    id: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    type: 'state',
    population: 7400000,
    area: 331,
    gdp: 69.0,
    averageFootprint: 2500,
    greenScore: 64,
    established: 1960,
    coordinates: { lat: 18.5204, lng: 73.8567 }
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    type: 'state',
    population: 3900000,
    area: 467,
    gdp: 43.2,
    averageFootprint: 2000,
    greenScore: 56,
    established: 1956,
    coordinates: { lat: 26.9124, lng: 75.7873 }
  },
  {
    id: 'lucknow',
    name: 'Lucknow',
    state: 'Uttar Pradesh',
    type: 'state',
    population: 3500000,
    area: 631,
    gdp: 47.6,
    averageFootprint: 1900,
    greenScore: 54,
    established: 1950,
    coordinates: { lat: 26.8467, lng: 80.9462 }
  },
  {
    id: 'chandigarh',
    name: 'Chandigarh',
    state: 'Punjab & Haryana',
    type: 'state',
    population: 1180000,
    area: 114,
    gdp: 15.0,
    averageFootprint: 2800,
    greenScore: 78,
    established: 1966,
    coordinates: { lat: 30.7333, lng: 76.7794 }
  },
  {
    id: 'thiruvananthapuram',
    name: 'Thiruvananthapuram',
    state: 'Kerala',
    type: 'state',
    population: 1700000,
    area: 214,
    gdp: 6.1,
    averageFootprint: 1600,
    greenScore: 82,
    established: 1956,
    coordinates: { lat: 8.5241, lng: 76.9366 }
  },
  {
    id: 'bhopal',
    name: 'Bhopal',
    state: 'Madhya Pradesh',
    type: 'state',
    population: 2400000,
    area: 286,
    gdp: 32.4,
    averageFootprint: 1800,
    greenScore: 61,
    established: 1956,
    coordinates: { lat: 23.2599, lng: 77.4126 }
  },
  {
    id: 'raipur',
    name: 'Raipur',
    state: 'Chhattisgarh',
    type: 'state',
    population: 1500000,
    area: 226,
    gdp: 25.7,
    averageFootprint: 1700,
    greenScore: 58,
    established: 2000,
    coordinates: { lat: 21.2514, lng: 81.6296 }
  },
  {
    id: 'patna',
    name: 'Patna',
    state: 'Bihar',
    type: 'state',
    population: 2500000,
    area: 250,
    gdp: 16.5,
    averageFootprint: 1500,
    greenScore: 48,
    established: 1950,
    coordinates: { lat: 25.5941, lng: 85.1376 }
  },
  {
    id: 'ranchi',
    name: 'Ranchi',
    state: 'Jharkhand',
    type: 'state',
    population: 1400000,
    area: 652,
    gdp: 18.9,
    averageFootprint: 1600,
    greenScore: 55,
    established: 2000,
    coordinates: { lat: 23.3441, lng: 85.3096 }
  },
  {
    id: 'gandhinagar',
    name: 'Gandhinagar',
    state: 'Gujarat',
    type: 'state',
    population: 290000,
    area: 205,
    gdp: 4.2,
    averageFootprint: 2200,
    greenScore: 75,
    established: 1960,
    coordinates: { lat: 23.2156, lng: 72.6369 }
  },
  {
    id: 'shimla',
    name: 'Shimla',
    state: 'Himachal Pradesh',
    type: 'state',
    population: 200000,
    area: 35,
    gdp: 1.8,
    averageFootprint: 1200,
    greenScore: 88,
    established: 1971,
    coordinates: { lat: 31.1048, lng: 77.1734 }
  },
  {
    id: 'srinagar',
    name: 'Srinagar',
    state: 'Jammu & Kashmir',
    type: 'state',
    population: 1400000,
    area: 294,
    gdp: 2.7,
    averageFootprint: 1100,
    greenScore: 72,
    established: 2019,
    coordinates: { lat: 34.0837, lng: 74.7973 }
  },
  {
    id: 'dehradun',
    name: 'Dehradun',
    state: 'Uttarakhand',
    type: 'state',
    population: 800000,
    area: 300,
    gdp: 8.9,
    averageFootprint: 1400,
    greenScore: 71,
    established: 2000,
    coordinates: { lat: 30.3165, lng: 78.0322 }
  },
  {
    id: 'guwahati',
    name: 'Guwahati',
    state: 'Assam',
    type: 'state',
    population: 1100000,
    area: 328,
    gdp: 7.4,
    averageFootprint: 1300,
    greenScore: 64,
    established: 1950,
    coordinates: { lat: 26.1445, lng: 91.7362 }
  },
  {
    id: 'bhubaneswar',
    name: 'Bhubaneswar',
    state: 'Odisha',
    type: 'state',
    population: 900000,
    area: 422,
    gdp: 15.6,
    averageFootprint: 1500,
    greenScore: 67,
    established: 1950,
    coordinates: { lat: 20.2961, lng: 85.8245 }
  },
  {
    id: 'imphal',
    name: 'Imphal',
    state: 'Manipur',
    type: 'state',
    population: 520000,
    area: 128,
    gdp: 1.4,
    averageFootprint: 900,
    greenScore: 76,
    established: 1972,
    coordinates: { lat: 24.8170, lng: 93.9368 }
  },
  {
    id: 'agartala',
    name: 'Agartala',
    state: 'Tripura',
    type: 'state',
    population: 520000,
    area: 76,
    gdp: 1.2,
    averageFootprint: 1000,
    greenScore: 69,
    established: 1972,
    coordinates: { lat: 23.8315, lng: 91.2868 }
  },
  {
    id: 'aizawl',
    name: 'Aizawl',
    state: 'Mizoram',
    type: 'state',
    population: 400000,
    area: 457,
    gdp: 0.8,
    averageFootprint: 800,
    greenScore: 85,
    established: 1987,
    coordinates: { lat: 23.1645, lng: 92.9376 }
  },
  {
    id: 'kohima',
    name: 'Kohima',
    state: 'Nagaland',
    type: 'state',
    population: 270000,
    area: 20,
    gdp: 0.6,
    averageFootprint: 700,
    greenScore: 81,
    established: 1963,
    coordinates: { lat: 25.6751, lng: 94.1086 }
  },
  {
    id: 'itanagar',
    name: 'Itanagar',
    state: 'Arunachal Pradesh',
    type: 'state',
    population: 350000,
    area: 25,
    gdp: 0.9,
    averageFootprint: 600,
    greenScore: 89,
    established: 1987,
    coordinates: { lat: 27.0844, lng: 93.6053 }
  },
  {
    id: 'gangtok',
    name: 'Gangtok',
    state: 'Sikkim',
    type: 'state',
    population: 200000,
    area: 954,
    gdp: 0.4,
    averageFootprint: 500,
    greenScore: 92,
    established: 1975,
    coordinates: { lat: 27.3389, lng: 88.6065 }
  },
  {
    id: 'shillong',
    name: 'Shillong',
    state: 'Meghalaya',
    type: 'state',
    population: 400000,
    area: 64,
    gdp: 1.1,
    averageFootprint: 800,
    greenScore: 84,
    established: 1972,
    coordinates: { lat: 25.5788, lng: 91.8933 }
  }
];

export function getCapitalCityComparison(userFootprint: number): {
  better: IndianCapitalCity[];
  worse: IndianCapitalCity[];
  closest: IndianCapitalCity;
} {
  const sorted = [...INDIAN_CAPITAL_CITIES].sort((a, b) => 
    Math.abs(a.averageFootprint - userFootprint) - Math.abs(b.averageFootprint - userFootprint)
  );

  return {
    better: INDIAN_CAPITAL_CITIES.filter(city => city.averageFootprint > userFootprint),
    worse: INDIAN_CAPITAL_CITIES.filter(city => city.averageFootprint < userFootprint),
    closest: sorted[0]
  };
}

export function sortCapitalCities(
  cities: IndianCapitalCity[],
  sortBy: 'name' | 'population' | 'gdp' | 'area' | 'footprint' | 'greenScore',
  order: 'asc' | 'desc' = 'desc'
): IndianCapitalCity[] {
  return [...cities].sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;

    switch (sortBy) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'population':
        aValue = a.population;
        bValue = b.population;
        break;
      case 'gdp':
        aValue = a.gdp;
        bValue = b.gdp;
        break;
      case 'area':
        aValue = a.area;
        bValue = b.area;
        break;
      case 'footprint':
        aValue = a.averageFootprint;
        bValue = b.averageFootprint;
        break;
      case 'greenScore':
        aValue = a.greenScore;
        bValue = b.greenScore;
        break;
      default:
        aValue = a.name;
        bValue = b.name;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return order === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return order === 'asc' 
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });
}