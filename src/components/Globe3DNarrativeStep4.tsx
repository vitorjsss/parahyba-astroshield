/// <reference path="../types/three-fiber.d.ts" />
import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { NASAAsteroid } from '../types/nasa';

// Extend para adicionar os elementos THREE.js ao JSX
extend(THREE);

interface Globe3DNarrativeStep4Props {
    asteroids: NASAAsteroid[];
    isStep4Active: boolean;
}

function AnimatedCameraController({ isStep4Active }: { isStep4Active: boolean }) {
    const { camera } = useThree();
    const startTime = useRef<number | null>(null);

    useFrame(({ clock }) => {
        if (!isStep4Active) return;

        if (startTime.current === null) {
            startTime.current = clock.elapsedTime;
        }

        const elapsed = clock.elapsedTime - startTime.current;
        const duration = 15; // 15 segundos para aproximação

        if (elapsed < duration) {
            // Animação da câmera seguindo o asteroide se aproximando
            const progress = elapsed / duration;

            // Câmera começa distante e vai se aproximando da Terra
            const startX = 15; // Começar ainda mais longe
            const endX = 2.5; // Chegar mais perto da Terra
            const x = startX + (endX - startX) * progress;

            camera.position.set(x, 2, 4);
            camera.lookAt(0, 0, 0); // Sempre olhando para a Terra
        }
    });

    return null;
}

function Earth() {
    const earthRef = useRef<THREE.Mesh>(null);
    const cloudsRef = useRef<THREE.Mesh>(null);

    const earthTextures = useMemo(() => {
        const loader = new THREE.TextureLoader();
        return {
            map: loader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'),
            normalMap: loader.load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg'),
            specularMap: loader.load('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg'),
            clouds: loader.load('https://threejs.org/examples/textures/planets/earth_clouds_1024.png'),
        };
    }, []);

    useFrame(() => {
        if (earthRef.current) {
            earthRef.current.rotation.y += 0.0005;
        }
        if (cloudsRef.current) {
            cloudsRef.current.rotation.y += 0.0008;
        }
    });

    return (
        <>
            <mesh ref={earthRef}>
                <sphereGeometry args={[2, 128, 128]} />
                <meshPhongMaterial
                    map={earthTextures.map}
                    normalMap={earthTextures.normalMap}
                    specularMap={earthTextures.specularMap}
                    specular={new THREE.Color(0x222222)}
                    shininess={10}
                />
            </mesh>

            <mesh ref={cloudsRef}>
                <sphereGeometry args={[2.02, 128, 128]} />
                <meshPhongMaterial
                    map={earthTextures.clouds}
                    transparent
                    opacity={0.45}
                    depthWrite={false}
                    side={THREE.FrontSide}
                />
            </mesh>

            <mesh>
                <sphereGeometry args={[2.12, 64, 64]} />
                <meshBasicMaterial
                    color="#60a5fa"
                    transparent
                    opacity={0.08}
                    side={THREE.BackSide}
                />
            </mesh>
        </>
    );
}

function ApproachingAsteroid({
    isStep4Active
}: {
    isStep4Active: boolean;
}) {
    const asteroidRef = useRef<THREE.Mesh>(null);
    const startTime = useRef<number | null>(null);

    // Tamanho aumentado para impacto visual
    const size = 0.3;

    // Criar textura do asteroide
    const asteroidTexture = useMemo(() => {
        const textureLoader = new THREE.TextureLoader();
        return textureLoader.load('https://images.unsplash.com/photo-1638716000957-e0e0e32817b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc3Rlcm9pZCUyMHJvY2slMjB0ZXh0dXJlfGVufDF8fHx8MTc1OTU4NTEyNXww&ixlib=rb-4.1.0&q=80&w=1080');
    }, []);

    useFrame(({ clock }) => {
        if (!isStep4Active || !asteroidRef.current) return;

        if (startTime.current === null) {
            startTime.current = clock.elapsedTime;
        }

        const elapsed = clock.elapsedTime - startTime.current;
        const duration = 15; // 15 segundos

        if (elapsed < duration) {
            const progress = elapsed / duration;

            // Asteroide começa muito longe e se aproxima da Terra
            const startDistance = 20; // Começar ainda mais longe
            const endDistance = 2.2; // Para bem próximo da Terra
            const distance = startDistance + (endDistance - startDistance) * progress;

            // Trajetória em direção à Terra
            const x = distance * Math.cos(progress * 0.3);
            const y = distance * Math.sin(progress * 0.15) * 0.4;
            const z = distance * Math.sin(progress * 0.3) * 0.6;

            asteroidRef.current.position.set(x, y, z);

            // Rotação do asteroide
            asteroidRef.current.rotation.x += 0.02;
            asteroidRef.current.rotation.y += 0.01;

            // Aumento do tamanho conforme se aproxima (efeito perspectiva)
            const scale = 0.3 + (1 - progress) * 0.7;
            asteroidRef.current.scale.setScalar(scale);
        }
    });

    return (
        <>
            {/* Asteroide principal */}
            <mesh ref={asteroidRef}>
                <sphereGeometry args={[size, 32, 32]} />
                <meshStandardMaterial
                    map={asteroidTexture}
                    roughness={0.9}
                    metalness={0.1}
                />
            </mesh>

            {/* Brilho sutil ao redor */}
            <mesh position={asteroidRef.current?.position}>
                <sphereGeometry args={[size * 1.1, 16, 16]} />
                <meshBasicMaterial
                    color="#ffaa44"
                    transparent
                    opacity={0.2}
                    side={THREE.BackSide}
                />
            </mesh>
        </>
    );
}

function Stars() {
    const starsRef = useRef<THREE.Points>(null);

    const starsGeometry = useMemo(() => {
        const geometry = new THREE.BufferGeometry();
        const count = 3000;
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const radius = 20 + Math.random() * 30;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return geometry;
    }, []);

    return (
        <points ref={starsRef} geometry={starsGeometry}>
            <pointsMaterial
                size={0.03}
                color="white"
                transparent
                opacity={0.8}
                sizeAttenuation={true}
            />
        </points>
    );
}

function Scene({ asteroids, isStep4Active }: Globe3DNarrativeStep4Props) {
    return (
        <>
            <AnimatedCameraController isStep4Active={isStep4Active} />

            <Stars />

            {/* Iluminação */}
            <ambientLight intensity={0.3} />
            <directionalLight
                position={[10, 5, 10]}
                intensity={2}
                color="#ffffff"
            />
            <pointLight position={[0, 0, 0]} intensity={0.4} color="#4a9eff" distance={5} decay={2} />

            <Earth />

            {/* Asteroide se aproximando */}
            {asteroids.length > 0 && (
                <ApproachingAsteroid
                    asteroid={asteroids[0]}
                    isStep4Active={isStep4Active}
                />
            )}

            <OrbitControls
                enabled={false} // Desabilitar controles durante a animação
            />
        </>
    );
}

export function Globe3DNarrativeStep4({ asteroids, isStep4Active }: Globe3DNarrativeStep4Props) {
    return (
        <div className="w-full h-full bg-gradient-to-b from-[#000000] via-[#0a0e1a] to-[#1a1f35] relative">
            <Canvas
                camera={{ position: [12, 2, 4], fov: 60 }}
                gl={{
                    antialias: true,
                    alpha: false,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.2
                }}
            >
                <color attach="background" args={['#000000']} />

                <Scene
                    asteroids={asteroids}
                    isStep4Active={isStep4Active}
                />
            </Canvas>
        </div>
    );
}