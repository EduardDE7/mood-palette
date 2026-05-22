import { useState } from "react";
import { Palette, Plus, Heart, Download, Save } from "lucide-react";
import { Button, ExportModal } from "@/components";
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
    <header className="glass-card fixed top-6 left-1/2 z-50 flex h-14 w-[95%] max-w-5xl -translate-x-1/2 items-center justify-between rounded-full px-2 shadow-2xl sm:w-[90%] sm:px-3">
      <div className="flex items-center gap-2">
        <div className="bg-muted/20 text-foreground rounded-full p-2 shadow-inner">
          <Palette size={20} />
        </div>
        <h1 className="text-foreground text-xl font-bold tracking-tight drop-shadow-sm">
          MoodPalette
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
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

          <Button variant="outline" size="sm" round onClick={addColor}>
            <Plus size={16} />
            Add Color
          </Button>
        </div>
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
