/// <reference path="../types/three-fiber.d.ts" />
import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { NASAAsteroid } from '../types/nasa';

interface ImpactAnimationScreenProps {
    asteroid: NASAAsteroid;
    onComplete: () => void;
}

// ==========================
// 🎥 Camera Shake Controller (mais curto e controlado)
// ==========================
function CameraShakeController({
    impactTriggered,
}: {
    impactTriggered: boolean;
}) {
    const { camera } = useThree();
    const originalPosition = useRef(new THREE.Vector3());
    const startTime = useRef<number | null>(null);
    const SHAKE_DURATION = 0.3; // 0.3s curto e intenso

    useEffect(() => {
        originalPosition.current.copy(camera.position);
    }, [camera]);

    useFrame((state) => {
        if (!impactTriggered) {
            startTime.current = null;
            return;
        }

        if (startTime.current === null) startTime.current = state.clock.elapsedTime;
        const elapsed = state.clock.elapsedTime - startTime.current;

        if (elapsed >= 0 && elapsed < SHAKE_DURATION) {
            // intensidade decresce rapidamente
            const intensity = (1 - elapsed / SHAKE_DURATION) * 1.0;
            const shakeX = (Math.random() - 0.5) * intensity;
            const shakeY = (Math.random() - 0.5) * intensity;
            const shakeZ = (Math.random() - 0.5) * intensity;
            camera.position.copy(originalPosition.current);
            camera.position.add(new THREE.Vector3(shakeX, shakeY, shakeZ));
        } else {
            // restore final position
            camera.position.copy(originalPosition.current);
        }
    });

    return null;
}

// ==========================
// 🌍 Earth
// ==========================
function Earth() {
    const earthRef = useRef<THREE.Mesh>(null);
    const cloudsRef = useRef<THREE.Mesh>(null);

    const textures = useMemo(() => {
        const loader = new THREE.TextureLoader();
        return {
            map: loader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'),
            normal: loader.load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg'),
            specular: loader.load('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg'),
            clouds: loader.load('https://threejs.org/examples/textures/planets/earth_clouds_1024.png'),
        };
    }, []);

    useFrame(() => {
        if (earthRef.current) earthRef.current.rotation.y += 0.001;
        if (cloudsRef.current) cloudsRef.current.rotation.y += 0.0012;
    });

    return (
        <>
            <mesh ref={earthRef}>
                <sphereGeometry args={[2, 128, 128]} />
                <meshPhongMaterial
                    map={textures.map}
                    normalMap={textures.normal}
                    specularMap={textures.specular}
                    specular={new THREE.Color(0x222222)}
                    shininess={10}
                />
            </mesh>

            <mesh ref={cloudsRef}>
                <sphereGeometry args={[2.02, 128, 128]} />
                <meshPhongMaterial
                    map={textures.clouds}
                    transparent
                    opacity={0.45}
                    depthWrite={false}
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

// ==========================
// ✨ Stars
// ==========================
function Stars() {
    const starsRef = useRef<THREE.Points>(null);

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const count = 8000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const r = 50 + Math.random() * 100;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);
            const c = Math.random();
            if (c < 0.7) {
                colors.set([1, 1, 1], i * 3);
            } else if (c < 0.85) {
                colors.set([0.8, 0.9, 1], i * 3);
            } else {
                colors.set([1, 0.95, 0.8], i * 3);
            }
        }
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        return geo;
    }, []);

    useFrame(() => {
        if (starsRef.current) starsRef.current.rotation.y += 0.00005;
    });

    return (
        <points ref={starsRef} geometry={geometry}>
            <pointsMaterial size={0.1} vertexColors transparent opacity={0.9} />
        </points>
    );
}

// ==========================
// ☄️ Animated Asteroid
// ==========================
function AnimatedAsteroid({
    asteroid,
    onImpact,
}: {
    asteroid: NASAAsteroid;
    onImpact: () => void;
}) {
    const asteroidRef = useRef<THREE.Mesh>(null);
    const { camera } = useThree();
    const [phase, setPhase] = useState<'approaching' | 'impact'>('approaching');
    const start = useRef(Date.now());

    const APPROACH_DURATION = 3000; // total de 3s
    const startPos = new THREE.Vector3(30, 10, 20);
    const endPos = new THREE.Vector3(0, 0, 2.1);

    useEffect(() => {
        camera.position.set(8, 4, 8);
        camera.lookAt(0, 0, 0);
    }, [camera]);

    useFrame(() => {
        if (!asteroidRef.current) return;
        const elapsed = Date.now() - start.current;

        if (phase === 'approaching' && elapsed < APPROACH_DURATION) {
            const progress = elapsed / APPROACH_DURATION;
            const eased = progress ** 3;
            asteroidRef.current.position.lerpVectors(startPos, endPos, eased);
            asteroidRef.current.rotation.x += 0.05;
            asteroidRef.current.rotation.y += 0.04;
        } else if (phase === 'approaching') {
            setPhase('impact');
            onImpact(); // 🚀 impacto inicia fade imediatamente
            asteroidRef.current.visible = false; // esconde asteroide após impacto
        }
    });

    return (
        <mesh ref={asteroidRef} position={startPos}>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial color="#654321" emissive="#FF4500" emissiveIntensity={0.6} />
        </mesh>
    );
}

