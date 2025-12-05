"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { Lock, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui";
import type { ColorItem } from "@/store/usePaletteStore";

interface RegenerateButtonProps {
  colors: ColorItem[];
  onRegenerate: () => void;
}

const formatColorCount = (count: number) =>
  `${count} color${count === 1 ? "" : "s"} will change`;

export const RegenerateButton = ({
  colors,
  onRegenerate,
}: RegenerateButtonProps) => {
  const helperTextId = useId();
  const unlockedColorsCount = colors.filter((color) => !color.isLocked).length;
  const canRegenerate = colors.length === 0 || unlockedColorsCount > 0;
  const paletteSignature = colors.map((color) => color.hex).join("-");

  const title = canRegenerate
    ? "Regenerate palette (Space)"
    : "All colors are locked. Unlock at least one color.";

  const helperText =
    colors.length === 0
      ? "Generate your first palette"
      : canRegenerate
        ? formatColorCount(unlockedColorsCount)
        : "Unlock at least one color";

  return (
    <div className="absolute bottom-8 left-1/2 z-30 -translate-x-1/2">
      <motion.div
        whileHover={canRegenerate ? { scale: 1.02 } : undefined}
        whileTap={canRegenerate ? { scale: 0.98 } : undefined}
        transition={{ type: "spring", stiffness: 360, damping: 22 }}
        className="relative"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full shadow-[0_12px_30px_hsl(var(--primary)/0.28),0_0_65px_hsl(var(--accent)/0.24)]"
        />

        <Button
          variant="ghost"
          round
          onClick={onRegenerate}
          disabled={!canRegenerate}
          title={title}
          aria-label="Regenerate palette"
          aria-describedby={helperTextId}
          aria-keyshortcuts="Space"
          className="relative flex h-auto min-w-[22rem] items-center justify-between gap-4 overflow-hidden border border-accent/70 bg-gradient-to-br from-background/95 to-accent/80 px-6 py-3 text-left text-foreground shadow-xl backdrop-blur-xl transition-colors hover:border-primary/65 hover:from-background/95 hover:to-accent/90 disabled:cursor-not-allowed"
        >
          <span className="flex items-center gap-3">
            <motion.span
              key={paletteSignature}
              animate={canRegenerate ? { rotate: [0, 180] } : { rotate: 0 }}
              transition={{ duration: 0.45, ease: "anticipate" }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent/65"
            >
              {canRegenerate ? (
                <RefreshCw size={18} strokeWidth={2.5} />
              ) : (
                <Lock size={18} strokeWidth={2.5} />
              )}
            </motion.span>

            <span className="flex flex-col">
              <span className="whitespace-nowrap text-sm font-semibold tracking-wide uppercase">
                Regenerate
              </span>
              <span
                id={helperTextId}
                className="whitespace-nowrap text-xs font-normal text-muted-foreground"
              >
                {helperText}
              </span>
            </span>
          </span>

          <kbd className="hidden rounded-full bg-foreground/92 px-2.5 py-0.5 text-xs font-bold tracking-wide text-background sm:inline-flex">
            Space
          </kbd>
        </Button>
      </motion.div>
    </div>
  );
};
