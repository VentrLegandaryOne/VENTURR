/**
 * Mobile-First Responsive Design Utilities
 * Touch-friendly UI, responsive layouts, mobile-specific navigation
 */

export const breakpoints = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export const mobileResponsive = {
  /**
   * Check if device is mobile
   */
  isMobile: (width: number = typeof window !== 'undefined' ? window.innerWidth : 768) => {
    return width < breakpoints.md;
  },

  /**
   * Check if device is tablet
   */
  isTablet: (width: number = typeof window !== 'undefined' ? window.innerWidth : 768) => {
    return width >= breakpoints.md && width < breakpoints.lg;
  },

  /**
   * Check if device is desktop
   */
  isDesktop: (width: number = typeof window !== 'undefined' ? window.innerWidth : 768) => {
    return width >= breakpoints.lg;
  },

  /**
   * Get touch-friendly button padding
   */
  buttonPadding: (size: 'sm' | 'md' | 'lg' = 'md') => {
    const padding = {
      sm: 'px-3 py-2',
      md: 'px-4 py-3',
      lg: 'px-6 py-4',
    };
    return padding[size];
  },

  /**
   * Get touch-friendly input padding
   */
  inputPadding: () => 'px-4 py-3',

  /**
   * Get touch-friendly spacing
   */
  spacing: (level: 1 | 2 | 3 | 4 | 5 = 3) => {
    const spacing = {
      1: 'gap-2',
      2: 'gap-3',
      3: 'gap-4',
      4: 'gap-6',
      5: 'gap-8',
    };
    return spacing[level];
  },

  /**
   * Get responsive grid columns
   */
  gridCols: (mobile: number, tablet: number, desktop: number) => {
    return `grid-cols-${mobile} md:grid-cols-${tablet} lg:grid-cols-${desktop}`;
  },

  /**
   * Get responsive font size
   */
  fontSize: (level: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' = 'base') => {
    const sizes = {
      xs: 'text-xs md:text-sm',
      sm: 'text-sm md:text-base',
      base: 'text-base md:text-lg',
      lg: 'text-lg md:text-xl',
      xl: 'text-xl md:text-2xl',
      '2xl': 'text-2xl md:text-3xl',
    };
    return sizes[level];
  },

  /**
   * Get responsive padding
   */
  padding: (mobile: number, desktop: number) => {
    return `p-${mobile} md:p-${desktop}`;
  },

  /**
   * Get responsive margin
   */
  margin: (mobile: number, desktop: number) => {
    return `m-${mobile} md:m-${desktop}`;
  },

  /**
   * Get responsive width
   */
  width: (mobile: string, desktop: string) => {
    return `w-${mobile} md:w-${desktop}`;
  },

  /**
   * Get responsive height
   */
  height: (mobile: string, desktop: string) => {
    return `h-${mobile} md:h-${desktop}`;
  },

  /**
   * Get responsive flex direction
   */
  flexDirection: () => 'flex-col md:flex-row',

  /**
   * Get responsive display
   */
  display: (mobile: 'block' | 'hidden' | 'flex', desktop: 'block' | 'hidden' | 'flex') => {
    const mobileClass = mobile === 'hidden' ? 'hidden' : mobile === 'flex' ? 'flex' : 'block';
    const desktopClass = desktop === 'hidden' ? 'md:hidden' : desktop === 'flex' ? 'md:flex' : 'md:block';
    return `${mobileClass} ${desktopClass}`;
  },
};

/**
 * Hook to detect window size
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 768,
    height: typeof window !== 'undefined' ? window.innerHeight : 1024,
  });

  React.useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

/**
 * Hook to detect device type
 */
export function useDeviceType() {
  const { width } = useWindowSize();

  return {
    isMobile: width < breakpoints.md,
    isTablet: width >= breakpoints.md && width < breakpoints.lg,
    isDesktop: width >= breakpoints.lg,
    width,
  };
}

/**
 * Touch event handler utilities
 */
export const touchHandlers = {
  /**
   * Detect swipe left
   */
  onSwipeLeft: (callback: () => void, threshold: number = 50) => {
    let startX = 0;

    return {
      onTouchStart: (e: React.TouchEvent) => {
        startX = e.touches[0].clientX;
      },
      onTouchEnd: (e: React.TouchEvent) => {
        const endX = e.changedTouches[0].clientX;
        if (startX - endX > threshold) {
          callback();
        }
      },
    };
  },

  /**
   * Detect swipe right
   */
  onSwipeRight: (callback: () => void, threshold: number = 50) => {
    let startX = 0;

    return {
      onTouchStart: (e: React.TouchEvent) => {
        startX = e.touches[0].clientX;
      },
      onTouchEnd: (e: React.TouchEvent) => {
        const endX = e.changedTouches[0].clientX;
        if (endX - startX > threshold) {
          callback();
        }
      },
    };
  },

  /**
   * Detect long press
   */
  onLongPress: (callback: () => void, duration: number = 500) => {
    let timeoutId: NodeJS.Timeout;

    return {
      onTouchStart: () => {
        timeoutId = setTimeout(callback, duration);
      },
      onTouchEnd: () => {
        clearTimeout(timeoutId);
      },
    };
  },
};

/**
 * Mobile-optimized modal
 */
export const mobileModal = {
  /**
   * Get modal height (full screen on mobile, centered on desktop)
   */
  height: () => 'h-screen md:h-auto',

  /**
   * Get modal width (full width on mobile, centered on desktop)
   */
  width: () => 'w-full md:w-96',

  /**
   * Get modal position (bottom sheet on mobile, centered on desktop)
   */
  position: () => 'fixed bottom-0 md:fixed md:inset-0 md:flex md:items-center md:justify-center',
};

/**
 * Mobile-optimized navigation
 */
export const mobileNav = {
  /**
   * Get nav height (larger on mobile for touch)
   */
  height: () => 'h-16 md:h-14',

  /**
   * Get nav item padding (larger on mobile for touch)
   */
  itemPadding: () => 'px-4 py-3 md:px-3 md:py-2',

  /**
   * Get nav font size
   */
  fontSize: () => 'text-base md:text-sm',
};

import React from 'react';

