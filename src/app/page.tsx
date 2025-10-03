"use client";

import { useEffect } from "react";
import { usePaletteStore } from "@/store/usePaletteStore";
import { Header } from "@/components/Header";
import { ColorColumn } from "@/components/ColorColumn";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function Home() {
  const { colors, generatePalette } = usePaletteStore();

  useEffect(() => {
    if (colors.length === 0) {
      generatePalette();
    }
  }, [colors.length, generatePalette]);

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

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <Header />
      <main className="flex flex-1 overflow-hidden">
        {colors.map((color) => (
          <ColorColumn key={color.id} {...color} />
        ))}
      </main>

      <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2">
        <Button
          size="lg"
          onClick={generatePalette}
          className="gap-2 rounded-full px-8 py-6 text-lg font-bold shadow-xl transition-transform hover:scale-105"
        >
          <RefreshCw size={20} />
          Generate
        </Button>
      </div>
    </div>
  );
}
