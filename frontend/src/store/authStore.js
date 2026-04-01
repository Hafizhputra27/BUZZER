import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  role: null,
  session: null,
  setUser: (user, role, session) => set({ user, role, session }),
  clearUser: () => set({ user: null, role: null, session: null }),
}));

export default useAuthStore;
