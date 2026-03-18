import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateRandomHex, moveItemById } from "@/utils";

export interface ColorItem {
  id: string;
  hex: string;
  isLocked: boolean;
}

export interface FavoritePalette {
  id: string;
  name: string;
  colors: string[];
  createdAt: string;
}

export type FavoriteLocation =
  | { type: "default" }
  | { type: "palette"; paletteId: string };

interface PaletteState {
  colors: ColorItem[];
  favorites: string[];
  favoritePalettes: FavoritePalette[];
  generatePalette: () => void;
  reorderColors: (activeId: string, overId: string) => void;
  toggleLock: (id: string) => void;
  updateColor: (id: string, hex: string) => void;
  removeColor: (id: string) => void;
  addColor: () => void;
  syncWithUrl: () => void;
  addFavorite: (hex: string, paletteId?: string) => void;
  removeFavorite: (hex: string) => void;
  removeFavoriteFromPalette: (paletteId: string, hex: string) => void;
  removeFavoriteEverywhere: (hex: string) => void;
  createFavoritePalette: (name?: string) => FavoritePalette;
  renameFavoritePalette: (paletteId: string, name: string) => void;
  removeFavoritePalette: (paletteId: string) => void;
  saveCurrentPaletteToFavorites: () => FavoritePalette | null;
  applyFavoritePalette: (paletteId: string) => void;
  moveFavoriteColor: (
    hex: string,
    from: FavoriteLocation,
    to: FavoriteLocation
  ) => void;
}

const DEFAULT_PALETTE_PREFIX = "Palette";

const normalizeHex = (hex: string) => {
  const trimmedHex = hex.trim().toUpperCase();
  return trimmedHex.startsWith("#") ? trimmedHex : `#${trimmedHex}`;
};

const isSameLocation = (source: FavoriteLocation, target: FavoriteLocation) => {
  if (source.type === "default" && target.type === "default") {
    return true;
  }

  if (source.type === "palette" && target.type === "palette") {
    return source.paletteId === target.paletteId;
  }

  return false;
};

const getNextPaletteName = (palettes: FavoritePalette[]) => {
  const usedIndices = palettes
    .map((palette) => palette.name.trim())
    .filter((name) => name.startsWith(`${DEFAULT_PALETTE_PREFIX} `))
    .map((name) =>
      Number.parseInt(name.replace(`${DEFAULT_PALETTE_PREFIX} `, ""), 10)
    )
    .filter((index) => Number.isInteger(index) && index > 0);

  let nextIndex = 1;

  while (usedIndices.includes(nextIndex)) {
    nextIndex += 1;
  }

  return `${DEFAULT_PALETTE_PREFIX} ${nextIndex}`;
};

const createFavoritePaletteRecord = (
  existingPalettes: FavoritePalette[],
  name?: string,
  colors: string[] = []
): FavoritePalette => {
  const trimmedName = name?.trim();
  const paletteName =
    trimmedName && trimmedName.length > 0
      ? trimmedName
      : getNextPaletteName(existingPalettes);

  return {
    id: crypto.randomUUID(),
    name: paletteName,
    colors,
    createdAt: new Date().toISOString(),
  };
};

const addColorToPaletteById = (
  palettes: FavoritePalette[],
  paletteId: string,
  colorHex: string
) => {
  let hasChanged = false;

  const updatedPalettes = palettes.map((palette) => {
    if (palette.id !== paletteId || palette.colors.includes(colorHex)) {
      return palette;
    }

    hasChanged = true;
    return {
      ...palette,
      colors: [...palette.colors, colorHex],
    };
  });

  return { hasChanged, updatedPalettes };
};

