/**
 * Type declarations for web-vitals package
 * This file provides TypeScript type definitions for the web-vitals package
 * until the actual package is installed.
 */

declare module 'web-vitals' {
  /**
   * Represents a web vital metric measurement
   */
  export interface Metric {
    /** The name of the metric (e.g. LCP, FID, CLS, etc.) */
    name: 'CLS' | 'FID' | 'LCP' | 'FCP' | 'TTFB' | 'INP';
    
    /** The current value of the metric */
    value: number;
    
    /** The delta between the current value and the last-reported value */
    delta: number;
    
    /** A unique ID representing this particular metric measurement */
    id: string;
    
    /** The navigation entry this metric is for */
    navigationType?: 'navigate' | 'reload' | 'back_forward' | 'prerender';
    
    /** The entries used to compute this metric value */
    entries: PerformanceEntry[];
    
    /** The element associated with this metric value (if applicable) */
    element?: Element;
    
    /** The rating of the metric value (good, needs-improvement, poor) */
    rating?: 'good' | 'needs-improvement' | 'poor';
  }

  /**
   * Callback for reporting metrics
   */
  export type ReportHandler = (metric: Metric) => void;

  /**
   * Measures the Cumulative Layout Shift (CLS) metric
   */
  export function onCLS(callback: ReportHandler): void;

  /**
   * Measures the First Input Delay (FID) metric
   */
  export function onFID(callback: ReportHandler): void;

  /**
   * Measures the Largest Contentful Paint (LCP) metric
   */
  export function onLCP(callback: ReportHandler): void;

  /**
   * Measures the First Contentful Paint (FCP) metric
   */
  export function onFCP(callback: ReportHandler): void;

  /**
   * Measures the Time to First Byte (TTFB) metric
   */
  export function onTTFB(callback: ReportHandler): void;

  /**
   * Measures the Interaction to Next Paint (INP) metric
   */
  export function onINP(callback: ReportHandler): void;
}