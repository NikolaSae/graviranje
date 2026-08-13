"use client";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useConfigurator } from "@/store/configurator";

const TEX_W = 1024;
const TEX_H = 512;

// Luk na kome stoji graviranje (radijani). Manji luk = manje izoblicenja.
const ARC = Math.PI * 0.75;

export function GlassModel() {
  const {
    mode, text, fontFamily, fontSize,
    posX, posY, imageDataUrl, imageScale,
  } = useConfigurator();

  // ── Telo case ──────────────────────────────────────────────────────────
  const glassGeometry = useMemo(() => {
    const points = [
      new THREE.Vector2(0.0,  -0.72),
      new THREE.Vector2(0.26, -0.72),
      new THREE.Vector2(0.22, -0.65),
      new THREE.Vector2(0.28, -0.40),
      new THREE.Vector2(0.38,  0.00),
      new THREE.Vector2(0.40,  0.35),
      new THREE.Vector2(0.38,  0.60),
      new THREE.Vector2(0.36,  0.72),
      new THREE.Vector2(0.38,  0.72),
    ];
    return new THREE.LatheGeometry(points, 96);
  }, []);

  // ── Povrsina za graviranje: luk cilindra tik uz staklo ─────────────────
  const engraveGeometry = useMemo(() => {
    const g = new THREE.CylinderGeometry(
      0.408,          // radiusTop  (staklo je ~0.40 -> mi smo tik iznad)
      0.402,          // radiusBottom
      0.52,           // height
      64, 1,
      true,           // openEnded
      -ARC / 2,       // thetaStart -> centrirano ka +Z (ka kameri)
      ARC
    );
    g.translate(0, 0.18, 0);
    return g;
  }, []);

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

  // Token sprecava da zakasneli img.onload prepise noviji crtez
  const drawToken = useRef(0);

  useEffect(() => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const token = ++drawToken.current;

    ctx.clearRect(0, 0, TEX_W, TEX_H);

    const cx = TEX_W * posX;
    const cy = TEX_H * (1 - posY); // slider gore = gore na casi

    const isEmpty =
      (mode === "text" && !text.trim()) ||
      (mode === "image" && !imageDataUrl);

    // Placeholder dok korisnik nista nije uneo
    if (isEmpty) {
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      ctx.font = "500 44px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.setLineDash([8, 8]);
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 3;
      ctx.strokeRect(TEX_W * 0.18, TEX_H * 0.28, TEX_W * 0.64, TEX_H * 0.44);
      ctx.fillText("VAŠ NATPIS OVDE", TEX_W / 2, TEX_H / 2);
      ctx.restore();
      texture.needsUpdate = true;
      return;
    }

    if (mode === "text") {
      ctx.save();
      ctx.font = `600 ${fontSize * 1.6}px ${fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // Matirano staklo: mek trag + citak jezgro
      ctx.shadowColor = "rgba(220,245,255,0.85)";
      ctx.shadowBlur = 26;
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.fillText(text, cx, cy);
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255,255,255,0.97)";
      ctx.fillText(text, cx, cy);
      ctx.restore();
      texture.needsUpdate = true;
      return;
    }

    if (mode === "image" && imageDataUrl) {
      const img = new Image();
      img.onload = () => {
        if (token !== drawToken.current) return; // zastareo crtez -> odbaci
        const w = TEX_W * imageScale;
        const h = (img.naturalHeight / img.naturalWidth) * w;
        ctx.clearRect(0, 0, TEX_W, TEX_H);
        ctx.save();
        ctx.globalAlpha = 0.92;
        ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
        ctx.restore();
        texture.needsUpdate = true;
      };
      img.src = imageDataUrl;
    }
  }, [mode, text, fontFamily, fontSize, posX, posY, imageDataUrl, imageScale, canvas, texture]);

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
