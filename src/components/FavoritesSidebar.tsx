"use client";

import { X, Trash2, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePaletteStore } from "@/store/usePaletteStore";
import { Button } from "@/components";

interface FavoritesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FavoritesSidebar = ({
  isOpen,
  onClose,
}: FavoritesSidebarProps) => {
  const favorites = usePaletteStore((s) => s.favorites);
  const removeFavorite = usePaletteStore((s) => s.removeFavorite);

  const copyToClipboard = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
    } catch (err) {
      console.error("Failed to copy!", err);
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
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-50 h-full w-80 bg-white shadow-2xl dark:bg-zinc-900"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b p-6 dark:border-zinc-800">
                <h2 className="text-xl font-bold">Favorites</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  round
                  onClick={onClose}
                  aria-label="Close sidebar"
                >
                  <X size={20} />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {favorites.length === 0 ? (
                  <div className="text-muted-foreground flex h-full flex-col items-center justify-center text-center">
                    <p>No favorites yet.</p>
                    <p className="text-sm">
                      Click the heart icon on any color to save it!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {favorites.map((hex) => (
                      <motion.div
                        layout
                        key={hex}
                        className="group flex items-center justify-between rounded-xl border p-2 pr-4 transition-all hover:shadow-md dark:border-zinc-800"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-12 w-12 rounded-lg border shadow-sm dark:border-zinc-700"
                            style={{ backgroundColor: hex }}
                          />
                          <span className="font-mono font-bold tracking-wider uppercase">
                            {hex}
                          </span>
                        </div>

                        <div className="flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                          <Button
                            variant="action"
                            size="icon"
                            round
                            onClick={() => copyToClipboard(hex)}
                            className="h-8 w-8"
                            title="Copy HEX"
                          >
                            <Copy size={16} />
                          </Button>
                          <Button
                            variant="danger"
                            size="icon"
                            round
                            onClick={() => removeFavorite(hex)}
                            className="h-8 w-8"
                            title="Remove from favorites"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
