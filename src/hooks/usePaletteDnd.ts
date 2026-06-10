import { useState } from "react";
import {
  type DragEndEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { usePaletteStore } from "@/store/usePaletteStore";

const DRAG_ACTIVATION_DISTANCE = 15;

interface UsePaletteDndResult {
  activeId: string | null;
  handleDragEnd: (event: DragEndEvent) => void;
  handleDragStart: (event: DragStartEvent) => void;
  sensors: ReturnType<typeof useSensors>;
}

export const usePaletteDnd = (): UsePaletteDndResult => {
  const reorderColors = usePaletteStore((state) => state.reorderColors);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: DRAG_ACTIVATION_DISTANCE,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id));
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);

    if (!over) return;

    const activeColorId = String(active.id);
    const overColorId = String(over.id);
    reorderColors(activeColorId, overColorId);
  };

  return {
    activeId,
    handleDragEnd,
    handleDragStart,
    sensors,
  };
};
