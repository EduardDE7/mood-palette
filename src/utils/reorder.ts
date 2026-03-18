interface ItemWithId {
  id: string;
}

/**
 * Moves an item in array by item ids.
 * Returns the same reference when ids are invalid or order does not change.
 */
export const moveItemById = <T extends ItemWithId>(
  items: T[],
  activeId: string,
  overId: string
): T[] => {
  if (activeId === overId) return items;

  const oldIndex = items.findIndex((item) => item.id === activeId);
  const newIndex = items.findIndex((item) => item.id === overId);

  if (oldIndex < 0 || newIndex < 0) return items;

  const nextItems = [...items];
  const [movedItem] = nextItems.splice(oldIndex, 1);
  nextItems.splice(newIndex, 0, movedItem);

  return nextItems;
};
