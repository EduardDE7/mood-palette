"use client";

import { useMemo, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, Gauge } from "lucide-react";

import { Button } from "@/components/ui";
import type { ColorItem } from "@/store/usePaletteStore";
import { scorePalette } from "@/utils";

interface PaletteQualityIndicatorProps {
  colors: ColorItem[];
}

const getScoreToneClassName = (score: number) => {
  if (score >= 82) {
    return "border-emerald-400/40 bg-emerald-400/10 text-emerald-100";
  }

  if (score >= 68) {
    return "border-lime-400/40 bg-lime-400/10 text-lime-100";
  }

  if (score >= 52) {
    return "border-amber-400/40 bg-amber-400/10 text-amber-100";
  }

  return "border-red-400/40 bg-red-400/10 text-red-100";
};

export const PaletteQualityIndicator = ({
  colors,
}: PaletteQualityIndicatorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const paletteScore = useMemo(
    () => scorePalette(colors.map((color) => color.hex)),
    [colors]
  );
  const toneClassName = getScoreToneClassName(paletteScore.score);
  const hasWarnings = paletteScore.warnings.length > 0;

  return (
    <div className="relative hidden md:block">
      <Button
        variant="ghost"
        size="sm"
        round
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        title={`Palette quality: ${paletteScore.score}/100 ${paletteScore.label}`}
        aria-label={`Palette quality: ${paletteScore.score} out of 100, ${paletteScore.label}`}
        aria-expanded={isOpen}
        className={`h-9 gap-2 border px-2.5 text-xs font-bold shadow-none ${toneClassName}`}
      >
        <Gauge size={14} />
        <span>{paletteScore.score}</span>
      </Button>

      {isOpen && (
        <div className="glass-card bg-card/95 absolute top-[calc(100%+0.75rem)] left-0 z-[80] w-80 rounded-2xl p-3 text-left shadow-2xl">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-foreground text-xs font-bold tracking-wide uppercase">
                Palette quality
              </h2>
              <p className="text-muted-foreground text-[11px] font-medium">
                {paletteScore.label} · {paletteScore.score}/100
              </p>
            </div>
            {hasWarnings ? (
              <AlertTriangle size={16} className="mt-0.5 text-amber-200" />
            ) : (
              <CheckCircle2 size={16} className="mt-0.5 text-emerald-200" />
            )}
          </div>

          <div className="space-y-2">
            {paletteScore.metrics.map((metric) => (
              <div key={metric.key}>
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span className="text-foreground text-xs font-semibold">
                    {metric.label}
                  </span>
                  <span className="text-muted-foreground text-[11px] font-bold">
                    {metric.score}
                  </span>
                </div>
                <div className="bg-muted/30 h-1.5 overflow-hidden rounded-full">
                  <div
                    className="bg-foreground h-full rounded-full"
                    style={{ width: `${metric.score}%` }}
                  />
                </div>
                <p className="text-muted-foreground mt-1 text-[11px]">
                  {metric.description}
                </p>
              </div>
            ))}
          </div>

          <div className="border-border/80 mt-3 border-t pt-3">
            <div className="flex items-center gap-1.5">
              <Activity size={13} className="text-muted-foreground" />
              <p className="text-muted-foreground text-[11px] font-medium">
                {hasWarnings
                  ? paletteScore.warnings.join(" · ")
                  : "No obvious quality warnings."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
