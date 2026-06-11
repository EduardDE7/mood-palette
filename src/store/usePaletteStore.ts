import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_PALETTE_ROLES,
  generateRandomHex,
  getHarmonyColor,
  isPaletteRoleKey,
  moveItemById,
  normalizePaletteRoleLabel,
  normalizeHex,
  type ColorHarmonyMode,
  type PaletteRole,
  type PaletteRoleKey,
} from "@/utils";
import { nanoid } from "nanoid";

export interface ColorItem {
  id: string;
  hex: string;
  isLocked: boolean;
  role: PaletteRoleKey | null;
}

export interface FavoritePalette {
  id: string;
  name: string;
  colors: string[];
  createdAt: string;
}

type PaletteHistorySnapshot = ColorItem[];

export type FavoriteLocation =
  | { type: "default" }
  | { type: "palette"; paletteId: string };

interface PaletteState {
  colors: ColorItem[];
  generationCount: number;
  paletteHistory: PaletteHistorySnapshot[];
  paletteHistoryIndex: number;
  paletteRoles: PaletteRole[];
  favorites: string[];
  favoritePalettes: FavoritePalette[];
  generatePalette: () => void;
  canGoBackInPaletteHistory: () => boolean;
  canGoForwardInPaletteHistory: () => boolean;
  goBackInPaletteHistory: () => void;
  goForwardInPaletteHistory: () => void;
  goToPaletteHistoryIndex: (index: number) => void;
  reorderColors: (activeId: string, overId: string) => void;
  toggleLock: (id: string) => void;
  updateColor: (id: string, hex: string) => void;
  updateColorRole: (id: string, role: PaletteRoleKey | null) => void;
  applyColorHarmony: (baseColorId: string, mode: ColorHarmonyMode) => void;
  createPaletteRole: (label: string) => PaletteRole | null;
  renamePaletteRole: (roleKey: PaletteRoleKey, label: string) => void;
  deletePaletteRole: (roleKey: PaletteRoleKey) => void;
  removeColor: (id: string) => void;
  duplicateColor: (id: string) => void;
  addColor: () => void;
  syncWithUrl: () => void;
  applyGeneratedPalette: (hexes: string[]) => void;
  addFavorite: (hex: string, paletteId?: string) => void;
  removeFavorite: (hex: string) => void;
  removeFavoriteFromPalette: (paletteId: string, hex: string) => void;
  removeFavoriteEverywhere: (hex: string) => void;
  createFavoritePalette: (name?: string) => FavoritePalette;
  renameFavoritePalette: (paletteId: string, name: string) => void;
  removeFavoritePalette: (paletteId: string) => void;
  savePaletteToFavorites: (
    name: string,
    colors: string[]
  ) => FavoritePalette | null;
  saveCurrentPaletteToFavorites: () => FavoritePalette | null;
  applyFavoritePalette: (paletteId: string) => void;
  moveFavoriteColor: (
    hex: string,
    from: FavoriteLocation,
    to: FavoriteLocation
  ) => void;
}

const DEFAULT_PALETTE_PREFIX = "Palette";
const MIN_PALETTE_SIZE = 2;
const MAX_PALETTE_SIZE = 8;
const INITIAL_PALETTE_SIZE = 6;
const PALETTE_HISTORY_LIMIT = 20;
const MAX_ROLE_LABEL_LENGTH = 28;

const isValidPaletteSize = (size: number) =>
  size >= MIN_PALETTE_SIZE && size <= MAX_PALETTE_SIZE;

const isValidPaletteHex = (hex: string) => /^#?[0-9A-F]{6}$/i.test(hex.trim());

const normalizePaletteHexes = (hexes: string[]) =>
  hexes.map((hex) => normalizeHex(hex)).filter(isValidPaletteHex);

const cloneColors = (colors: ColorItem[]) =>
  colors.map((color) => ({ ...color }));

const clonePaletteRoles = (roles: readonly PaletteRole[]) =>
  roles.map((role) => ({ ...role }));

const clearRoleFromColors = (colors: ColorItem[], roleKey: PaletteRoleKey) =>
  colors.map((color) =>
    color.role === roleKey ? { ...color, role: null } : color
  );

