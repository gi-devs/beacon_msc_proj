import { create } from 'zustand';
import { PaginatedResponse } from '@beacon/types';

export type PaginatedStore<T> = {
  items: T[];
  loading: boolean;
  hasMore: boolean;
  page: number;
  fetchMore: () => Promise<void>;
  refresh: () => Promise<void>;
  fetchSingle: (id: number) => Promise<null | T>;
  updateSingleItem: (item: T) => void;
  fetchPage: (pageToFetch: number, clear?: boolean) => Promise<void>;
};

export function createPaginatedStore<T>(
  fetchFn: (take: number, skip: number) => Promise<PaginatedResponse<T>>,
  fetchSingleFn: (id: number) => Promise<T>,
  limit = 10,
) {
  return create<PaginatedStore<T>>((set, get) => ({
    items: [],
    loading: false,
    hasMore: true,
    page: 1,

    fetchPage: async (pageToFetch: number, clear = false) => {
      try {
        set({ loading: true });
        const data = await fetchFn(limit, (pageToFetch - 1) * limit);
        set((state) => {
          const merged = clear ? [] : [...state.items];
          const map = new Map(merged.map((item: any) => [item.id, item]));
          for (const item of data.items as any[]) {
            map.set(item.id, item);
          }
          return {
            items: Array.from(map.values()),
            hasMore: data.hasMore,
            page: pageToFetch,
            loading: false,
          };
        });
      } catch (e) {
        console.error('Error fetching paginated data:', e);
        set({ loading: false });
      }
    },

    fetchMore: async () => {
      const { hasMore, loading, page } = get();
      if (!hasMore || loading) return;
      await get().fetchPage(page + 1);
    },

    refresh: async () => {
      set({ hasMore: true });
      await get().fetchPage(1, true);
    },

    fetchSingle: async (id: number) => {
      try {
        set({ loading: true });
        const data = await fetchSingleFn(id);
        set((state) => {
          const map = new Map(state.items.map((item: any) => [item.id, item]));
          map.set((data as any).id, data);
          return { items: Array.from(map.values()), loading: false };
        });
        return data;
      } catch (e) {
        console.error('Error fetching single item:', e);
        set({ loading: false });
        throw e;
      }
    },

    updateSingleItem: (item: T) => {
      set((state) => {
        const map = new Map(state.items.map((i: any) => [i.id, i]));
        map.set((item as any).id, item);
        return {
          items: Array.from(map.values()).sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        };
      });
    },
  }));
}
