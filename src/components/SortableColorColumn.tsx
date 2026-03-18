"use client";

import { type CSSProperties, useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Button } from "@/components/ui";
import { getContrastColor } from "@/utils";
import { ColorColumn } from "./ColorColumn";

interface SortableColorColumnProps {
  id: string;
  hex: string;
  isLocked: boolean;
}

export const SortableColorColumn = ({
  id,
  hex,
  isLocked,
}: SortableColorColumnProps) => {
  const contrastColor = getContrastColor(hex);
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = useMemo<CSSProperties>(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition: isDragging ? undefined : transition,
      opacity: isDragging ? 0.3 : 1,
      zIndex: isDragging ? 30 : "auto",
      cursor: isDragging ? "grabbing" : "grab",
    }),
    [isDragging, transform, transition]
  );

  return (
    <div ref={setNodeRef} style={style} className="group relative flex flex-1">
      <ColorColumn id={id} hex={hex} isLocked={isLocked} />

      <Button
        {...attributes}
        {...listeners}
        ref={setActivatorNodeRef}
        variant="action"
        size="icon"
        title="Drag to reorder color"
        aria-label="Drag to reorder color"
        className="absolute top-20 right-3 z-40 h-9 w-9 cursor-grab rounded-full border border-white/20 backdrop-blur-sm transition-all duration-150 ease-out hover:bg-white/20 active:scale-105 active:cursor-grabbing"
        style={{
          touchAction: "none",
          color: contrastColor === "white" ? "#FFFFFF" : "#111111",
          backgroundColor:
            contrastColor === "white"
              ? "rgba(0,0,0,0.35)"
              : "rgba(255,255,255,0.55)",
        }}
      >
        <GripVertical size={18} />
      </Button>
    </div>
  );
};
