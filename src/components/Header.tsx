import { useState } from "react";
import { Plus, Heart, Download, Save } from "lucide-react";
import { BrandLogo, Button, ExportModal, SavePaletteModal } from "@/components";
import { usePaletteStore } from "@/store/usePaletteStore";

interface HeaderProps {
  onAddColor: () => void;
  onOpenFavorites: () => void;
}

export const Header = ({ onAddColor, onOpenFavorites }: HeaderProps) => {
  const colors = usePaletteStore((state) => state.colors);
  const savePaletteToFavorites = usePaletteStore(
    (state) => state.savePaletteToFavorites
  );

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSavePaletteOpen, setIsSavePaletteOpen] = useState(false);
  const [savePaletteModalKey, setSavePaletteModalKey] = useState(0);

  const currentPaletteColors = colors.map((color) => color.hex);

  const handleSavePalette = (name: string, paletteColors: string[]) => {
    savePaletteToFavorites(name, paletteColors);
  };

  const openSavePaletteModal = () => {
    setSavePaletteModalKey((currentKey) => currentKey + 1);
    setIsSavePaletteOpen(true);
  };

  return (
    <header className="glass-card bg-card/90 relative z-50 flex h-12 w-full items-center rounded-none border-x-0 px-2 shadow-none md:fixed md:top-6 md:left-1/2 md:h-14 md:w-[90%] md:max-w-5xl md:-translate-x-1/2 md:rounded-full md:px-3">
      <div className="flex shrink-0 items-center">
        <BrandLogo />
      </div>

      <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1 sm:gap-3">
        <Button
          variant="ghost"
          size="sm"
          round
          onClick={openSavePaletteModal}
          title="Save current palette to favorites"
          aria-label="Save current palette to favorites"
          className="max-md:h-9 max-md:w-9 max-md:p-0"
        >
          <Save size={16} />
          <span className="hidden md:inline">Save Palette</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          round
          onClick={() => setIsExportOpen(true)}
          title="Export current palette"
          aria-label="Export current palette"
          className="max-md:h-9 max-md:w-9 max-md:p-0"
        >
          <Download size={18} />
          <span className="hidden md:inline">Export</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          round
          onClick={onOpenFavorites}
          title="Open favorites library"
          aria-label="Open favorites library"
          className="max-md:h-9 max-md:w-9 max-md:p-0"
        >
          <Heart size={18} />
          <span className="hidden md:inline">Favorites</span>
        </Button>
      </div>

      <div className="ml-auto flex shrink-0 items-center">
        <Button
          variant="white"
          size="sm"
          round
          onClick={onAddColor}
          title="Add a new color"
          aria-label="Add a new color"
          className="max-md:h-9 max-md:w-9 max-md:p-0"
        >
          <Plus size={16} />
          <span className="hidden md:inline">Add Color</span>
        </Button>
      </div>

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title="Export Palette"
        colors={currentPaletteColors}
      />

      <SavePaletteModal
        key={savePaletteModalKey}
        isOpen={isSavePaletteOpen}
        onClose={() => setIsSavePaletteOpen(false)}
        onSave={handleSavePalette}
        colors={currentPaletteColors}
      />
    </header>
  );
};
