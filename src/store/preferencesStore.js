import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const usePreferencesStore = create(
  persist(
    (set) => ({
      language: 'en',
      currency: 'USD',
      setLanguage: (language) => set({ language }),
      toggleLanguage: () => set((state) => ({ language: state.language === 'en' ? 'ar' : 'en' })),
      setCurrency: (currency) => set({ currency }),
      toggleCurrency: () => set((state) => ({ currency: state.currency === 'USD' ? 'LBP' : 'USD' })),
    }),
    {
      name: 'fikilshi-preferences',
    }
  )
);

export default usePreferencesStore;
