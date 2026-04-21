"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Float, PerspectiveCamera, Environment } from "@react-three/drei";
import * as THREE from "three";

interface CrystalProps {
  mode: "work" | "break";
  progress: number;
}

function CrystalMesh({ mode, progress }: CrystalProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Modlara göre renk ve bozulma efektleri
  const config = useMemo(() => {
    return mode === "work" 
      ? { color: "#ff6b5e", speed: 2 + progress * 5, distort: 0.4 } 
      : { color: "#4ade80", speed: 1.5, distort: 0.2 };
  }, [mode, progress]);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Zamanlayıcıya bağlı dönüş
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = time * (config.speed * 0.2);
    meshRef.current.rotation.y = time * (config.speed * 0.3);
    
    // Hafif nefes alma efekti
    const scale = 1 + Math.sin(time * 1.5) * 0.05;
    meshRef.current.scale.set(scale, scale, scale);
  });

  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[1, 0]} />
      <MeshDistortMaterial
        color={config.color}
        speed={config.speed}
        distort={config.distort}
        radius={1}
        emissive={config.color}
        emissiveIntensity={0.5}
        roughness={0.1}
        metalness={0.8}
      />
    </mesh>
  );
}

export default function FocusCrystal({ mode, progress }: CrystalProps) {
  return (
    <div className="crystal-container">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 4]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} />
        
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
          <CrystalMesh mode={mode} progress={progress} />
        </Float>
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
