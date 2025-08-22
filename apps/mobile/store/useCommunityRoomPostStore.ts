import { create } from 'zustand';
import { PaginatedResponse, CommunityPostDTO } from '@beacon/types';
import {
  getCommunityRoomPostByIdRequest,
  getCommunityRoomPostsByRoomIdRequest,
} from '@/api/communityRoomApi';

type RoomState = {
  items: CommunityPostDTO[];
  hasMore: boolean;
  page: number;
};

type CommunityPostStore = {
  rooms: Record<string, RoomState>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  activeRoomId: string | null;
  setRoomId: (roomId: string) => void;
  fetchPage: (pageToFetch: number, clear?: boolean) => Promise<void>;
  fetchMore: () => Promise<void>;
  refresh: () => Promise<void>;
  fetchSingle: (id: number) => Promise<null | CommunityPostDTO>;
  updateSingleItem: (item: CommunityPostDTO) => void;
  removeSingleItem: (id: number) => void;
};

const LIMIT = 10;

export const useCommunityPostStore = create<CommunityPostStore>((set, get) => ({
  rooms: {},
  loading: false,
  activeRoomId: null,
  setLoading: (loading) => set({ loading }),

  setRoomId: (roomId) => {
    set((state) => {
      if (!state.rooms[roomId]) {
        state.rooms[roomId] = { items: [], hasMore: true, page: 1 };
      }
      return { activeRoomId: roomId, rooms: { ...state.rooms } };
    });
  },

  fetchPage: async (pageToFetch: number, clear = false) => {
    const { activeRoomId } = get();
    if (!activeRoomId) return;

    try {
      set({ loading: true });
      const data: PaginatedResponse<CommunityPostDTO> =
        await getCommunityRoomPostsByRoomIdRequest(
          activeRoomId,
          LIMIT,
          (pageToFetch - 1) * LIMIT,
        );

      set((state) => {
        const prevRoom = state.rooms[activeRoomId] || {
          items: [],
          hasMore: true,
          page: 1,
        };
        const merged = clear ? [] : [...prevRoom.items];
        const map = new Map(merged.map((item) => [item.id, item]));
        for (const item of data.items) {
          map.set(item.id, item);
        }

        return {
          loading: false,
          rooms: {
            ...state.rooms,
            [activeRoomId]: {
              items: Array.from(map.values()).sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              ),
              hasMore: data.hasMore,
              page: pageToFetch,
            },
          },
        };
      });
    } catch (e) {
      console.error('Error fetching community posts:', e);
      set({ loading: false });
    }
  },

  fetchMore: async () => {
    const { activeRoomId, rooms, loading } = get();
    if (!activeRoomId) return;
    const room = rooms[activeRoomId];
    if (!room || !room.hasMore || loading) return;
    await get().fetchPage(room.page + 1);
  },

  refresh: async () => {
    await get().fetchPage(1, true);
  },

  fetchSingle: async (id: number) => {
    try {
      set({ loading: true });
      const data = await getCommunityRoomPostByIdRequest(id);
      const { activeRoomId } = get();
      if (!activeRoomId) return data;

      set((state) => {
        const room = state.rooms[activeRoomId] || {
          items: [],
          hasMore: true,
          page: 1,
        };
        const map = new Map(room.items.map((i) => [i.id, i]));
        map.set(data.id, data);
        return {
          loading: false,
          rooms: {
            ...state.rooms,
            [activeRoomId]: { ...room, items: Array.from(map.values()) },
          },
        };
      });
      return data;
    } catch (e) {
      console.error('Error fetching single post:', e);
      set({ loading: false });
      throw e;
    }
  },

  updateSingleItem: (item: CommunityPostDTO) => {
    const { activeRoomId } = get();
    if (!activeRoomId) return;
    set((state) => {
      const room = state.rooms[activeRoomId];
      if (!room) return {};
      const map = new Map(room.items.map((i) => [i.id, i]));
      map.set(item.id, item);
      return {
        rooms: {
          ...state.rooms,
          [activeRoomId]: {
            ...room,
            items: Array.from(map.values()).sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            ),
          },
        },
      };
    });
  },
  removeSingleItem: (id: number) => {
    const { activeRoomId } = get();
    if (!activeRoomId) return;
    set((state) => {
      const room = state.rooms[activeRoomId];
      if (!room) return {};
      return {
        rooms: {
          ...state.rooms,
          [activeRoomId]: {
            ...room,
            items: room.items.filter((i) => i.id !== id),
          },
        },
      };
    });
  },
}));
