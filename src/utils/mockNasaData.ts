import { NASANeoFeedResponse, NASAAsteroid } from '../types/nasa';

// Mock NASA NEO data generator based on the real API structure
export function generateMockNASAData(): NASANeoFeedResponse {
  const data: NASANeoFeedResponse = {};
  
  // Generate data for the next 7 days
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Generate 5-15 random asteroids per day
    const asteroidCount = Math.floor(Math.random() * 10) + 5;
    data[dateStr] = [];
    
    for (let j = 0; j < asteroidCount; j++) {
      const id = `${3000000 + Math.floor(Math.random() * 500000)}`;
      const diameter = Math.random() * 800 + 50; // 50-850 meters
      const velocity = Math.random() * 50 + 5; // 5-55 km/s
      const missDistance = Math.random() * 50000000 + 1000000; // Random miss distance
      const isPotentiallyHazardous = Math.random() > 0.85; // 15% chance
      const isSentry = Math.random() > 0.95; // 5% chance
      
      const asteroid: NASAAsteroid = {
        links: {
          self: `http://api.nasa.gov/neo/rest/v1/neo/${id}?api_key=DEMO_KEY`
        },
        id,
        neo_reference_id: id,
        name: `(${2000 + Math.floor(Math.random() * 25)} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 10)})`,
        nasa_jpl_url: `https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=${id}`,
        absolute_magnitude_h: 18 + Math.random() * 8,
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
            close_approach_date_full: `${dateStr} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
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
        is_sentry_object: isSentry
      };
      
      data[dateStr].push(asteroid);
    }
  }
  
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
