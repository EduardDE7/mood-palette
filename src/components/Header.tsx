import { Palette, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePaletteStore } from "@/store/usePaletteStore";

export const Header = () => {
  const addColor = usePaletteStore((state) => state.addColor);

  return (
    <header className="flex h-16 items-center justify-between bg-black px-6">
      <div className="flex items-center gap-2">
        <div className="bg-muted rounded-lg p-1.5">
          <Palette className="text-primary-foreground" size={20} />
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
        <Button
          variant="outline"
          size="sm"
          onClick={addColor}
          className="gap-2"
        >
          <Plus size={16} />
          Add Color
        </Button>
      </div>
    </header>
  );
};
