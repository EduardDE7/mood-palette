"use client";

import { useMemo, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  Check,
  Download,
  FolderPlus,
  Pencil,
  Play,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type {
  FavoriteLocation,
  FavoritePalette,
} from "@/store/usePaletteStore";
import { usePaletteStore } from "@/store/usePaletteStore";
import {
  Button,
  ExportModal,
  FavoriteColorChip,
  FavoriteDropContainer,
} from "@/components";
import { useFavoritesDnd } from "@/hooks";

interface FavoritesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FavoritesSidebar = ({
  isOpen,
  onClose,
}: FavoritesSidebarProps) => {
  const favorites = usePaletteStore((state) => state.favorites);
  const favoritePalettes = usePaletteStore((state) => state.favoritePalettes);
  const removeFavorite = usePaletteStore((state) => state.removeFavorite);
  const removeFavoriteFromPalette = usePaletteStore(
    (state) => state.removeFavoriteFromPalette
  );
  const createFavoritePalette = usePaletteStore(
    (state) => state.createFavoritePalette
  );
  const renameFavoritePalette = usePaletteStore(
    (state) => state.renameFavoritePalette
  );
  const removeFavoritePalette = usePaletteStore(
    (state) => state.removeFavoritePalette
  );
  const saveCurrentPaletteToFavorites = usePaletteStore(
    (state) => state.saveCurrentPaletteToFavorites
  );
  const applyFavoritePalette = usePaletteStore(
    (state) => state.applyFavoritePalette
  );

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [editingPaletteId, setEditingPaletteId] = useState<string | null>(null);
  const [paletteNameDraft, setPaletteNameDraft] = useState("");
  const { activeHex, handleDragEnd, handleDragStart, sensors } =
    useFavoritesDnd();

  const exportColors = useMemo(() => {
    const colorsFromPalettes = favoritePalettes.flatMap(
      (palette) => palette.colors
    );
    return Array.from(new Set([...favorites, ...colorsFromPalettes]));
  }, [favoritePalettes, favorites]);

  const copyToClipboard = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  const handleCreatePalette = () => {
    const createdPalette = createFavoritePalette();
    setEditingPaletteId(createdPalette.id);
    setPaletteNameDraft(createdPalette.name);
  };

  const handleSaveCurrentPalette = () => {
    const savedPalette = saveCurrentPaletteToFavorites();

    if (!savedPalette) {
      return;
    }

    setEditingPaletteId(savedPalette.id);
    setPaletteNameDraft(savedPalette.name);
  };

  const beginRenamePalette = (palette: FavoritePalette) => {
    setEditingPaletteId(palette.id);
    setPaletteNameDraft(palette.name);
  };

  const commitRenamePalette = (paletteId: string) => {
    renameFavoritePalette(paletteId, paletteNameDraft);
    setEditingPaletteId(null);
    setPaletteNameDraft("");
  };

  const cancelRenamePalette = () => {
    setEditingPaletteId(null);
    setPaletteNameDraft("");
  };

  const handleRemoveColor = (hex: string, location: FavoriteLocation) => {
    if (location.type === "default") {
      removeFavorite(hex);
      return;
    }

    removeFavoriteFromPalette(location.paletteId, hex);
  };

  return (
    <>
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

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="glass-card fixed top-0 right-0 z-50 h-full w-[26rem] border-l shadow-2xl"
            >
              <div className="flex h-full flex-col">
                <div className="border-border border-b p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-foreground text-xl font-bold drop-shadow-md">
                      Favorites Library
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      round
                      onClick={onClose}
                      title="Close favorites sidebar"
                      aria-label="Close favorites sidebar"
                    >
                      <X size={20} />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveCurrentPalette}
                      title="Save current palette to favorites"
                      aria-label="Save current palette to favorites"
                    >
                      <Save size={16} />
                      Save Palette
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCreatePalette}
                      title="Create empty favorite palette"
                      aria-label="Create empty favorite palette"
                    >
                      <FolderPlus size={16} />
                      New Palette
                    </Button>

                    {exportColors.length > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        round
                        onClick={() => setIsExportOpen(true)}
                        title="Export all favorite colors"
                        aria-label="Export all favorite colors"
                      >
                        <Download size={18} />
                      </Button>
                    )}
                  </div>
                </div>

                <p id="favorites-dnd-instructions" className="sr-only">
                  Drag a color by the handle and drop it into any favorite
                  palette or into the default palette section.
                </p>

                <DndContext
                  accessibility={{
                    screenReaderInstructions: {
                      draggable:
                        "Drag a color handle and drop it into a favorite palette or default palette section.",
                    },
                  }}
                  collisionDetection={closestCenter}
                  sensors={sensors}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex-1 space-y-6 overflow-y-auto p-5">
                    <section>
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-foreground text-sm font-semibold tracking-wide uppercase">
                          Default Palette
                        </h3>
                        <span className="text-muted-foreground text-xs">
                          {favorites.length} colors
                        </span>
                      </div>

                      <FavoriteDropContainer
                        location={{ type: "default" }}
                        className="glass-pill min-h-20 space-y-2 rounded-2xl p-2 transition-all"
                        activeClassName="ring-primary/65 border-primary/60 ring-2"
                      >
                        {favorites.length === 0 ? (
                          <p className="text-muted-foreground px-2 py-4 text-sm">
                            Saved standalone colors will appear here.
                          </p>
                        ) : (
                          favorites.map((hex) => (
                            <FavoriteColorChip
                              key={`default-${hex}`}
                              hex={hex}
                              location={{ type: "default" }}
                              onCopy={copyToClipboard}
                              onRemove={handleRemoveColor}
                            />
                          ))
                        )}
                      </FavoriteDropContainer>
                    </section>

                    <section>
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-foreground text-sm font-semibold tracking-wide uppercase">
                          Saved Palettes
                        </h3>
                        <span className="text-muted-foreground text-xs">
                          {favoritePalettes.length} palettes
                        </span>
                      </div>

                      {favoritePalettes.length === 0 ? (
                        <div className="glass-pill rounded-2xl p-4">
                          <p className="text-muted-foreground text-sm">
                            Save a full palette or create one manually, then
                            drag colors into it.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {favoritePalettes.map((palette) => {
                            const isEditing = editingPaletteId === palette.id;
                            const location: FavoriteLocation = {
                              type: "palette",
                              paletteId: palette.id,
                            };

                            return (
                              <FavoriteDropContainer
                                key={palette.id}
                                location={location}
                                className="glass-card rounded-2xl p-3 transition-all"
                                activeClassName="ring-primary/65 border-primary/60 ring-2"
                              >
                                <div className="mb-3 flex items-center justify-between gap-2">
                                  {isEditing ? (
                                    <input
                                      autoFocus
                                      value={paletteNameDraft}
                                      onChange={(event) =>
                                        setPaletteNameDraft(event.target.value)
                                      }
                                      onBlur={() =>
                                        commitRenamePalette(palette.id)
                                      }
                                      onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                          commitRenamePalette(palette.id);
                                        }

                                        if (event.key === "Escape") {
                                          cancelRenamePalette();
                                        }
                                      }}
                                      className="bg-muted/20 text-foreground border-border focus:ring-ring w-full rounded-lg border px-2 py-1 text-sm outline-none focus:ring-2"
                                      aria-label="Palette name"
                                    />
                                  ) : (
                                    <h4 className="text-foreground truncate text-sm font-semibold">
                                      {palette.name}
                                    </h4>
                                  )}

                                  <div className="flex gap-1">
                                    <Button
                                      variant="action"
                                      size="icon"
                                      round
                                      onClick={() =>
                                        applyFavoritePalette(palette.id)
                                      }
                                      className="h-7 w-7"
                                      title="Apply palette to editor"
                                      aria-label="Apply palette to editor"
                                    >
                                      <Play size={14} />
                                    </Button>

                                    {isEditing ? (
                                      <Button
                                        variant="action"
                                        size="icon"
                                        round
                                        onClick={() =>
                                          commitRenamePalette(palette.id)
                                        }
                                        className="h-7 w-7"
                                        title="Save palette name"
                                        aria-label="Save palette name"
                                      >
                                        <Check size={14} />
                                      </Button>
                                    ) : (
                                      <Button
                                        variant="action"
                                        size="icon"
                                        round
                                        onClick={() =>
                                          beginRenamePalette(palette)
                                        }
                                        className="h-7 w-7"
                                        title="Rename palette"
                                        aria-label="Rename palette"
                                      >
                                        <Pencil size={14} />
                                      </Button>
                                    )}

                                    <Button
                                      variant="danger"
                                      size="icon"
                                      round
                                      onClick={() =>
                                        removeFavoritePalette(palette.id)
                                      }
                                      className="h-7 w-7"
                                      title="Delete palette"
                                      aria-label="Delete palette"
                                    >
                                      <Trash2 size={14} />
                                    </Button>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  {palette.colors.length === 0 ? (
                                    <p className="text-muted-foreground text-xs">
                                      This palette is empty. Drop colors here or
                                      use the heart save dialog.
                                    </p>
                                  ) : (
                                    palette.colors.map((hex) => (
                                      <FavoriteColorChip
                                        key={`${palette.id}-${hex}`}
                                        hex={hex}
                                        location={location}
                                        onCopy={copyToClipboard}
                                        onRemove={handleRemoveColor}
                                      />
                                    ))
                                  )}
                                </div>
                              </FavoriteDropContainer>
                            );
                          })}
                        </div>
                      )}
                    </section>
                  </div>
                </DndContext>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title="Export Favorite Library"
        colors={exportColors}
      />
    </>
  );
};
