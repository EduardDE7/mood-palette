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
    ? "Press Space to regenerate palette"
    : "All colors are locked. Unlock at least one color.";

  const helperText =
    colors.length === 0
      ? "Generate your first palette"
      : canRegenerate
        ? formatColorCount(unlockedColorsCount)
        : "Unlock at least one color";

  return (
    <div className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2">
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
          className="relative flex h-auto min-w-[20rem] items-center justify-between gap-3 overflow-hidden border border-accent/70 bg-gradient-to-br from-background/95 to-accent/80 px-2 py-2 text-left text-foreground shadow-xl backdrop-blur-xl transition-colors hover:border-primary/65 hover:from-background/95 hover:to-accent/90 disabled:cursor-not-allowed"
        >
          <span className="flex items-center gap-2">
            <motion.span
              key={paletteSignature}
              animate={canRegenerate ? { rotate: [0, 180] } : { rotate: 0 }}
              transition={{ duration: 0.45, ease: "anticipate" }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent/65"
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

          <span className="hidden h-9 items-center rounded-full border border-white/70 bg-white/95 px-3 text-xs font-medium leading-none tracking-normal text-slate-950 shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-xl sm:inline-flex">
            Press Space
          </span>
        </Button>
      </motion.div>
    </div>
  );
};
