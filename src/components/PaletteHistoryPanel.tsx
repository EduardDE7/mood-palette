"use client";

import { Check } from "lucide-react";

import { cn } from "@/utils";
import type { ColorItem } from "@/store/usePaletteStore";

interface PaletteHistoryPanelProps {
  currentIndex: number;
  history: ColorItem[][];
  onSelect: (index: number) => void;
}

const VISIBLE_HISTORY_LIMIT = 20;

export const PaletteHistoryPanel = ({
  currentIndex,
  history,
  onSelect,
}: PaletteHistoryPanelProps) => {
  const visibleEntries = history
    .map((colors, index) => ({ colors, index }))
    .slice(-VISIBLE_HISTORY_LIMIT)
    .reverse();

  return (
    <section
      aria-label="Palette history"
      className="glass-card bg-card/95 w-[min(30rem,calc(100vw-1rem))] rounded-2xl p-3 shadow-2xl"
    >
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <h2 className="text-foreground text-sm font-semibold tracking-wide uppercase">
          History
        </h2>
        <span className="text-muted-foreground text-xs">
          {visibleEntries.length} snapshots
        </span>
      </div>

      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {visibleEntries.map(({ colors, index }) => {
          const isCurrent = index === currentIndex;
          const label = `Restore palette snapshot ${index + 1}`;

          return (
            <button
              key={`${index}-${colors.map((color) => color.hex).join("-")}`}
              type="button"
              onClick={() => onSelect(index)}
              disabled={isCurrent}
              title={isCurrent ? "Current palette" : label}
              aria-label={isCurrent ? "Current palette snapshot" : label}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "border-border/70 bg-muted/20 focus-visible:ring-ring hover:bg-muted/35 flex h-12 w-full items-center gap-3 rounded-xl border px-3 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-default",
                isCurrent && "border-primary/70 bg-primary/10"
              )}
            >
              <span className="text-muted-foreground w-9 shrink-0 text-xs font-semibold">
                #{index + 1}
              </span>

              <span className="border-border/70 flex h-7 min-w-0 flex-1 overflow-hidden rounded-lg border">
                {colors.map((color) => (
                  <span
                    key={color.id}
                    className="h-full flex-1"
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </span>

              <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                {isCurrent && <Check size={16} />}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
