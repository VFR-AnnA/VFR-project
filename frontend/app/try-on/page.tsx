// app/try-on/page.tsx
'use client';
import MannequinViewer from '../components/MannequinViewer';
import { useState } from 'react';

export default function TryOnPage() {
  const [autoSpin, setAutoSpin] = useState(true);
  
  return (
    <main className="h-screen bg-neutral-900 text-white flex flex-col">
      <div className="p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">3D Mannequin Viewer</h1>
        <div className="flex items-center gap-2">
          <label htmlFor="autoSpin" className="text-sm">
            Auto-rotate:
          </label>
          <input
            id="autoSpin"
            type="checkbox"
            checked={autoSpin}
            onChange={(e) => setAutoSpin(e.target.checked)}
            className="h-4 w-4"
          />
        </div>
      </div>
      
      <div className="flex-1 relative">
        <MannequinViewer src="/models/mannequin.glb" autoSpin={autoSpin} />
      </div>
    </main>
  );
}