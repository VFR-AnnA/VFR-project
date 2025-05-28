'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styles from './styles.module.css';
import GenerationProgress from '../GenerationProgress';
import useGeneratorStore from '../../hooks/useGeneratorStore';
import useGeneratorSettingsStore from '../../hooks/useGeneratorSettingsStore';
import ImageUpload from './ImageUpload';
import { fileToBase64 } from '../../utils/fileUtils';

// Dynamically import the PBRViewer component with SSR disabled
// This improves initial page load performance
const PBRViewer = dynamic(() => import('../PBRViewer'), { 
  ssr: false,
  loading: () => (
    <div className={styles.previewPlaceholder}>
      <p>Loading 3D Viewer...</p>
    </div>
  )
});

interface GeneratorResult {
  id: string;
  url: string;
  format: string;
  createdAt: string;
  metadata: {
    prompt: string;
    modelType: string;
    quality: string;
    isPBR?: boolean;
    texturePrompt?: string;
    hasImagePrompt?: boolean;
    [key: string]: unknown;
  };
  textureUrls?: string[];
  measurements?: {
    heightCm: number;
    chestCm: number;
    waistCm: number;
    hipCm: number;
  }; // Object with semantic measurement fields
}

type ModelType = 'avatar' | 'clothing' | 'accessory';
type QualityLevel = 'draft' | 'standard' | 'high';

/**
 * Converts a Meshy URL to a proxy URL to avoid CORS issues
 * @param originalUrl The original Meshy URL
 * @returns The proxy URL
 */
function getProxyUrl(originalUrl: string): string {
  // If the URL is empty or null, return it unchanged
  if (!originalUrl) {
    return originalUrl;
  }
  
  // Check if the URL is from an external domain that might have CORS issues
  const isExternalUrl = originalUrl.includes('assets.meshy.ai') ||
                        originalUrl.includes('hunyuan.tencentcloudapi.com') ||
                        !originalUrl.startsWith('/');
  
  if (!isExternalUrl) {
    return originalUrl; // Local URL, no need to proxy
  }
  
  // Log the URL being proxied for debugging
  console.log('Proxying URL:', originalUrl);
  
  // Use our new asset proxy route
  const proxyUrl = `/api/asset?url=${encodeURIComponent(originalUrl)}`;
  console.log('Proxy URL:', proxyUrl);
  
  return proxyUrl;
}

