'use client';

import { useEffect } from 'react';
import styles from './styles.module.css';
import { useGenerationStatus } from '../../hooks/useGenerationStatus';

interface GenerationProgressProps {
  taskId: string | null;
  enablePBR: boolean;
  onComplete?: (modelUrl: string, textureUrls?: any[]) => void;
  onError?: (error: string) => void;
}

export default function GenerationProgress({
  taskId,
  enablePBR,
  onComplete,
  onError
}: GenerationProgressProps) {
  const {
    status,
    isLoading,
    error,
    formattedTimeRemaining,
    formattedElapsedTime,
    isComplete,
    isFailed,
    isRefining
  } = useGenerationStatus(taskId, 5000);

  // Call onComplete when the generation is complete
  useEffect(() => {
    if (isComplete && status?.model_urls?.glb && onComplete) {
      onComplete(status.model_urls.glb, status.texture_urls);
    }
  }, [isComplete, status, onComplete]);

  // Call onError when the generation fails
  useEffect(() => {
    if (isFailed && onError) {
      onError(status?.error || 'Generation failed');
    }
  }, [isFailed, status, onError]);

  if (!taskId || !status) {
    return null;
  }

  const progress = status.progress || 0;
  const stage = isRefining ? 'Refining with PBR textures' : 'Generating preview model';

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        {isComplete ? 'Generation Complete!' : `${stage}...`}
      </h3>
      
      <div className={styles.progressBarContainer}>
        <div 
          className={styles.progressBar} 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className={styles.progressInfo}>
        <p className={styles.progressText}>
          {isComplete 
            ? 'Processing complete! Loading model...' 
            : `Progress: ${Math.round(progress)}%`}
        </p>
        
        {!isComplete && formattedElapsedTime && (
          <p className={styles.timeInfo}>
            Elapsed: {formattedElapsedTime}
          </p>
        )}
        
        {!isComplete && formattedTimeRemaining && (
          <p className={styles.timeInfo}>
            Estimated time remaining: {formattedTimeRemaining}
          </p>
        )}
      </div>
      
      <p className={styles.generatingNote}>
        {isRefining 
          ? 'Refining with PBR textures may take 2-4 minutes for complex models.'
          : 'Preview generation typically takes 30-60 seconds.'}
      </p>
      
      {isRefining && progress > 90 && (
        <p className={styles.finalSteps}>
          Finalizing textures and materials... This may take a moment.
        </p>
      )}
      
      {error && (
        <p className={styles.error}>
          Error: {error.toString()}
        </p>
      )}
    </div>
  );
}