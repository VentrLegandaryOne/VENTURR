import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";


const plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React and routing
          'react-vendor': ['react', 'react-dom', 'wouter'],
          
          // tRPC and data fetching
          'trpc-vendor': [
            '@trpc/client',
            '@trpc/react-query',
            '@tanstack/react-query',
            'superjson'
          ],
          
          // Chart libraries (heavy - separate chunk)
          'charts': ['chart.js', 'react-chartjs-2', 'recharts'],
          
          // Radix UI components (separate chunk)
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-popover',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog'
          ],
          
          // AWS SDK (only needed for uploads)
          'aws-sdk': ['@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner'],
          
          // Form handling
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          
          // Utilities
          'utils': ['date-fns', 'clsx', 'class-variance-authority'],
          
          // Animation libraries
          'animation': ['framer-motion'],
          
          // Markdown rendering
          'markdown': ['streamdown']
        }
      }
    },
    // Increase chunk size warning limit (we're handling it with splitting)
    chunkSizeWarningLimit: 600,
    // Enable minification
    minify: 'esbuild' // Use esbuild for faster builds
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
