import { useState, useEffect, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * OptimizedImage Component
 * 
 * Provides automatic image optimization with:
 * - WebP/AVIF format support with fallbacks
 * - Lazy loading
 * - Responsive images
 * - Loading states
 * - Error handling
 */

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  lazy?: boolean;
  priority?: boolean;
  className?: string;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  lazy = true,
  priority = false,
  className,
  fallback,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Generate WebP and AVIF versions
  const getOptimizedSrc = (originalSrc: string, format: 'webp' | 'avif') => {
    // If it's already an optimized format, return as-is
    if (originalSrc.endsWith(`.${format}`)) {
      return originalSrc;
    }
    
    // Replace extension with optimized format
    const lastDot = originalSrc.lastIndexOf('.');
    if (lastDot === -1) return originalSrc;
    
    return originalSrc.substring(0, lastDot) + `.${format}`;
  };

  const webpSrc = getOptimizedSrc(src, 'webp');
  const avifSrc = getOptimizedSrc(src, 'avif');

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    if (currentSrc !== src && !hasError) {
      // Fallback to original if optimized version fails
      setCurrentSrc(src);
    } else if (fallback && currentSrc !== fallback) {
      // Fallback to provided fallback image
      setCurrentSrc(fallback);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
    onError?.();
  };

  useEffect(() => {
    setCurrentSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  if (hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-slate-100 text-slate-400",
          className
        )}
        style={{ width, height }}
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <picture>
      {/* AVIF format (best compression, modern browsers) */}
      <source srcSet={avifSrc} type="image/avif" />
      
      {/* WebP format (good compression, wide support) */}
      <source srcSet={webpSrc} type="image/webp" />
      
      {/* Original format (fallback) */}
      <img
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : lazy ? "lazy" : undefined}
        decoding={priority ? "sync" : "async"}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300",
          isLoading && "opacity-0",
          !isLoading && "opacity-100",
          className
        )}
        {...props}
      />
      
      {/* Loading skeleton */}
      {isLoading && (
        <div
          className={cn(
            "absolute inset-0 bg-slate-200 animate-pulse rounded",
            className
          )}
          style={{ width, height }}
        />
      )}
    </picture>
  );
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, format: 'webp' | 'avif' | 'original' = 'webp'): void {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  
  if (format === 'avif') {
    link.href = src.replace(/\.[^.]+$/, '.avif');
    link.type = 'image/avif';
  } else if (format === 'webp') {
    link.href = src.replace(/\.[^.]+$/, '.webp');
    link.type = 'image/webp';
  } else {
    link.href = src;
  }
  
  document.head.appendChild(link);
}

/**
 * Get responsive image srcset
 */
export function getResponsiveSrcSet(src: string, widths: number[]): string {
  return widths
    .map(width => {
      const ext = src.substring(src.lastIndexOf('.'));
      const base = src.substring(0, src.lastIndexOf('.'));
      return `${base}-${width}w${ext} ${width}w`;
    })
    .join(', ');
}

