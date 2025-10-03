"use client";

import { useState } from "react";
import { Lock, Unlock, Trash2, Copy } from "lucide-react";
import { getContrastColor } from "@/utils/colors";
import { usePaletteStore } from "@/store/usePaletteStore";
import { Button } from "@/components/ui/button";

interface ColorColumnProps {
  id: string;
  hex: string;
  isLocked: boolean;
}

export const ColorColumn = ({ id, hex, isLocked }: ColorColumnProps) => {
  const { toggleLock, removeColor, updateColor, colors } = usePaletteStore();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(hex);
  const contrastColor = getContrastColor(hex);

  const canDelete = colors.length > 2;

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
      className="group relative flex flex-1 flex-col items-center justify-center transition-all duration-300 ease-in-out"
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
            variant="ghost"
            size="icon"
            onClick={() => toggleLock(id)}
            className="rounded-full transition-transform hover:scale-110 hover:bg-black/10"
            style={{ color: contrastColor }}
            title={isLocked ? "Unlock" : "Lock"}
          >
            {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={copyToClipboard}
            className="rounded-full transition-transform hover:scale-110 hover:bg-black/10"
            style={{ color: contrastColor }}
            title="Copy HEX"
          >
            <Copy size={20} />
          </Button>

          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeColor(id)}
              className="rounded-full text-red-500 transition-transform hover:scale-110 hover:bg-red-500/20"
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
          <h2
            className="cursor-pointer text-2xl font-bold tracking-wider uppercase transition-transform select-none hover:scale-110 active:scale-95"
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
    </div>
  );
};
