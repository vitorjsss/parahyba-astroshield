import * as THREE from 'three';
import { OrbitalElements } from '../types/nasa';

// Constantes astronômicas
const AU = 149597870.7; // Unidade Astronômica em km
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

// Função para converter graus para radianos
const toRadians = (degrees: number): number => degrees * DEG_TO_RAD;

// Função para calcular anomalia excêntrica usando método de Newton-Raphson
function calculateEccentricAnomaly(meanAnomaly: number, eccentricity: number): number {
    let E = meanAnomaly; // Primeira aproximação
    const tolerance = 1e-8;
    const maxIterations = 100;

    for (let i = 0; i < maxIterations; i++) {
        const E_new = E - (E - eccentricity * Math.sin(E) - meanAnomaly) / (1 - eccentricity * Math.cos(E));

        if (Math.abs(E_new - E) < tolerance) {
            return E_new;
        }

        E = E_new;
    }

    return E;
}

// Função para calcular a posição orbital em coordenadas cartesianas
export function calculateOrbitalPosition(
    elements: OrbitalElements,
    timeFromEpoch: number // em dias
): THREE.Vector3 {
    const {
        semi_major_axis,
        eccentricity,
        inclination,
        longitude_ascending_node,
        argument_periapsis,
        mean_anomaly,
        orbital_period
    } = elements;

    // Converter ângulos para radianos
    const i = toRadians(inclination);
    const Omega = toRadians(longitude_ascending_node);
    const omega = toRadians(argument_periapsis);
    const M0 = toRadians(mean_anomaly);

    // Calcular movimento médio (n)
    const n = (2 * Math.PI) / orbital_period; // radianos por dia

    // Calcular anomalia média no tempo atual
    const M = M0 + n * timeFromEpoch;

    // Calcular anomalia excêntrica
    const E = calculateEccentricAnomaly(M, eccentricity);

    // Calcular anomalia verdadeira
    const nu = 2 * Math.atan2(
        Math.sqrt(1 + eccentricity) * Math.sin(E / 2),
        Math.sqrt(1 - eccentricity) * Math.cos(E / 2)
    );

    // Calcular distância radial
    const r = semi_major_axis * (1 - eccentricity * Math.cos(E));

    // Posição no plano orbital
    const x_orbital = r * Math.cos(nu);
    const y_orbital = r * Math.sin(nu);
    const z_orbital = 0;

    // Matrizes de rotação para transformar do plano orbital para coordenadas eclípticas
    const cos_Omega = Math.cos(Omega);
    const sin_Omega = Math.sin(Omega);
    const cos_i = Math.cos(i);
    const sin_i = Math.sin(i);
    const cos_omega = Math.cos(omega);
    const sin_omega = Math.sin(omega);

    // Transformação para coordenadas eclípticas
    const x = (cos_Omega * cos_omega - sin_Omega * sin_omega * cos_i) * x_orbital +
        (-cos_Omega * sin_omega - sin_Omega * cos_omega * cos_i) * y_orbital;

    const y = (sin_Omega * cos_omega + cos_Omega * sin_omega * cos_i) * x_orbital +
        (-sin_Omega * sin_omega + cos_Omega * cos_omega * cos_i) * y_orbital;

    const z = (sin_omega * sin_i) * x_orbital + (cos_omega * sin_i) * y_orbital;

    // Converter de AU para unidades da visualização (escala para Three.js)
    const scale = 0.1; // Fator de escala para visualização

    return new THREE.Vector3(x * scale, z * scale, y * scale);
}

// Função para gerar pontos da órbita completa
export function generateOrbitPoints(
    elements: OrbitalElements,
    numberOfPoints: number = 100
): THREE.Vector3[] {
    const points: THREE.Vector3[] = [];
    const timeSpan = elements.orbital_period; // Um período orbital completo

    for (let i = 0; i <= numberOfPoints; i++) {
        const t = (i / numberOfPoints) * timeSpan;
        const position = calculateOrbitalPosition(elements, t);
        points.push(position);
    }

    return points;
}

// Função para calcular posição em um momento específico
export function getAsteroidPositionAtTime(
    elements: OrbitalElements,
    currentTime: Date,
    epochTime: Date
): THREE.Vector3 {
    const timeDifferenceMs = currentTime.getTime() - epochTime.getTime();
    const timeDifferenceDays = timeDifferenceMs / (1000 * 60 * 60 * 24);

    return calculateOrbitalPosition(elements, timeDifferenceDays);
}

// Função para gerar elementos orbitais realistas (para dados mock)
export function generateRealisticOrbitalElements(): OrbitalElements {
    // Elementos típicos de asteroides Near-Earth
    const semi_major_axis = 0.8 + Math.random() * 2.0; // 0.8 - 2.8 AU
    const eccentricity = Math.random() * 0.6; // 0 - 0.6
    const inclination = Math.random() * 30; // 0 - 30 graus
    const longitude_ascending_node = Math.random() * 360; // 0 - 360 graus
    const argument_periapsis = Math.random() * 360; // 0 - 360 graus
    const mean_anomaly = Math.random() * 360; // 0 - 360 graus

    // Calcular período orbital usando a 3ª Lei de Kepler: P² = a³ (em anos)
    const orbital_period_years = Math.pow(semi_major_axis, 1.5);
    const orbital_period = orbital_period_years * 365.25; // converter para dias

    return {
        epoch: Date.now(),
        semi_major_axis,
        eccentricity,
        inclination,
        longitude_ascending_node,
        argument_periapsis,
        mean_anomaly,
        orbital_period
    };
}