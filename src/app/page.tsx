"use client";

import { useEffect, useMemo, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { motion } from "framer-motion";

import { usePaletteStore } from "@/store/usePaletteStore";
import {
  Header,
  SortableColorColumn,
  FavoritesSidebar,
  RegenerateButton,
} from "@/components";
import { useKeyboardShortcuts, usePaletteDnd } from "@/hooks";

const STAGGER_TRANSITION = {
  staggerChildren: 0.05,
  delayChildren: 0.1,
};

export default function Home() {
  const colors = usePaletteStore((s) => s.colors);
  const generatePalette = usePaletteStore((s) => s.generatePalette);
  const syncWithUrl = usePaletteStore((s) => s.syncWithUrl);

  const colorIds = useMemo(() => colors.map((color) => color.id), [colors]);
  const { activeId, handleDragEnd, handleDragStart, sensors } =
    usePaletteDnd(colorIds);

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
        aria-describedby="palette-dnd-instructions"
        variants={{
          animate: {
            transition: STAGGER_TRANSITION,
          },
        }}
        className="flex flex-1 overflow-hidden"
      >
        <p id="palette-dnd-instructions" className="sr-only">
          Reorder colors with drag handles. Focus a handle, press Space to pick
          up a color, use arrow keys to move, and press Space again to drop.
        </p>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={colorIds}
            strategy={horizontalListSortingStrategy}
          >
            {colors.map((color) => (
              <SortableColorColumn key={color.id} {...color} />
            ))}
          </SortableContext>
        </DndContext>
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