const getUniquePaletteRoleKey = (roles: PaletteRole[]) => {
  let nextIndex = roles.length + 1;
  let nextKey = `role-${nextIndex}`;

  while (roles.some((role) => role.key === nextKey)) {
    nextIndex += 1;
    nextKey = `role-${nextIndex}`;
  }

  return nextKey;
};

const isDuplicateRoleLabel = (
  roles: PaletteRole[],
  label: string,
  ignoredRoleKey?: PaletteRoleKey
) =>
  roles.some(
    (role) =>
      role.key !== ignoredRoleKey &&
      normalizePaletteRoleLabel(role.label).toLocaleLowerCase() ===
        label.toLocaleLowerCase()
  );

const areColorSnapshotsEqual = (
  firstColors: ColorItem[],
  secondColors: ColorItem[]
) => {
  if (firstColors.length !== secondColors.length) {
    return false;
  }

  return firstColors.every((color, colorIndex) => {
    const otherColor = secondColors[colorIndex];
    return (
      color.id === otherColor.id &&
      color.hex === otherColor.hex &&
      color.isLocked === otherColor.isLocked &&
      color.role === otherColor.role
    );
  });
};

const updateUrlHash = (colors: ColorItem[]) => {
  if (typeof window === "undefined") return;
  const hash = colors.map((c) => c.hex.replace("#", "")).join("-");
  window.history.replaceState(null, "", `#${hash}`);
};

