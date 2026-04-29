import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAdmin: false,
      
      login: (userData) => set({ 
        user: userData, 
        isAdmin: userData.role === 'admin' 
      }),
      
      logout: () => set({ 
        user: null, 
        isAdmin: false 
      }),
    }),
    {
      name: 'fikilshi-auth',
    }
  )
);

export default useAuthStore;
