// Zustand is now installed, so we can use the real implementation
import { create } from 'zustand';

// Define the GeneratorResult interface locally since it's not exported from the route
interface GeneratorResult {
  id: string;
  url: string;
  format: string;
  createdAt: string;
  metadata: Record<string, unknown>;
  textureUrls?: string[];
  measurements?: {
    heightCm: number;
    chestCm: number;
    waistCm: number;
    hipCm: number;
  };
}

interface StoreState {
  generatorResponse?: GeneratorResult;
  setGeneratorResponse: (resp: GeneratorResult) => void;
}

// Real Zustand implementation
export const useStore = create<StoreState>((set) => ({
  generatorResponse: undefined,
  setGeneratorResponse: (resp: GeneratorResult) => set({ generatorResponse: resp }),
}));

// Example usage in components:
/*
// Import the store
import { useStore } from '../hooks/useGeneratorStore';

// In your component:
const measurements = useStore((s) => s.generatorResponse?.measurements);
console.log('Height:', measurements?.heightCm);

// For 3D team to scale mannequin:
const height = useStore((s) => s.generatorResponse?.measurements?.heightCm);
const scale = height ? height / 180 : 1;  // assuming 180 cm base rig
*/