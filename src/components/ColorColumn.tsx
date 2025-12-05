"use client";

import { useState } from "react";
import { Lock, Unlock, Trash2, Copy, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { getContrastColor } from "@/utils/colors";
import { usePaletteStore } from "@/store/usePaletteStore";
import { Button } from "@/components";

interface ColorColumnProps {
  id: string;
  hex: string;
  isLocked: boolean;
}

export const ColorColumn = ({ id, hex, isLocked }: ColorColumnProps) => {
  const toggleLock = usePaletteStore((s) => s.toggleLock);
  const removeColor = usePaletteStore((s) => s.removeColor);
  const updateColor = usePaletteStore((s) => s.updateColor);
  const colorsCount = usePaletteStore((s) => s.colors.length);
  const favorites = usePaletteStore((s) => s.favorites);
  const addFavorite = usePaletteStore((s) => s.addFavorite);
  const removeFavorite = usePaletteStore((s) => s.removeFavorite);

  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(hex);
  const contrastColor = getContrastColor(hex);

  const isFavorite = favorites.includes(hex.toUpperCase());
  const canDelete = colorsCount > 2;

  const toggleFavorite = () => {
    if (isFavorite) {
      removeFavorite(hex);
    } else {
      addFavorite(hex);
    }
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
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className="group relative flex flex-1 flex-col items-center justify-center"
      style={{ backgroundColor: hex, color: contrastColor }}
    >
      <div
        className={`glass-card pointer-events-none absolute inset-0 z-20 flex items-center justify-center border-none transition-opacity duration-300 ${
          copied ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="text-foreground text-xl font-bold tracking-widest uppercase shadow-black drop-shadow-md">
          Copied!
        </span>
      </div>

      <div className="z-10 flex flex-col items-center gap-6">
        <div className="flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            aria-label={
              isFavorite
                ? "Remove color from favorites"
                : "Add color to favorites"
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
          <motion.h2
            layout="position"
            className="cursor-pointer text-2xl font-bold tracking-wider uppercase transition-transform select-none hover:scale-110"
            onClick={startEditing}
            onContextMenu={(e) => {
              e.preventDefault();
              copyToClipboard();
            }}
            title="Click to edit, Right-click to copy"
          >
            {hex.replace("#", "")}
          </motion.h2>
        )}
      </div>
    </motion.div>
  );
};
