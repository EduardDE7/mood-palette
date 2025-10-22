import { useEffect } from "react";
import { usePaletteStore } from "@/store/usePaletteStore";

export const useKeyboardShortcuts = () => {
  const generatePalette = usePaletteStore((s) => s.generatePalette);

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
        generatePalette();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [generatePalette]);
};
