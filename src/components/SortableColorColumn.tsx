"use client";

import { type CSSProperties, useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
      zIndex: isDragging ? 30 : "auto",
      cursor: "default",
    }),
    [isDragging, transform, transition]
  );

  return (
    <div ref={setNodeRef} style={style} className="group relative flex flex-1">
      <ColorColumn
        id={id}
        hex={hex}
        isLocked={isLocked}
        dragAttributes={attributes}
        dragListeners={listeners}
        dragActivatorRef={setActivatorNodeRef}
      />
    </div>
  );
};
