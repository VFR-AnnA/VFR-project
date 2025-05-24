'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styles from './styles.module.css';
import GenerationProgress from '../GenerationProgress';
import { useStore } from '../../hooks/useGeneratorStore';

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
    [key: string]: unknown;
  };
  textureUrls?: string[];
  measurements?: number[]; // Array of model measurements
}

type ModelType = 'avatar' | 'clothing' | 'accessory';
type QualityLevel = 'draft' | 'standard' | 'high';

/**
 * Converts a Meshy URL to a proxy URL to avoid CORS issues
 * @param originalUrl The original Meshy URL
 * @returns The proxy URL
 */
function getProxyUrl(originalUrl: string): string {
  // If the URL doesn't look like a Meshy URL, return it unchanged
  if (!originalUrl || !originalUrl.includes('assets.meshy.ai')) {
    return originalUrl;
  }
  
  // Log the URL being proxied for debugging
  console.log('Proxying URL:', originalUrl);
  
  // Return the proxy URL with the original URL as a query parameter
  const proxyUrl = `/api/model?url=${encodeURIComponent(originalUrl)}`;
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
  const [provider, setProvider] = useState<'meshy'|'hunyuan'>('meshy');
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratorResult | null>(null);
  const [readyToRender, setReadyToRender] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  
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

  // Get the store's setGeneratorResponse function
  const setGeneratorResponse = useStore.getState().setGeneratorResponse;

  // Handle generation completion from the progress component
  const handleGenerationComplete = (modelUrl: string, textureUrls?: any[], measurements?: number[]) => {
    console.log('Generation complete with model URL:', modelUrl);
    
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
      measurements: measurements
    };
    
    // Update local state
    setResult(generationResult);
    setGenerationProgress(100);
    setIsLoading(false);
    
    // Update the global store
    setGeneratorResponse(generationResult);
    console.log('Updated store with generator response including measurements:', measurements);
  };
  
  // Handle generation error from the progress component
  const handleGenerationError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
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
      
      // Call the API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(), // Ensure prompt is trimmed
          modelType,
          quality,
          format: 'glb',
          enablePBR,
          texturePrompt: texturePrompt.trim(),
          provider // Include the selected provider
        }),
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
        <div className={styles.inputGroup}>
          <label htmlFor="prompt" className={styles.label}>Prompt</label>
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
              onChange={(e) => setProvider(e.target.value as 'meshy'|'hunyuan')}
              className={styles.select}
              disabled={isLoading}
            >
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
          
          {/* 3D Model Viewer */}
          <div className={styles.modelPreview}>
            {!readyToRender ? (
              <div className={styles.previewPlaceholder}>
                <p>Preparing model viewer...</p>
              </div>
            ) : (
              <PBRViewer
                modelUrl={getProxyUrl(result.url)}
                crossOrigin="anonymous"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}