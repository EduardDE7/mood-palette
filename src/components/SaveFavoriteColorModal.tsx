"use client";

import { useCallback, useId, useRef, useState } from "react";
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
  const [selectedDestination, setSelectedDestination] = useState("default");
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const selectId = useId();
  const portalContainer =
    typeof document === "undefined" ? null : document.body;

  const handleClose = useCallback(() => {
    setSelectedDestination("default");
    onClose();
  }, [onClose]);

  useAccessibleModal({
    isOpen,
    onClose: handleClose,
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
      handleClose();
      return;
    }

    onSave({ type: "palette", paletteId: selectedDestination });
    handleClose();
  };

  if (!portalContainer) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
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
            className="glass-card w-[92vw] max-w-md rounded-3xl p-4 shadow-2xl sm:p-6"
          >
            <p id={descriptionId} className="sr-only">
              Choose where to save this color in favorites.
            </p>

            <div className="mb-5 flex items-center justify-between">
              <h2
                id={titleId}
                className="text-foreground text-lg font-bold sm:text-xl"
              >
                Save {colorHex}
              </h2>
              <Button
                ref={closeButtonRef}
                variant="ghost"
                size="icon"
                round
                onClick={handleClose}
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
              className="text-foreground border-border focus:border-accent/80 focus:ring-accent/60 mb-4 w-full rounded-xl border bg-white/5 px-3 py-2 backdrop-blur-sm outline-none focus:ring-2"
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
                round
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
                round
                onClick={handleClose}
                title="Cancel saving color"
                aria-label="Cancel saving color"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                round
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
    portalContainer
  );
};
