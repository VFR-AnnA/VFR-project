/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-20T12:17+02:00
 *
 * NOTE: This file requires the web-vitals package to be installed.
 * Run: npm install web-vitals
 * The dependency has been added to package.json but needs to be installed.
 */

// Import types from web-vitals
import type { ReportHandler } from 'web-vitals';

// Define the metric data structure for our analytics
interface MetricData {
  id: string;
  name: string;
  value: number;
  delta: number;
  entries: PerformanceEntry[];
  navigationType?: string;
}

// Define the endpoint for reporting metrics
const ANALYTICS_ENDPOINT = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || '';

/**
 * Send metrics to the analytics endpoint
 * @param metric - The metric to report
 */
async function sendToAnalytics(metric: MetricData): Promise<void> {
  // Only send metrics in production
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Vitals]', metric);
    return;
  }

  // Skip if no endpoint is configured
  if (!ANALYTICS_ENDPOINT) {
    return;
  }

  // Prepare the data to send
  const body = JSON.stringify({
    metric: {
      name: metric.name,
      value: metric.value,
      delta: metric.delta,
      id: metric.id,
    },
    // Add useful context
    page: window.location.pathname,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    connection: 'connection' in navigator ?
      // @ts-expect-error - Connection API might not be available in all browsers
      (navigator.connection?.effectiveType || 'unknown') :
      'unknown',
  });

  try {
    // Use sendBeacon if available, otherwise fall back to fetch
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ANALYTICS_ENDPOINT, body);
    } else {
      await fetch(ANALYTICS_ENDPOINT, {
        body,
        method: 'POST',
        keepalive: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('[Vitals] Error sending metrics:', error);
  }
}

/**
 * Check if a metric exceeds the threshold and trigger an alert if needed
 * @param metric - The metric to check
 */
function checkThresholds(metric: MetricData): void {
  // Only check thresholds in production
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  // Define thresholds
  const thresholds = {
    CLS: 0.10,  // Cumulative Layout Shift threshold
    INP: 250,   // Interaction to Next Paint threshold (ms)
  };

  // Check if the metric exceeds the threshold
  if (
    (metric.name === 'CLS' && metric.value > thresholds.CLS) ||
    (metric.name === 'INP' && metric.value > thresholds.INP)
  ) {
    // Log the alert
    console.warn(`[Vitals] ${metric.name} exceeds threshold: ${metric.value}`);
    
    // Send the alert to the monitoring service
    // This could be a separate endpoint or a different payload
    sendToAnalytics({
      ...metric,
      name: `${metric.name}_ALERT`,
    });
  }
}

/**
 * Web Vitals report handler
 * @param onPerfEntry - The performance entry callback
 */
export function reportWebVitals(onPerfEntry?: ReportHandler): void {
  // Only run in the browser
  if (typeof window === 'undefined') {
    return;
  }

  // Only run in production or when explicitly enabled
  if (
    process.env.NODE_ENV !== 'production' && 
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'true'
  ) {
    return;
  }

  // Import web-vitals dynamically to avoid SSR issues
  import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
    // Core Web Vitals
    onCLS((metric) => {
      const metricData = metric as unknown as MetricData;
      checkThresholds(metricData);
      sendToAnalytics(metricData);
      if (onPerfEntry) onPerfEntry(metric);
    });
    
    onLCP((metric) => {
      const metricData = metric as unknown as MetricData;
      sendToAnalytics(metricData);
      if (onPerfEntry) onPerfEntry(metric);
    });
    
    // Interaction metrics
    onINP((metric) => {
      const metricData = metric as unknown as MetricData;
      checkThresholds(metricData);
      sendToAnalytics(metricData);
      if (onPerfEntry) onPerfEntry(metric);
    });
    
    onFID((metric) => {
      const metricData = metric as unknown as MetricData;
      sendToAnalytics(metricData);
      if (onPerfEntry) onPerfEntry(metric);
    });
    
    // Additional metrics
    onFCP((metric) => {
      const metricData = metric as unknown as MetricData;
      sendToAnalytics(metricData);
      if (onPerfEntry) onPerfEntry(metric);
    });
    
    onTTFB((metric) => {
      const metricData = metric as unknown as MetricData;
      sendToAnalytics(metricData);
      if (onPerfEntry) onPerfEntry(metric);
    });
  });
}