const removeColorFromPaletteById = (
  palettes: FavoritePalette[],
  paletteId: string,
  colorHex: string
) => {
  let hasChanged = false;

  const updatedPalettes = palettes.map((palette) => {
    if (palette.id !== paletteId || !palette.colors.includes(colorHex)) {
      return palette;
    }

    hasChanged = true;
    return {
      ...palette,
      colors: palette.colors.filter((color) => color !== colorHex),
    };
  });

  return { hasChanged, updatedPalettes };
};

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
      favoritePalettes: [],

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

      reorderColors: (activeId: string, overId: string) => {
        set((state) => {
          const newColors = moveItemById(state.colors, activeId, overId);

          if (newColors === state.colors) {
            return state;
          }

          updateUrlHash(newColors);
          return { colors: newColors };
        });
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
          const normalizedHex = normalizeHex(hex);
          const newColors = state.colors.map((color) =>
            color.id === id ? { ...color, hex: normalizedHex } : color
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

      addFavorite: (hex: string, paletteId?: string) => {
        const normalizedHex = normalizeHex(hex);

        if (!paletteId) {
          set((state) => {
            if (state.favorites.includes(normalizedHex)) {
              return state;
            }

            return {
              favorites: [...state.favorites, normalizedHex],
            };
          });

          return;
        }

        set((state) => {
          const { hasChanged, updatedPalettes } = addColorToPaletteById(
            state.favoritePalettes,
            paletteId,
            normalizedHex
          );

          if (!hasChanged) {
            return state;
          }

          return {
            favoritePalettes: updatedPalettes,
          };
        });
      },

      removeFavorite: (hex: string) => {
        const normalizedHex = normalizeHex(hex);

        set((state) => {
          if (!state.favorites.includes(normalizedHex)) {
            return state;
          }

          return {
            favorites: state.favorites.filter(
              (favorite) => favorite !== normalizedHex
            ),
          };
        });
      },

      removeFavoriteFromPalette: (paletteId: string, hex: string) => {
        const normalizedHex = normalizeHex(hex);

        set((state) => {
          const { hasChanged, updatedPalettes } = removeColorFromPaletteById(
            state.favoritePalettes,
            paletteId,
            normalizedHex
          );

          if (!hasChanged) {
            return state;
          }

          return {
            favoritePalettes: updatedPalettes,
          };
        });
      },

      removeFavoriteEverywhere: (hex: string) => {
        const normalizedHex = normalizeHex(hex);

        set((state) => {
          const nextFavorites = state.favorites.filter(
            (favorite) => favorite !== normalizedHex
          );
          const favoritesChanged =
            nextFavorites.length !== state.favorites.length;

          let palettesChanged = false;
          const nextPalettes = state.favoritePalettes.map((palette) => {
            if (!palette.colors.includes(normalizedHex)) {
              return palette;
            }

            palettesChanged = true;
            return {
              ...palette,
              colors: palette.colors.filter((color) => color !== normalizedHex),
            };
          });

          if (!favoritesChanged && !palettesChanged) {
            return state;
          }

          return {
            favorites: nextFavorites,
            favoritePalettes: nextPalettes,
          };
        });
      },

      createFavoritePalette: (name?: string) => {
        const createdPalette = createFavoritePaletteRecord(
          get().favoritePalettes,
          name
        );

        set((state) => ({
          favoritePalettes: [createdPalette, ...state.favoritePalettes],
        }));

        return createdPalette;
      },

      renameFavoritePalette: (paletteId: string, name: string) => {
        const trimmedName = name.trim();

        if (!trimmedName) {
          return;
        }

        set((state) => {
          let hasChanged = false;

          const nextPalettes = state.favoritePalettes.map((palette) => {
            if (palette.id !== paletteId || palette.name === trimmedName) {
              return palette;
            }

            hasChanged = true;
            return {
              ...palette,
              name: trimmedName,
            };
          });

          if (!hasChanged) {
            return state;
          }

          return {
            favoritePalettes: nextPalettes,
          };
        });
      },

      removeFavoritePalette: (paletteId: string) => {
        set((state) => {
          const nextPalettes = state.favoritePalettes.filter(
            (palette) => palette.id !== paletteId
          );

          if (nextPalettes.length === state.favoritePalettes.length) {
            return state;
          }

          return {
            favoritePalettes: nextPalettes,
          };
        });
      },

      saveCurrentPaletteToFavorites: () => {
        const currentPaletteColors = get().colors.map((color) =>
          normalizeHex(color.hex)
        );

        if (currentPaletteColors.length === 0) {
          return null;
        }

        const existingPalette = get().favoritePalettes.find((palette) => {
          if (palette.colors.length !== currentPaletteColors.length) {
            return false;
          }

          return palette.colors.every(
            (colorHex, colorIndex) =>
              colorHex === currentPaletteColors[colorIndex]
          );
        });

        if (existingPalette) {
          return existingPalette;
        }

        const createdPalette = createFavoritePaletteRecord(
          get().favoritePalettes,
          undefined,
          currentPaletteColors
        );

        set((state) => ({
          favoritePalettes: [createdPalette, ...state.favoritePalettes],
        }));

        return createdPalette;
      },

      applyFavoritePalette: (paletteId: string) => {
        set((state) => {
          const targetPalette = state.favoritePalettes.find(
            (palette) => palette.id === paletteId
          );

          if (!targetPalette || targetPalette.colors.length === 0) {
            return state;
          }

          const nextColors = targetPalette.colors.map((hex) => ({
            id: crypto.randomUUID(),
            hex: normalizeHex(hex),
            isLocked: false,
          }));

          updateUrlHash(nextColors);
          return {
            colors: nextColors,
          };
        });
      },

      moveFavoriteColor: (
        hex: string,
        from: FavoriteLocation,
        to: FavoriteLocation
      ) => {
        const normalizedHex = normalizeHex(hex);

        if (isSameLocation(from, to)) {
          return;
        }

        set((state) => {
          let nextFavorites = state.favorites;
          let nextPalettes = state.favoritePalettes;
          let hasChanged = false;

          const removeFromLocation = (location: FavoriteLocation) => {
            if (location.type === "default") {
              if (!nextFavorites.includes(normalizedHex)) {
                return;
              }

              nextFavorites = nextFavorites.filter(
                (favorite) => favorite !== normalizedHex
              );
              hasChanged = true;
              return;
            }

            const result = removeColorFromPaletteById(
              nextPalettes,
              location.paletteId,
              normalizedHex
            );

            if (!result.hasChanged) {
              return;
            }

            nextPalettes = result.updatedPalettes;
            hasChanged = true;
          };

          const addToLocation = (location: FavoriteLocation) => {
            if (location.type === "default") {
              if (nextFavorites.includes(normalizedHex)) {
                return;
              }

              nextFavorites = [...nextFavorites, normalizedHex];
              hasChanged = true;
              return;
            }

            const result = addColorToPaletteById(
              nextPalettes,
              location.paletteId,
              normalizedHex
            );

            if (!result.hasChanged) {
              return;
            }

            nextPalettes = result.updatedPalettes;
            hasChanged = true;
          };

          removeFromLocation(from);
          addToLocation(to);

          if (!hasChanged) {
            return state;
          }

          return {
            favorites: nextFavorites,
            favoritePalettes: nextPalettes,
          };
        });
      },
    }),
    {
      name: "palette-favorites",
      partialize: (state) => ({
        favorites: state.favorites,
        favoritePalettes: state.favoritePalettes,
      }),
    }
  )
);
