import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AsteroidImpactProps {
    start: [number, number, number];
    target: [number, number, number];
    duration?: number; // seconds
    size?: number; // asteroid radius
    particleCount?: number;
    onComplete?: () => void;
    play?: boolean;
}

export function AsteroidImpact({
    start,
    target,
    duration = 3,
    size = 0.08,
    particleCount = 80,
    onComplete,
    play = true,
}: AsteroidImpactProps) {
    const asteroidRef = useRef<THREE.Mesh | null>(null);
    const shockRef = useRef<THREE.Mesh | null>(null);
    const pointsRef = useRef<THREE.Points | null>(null);

    // progress 0..1
    const progressRef = useRef(0);
    const impactRef = useRef(false);
    const explosionTime = useRef(0);

    // Precompute particle positions and velocities for the burst
    const { positions, velocities } = useMemo(() => {
        const pos = new Float32Array(particleCount * 3);
        const vel: Float32Array = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            // start at origin (will be translated to impact point)
            pos[i * 3] = 0;
            pos[i * 3 + 1] = 0;
            pos[i * 3 + 2] = 0;

            // random velocity vector
            const dir = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ).normalize();
            const speed = 0.6 + Math.random() * 2.0;
            vel[i * 3] = dir.x * speed;
            vel[i * 3 + 1] = dir.y * speed;
            vel[i * 3 + 2] = dir.z * speed;
        }
        return { positions: pos, velocities: vel };
    }, [particleCount]);

    // BufferGeometry for particles
    const particlesGeo = useMemo(() => {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return g;
    }, [positions]);

    useFrame((state, delta) => {
        if (!play) return;

        if (!impactRef.current) {
            // advance progress
            progressRef.current += delta / Math.max(0.001, duration);
            const t = Math.min(1, progressRef.current);

            // linear interpolation (could replace with easing)
            const px = THREE.MathUtils.lerp(start[0], target[0], t);
            const py = THREE.MathUtils.lerp(start[1], target[1], t);
            const pz = THREE.MathUtils.lerp(start[2], target[2], t);

            if (asteroidRef.current) {
                asteroidRef.current.position.set(px, py, pz);
                asteroidRef.current.rotation.x += 0.1;
                asteroidRef.current.rotation.y += 0.14;
            }

            if (t >= 1) {
                // impact!
                impactRef.current = true;
                explosionTime.current = 0;
                // position shock and particles at impact point
                if (shockRef.current) shockRef.current.position.set(px, py, pz);
                if (pointsRef.current) pointsRef.current.position.set(px, py, pz);
            }
        } else {
            // Explosion animation
            explosionTime.current += delta;
            const e = explosionTime.current;

            // shock sphere expands then fades
            if (shockRef.current) {
                const scale = 0.5 + e * 6;
                shockRef.current.scale.setScalar(scale);
                const mat = (shockRef.current.material as THREE.MeshBasicMaterial);
                if (mat) {
                    mat.opacity = Math.max(0, 1 - e * 1.5);
                    mat.transparent = true;
                }
            }

            // advance particles positions using velocities
            if (pointsRef.current) {
                const posAttr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
                for (let i = 0; i < particleCount; i++) {
                    const ix = i * 3;
                    // simple physics: pos += vel * dt, damped by time
                    positions[ix] += velocities[ix] * delta * Math.max(0, 1 - e * 0.8);
                    positions[ix + 1] += velocities[ix + 1] * delta * Math.max(0, 1 - e * 0.8);
                    positions[ix + 2] += velocities[ix + 2] * delta * Math.max(0, 1 - e * 0.8);
                }
                posAttr.needsUpdate = true;
            }

            // finish explosion after short time
            if (e > 1.6) {
                // notify completion and stop updates
                if (onComplete) onComplete();
                // stop rendering particles by shrinking opacity on material
                if (pointsRef.current) {
                    const mat = (pointsRef.current.material as THREE.PointsMaterial);
                    if (mat) mat.opacity = 0;
                }
            }
        }
    });

    return (
        <group>
            {/* moving asteroid */}
            <mesh ref={asteroidRef} position={start}>
                <sphereGeometry args={[size, 24, 24]} />
                <meshStandardMaterial color="#b36b00" metalness={0.2} roughness={0.8} />
            </mesh>

            {/* shock sphere */}
            <mesh ref={shockRef} position={[0, 0, 0]} scale={[0.001, 0.001, 0.001]}>
                <sphereGeometry args={[0.2, 32, 32]} />
                <meshBasicMaterial color="#ffd27f" transparent opacity={0} side={THREE.FrontSide} depthWrite={false} />
            </mesh>

            {/* particles */}
            <points ref={pointsRef} geometry={particlesGeo} position={[0, 0, 0]}>
                <pointsMaterial size={0.06} color="#ffb86b" transparent opacity={0.9} depthWrite={false} />
            </points>
        </group>
    );
}

export default AsteroidImpact;
