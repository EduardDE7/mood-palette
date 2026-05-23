"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Save, Trash2, X } from "lucide-react";

import { Button } from "@/components";
import { useAccessibleModal } from "@/hooks";

interface SavePaletteModalProps {
  colors: string[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, colors: string[]) => void;
}

export const SavePaletteModal = ({
  colors,
  isOpen,
  onClose,
  onSave,
}: SavePaletteModalProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [paletteName, setPaletteName] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>(colors);
  const dialogRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const nameInputId = useId();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setPaletteName("");
    setSelectedColors(colors);
  }, [colors, isOpen]);

  useAccessibleModal({
    isOpen,
    onClose,
    dialogRef,
    initialFocusRef: nameInputRef,
  });

  const removeColorAtIndex = (colorIndex: number) => {
    setSelectedColors((currentColors) =>
      currentColors.filter((_, index) => index !== colorIndex)
    );
  };

  const handleSave = () => {
    if (selectedColors.length === 0) {
      return;
    }

    onSave(paletteName, selectedColors);
    onClose();
  };

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[70] grid place-items-center bg-black/20 p-4 backdrop-blur-sm"
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
            className="glass-card max-h-[calc(100vh-2rem)] w-[92vw] max-w-md overflow-hidden rounded-3xl p-6 shadow-2xl"
          >
            <p id={descriptionId} className="sr-only">
              Name this palette and remove any colors before saving it to
              favorites.
            </p>

            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 id={titleId} className="text-foreground text-xl font-bold">
                Save Palette
              </h2>
              <Button
                variant="ghost"
                size="icon"
                round
                onClick={onClose}
                title="Close save palette dialog"
                aria-label="Close save palette dialog"
              >
                <X size={18} />
              </Button>
            </div>

            <label
              htmlFor={nameInputId}
              className="text-muted-foreground mb-2 block text-sm"
            >
              Palette name
            </label>
            <input
              ref={nameInputRef}
              id={nameInputId}
              value={paletteName}
              onChange={(event) => setPaletteName(event.target.value)}
              placeholder="Palette name"
              className="bg-white/5 text-foreground border-border focus:border-accent/80 focus:ring-accent/60 mb-5 w-full rounded-xl border px-3 py-2 backdrop-blur-sm outline-none focus:ring-2"
            />

            <div className="mb-6 max-h-72 space-y-2 overflow-y-auto pr-1">
              {selectedColors.map((hex, index) => (
                <div
                  key={`${hex}-${index}`}
                  className="border-border/50 flex items-center justify-between gap-3 rounded-xl border px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="border-border h-7 w-7 shrink-0 rounded-lg border"
                      style={{ backgroundColor: hex }}
                    />
                    <span className="text-foreground truncate font-mono text-sm font-semibold uppercase">
                      {hex}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    round
                    onClick={() => removeColorAtIndex(index)}
                    className="h-8 w-8 shrink-0"
                    title={`Remove ${hex} from saved palette`}
                    aria-label={`Remove ${hex} from saved palette`}
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                round
                onClick={onClose}
                title="Cancel saving palette"
                aria-label="Cancel saving palette"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                round
                onClick={handleSave}
                disabled={selectedColors.length === 0}
                title="Save palette to favorites"
                aria-label="Save palette to favorites"
              >
                <Save size={16} />
                Save Palette
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
