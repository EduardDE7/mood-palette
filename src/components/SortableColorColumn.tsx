"use client";

import { type CSSProperties, useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ColorColumn, MobileShadesStrip } from "@/components";
import type { PaletteRoleKey } from "@/utils";

interface SortableColorColumnProps {
  id: string;
  hex: string;
  isLocked: boolean;
  role: PaletteRoleKey | null;
  isMobileShadesOpen?: boolean;
  onCloseMobileShades?: () => void;
  onOpenMobileShades?: (color: { hex: string; id: string }) => void;
}

export const SortableColorColumn = ({
  id,
  hex,
  isLocked,
  role,
  isMobileShadesOpen = false,
  onCloseMobileShades,
  onOpenMobileShades,
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
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex flex-1 max-md:flex-col"
    >
      <div className="flex flex-1 max-md:min-h-[7rem]">
        <ColorColumn
          id={id}
          hex={hex}
          isLocked={isLocked}
          dragAttributes={attributes}
          dragListeners={listeners}
          dragActivatorRef={setActivatorNodeRef}
          onOpenMobileShades={onOpenMobileShades}
          role={role}
        />
      </div>

      <MobileShadesStrip
        color={isMobileShadesOpen ? { hex, id, isLocked } : null}
        onClose={onCloseMobileShades ?? (() => undefined)}
      />
    </div>
  );
};
