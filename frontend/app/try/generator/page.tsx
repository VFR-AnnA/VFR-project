'use client';

import GeneratorDemo from '../../components/GeneratorDemo';

export default function GeneratorPage() {
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">3D Model Generator</h1>
      <p className="text-center mb-8 max-w-2xl mx-auto text-gray-600">
        Generate 3D models using AI. The system will automatically use SPAR3D for image inputs
        and Meshy for text-only inputs.
      </p>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <GeneratorDemo />
      </div>
    </main>
  );
}