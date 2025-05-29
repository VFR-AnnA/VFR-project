import { create } from 'zustand';

export interface GeneratorState {
  imageFile: File | null;
  text: string;
  provider: 'auto' | 'spar3d' | 'meshy';   // 'auto' = let router choose
  setImage: (f: File | null) => void;
  setText: (t: string) => void;
  setProvider: (p: 'auto' | 'spar3d' | 'meshy') => void;
  setDefaultMeasurements: () => void;
}

export const useGeneratorStore = create<GeneratorState>((set) => ({
  imageFile: null,
  text: '',
  provider: 'auto',
  setImage: (file) => set({ imageFile: file }),
  setText: (t) => set({ text: t }),
  setProvider: (p) => set({ provider: p }),
  setDefaultMeasurements: () => {
    // Set default measurements for the avatar
    console.log('Setting default measurements for avatar');
    // This function will be called automatically when the Body-AI page loads
  }
}));

// For backward compatibility
export const useGenerator = useGeneratorStore;