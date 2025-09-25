import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
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
      </div>
    </header>
  );
};
