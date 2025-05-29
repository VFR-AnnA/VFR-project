/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-21T13:43+02:00
 */

/**
 * INP (Interaction to Next Paint) Monitoring Utility
 * 
 * This utility helps monitor and optimize INP performance.
 * It provides functions to:
 * 1. Measure INP values
 * 2. Report INP metrics to analytics
 * 3. Identify slow interactions
 * 4. Provide recommendations for improvement
 */

import type { Metric } from 'web-vitals';

// Define thresholds based on Google's recommendations
const INP_THRESHOLDS = {
  GOOD: 200,       // Good experience: <= 200ms
  NEEDS_IMPROVEMENT: 500  // Needs improvement: <= 500ms, > 500ms is poor
};

// Store interaction data for analysis
interface InteractionData {
  target: string;
  type: string;
  startTime: number;
  duration: number;
  processingTime: number;
  renderTime: number;
}

const interactionHistory: InteractionData[] = [];
const MAX_HISTORY_SIZE = 20;

/**
 * Initialize INP monitoring
 * This should be called early in the application lifecycle
 */
export function initINPMonitoring(): void {
  if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') {
    return;
  }

  try {
    // Create a PerformanceObserver to monitor event timing
    const eventTimingObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        // Cast to EventCounts type
        const eventEntry = entry as unknown as {
          name: string;
          entryType: string;
          startTime: number;
          duration: number;
          processingStart: number;
          processingEnd: number;
          renderStart: number;
          renderEnd: number;
          target?: Element;
        };

        if (eventEntry.duration > 50) { // Only track significant interactions
          const targetElement = eventEntry.target ? 
            getElementDescription(eventEntry.target) : 
            'unknown';

          const interactionData: InteractionData = {
            target: targetElement,
            type: eventEntry.name,
            startTime: eventEntry.startTime,
            duration: eventEntry.duration,
            processingTime: eventEntry.processingEnd - eventEntry.processingStart,
            renderTime: eventEntry.renderEnd - eventEntry.renderStart
          };

          // Add to history and maintain max size
          interactionHistory.unshift(interactionData);
          if (interactionHistory.length > MAX_HISTORY_SIZE) {
            interactionHistory.pop();
          }

          // Log slow interactions in development
          if (process.env.NODE_ENV !== 'production' && 
              eventEntry.duration > INP_THRESHOLDS.GOOD) {
            console.warn(
              `Slow interaction detected (${Math.round(eventEntry.duration)}ms): ` +
              `${interactionData.type} on ${interactionData.target}`
            );
            console.info(
              `Processing: ${Math.round(interactionData.processingTime)}ms, ` +
              `Rendering: ${Math.round(interactionData.renderTime)}ms`
            );
          }
        }
      }
    });

    // Start observing event timing entries
    eventTimingObserver.observe({ type: 'event', buffered: true });

    // Also observe the INP metric from web-vitals
    try {
      import('web-vitals').then(({ onINP }) => {
        onINP((metric) => {
          handleINPMetric(metric);
        });
      }).catch(err => {
        console.warn('Failed to load web-vitals:', err);
      });
    } catch (error) {
      console.warn('Failed to import web-vitals:', error);
    }

    console.log('INP monitoring initialized');
  } catch (error) {
    console.error('Failed to initialize INP monitoring:', error);
  }
}

/**
 * Handle INP metric from web-vitals
 */
function handleINPMetric(metric: Metric): void {
  // Log INP value in development
  if (process.env.NODE_ENV !== 'production') {
    const status = getINPStatus(metric.value);
    console.log(
      `%cINP: ${Math.round(metric.value)}ms (${status})`, 
      `color: ${status === 'good' ? 'green' : status === 'needs-improvement' ? 'orange' : 'red'}`
    );
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    sendINPToAnalytics(metric);
  }
}

/**
 * Get the status of an INP value based on thresholds
 */
function getINPStatus(value: number): 'good' | 'needs-improvement' | 'poor' {
  if (value <= INP_THRESHOLDS.GOOD) {
    return 'good';
  } else if (value <= INP_THRESHOLDS.NEEDS_IMPROVEMENT) {
    return 'needs-improvement';
  } else {
    return 'poor';
  }
}

/**
 * Send INP metric to analytics
 */
