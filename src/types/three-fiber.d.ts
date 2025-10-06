// Global type declarations for React Three Fiber
import { Object3DNode } from '@react-three/fiber'
import * as THREE from 'three'

// Extend the Three.js objects to be available as JSX elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: Object3DNode<THREE.Group, typeof THREE.Group>
      mesh: Object3DNode<THREE.Mesh, typeof THREE.Mesh>
      sphereGeometry: Object3DNode<THREE.SphereGeometry, typeof THREE.SphereGeometry>
      meshStandardMaterial: Object3DNode<THREE.MeshStandardMaterial, typeof THREE.MeshStandardMaterial>
      meshBasicMaterial: Object3DNode<THREE.MeshBasicMaterial, typeof THREE.MeshBasicMaterial>
      meshPhongMaterial: Object3DNode<THREE.MeshPhongMaterial, typeof THREE.MeshPhongMaterial>
      meshLambertMaterial: Object3DNode<THREE.MeshLambertMaterial, typeof THREE.MeshLambertMaterial>
      sprite: Object3DNode<THREE.Sprite, typeof THREE.Sprite>
      spriteMaterial: Object3DNode<THREE.SpriteMaterial, typeof THREE.SpriteMaterial>
      ringGeometry: Object3DNode<THREE.RingGeometry, typeof THREE.RingGeometry>
      points: Object3DNode<THREE.Points, typeof THREE.Points>
      pointsMaterial: Object3DNode<THREE.PointsMaterial, typeof THREE.PointsMaterial>
      color: Object3DNode<THREE.Color, typeof THREE.Color>
      ambientLight: Object3DNode<THREE.AmbientLight, typeof THREE.AmbientLight>
      directionalLight: Object3DNode<THREE.DirectionalLight, typeof THREE.DirectionalLight>
      pointLight: Object3DNode<THREE.PointLight, typeof THREE.PointLight>
      hemisphereLight: Object3DNode<THREE.HemisphereLight, typeof THREE.HemisphereLight>
    }
  }
}

// Declarações para importação de imagens
declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
}