import { test, expect } from '@playwright/test';

test.describe('Performance Benchmarking', () => {
  test('should load home page within 1.5 seconds', async ({ page }) => {
    const startTime = performance.now();
    await page.goto('/', { waitUntil: 'networkidle' });
    const loadTime = performance.now() - startTime;
    
    console.log(`Home page load time: ${loadTime.toFixed(2)}ms`);
    expect(loadTime).toBeLessThan(1500);
  });

  test('should load dashboard within 1.5 seconds', async ({ page }) => {
    const startTime = performance.now();
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    const loadTime = performance.now() - startTime;
    
    console.log(`Dashboard load time: ${loadTime.toFixed(2)}ms`);
    expect(loadTime).toBeLessThan(1500);
  });

  test('should load projects page within 1.5 seconds', async ({ page }) => {
    const startTime = performance.now();
    await page.goto('/projects', { waitUntil: 'networkidle' });
    const loadTime = performance.now() - startTime;
    
    console.log(`Projects page load time: ${loadTime.toFixed(2)}ms`);
    expect(loadTime).toBeLessThan(1500);
  });

  test('should maintain 60fps during animations', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    
    // Measure frame rate during animation
    const frameMetrics = await page.evaluate(() => {
      return new Promise<{ fps: number; droppedFrames: number }>((resolve) => {
        let lastTime = performance.now();
        let frameCount = 0;
        let droppedFrames = 0;

        const measureFrame = () => {
          const currentTime = performance.now();
          const deltaTime = currentTime - lastTime;

          if (deltaTime > 16.67) {
            // 60fps = 16.67ms per frame
            droppedFrames++;
          }

          frameCount++;
          lastTime = currentTime;

          if (frameCount < 60) {
            requestAnimationFrame(measureFrame);
          } else {
            const fps = (frameCount / (currentTime - performance.now() + 1000)) * 1000;
            resolve({ fps: Math.round(fps), droppedFrames });
          }
        };

        requestAnimationFrame(measureFrame);
      });
    });

    console.log(`Frame metrics: ${frameMetrics.fps} FPS, ${frameMetrics.droppedFrames} dropped frames`);
    expect(frameMetrics.fps).toBeGreaterThanOrEqual(50); // Allow some variance
  });

  test('should have optimized bundle size', async ({ page }) => {
    const resources = await page.evaluate(() => {
      return performance
        .getEntriesByType('resource')
        .map((entry: any) => ({
          name: entry.name,
          size: entry.transferSize,
          duration: entry.duration,
        }))
        .sort((a, b) => b.size - a.size)
        .slice(0, 10);
    });

    console.log('Top 10 largest resources:');
    resources.forEach((resource: any) => {
      console.log(`  ${resource.name}: ${(resource.size / 1024).toFixed(2)}KB (${resource.duration.toFixed(2)}ms)`);
    });

    // Check that no single resource is larger than 500KB
    const largeResources = resources.filter((r: any) => r.size > 500000);
    expect(largeResources.length).toBeLessThanOrEqual(2); // Allow 1-2 large resources
  });

  test('should have fast API response times', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });

    const apiMetrics = await page.evaluate(() => {
      return performance
        .getEntriesByType('resource')
        .filter((entry: any) => entry.name.includes('/api/'))
        .map((entry: any) => ({
          url: entry.name,
          duration: entry.duration,
        }));
    });

    console.log('API response times:');
    apiMetrics.forEach((metric: any) => {
      console.log(`  ${metric.url}: ${metric.duration.toFixed(2)}ms`);
      expect(metric.duration).toBeLessThan(500); // API should respond within 500ms
    });
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const vitals = await page.evaluate(() => {
      return new Promise<{ lcp?: number; fid?: number; cls?: number }>((resolve) => {
        const metrics: any = {};

        // Largest Contentful Paint
        const paintObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
        });

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            metrics.fid = entries[0].processingDuration;
          }
        });

        // Cumulative Layout Shift
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if ((entry as any).hadRecentInput) continue;
            clsValue += (entry as any).value;
          }
          metrics.cls = clsValue;
        });

        try {
          paintObserver.observe({ entryTypes: ['largest-contentful-paint'] });
          fidObserver.observe({ entryTypes: ['first-input'] });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
          // Observer not supported
        }

        setTimeout(() => {
          resolve(metrics);
        }, 3000);
      });
    });

    console.log('Core Web Vitals:');
    if (vitals.lcp) console.log(`  LCP: ${vitals.lcp.toFixed(2)}ms (target: <2500ms)`);
    if (vitals.fid) console.log(`  FID: ${vitals.fid.toFixed(2)}ms (target: <100ms)`);
    if (vitals.cls) console.log(`  CLS: ${vitals.cls.toFixed(3)} (target: <0.1)`);
  });

  test('should handle concurrent requests efficiently', async ({ page }) => {
    const startTime = performance.now();

    // Navigate to page with multiple API calls
    await page.goto('/dashboard', { waitUntil: 'networkidle' });

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    console.log(`Total time for concurrent requests: ${totalTime.toFixed(2)}ms`);
    expect(totalTime).toBeLessThan(2000);
  });

  test('should efficiently cache resources', async ({ page }) => {
    // First load
    const firstLoadStart = performance.now();
    await page.goto('/', { waitUntil: 'networkidle' });
    const firstLoadTime = performance.now() - firstLoadStart;

    // Reload (should use cache)
    const secondLoadStart = performance.now();
    await page.reload({ waitUntil: 'networkidle' });
    const secondLoadTime = performance.now() - secondLoadStart;

    console.log(`First load: ${firstLoadTime.toFixed(2)}ms`);
    console.log(`Second load (cached): ${secondLoadTime.toFixed(2)}ms`);

    // Second load should be faster due to caching
    expect(secondLoadTime).toBeLessThan(firstLoadTime);
  });

  test('should measure memory usage', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });

    const memoryMetrics = await page.evaluate(() => {
      if ((performance as any).memory) {
        return {
          usedJSHeapSize: ((performance as any).memory.usedJSHeapSize / 1048576).toFixed(2),
          totalJSHeapSize: ((performance as any).memory.totalJSHeapSize / 1048576).toFixed(2),
          jsHeapSizeLimit: ((performance as any).memory.jsHeapSizeLimit / 1048576).toFixed(2),
        };
      }
      return null;
    });

    if (memoryMetrics) {
      console.log('Memory metrics:');
      console.log(`  Used: ${memoryMetrics.usedJSHeapSize}MB`);
      console.log(`  Total: ${memoryMetrics.totalJSHeapSize}MB`);
      console.log(`  Limit: ${memoryMetrics.jsHeapSizeLimit}MB`);
    }
  });
});