const commitColors = (
  state: PaletteState,
  newColors: ColorItem[],
  extraState = {}
) => {
  if (areColorSnapshotsEqual(state.colors, newColors)) {
    return {};
  }

  // Отрезаем ветку Redo, если пользователь вернулся назад и сделал новое изменение
  const truncatedHistory = state.paletteHistory.slice(
    0,
    state.paletteHistoryIndex + 1
  );
  const nextHistory = [...truncatedHistory, cloneColors(newColors)].slice(
    -PALETTE_HISTORY_LIMIT
  );

  updateUrlHash(newColors);

  return {
    colors: newColors,
    paletteHistory: nextHistory.map(cloneColors),
    paletteHistoryIndex: nextHistory.length - 1,
    ...extraState,
  };
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
    id: nanoid(),
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

export const usePaletteStore = create<PaletteState>()(
  persist(
    (set, get) => ({
      colors: [],
      generationCount: 0,
      paletteHistory: [],
      paletteHistoryIndex: -1,
      paletteRoles: clonePaletteRoles(DEFAULT_PALETTE_ROLES),
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
        const isValidHashPalette =
          isValidPaletteSize(hexCodes.length) &&
          hexCodes.every(isValidPaletteHex);

        if (!isValidHashPalette) {
          get().generatePalette();
          return;
        }

        const newColors = hexCodes.map((hex) => ({
          id: nanoid(),
          hex: normalizeHex(hex),
          isLocked: false,
          role: null,
        }));

        updateUrlHash(newColors);
        set({
          colors: newColors,
          paletteHistory: [cloneColors(newColors)],
          paletteHistoryIndex: 0,
        });
      },

      generatePalette: () => {
        const { colors } = get();
        let newColors: ColorItem[];

        if (colors.length === 0) {
          newColors = Array.from({ length: INITIAL_PALETTE_SIZE }).map(() => ({
            id: nanoid(),
            hex: generateRandomHex(),
            isLocked: false,
            role: null,
          }));
        } else {
          newColors = colors.map((color) =>
            color.isLocked ? color : { ...color, hex: generateRandomHex() }
          );
        }

        set((state) => {
          if (state.colors.length === 0) {
            updateUrlHash(newColors);
            return {
              colors: newColors,
              paletteHistory: [cloneColors(newColors)],
              paletteHistoryIndex: 0,
            };
          }

          return commitColors(state, newColors, {
            generationCount: state.generationCount + 1,
          });
        });
      },

      canGoBackInPaletteHistory: () => get().paletteHistoryIndex > 0,

      canGoForwardInPaletteHistory: () => {
        const { paletteHistory, paletteHistoryIndex } = get();
        return (
          paletteHistoryIndex >= 0 &&
          paletteHistoryIndex < paletteHistory.length - 1
        );
      },

      goBackInPaletteHistory: () => {
        set((state) => {
          if (state.paletteHistoryIndex <= 0) {
            return state;
          }

          const nextIndex = state.paletteHistoryIndex - 1;
          const nextColors = cloneColors(state.paletteHistory[nextIndex]);
          updateUrlHash(nextColors);

          return {
            colors: nextColors,
            paletteHistoryIndex: nextIndex,
          };
        });
      },

      goForwardInPaletteHistory: () => {
        set((state) => {
          if (
            state.paletteHistoryIndex < 0 ||
            state.paletteHistoryIndex >= state.paletteHistory.length - 1
          ) {
            return state;
          }

          const nextIndex = state.paletteHistoryIndex + 1;
          const nextColors = cloneColors(state.paletteHistory[nextIndex]);
          updateUrlHash(nextColors);

          return {
            colors: nextColors,
            paletteHistoryIndex: nextIndex,
          };
        });
      },

      goToPaletteHistoryIndex: (index: number) => {
        set((state) => {
          if (
            index === state.paletteHistoryIndex ||
            index < 0 ||
            index >= state.paletteHistory.length
          ) {
            return state;
          }

          const nextColors = cloneColors(state.paletteHistory[index]);
          updateUrlHash(nextColors);

          return {
            colors: nextColors,
            paletteHistoryIndex: index,
          };
        });
      },

      reorderColors: (activeId: string, overId: string) => {
        set((state) => {
          const newColors = moveItemById(state.colors, activeId, overId);

          if (newColors === state.colors) {
            return state;
          }

          return commitColors(state, newColors);
        });
      },

      toggleLock: (id: string) => {
        set((state) => {
          const newColors = state.colors.map((color) =>
            color.id === id ? { ...color, isLocked: !color.isLocked } : color
          );
          return commitColors(state, newColors);
        });
      },

      updateColor: (id: string, hex: string) => {
        set((state) => {
          const normalizedHex = normalizeHex(hex);
          const newColors = state.colors.map((color) =>
            color.id === id ? { ...color, hex: normalizedHex } : color
          );
          return commitColors(state, newColors);
        });
      },

      updateColorRole: (id: string, role: PaletteRoleKey | null) => {
        set((state) => {
          const nextRole =
            role && isPaletteRoleKey(role, state.paletteRoles) ? role : null;
          const newColors = state.colors.map((color) => {
            if (color.id === id) {
              return { ...color, role: nextRole };
            }

            if (nextRole && color.role === nextRole) {
              return { ...color, role: null };
            }

            return color;
          });

          return commitColors(state, newColors);
        });
      },

      applyColorHarmony: (baseColorId: string, mode: ColorHarmonyMode) => {
        set((state) => {
          const anchorIndex = state.colors.findIndex(
            (color) => color.id === baseColorId
          );

          if (anchorIndex === -1) {
            return state;
          }

          const baseHex = state.colors[anchorIndex].hex;
          const newColors = state.colors.map((color, colorIndex) => {
            if (color.isLocked) {
              return color;
            }

            return {
              ...color,
              hex: getHarmonyColor(baseHex, mode, colorIndex, anchorIndex),
            };
          });

          return commitColors(state, newColors, {
            generationCount: state.generationCount + 1,
          });
        });
      },

      createPaletteRole: (label: string) => {
        const normalizedLabel = normalizePaletteRoleLabel(label).slice(
          0,
          MAX_ROLE_LABEL_LENGTH
        );

        if (!normalizedLabel) {
          return null;
        }

        const existingRole = get().paletteRoles.find(
          (role) =>
            normalizePaletteRoleLabel(role.label).toLocaleLowerCase() ===
            normalizedLabel.toLocaleLowerCase()
        );

        if (existingRole) {
          return existingRole;
        }

        const createdRole = {
          key: getUniquePaletteRoleKey(get().paletteRoles),
          label: normalizedLabel,
        };

        set((state) => ({
          paletteRoles: [...state.paletteRoles, createdRole],
        }));

        return createdRole;
      },

      renamePaletteRole: (roleKey: PaletteRoleKey, label: string) => {
        const normalizedLabel = normalizePaletteRoleLabel(label).slice(
          0,
          MAX_ROLE_LABEL_LENGTH
        );

        if (!normalizedLabel) {
          return;
        }

        set((state) => {
          if (
            !state.paletteRoles.some((role) => role.key === roleKey) ||
            isDuplicateRoleLabel(state.paletteRoles, normalizedLabel, roleKey)
          ) {
            return state;
          }

          return {
            paletteRoles: state.paletteRoles.map((role) =>
              role.key === roleKey ? { ...role, label: normalizedLabel } : role
            ),
          };
        });
      },

      deletePaletteRole: (roleKey: PaletteRoleKey) => {
        set((state) => {
          if (!state.paletteRoles.some((role) => role.key === roleKey)) {
            return state;
          }

          return {
            paletteRoles: state.paletteRoles.filter(
              (role) => role.key !== roleKey
            ),
            colors: clearRoleFromColors(state.colors, roleKey),
            paletteHistory: state.paletteHistory.map((snapshot) =>
              clearRoleFromColors(snapshot, roleKey)
            ),
          };
        });
      },

      removeColor: (id: string) => {
        set((state) => {
          if (state.colors.length <= MIN_PALETTE_SIZE) return state;
          const newColors = state.colors.filter((c) => c.id !== id);
          return commitColors(state, newColors);
        });
      },

      duplicateColor: (id: string) => {
        set((state) => {
          if (state.colors.length >= MAX_PALETTE_SIZE) return state;
          const index = state.colors.findIndex((color) => color.id === id);
          if (index === -1) return state;

          const sourceColor = state.colors[index];
          const newColor = {
            id: nanoid(),
            hex: sourceColor.hex,
            isLocked: sourceColor.isLocked,
            role: null,
          };

          const newColors = [...state.colors];
          newColors.splice(index + 1, 0, newColor);

          return commitColors(state, newColors);
        });
      },

      addColor: () => {
        set((state) => {
          if (state.colors.length >= MAX_PALETTE_SIZE) return state;
          const newColors = [
            ...state.colors,
            {
              id: nanoid(),
              hex: generateRandomHex(),
              isLocked: false,
              role: null,
            },
          ];
          return commitColors(state, newColors);
        });
      },

      applyGeneratedPalette: (hexes: string[]) => {
        set((state) => {
          if (hexes.length === 0) {
            return state;
          }

          const highestLockedIndex = state.colors.reduce(
            (highestIndex, color, colorIndex) =>
              color.isLocked
                ? Math.max(highestIndex, colorIndex)
                : highestIndex,
            -1
          );
          const nextColorCount = Math.min(
            8,
            Math.max(2, hexes.length, highestLockedIndex + 1)
          );
          const nextColors = Array.from({ length: nextColorCount }).map(
            (_, colorIndex) => {
              const currentColor = state.colors[colorIndex];

              if (currentColor?.isLocked) {
                return currentColor;
              }

              return {
                id: currentColor?.id ?? nanoid(),
                hex: normalizeHex(
                  hexes[colorIndex] ?? currentColor?.hex ?? generateRandomHex()
                ),
                isLocked: false,
                role: currentColor?.role ?? null,
              };
            }
          );

          return commitColors(state, nextColors, {
            generationCount: state.generationCount + 1,
          });
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

      savePaletteToFavorites: (name: string, colors: string[]) => {
        const paletteColors = normalizePaletteHexes(colors);

        if (!isValidPaletteSize(paletteColors.length)) {
          return null;
        }

        const createdPalette = createFavoritePaletteRecord(
          get().favoritePalettes,
          name,
          paletteColors
        );

        set((state) => ({
          favoritePalettes: [createdPalette, ...state.favoritePalettes],
        }));

        return createdPalette;
      },

      saveCurrentPaletteToFavorites: () => {
        const currentPaletteColors = get().colors.map((color) =>
          normalizeHex(color.hex)
        );

        if (!isValidPaletteSize(currentPaletteColors.length)) {
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

          if (
            !targetPalette ||
            !isValidPaletteSize(targetPalette.colors.length) ||
            !targetPalette.colors.every(isValidPaletteHex)
          ) {
            return state;
          }

          const nextColors = targetPalette.colors.map((hex) => ({
            id: nanoid(),
            hex: normalizeHex(hex),
            isLocked: false,
            role: null,
          }));

          return commitColors(state, nextColors);
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
        paletteRoles: state.paletteRoles,
      }),
    }
  )
);
