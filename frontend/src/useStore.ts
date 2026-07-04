import { create } from 'zustand';

interface StoreState {
  credits: number;
  deductCredits: (amount: number) => void;
  addCredits: (amount: number) => void;
}

export const useStore = create<StoreState>((set) => ({
  credits: 500.0, // Starting default credits for the mock user
  deductCredits: (amount: number) => 
    set((state) => ({ credits: Math.max(0, state.credits - amount) })),
  addCredits: (amount: number) => 
    set((state) => ({ credits: state.credits + amount })),
}));
