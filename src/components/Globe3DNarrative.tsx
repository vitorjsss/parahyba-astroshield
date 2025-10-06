/// <reference path="../types/three-fiber.d.ts" />
import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree, ThreeEvent, extend } from '@react-three/fiber';
import { OrbitControls, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { NASAAsteroid } from '../types/nasa';
import { Badge } from './ui/badge';
import { AlertTriangle, TrendingUp, Zap } from 'lucide-react';

// Extend para adicionar elementos THREE.js ao JSX
extend(THREE);

interface Globe3DNarrativeProps {
    asteroids: NASAAsteroid[];
    onAsteroidClick?: (asteroid: NASAAsteroid) => void;
    selectedAsteroid?: NASAAsteroid | null;
    autoRotate?: boolean;
    controlsRef?: React.MutableRefObject<any>;
    focusedAsteroid?: NASAAsteroid | null;
    onSimulateImpact?: (asteroid: NASAAsteroid) => void;
    isStep4?: boolean; // Nova propriedade para controlar animação do Step4
}

function CameraController({
    focusedAsteroid,
    asteroids,
    controlsRef,
    isStep4
}: {
    focusedAsteroid: NASAAsteroid | null;
    asteroids: NASAAsteroid[];
    controlsRef: React.MutableRefObject<any>;
    isStep4?: boolean;
}) {
    const { camera } = useThree();
    const targetPosition = useRef(new THREE.Vector3());
    const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
    const isAnimating = useRef(false);
    const animationProgress = useRef(0);
    const startPosition = useRef(new THREE.Vector3());
    const startLookAt = useRef(new THREE.Vector3());

    // Animação da câmera para Step4 - removida pois será feita no useFrame
    // useEffect removido para usar timing sincronizado

    useEffect(() => {
        if (!isStep4 && focusedAsteroid) {
            // Configuração para focar diretamente no asteroide
            // Posição da câmera - próxima ao asteroide para foco direto
            const cameraPos = new THREE.Vector3(
                8.5,  // Ligeiramente além do asteroide (que está em 7.5)
                1.5,  // Elevação moderada para perspectiva
                2.0   // Distância lateral para boa visualização
            );

            // Câmera olha diretamente para o asteroide
            const lookAtPoint = new THREE.Vector3(7.5, 0, 0);

            // Store current position/target for smooth transition
            startPosition.current.copy(camera.position);
            if (controlsRef.current) {
                startLookAt.current.copy(controlsRef.current.target);
            } targetPosition.current.copy(cameraPos);
            targetLookAt.current.copy(lookAtPoint);

            isAnimating.current = true;
            animationProgress.current = 0;
        } else {
            // Reset to default view showing Earth
            targetPosition.current.set(0, 0, 5);
            targetLookAt.current.set(0, 0, 0);

            startPosition.current.copy(camera.position);
            if (controlsRef.current) {
                startLookAt.current.copy(controlsRef.current.target);
            }

            isAnimating.current = true;
            animationProgress.current = 0;
        }
    }, [focusedAsteroid, asteroids, camera, controlsRef]);

    useFrame((_state) => {
        if (isStep4) {
            // Lógica específica para Step4 - câmera segue o asteroide
            const elapsed = _state.clock.getElapsedTime();
            const duration = 8; // 8 segundos - animação mais rápida
            const progress = Math.min(elapsed / duration, 1);

            const startDistance = 20;
            const endDistance = 2.5;
            const asteroidDistance = startDistance - (startDistance - endDistance) * progress;

            // Câmera posicionada atrás e ligeiramente acima do asteroide
            const cameraOffset = 4; // Distância da câmera em relação ao asteroide
            const cameraHeight = 2; // Altura da câmera

            const cameraPos = new THREE.Vector3(
                asteroidDistance + cameraOffset, // Seguir o asteroide com offset
                cameraHeight,                    // Manter altura constante
                1.5                             // Posição lateral para boa visualização
            );

            // Câmera olha para o asteroide
            const asteroidPos = new THREE.Vector3(asteroidDistance, 0, 0);

            // Aplicar posição suavemente
            camera.position.lerp(cameraPos, 0.08);
            camera.lookAt(asteroidPos);

            if (controlsRef.current) {
                controlsRef.current.target.lerp(asteroidPos, 0.08);
                controlsRef.current.update();
            }

            // Não executar outras animações durante Step4
            return;
        }

        // Animações normais para outros casos
        if (isAnimating.current && animationProgress.current < 1) {
            animationProgress.current += 0.02; // Animation speed

            // Easing function (ease-in-out)
            const t = animationProgress.current;
            const eased = t < 0.5
                ? 2 * t * t
                : -1 + (4 - 2 * t) * t;

            // Interpolate camera position
            camera.position.lerpVectors(
                startPosition.current,
                targetPosition.current,
                eased
            );

            // Interpolate controls target
            if (controlsRef.current) {
                controlsRef.current.target.lerpVectors(
                    startLookAt.current,
                    targetLookAt.current,
                    eased
                );
                controlsRef.current.update();
            }

            if (animationProgress.current >= 1) {
                isAnimating.current = false;
            }
        }
    });

    return null;
}

function Earth() {
    const earthRef = useRef<THREE.Mesh>(null);
    const cloudsRef = useRef<THREE.Mesh>(null);

    // Load realistic Earth texture
    // Use three.js example planet textures for a more realistic globe
    const earthTextures = useMemo(() => {
        const loader = new THREE.TextureLoader();
        return {
            map: loader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'),
            normalMap: loader.load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg'),
            specularMap: loader.load('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg'),
            // cloud layer (with alpha)
            clouds: loader.load('https://threejs.org/examples/textures/planets/earth_clouds_1024.png'),
        };
    }, []);

    // clouds texture is provided above via earthTextures.clouds

    useFrame((_state) => {
        if (earthRef.current) {
            earthRef.current.rotation.y += 0.0005;
        }
        if (cloudsRef.current) {
            cloudsRef.current.rotation.y += 0.0008; // Slightly faster than Earth
        }
    });

    return (
        <>
            {/* Earth (diffuse + normal + specular) */}
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

            {/* Clouds layer (separate transparent mesh) */}
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

            {/* Soft atmosphere glow (backside to create halo) */}
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

// Particle system for selected asteroid
function AsteroidParticles({ position, color }: { position: [number, number, number]; color: string }) {
    const particlesRef = useRef<THREE.Points>(null);

    const particlesGeometry = useMemo(() => {
        const geometry = new THREE.BufferGeometry();
        const count = 30;
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const radius = 0.1 + Math.random() * 0.2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return geometry;
    }, []);

    useFrame((_state) => {
        if (particlesRef.current) {
            particlesRef.current.rotation.y = _state.clock.elapsedTime * 0.5;
            particlesRef.current.rotation.x = _state.clock.elapsedTime * 0.3;
        }
    });

    return (
        <points ref={particlesRef} position={position} geometry={particlesGeometry}>
            <pointsMaterial
                size={0.03}
                color={color}
                transparent
                opacity={0.6}
                sizeAttenuation={true}
            />
        </points>
    );
}

function Asteroid({
    asteroid,
    index,
    onClick,
    isSelected,
    isFocused,
    onSimulateImpact,
    isStep4
}: {
    asteroid: NASAAsteroid;
    index: number;
    onClick: () => void;
    isSelected: boolean;
    isFocused?: boolean;
    onSimulateImpact?: (a: NASAAsteroid) => void;
    isStep4?: boolean;
}) {
    // ...existing code...
    const asteroidRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Mesh>(null);
    const spriteRef = useRef<THREE.Sprite>(null);
    const [hovered, setHovered] = useState(false);
    const [useSprite, setUseSprite] = useState(false);
    const { camera } = useThree();

    const closeApproach = asteroid.close_approach_data[0];
    const missDistanceKm = parseFloat(closeApproach.miss_distance.kilometers);
    const velocity = parseFloat(closeApproach.relative_velocity.kilometers_per_second);

    // Color based on hazard level
    const color = asteroid.is_potentially_hazardous_asteroid
        ? '#ef4444'
        : asteroid.is_sentry_object
            ? '#f97316'
            : '#60a5fa';

    // Load asteroid texture
    const asteroidTexture = useMemo(() => {
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('https://images.unsplash.com/photo-1638716000957-e0e0e32817b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc3Rlcm9pZCUyMHJvY2slMjB0ZXh0dXJlfGVufDF8fHx8MTc1OTU4NTEyNXww&ixlib=rb-4.1.0&q=80&w=1080');
        return texture;
    }, []);

    // Create icon sprite texture
    const spriteTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d')!;

        // Create circular icon
        const gradient = ctx.createRadialGradient(64, 64, 10, 64, 64, 60);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.5, color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(64, 64, 60, 0, Math.PI * 2);
        ctx.fill();

        // Add inner highlight
        const highlightGradient = ctx.createRadialGradient(50, 50, 0, 64, 64, 40);
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = highlightGradient;
        ctx.beginPath();
        ctx.arc(64, 64, 40, 0, Math.PI * 2);
        ctx.fill();

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }, [color]);

    // Posição fixa e simples para narrativa
    const asteroidDistance = 7.5; // Distância aumentada em 3x

    // Posição simples na linha horizontal com animação para Step4
    const position: [number, number, number] = useMemo(() => {
        if (isStep4) {
            // Posição inicial para Step4 - será atualizada no useFrame
            return [20, 0, 0];
        } else {
            // Posição padrão para outros steps
            return [
                asteroidDistance, // Posição direta no eixo X
                0,               // No plano da Terra
                0,               // No plano da Terra
            ];
        }
    }, [isStep4, asteroidDistance]);

    // Asteroid size based on diameter
    const diameter = asteroid.estimated_diameter.meters.estimated_diameter_min;
    const size = Math.max(0.02, Math.min(0.15, diameter / 1000));



    useFrame((_state) => {
        // Calculate distance from camera
        const asteroidPosition = new THREE.Vector3(...position);
        const distanceFromCamera = camera.position.distanceTo(asteroidPosition);

        // Switch to sprite if far away (performance optimization)
        const shouldUseSprite = distanceFromCamera > 8 && !isFocused;
        setUseSprite(shouldUseSprite);

        if (asteroidRef.current) {
            // Step4 animation - move asteroid towards Earth
            if (isStep4) {
                const elapsed = _state.clock.getElapsedTime();
                const duration = 8; // 8 segundos - animação mais rápida
                const progress = Math.min(elapsed / duration, 1);

                const startDistance = 20;
                const endDistance = 2.5;
                const currentDistance = startDistance - (startDistance - endDistance) * progress;

                asteroidRef.current.position.x = currentDistance;
                asteroidRef.current.position.y = 0;
                asteroidRef.current.position.z = 0;
            } else {
                // Normal floating animation for other steps
                asteroidRef.current.position.x = position[0];
                asteroidRef.current.position.y = position[1] + Math.sin(_state.clock.elapsedTime + index) * 0.05;
                asteroidRef.current.position.z = position[2];
            }

            asteroidRef.current.rotation.x += 0.01;
            asteroidRef.current.rotation.y += 0.01;
        }

        if (spriteRef.current) {
            // Step4 animation for sprite as well
            if (isStep4) {
                const elapsed = _state.clock.getElapsedTime();
                const duration = 8; // 8 segundos - animação mais rápida
                const progress = Math.min(elapsed / duration, 1);

                const startDistance = 20;
                const endDistance = 2.5;
                const currentDistance = startDistance - (startDistance - endDistance) * progress;

                spriteRef.current.position.x = currentDistance;
                spriteRef.current.position.y = 0;
                spriteRef.current.position.z = 0;
            } else {
                spriteRef.current.position.x = position[0];
                spriteRef.current.position.y = position[1] + Math.sin(_state.clock.elapsedTime + index) * 0.05;
                spriteRef.current.position.z = position[2];
            }
        }

        // Pulsing glow for focused asteroid
        if (glowRef.current && isFocused) {
            const pulse = Math.sin(_state.clock.elapsedTime * 2) * 0.3 + 0.7;
            glowRef.current.scale.setScalar(pulse);
        }
    });

    return (
        <>
            {/* Detailed 3D asteroid (when close) */}
            {!useSprite ? (
                <>
                    <mesh
                        ref={asteroidRef}
                        position={position}
                        onClick={(e: ThreeEvent<MouseEvent>) => {
                            e.stopPropagation();
                            onClick();
                        }}
                        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
                            e.stopPropagation();
                            setHovered(true);
                            document.body.style.cursor = 'pointer';
                        }}
                        onPointerOut={() => {
                            setHovered(false);
                            document.body.style.cursor = 'default';
                        }}
                    >
                        <sphereGeometry args={[size, 16, 16]} />
                        <meshStandardMaterial
                            map={asteroidTexture}
                            roughness={0.9}
                            metalness={0.1}
                        />
                    </mesh>
                </>
            ) : (
                /* Sprite icon (when far) */
                <sprite
                    ref={spriteRef}
                    position={position}
                    scale={[size * 4, size * 4, 1]}
                    onClick={(e: ThreeEvent<MouseEvent>) => {
                        e.stopPropagation();
                        onClick();
                    }}
                    onPointerOver={(e: ThreeEvent<PointerEvent>) => {
                        e.stopPropagation();
                        setHovered(true);
                        document.body.style.cursor = 'pointer';
                    }}
                    onPointerOut={() => {
                        setHovered(false);
                        document.body.style.cursor = 'default';
                    }}
                >
                    <spriteMaterial
                        map={spriteTexture}
                        transparent
                        opacity={isSelected || hovered ? 1 : 0.8}
                        depthWrite={false}
                    />
                </sprite>
            )}

            {/* Extra visual effects for focused asteroid */}
            {isFocused && (
                <>
                    {/* Direction indicator lines */}
                    <Line
                        points={[
                            new THREE.Vector3(position[0], position[1] - size * 5, position[2]),
                            new THREE.Vector3(position[0], position[1] + size * 5, position[2])
                        ]}
                        color={color}
                        lineWidth={1}
                        transparent
                        opacity={0.2}
                    />
                </>
            )}

            {/* Hover tooltip with HTML */}
            {hovered && !isSelected && (
                <Html
                    position={[position[0], position[1] + size + 0.3, position[2]]}
                    center
                    distanceFactor={10}
                    style={{ pointerEvents: 'none' }}
                >
                    <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-2 shadow-xl min-w-[200px]">
                        <p className="font-medium mb-1">{asteroid.name}</p>
                        <div className="space-y-0.5 opacity-80">
                            <p className="flex items-center gap-2">
                                <TrendingUp className="w-3 h-3 opacity-60" />
                                <span className="opacity-60">Size:</span> {diameter.toFixed(0)}m
                            </p>
                            <p className="flex items-center gap-2">
                                <Zap className="w-3 h-3 opacity-60" />
                                <span className="opacity-60">Velocity:</span> {velocity.toFixed(1)} km/s
                            </p>
                        </div>
                        {asteroid.is_potentially_hazardous_asteroid && (
                            <Badge variant="destructive" className="mt-2 text-xs">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Hazardous
                            </Badge>
                        )}
                    </div>
                </Html>
            )}

            {/* Connecting line from asteroid to label */}
            {(hovered || isSelected) && (
                <Line
                    points={[
                        new THREE.Vector3(position[0], position[1], position[2]),
                        new THREE.Vector3(position[0], position[1] + size + 0.3, position[2])
                    ]}
                    color={color}
                    lineWidth={1}
                    transparent
                    opacity={0.3}
                />
            )}
        </>
    );
}

