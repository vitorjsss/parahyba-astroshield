import { NASANeoFeedResponse, NASAAsteroid } from '../types/nasa';
import { generateRealisticOrbitalElements } from './orbitalMechanics';

// Função para gerar números aleatórios com seed (para dados consistentes)
function createSeededRandom(seed: number) {
  let state = seed;
  return function () {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

// Cache para evitar regenerar dados desnecessariamente
let cachedData: { date: string; data: NASANeoFeedResponse } | null = null;

// Mock NASA NEO data generator based on the real API structure
export function generateMockNASAData(seed?: number): NASANeoFeedResponse {
  const todayString = new Date().toDateString();

  // Se já temos dados para hoje, retorna do cache
  if (cachedData && cachedData.date === todayString) {
    return cachedData.data;
  }

  // Use seed para gerar dados consistentes
  const random = createSeededRandom(seed || 12345);
  const data: NASANeoFeedResponse = {};

  // Generate data for the next 7 days
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    // Generate consistent number of asteroids per day (8-12 baseado no dia)
    const dayHash = dateStr.split('-').reduce((acc, val) => acc + parseInt(val), 0);
    const asteroidCount = 8 + (dayHash % 5); // 8-12 asteroides baseado na data
    data[dateStr] = [];

    for (let j = 0; j < asteroidCount; j++) {
      // Use seed baseado na data e índice para IDs consistentes
      const itemSeed = dayHash * 1000 + j;
      const id = `${3000000 + (itemSeed % 500000)}`;
      const diameter = (random() * 800) + 50; // 50-850 meters
      const velocity = (random() * 50) + 5; // 5-55 km/s
      const missDistance = (random() * 50000000) + 1000000; // Random miss distance
      const isPotentiallyHazardous = random() > 0.85; // 15% chance
      const isSentry = random() > 0.95; // 5% chance

      const asteroid: NASAAsteroid = {
        links: {
          self: `http://api.nasa.gov/neo/rest/v1/neo/${id}?api_key=fkVbPDt9JuPttB2wUmOCx6y2NqtdfiLrgWRECXCu`
        },
        id,
        neo_reference_id: id,
        name: `(${2000 + Math.floor(random() * 25)} ${String.fromCharCode(65 + Math.floor(random() * 26))}${String.fromCharCode(65 + Math.floor(random() * 26))}${Math.floor(random() * 10)})`,
        nasa_jpl_url: `https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=${id}`,
        absolute_magnitude_h: 18 + random() * 8,
        estimated_diameter: {
          kilometers: {
            estimated_diameter_min: diameter / 1000,
            estimated_diameter_max: (diameter * 1.5) / 1000
          },
          meters: {
            estimated_diameter_min: diameter,
            estimated_diameter_max: diameter * 1.5
          },
          miles: {
            estimated_diameter_min: diameter * 0.000621371,
            estimated_diameter_max: diameter * 1.5 * 0.000621371
          },
          feet: {
            estimated_diameter_min: diameter * 3.28084,
            estimated_diameter_max: diameter * 1.5 * 3.28084
          }
        },
        is_potentially_hazardous_asteroid: isPotentiallyHazardous,
        close_approach_data: [
          {
            close_approach_date: dateStr,
            close_approach_date_full: `${dateStr} ${String(Math.floor(random() * 24)).padStart(2, '0')}:${String(Math.floor(random() * 60)).padStart(2, '0')}`,
            epoch_date_close_approach: date.getTime(),
            relative_velocity: {
              kilometers_per_second: velocity.toFixed(6),
              kilometers_per_hour: (velocity * 3600).toFixed(6),
              miles_per_hour: (velocity * 3600 * 0.621371).toFixed(6)
            },
            miss_distance: {
              astronomical: (missDistance / 149597870.7).toFixed(10),
              lunar: (missDistance / 384400).toFixed(10),
              kilometers: missDistance.toFixed(6),
              miles: (missDistance * 0.621371).toFixed(6)
            },
            orbiting_body: 'Earth'
          }
        ],
        is_sentry_object: isSentry,
        orbital_elements: generateRealisticOrbitalElements() // Adiciona elementos orbitais reais
      };

      data[dateStr].push(asteroid);
    }
  }

  // Salva no cache
  cachedData = { date: todayString, data };

  return data;
}

// Flatten the date-grouped data into a single array
export function flattenNASAData(data: NASANeoFeedResponse): NASAAsteroid[] {
  const allAsteroids: NASAAsteroid[] = [];

  Object.keys(data).forEach(date => {
    allAsteroids.push(...data[date]);
  });

  return allAsteroids;
}

// Function to get all asteroids from the mock data
export function getAllAsteroidsFromMockData(data: NASANeoFeedResponse): NASAAsteroid[] {
  const allAsteroids: NASAAsteroid[] = [];

  Object.values(data).forEach(dayAsteroids => {
    allAsteroids.push(...dayAsteroids);
  });

  return allAsteroids;
}

// Function to simulate fetching from NASA API
export async function fetchMockNASAData(): Promise<NASANeoFeedResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return generateMockNASAData();
}
