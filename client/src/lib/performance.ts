/**
 * Performance Monitoring Utilities for Venturr
 * 
 * Tracks and reports performance metrics to help optimize load times
 * and user experience.
 */

interface PerformanceMetrics {
  // Core Web Vitals
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
  
  // Custom metrics
  loadTime?: number;
  domContentLoaded?: number;
  resourcesLoaded?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  
  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeMonitoring();
    }
  }
  
  private initializeMonitoring() {
    // Monitor page load
    window.addEventListener('load', () => {
      this.captureLoadMetrics();
    });
    
    // Monitor Core Web Vitals
    this.observeCoreWebVitals();
  }
  
  private captureLoadMetrics() {
    if (!window.performance) return;
    
    const perfData = window.performance.timing;
    const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    this.metrics = {
      ...this.metrics,
      loadTime: perfData.loadEventEnd - perfData.navigationStart,
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
      TTFB: navigation?.responseStart - navigation?.requestStart,
    };
    
    this.logMetrics();
  }
  
  private observeCoreWebVitals() {
    if (!('PerformanceObserver' in window)) return;
    
    // Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.metrics.LCP = lastEntry.renderTime || lastEntry.loadTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP observation not supported');
    }
    
    // First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.FID = entry.processingStart - entry.startTime;
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID observation not supported');
    }
    
    // Cumulative Layout Shift
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.metrics.CLS = clsValue;
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS observation not supported');
    }
  }
  
  private logMetrics() {
    if (process.env.NODE_ENV === 'development') {
      console.group('📊 Performance Metrics');
      console.table(this.metrics);
      console.groupEnd();
    }
  }
  
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
  
  public reportMetrics(): void {
    // In production, send metrics to analytics service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to analytics endpoint
      // fetch('/api/analytics/performance', {
      //   method: 'POST',
      //   body: JSON.stringify(this.metrics),
      // });
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Mark a custom performance measurement
 */
export function markPerformance(name: string) {
  if (typeof window !== 'undefined' && window.performance) {
    window.performance.mark(name);
  }
}

/**
 * Measure time between two marks
 */
export function measurePerformance(name: string, startMark: string, endMark: string) {
  if (typeof window !== 'undefined' && window.performance) {
    try {
      window.performance.measure(name, startMark, endMark);
      const measure = window.performance.getEntriesByName(name)[0];
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`⏱️ ${name}: ${measure.duration.toFixed(2)}ms`);
      }
      
      return measure.duration;
    } catch (e) {
      console.warn(`Failed to measure ${name}:`, e);
    }
  }
  return 0;
}

/**
 * Lazy load a component with performance tracking
 */
export function lazyLoadWithTracking<T extends React.ComponentType<any>>(
  componentName: string,
  importFunc: () => Promise<{ default: T }>
) {
  markPerformance(`${componentName}-start`);
  
  return importFunc().then((module) => {
    markPerformance(`${componentName}-end`);
    measurePerformance(
      `${componentName}-load`,
      `${componentName}-start`,
      `${componentName}-end`
    );
    return module;
  });
}

