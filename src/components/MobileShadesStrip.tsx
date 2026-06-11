"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, X } from "lucide-react";

import { Button } from "@/components";
import { useAccessibleModal } from "@/hooks";
import type { ColorItem } from "@/store/usePaletteStore";
import { usePaletteStore } from "@/store/usePaletteStore";
import { generateShades, getColorInfo, getContrastColor } from "@/utils";

type MobileShadeColor = Pick<ColorItem, "hex" | "id" | "isLocked">;

interface MobileShadesStripProps {
  color: MobileShadeColor | null;
  onClose: () => void;
}

interface SelectedShade {
  colorId: string;
  hex: string;
}

export const MobileShadesStrip = ({
  color,
  onClose,
}: MobileShadesStripProps) => {
  const updateColor = usePaletteStore((s) => s.updateColor);
  const [selectedShade, setSelectedShade] = useState<SelectedShade | null>(
    null
  );
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const shadesScrollRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const shades = color ? generateShades(color.hex) : [];
  const selectedShadeHex =
    selectedShade && selectedShade.colorId === color?.id
      ? selectedShade.hex
      : null;
  const selectedShadeInfo = selectedShadeHex
    ? getColorInfo(selectedShadeHex)
    : null;
  const isDetailsOpen = selectedShadeHex !== null;
  const portalContainer =
    typeof document === "undefined" ? null : document.body;

  useEffect(() => {
    if (!color) {
      return;
    }

    requestAnimationFrame(() => {
      const scrollContainer = shadesScrollRef.current;
      if (!scrollContainer) {
        return;
      }

      scrollContainer.scrollLeft =
        (scrollContainer.scrollWidth - scrollContainer.clientWidth) / 2;
    });
  }, [color?.id, color]);

  const closeShadeDetails = useCallback(() => {
    setCopiedValue(null);
    setSelectedShade(null);
  }, []);

  useAccessibleModal({
    isOpen: isDetailsOpen,
    onClose: closeShadeDetails,
    dialogRef,
    initialFocusRef: closeButtonRef,
  });

  const copyValue = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(value);
      setTimeout(() => setCopiedValue(null), 1600);
    } catch (error) {
      console.error("Failed to copy color value", error);
    }
  };

  const applySelectedShade = () => {
    if (!color || !selectedShadeHex) {
      return;
    }

    updateColor(color.id, selectedShadeHex);
    closeShadeDetails();
    onClose();
  };

  return (
    <>
      <AnimatePresence initial={false}>
        {color && (
          <motion.section
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-border/80 bg-card/95 relative z-20 w-full overflow-hidden border-t md:hidden"
            aria-label={`Shades for ${color.hex}`}
          >
            <div className="flex h-12 items-stretch">
              <div
                ref={shadesScrollRef}
                className="flex min-w-0 flex-1 snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
              >
                {shades.map((shade) => {
                  const isCurrent =
                    shade.toUpperCase() === color.hex.toUpperCase();
                  return (
                    <button
                      key={shade}
                      type="button"
                      onClick={() => {
                        setCopiedValue(null);
                        setSelectedShade({ colorId: color.id, hex: shade });
                      }}
                      title={`View shade ${shade}`}
                      aria-label={`View shade ${shade}`}
                      className="focus-visible:ring-ring relative w-12 shrink-0 snap-start border-r border-black/10 transition-[filter,width] duration-150 outline-none last:border-r-0 hover:w-14 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset active:brightness-95"
                      style={{ backgroundColor: shade }}
                    >
                      {isCurrent && (
                        <span
                          className="absolute inset-x-2 bottom-1 h-0.5 rounded-full"
                          style={{ backgroundColor: getContrastColor(shade) }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {portalContainer &&
        createPortal(
          <AnimatePresence>
            {color && selectedShadeHex && selectedShadeInfo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeShadeDetails}
                className="fixed inset-0 z-[70] flex items-end bg-black/25 backdrop-blur-sm md:hidden"
              >
                <motion.div
                  ref={dialogRef}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={titleId}
                  aria-describedby={descriptionId}
                  tabIndex={-1}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  onClick={(event) => event.stopPropagation()}
                  className="glass-card bg-card/95 w-full rounded-t-3xl border-b-0 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-2xl"
                >
                  <p id={descriptionId} className="sr-only">
                    Shade information and actions. Press Escape to close this
                    dialog.
                  </p>

                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/25" />

                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                        Shade for {color.hex}
                      </p>
                      <h2
                        id={titleId}
                        className="text-foreground text-2xl font-bold tracking-wide"
                      >
                        {selectedShadeInfo.hex}
                      </h2>
                    </div>

                    <Button
                      ref={closeButtonRef}
                      variant="ghost"
                      size="icon"
                      round
                      onClick={closeShadeDetails}
                      title="Close shade details"
                      aria-label="Close shade details"
                    >
                      <X size={18} />
                    </Button>
                  </div>

                  <div
                    className="mb-4 h-24 w-full rounded-2xl border border-white/10"
                    style={{ backgroundColor: selectedShadeHex }}
                    aria-hidden="true"
                  />

                  <div className="mb-4 grid gap-2">
                    {[
                      ["HEX", selectedShadeInfo.hex],
                      ["RGB", selectedShadeInfo.rgb],
                      ["HSL", selectedShadeInfo.hsl],
                    ].map(([label, value]) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => copyValue(value)}
                        title={`Copy ${label} value`}
                        aria-label={`Copy ${label} value ${value}`}
                        className="border-border/80 bg-muted/30 text-foreground hover:bg-muted/40 focus-visible:ring-ring flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left backdrop-blur-xl transition-colors focus-visible:ring-2 focus-visible:outline-none"
                      >
                        <span className="text-muted-foreground text-xs font-bold tracking-wide">
                          {label}
                        </span>
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="truncate text-sm font-medium">
                            {value}
                          </span>
                          {copiedValue === value ? (
                            <Check size={16} className="shrink-0" />
                          ) : (
                            <Copy size={16} className="shrink-0" />
                          )}
                        </span>
                      </button>
                    ))}
                  </div>

                  <Button
                    variant="white"
                    className="w-full"
                    onClick={applySelectedShade}
                    title="Apply shade to color"
                    aria-label={`Apply shade ${selectedShadeHex} to color ${color.hex}`}
                  >
                    Apply Shade
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          portalContainer
        )}
    </>
  );
};
