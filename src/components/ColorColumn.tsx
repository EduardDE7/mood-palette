"use client";

import { useState } from "react";
import { Copy, GripVertical, Heart, Lock, Trash2, Unlock } from "lucide-react";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import {
  type FavoriteLocation,
  usePaletteStore,
} from "@/store/usePaletteStore";
import { Button, SaveFavoriteColorModal } from "@/components";
import { getContrastColor } from "@/utils/colors";

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
  const [editValue, setEditValue] = useState(hex);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const contrastColor = getContrastColor(hex);

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
        <div className="flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Button
            {...dragAttributes}
            {...dragListeners}
            ref={dragActivatorRef}
            variant="action"
            size="icon"
            title="Drag to reorder color"
            aria-label="Drag to reorder color"
            className="h-9 w-9 cursor-grab rounded-full border border-white/20 backdrop-blur-sm transition-all duration-150 ease-out hover:bg-white/20 active:scale-105 active:cursor-grabbing"
            style={{
              touchAction: "none",
              color: contrastColor === "white" ? "#FFFFFF" : "#111111",
              backgroundColor:
                contrastColor === "white"
                  ? "rgba(0,0,0,0.35)"
                  : "rgba(255,255,255,0.55)",
            }}
          >
            <GripVertical size={18} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleLock(id)}
            style={{ color: contrastColor }}
            title={isLocked ? "Unlock" : "Lock"}
            aria-label={isLocked ? "Unlock color" : "Lock color"}
            className="h-9 w-9 bg-transparent shadow-none backdrop-blur-none hover:scale-110 hover:bg-transparent hover:shadow-none"
          >
            {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
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
            className="h-9 w-9 bg-transparent shadow-none backdrop-blur-none hover:scale-110 hover:bg-transparent hover:shadow-none"
          >
            <Heart
              size={22}
              className="drop-shadow-sm"
              fill={isFavorite ? contrastColor : "none"}
            />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={copyToClipboard}
            style={{ color: contrastColor }}
            title="Copy HEX"
            aria-label="Copy color HEX value"
            className="h-9 w-9 bg-transparent shadow-none backdrop-blur-none hover:scale-110 hover:bg-transparent hover:shadow-none"
          >
            <Copy size={20} />
          </Button>

          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeColor(id)}
              title="Remove color"
              aria-label="Remove color"
              className="h-9 w-9 bg-transparent text-red-500 shadow-none backdrop-blur-none hover:scale-110 hover:bg-transparent hover:text-red-400 hover:shadow-none"
            >
              <Trash2 size={20} />
            </Button>
          )}
        </div>

        {isEditing ? (
          <input
            autoFocus
            className="w-24 border-none bg-transparent text-center text-2xl font-bold tracking-wider uppercase outline-none"
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
          <h2
            className="cursor-pointer text-2xl font-bold tracking-wider uppercase transition-transform select-none hover:scale-110"
            onClick={startEditing}
            onContextMenu={(e) => {
              e.preventDefault();
              copyToClipboard();
            }}
            title="Click to edit, Right-click to copy"
          >
            {hex.replace("#", "")}
          </h2>
        )}
      </div>

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
