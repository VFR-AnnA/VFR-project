'use client';

import { useState, useEffect } from 'react';
import { useGenerator } from '../../lib/store/generatorStore';
import { generateModel } from '../../lib/generateModel';
import ImageUpload from './GeneratorDemo/ImageUpload';
import { Suspense } from 'react';

export default function GeneratorDemo() {
  const { imageFile, setImage, text, setText } = useGenerator();
  const [isLoading, setIsLoading] = useState(false);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle image selection
  const handleImageSelect = (data: { file: File; dataUrl: string }) => {
    setImage(data.file);
  };

  // Handle image clearing
  const handleImageClear = () => {
    setImage(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!imageFile && !text) {
      setError('Please provide either an image or text prompt');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Submitting form with:', { imageFile, text });
      const result = await generateModel();
      console.log('Generation result:', result);
      setModelUrl(result.url || result.id);
      setIsLoading(false);
    } catch (err) {
      console.error('Error during generation:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setIsLoading(false);
    }
  };

  // Helper function to get proxy URL to avoid CORS issues
  const getProxyUrl = (url: string) => {
    if (!url) return url;
    
    const isExternalUrl = url.includes('assets.meshy.ai') || 
                          url.includes('hunyuan.tencentcloudapi.com') || 
                          !url.startsWith('/');
    
    if (!isExternalUrl) return url;
    
    return `/api/asset?url=${encodeURIComponent(url)}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">3D Model Generator</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Component */}
        <div>
          <label className="block text-sm font-medium mb-2">Image</label>
          <ImageUpload
            onImageSelect={handleImageSelect}
            onImageClear={handleImageClear}
            disabled={isLoading}
          />
          <p className="text-sm text-gray-500 mt-1">
            Upload an image to use SPAR3D for generation
          </p>
        </div>

        {/* Text prompt - only shown when no image is selected */}
        {!imageFile && (
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium mb-2">Text Prompt</label>
            <textarea
              id="prompt"
              value={text}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
              placeholder="Describe what you want to generate..."
              disabled={isLoading}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>
        )}

        {/* Submit button - disabled when both image and text are missing */}
        <button
          type="submit"
          disabled={isLoading || (!imageFile && !text)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating...' : 'Generate Model'}
        </button>
      </form>

      {/* Error display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      {/* Result display */}
      {modelUrl && !isLoading && (
        <div className="mt-6 border rounded-lg overflow-hidden min-h-[350px]">
          <h3 className="p-4 bg-gray-50 border-b font-medium">Generated Model</h3>
          <Suspense fallback={<div className="h-[350px] w-full bg-gray-200 animate-pulse"></div>}>
            <div className="aspect-video relative">
              {/* Model viewer would go here */}
              <div className="absolute inset-0 flex items-center justify-center">
                <p>Model URL: {modelUrl}</p>
              </div>
            </div>
          </Suspense>
        </div>
      )}
    </div>
  );
}