"use client";

import { Lock, Unlock } from "lucide-react";
import { getContrastColor } from "@/utils/colors";
import { usePaletteStore } from "@/store/usePaletteStore";
import { Button } from "@/components/ui/button";

interface ColorColumnProps {
  id: string;
  hex: string;
  isLocked: boolean;
}

export const ColorColumn = ({ id, hex, isLocked }: ColorColumnProps) => {
  const toggleLock = usePaletteStore((state) => state.toggleLock);
  const contrastColor = getContrastColor(hex);

  return (
    <div
      className="group relative flex flex-1 flex-col items-center justify-center transition-colors duration-300"
      style={{ backgroundColor: hex, color: contrastColor }}
    >
      <div className="flex flex-col items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleLock(id)}
          className="rounded-full hover:bg-black/10"
          style={{ color: contrastColor }}
        >
          {isLocked ? (
            <Lock size={24} />
          ) : (
            <Unlock
              size={24}
              className="opacity-0 transition-opacity group-hover:opacity-100"
            />
          )}
        </Button>

        <h2 className="cursor-pointer text-2xl font-bold tracking-wider uppercase select-none">
          {hex.replace("#", "")}
        </h2>
      </div>
    </div>
  );
};
