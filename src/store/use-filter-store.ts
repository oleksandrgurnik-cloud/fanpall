import { create } from "zustand";

interface FilterState {
  sortBy: "price_asc" | "price_desc" | "rating" | "newest";
  minPrice: number | null;
  maxPrice: number | null;
  onlineOnly: boolean;
  setSortBy: (sort: FilterState["sortBy"]) => void;
  setMinPrice: (price: number | null) => void;
  setMaxPrice: (price: number | null) => void;
  setOnlineOnly: (online: boolean) => void;
  reset: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  sortBy: "newest",
  minPrice: null,
  maxPrice: null,
  onlineOnly: false,
  setSortBy: (sortBy) => set({ sortBy }),
  setMinPrice: (minPrice) => set({ minPrice }),
  setMaxPrice: (maxPrice) => set({ maxPrice }),
  setOnlineOnly: (onlineOnly) => set({ onlineOnly }),
  reset: () =>
    set({
      sortBy: "newest",
      minPrice: null,
      maxPrice: null,
      onlineOnly: false,
    }),
}));
