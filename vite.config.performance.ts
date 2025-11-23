import { defineConfig } from "vite";

/**
 * Performance Optimization Configuration for Venturr
 * 
 * This configuration enhances:
 * - Load speed through code splitting and lazy loading
 * - Bundle size through tree shaking and compression
 * - Runtime performance through optimized chunks
 */

export const performanceConfig = defineConfig({
  build: {
    // Enable source maps for production debugging
    sourcemap: false,
    
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
          
          // React Query for data fetching
          'query-vendor': ['@tanstack/react-query'],
          
          // UI components
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
          ],
          
          // Maps (large dependency)
          'maps-vendor': ['leaflet', 'react-leaflet'],
          
          // Icons
          'icons-vendor': ['lucide-react'],
          
          // Utilities
          'utils-vendor': ['clsx', 'tailwind-merge', 'date-fns'],
        },
        
        // Optimize asset file names for caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (/woff2?|ttf|eot/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          
          return `assets/[name]-[hash][extname]`;
        },
        
        // Optimize chunk file names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
    
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      format: {
        comments: false, // Remove comments
      },
    },
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      'wouter',
    ],
    exclude: [
      // Exclude large dependencies that should be lazy-loaded
      'leaflet',
      'react-leaflet',
    ],
  },
});

export default performanceConfig;

