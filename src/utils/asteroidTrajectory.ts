// asteroidTrajectory.ts - Cálculo de trajetória realística de asteroides
import { NASAAsteroid } from '../types/nasa';

/**
 * Calcula uma posição de impacto realística baseada nos dados orbitais do asteroide
 */
export function calculateRealisticImpactPoint(asteroid: NASAAsteroid): [number, number] {
    const closeApproach = asteroid.close_approach_data[0];

    // Dados orbitais disponíveis
    const velocity = parseFloat(closeApproach.relative_velocity.kilometers_per_second);
    const approachDate = new Date(closeApproach.close_approach_date);

    // Calcula um "seed" baseado no ID do asteroide para consistência
    const asteroidSeed = hashStringToNumber(asteroid.id);

    // Se o asteroide realmente impactasse, onde seria?
    // Baseado na velocidade e direção aproximada

    // Latitude: influenciada pela época do ano (inclinação da Terra)
    const dayOfYear = getDayOfYear(approachDate);
    const seasonalInfluence = Math.sin((dayOfYear / 365) * 2 * Math.PI) * 23.5; // Inclinação da Terra

    // Velocidade influencia dispersão - asteroides mais rápidos têm mais variação
    const velocityFactor = Math.min(velocity / 30, 2); // Normaliza velocidade

    // Latitude baseada em fatores reais
    const baseLatitude = seasonalInfluence + (seededRandom(asteroidSeed) - 0.5) * 60 * velocityFactor;
    const latitude = Math.max(-80, Math.min(80, baseLatitude)); // Limita entre -80° e 80°

    // Longitude: mais aleatória mas influenciada pelo horário de aproximação
    const hourOfDay = approachDate.getUTCHours();
    const timeInfluence = (hourOfDay / 24) * 360 - 180; // Converte hora para longitude

    const baseLongitude = timeInfluence + (seededRandom(asteroidSeed + 1) - 0.5) * 120;
    const longitude = ((baseLongitude + 180) % 360) - 180; // Normaliza entre -180° e 180°

    return [longitude, latitude];
}

/**
 * Calcula posição baseada na direção de aproximação
 */
export function calculateImpactFromApproachDirection(asteroid: NASAAsteroid): [number, number] {
    const closeApproach = asteroid.close_approach_data[0];
    const asteroidSeed = hashStringToNumber(asteroid.id);

    // Simula direção de aproximação baseada na data de aproximação
    const approachDate = new Date(closeApproach.close_approach_date);

    // Direção baseada na data (posição da Terra na órbita)
    const dayOfYear = getDayOfYear(approachDate);
    const earthOrbitalPosition = (dayOfYear / 365) * 2 * Math.PI;

    // Calcula vetor de aproximação
    const approachAngle = earthOrbitalPosition + seededRandom(asteroidSeed) * Math.PI;

    // Converte para coordenadas geográficas
    const impactLatitude = Math.sin(approachAngle) * 60; // Máximo ±60°
    const impactLongitude = Math.cos(approachAngle) * 180; // ±180°

    return [impactLongitude, impactLatitude];
}

/**
 * Versão aprimorada que considera múltiplos fatores
 */
export function calculateAdvancedImpactPoint(asteroid: NASAAsteroid): [number, number] {
    const closeApproach = asteroid.close_approach_data[0];
    const asteroidSeed = hashStringToNumber(asteroid.id);

    // Fatores que influenciam o impacto
    const velocity = parseFloat(closeApproach.relative_velocity.kilometers_per_second);
    const diameter = asteroid.estimated_diameter.meters.estimated_diameter_min;
    const approachDate = new Date(closeApproach.close_approach_date);

    // 1. Latitude baseada na inclinação orbital implícita
    const dayOfYear = getDayOfYear(approachDate);
    const seasonalTilt = Math.sin((dayOfYear / 365) * 2 * Math.PI) * 23.5;

    // 2. Influência da velocidade (asteroides mais rápidos têm trajetórias mais extremas)
    const velocityInfluence = Math.tanh(velocity / 30) * 30; // Saturação em ±30°

    // 3. Influência do tamanho (asteroides maiores têm trajetórias mais previsíveis)
    const sizeStability = Math.min(diameter / 1000, 1); // Normaliza em 1km
    const sizeInfluence = (1 - sizeStability) * 20; // Menos estabilidade = mais variação

    // Calcula latitude final
    const baseLatitude = seasonalTilt + velocityInfluence * seededRandom(asteroidSeed, -1, 1);
    const latitudeVariation = sizeInfluence * seededRandom(asteroidSeed + 1, -1, 1);
    const finalLatitude = Math.max(-75, Math.min(75, baseLatitude + latitudeVariation));

    // 4. Longitude baseada no horário e direção orbital
    const hourAngle = (approachDate.getUTCHours() / 24) * 360 - 180;
    const orbitalDirection = seededRandom(asteroidSeed + 2, -1, 1) * 90; // ±90° de variação
    const finalLongitude = ((hourAngle + orbitalDirection + 180) % 360) - 180;

    return [finalLongitude, finalLatitude];
}

/**
 * Gera um número pseudo-aleatório baseado em string (seed)
 */
function hashStringToNumber(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Converte para 32-bit integer
    }
    return Math.abs(hash);
}

/**
 * Gera número pseudo-aleatório seeded entre min e max
 */
function seededRandom(seed: number, min: number = 0, max: number = 1): number {
    const x = Math.sin(seed) * 10000;
    const random = x - Math.floor(x);
    return min + random * (max - min);
}

/**
 * Calcula o dia do ano (1-365)
 */
function getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Função principal que escolhe o melhor método baseado nos dados disponíveis
 */
export function calculateBestImpactPoint(asteroid: NASAAsteroid): [number, number] {
    // Se temos dados suficientes, usa o método avançado
    if (asteroid.close_approach_data?.length > 0 && asteroid.estimated_diameter) {
        return calculateAdvancedImpactPoint(asteroid);
    }

    // Senão, usa o método baseado em direção
    if (asteroid.close_approach_data?.length > 0) {
        return calculateImpactFromApproachDirection(asteroid);
    }

    // Fallback para método básico
    return calculateRealisticImpactPoint(asteroid);
}

/**
 * Utilitário para debug - mostra os fatores que influenciaram o cálculo
 */
export function explainImpactCalculation(asteroid: NASAAsteroid): {
    point: [number, number];
    factors: {
        velocity: number;
        missDistance: number;
        diameter: number;
        approachDate: string;
        seasonalInfluence: number;
        explanation: string;
    };
} {
    const point = calculateBestImpactPoint(asteroid);
    const closeApproach = asteroid.close_approach_data[0];
    const velocity = parseFloat(closeApproach.relative_velocity.kilometers_per_second);
    const missDistance = parseFloat(closeApproach.miss_distance.lunar);
    const diameter = asteroid.estimated_diameter.meters.estimated_diameter_min;
    const approachDate = closeApproach.close_approach_date;

    const dayOfYear = getDayOfYear(new Date(approachDate));
    const seasonalInfluence = Math.sin((dayOfYear / 365) * 2 * Math.PI) * 23.5;

    return {
        point,
        factors: {
            velocity,
            missDistance,
            diameter,
            approachDate,
            seasonalInfluence,
            explanation: `Impacto calculado baseado em: velocidade orbital (${velocity.toFixed(1)} km/s), ` +
                `tamanho (${diameter.toFixed(0)}m), data de aproximação (influência sazonal: ${seasonalInfluence.toFixed(1)}°), ` +
                `e características orbitais derivadas dos dados da NASA.`
        }
    };
}