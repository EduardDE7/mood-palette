"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { usePaletteStore } from "@/store/usePaletteStore";
import {
  Header,
  ColorColumn,
  FavoritesSidebar,
  RegenerateButton,
} from "@/components";
import { useKeyboardShortcuts } from "@/hooks";

const STAGGER_TRANSITION = {
  staggerChildren: 0.05,
  delayChildren: 0.1,
};

export default function Home() {
  const colors = usePaletteStore((s) => s.colors);
  const generatePalette = usePaletteStore((s) => s.generatePalette);
  const syncWithUrl = usePaletteStore((s) => s.syncWithUrl);

  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

  useKeyboardShortcuts();

  useEffect(() => {
    syncWithUrl();
  }, [syncWithUrl]);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <Header onOpenFavorites={() => setIsFavoritesOpen(true)} />

      <motion.main
        initial="initial"
        animate="animate"
        variants={{
          animate: {
            transition: STAGGER_TRANSITION,
          },
        }}
        className="flex flex-1 overflow-hidden"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {colors.map((color) => (
            <ColorColumn key={color.id} {...color} />
          ))}
        </AnimatePresence>
      </motion.main>

      <RegenerateButton colors={colors} onRegenerate={generatePalette} />

      <FavoritesSidebar
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
      />

      <div className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_150px_rgba(0,0,0,0.05)]" />
    </div>
  );
}
