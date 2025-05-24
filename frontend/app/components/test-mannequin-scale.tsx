'use client';

import { useState, useEffect } from 'react';
import MannequinViewer from './MannequinViewer';
import useGeneratorStore from '../hooks/useGeneratorStore';

/**
 * Test component to verify height-based mannequin scaling
 */
export default function TestMannequinScale() {
  const [height, setHeight] = useState(180);
  const setGeneratorResponse = useGeneratorStore((s) => s.setGeneratorResponse);
  
  // Update the store with the current height when it changes
  useEffect(() => {
    setGeneratorResponse({
      id: 'test-id',
      url: '/models/mannequin.glb',
      format: 'glb',
      createdAt: new Date().toISOString(),
      metadata: {},
      measurements: {
        heightCm: height,
        chestCm: 95,
        waistCm: 80,
        hipCm: 100
      }
    });
  }, [height, setGeneratorResponse]);
  
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Test Mannequin Height-Based Scaling</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Height: {height} cm
        </label>
        <input
          type="range"
          min={150}
          max={200}
          value={height}
          onChange={(e) => setHeight(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          aria-label="Height slider"
          title={`Adjust height: ${height} cm`}
          id="height-slider"
        />
        <div className="text-sm text-gray-500 mt-1">
          Scale factor: {(height / 180).toFixed(2)}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">With Height Scaling</h2>
          <div className="h-96 bg-gray-100 rounded-lg">
            <MannequinViewer />
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Fixed Scale (1.5)</h2>
          <div className="h-96 bg-gray-100 rounded-lg">
            <MannequinViewer scale={1.5} />
          </div>
        </div>
      </div>
    </div>
  );
}