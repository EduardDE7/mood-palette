"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { ArrowLeft, ArrowRight, Lock, RefreshCw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui";
import type { ColorItem } from "@/store/usePaletteStore";

import { AiPalettePrompt } from "./AiPalettePrompt";

interface RegenerateButtonProps {
  canGoBack: boolean;
  canGoForward: boolean;
  colors: ColorItem[];
  generationCount: number;
  onBack: () => void;
  onForward: () => void;
  onRegenerate: () => void;
}

const formatColorCount = (count: number) =>
  `${count} color${count === 1 ? "" : "s"} will change`;

export const RegenerateButton = ({
  canGoBack,
  canGoForward,
  colors,
  generationCount,
  onBack,
  onForward,
  onRegenerate,
}: RegenerateButtonProps) => {
  const helperTextId = useId();
  const refreshIconControls = useAnimationControls();
  const [isAiPromptOpen, setIsAiPromptOpen] = useState(false);
  const unlockedColorsCount = colors.filter((color) => !color.isLocked).length;
  const canRegenerate = colors.length === 0 || unlockedColorsCount > 0;

  const title = canRegenerate
    ? "Press Space to regenerate palette"
    : "All colors are locked. Unlock at least one color.";

  const helperText =
    colors.length === 0
      ? "Generate your first palette"
      : canRegenerate
        ? formatColorCount(unlockedColorsCount)
        : "Unlock at least one color";

  const rotateRefreshIcon = () => {
    if (!canRegenerate) {
      return;
    }

    refreshIconControls.start({
      rotate: [0, 180, 360],
      transition: { duration: 0.42, ease: "easeOut" },
    });
  };

  useEffect(() => {
    if (generationCount === 0) {
      return;
    }

    rotateRefreshIcon();
  }, [generationCount]);

  return (
    <div className="border-border/80 bg-card/80 relative z-30 flex w-full flex-col items-center gap-3 border-t px-2 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] shadow-2xl backdrop-blur-2xl md:absolute md:bottom-6 md:left-1/2 md:w-auto md:-translate-x-1/2 md:gap-4 md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none">
      <AnimatePresence>
        {isAiPromptOpen && (
          <motion.div
            key="ai-palette-prompt"
            initial={{ opacity: 0, y: 18, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 14, scale: 0.97, filter: "blur(8px)" }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <AiPalettePrompt onClose={() => setIsAiPromptOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex w-full items-center justify-center gap-2 md:w-auto md:gap-3">
        <div className="flex h-12 w-auto items-center justify-end gap-1 md:w-[5.5rem] md:gap-2">
          <AnimatePresence>
            {canGoBack && (
              <motion.div
                key="palette-history-back"
                initial={{ opacity: 0, scale: 0.82, x: 8 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.82, x: 8 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  round
                  onClick={onBack}
                  title="Go to previous generated palette"
                  aria-label="Go to previous generated palette"
                  className="glass-card bg-card/80 hover:bg-card/90 h-10 w-10 shadow-2xl"
                >
                  <ArrowLeft size={18} />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {canGoForward && (
              <motion.div
                key="palette-history-forward"
                initial={{ opacity: 0, scale: 0.82, x: -8 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.82, x: -8 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  round
                  onClick={onForward}
                  title="Go to next generated palette"
                  aria-label="Go to next generated palette"
                  className="glass-card bg-card/80 hover:bg-card/90 h-10 w-10 shadow-2xl"
                >
                  <ArrowRight size={18} />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button
          variant="ghost"
          round
          onClick={onRegenerate}
          disabled={!canRegenerate}
          title={title}
          aria-label="Regenerate palette"
          aria-describedby={helperTextId}
          aria-keyshortcuts="Space"
          className="glass-card bg-card/80 text-foreground hover:bg-card/90 relative flex h-auto min-w-0 flex-1 items-center justify-between gap-3 overflow-hidden px-2 py-2 text-left shadow-2xl disabled:cursor-not-allowed max-md:rounded-none max-md:shadow-none md:min-w-[20rem] md:flex-none"
        >
          <span className="flex items-center gap-2">
            <motion.span
              animate={refreshIconControls}
              className="inline-flex h-8 w-8 items-center justify-center"
            >
              {canRegenerate ? (
                <RefreshCw size={18} strokeWidth={2.5} />
              ) : (
                <Lock size={18} strokeWidth={2.5} />
              )}
            </motion.span>

            <span className="flex flex-col">
              <span className="text-sm font-semibold tracking-wide whitespace-nowrap uppercase">
                Regenerate
              </span>
              <span
                id={helperTextId}
                className="text-muted-foreground text-xs font-normal whitespace-nowrap"
              >
                {helperText}
              </span>
            </span>
          </span>

          <span className="hidden h-9 items-center rounded-full border border-white/70 bg-white/95 px-3 text-xs leading-none font-medium tracking-normal text-slate-950 shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-xl sm:inline-flex">
            Press Space
          </span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          round
          onClick={() => setIsAiPromptOpen((isOpen) => !isOpen)}
          title={
            isAiPromptOpen
              ? "Close AI palette prompt"
              : "Open AI palette prompt"
          }
          aria-label={
            isAiPromptOpen
              ? "Close AI palette prompt"
              : "Open AI palette prompt"
          }
          aria-expanded={isAiPromptOpen}
          className="glass-card bg-card/80 hover:bg-card/90 h-10 w-10 shadow-2xl"
        >
          <Sparkles size={18} strokeWidth={2.4} />
        </Button>
      </div>
    </div>
  );
};
