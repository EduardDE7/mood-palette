import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateRandomHex } from "@/utils/colors";

export interface ColorItem {
  id: string;
  hex: string;
  isLocked: boolean;
}

interface PaletteState {
  colors: ColorItem[];
  favorites: string[];
  generatePalette: () => void;
  toggleLock: (id: string) => void;
  updateColor: (id: string, hex: string) => void;
  removeColor: (id: string) => void;
  addColor: () => void;
  syncWithUrl: () => void;
  addFavorite: (hex: string) => void;
  removeFavorite: (hex: string) => void;
}

const updateUrlHash = (colors: ColorItem[]) => {
  if (typeof window === "undefined") return;
  const hash = colors.map((c) => c.hex.replace("#", "")).join("-");
  window.history.replaceState(null, "", `#${hash}`);
};

export const usePaletteStore = create<PaletteState>()(
  persist(
    (set, get) => ({
      colors: [],
      favorites: [],

      syncWithUrl: () => {
        if (typeof window === "undefined") return;
        const hash = window.location.hash.replace("#", "");
        if (!hash) {
          get().generatePalette();
          return;
        }

        const hexCodes = hash.split("-");
        const newColors = hexCodes
          .filter((hex) => /^[0-9A-F]{6}$/i.test(hex))
          .map((hex) => ({
            id: crypto.randomUUID(),
            hex: `#${hex.toUpperCase()}`,
            isLocked: false,
          }));

        if (newColors.length > 0) {
          set({ colors: newColors });
        } else {
          get().generatePalette();
        }
      },

      generatePalette: () => {
        const { colors } = get();
        let newColors: ColorItem[];

        if (colors.length === 0) {
          newColors = Array.from({ length: 5 }).map(() => ({
            id: crypto.randomUUID(),
            hex: generateRandomHex(),
            isLocked: false,
          }));
        } else {
          newColors = colors.map((color) =>
            color.isLocked ? color : { ...color, hex: generateRandomHex() }
          );
        }

        set({ colors: newColors });
        updateUrlHash(newColors);
      },

      toggleLock: (id: string) => {
        set((state) => {
          const newColors = state.colors.map((color) =>
            color.id === id ? { ...color, isLocked: !color.isLocked } : color
          );
          return { colors: newColors };
        });
      },

      updateColor: (id: string, hex: string) => {
        set((state) => {
          const newColors = state.colors.map((color) =>
            color.id === id ? { ...color, hex: hex.toUpperCase() } : color
          );
          updateUrlHash(newColors);
          return { colors: newColors };
        });
      },

      removeColor: (id: string) => {
        set((state) => {
          if (state.colors.length <= 2) return state;
          const newColors = state.colors.filter((c) => c.id !== id);
          updateUrlHash(newColors);
          return { colors: newColors };
        });
      },

      addColor: () => {
        set((state) => {
          if (state.colors.length >= 8) return state;
          const newColors = [
            ...state.colors,
            {
              id: crypto.randomUUID(),
              hex: generateRandomHex(),
              isLocked: false,
            },
          ];
          updateUrlHash(newColors);
          return { colors: newColors };
        });
      },

      addFavorite: (hex: string) => {
        const h = hex.toUpperCase();
        set((state) => {
          if (state.favorites.includes(h)) return state;
          return { favorites: [...state.favorites, h] };
        });
      },

      removeFavorite: (hex: string) => {
        const h = hex.toUpperCase();
        set((state) => ({
          favorites: state.favorites.filter((f) => f !== h),
        }));
      },
    }),
    {
      name: "palette-favorites",
      partialize: (state) => ({ favorites: state.favorites }),
    }
  )
);
