import { create } from "zustand";

type ViewState = "feed" | "post-detail" | "admin" | "resources";

interface StoreState {
  currentView: ViewState;
  selectedPostId: string | null;
  refreshKey: number;
  categoryFilter: string;
  setView: (view: ViewState) => void;
  selectPost: (id: string) => void;
  triggerRefresh: () => void;
  setCategoryFilter: (category: string) => void;
}

export const useStore = create<StoreState>((set) => ({
  currentView: "feed",
  selectedPostId: null,
  refreshKey: 0,
  categoryFilter: "All",
  setView: (view) => set({ currentView: view }),
  selectPost: (id) => set({ selectedPostId: id, currentView: "post-detail" }),
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
  setCategoryFilter: (category) => set({ categoryFilter: category }),
}));
