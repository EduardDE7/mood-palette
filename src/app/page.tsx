"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AnimatePresence, motion } from "framer-motion";

import { usePaletteStore } from "@/store/usePaletteStore";
import {
  Header,
  SortableColorColumn,
  FavoritesSidebar,
  RegenerateButton,
} from "@/components";
import { useKeyboardShortcuts, useMediaQuery, usePaletteDnd } from "@/hooks";

const STAGGER_TRANSITION = {
  staggerChildren: 0.05,
  delayChildren: 0.1,
};

export default function Home() {
  const colors = usePaletteStore((s) => s.colors);
  const addColor = usePaletteStore((s) => s.addColor);
  const generationCount = usePaletteStore((s) => s.generationCount);
  const generatePalette = usePaletteStore((s) => s.generatePalette);
  const syncWithUrl = usePaletteStore((s) => s.syncWithUrl);
  const paletteHistoryIndex = usePaletteStore((s) => s.paletteHistoryIndex);
  const paletteHistoryLength = usePaletteStore((s) => s.paletteHistory.length);
  const goBackInPaletteHistory = usePaletteStore(
    (s) => s.goBackInPaletteHistory
  );
  const goForwardInPaletteHistory = usePaletteStore(
    (s) => s.goForwardInPaletteHistory
  );

  const colorIds = useMemo(() => colors.map((color) => color.id), [colors]);
  const { handleDragEnd, handleDragStart, sensors } = usePaletteDnd();

  const isMobile = useMediaQuery("(max-width: 767px)");
  const strategy = isMobile
    ? verticalListSortingStrategy
    : horizontalListSortingStrategy;

  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [showSpaceIndicator, setShowSpaceIndicator] = useState(false);
  const [mobileShadesColorId, setMobileShadesColorId] = useState<string | null>(
    null
  );
  const paletteScrollContainerRef = useRef<HTMLElement | null>(null);
  const shouldScrollToAddedColorRef = useRef(false);
  const previousColorCountRef = useRef(colors.length);
  const spaceIndicatorTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const handleSpaceGenerate = useCallback(() => {
    if (spaceIndicatorTimer.current) clearTimeout(spaceIndicatorTimer.current);
    setShowSpaceIndicator(true);
    spaceIndicatorTimer.current = setTimeout(
      () => setShowSpaceIndicator(false),
      1200
    );
  }, []);

  useKeyboardShortcuts({ onSpaceGenerate: handleSpaceGenerate });

  useEffect(() => {
    syncWithUrl();
  }, [syncWithUrl]);

  useEffect(() => {
    const previousColorCount = previousColorCountRef.current;
    previousColorCountRef.current = colors.length;

    if (
      !isMobile ||
      !shouldScrollToAddedColorRef.current ||
      colors.length <= previousColorCount
    ) {
      shouldScrollToAddedColorRef.current = false;
      return;
    }

    shouldScrollToAddedColorRef.current = false;

    requestAnimationFrame(() => {
      const scrollContainer = paletteScrollContainerRef.current;
      if (!scrollContainer) {
        return;
      }

      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [colors.length, isMobile]);

  const handleAddColor = useCallback(() => {
    shouldScrollToAddedColorRef.current = true;
    addColor();
  }, [addColor]);

  return (
    <div className="relative flex h-dvh h-screen min-h-dvh min-h-screen flex-col overflow-hidden">
      <Header
        onAddColor={handleAddColor}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
      />

      <motion.main
        ref={paletteScrollContainerRef}
        initial="initial"
        animate="animate"
        aria-describedby="palette-dnd-instructions"
        variants={{
          animate: {
            transition: STAGGER_TRANSITION,
          },
        }}
        className="flex flex-1 overflow-hidden max-md:min-h-0 max-md:flex-col max-md:overflow-y-auto"
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
          <SortableContext items={colorIds} strategy={strategy}>
            {colors.map((color) => (
              <SortableColorColumn
                key={color.id}
                {...color}
                isMobileShadesOpen={mobileShadesColorId === color.id}
                onOpenMobileShades={
                  isMobile
                    ? ({ id }) =>
                        setMobileShadesColorId((currentId) =>
                          currentId === id ? null : id
                        )
                    : undefined
                }
                onCloseMobileShades={() => setMobileShadesColorId(null)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </motion.main>

      <RegenerateButton
        colors={colors}
        generationCount={generationCount}
        canGoBack={paletteHistoryIndex > 0}
        canGoForward={
          paletteHistoryIndex >= 0 &&
          paletteHistoryIndex < paletteHistoryLength - 1
        }
        onBack={goBackInPaletteHistory}
        onForward={goForwardInPaletteHistory}
        onRegenerate={generatePalette}
      />

      <FavoritesSidebar
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
      />

      <AnimatePresence>
        {showSpaceIndicator && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="pointer-events-none fixed right-8 bottom-8 z-50 rounded-full border border-white/10 bg-black/80 px-4 py-2 text-sm font-medium tracking-wide text-white/80 shadow-2xl backdrop-blur-sm"
          >
            ␣ pressed
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_150px_rgba(0,0,0,0.05)]" />
    </div>
  );
}
