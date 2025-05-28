import { create } from 'zustand';

export interface GeneratorState {
  imageFile: File | null;
  text: string;
  provider: 'auto' | 'spar3d' | 'meshy';   // 'auto' = let router choose
  setImage: (f: File | null) => void;
  setText: (t: string) => void;
  setProvider: (p: 'auto' | 'spar3d' | 'meshy') => void;
}

export const useGenerator = create<GeneratorState>((set) => ({
  imageFile: null,
  text: '',
  provider: 'auto',
  setImage: (file) => set({ imageFile: file }),
  setText: (t) => set({ text: t }),
  setProvider: (p) => set({ provider: p })
}));