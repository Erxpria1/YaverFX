"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Float, PerspectiveCamera, Environment } from "@react-three/drei";
import * as THREE from "three";

interface CrystalProps {
  mode: "work" | "shortBreak" | "longBreak";
  progress: number;
}

function CrystalMesh({ mode, progress }: CrystalProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Modlara göre renk ve bozulma efektleri
  const config = useMemo(() => {
    switch (mode) {
      case "work":
        return { color: "#ff6b5e", speed: 2 + progress * 5, distort: 0.4 };
      case "shortBreak":
        return { color: "#4ade80", speed: 1.5, distort: 0.2 };
      case "longBreak":
        return { color: "#60a5fa", speed: 1.2, distort: 0.15 };
    }
  }, [mode, progress]);

  // 2026 Performance Pattern: Power-aware rendering
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Check for power saving mode or background state (simulated via tab visibility)
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = time * (config.speed * 0.15);
    meshRef.current.rotation.y = time * (config.speed * 0.25);
    
    // Ultra-smooth interpolation for 2026 displays (120Hz+)
    const targetScale = 1 + Math.sin(time * 1.5) * 0.04;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
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
