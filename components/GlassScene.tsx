"use client";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { Suspense, useRef, useEffect } from "react";
import * as THREE from "three";
import { GlassModel } from "./GlassModel";
import { useConfigurator } from "@/store/configurator";
import { GLASS_PROFILES } from "@/lib/glassModels";

/**
 * Menja udaljenost kamere kad se promeni model čaše — bez remounta Canvas-a
 * (remount bi svaki put rušio i pravio novi WebGL kontekst).
 */
function CameraRig({ distance }: { distance: number }) {
  const { camera } = useThree();
  const target = useRef(distance);

  useEffect(() => {
    target.current = distance;
  }, [distance]);

  useFrame(() => {
    const dir = camera.position.clone().normalize();
    const current = camera.position.length();
    const next = THREE.MathUtils.lerp(current, target.current, 0.08);
    if (Math.abs(next - current) > 0.001) {
      camera.position.copy(dir.multiplyScalar(next));
    }
  });

  return null;
}

export function GlassScene() {
  const glassType = useConfigurator((s) => s.glassType);
  const profile = GLASS_PROFILES[glassType];
  const dist = profile.camDistance;

  return (
    <Canvas
      camera={{ position: [0, 0.25, 2.9], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 3]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 2, -2]} intensity={0.45} color="#87ceeb" />

      <CameraRig distance={dist} />

      <Suspense fallback={null}>
        <Environment preset="city" />
        <GlassModel />
        <ContactShadows
          position={[0, -0.9, 0]}
          opacity={0.32}
          scale={2.4}
          blur={2.6}
          far={3}
          color="#1a2a3a"
        />
      </Suspense>

      <OrbitControls
        enablePan={false}
        minDistance={dist * 0.55}
        maxDistance={dist * 1.9}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={(Math.PI * 7) / 8}
        autoRotate
        autoRotateSpeed={0.6}
      />
    </Canvas>
  );
}
