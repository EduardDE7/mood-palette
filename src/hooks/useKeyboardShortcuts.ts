import { useEffect } from "react";
import { usePaletteStore } from "@/store/usePaletteStore";

export const useKeyboardShortcuts = () => {
  const generatePalette = usePaletteStore((s) => s.generatePalette);
  const canRegenerate = usePaletteStore(
    (s) => s.colors.length === 0 || s.colors.some((color) => !color.isLocked)
  );

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLElement &&
        (e.target.tagName === "INPUT" || e.target.tagName === "BUTTON")
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        if (canRegenerate) {
          generatePalette();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [canRegenerate, generatePalette]);
};
