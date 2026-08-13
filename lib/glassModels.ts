import * as THREE from "three";

export type GlassType = "wine" | "whisky" | "mug" | "flute" | "highball";

export interface EngraveBand {
  radiusTop: number;
  radiusBottom: number;
  height: number;
  y: number;
  arc: number;
}

export interface GlassProfile {
  id: GlassType;
  label: string;
  hint: string;
  /** Lathe profil: [radius, visina] od dna ka vrhu */
  points: [number, number][];
  engrave: EngraveBand;
  /** Krigla ima dršku */
  handle?: { radius: number; tube: number; y: number };
  /** Preporucena udaljenost kamere */
  camDistance: number;
}

export const GLASS_PROFILES: Record<GlassType, GlassProfile> = {
  wine: {
    id: "wine",
    label: "Vinska",
    hint: "Na stopi, za crveno vino",
    points: [
      [0.0, -0.78], [0.30, -0.78], [0.30, -0.74], [0.26, -0.72],
      [0.055, -0.66], [0.045, -0.30], [0.05, -0.16],
      [0.20, -0.02], [0.31, 0.16], [0.34, 0.38],
      [0.32, 0.62], [0.285, 0.78], [0.30, 0.785],
    ],
    engrave: { radiusTop: 0.335, radiusBottom: 0.315, height: 0.42, y: 0.34, arc: Math.PI * 0.7 },
    camDistance: 2.9,
  },
  whisky: {
    id: "whisky",
    label: "Viski",
    hint: "Niska, debelo dno",
    points: [
      [0.0, -0.50], [0.40, -0.50], [0.40, -0.44],
      [0.405, -0.20], [0.415, 0.10], [0.425, 0.36],
      [0.425, 0.44], [0.395, 0.44], [0.385, 0.10],
      [0.375, -0.24], [0.36, -0.36], [0.0, -0.36],
    ],
    engrave: { radiusTop: 0.437, radiusBottom: 0.425, height: 0.60, y: 0.02, arc: Math.PI * 0.8 },
    camDistance: 2.3,
  },
  mug: {
    id: "mug",
    label: "Krigla",
    hint: "Za pivo, sa drškom",
    points: [
      [0.0, -0.62], [0.44, -0.62], [0.44, -0.55],
      [0.45, -0.20], [0.46, 0.20], [0.47, 0.56],
      [0.47, 0.64], [0.435, 0.64], [0.425, 0.20],
      [0.415, -0.20], [0.40, -0.46], [0.0, -0.46],
    ],
    engrave: { radiusTop: 0.482, radiusBottom: 0.462, height: 0.72, y: 0.06, arc: Math.PI * 0.72 },
    handle: { radius: 0.26, tube: 0.052, y: 0.02 },
    camDistance: 2.6,
  },
  flute: {
    id: "flute",
    label: "Šampanjac",
    hint: "Uska i visoka",
    points: [
      [0.0, -0.86], [0.28, -0.86], [0.28, -0.82], [0.24, -0.80],
      [0.045, -0.74], [0.038, -0.34], [0.045, -0.10],
      [0.13, 0.06], [0.185, 0.34], [0.20, 0.62],
      [0.195, 0.82], [0.175, 0.86], [0.19, 0.865],
    ],
    engrave: { radiusTop: 0.202, radiusBottom: 0.176, height: 0.52, y: 0.42, arc: Math.PI * 0.65 },
    camDistance: 3.0,
  },
  highball: {
    id: "highball",
    label: "Koktel",
    hint: "Visoka, za sokove",
    points: [
      [0.0, -0.72], [0.33, -0.72], [0.33, -0.66],
      [0.335, -0.20], [0.345, 0.24], [0.355, 0.66],
      [0.355, 0.74], [0.325, 0.74], [0.315, 0.24],
      [0.305, -0.20], [0.295, -0.56], [0.0, -0.56],
    ],
    engrave: { radiusTop: 0.367, radiusBottom: 0.345, height: 0.80, y: 0.14, arc: Math.PI * 0.75 },
    camDistance: 2.8,
  },
};

export const GLASS_LIST = Object.values(GLASS_PROFILES);

export function buildLathe(profile: GlassProfile): THREE.LatheGeometry {
  const pts = profile.points.map(([r, y]) => new THREE.Vector2(r, y));
  return new THREE.LatheGeometry(pts, 96);
}
