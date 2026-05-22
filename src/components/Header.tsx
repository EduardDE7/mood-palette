import { useState } from "react";
import { Plus, Heart, Download, Save } from "lucide-react";
import { BrandLogo, Button, ExportModal } from "@/components";
import { usePaletteStore } from "@/store/usePaletteStore";

interface HeaderProps {
  onOpenFavorites: () => void;
}

export const Header = ({ onOpenFavorites }: HeaderProps) => {
  const addColor = usePaletteStore((state) => state.addColor);
  const colors = usePaletteStore((state) => state.colors);
  const saveCurrentPaletteToFavorites = usePaletteStore(
    (state) => state.saveCurrentPaletteToFavorites
  );

  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <header className="glass-card fixed top-6 left-1/2 z-50 flex h-14 w-[95%] max-w-5xl -translate-x-1/2 items-center rounded-full px-2 shadow-2xl sm:w-[90%] sm:px-3">
      <div className="flex shrink-0 items-center">
        <BrandLogo />
      </div>

      <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2 sm:gap-3">
        <Button
          variant="ghost"
          size="sm"
          round
          onClick={saveCurrentPaletteToFavorites}
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
          onClick={() => setIsExportOpen(true)}
        >
          <Download size={18} />
          Export
        </Button>

        <Button variant="ghost" size="sm" round onClick={onOpenFavorites}>
          <Heart size={18} />
          Favorites
        </Button>
      </div>

      <div className="ml-auto flex shrink-0 items-center">
        <Button
          variant="white"
          size="sm"
          round
          onClick={addColor}
          title="Add a new color"
          aria-label="Add a new color"
          className="palettrix-add-color-button border-none"
        >
          <span className="palettrix-add-color-button__content">
            <Plus size={16} />
            <span>Add Color</span>
          </span>
          <span className="palettrix-add-color-button__layer palettrix-add-color-button__layer--one" />
          <span className="palettrix-add-color-button__layer palettrix-add-color-button__layer--two" />
          <span className="palettrix-add-color-button__layer palettrix-add-color-button__layer--three" />
        </Button>
      </div>

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title="Export Palette"
        colors={colors.map((c) => c.hex)}
      />
    </header>
  );
};
