"use client";

import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import type { FavoriteLocation } from "@/store/usePaletteStore";
import { cn } from "@/utils";

interface FavoriteDropContainerProps {
  activeClassName?: string;
  children: ReactNode;
  className?: string;
  location: FavoriteLocation;
}

const getDropId = (location: FavoriteLocation) => {
  if (location.type === "default") {
    return "favorite-drop:default";
  }

  return `favorite-drop:palette:${location.paletteId}`;
};

export const FavoriteDropContainer = ({
  activeClassName,
  children,
  className,
  location,
}: FavoriteDropContainerProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id: getDropId(location),
    data: {
      favoriteDropTarget: {
        to: location,
      },
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(className, isOver ? activeClassName : undefined)}
    >
      {children}
    </div>
  );
};
