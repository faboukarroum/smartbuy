import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set) => ({
      items: [],
      
      addToCart: (product) => set((state) => {
        const productId = product._id || product.id;
        const existingItem = state.items.find((item) => (item._id || item.id) === productId);
        if (existingItem) {
          return {
            items: state.items.map((item) =>
              (item._id || item.id) === productId
                ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                : item
            ),
          };
        }
        return { items: [...state.items, { ...product, id: productId, quantity: product.quantity || 1 }] };
      }),

      removeFromCart: (productId) => set((state) => ({
        items: state.items.filter((item) => (item._id || item.id) !== productId),
      })),

      updateQuantity: (productId, quantity) => set((state) => ({
        items: state.items.map((item) =>
          (item._id || item.id) === productId ? { ...item, quantity } : item
        ),
      })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'fikilshi-cart',
    }
  )
);

export default useCartStore;
