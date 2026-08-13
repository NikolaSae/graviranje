"use client";
import { create } from "zustand";

export type Mode = "text" | "image";

interface ConfiguratorState {
  mode: Mode;
  // text
  text: string;
  fontFamily: string;
  fontSize: number;
  // image
  imageDataUrl: string | null;
  imageScale: number;
  // position on glass (0-1)
  posX: number;
  posY: number;
  // actions
  setMode: (m: Mode) => void;
  setText: (t: string) => void;
  setFontFamily: (f: string) => void;
  setFontSize: (s: number) => void;
  setImageDataUrl: (url: string | null) => void;
  setImageScale: (s: number) => void;
  setPosX: (x: number) => void;
  setPosY: (y: number) => void;
}

export const useConfigurator = create<ConfiguratorState>((set) => ({
  mode: "text",
  text: "",
  fontFamily: "serif",
  fontSize: 72,
  imageDataUrl: null,
  imageScale: 0.5,
  posX: 0.5,
  posY: 0.5,
  setMode: (mode) => set({ mode }),
  setText: (text) => set({ text }),
  setFontFamily: (fontFamily) => set({ fontFamily }),
  setFontSize: (fontSize) => set({ fontSize }),
  setImageDataUrl: (imageDataUrl) => set({ imageDataUrl }),
  setImageScale: (imageScale) => set({ imageScale }),
  setPosX: (posX) => set({ posX }),
  setPosY: (posY) => set({ posY }),
}));
