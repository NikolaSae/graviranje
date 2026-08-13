"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { Suspense } from "react";
import { GlassModel } from "./GlassModel";

export function GlassScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.3, 2.8], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 5, 3]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#87ceeb" />

      <Suspense fallback={null}>
        <Environment preset="city" />
        <GlassModel />
        <ContactShadows
          position={[0, -0.72, 0]}
          opacity={0.35}
          scale={2}
          blur={2.5}
          far={3}
          color="#1a2a3a"
        />
      </Suspense>

      <OrbitControls
        enablePan={false}
        minDistance={1.4}
        maxDistance={5}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={(Math.PI * 7) / 8}
        autoRotate
        autoRotateSpeed={0.6}
      />
    </Canvas>
  );
}
