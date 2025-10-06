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
        const duration = 5.5; // 5.5 segundos para animação mais rápida e dramática

        if (elapsed < duration) {
            // Animação da câmera acompanhando o asteroide se aproximando da Terra
            const progress = elapsed / duration;

            // Aceleração igual à do asteroide
            const acceleratedProgress = progress < 0.3 ? progress * 0.1 : 0.03 + (progress - 0.3) * 1.39;
            const finalProgress = Math.min(acceleratedProgress, 1);

            // Câmera acompanha o asteroide de uma posição lateral fixa
            // Posição inicial do asteroide
            const asteroidStartX = 80;
            const asteroidStartY = 10;
            const asteroidStartZ = 15;

            // Posição atual do asteroide
            const asteroidDistance = 80 - (80 - 2.2) * finalProgress;
            const asteroidX = asteroidStartX * (asteroidDistance / 80);
            const asteroidY = asteroidStartY * (asteroidDistance / 80);
            const asteroidZ = asteroidStartZ * (asteroidDistance / 80);

            // Câmera posicionada para observar a trajetória
            camera.position.set(
                asteroidX + 20, // Lateral ao asteroide
                asteroidY + 15, // Acima do asteroide
                asteroidZ + 25  // Atrás do asteroide
            );

            // Câmera sempre olhando para o asteroide
            camera.lookAt(asteroidX, asteroidY, asteroidZ);
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
        const duration = 5.5; // 5.5 segundos - mesma duração da câmera (mais rápido)

        if (elapsed < duration) {
            const progress = elapsed / duration;

            // Asteroide começa extremamente longe e se aproxima DIRETAMENTE da Terra
            const startDistance = 80; // Começar extremamente longe para impacto visual
            const endDistance = 2.2; // Para bem próximo da Terra

            // Trajetória com aceleração extremamente rápida (velocidade real de asteroide)
            const acceleratedProgress = progress < 0.3 ? progress * 0.1 : 0.03 + (progress - 0.3) * 1.39;
            const finalProgress = Math.min(acceleratedProgress, 1);

            // Posição atual da distância (diminuindo conforme se aproxima)
            const currentDistance = startDistance - (startDistance - endDistance) * finalProgress;

            // Trajetória DIRETA em direção à Terra (0, 0, 0)
            // Asteroide vem de uma posição inicial e vai direto para a Terra
            const startX = 80; // Posição inicial X
            const startY = 10; // Posição inicial Y (levemente acima)
            const startZ = 15; // Posição inicial Z (levemente lateral)

            // Interpolação linear direta para a Terra
            const x = startX * (currentDistance / startDistance);
            const y = startY * (currentDistance / startDistance);
            const z = startZ * (currentDistance / startDistance);

            asteroidRef.current.position.set(x, y, z);

            // Rotação do asteroide muito rápida para impacto visual dramático
            asteroidRef.current.rotation.x += 0.08;
            asteroidRef.current.rotation.y += 0.05;

            // Aumento do tamanho conforme se aproxima (efeito perspectiva muito dramático)
            const scale = 0.1 + (1 - finalProgress) * 0.9;
            asteroidRef.current.scale.setScalar(scale);
        }
    });

    return (
        <>
            {/* Asteroide principal com textura natural */}
            <mesh ref={asteroidRef}>
                <sphereGeometry args={[size, 32, 32]} />
                <meshStandardMaterial
                    map={asteroidTexture}
                    roughness={0.8}
                    metalness={0.1}
                    color="#ffffff" // Cor neutra para manter textura natural
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