// Star field background
function Stars() {
    const starsRef = useRef<THREE.Points>(null);

    const { starsGeometry, starColors, starSizes } = useMemo(() => {
        const geometry = new THREE.BufferGeometry();
        const count = 5000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const radius = 15 + Math.random() * 35;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            // Vary star colors (white, blue-white, yellow-white)
            const colorVariation = Math.random();
            if (colorVariation < 0.7) {
                // White stars
                colors[i * 3] = 1;
                colors[i * 3 + 1] = 1;
                colors[i * 3 + 2] = 1;
            } else if (colorVariation < 0.85) {
                // Blue-white stars
                colors[i * 3] = 0.8;
                colors[i * 3 + 1] = 0.9;
                colors[i * 3 + 2] = 1;
            } else {
                // Yellow-white stars
                colors[i * 3] = 1;
                colors[i * 3 + 1] = 0.95;
                colors[i * 3 + 2] = 0.8;
            }

            // Vary star sizes
            sizes[i] = Math.random() * 0.08 + 0.02;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        return { starsGeometry: geometry, starColors: colors, starSizes: sizes };
    }, []);

    useFrame(() => {
        if (starsRef.current) {
            starsRef.current.rotation.y += 0.00005;
        }
    });

    return (
        <points ref={starsRef} geometry={starsGeometry}>
            <pointsMaterial
                size={0.05}
                vertexColors
                transparent
                opacity={0.9}
                sizeAttenuation={true}
                depthWrite={false}
            />
        </points>
    );
}

