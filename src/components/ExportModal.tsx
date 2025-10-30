"use client";

import { useState } from "react";
import { Copy, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components";
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.1 } }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background w-[90vw] max-w-2xl overflow-hidden rounded-xl p-6 shadow-2xl dark:border dark:border-zinc-800"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  round
                  onClick={onClose}
                  aria-label="Close export modal"
                >
                  <X size={20} />
                </Button>
              </div>

              <div className="mb-4 flex gap-2">
                {(["css", "tailwind", "json"] as ExportFormat[]).map((f) => (
                  <Button
                    key={f}
                    variant={format === f ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormat(f)}
                    className="capitalize"
                  >
                    {f}
                  </Button>
                ))}
              </div>

              <div className="group relative">
                <pre className="max-h-96 overflow-auto rounded-lg bg-zinc-950 p-4 text-sm text-zinc-50 shadow-inner">
                  <code>{formattedOutput}</code>
                </pre>

                <Button
                  variant="action"
                  size="icon"
                  className="absolute top-2 right-2 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                  onClick={handleCopy}
                  title="Copy code"
                >
                  {copied ? (
                    <Check size={18} className="text-green-400" />
                  ) : (
                    <Copy size={18} />
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
