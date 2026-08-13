"use client";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useConfigurator } from "@/store/configurator";
import { GLASS_PROFILES, buildLathe } from "@/lib/glassModels";
import {
  TEX_W, TEX_H, drawPlaceholder, drawText, drawImageEtched,
} from "@/lib/engraveCanvas";

export function GlassModel() {
  const {
    glassType, mode, text, fontFamily, fontSize,
    posX, posY, imageDataUrl, imageScale, imageThreshold, imageInvert,
  } = useConfigurator();

  const profile = GLASS_PROFILES[glassType];

  // ── Telo case ──────────────────────────────────────────────────────────
  const glassGeometry = useMemo(() => buildLathe(profile), [profile]);

  // ── Povrsina za graviranje: luk tik uz staklo ──────────────────────────
  const engraveGeometry = useMemo(() => {
    const e = profile.engrave;
    const g = new THREE.CylinderGeometry(
      e.radiusTop, e.radiusBottom, e.height,
      72, 1, true,
      -e.arc / 2, e.arc
    );
    g.translate(0, e.y, 0);
    return g;
  }, [profile]);

  // ── Drska (krigla) ─────────────────────────────────────────────────────
  const handleGeometry = useMemo(() => {
    if (!profile.handle) return null;
    const { radius, tube } = profile.handle;
    return new THREE.TorusGeometry(radius, tube, 16, 40, Math.PI * 1.25);
  }, [profile]);

  // ── Canvas tekstura ────────────────────────────────────────────────────
  const { canvas, texture } = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = TEX_W;
    c.height = TEX_H;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return { canvas: c, texture: t };
  }, []);

  // Stare geometrije se moraju osloboditi pri promeni modela case,
  // inace svaki klik na chip ostavlja bafer na GPU.
  useEffect(() => () => glassGeometry.dispose(), [glassGeometry]);
  useEffect(() => () => engraveGeometry.dispose(), [engraveGeometry]);
  useEffect(() => {
    if (!handleGeometry) return;
    return () => handleGeometry.dispose();
  }, [handleGeometry]);
  useEffect(() => () => texture.dispose(), [texture]);

  // Token sprecava da zakasneli img.onload prepise noviji crtez
  const drawToken = useRef(0);

  useEffect(() => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const token = ++drawToken.current;

    const opts = {
      mode, text, fontFamily, fontSize, posX, posY,
      imageScale, imageThreshold, imageInvert,
    };

    const isEmpty =
      (mode === "text" && !text.trim()) ||
      (mode === "image" && !imageDataUrl);

    if (isEmpty) {
      drawPlaceholder(ctx);
      texture.needsUpdate = true;
      return;
    }

    if (mode === "text") {
      drawText(ctx, opts);
      texture.needsUpdate = true;
      return;
    }

    if (imageDataUrl) {
      const img = new Image();
      img.onload = () => {
        if (token !== drawToken.current) return; // zastareo crtez
        drawImageEtched(ctx, img, opts);
        texture.needsUpdate = true;
      };
      img.src = imageDataUrl;
    }
  }, [
    mode, text, fontFamily, fontSize, posX, posY,
    imageDataUrl, imageScale, imageThreshold, imageInvert,
    canvas, texture,
  ]);

  return (
    <group>
      {/* Staklo */}
      <mesh geometry={glassGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={new THREE.Color(0x9fd4ef)}
          transmission={0.92}
          roughness={0.08}
          metalness={0}
          thickness={0.5}
          ior={1.5}
          transparent
          opacity={0.9}
          envMapIntensity={1.6}
          attenuationColor={new THREE.Color(0xcdeaff)}
          attenuationDistance={1.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Drska za kriglu */}
      {handleGeometry && profile.handle && (
        <mesh
          geometry={handleGeometry}
          position={[profile.handle.radius * 0.92, profile.handle.y, 0]}
          rotation={[0, 0, -Math.PI * 0.62]}
          castShadow
        >
          <meshPhysicalMaterial
            color={new THREE.Color(0x9fd4ef)}
            transmission={0.9}
            roughness={0.1}
            thickness={0.35}
            ior={1.5}
            transparent
            opacity={0.9}
            envMapIntensity={1.6}
          />
        </mesh>
      )}

      {/* Graviranje */}
      <mesh geometry={engraveGeometry} renderOrder={2}>
        <meshStandardMaterial
          map={texture}
          transparent
          opacity={0.95}
          roughness={0.95}
          metalness={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          alphaTest={0.02}
          emissive={new THREE.Color(0xbfe6ff)}
          emissiveMap={texture}
          emissiveIntensity={0.4}
        />
      </mesh>
    </group>
  );
}
