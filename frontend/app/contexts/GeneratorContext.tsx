'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the types for our context
type ProviderType = 'spar3d' | 'meshy' | 'hunyuan' | undefined;
type ModeType = 'image' | 'text' | 'image_text';

interface GeneratorContextType {
  provider: ProviderType;
  setProvider: (provider: ProviderType) => void;
  mode: ModeType;
  setMode: (mode: ModeType) => void;
}

// Create the context with default values
const GeneratorContext = createContext<GeneratorContextType>({
  provider: undefined,
  setProvider: () => {},
  mode: 'text',
  setMode: () => {},
});

// Provider component
export function GeneratorProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<ProviderType>(undefined);
  const [mode, setMode] = useState<ModeType>('text');

  // Force image mode when SPAR3D is selected
  useEffect(() => {
    if (provider === 'spar3d' && mode !== 'image') {
      setMode('image');
    }
  }, [provider, mode]);

  return (
    <GeneratorContext.Provider value={{ provider, setProvider, mode, setMode }}>
      {children}
    </GeneratorContext.Provider>
  );
}

// Custom hook to use the context
export function useGenerator() {
  const context = useContext(GeneratorContext);
  if (context === undefined) {
    throw new Error('useGenerator must be used within a GeneratorProvider');
  }
  return context;
}