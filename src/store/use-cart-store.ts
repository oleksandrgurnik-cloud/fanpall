import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  offerId: string;
  title: string;
  price: number;
  quantity: number;
  gameSlug: string;
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (offerId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.offerId === item.offerId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.offerId === item.offerId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (offerId) =>
        set((state) => ({
          items: state.items.filter((i) => i.offerId !== offerId),
        })),
      clearCart: () => set({ items: [] }),
    }),
    { name: "funpall-cart" }
  )
);
