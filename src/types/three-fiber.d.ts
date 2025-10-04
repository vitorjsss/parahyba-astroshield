// Global type declarations for React Three Fiber
import { Object3DNode, extend } from '@react-three/fiber'
import { ReactThreeFiber } from '@react-three/fiber'
import * as THREE from 'three'

// Extend the Three.js objects to be available as JSX elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: ReactThreeFiber.Object3DNode<THREE.Mesh, typeof THREE.Mesh>
      sphereGeometry: ReactThreeFiber.Object3DNode<THREE.SphereGeometry, typeof THREE.SphereGeometry>
      meshStandardMaterial: ReactThreeFiber.MaterialNode<THREE.MeshStandardMaterial, typeof THREE.MeshStandardMaterial>
      meshBasicMaterial: ReactThreeFiber.MaterialNode<THREE.MeshBasicMaterial, typeof THREE.MeshBasicMaterial>
      sprite: ReactThreeFiber.Object3DNode<THREE.Sprite, typeof THREE.Sprite>
      spriteMaterial: ReactThreeFiber.MaterialNode<THREE.SpriteMaterial, typeof THREE.SpriteMaterial>
      ringGeometry: ReactThreeFiber.Object3DNode<THREE.RingGeometry, typeof THREE.RingGeometry>
      points: ReactThreeFiber.Object3DNode<THREE.Points, typeof THREE.Points>
      pointsMaterial: ReactThreeFiber.MaterialNode<THREE.PointsMaterial, typeof THREE.PointsMaterial>
    }
  }
}