function Scene({ asteroids, onAsteroidClick, selectedAsteroid, autoRotate, controlsRef, focusedAsteroid, onSimulateImpact, isStep4 }: Globe3DNarrativeProps) {
    return (
        <>
            {/* Camera controller for smooth transitions */}
            <CameraController
                focusedAsteroid={focusedAsteroid || null}
                asteroids={asteroids}
                controlsRef={controlsRef!}
                isStep4={isStep4}
            />

            {/* Background stars */}
            <Stars />

            {/* Lighting setup for realistic space */}
            <ambientLight intensity={0.3} />

            {/* Sun light (main directional) */}
            <directionalLight
                position={[10, 5, 10]}
                intensity={2}
                castShadow
                color="#ffffff"
            />

            {/* Fill light (softer, opposite side) */}
            <directionalLight
                position={[-8, -4, -8]}
                intensity={0.2}
                color="#93c5fd"
            />

            {/* Earth ambient glow */}
            <pointLight position={[0, 0, 0]} intensity={0.4} color="#4a9eff" distance={5} decay={2} />

            {/* Background space light */}
            <hemisphereLight args={['#0a0e1a', '#000000', 0.2]} />

            {/* Earth */}
            <Earth />

            {/* Asteroids - hide during impact animation */}
            {asteroids.map((asteroid, index) => (
                <Asteroid
                    key={asteroid.id}
                    asteroid={asteroid}
                    index={index}
                    onClick={() => onAsteroidClick?.(asteroid)}
                    isSelected={selectedAsteroid?.id === asteroid.id}
                    isFocused={focusedAsteroid?.id === asteroid.id}
                    onSimulateImpact={() => onSimulateImpact && onSimulateImpact(asteroid)}
                    isStep4={isStep4}
                />
            ))}

            {/* Controls */}
            <OrbitControls
                ref={controlsRef}
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={0.2}
                maxDistance={20}
                autoRotate={autoRotate}
                autoRotateSpeed={0.5}
            />
        </>
    );
}

export function Globe3DNarrative({ asteroids, onAsteroidClick, selectedAsteroid, autoRotate, controlsRef, focusedAsteroid, onSimulateImpact, isStep4 }: Globe3DNarrativeProps) {
    return (
        <div className="w-full h-full bg-gradient-to-b from-[#000000] via-[#0a0e1a] to-[#1a1f35] relative">
            <Canvas
                camera={{ position: [0, 0, 6], fov: 60 }}
                gl={{
                    antialias: true,
                    alpha: false,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.2
                }}
            >
                {/* Space background color */}
                <color attach="background" args={['#000000']} />

                <Scene
                    asteroids={asteroids}
                    onAsteroidClick={onAsteroidClick}
                    selectedAsteroid={selectedAsteroid}
                    autoRotate={autoRotate}
                    controlsRef={controlsRef}
                    focusedAsteroid={focusedAsteroid}
                    onSimulateImpact={onSimulateImpact}
                    isStep4={isStep4}
                />
            </Canvas>
        </div>
    );
}
