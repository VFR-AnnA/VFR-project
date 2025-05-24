'use client';

import useSWR from 'swr';

interface GenerationStatus {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED' | 'CANCELED';
  progress: number;
  mode: 'preview' | 'refine';
  estimatedTimeRemaining: number | null;
  model_urls?: {
    glb?: string;
    [key: string]: string | undefined;
  };
  texture_urls?: Array<{
    base_color: string;
    metallic: string;
    roughness: string;
    normal: string;
  }>;
  started_at: number;
  finished_at: number;
  elapsed_time: number;
  error?: string;
}

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    throw new Error('Failed to fetch status');
  }
  return res.json();
});

/**
 * Hook to poll the generation status of a task
 * @param taskId The ID of the task to check
 * @param refreshInterval The interval in milliseconds to poll the status (default: 5000)
 * @returns The generation status and loading/error states
 */
export function useGenerationStatus(taskId: string | null, refreshInterval = 5000) {
  const { data, error, isLoading, mutate } = useSWR<GenerationStatus>(
    taskId ? `/api/status?id=${taskId}` : null,
    fetcher,
    {
      refreshInterval: taskId && refreshInterval ? refreshInterval : 0,
      revalidateOnFocus: false,
      dedupingInterval: 1000,
    }
  );

  // Format the estimated time remaining as a string (e.g., "2m 30s")
  const formattedTimeRemaining = data?.estimatedTimeRemaining 
    ? formatTime(data.estimatedTimeRemaining) 
    : null;

  // Format the elapsed time as a string
  const formattedElapsedTime = data?.elapsed_time 
    ? formatTime(data.elapsed_time) 
    : null;

  return {
    status: data,
    isLoading,
    error,
    refresh: mutate,
    formattedTimeRemaining,
    formattedElapsedTime,
    isComplete: data?.status === 'SUCCEEDED',
    isFailed: data?.status === 'FAILED' || data?.status === 'CANCELED',
    isRefining: data?.mode === 'refine',
  };
}

/**
 * Format time in seconds to a human-readable string
 * @param seconds Time in seconds
 * @returns Formatted time string (e.g., "2m 30s")
 */
function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  
  return `${minutes}m ${remainingSeconds}s`;
}