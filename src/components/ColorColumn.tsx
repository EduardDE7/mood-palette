"use client";

import { useState } from "react";
import { Lock, Unlock, Trash2, Copy, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { getContrastColor } from "@/utils/colors";
import { usePaletteStore } from "@/store/usePaletteStore";
import { Button } from "@/components/ui/button";

interface ColorColumnProps {
  id: string;
  hex: string;
  isLocked: boolean;
}

export const ColorColumn = ({ id, hex, isLocked }: ColorColumnProps) => {
  const {
    toggleLock,
    removeColor,
    updateColor,
    colors,
    favorites,
    addFavorite,
    removeFavorite,
  } = usePaletteStore();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(hex);
  const contrastColor = getContrastColor(hex);

  const isFavorite = favorites.includes(hex.toUpperCase());
  const canDelete = colors.length > 2;

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
        className={`pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
          copied ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="text-xl font-bold tracking-widest text-white uppercase shadow-black drop-shadow-md">
          Copied!
        </span>
      </div>

      <div className="z-10 flex flex-col items-center gap-4">
        <div className="flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="action"
            size="icon"
            round
            onClick={() => toggleLock(id)}
            style={{ color: contrastColor }}
            title={isLocked ? "Unlock" : "Lock"}
          >
            {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
          </Button>

          <Button
            variant="action"
            size="icon"
            round
            onClick={toggleFavorite}
            style={{ color: contrastColor }}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              size={22}
              className="drop-shadow-sm"
              fill={isFavorite ? contrastColor : "none"}
            />
          </Button>

          <Button
            variant="action"
            size="icon"
            round
            onClick={copyToClipboard}
            style={{ color: contrastColor }}
            title="Copy HEX"
          >
            <Copy size={20} />
          </Button>

          {canDelete && (
            <Button
              variant="danger"
              size="icon"
              round
              onClick={() => removeColor(id)}
              title="Remove color"
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
            className="cursor-pointer text-2xl font-bold tracking-wider uppercase transition-transform select-none hover:scale-110 active:scale-95"
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
