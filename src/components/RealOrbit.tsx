/// <reference path="../types/three-fiber.d.ts" />
import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { NASAAsteroid } from '../types/nasa';
import { generateOrbitPoints, getAsteroidPositionAtTime } from '../utils/orbitalMechanics';

interface RealOrbitProps {
    asteroid: NASAAsteroid;
    currentTime: Date;
    showFullOrbit?: boolean;
    orbitColor?: string;
    opacity?: number;
}

export function RealOrbit({
    asteroid,
    currentTime,
    showFullOrbit = true,
    orbitColor = '#60a5fa',
    opacity = 0.3
}: RealOrbitProps) {
    // Gerar pontos da órbita completa
    const orbitPoints = useMemo(() => {
        if (!asteroid.orbital_elements || !showFullOrbit) return [];

        return generateOrbitPoints(asteroid.orbital_elements, 200);
    }, [asteroid.orbital_elements, showFullOrbit]);

    // Calcular posição atual do asteroide
    const currentPosition = useMemo(() => {
        if (!asteroid.orbital_elements) return new THREE.Vector3(0, 0, 0);

        const epochTime = new Date(asteroid.orbital_elements.epoch);
        return getAsteroidPositionAtTime(asteroid.orbital_elements, currentTime, epochTime);
    }, [asteroid.orbital_elements, currentTime]);

    // Gerar trajetória recente (últimos 30 dias de movimento)
    const recentTrajectory = useMemo(() => {
        if (!asteroid.orbital_elements) return [];

        const points: THREE.Vector3[] = [];
        const epochTime = new Date(asteroid.orbital_elements.epoch);

        // Trajetória dos últimos 30 dias até agora
        for (let i = -30; i <= 0; i++) {
            const time = new Date(currentTime.getTime() + i * 24 * 60 * 60 * 1000);
            const position = getAsteroidPositionAtTime(asteroid.orbital_elements, time, epochTime);
            points.push(position);
        }

        return points;
    }, [asteroid.orbital_elements, currentTime]);

    // Gerar trajetória futura (próximos 30 dias)
    const futureTrajectory = useMemo(() => {
        if (!asteroid.orbital_elements) return [];

        const points: THREE.Vector3[] = [];
        const epochTime = new Date(asteroid.orbital_elements.epoch);

        // Trajetória dos próximos 30 dias
        for (let i = 0; i <= 30; i++) {
            const time = new Date(currentTime.getTime() + i * 24 * 60 * 60 * 1000);
            const position = getAsteroidPositionAtTime(asteroid.orbital_elements, time, epochTime);
            points.push(position);
        }

        return points;
    }, [asteroid.orbital_elements, currentTime]);

    if (!asteroid.orbital_elements) {
        return null; // Sem elementos orbitais, não pode desenhar órbita real
    }

    return (
        <>
            {/* Órbita completa (opcional) */}
            {showFullOrbit && orbitPoints.length > 0 && (
                <Line
                    points={orbitPoints}
                    color={orbitColor}
                    lineWidth={1}
                    transparent
                    opacity={opacity * 0.3}
                />
            )}

            {/* Trajetória recente (mais escura) */}
            {recentTrajectory.length > 0 && (
                <Line
                    points={recentTrajectory}
                    color={orbitColor}
                    lineWidth={2}
                    transparent
                    opacity={opacity * 0.8}
                />
            )}

            {/* Trajetória futura (pontilhada) */}
            {futureTrajectory.length > 0 && (
                <Line
                    points={futureTrajectory}
                    color={orbitColor}
                    lineWidth={1}
                    transparent
                    opacity={opacity * 0.6}
                    dashed
                    dashSize={0.1}
                    gapSize={0.05}
                />
            )}

            {/* Posição atual do asteroide */}
            <mesh position={currentPosition}>
                <sphereGeometry args={[0.02, 8, 8]} />
                <meshBasicMaterial color={orbitColor} />
            </mesh>

            {/* Linha conectando Terra ao asteroide */}
            <Line
                points={[new THREE.Vector3(0, 0, 0), currentPosition]}
                color={orbitColor}
                lineWidth={1}
                transparent
                opacity={opacity * 0.2}
            />
        </>
    );
}