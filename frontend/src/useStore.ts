import { create } from 'zustand';

interface StoreState {
  credits: number | null;
  setCredits: (amount: number) => void;
  deductCredits: (amount: number) => void;
}

export const useStore = create<StoreState>((set) => ({
  credits: null, // Start as null until fetched
  setCredits: (amount: number) => set({ credits: amount }),
  deductCredits: (amount: number) => 
    set((state) => ({ credits: state.credits !== null ? Math.max(0, state.credits - amount) : null })),
}));
