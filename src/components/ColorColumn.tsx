"use client";

import { useState, useEffect } from "react";
import {
  Copy,
  GripVertical,
  Heart,
  Lock,
  Palette,
  Trash2,
  Unlock,
} from "lucide-react";
import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import {
  type FavoriteLocation,
  usePaletteStore,
} from "@/store/usePaletteStore";
import { Button, SaveFavoriteColorModal } from "@/components";
import { generateShades, getContrastColor } from "@/utils/colors";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.01,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.15,
    },
  },
};

interface ColorColumnProps {
  id: string;
  hex: string;
  isLocked: boolean;
  dragAttributes?: DraggableAttributes;
  dragListeners?: DraggableSyntheticListeners;
  dragActivatorRef?: (node: HTMLElement | null) => void;
}

export const ColorColumn = ({
  id,
  hex,
  isLocked,
  dragAttributes,
  dragListeners,
  dragActivatorRef,
}: ColorColumnProps) => {
  const toggleLock = usePaletteStore((s) => s.toggleLock);
  const removeColor = usePaletteStore((s) => s.removeColor);
  const duplicateColor = usePaletteStore((s) => s.duplicateColor);
  const updateColor = usePaletteStore((s) => s.updateColor);
  const colorsCount = usePaletteStore((s) => s.colors.length);
  const favorites = usePaletteStore((s) => s.favorites);
  const favoritePalettes = usePaletteStore((s) => s.favoritePalettes);
  const addFavorite = usePaletteStore((s) => s.addFavorite);
  const removeFavoriteEverywhere = usePaletteStore(
    (s) => s.removeFavoriteEverywhere
  );
  const createFavoritePalette = usePaletteStore((s) => s.createFavoritePalette);

  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showShades, setShowShades] = useState(false);
  const [editValue, setEditValue] = useState(hex);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const contrastColor = getContrastColor(hex);

  useEffect(() => {
    if (!showShades) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowShades(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showShades]);

  const normalizedHex = hex.toUpperCase();
  const isFavoriteInDefault = favorites.includes(normalizedHex);
  const isFavoriteInPalettes = favoritePalettes.some((palette) =>
    palette.colors.includes(normalizedHex)
  );
  const isFavorite = isFavoriteInDefault || isFavoriteInPalettes;
  const canDelete = colorsCount > 2;

  const toggleFavorite = () => {
    if (isFavorite) {
      removeFavoriteEverywhere(hex);
    } else {
      setIsSaveModalOpen(true);
    }
  };

  const handleSaveToDestination = (destination: FavoriteLocation) => {
    if (destination.type === "default") {
      addFavorite(hex);
      return;
    }

    addFavorite(hex, destination.paletteId);
  };

  const copyToClipboard = async () => {
    if (isEditing) return;
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  const handleHexSubmit = () => {
    let finalValue = editValue.trim();
    if (!finalValue.startsWith("#")) finalValue = "#" + finalValue;

    if (/^#[0-9A-F]{3}$/i.test(finalValue)) {
      finalValue =
        "#" +
        finalValue[1].repeat(2) +
        finalValue[2].repeat(2) +
        finalValue[3].repeat(2);
    }

    const isValid = /^#[0-9A-F]{6}$/i.test(finalValue);
    if (isValid) {
      updateColor(id, finalValue.toUpperCase());
    }
    setIsEditing(false);
  };

  const startEditing = () => {
    setEditValue(hex);
    setIsEditing(true);
  };

  return (
    <div
      className="group relative flex h-full w-full flex-1 flex-col items-center justify-center"
      style={{ backgroundColor: hex, color: contrastColor }}
    >
      <div
        className={`pointer-events-none absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-300 ${
          copied ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="text-xl font-bold tracking-widest uppercase drop-shadow-md">
          Copied!
        </span>
      </div>

      <div className="z-10 flex flex-col items-center gap-6">
        <div className="flex flex-col gap-2">
          <Button
            {...dragAttributes}
            {...dragListeners}
            ref={dragActivatorRef}
            variant="ghost"
            size="icon"
            round
            title="Drag to reorder color"
            aria-label="Drag to reorder color"
            className="h-9 w-9 cursor-grab opacity-0 transition-opacity duration-300 group-hover:opacity-100 active:cursor-grabbing"
            style={{ touchAction: "none", color: contrastColor }}
          >
            <GripVertical size={18} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            round
            onClick={() => toggleLock(id)}
            style={{ color: contrastColor }}
            title={isLocked ? "Unlock" : "Lock"}
            aria-label={isLocked ? "Unlock color" : "Lock color"}
            className="h-9 w-9 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          >
            {isLocked ? (
              <Lock size={18} className="[&>rect]:fill-current" />
            ) : (
              <Unlock size={18} />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            round
            onClick={toggleFavorite}
            style={{ color: contrastColor }}
            title={
              isFavorite ? "Remove from favorites" : "Save color to favorites"
            }
            aria-label={
              isFavorite
                ? "Remove color from favorites"
                : "Save color to favorites"
            }
            className="h-9 w-9 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          >
            <Heart size={18} fill={isFavorite ? contrastColor : "none"} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            round
            onClick={() => setShowShades(!showShades)}
            style={{ color: contrastColor }}
            title="View color shades"
            aria-label="View color shades"
            className="h-9 w-9 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          >
            <Palette size={18} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            round
            onClick={() => duplicateColor(id)}
            disabled={colorsCount >= 8}
            style={{ color: contrastColor }}
            title={
              colorsCount >= 8
                ? "Maximum limit of 8 colors reached"
                : "Duplicate color column"
            }
            aria-label="Duplicate color column"
            className="h-9 w-9 opacity-0 transition-opacity duration-300 group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-30"
          >
            <Copy size={18} />
          </Button>

          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              round
              onClick={() => removeColor(id)}
              style={{ color: contrastColor }}
              title="Remove color"
              aria-label="Remove color"
              className="h-9 w-9 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            >
              <Trash2 size={18} />
            </Button>
          )}
        </div>

        <div className="relative flex flex-col items-center">
          {isEditing ? (
            <input
              autoFocus
              className="w-36 max-w-[80%] border-none bg-transparent text-center text-2xl font-bold tracking-wider uppercase outline-none"
              value={editValue.replace("#", "")}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleHexSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleHexSubmit();
                if (e.key === "Escape") setIsEditing(false);
              }}
              style={{ color: contrastColor }}
            />
          ) : (
            <div className="flex items-center gap-1.5">
              <h2
                className="cursor-pointer text-2xl font-bold tracking-wider uppercase select-none"
                onClick={startEditing}
                onContextMenu={(e) => {
                  e.preventDefault();
                  copyToClipboard();
                }}
                title="Click to edit, Right-click to copy"
              >
                {hex.replace("#", "")}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                round
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard();
                }}
                style={{ color: contrastColor }}
                title="Copy HEX"
                aria-label="Copy color HEX value"
                className="h-6 w-6 opacity-60 transition-opacity hover:opacity-100"
              >
                <Copy size={12} />
              </Button>
            </div>
          )}

          {isLocked && (
            <div
              className="absolute top-full left-1/2 mt-1 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap opacity-60"
              style={{ color: contrastColor }}
            >
              <Lock size={12} className="[&>rect]:fill-current" />
              <span className="text-[10px] font-bold tracking-widest uppercase">
                Locked
              </span>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showShades && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 z-30 flex flex-col overflow-hidden pt-24"
          >
            {/* Shades grid stack */}
            <div className="flex h-full w-full flex-col">
              {generateShades(hex).map((shade) => {
                const isCurrent = shade.toUpperCase() === hex.toUpperCase();
                const shadeContrast = getContrastColor(shade);
                return (
                  <motion.button
                    key={shade}
                    variants={itemVariants}
                    style={{ backgroundColor: shade, color: shadeContrast }}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateColor(id, shade);
                      setShowShades(false);
                    }}
                    className="group/shade relative flex flex-1 w-full items-center justify-center border-none outline-none transition-[flex] duration-[600ms] ease-[cubic-bezier(0.19,1,0.22,1)] hover:flex-[3] hover:shadow-lg active:scale-98 cursor-pointer focus-visible:z-40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
                    title={`Apply shade ${shade}`}
                    aria-label={`Apply shade ${shade}`}
                  >
                    <div className="pointer-events-none flex items-center gap-1.5 select-none">
                      {isCurrent && (
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: shadeContrast }} />
                      )}
                      <span className={`font-mono text-[10px] md:text-xs font-bold tracking-wide uppercase transition-all duration-200 ${
                        isCurrent ? "opacity-100 scale-105" : "opacity-0 group-hover/shade:opacity-100 group-focus-visible/shade:opacity-100"
                      }`}>
                        {shade.replace("#", "")}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SaveFavoriteColorModal
        colorHex={hex}
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        palettes={favoritePalettes}
        onCreatePalette={createFavoritePalette}
        onSave={handleSaveToDestination}
      />
    </div>
  );
};