export default function GeneratorDemo() {
  // Form state
  const [prompt, setPrompt] = useState('');
  const [modelType, setModelType] = useState<ModelType>('avatar');
  const [quality, setQuality] = useState<QualityLevel>('standard');
  const [enablePBR, setEnablePBR] = useState(true);
  const [texturePrompt, setTexturePrompt] = useState('realistic fabrics and denim');
  // Use the provider and mode from the store instead of local state
  const { provider, setProvider, mode, setMode } = useGeneratorSettingsStore();
  const [imageData, setImageData] = useState<{ file: File; dataUrl: string } | null>(null);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratorResult | null>(null);
  const [readyToRender, setReadyToRender] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  
  // State for the model URL, initialize from sessionStorage if available
  const [modelUrl, setModelUrl] = useState<string | null>(() => {
    // Only run in browser
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('lastModelUrl');
    }
    return null;
  });
  
  // Add a small delay before loading the model to ensure the proxy has time to process
  useEffect(() => {
    if (result) {
      // Reset ready state when result changes
      setReadyToRender(false);
      
      // Add a small delay before setting ready to true
      const timer = setTimeout(() => {
        console.log('Loading model after delay:', getProxyUrl(result.url));
        setReadyToRender(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [result]);

  // Save model URL to sessionStorage when it changes
  useEffect(() => {
    if (result?.url) {
      const url = result.url;
      sessionStorage.setItem('lastModelUrl', url);
      setModelUrl(url);
    }
  }, [result]);
  
  // Function to download the model
  const handleDownload = () => {
    if (!result?.url) return;
    
    const url = getProxyUrl(result.url);
    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'vfr-model.glb';
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch(err => {
        console.error('Error downloading model:', err);
        alert('Failed to download model. Please try again.');
      });
  };
  
  // Get the store's setGeneratorResponse function
  const setGeneratorResponse = useGeneratorStore.getState().setGeneratorResponse;

  // Handle generation completion from the progress component
  const handleGenerationComplete = (
    modelUrl: string,
    textureUrls?: any[],
    rawMeasurements?: number[] | {
      heightCm: number;
      chestCm: number;
      waistCm: number;
      hipCm: number;
    }
  ) => {
    console.log('Generation complete with model URL:', modelUrl);
    
    // Convert measurements to the correct format if they're an array
    let formattedMeasurements;
    if (Array.isArray(rawMeasurements) && rawMeasurements.length >= 4) {
      formattedMeasurements = {
        heightCm: rawMeasurements[0] * 100, // Convert to cm if in meters
        chestCm: rawMeasurements[1] * 100,
        waistCm: rawMeasurements[2] * 100,
        hipCm: rawMeasurements[3] * 100
      };
    } else if (rawMeasurements && !Array.isArray(rawMeasurements)) {
      formattedMeasurements = rawMeasurements;
    }
    
    // Create a result object similar to what the API would return
    const generationResult: GeneratorResult = {
      id: taskId || '',
      url: modelUrl,
      format: 'glb',
      createdAt: new Date().toISOString(),
      metadata: {
        prompt: prompt,
        modelType: modelType,
        quality: quality,
        isPBR: enablePBR,
        texturePrompt: enablePBR ? texturePrompt : undefined
      },
      textureUrls: textureUrls,
      measurements: formattedMeasurements
    };
    
    // Update local state
    setResult(generationResult);
    setGenerationProgress(100);
    setIsLoading(false);
    
    // Update the global store
    setGeneratorResponse(generationResult);
    console.log('Updated store with generator response including measurements:', formattedMeasurements);
  };
  
  // Handle generation error from the progress component
  const handleGenerationError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  };

  // Handle image selection
  const handleImageSelect = async (data: { file: File; dataUrl: string }) => {
    try {
      // We already have the dataUrl from the ImageUpload component,
      // but we're using fileToBase64 here to demonstrate the utility function
      const base64Data = await fileToBase64(data.file);
      console.log('Image converted to base64 successfully');
      
      setImageData({
        file: data.file,
        dataUrl: base64Data
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      alert('Error processing the image. Please try again.');
    }
  };

  // Handle image clearing
  const handleImageClear = () => {
    setImageData(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }
    
    // Reset state
    setIsLoading(true);
    setError(null);
    setErrorDetails(null);
    setResult(null);
    
    // Reset task ID to start fresh
    setTaskId(null);
    
    try {
      console.log('Submitting generation request with prompt:', prompt);
      
      // Prepare request body
      const requestBody: any = {
        prompt: mode !== 'image' ? prompt.trim() : 'Generated from image', // Ensure prompt is trimmed
        modelType,
        quality,
        format: 'glb',
        enablePBR,
        texturePrompt: texturePrompt.trim(),
        provider // Include the selected provider
      };
      
      // Add image data if available
      if (imageData) {
        requestBody.imagePrompt = imageData.dataUrl;
      }
      
      // Call the API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      // Log the raw response for debugging
      console.log('API response status:', response.status);
      
      // Safely handle the response whether it's valid JSON or not
      let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
      let data: any = {};
      
      try {
        data = await response.json();
        if (!response.ok && data.error) {
          errorMsg = data.error;
        }
      } catch (parseError) {
        // If JSON parsing fails, use the status code message instead
        console.error('Failed to parse response as JSON:', parseError);
      }
      
      // Handle API errors
      if (!response.ok) {
        console.error('API error response:', data);
        throw new Error(errorMsg);
      }
      
      // Process successful response - just store the task ID
      console.log('Generation started:', data);
      setTaskId(data.id);
    } catch (err) {
      console.error('Generation error:', err); // Log the error for debugging
      
      // Set user-friendly error message
      setError(err instanceof Error ?
        err.message :
        'An unknown error occurred during model generation'
      );
      
      // Set technical details for debugging
      if (err instanceof Error && err.stack) {
        setErrorDetails(err.stack);
      }
    } finally {
      // Only set isLoading to false if there was an error
      // Otherwise, the loading state will be managed by the progress component
      if (error) {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>VFR Generator Demo</h2>
      <p className={styles.description}>
        Generate 3D models using AI. Enter a prompt describing what you want to create.
      </p>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Image Upload Component */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>Image Prompt (Optional)</label>
          <ImageUpload
            onImageSelect={handleImageSelect}
            onImageClear={handleImageClear}
            disabled={isLoading}
          />
          <p className={styles.helpText}>
            Upload an image to use as a reference for the generation
          </p>
        </div>

        {/* Only show text prompt if not in image-only mode */}
        {mode !== 'image' && (
          <div className={styles.inputGroup}>
            <label htmlFor="prompt" className={styles.label}>Text Prompt</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to generate..."
              className={styles.textarea}
              rows={3}
              disabled={isLoading}
              required
            />
          </div>
        )}
        
        <div className={styles.inputRow}>
          <div className={styles.inputGroup}>
            <label htmlFor="modelType" className={styles.label}>Model Type</label>
            <select
              id="modelType"
              value={modelType}
              onChange={(e) => setModelType(e.target.value as ModelType)}
              className={styles.select}
              disabled={isLoading}
            >
              <option value="avatar">Avatar</option>
              <option value="clothing">Clothing</option>
              <option value="accessory">Accessory</option>
            </select>
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="quality" className={styles.label}>Quality</label>
            <select
              id="quality"
              value={quality}
              onChange={(e) => setQuality(e.target.value as QualityLevel)}
              className={styles.select}
              disabled={isLoading}
            >
              <option value="draft">Draft</option>
              <option value="standard">Standard</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="provider" className={styles.label}>Provider</label>
            <select
              id="provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value as 'spar3d'|'meshy'|'hunyuan')}
              className={styles.select}
              disabled={isLoading}
            >
              <option value="spar3d">Local (SPAR3D)</option>
              <option value="meshy">Meshy</option>
              <option value="hunyuan">Hunyuan</option>
            </select>
          </div>
        </div>
        
        <div className={styles.inputGroup}>
          <div className={styles.checkboxGroup}>
            <input
              id="enablePBR"
              type="checkbox"
              checked={enablePBR}
              onChange={(e) => setEnablePBR(e.target.checked)}
              className={styles.checkbox}
              disabled={isLoading}
            />
            <label htmlFor="enablePBR" className={styles.checkboxLabel}>
              Enable PBR Textures
            </label>
          </div>
          <p className={styles.helpText}>
            PBR textures provide realistic materials but take longer to generate
          </p>
        </div>
        
        {enablePBR && (
          <div className={styles.inputGroup}>
            <label htmlFor="texturePrompt" className={styles.label}>Texture Prompt</label>
            <input
              id="texturePrompt"
              value={texturePrompt}
              onChange={(e) => setTexturePrompt(e.target.value)}
              placeholder="Describe the textures you want..."
              className={styles.input}
              disabled={isLoading}
            />
            <p className={styles.helpText}>
              Describe the materials and textures (e.g., "realistic denim and leather")
            </p>
          </div>
        )}
        
        {/* UI hint to show what's being sent */}
        <div className={styles.helpText} style={{ marginTop: '1rem', textAlign: 'center' }}>
          {imageData ?
            mode !== 'image' && prompt.trim() ?
              '🖼️ 1 image & 📝 prompt will be used' :
              '🖼️ 1 image will be used (with default prompt)'
            : mode !== 'image' ? '📝 Text prompt only' : 'Please upload an image'
          }
        </div>
        
        <button
          type="submit" 
          className={styles.button}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Model'}
        </button>
      </form>
      
      {error && (
        <div className={styles.error}>
          <p><strong>Error:</strong> {error}</p>
          {errorDetails && process.env.NODE_ENV === 'development' && (
            <details>
              <summary>Technical Details</summary>
              <pre className={styles.errorDetails}>
                {errorDetails}
              </pre>
            </details>
          )}
          <p className={styles.errorHelp}>
            Try a different prompt or check your connection and try again.
          </p>
        </div>
      )}
      
      {isLoading && !result && taskId && (
        <GenerationProgress
          taskId={taskId}
          enablePBR={enablePBR}
          onComplete={handleGenerationComplete}
          onError={handleGenerationError}
        />
      )}
      
      {isLoading && !result && !taskId && (
        <div className={styles.generatingContainer}>
          <h3>Starting generation...</h3>
          <p className={styles.generatingNote}>
            Initializing the generation process. This should only take a moment.
          </p>
        </div>
      )}
      
      {result && (
        <div className={styles.result}>
          <h3>Generated Model</h3>
          <div className={styles.resultDetails}>
            <p><strong>ID:</strong> {result.id}</p>
            <p><strong>Created:</strong> {new Date(result.createdAt).toLocaleString()}</p>
            <p><strong>Format:</strong> {result.format.toUpperCase()}</p>
            <p><strong>PBR Textures:</strong> {result.metadata.isPBR === true ? 'Enabled' : 'Disabled'}</p>
            {result.metadata.isPBR === true && result.metadata.texturePrompt && (
              <p><strong>Texture Prompt:</strong> {result.metadata.texturePrompt}</p>
            )}
            {result.metadata.hasImagePrompt && (
              <p><strong>Image Prompt:</strong> Used as reference</p>
            )}
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.downloadButton}
              download={`model-${result.id}.${result.format}`}
            >
              Download {result.format.toUpperCase()} Model
            </a>
            {result.metadata && typeof result.metadata.note === 'string' && (
              <p><strong>Note:</strong> {result.metadata.note}</p>
            )}
          </div>
          
          {/* 3D Model Viewer with fixed aspect ratio */}
          <div className="relative w-full aspect-[4/3] bg-neutral-100 overflow-hidden">
            {/* Skeleton always present, opacity changes */}
            <div className={result && readyToRender ? 'opacity-0' : 'opacity-100'} style={{ position: 'absolute', inset: 0 }}>
              <div className={styles.previewPlaceholder}>
                <p>Preparing model viewer...</p>
              </div>
            </div>
            
            {/* Model viewer */}
            {result && readyToRender && (
              <div className="absolute inset-0">
                <PBRViewer
                  modelUrl={getProxyUrl(result.url)}
                  crossOrigin="anonymous"
                />
              </div>
            )}
          </div>
          
          {/* Download button */}
          {result && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleDownload}
                className={styles.secondaryButton || "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"}
              >
                Download Model
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}