function sendINPToAnalytics(metric: Metric): void {
  // Check if analytics endpoint is configured
  const analyticsEndpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;
  if (!analyticsEndpoint) {
    return;
  }

  // Prepare the data
  const data = {
    metricName: 'INP',
    value: metric.value,
    rating: getINPStatus(metric.value),
    id: metric.id,
    navigationType: metric.navigationType,
    page: window.location.pathname
  };

  // Send the data
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(analyticsEndpoint, JSON.stringify(data));
    } else {
      fetch(analyticsEndpoint, {
        method: 'POST',
        body: JSON.stringify(data),
        keepalive: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    console.error('Failed to send INP to analytics:', error);
  }
}

/**
 * Get a description of an element for logging
 */
function getElementDescription(element: Element | undefined): string {
  if (!element) return 'unknown';
  
  try {
    let description = element.tagName.toLowerCase();
    
    // Add id if available
    if (element.id) {
      description += `#${element.id}`;
    }
    
    // Add classes if available (limit to first 2)
    if (element.classList && element.classList.length > 0) {
      const classes = Array.from(element.classList).slice(0, 2).join('.');
      description += classes ? `.${classes}` : '';
    }
    
    // Add type for inputs
    if (element.tagName.toLowerCase() === 'input' && element.hasAttribute('type')) {
      description += `[type=${element.getAttribute('type')}]`;
    }
    
    return description;
  } catch (error) {
    console.error('Error getting element description:', error);
    return 'unknown';
  }
}

/**
 * Get the current interaction history
 * Useful for debugging and analysis
 */
export function getInteractionHistory(): InteractionData[] {
  return [...interactionHistory];
}

/**
 * Get recommendations for improving INP based on interaction history
 */
export function getINPRecommendations(): string[] {
  const recommendations: string[] = [];
  
  // Check if we have enough data
  if (interactionHistory.length === 0) {
    return ['Not enough interaction data collected yet.'];
  }
  
  // Calculate average processing and rendering times
  const avgProcessingTime = interactionHistory.reduce(
    (sum, data) => sum + data.processingTime, 0
  ) / interactionHistory.length;
  
  const avgRenderTime = interactionHistory.reduce(
    (sum, data) => sum + data.renderTime, 0
  ) / interactionHistory.length;
  
  // Add recommendations based on the data
  if (avgProcessingTime > 100) {
    recommendations.push(
      'High JavaScript processing time detected. Consider splitting large tasks with ' +
      'requestIdleCallback or moving CPU-intensive work to Web Workers.'
    );
  }
  
  if (avgRenderTime > 50) {
    recommendations.push(
      'High rendering time detected. Reduce DOM complexity, minimize style recalculations, ' +
      'and avoid layout thrashing.'
    );
  }
  
  // Check for specific interaction types
  const clickInteractions = interactionHistory.filter(data => data.type === 'click');
  const inputInteractions = interactionHistory.filter(
    data => data.type === 'keydown' || data.type === 'input'
  );
  
  if (clickInteractions.length > 0) {
    const slowClicks = clickInteractions.filter(data => data.duration > INP_THRESHOLDS.GOOD);
    if (slowClicks.length > 0) {
      recommendations.push(
        'Slow click responses detected. Ensure click handlers are optimized and ' +
        'avoid synchronous layout operations.'
      );
    }
  }
  
  if (inputInteractions.length > 0) {
    const slowInputs = inputInteractions.filter(data => data.duration > INP_THRESHOLDS.GOOD);
    if (slowInputs.length > 0) {
      recommendations.push(
        'Slow input handling detected. Consider debouncing or throttling input handlers ' +
        'and avoid expensive operations during typing.'
      );
    }
  }
  
  // Add general recommendations if we don't have specific ones
  if (recommendations.length === 0) {
    recommendations.push(
      'No specific INP issues detected. Continue monitoring and consider these general tips:',
      '- Use React.memo, useMemo, and useCallback to prevent unnecessary re-renders',
      '- Set RTF\'s frameloop to "demand" and only invalidate when needed',
      '- Prefetch resources before they\'re needed',
      '- Use Web Workers for CPU-intensive tasks'
    );
  }
  
  return recommendations;
}

/**
 * Measure the INP of a specific function
 * Useful for testing the performance impact of different implementations
 */
export async function measureFunctionINP(
  fn: () => void | Promise<void>,
  label: string
): Promise<number> {
  if (typeof performance === 'undefined' || 
      typeof performance.now !== 'function') {
    console.warn('Performance API not available');
    await fn();
    return 0;
  }
  
  // Record the start time
  const startTime = performance.now();
  
  // Execute the function
  await fn();
  
  // Force a paint to simulate INP
  requestAnimationFrame(() => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`${label} INP: ${Math.round(duration)}ms`);
    return duration;
  });
  
  // Return an approximate duration (actual value will be logged in rAF)
  return performance.now() - startTime;
}