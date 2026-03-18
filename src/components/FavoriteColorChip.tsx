"use client";

import { type CSSProperties, useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Copy, GripVertical, Trash2 } from "lucide-react";

import type { FavoriteLocation } from "@/store/usePaletteStore";
import { Button } from "@/components";

interface FavoriteColorChipProps {
  hex: string;
  location: FavoriteLocation;
  onCopy: (hex: string) => void;
  onRemove: (hex: string, location: FavoriteLocation) => void;
}

const getDraggableId = (location: FavoriteLocation, hex: string) => {
  if (location.type === "default") {
    return `favorite-color:default:${hex}`;
  }

  return `favorite-color:palette:${location.paletteId}:${hex}`;
};

export const FavoriteColorChip = ({
  hex,
  location,
  onCopy,
  onRemove,
}: FavoriteColorChipProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: getDraggableId(location, hex),
      data: {
        favoriteColorDrag: {
          from: location,
          hex,
        },
      },
    });

  const style = useMemo<CSSProperties>(
    () => ({
      transform: CSS.Translate.toString(transform),
      transition: isDragging
        ? undefined
        : "transform 150ms cubic-bezier(0.4, 0, 0.2, 1)",
      opacity: isDragging ? 0.3 : 1,
      zIndex: isDragging ? 40 : "auto",
      cursor: isDragging ? "grabbing" : "grab",
    }),
    [isDragging, transform]
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-muted/20 flex items-center justify-between rounded-xl px-2 py-2"
    >
      <div className="flex items-center gap-2">
        <span
          className="border-border h-6 w-6 rounded-md border"
          style={{ backgroundColor: hex }}
        />
        <span className="text-foreground font-mono text-sm font-semibold tracking-wide uppercase">
          {hex}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          {...attributes}
          {...listeners}
          variant="action"
          size="icon"
          round
          className="hover:bg-accent/20 h-7 w-7 cursor-grab transition-all duration-150 ease-out active:scale-105 active:cursor-grabbing"
          style={{ touchAction: "none" }}
          title="Drag color to another palette"
          aria-label="Drag color to another palette"
        >
          <GripVertical size={14} />
        </Button>

        <Button
          variant="action"
          size="icon"
          round
          onClick={() => onCopy(hex)}
          className="h-7 w-7"
          title="Copy HEX value"
          aria-label="Copy HEX value"
        >
          <Copy size={14} />
        </Button>

        <Button
          variant="danger"
          size="icon"
          round
          onClick={() => onRemove(hex, location)}
          className="h-7 w-7"
          title="Remove color from favorites"
          aria-label="Remove color from favorites"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
};
