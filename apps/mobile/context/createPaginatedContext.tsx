import React, { createContext, useContext, useState } from 'react';
import { PaginatedResponse } from '@beacon/types';

type PaginatedContextType<T> = {
  items: T[];
  updateSingleItem: (item: T) => void;
  loading: boolean;
  hasMore: boolean;
  page: number;
  fetchMore: () => Promise<void>;
  refresh: () => Promise<void>;
  fetchSingle: (id: number) => Promise<null | T>;
};

export function createPaginatedContext<T>(
  fetchFn: (take: number, skip: number) => Promise<PaginatedResponse<T>>,
  fetchSingleFn: (id: number) => Promise<T>,
  limit = 10,
) {
  const Context = createContext<PaginatedContextType<T> | undefined>(undefined);

  const Provider = ({ children }: { children: React.ReactNode }) => {
    const [items, setItems] = useState<T[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const fetchPage = async (pageToFetch: number, replace = false) => {
      try {
        setLoading(true);
        const data = await fetchFn(limit, (pageToFetch - 1) * limit);
        setHasMore(data.hasMore);
        setItems((prev) => {
          const merged = replace ? [] : [...prev];
          const map = new Map(merged.map((item: any) => [item.id, item]));

          for (const item of data.items as any[]) {
            map.set(item.id, item);
          }

          return Array.from(map.values());
        });
        setPage(pageToFetch);
      } catch (e) {
        console.error('Error fetching paginated data:', e);
      } finally {
        setLoading(false);
      }
    };

    const fetchMore = async () => {
      if (!hasMore || loading) return;
      await fetchPage(page + 1);
    };

    const refresh = async () => {
      setHasMore(true);
      await fetchPage(1, true);
    };

    /**
     * Gets a single item by ID and updates the context.
     * @throws if the fetch fails
     */
    const fetchSingle = async (id: number) => {
      try {
        setLoading(true);
        const data = await fetchSingleFn(id);
        setItems((prev) => {
          const map = new Map(prev.map((item: any) => [item.id, item]));
          map.set((data as any).id, data);
          return Array.from(map.values());
        });
        return data;
      } catch (e) {
        console.error('Error fetching single item:', e);
        throw e; // Re-throw to handle it in the component if needed
      } finally {
        setLoading(false);
      }
    };

    const updateSingleItem = (item: T) => {
      console.log('Updating single item');
      setItems((prev) => {
        const map = new Map(prev.map((item: any) => [item.id, item]));
        map.set((item as any).id, item);

        return Array.from(map.values()).sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      });
    };

    return (
      <Context.Provider
        value={{
          items,
          updateSingleItem,
          loading,
          hasMore,
          page,
          fetchMore,
          refresh,
          fetchSingle,
        }}
      >
        {children}
      </Context.Provider>
    );
  };

  const usePaginated = () => {
    const ctx = useContext(Context);
    if (!ctx) throw new Error('usePaginated must be used inside its Provider');
    return ctx;
  };

  return { Provider, usePaginated };
}
