import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set) => ({
      items: [],
      
      addToCart: (product) => set((state) => {
        const productId = product._id || product.id;
        const stock = Number(product.stock);
        const maxQty = Number.isFinite(stock) && stock > 0 ? stock : Infinity;
        const requestedQty = Math.max(1, product.quantity || 1);

        if (Number.isFinite(stock) && stock <= 0) {
          return state;
        }

        const existingItem = state.items.find((item) => (item._id || item.id) === productId);
        if (existingItem) {
          return {
            items: state.items.map((item) =>
              (item._id || item.id) === productId
                ? { ...item, ...product, quantity: Math.min(maxQty, item.quantity + requestedQty) }
                : item
            ),
          };
        }
        return { items: [...state.items, { ...product, id: productId, quantity: Math.min(maxQty, requestedQty) }] };
      }),

      removeFromCart: (productId) => set((state) => ({
        items: state.items.filter((item) => (item._id || item.id) !== productId),
      })),

      syncItems: (items) => set({ items }),

      updateQuantity: (productId, quantity) => set((state) => ({
        items: state.items.map((item) => {
          if ((item._id || item.id) !== productId) {
            return item;
          }

          const stock = Number(item.stock);
          const maxQty = Number.isFinite(stock) && stock > 0 ? stock : Infinity;
          return { ...item, quantity: Math.max(1, Math.min(maxQty, quantity)) };
        }),
      })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'fikilshi-cart',
    }
  )
);

export default useCartStore;
