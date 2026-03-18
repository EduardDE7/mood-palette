import { useState } from "react";
import {
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  type FavoriteLocation,
  usePaletteStore,
} from "@/store/usePaletteStore";

interface FavoriteColorDragPayload {
  from: FavoriteLocation;
  hex: string;
}

interface FavoriteDropPayload {
  to: FavoriteLocation;
}

interface UseFavoritesDndResult {
  activeHex: string | null;
  handleDragEnd: (event: DragEndEvent) => void;
  handleDragStart: (event: DragStartEvent) => void;
  sensors: ReturnType<typeof useSensors>;
}

const DRAG_ACTIVATION_DISTANCE = 8;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isFavoriteLocation = (value: unknown): value is FavoriteLocation => {
  if (!isRecord(value)) {
    return false;
  }

  const type = value.type;

  if (type === "default") {
    return true;
  }

  if (type !== "palette") {
    return false;
  }

  return typeof value.paletteId === "string";
};

const getFavoriteColorDragPayload = (value: unknown) => {
  if (!isRecord(value)) {
    return null;
  }

  const payload = value.favoriteColorDrag;

  if (!isRecord(payload)) {
    return null;
  }

  const from = payload.from;
  const hex = payload.hex;

  if (!isFavoriteLocation(from) || typeof hex !== "string") {
    return null;
  }

  return {
    from,
    hex,
  } satisfies FavoriteColorDragPayload;
};

const getFavoriteDropPayload = (value: unknown) => {
  if (!isRecord(value)) {
    return null;
  }

  const payload = value.favoriteDropTarget;

  if (!isRecord(payload)) {
    return null;
  }

  const to = payload.to;

  if (!isFavoriteLocation(to)) {
    const fallbackDragPayload = getFavoriteColorDragPayload(value);

    if (!fallbackDragPayload) {
      return null;
    }

    return {
      to: fallbackDragPayload.from,
    } satisfies FavoriteDropPayload;
  }

  return {
    to,
  } satisfies FavoriteDropPayload;
};

export const useFavoritesDnd = (): UseFavoritesDndResult => {
  const moveFavoriteColor = usePaletteStore((state) => state.moveFavoriteColor);
  const [activeHex, setActiveHex] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: DRAG_ACTIVATION_DISTANCE,
      },
    })
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    const dragPayload = getFavoriteColorDragPayload(active.data.current);

    if (!dragPayload) {
      return;
    }

    setActiveHex(dragPayload.hex);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveHex(null);

    if (!over) {
      return;
    }

    const dragPayload = getFavoriteColorDragPayload(active.data.current);
    const dropPayload = getFavoriteDropPayload(over.data.current);

    if (!dragPayload || !dropPayload) {
      return;
    }

    moveFavoriteColor(dragPayload.hex, dragPayload.from, dropPayload.to);
  };

  return {
    activeHex,
    handleDragEnd,
    handleDragStart,
    sensors,
  };
};
