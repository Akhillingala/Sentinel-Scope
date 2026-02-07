"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function FloatingParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 800;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 80;
      pos[i + 1] = (Math.random() - 0.5) * 80;
      pos[i + 2] = (Math.random() - 0.5) * 40;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * 0.08;
    ref.current.rotation.x = t * 0.1;
    ref.current.rotation.y = t * 0.05;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors={false}
        size={0.12}
        sizeAttenuation
        depthWrite={false}
        color="#8b7cf7"
        opacity={0.35}
      />
    </Points>
  );
}

interface ParticleFieldProps {
  className?: string;
}

export function ParticleField({ className = "" }: ParticleFieldProps) {
  return (
    <div className={className} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, 0, 25], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={["transparent"]} />
        <FloatingParticles />
      </Canvas>
    </div>
  );
}
