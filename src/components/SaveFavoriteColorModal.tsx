"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FolderPlus, X } from "lucide-react";

import type {
  FavoriteLocation,
  FavoritePalette,
} from "@/store/usePaletteStore";
import { Button } from "@/components";
import { useAccessibleModal } from "@/hooks";

interface SaveFavoriteColorModalProps {
  colorHex: string;
  isOpen: boolean;
  onClose: () => void;
  onCreatePalette: () => FavoritePalette;
  onSave: (destination: FavoriteLocation) => void;
  palettes: FavoritePalette[];
}

export const SaveFavoriteColorModal = ({
  colorHex,
  isOpen,
  onClose,
  onCreatePalette,
  onSave,
  palettes,
}: SaveFavoriteColorModalProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState("default");
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const selectId = useId();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedDestination("default");
    }
  }, [isOpen]);

  useAccessibleModal({
    isOpen,
    onClose,
    dialogRef,
    initialFocusRef: closeButtonRef,
  });

  const handleCreatePalette = () => {
    const createdPalette = onCreatePalette();
    setSelectedDestination(createdPalette.id);
  };

  const handleSave = () => {
    if (selectedDestination === "default") {
      onSave({ type: "default" });
      onClose();
      return;
    }

    onSave({ type: "palette", paletteId: selectedDestination });
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
          className="bg-background/80 fixed inset-0 z-[70] grid place-items-center p-4 backdrop-blur-md"
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
            className="glass-card w-[92vw] max-w-md rounded-3xl p-6 shadow-2xl"
          >
            <p id={descriptionId} className="sr-only">
              Choose where to save this color in favorites.
            </p>

            <div className="mb-5 flex items-center justify-between">
              <h2 id={titleId} className="text-foreground text-xl font-bold">
                Save {colorHex}
              </h2>
              <Button
                ref={closeButtonRef}
                variant="ghost"
                size="icon"
                round
                onClick={onClose}
                title="Close save dialog"
                aria-label="Close save dialog"
              >
                <X size={18} />
              </Button>
            </div>

            <label
              htmlFor={selectId}
              className="text-muted-foreground mb-2 block text-sm"
            >
              Save destination
            </label>

            <select
              id={selectId}
              value={selectedDestination}
              onChange={(event) => setSelectedDestination(event.target.value)}
              className="bg-card text-foreground border-border focus:ring-ring mb-4 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2"
            >
              <option value="default">Default palette</option>
              {palettes.map((palette) => (
                <option key={palette.id} value={palette.id}>
                  {palette.name}
                </option>
              ))}
            </select>

            <div className="mb-6 flex justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreatePalette}
                title="Create new favorite palette"
                aria-label="Create new favorite palette"
              >
                <FolderPlus size={16} />
                New Palette
              </Button>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                title="Cancel saving color"
                aria-label="Cancel saving color"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
                title="Save color to selected destination"
                aria-label="Save color to selected destination"
              >
                Save Color
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
