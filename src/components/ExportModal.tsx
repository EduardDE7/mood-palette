"use client";

import { useCallback, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, X } from "lucide-react";

import { Button } from "@/components";
import { useAccessibleModal } from "@/hooks";
import { formatColorsForExport, type ExportFormat } from "@/utils";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  colors: string[];
}

export const ExportModal = ({
  isOpen,
  onClose,
  title,
  colors,
}: ExportModalProps) => {
  const [format, setFormat] = useState<ExportFormat>("css");
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const portalContainer =
    typeof document === "undefined" ? null : document.body;

  const handleClose = useCallback(() => {
    setCopied(false);
    onClose();
  }, [onClose]);

  useAccessibleModal({
    isOpen,
    onClose: handleClose,
    dialogRef,
    initialFocusRef: closeButtonRef,
  });

  const formattedOutput = formatColorsForExport(colors, format, "color");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
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
          className="fixed inset-0 z-[60] grid place-items-center bg-black/20 p-4 backdrop-blur-sm"
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="glass-card max-h-[calc(100vh-2rem)] w-[90vw] max-w-2xl overflow-hidden rounded-3xl p-4 shadow-2xl sm:p-6"
          >
            <p id={descriptionId} className="sr-only">
              Choose export format and copy generated output. Press Escape to
              close this modal.
            </p>

            <div className="text-foreground mb-6 flex items-center justify-between drop-shadow-md">
              <h2
                id={titleId}
                className="text-lg font-bold tracking-tight sm:text-2xl"
              >
                {title}
              </h2>
              <Button
                ref={closeButtonRef}
                variant="ghost"
                size="icon"
                round
                onClick={handleClose}
                title="Close export modal"
                aria-label="Close export modal"
              >
                <X size={20} />
              </Button>
            </div>

            <div
              className="mb-4 flex gap-2"
              role="group"
              aria-label="Export format"
            >
              {(["css", "tailwind", "json"] as ExportFormat[]).map((f) => (
                <Button
                  key={f}
                  variant={format === f ? "white" : "ghost"}
                  size="sm"
                  round
                  onClick={() => setFormat(f)}
                  className="capitalize"
                  aria-pressed={format === f}
                  title={`Use ${f} format`}
                  aria-label={`Use ${f} format`}
                >
                  {f}
                </Button>
              ))}
            </div>

            <div className="group relative mt-6">
              <pre
                aria-label="Exported color code"
                className="bg-muted/20 max-h-96 overflow-auto rounded-2xl p-4 text-sm"
              >
                <code>{formattedOutput}</code>
              </pre>

              <Button
                variant="ghost"
                size="icon"
                round
                onClick={handleCopy}
                title={copied ? "Code copied" : "Copy code"}
                aria-label={copied ? "Code copied" : "Copy code"}
                className="absolute top-2 right-2 h-10 w-10"
              >
                {copied ? (
                  <Check size={18} className="text-green-400" />
                ) : (
                  <Copy size={18} />
                )}
              </Button>
            </div>

            <p role="status" aria-live="polite" className="sr-only">
              {copied ? "Code copied to clipboard." : ""}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    portalContainer
  );
};
