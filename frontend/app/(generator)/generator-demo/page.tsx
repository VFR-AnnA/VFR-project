import { Metadata } from 'next';
import GeneratorDemo from '../../components/GeneratorDemo';

// Use only generateMetadata, not both metadata and generateMetadata
export const generateMetadata = (): Metadata => {
  return {
    title: 'VFR Generator Demo',
    description: 'Generate 3D models using AI for the Virtual Fitting Room',
  };
};

export default function GeneratorDemoPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">VFR Generator Demo</h1>
      
      {/* Feature flag toggle for the generator demo */}
      {process.env.NEXT_PUBLIC_FEATURE_GEN && <GeneratorDemo />}
      
      {!process.env.NEXT_PUBLIC_FEATURE_GEN && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                The Generator feature is currently disabled. Enable it by setting the <code className="font-mono bg-yellow-100 px-1 rounded">NEXT_PUBLIC_FEATURE_GEN</code> environment variable.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="prose max-w-none">
        <h2>About the Generator</h2>
        <p>
          The VFR Generator allows you to create custom 3D models for use in the Virtual Fitting Room.
          Using advanced AI technology, you can generate avatars, clothing items, and accessories
          by simply describing what you want.
        </p>
        
        <h2>How to Use</h2>
        <ol>
          <li>Enter a detailed prompt describing what you want to generate</li>
          <li>Select the type of model (avatar, clothing, or accessory)</li>
          <li>Choose the quality level (higher quality takes longer to generate)</li>
          <li>Click &ldquo;Generate Model&rdquo; and wait for the result</li>
          <li>Once generated, you can view and interact with the 3D model</li>
        </ol>
        
        <h2>Feature Status</h2>
        <p>
          This feature is currently in beta. To enable it, add <code className="font-mono bg-gray-100 px-1 rounded">NEXT_PUBLIC_FEATURE_GEN=true</code> to your <code className="font-mono bg-gray-100 px-1 rounded">.env.local</code> file.
        </p>
      </div>
    </main>
  );
}