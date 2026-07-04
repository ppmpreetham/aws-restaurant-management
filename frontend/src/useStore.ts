import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  name: string;
  username: string;
  role: string;
}

interface StoreState {
  credits: number | null;
  setCredits: (amount: number) => void;
  deductCredits: (amount: number) => void;
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      credits: null,
      token: null,
      user: null,
      setCredits: (amount: number) => set({ credits: amount }),
      deductCredits: (amount: number) => 
        set((state) => ({ credits: state.credits !== null ? Math.max(0, state.credits - amount) : null })),
      login: (token: string, user: User) => set({ token, user }),
      logout: () => set({ token: null, user: null, credits: null }),
    }),
    {
      name: 'restaurant-store',
    }
  )
);
