import { create } from 'zustand';
import { PaginatedResponse } from '@beacon/types';
import { getUserCommunityRoomsRequest } from '@/api/communityRoomApi';
import { parseToSeverError } from '@/utils/parseToSeverError';
import { UserCommunityRoomDTO } from '@beacon/types';

type CommunityStoreState = {
  items: UserCommunityRoomDTO[];
  loading: boolean;
  hasMore: boolean;
  page: number;

  fetchPage: (pageToFetch: number, clear?: boolean) => Promise<void>;
  fetchMore: () => Promise<void>;
  refresh: () => Promise<void>;
  // fetchSingle: (id: string) => Promise<UserCommunityRoomDTO | null>;
  // updateSingleItem: (item: UserCommunityRoomDTO) => void;
};

const LIMIT = 10;

export const useCommunitiesStore = create<CommunityStoreState>((set, get) => ({
  items: [],
  loading: false,
  hasMore: true,
  page: 1,

  fetchPage: async (pageToFetch, clear = false) => {
    try {
      set({ loading: true });
      const data: PaginatedResponse<UserCommunityRoomDTO> =
        await getUserCommunityRoomsRequest(LIMIT, (pageToFetch - 1) * LIMIT);

      set((state) => {
        const merged = clear ? [] : [...state.items];
        const map = new Map(merged.map((item) => [item.id, item]));
        for (const item of data.items) {
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
      console.error('Error fetching paginated data:', parseToSeverError(e));
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

  // fetchSingle: async (id) => {
  //   try {
  //     set({ loading: true });
  //     const data = await getCommunityRoomByIdRequest(id);
  //     set((state) => {
  //       const map = new Map(state.items.map((item) => [item.id, item]));
  //       map.set(data.id, data);
  //       return { items: Array.from(map.values()), loading: false };
  //     });
  //     return data;
  //   } catch (e) {
  //     console.error('Error fetching single item:', parseToSeverError(e));
  //     set({ loading: false });
  //     return null;
  //   }
  // },
  //
  // updateSingleItem: (item) => {
  //   set((state) => {
  //     const map = new Map(state.items.map((i) => [i.id, i]));
  //     map.set(item.id, item);
  //     return {
  //       items: Array.from(map.values()).sort(
  //         (a, b) =>
  //           new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  //       ),
  //     };
  //   });
  // },
}));
