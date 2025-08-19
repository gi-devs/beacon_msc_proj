import React, { createContext, useContext, useState } from 'react';

export type PaginatedResponse<T> = {
  items: T[];
  totalCount: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
};

type PaginatedContextType<T> = {
  items: T[];
  loading: boolean;
  hasMore: boolean;
  page: number;
  fetchMore: () => Promise<void>;
  refresh: () => Promise<void>;
};

export function createPaginatedContext<T>(
  fetchFn: (take: number, skip: number) => Promise<PaginatedResponse<T>>,
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

    return (
      <Context.Provider
        value={{ items, loading, hasMore, page, fetchMore, refresh }}
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
