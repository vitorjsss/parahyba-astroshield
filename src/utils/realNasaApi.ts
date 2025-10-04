// API para buscar dados reais da NASA (NEO Feed e JPL)
// Este arquivo integra com as APIs reais da NASA para dados de asteroides

import { NASAAsteroid, OrbitalElements, NASANeoFeedResponse } from '../types/nasa';

// URLs das APIs da NASA
const NASA_NEO_API_BASE = 'https://api.nasa.gov/neo/rest/v1';
const JPL_API_BASE = 'https://ssd-api.jpl.nasa.gov/sbdb.api';

// Cache para dados reais da NASA
let realDataCache: { date: string; data: NASANeoFeedResponse } | null = null;

// Função principal para buscar dados reais da NASA NEO API
export async function fetchRealNASAData(apiKey?: string): Promise<NASANeoFeedResponse> {
    const today = new Date().toISOString().split('T')[0];

    // Verifica cache primeiro
    if (realDataCache && realDataCache.date === today) {
        console.log('📦 Retornando dados reais do cache...');
        return realDataCache.data;
    }

    console.log('🌍 Buscando dados reais da NASA NEO API...');

    try {
        // Se não tiver API key, usa DEMO_KEY (limitada a 1000 requisições/hora)
        const key = apiKey || 'DEMO_KEY';

        const url = `${NASA_NEO_API_BASE}/feed?start_date=${today}&end_date=${today}&api_key=${key}`;

        console.log(`🚀 Fazendo requisição para: ${url}`);

        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Rate limit excedido. Tente novamente em alguns minutos ou use uma API key válida.');
            }
            if (response.status === 403) {
                throw new Error('API key inválida. Obtenha uma chave em https://api.nasa.gov/');
            }
            throw new Error(`Erro na API da NASA: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.near_earth_objects) {
            throw new Error('Formato de resposta inválido da API da NASA');
        }

        // Processa os dados para o formato esperado
        const processedData: NASANeoFeedResponse = {};

        Object.keys(data.near_earth_objects).forEach(date => {
            processedData[date] = data.near_earth_objects[date].map((asteroid: any) => {
                const processedAsteroid: NASAAsteroid = {
                    links: asteroid.links,
                    id: asteroid.id,
                    neo_reference_id: asteroid.neo_reference_id,
                    name: asteroid.name,
                    nasa_jpl_url: asteroid.nasa_jpl_url,
                    absolute_magnitude_h: asteroid.absolute_magnitude_h,
                    estimated_diameter: asteroid.estimated_diameter,
                    is_potentially_hazardous_asteroid: asteroid.is_potentially_hazardous_asteroid,
                    close_approach_data: asteroid.close_approach_data,
                    is_sentry_object: asteroid.is_sentry_object || false,
                    // Para dados reais, não temos elementos orbitais completos na API feed
                    // Seria necessário fazer uma segunda requisição para cada asteroide
                    orbital_elements: {
                        epoch: Date.now(),
                        semi_major_axis: 0, // Não disponível na feed API
                        eccentricity: 0,
                        inclination: 0,
                        longitude_ascending_node: 0,
                        argument_periapsis: 0,
                        mean_anomaly: 0,
                        orbital_period: 0
                    }
                };

                return processedAsteroid;
            });
        });

        const asteroidCount = Object.values(processedData).flat().length;
        console.log(`✅ Dados reais carregados! ${asteroidCount} asteroides encontrados para ${today}`);

        // Salva no cache
        realDataCache = { date: today, data: processedData };

        return processedData;

    } catch (error) {
        console.error('❌ Erro ao buscar dados reais da NASA:', error);
        throw error;
    }
}

// Função para obter todos os asteroides dos dados reais
export function getAllAsteroidsFromRealData(data: NASANeoFeedResponse): NASAAsteroid[] {
    const allAsteroids: NASAAsteroid[] = [];

    Object.values(data).forEach(dayAsteroids => {
        allAsteroids.push(...dayAsteroids);
    });

    return allAsteroids;
}

// Função para verificar status da API NASA
export async function checkNASAApiStatus(apiKey?: string): Promise<{
    status: 'ok' | 'error';
    message: string;
    remainingRequests?: number;
    hourlyLimit?: number;
}> {
    const key = apiKey || 'DEMO_KEY';

    try {
        const response = await fetch(`${NASA_NEO_API_BASE}/stats?api_key=${key}`);

        if (response.ok) {
            const remaining = response.headers.get('X-RateLimit-Remaining');
            const limit = response.headers.get('X-RateLimit-Limit');
            return {
                status: 'ok',
                message: 'API da NASA funcionando normalmente',
                remainingRequests: remaining ? parseInt(remaining) : undefined,
                hourlyLimit: limit ? parseInt(limit) : undefined
            };
        } else if (response.status === 429) {
            return {
                status: 'error',
                message: 'Rate limit excedido. Aguarde antes de fazer mais requisições.'
            };
        } else if (response.status === 403) {
            return {
                status: 'error',
                message: 'API key inválida. Obtenha uma chave em https://api.nasa.gov/'
            };
        } else {
            return {
                status: 'error',
                message: `Erro na API: ${response.status} ${response.statusText}`
            };
        }
    } catch (error) {
        return {
            status: 'error',
            message: `Erro de conexão: ${error instanceof Error ? error.message : 'Desconhecido'}`
        };
    }
}

// Interface para resposta da API JPL
interface JPLResponse {
    signature: {
        source: string;
        version: string;
    };
    count: number;
    data: any[][];
    fields: string[];
    object?: {
        orbit?: {
            elements?: any[];
            epoch?: number;
            equinox?: string;
        };
    };
}

// Função para buscar elementos orbitais de um asteroide específico
export async function fetchOrbitalElements(asteroidId: string): Promise<OrbitalElements | null> {
    try {
        const response = await fetch(`${JPL_API_BASE}?sstr=${asteroidId}&full-prec=true`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: JPLResponse = await response.json();

        if (!data.object?.orbit?.elements) {
            console.warn(`Elementos orbitais não encontrados para ${asteroidId}`);
            return null;
        }

        const elements = data.object.orbit.elements;
        const epoch = data.object.orbit.epoch;

        // Mapear elementos da resposta JPL para nossa interface
        // Nota: A ordem pode variar, verificar documentação da API
        const orbitalElements: OrbitalElements = {
            epoch: epoch || Date.now(),
            semi_major_axis: parseFloat(elements[0]) || 0, // a (AU)
            eccentricity: parseFloat(elements[1]) || 0, // e
            inclination: parseFloat(elements[2]) || 0, // i (deg)
            longitude_ascending_node: parseFloat(elements[3]) || 0, // Ω (deg)
            argument_periapsis: parseFloat(elements[4]) || 0, // ω (deg)
            mean_anomaly: parseFloat(elements[5]) || 0, // M (deg)
            orbital_period: calculateOrbitalPeriod(parseFloat(elements[0])) // calculado
        };

        return orbitalElements;

    } catch (error) {
        console.error(`Erro ao buscar elementos orbitais para ${asteroidId}:`, error);
        return null;
    }
}

// Função para calcular período orbital usando 3ª Lei de Kepler
function calculateOrbitalPeriod(semiMajorAxis: number): number {
    // P² = a³ (P em anos, a em AU)
    const periodYears = Math.pow(semiMajorAxis, 1.5);
    return periodYears * 365.25; // converter para dias
}

// Função para enriquecer dados de asteroides com elementos orbitais
export async function enrichAsteroidWithOrbitalData(asteroid: NASAAsteroid): Promise<NASAAsteroid> {
    const orbitalElements = await fetchOrbitalElements(asteroid.id);

    return {
        ...asteroid,
        orbital_elements: orbitalElements || undefined
    };
}

// Função para processar uma lista de asteroides e adicionar dados orbitais
export async function enrichAsteroidsWithOrbitalData(
    asteroids: NASAAsteroid[],
    maxConcurrent: number = 5
): Promise<NASAAsteroid[]> {
    const enrichedAsteroids: NASAAsteroid[] = [];

    // Processar em lotes para evitar sobrecarga da API
    for (let i = 0; i < asteroids.length; i += maxConcurrent) {
        const batch = asteroids.slice(i, i + maxConcurrent);

        const enrichedBatch = await Promise.all(
            batch.map(async (asteroid) => {
                try {
                    return await enrichAsteroidWithOrbitalData(asteroid);
                } catch (error) {
                    console.error(`Erro ao processar asteroide ${asteroid.id}:`, error);
                    return asteroid; // Retorna sem elementos orbitais em caso de erro
                }
            })
        );

        enrichedAsteroids.push(...enrichedBatch);

        // Pausa entre lotes para respeitar limites de taxa da API
        if (i + maxConcurrent < asteroids.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    return enrichedAsteroids;
}

// Exemplo de uso:
/*
// No seu componente ou função de carregamento de dados:

async function loadAsteroidsWithOrbits() {
  // 1. Buscar asteroides da API NASA NEO
  const neoResponse = await fetch('https://api.nasa.gov/neo/rest/v1/feed?api_key=YOUR_API_KEY');
  const neoData = await neoResponse.json();
  const asteroids = flattenNASAData(neoData.near_earth_objects);
  
  // 2. Enriquecer com dados orbitais
  const asteroidsWithOrbits = await enrichAsteroidsWithOrbitalData(asteroids);
  
  // 3. Usar nos componentes de visualização
  setAsteroids(asteroidsWithOrbits);
}
*/