"use client";

import { useMemo, useState } from "react";
import { WandSparkles } from "lucide-react";

import { Button } from "@/components/ui";
import type { ColorItem } from "@/store/usePaletteStore";
import type { ColorHarmonyMode } from "@/utils";

interface HarmonyToolsPanelProps {
  colors: ColorItem[];
  onApplyHarmony: (baseColorId: string, mode: ColorHarmonyMode) => void;
}

interface HarmonyModeOption {
  label: string;
  mode: ColorHarmonyMode;
}

const HARMONY_MODES: HarmonyModeOption[] = [
  { label: "Complementary", mode: "complementary" },
  { label: "Analogous", mode: "analogous" },
  { label: "Triadic", mode: "triadic" },
  { label: "Mono", mode: "monochrome" },
  { label: "Split", mode: "split-complementary" },
];

export const HarmonyToolsPanel = ({
  colors,
  onApplyHarmony,
}: HarmonyToolsPanelProps) => {
  const [selectedColorId, setSelectedColorId] = useState("");
  const selectedColor = useMemo(
    () =>
      colors.find((color) => color.id === selectedColorId) ?? colors[0] ?? null,
    [colors, selectedColorId]
  );
  const canApplyHarmony = selectedColor !== null && colors.length >= 2;

  return (
    <section
      className="border-border/80 bg-card/80 relative z-30 w-full border-t px-3 py-3 backdrop-blur-2xl md:absolute md:right-6 md:bottom-6 md:w-80 md:rounded-2xl md:border md:shadow-2xl"
      aria-label="Color harmony tools"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-foreground text-xs font-bold tracking-wide uppercase">
            Harmony
          </h2>
          <p className="text-muted-foreground text-[11px] font-medium">
            Build around a selected swatch
          </p>
        </div>
        <span className="border-border text-muted-foreground inline-flex h-7 w-7 items-center justify-center rounded-full border">
          <WandSparkles size={14} />
        </span>
      </div>

      <label
        className="text-muted-foreground mb-1 block text-[10px] font-bold tracking-wide uppercase"
        htmlFor="harmony-base-color"
      >
        Base color
      </label>
      <select
        id="harmony-base-color"
        value={selectedColor?.id ?? ""}
        onChange={(event) => setSelectedColorId(event.target.value)}
        disabled={colors.length === 0}
        className="border-border bg-muted/20 text-foreground focus-visible:ring-ring mb-3 h-10 w-full rounded-2xl border px-3 text-sm font-medium transition outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
        title="Choose base color for harmony"
        aria-label="Choose base color for harmony"
      >
        {colors.map((color, colorIndex) => (
          <option key={color.id} value={color.id}>
            {colorIndex + 1}. {color.hex}
            {color.isLocked ? " locked" : ""}
          </option>
        ))}
      </select>

      <div
        className="grid grid-cols-2 gap-2"
        role="group"
        aria-label="Harmony mode"
      >
        {HARMONY_MODES.map((option) => (
          <Button
            key={option.mode}
            variant="ghost"
            size="sm"
            round
            disabled={!canApplyHarmony}
            onClick={() => {
              if (!selectedColor) {
                return;
              }

              onApplyHarmony(selectedColor.id, option.mode);
            }}
            title={`Apply ${option.label} harmony`}
            aria-label={`Apply ${option.label} harmony`}
            className="glass-card bg-card/70 hover:bg-card/90 min-w-0 justify-center px-2 text-[11px] disabled:cursor-not-allowed"
          >
            {option.label}
          </Button>
        ))}
      </div>
    </section>
  );
};
