"use client";

import { useMemo, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
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
  SavePaletteModal,
} from "@/components";
import { useFavoritesDnd } from "@/hooks";
import { getContrastColor } from "@/utils/colors";

const CollapsedSwatch = ({
  hex,
  onCopy,
}: {
  hex: string;
  onCopy: (hex: string) => void;
}) => {
  const [copied, setCopied] = useState(false);
  const contrastColor = getContrastColor(hex);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <button
      onClick={handleCopy}
      className="border-border group/swatch focus:ring-ring relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border transition-all duration-200 hover:scale-115 hover:shadow-md focus:ring-1 focus:outline-none active:scale-95"
      style={{ backgroundColor: hex }}
      title={`Click to copy: ${hex}`}
      aria-label={`Copy color ${hex}`}
    >
      <div
        className="pointer-events-none flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover/swatch:opacity-100"
        style={{ color: contrastColor }}
      >
        {copied ? <Check size={12} strokeWidth={2.5} /> : <Copy size={12} />}
      </div>
    </button>
  );
};

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
  const savePaletteToFavorites = usePaletteStore(
    (state) => state.savePaletteToFavorites
  );
  const applyFavoritePalette = usePaletteStore(
    (state) => state.applyFavoritePalette
  );
  const colors = usePaletteStore((state) => state.colors);

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSavePaletteOpen, setIsSavePaletteOpen] = useState(false);
  const [editingPaletteId, setEditingPaletteId] = useState<string | null>(null);
  const [paletteNameDraft, setPaletteNameDraft] = useState("");
  const [expandedPaletteIds, setExpandedPaletteIds] = useState<string[]>([]);
  const [isDefaultExpanded, setIsDefaultExpanded] = useState(false);
  const { activeHex, handleDragEnd, handleDragStart, sensors } =
    useFavoritesDnd();

  const exportColors = useMemo(() => {
    const colorsFromPalettes = favoritePalettes.flatMap(
      (palette) => palette.colors
    );
    return Array.from(new Set([...favorites, ...colorsFromPalettes]));
  }, [favoritePalettes, favorites]);

  const currentPaletteColors = useMemo(
    () => colors.map((color) => color.hex),
    [colors]
  );

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

  const handleSaveCurrentPalette = (name: string, paletteColors: string[]) => {
    const savedPalette = savePaletteToFavorites(name, paletteColors);

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

  const togglePaletteCompactView = (paletteId: string) => {
    setExpandedPaletteIds((currentIds) =>
      currentIds.includes(paletteId)
        ? currentIds.filter((currentId) => currentId !== paletteId)
        : [...currentIds, paletteId]
    );
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
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="glass-card fixed inset-x-0 bottom-0 z-50 h-[90dvh] rounded-t-3xl border-t shadow-2xl sm:inset-x-auto sm:top-0 sm:right-0 sm:bottom-0 sm:h-full sm:w-[26rem] sm:rounded-t-none sm:border-t-0 sm:border-l"
            >
              <div className="flex h-full flex-col">
                {/* Drag handle for mobile, visible only below sm */}
                <div className="flex items-center justify-center pt-3 sm:hidden">
                  <div className="h-1.5 w-10 rounded-full bg-white/20" />
                </div>

                <div className="border-border border-b p-4 sm:p-5">
                  <div className="mb-3 flex items-center justify-between sm:mb-4">
                    <h2 className="text-foreground text-lg font-bold drop-shadow-md sm:text-xl">
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

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      round
                      onClick={() => setIsSavePaletteOpen(true)}
                      title="Save current palette to favorites"
                      aria-label="Save current palette to favorites"
                    >
                      <Save size={16} />
                      Save Palette
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      round
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
                  <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-5">
                    <section>
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <h3 className="text-foreground text-sm font-semibold tracking-wide uppercase">
                          Default Palette
                        </h3>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground mr-1 text-xs">
                            {favorites.length} colors
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            round
                            onClick={() =>
                              setIsDefaultExpanded(!isDefaultExpanded)
                            }
                            className="h-7 w-7"
                            title={
                              isDefaultExpanded
                                ? "Collapse default palette"
                                : "Expand default palette"
                            }
                            aria-label={
                              isDefaultExpanded
                                ? "Collapse default palette"
                                : "Expand default palette"
                            }
                            aria-expanded={isDefaultExpanded}
                          >
                            {isDefaultExpanded ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )}
                          </Button>
                        </div>
                      </div>

                      <FavoriteDropContainer
                        location={{ type: "default" }}
                        className="rounded-2xl p-2 transition-all"
                        activeClassName="ring-primary/65 border-primary/60 ring-2"
                      >
                        {favorites.length === 0 ? (
                          <p className="text-muted-foreground px-2 py-4 text-sm">
                            Saved standalone colors will appear here.
                          </p>
                        ) : isDefaultExpanded ? (
                          <div className="space-y-2">
                            {favorites.map((hex) => (
                              <FavoriteColorChip
                                key={`default-${hex}`}
                                hex={hex}
                                location={{ type: "default" }}
                                onCopy={copyToClipboard}
                                onRemove={handleRemoveColor}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="flex min-h-8 flex-wrap items-center gap-2">
                            {favorites.map((hex) => (
                              <CollapsedSwatch
                                key={`default-collapsed-${hex}`}
                                hex={hex}
                                onCopy={copyToClipboard}
                              />
                            ))}
                          </div>
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
                        <div className="rounded-2xl p-4">
                          <p className="text-muted-foreground text-sm">
                            Save a full palette or create one manually, then
                            drag colors into it.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {favoritePalettes.map((palette) => {
                            const isEditing = editingPaletteId === palette.id;
                            const isExpanded = expandedPaletteIds.includes(
                              palette.id
                            );
                            const isCollapsed = !isExpanded;
                            const location: FavoriteLocation = {
                              type: "palette",
                              paletteId: palette.id,
                            };

                            return (
                              <FavoriteDropContainer
                                key={palette.id}
                                location={location}
                                className="rounded-2xl p-3 transition-all"
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
                                      className="text-foreground border-border focus:border-accent/80 focus:ring-accent/60 w-full rounded-lg border bg-white/5 px-2 py-1 text-sm backdrop-blur-sm outline-none focus:ring-2"
                                      aria-label="Palette name"
                                    />
                                  ) : (
                                    <h4 className="text-foreground truncate text-sm font-semibold">
                                      {palette.name}
                                    </h4>
                                  )}

                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      round
                                      onClick={() =>
                                        togglePaletteCompactView(palette.id)
                                      }
                                      className="h-7 w-7"
                                      title={
                                        isCollapsed
                                          ? "Expand palette"
                                          : "Collapse palette"
                                      }
                                      aria-label={
                                        isCollapsed
                                          ? "Expand palette"
                                          : "Collapse palette"
                                      }
                                      aria-expanded={!isCollapsed}
                                    >
                                      {isCollapsed ? (
                                        <ChevronDown size={14} />
                                      ) : (
                                        <ChevronUp size={14} />
                                      )}
                                    </Button>

                                    <Button
                                      variant="ghost"
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
                                        variant="ghost"
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
                                        variant="ghost"
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
                                      variant="ghost"
                                      size="icon"
                                      round
                                      onClick={() =>
                                        removeFavoritePalette(palette.id)
                                      }
                                      className="h-7 w-7 text-red-500 hover:text-red-400"
                                      title="Delete palette"
                                      aria-label="Delete palette"
                                    >
                                      <Trash2 size={14} />
                                    </Button>
                                  </div>
                                </div>

                                {isCollapsed ? (
                                  <div className="flex min-h-8 flex-wrap items-center gap-2">
                                    {palette.colors.length === 0 ? (
                                      <p className="text-muted-foreground text-xs">
                                        Empty palette
                                      </p>
                                    ) : (
                                      palette.colors.map((hex, index) => (
                                        <CollapsedSwatch
                                          key={`${palette.id}-swatch-${hex}-${index}`}
                                          hex={hex}
                                          onCopy={copyToClipboard}
                                        />
                                      ))
                                    )}
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {palette.colors.length === 0 ? (
                                      <p className="text-muted-foreground text-xs">
                                        This palette is empty. Drop colors here
                                        or use the heart save dialog.
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
                                )}
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

      <SavePaletteModal
        isOpen={isSavePaletteOpen}
        onClose={() => setIsSavePaletteOpen(false)}
        onSave={handleSaveCurrentPalette}
        colors={currentPaletteColors}
      />
    </>
  );
};
