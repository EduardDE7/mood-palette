import { useState } from "react";
import { Palette, Plus, Heart, Download } from "lucide-react";
import { Button, ExportModal } from "@/components";
import { usePaletteStore } from "@/store/usePaletteStore";

interface HeaderProps {
  onOpenFavorites: () => void;
}

export const Header = ({ onOpenFavorites }: HeaderProps) => {
  const addColor = usePaletteStore((state) => state.addColor);
  const colors = usePaletteStore((state) => state.colors);

  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <header className="bg-background flex h-16 items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <div className="bg-muted rounded-lg p-1.5">
          <Palette className="text-foreground" size={20} />
        </div>
        <h1 className="text-xl font-bold tracking-tight">MoodPalette</h1>
      </div>

      <div className="flex items-center gap-4">
        <p className="text-muted-foreground hidden text-sm sm:block">
          Press{" "}
          <kbd className="bg-muted rounded px-2 py-1 font-sans text-xs">
            Space
          </kbd>{" "}
          to generate!
        </p>

        <div className="flex items-center gap-2">
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
