import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { NASAAsteroid } from '../types/nasa';
import { Badge } from './ui/badge';
import { AlertTriangle, TrendingUp, Zap } from 'lucide-react';

interface Globe3DProps {
  asteroids: NASAAsteroid[];
  onAsteroidClick?: (asteroid: NASAAsteroid) => void;
  selectedAsteroid?: NASAAsteroid | null;
  autoRotate?: boolean;
  controlsRef?: React.MutableRefObject<any>;
  focusedAsteroid?: NASAAsteroid | null;
}

// Camera controller for smooth transitions
function CameraController({
  focusedAsteroid,
  asteroids,
  controlsRef
}: {
  focusedAsteroid: NASAAsteroid | null;
  asteroids: NASAAsteroid[];
  controlsRef: React.MutableRefObject<any>;
}) {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const isAnimating = useRef(false);
  const animationProgress = useRef(0);
  const startPosition = useRef(new THREE.Vector3());
  const startLookAt = useRef(new THREE.Vector3());

  useEffect(() => {
    if (focusedAsteroid) {
      // Find asteroid index and calculate position
      const index = asteroids.findIndex(a => a.id === focusedAsteroid.id);
      if (index !== -1) {
        const closeApproach = focusedAsteroid.close_approach_data[0];
        const missDistanceKm = parseFloat(closeApproach.miss_distance.kilometers);

        const distance = 2 + (missDistanceKm / 100000);
        const angle = (index * 0.5) % (Math.PI * 2);
        const elevation = (Math.sin(index * 0.7) * 0.5);

        const asteroidPos = new THREE.Vector3(
          Math.cos(angle) * distance,
          elevation * distance,
          Math.sin(angle) * distance
        );

        // Calculate camera position (closer to asteroid for better view)
        const diameter = focusedAsteroid.estimated_diameter.meters.estimated_diameter_min;
        const size = Math.max(0.02, Math.min(0.15, diameter / 1000));

        // Position camera at a good distance from the asteroid
        const cameraDistance = Math.max(0.3, size * 4);
        const offset = asteroidPos.clone().normalize().multiplyScalar(cameraDistance);
        targetPosition.current.copy(asteroidPos).add(offset);
        targetLookAt.current.copy(asteroidPos);

        // Start animation
        startPosition.current.copy(camera.position);
        if (controlsRef.current) {
          startLookAt.current.copy(controlsRef.current.target);
        }
        isAnimating.current = true;
        animationProgress.current = 0;
      }
    } else {
      // Return to Earth view
      targetPosition.current.set(0, 0, 8);
      targetLookAt.current.set(0, 0, 0);
      startPosition.current.copy(camera.position);
      if (controlsRef.current) {
        startLookAt.current.copy(controlsRef.current.target);
      }
      isAnimating.current = true;
      animationProgress.current = 0;
    }
  }, [focusedAsteroid, asteroids, camera, controlsRef]);

  useFrame(() => {
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
  isFocused
}: {
  asteroid: NASAAsteroid;
  index: number;
  onClick: () => void;
  isSelected: boolean;
  isFocused?: boolean;
}) {
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

  // Calculate position based on miss distance and time
  const distance = 2 + (missDistanceKm / 100000); // Scale distance
  const angle = (index * 0.5) % (Math.PI * 2); // Distribute asteroids around Earth
  const elevation = (Math.sin(index * 0.7) * 0.5); // Vary elevation

  const position: [number, number, number] = [
    Math.cos(angle) * distance,
    elevation * distance,
    Math.sin(angle) * distance,
  ];

  // Asteroid size based on diameter
  const diameter = asteroid.estimated_diameter.meters.estimated_diameter_min;
  const size = Math.max(0.02, Math.min(0.15, diameter / 1000));

  // Create trajectory path
  const trajectoryPoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const steps = 50;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const currentAngle = angle - (t * Math.PI * 0.3);
      const currentDistance = distance * (1 - t * 0.3);

      points.push(new THREE.Vector3(
        Math.cos(currentAngle) * currentDistance,
        elevation * currentDistance * (1 - t * 0.2),
        Math.sin(currentAngle) * currentDistance
      ));
    }

    return points;
  }, [angle, distance, elevation]);

  // Calculate energy for display
  const volume = (4 / 3) * Math.PI * Math.pow(diameter / 2, 3);
  const mass = volume * 3000;
  const energyJoules = 0.5 * mass * Math.pow(velocity * 1000, 2);
  const energyMegatons = energyJoules / (4.184 * Math.pow(10, 15));

  useFrame((_state) => {
    // Calculate distance from camera
    const asteroidPosition = new THREE.Vector3(...position);
    const distanceFromCamera = camera.position.distanceTo(asteroidPosition);

    // Switch to sprite if far away (performance optimization)
    const shouldUseSprite = distanceFromCamera > 8 && !isFocused;
    setUseSprite(shouldUseSprite);

    if (asteroidRef.current) {
      // Gentle floating animation
      asteroidRef.current.position.y = position[1] + Math.sin(_state.clock.elapsedTime + index) * 0.05;
      asteroidRef.current.rotation.x += 0.01;
      asteroidRef.current.rotation.y += 0.01;
    }

    if (spriteRef.current) {
      spriteRef.current.position.y = position[1] + Math.sin(_state.clock.elapsedTime + index) * 0.05;
    }

    // Pulsing glow for focused asteroid
    if (glowRef.current && isFocused) {
      const pulse = Math.sin(_state.clock.elapsedTime * 2) * 0.3 + 0.7;
      glowRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <>
      {/* Trajectory line */}
      <Line
        points={trajectoryPoints}
        color={color}
        lineWidth={isSelected ? 2 : 1}
        transparent
        opacity={isSelected ? 0.6 : 0.2}
      />

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
              color={color}
              emissive={color}
              emissiveIntensity={isSelected || hovered ? 0.5 : 0.2}
              roughness={0.9}
              metalness={0.1}
            />
          </mesh>

          {/* Outer glow rim for better visibility */}
          <mesh position={position}>
            <sphereGeometry args={[size * 1.1, 16, 16]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={isSelected || hovered ? 0.3 : 0.15}
              side={THREE.BackSide}
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

      {/* Selection ring */}
      {isSelected && (
        <>
          <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[size * 1.5, size * 2, 32]} />
            <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.5} />
          </mesh>

          {/* Pulsing outer ring */}
          <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[size * 2.5, size * 3, 32]} />
            <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.2} />
          </mesh>

          {/* Particle effect */}
          <AsteroidParticles position={position} color={color} />

          {/* Glow sphere */}
          <mesh ref={glowRef} position={position}>
            <sphereGeometry args={[size * 2, 16, 16]} />
            <meshBasicMaterial color={color} transparent opacity={isFocused ? 0.2 : 0.1} />
          </mesh>
        </>
      )}

      {/* Extra visual effects for focused asteroid */}
      {isFocused && (
        <>
          {/* Larger pulsing ring */}
          <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[size * 4, size * 4.5, 32]} />
            <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.15} />
          </mesh>

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

      {/* Selected asteroid detailed info */}
      {isSelected && (
        <Html
          position={[position[0], position[1] + size + 0.5, position[2]]}
          center
          distanceFactor={10}
          style={{ pointerEvents: 'none' }}
        >
          <div className="bg-card/95 backdrop-blur-sm border-2 border-primary/50 rounded-lg px-4 py-3 shadow-xl min-w-[280px]">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium mb-0.5">{asteroid.name}</p>
                <p className="opacity-60">ID: {asteroid.id}</p>
              </div>
              {asteroid.is_potentially_hazardous_asteroid && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  PHA
                </Badge>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-border/30">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="opacity-60">Diameter</p>
                  <p className="font-medium">{diameter.toFixed(0)}m</p>
                </div>
                <div>
                  <p className="opacity-60">Velocity</p>
                  <p className="font-medium">{velocity.toFixed(2)} km/s</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="opacity-60">Miss Dist.</p>
                  <p className="font-medium">{parseFloat(closeApproach.miss_distance.lunar).toFixed(2)} LD</p>
                </div>
                <div>
                  <p className="opacity-60">Energy</p>
                  <p className="font-medium">{energyMegatons.toFixed(2)} MT</p>
                </div>
              </div>

              <div className="pt-2 border-t border-border/30">
                <p className="opacity-60">Approach Date</p>
                <p className="font-medium">{closeApproach.close_approach_date}</p>
              </div>
            </div>
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

function Scene({ asteroids, onAsteroidClick, selectedAsteroid, autoRotate, controlsRef, focusedAsteroid }: Globe3DProps) {
  return (
    <>
      {/* Camera controller for smooth transitions */}
      <CameraController
        focusedAsteroid={focusedAsteroid || null}
        asteroids={asteroids}
        controlsRef={controlsRef!}
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

      {/* Asteroids */}
      {asteroids.map((asteroid, index) => (
        <Asteroid
          key={asteroid.id}
          asteroid={asteroid}
          index={index}
          onClick={() => onAsteroidClick?.(asteroid)}
          isSelected={selectedAsteroid?.id === asteroid.id}
          isFocused={focusedAsteroid?.id === asteroid.id}
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

export function Globe3D({ asteroids, onAsteroidClick, selectedAsteroid, autoRotate, controlsRef, focusedAsteroid }: Globe3DProps) {
  return (
    <div className="w-full h-full bg-gradient-to-b from-[#000000] via-[#0a0e1a] to-[#1a1f35]">
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
        />
      </Canvas>
    </div>
  );
}
