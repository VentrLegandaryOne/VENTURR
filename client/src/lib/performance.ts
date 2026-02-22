/**
 * Performance Monitoring and Optimization Utilities
 * Tracks key metrics and provides optimization helpers
 */

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 100; // Keep last 100 metrics

  /**
   * Measure the execution time of a function
   */
  async measure<T>(name: string, fn: () => Promise<T> | T): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(`${name}_error`, duration);
      throw error;
    }
  }

  /**
   * Record a performance metric
   */
  private recordMetric(name: string, duration: number) {
    this.metrics.push({
      name,
      duration,
      timestamp: Date.now(),
    });

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log slow operations (>1s)
    if (duration > 1000) {
      console.warn(`[Performance] Slow operation: ${name} took ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * Get average duration for a metric
   */
  getAverage(name: string): number {
    const filtered = this.metrics.filter((m) => m.name === name);
    if (filtered.length === 0) return 0;
    const sum = filtered.reduce((acc, m) => acc + m.duration, 0);
    return sum / filtered.length;
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics = [];
  }

  /**
   * Get performance summary
   */
  getSummary() {
    const grouped = this.metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = {
          count: 0,
          total: 0,
          min: Infinity,
          max: -Infinity,
        };
      }
      acc[metric.name].count++;
      acc[metric.name].total += metric.duration;
      acc[metric.name].min = Math.min(acc[metric.name].min, metric.duration);
      acc[metric.name].max = Math.max(acc[metric.name].max, metric.duration);
      return acc;
    }, {} as Record<string, { count: number; total: number; min: number; max: number }>);

    return Object.entries(grouped).map(([name, stats]) => ({
      name,
      count: stats.count,
      average: stats.total / stats.count,
      min: stats.min,
      max: stats.max,
    }));
  }
}

export const perfMonitor = new PerformanceMonitor();

/**
 * Debounce function to limit execution rate
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function to limit execution frequency
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Memoize expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyFn?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = func(...args);
    cache.set(key, result);

    // Limit cache size to 100 entries
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }

    return result;
  }) as T;
}

/**
 * Measure Web Vitals
 */
export function measureWebVitals() {
  if (typeof window === "undefined") return;

  // Largest Contentful Paint (LCP)
  if ("PerformanceObserver" in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        console.log("[Web Vitals] LCP:", lastEntry.renderTime || lastEntry.loadTime);
      });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch (e) {
      // Ignore if not supported
    }
  }

  // First Input Delay (FID)
  if ("PerformanceObserver" in window) {
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          console.log("[Web Vitals] FID:", entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ["first-input"] });
    } catch (e) {
      // Ignore if not supported
    }
  }

  // Cumulative Layout Shift (CLS)
  if ("PerformanceObserver" in window) {
    try {
      let clsScore = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as any[];
        for (const entry of entries) {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        }
        console.log("[Web Vitals] CLS:", clsScore);
      });
      clsObserver.observe({ type: "layout-shift", buffered: true } as any);
    } catch (e) {
      // Ignore if not supported
    }
  }
}

/**
 * Log bundle size information
 */
export function logBundleInfo() {
  if (typeof window === "undefined") return;

  const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
  const jsResources = resources.filter((r) => r.name.endsWith(".js"));
  const cssResources = resources.filter((r) => r.name.endsWith(".css"));

  const totalJsSize = jsResources.reduce((acc, r) => acc + (r.transferSize || 0), 0);
  const totalCssSize = cssResources.reduce((acc, r) => acc + (r.transferSize || 0), 0);

  console.log("[Bundle Info]", {
    jsFiles: jsResources.length,
    jsSize: `${(totalJsSize / 1024).toFixed(2)} KB`,
    cssFiles: cssResources.length,
    cssSize: `${(totalCssSize / 1024).toFixed(2)} KB`,
    total: `${((totalJsSize + totalCssSize) / 1024).toFixed(2)} KB`,
  });
}

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring() {
  if (typeof window === "undefined") return;

  // Measure web vitals
  measureWebVitals();

  // Log bundle info after page load
  window.addEventListener("load", () => {
    setTimeout(logBundleInfo, 1000);
  });

  // Expose performance monitor to window for debugging
  (window as any).__perfMonitor = perfMonitor;
}
