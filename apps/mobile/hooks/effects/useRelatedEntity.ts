import { useEffect, useState } from 'react';

type RelatedEntity<T> = {
  selected: { id: number } | null;
  selectedRelatedId: number | null | undefined;
  storeItems: T[];
  fetchBySelectedId: (id: number) => Promise<T | null>;
  updateSelected: (updated: any) => void;
};

export function useRelatedEntity<T extends { id: number }>({
  selected,
  selectedRelatedId,
  storeItems,
  fetchBySelectedId,
  updateSelected,
}: RelatedEntity<T>) {
  const [entity, setEntity] = useState<T | null>(null);

  useEffect(() => {
    setEntity(null);
    if (!selected) return;

    if (selectedRelatedId) {
      const local = storeItems.find((i) => i.id === selectedRelatedId);
      if (local) return setEntity(local);
    }

    const load = async () => {
      const fetched = await fetchBySelectedId(selected.id);
      if (fetched) {
        setEntity(fetched);
        updateSelected({ ...selected, selectedRelatedId: fetched.id });
      }
    };
    void load();
  }, [selected]);

  return entity;
}
