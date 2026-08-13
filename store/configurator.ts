"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { GlassType } from "@/lib/glassModels";

export type Mode = "text" | "image";

/** localStorage ima ~5MB; velike slike ne cuvamo da ne raznesemo kvotu. */
const MAX_PERSISTED_IMAGE = 1_500_000;

interface ConfiguratorState {
  glassType: GlassType;
  mode: Mode;
  text: string;
  fontFamily: string;
  fontSize: number;
  imageDataUrl: string | null;
  imageScale: number;
  imageThreshold: number;
  imageInvert: boolean;
  posX: number;
  posY: number;
  setGlassType: (t: GlassType) => void;
  setMode: (m: Mode) => void;
  setText: (t: string) => void;
  setFontFamily: (f: string) => void;
  setFontSize: (s: number) => void;
  setImageDataUrl: (url: string | null) => void;
  setImageScale: (s: number) => void;
  setImageThreshold: (v: number) => void;
  setImageInvert: (v: boolean) => void;
  setPosX: (x: number) => void;
  setPosY: (y: number) => void;
  reset: () => void;
}

const initial = {
  glassType: "wine" as GlassType,
  mode: "text" as Mode,
  text: "",
  fontFamily: "Georgia, serif",
  fontSize: 72,
  imageDataUrl: null as string | null,
  imageScale: 0.5,
  imageThreshold: 0.55,
  imageInvert: false,
  posX: 0.5,
  posY: 0.5,
};

export const useConfigurator = create<ConfiguratorState>()(
  persist(
    (set) => ({
      ...initial,
      setGlassType: (glassType) => set({ glassType }),
      setMode: (mode) => set({ mode }),
      setText: (text) => set({ text }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setFontSize: (fontSize) => set({ fontSize }),
      setImageDataUrl: (imageDataUrl) => set({ imageDataUrl }),
      setImageScale: (imageScale) => set({ imageScale }),
      setImageThreshold: (imageThreshold) => set({ imageThreshold }),
      setImageInvert: (imageInvert) => set({ imageInvert }),
      setPosX: (posX) => set({ posX }),
      setPosY: (posY) => set({ posY }),
      reset: () => set(initial),
    }),
    {
      name: "graviranje-config",
      storage: createJSONStorage(() => localStorage),
      // Konfiguracija mora prezivet magic-link redirect (cesto u drugom tabu).
      partialize: (s) => ({
        glassType: s.glassType,
        mode: s.mode,
        text: s.text,
        fontFamily: s.fontFamily,
        fontSize: s.fontSize,
        imageScale: s.imageScale,
        imageThreshold: s.imageThreshold,
        imageInvert: s.imageInvert,
        posX: s.posX,
        posY: s.posY,
        imageDataUrl:
          s.imageDataUrl && s.imageDataUrl.length < MAX_PERSISTED_IMAGE
            ? s.imageDataUrl
            : null,
      }),
    }
  )
);
