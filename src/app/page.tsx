"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

import { usePaletteStore } from "@/store/usePaletteStore";
import { Header, ColorColumn, FavoritesSidebar, Button } from "@/components";
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

      <div className="absolute bottom-12 left-1/2 z-30 -translate-x-1/2">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Button
            variant="premium"
            size="xl"
            round
            onClick={generatePalette}
            title="Generate new palette (Space)"
          >
            <motion.div
              animate={{ rotate: [0, 180] }}
              transition={{ duration: 0.4, ease: "anticipate" }}
              key={colors.map((c) => c.hex).join("-")}
            >
              <RefreshCw size={24} strokeWidth={3} />
            </motion.div>
            Generate
          </Button>
        </motion.div>
      </div>

      <FavoritesSidebar
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
      />

      <div className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_150px_rgba(0,0,0,0.05)]" />
    </div>
  );
}
