'use client';

import { useEffect } from 'react';
import { useGeneratorStore } from '../../../lib/store/generatorStore';

/**
 * Laadt bij binnenkomst meteen een standaard-set
 * lichaams­maten / avatar in de WebGPU-viewer.
 *
 * Zet dit component als eerste child in de /try/body-ai-pagina.
 */
export default function AutoDefaultAvatar() {
  const setDefaults = useGeneratorStore(s => s.setDefaultMeasurements);

  useEffect(() => {
    // éénmalig na mount
    setDefaults();
  }, [setDefaults]);

  return null; // rendert niets zichtbaar
}