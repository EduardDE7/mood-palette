import { create } from "zustand";
import { generateRandomHex } from "@/utils/colors";

export interface ColorItem {
  id: string;
  hex: string;
  isLocked: boolean;
}

interface PaletteState {
  colors: ColorItem[];
  generatePalette: () => void;
  toggleLock: (id: string) => void;
  updateColor: (id: string, hex: string) => void;
}

export const usePaletteStore = create<PaletteState>((set) => ({
  colors: Array.from({ length: 5 }).map(() => ({
    id: crypto.randomUUID(),
    hex: generateRandomHex(),
    isLocked: false,
  })),

  generatePalette: () =>
    set((state) => ({
      colors: state.colors.map((color) =>
        color.isLocked ? color : { ...color, hex: generateRandomHex() }
      ),
    })),

  toggleLock: (id: string) =>
    set((state) => ({
      colors: state.colors.map((color) =>
        color.id === id ? { ...color, isLocked: !color.isLocked } : color
      ),
    })),

  updateColor: (id: string, hex: string) =>
    set((state) => ({
      colors: state.colors.map((color) =>
        color.id === id ? { ...color, hex: hex.toUpperCase() } : color
      ),
    })),
}));