// ==========================
// 💫 Explosion Effect (melhorado com partículas)
// ==========================
function ExplosionEffect({ active }: { active: boolean }) {
    const ref = useRef<THREE.Points>(null);
    const velocitiesRef = useRef<Float32Array | null>(null);

    const geometry = useMemo(() => {
        const g = new THREE.BufferGeometry();
        const count = 800;
        const pos = new Float32Array(count * 3);
        const vel = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // position starts at impact point
            pos[i * 3] = 0;
            pos[i * 3 + 1] = 0;
            pos[i * 3 + 2] = 2.1;

            // randomized velocity
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;
            const speed = 0.2 + Math.random() * 0.8;
            vel[i * 3] = Math.sin(theta) * Math.cos(phi) * speed;
            vel[i * 3 + 1] = Math.sin(theta) * Math.sin(phi) * speed;
            vel[i * 3 + 2] = Math.cos(theta) * speed;
        }

        g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        velocitiesRef.current = vel;
        return g;
    }, []);

    useFrame((_, delta) => {
        if (!active || !ref.current || !velocitiesRef.current) return;

        const positions = ref.current.geometry.attributes.position.array as Float32Array;
        const velocities = velocitiesRef.current;
        const count = velocities.length / 3;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            // update positions by velocity
            positions[i3] += velocities[i3] * delta * 5;
            positions[i3 + 1] += velocities[i3 + 1] * delta * 5;
            positions[i3 + 2] += velocities[i3 + 2] * delta * 5;

            // gravity-like effect on Y
            velocities[i3 + 1] -= 0.8 * delta;

            // slight damping
            velocities[i3] *= 0.995;
            velocities[i3 + 1] *= 0.995;
            velocities[i3 + 2] *= 0.995;
        }

        ref.current.geometry.attributes.position.needsUpdate = true;
    });

    if (!active) return null;

    return (
        <>
            {/* particles */}
            <points ref={ref} geometry={geometry}>
                <pointsMaterial size={0.15} vertexColors={false} color="#ff6600" transparent opacity={0.95} depthWrite={false} />
            </points>
        </>
    );
}

// ==========================
// 🪐 Scene
// ==========================
function AnimationScene({
    asteroid,
    onImpact,
}: {
    asteroid: NASAAsteroid;
    onImpact: () => void;
}) {
    const [impact, setImpact] = useState(false);

    const handleImpact = () => {
        setImpact(true);
        onImpact();
    };

    return (
        <>
            <CameraShakeController impactTriggered={impact} />
            <ambientLight intensity={0.3} />
            <directionalLight position={[10, 5, 10]} intensity={1.5} />
            <Stars />
            <Earth />
            <AnimatedAsteroid asteroid={asteroid} onImpact={handleImpact} />
            <ExplosionEffect active={impact} />
        </>
    );
}

// ==========================
// 🔴 Expanding Circle Fade (over the DOM, expands from center)
// ==========================
function ExpandingCircleFade({
    active,
    onFullWhite,
}: {
    active: boolean;
    onFullWhite: () => void;
}) {
    const [opacity, setOpacity] = useState(0);
    const [phase, setPhase] = useState<'expanding' | 'fullWhite'>('expanding');

    useEffect(() => {
        if (!active) {
            setOpacity(0);
            setPhase('expanding');
            return;
        }

        let start = performance.now();
        let raf = 0;

        const FADE_DURATION = 1500; // 1.5s para fade completo
        const animate = (t: number) => {
            const elapsed = t - start;
            const progress = Math.min(elapsed / FADE_DURATION, 1);

            // Fade suave e rápido
            const eased = 1 - Math.pow(1 - progress, 2);
            setOpacity(eased);

            if (progress >= 0.8 && phase === 'expanding') {
                setPhase('fullWhite');
                onFullWhite();
            }

            if (progress < 1) {
                raf = requestAnimationFrame(animate);
            }
        };

        raf = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(raf);
    }, [active, onFullWhite, phase]);

    if (!active) return null;

    return (
        <div
            className="fixed inset-0 z-50 pointer-events-none"
            style={{
                backgroundColor: `rgba(255, 255, 255, ${opacity})`,
                transition: 'none',
            }}
        />
    );
}

// ==========================
// 🌌 Impact Animation Screen (integra tudo)
// ==========================
export function ImpactAnimationScreen({
    asteroid,
    onComplete,
}: ImpactAnimationScreenProps) {
    const [fadeStarted, setFadeStarted] = useState(false);
    const [fadeFullyWhite, setFadeFullyWhite] = useState(false);

    // Quando o fade ficar totalmente branco, mantém por 1.5s antes de completar
    useEffect(() => {
        if (!fadeFullyWhite) return;
        const t = setTimeout(() => {
            onComplete();
        }, 1500); // 1.5s na tela branca
        return () => clearTimeout(t);
    }, [fadeFullyWhite, onComplete]);

    // chamada passada para a cena: inicia o fade (expansão)
    const handleImpact = () => {
        setFadeStarted(true);
    };

    return (
        <div className="relative w-full h-full bg-black">
            {/* Canvas 3D */}
            <Canvas
                camera={{ position: [8, 4, 8], fov: 60 }}
                gl={{
                    antialias: true,
                    alpha: false,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.2
                }}
            >
                <AnimationScene asteroid={asteroid} onImpact={handleImpact} />
            </Canvas>

            {/* Expanding circular fade overlay */}
            <ExpandingCircleFade active={fadeStarted} onFullWhite={() => setFadeFullyWhite(true)} />
        </div>
    );
}
