import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AsteroidIconProps {
  position: [number, number, number];
  color: string;
  isHazardous: boolean;
  size: number;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
}

export function AsteroidIcon({ 
  position, 
  color, 
  isHazardous, 
  size, 
  onClick, 
  onHover 
}: AsteroidIconProps) {
  const spriteRef = useRef<THREE.Sprite>(null);

  // Create icon texture with hazard symbol
  const iconTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Create circular background
    const gradient = ctx.createRadialGradient(128, 128, 20, 128, 128, 120);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.7, color);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(128, 128, 120, 0, Math.PI * 2);
    ctx.fill();

    // Add hazard warning if applicable
    if (isHazardous) {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(128, 128, 80, 0, Math.PI * 2);
      ctx.stroke();

      // Warning triangle
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(128, 90);
      ctx.lineTo(150, 130);
      ctx.lineTo(106, 130);
      ctx.closePath();
      ctx.fill();

      // Exclamation mark
      ctx.fillStyle = '#000000';
      ctx.fillRect(125, 100, 6, 15);
      ctx.fillRect(125, 120, 6, 6);
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, [color, isHazardous]);

  useFrame((state) => {
    if (spriteRef.current && isHazardous) {
      // Gentle pulsing for hazardous asteroids
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1;
      spriteRef.current.scale.set(size * 6 * pulse, size * 6 * pulse, 1);
    }
  });

  return (
    <sprite
      ref={spriteRef}
      position={position}
      scale={[size * 6, size * 6, 1]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        onHover(false);
        document.body.style.cursor = 'default';
      }}
    >
      <spriteMaterial
        map={iconTexture}
        transparent
        opacity={0.9}
        depthWrite={false}
      />
    </sprite>
  );
}
