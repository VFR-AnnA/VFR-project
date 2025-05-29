import { create } from 'zustand';

// Define the types for our store
type ProviderType = 'spar3d' | 'meshy' | 'hunyuan' | undefined;
type ModeType = 'image' | 'text' | 'image_text';

interface GeneratorSettingsState {
  provider: ProviderType;
  setProvider: (provider: ProviderType) => void;
  mode: ModeType;
  setMode: (mode: ModeType) => void;
}

// Create the store with default values
const useGeneratorSettingsStore = create<GeneratorSettingsState>((set) => ({
  provider: undefined,
  setProvider: (provider) => set((state) => {
    // Force image mode when SPAR3D is selected
    if (provider === 'spar3d') {
      return { provider, mode: 'image' };
    }
    return { provider };
  }),
  mode: 'text',
  setMode: (mode) => set((state) => {
    // Don't allow changing mode away from image if SPAR3D is selected
    if (state.provider === 'spar3d' && mode !== 'image') {
      return state;
    }
    return { mode };
  }),
}));

export default useGeneratorSettingsStore;