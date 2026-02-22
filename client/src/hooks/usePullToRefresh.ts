import { useEffect, useRef, useState } from "react";
import { haptics } from "@/lib/haptics";

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPullDistance?: number;
  enabled?: boolean;
}

/**
 * usePullToRefresh - Native mobile pull-to-refresh gesture
 * 
 * Features:
 * - Touch-based pull detection
 * - Visual feedback with progress indicator
 * - Smooth animations
 * - Prevents scroll interference
 * - iOS/Android compatible
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  maxPullDistance = 120,
  enabled = true,
}: PullToRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef<number>(0);
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current || document.body;
    let isTouching = false;

    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger if scrolled to top
      if (container.scrollTop === 0 && !isRefreshing) {
        touchStartY.current = e.touches[0].clientY;
        isTouching = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTouching || isRefreshing) return;

      const touchY = e.touches[0].clientY;
      const distance = touchY - touchStartY.current;

      // Only pull down, not up
      if (distance > 0 && container.scrollTop === 0) {
        // Prevent default scroll behavior during pull
        e.preventDefault();
        
        // Apply resistance curve for natural feel
        const resistance = 0.5;
        const adjustedDistance = Math.min(
          distance * resistance,
          maxPullDistance
        );
        
        setPullDistance(adjustedDistance);
      }
    };

    const handleTouchEnd = async () => {
      if (!isTouching) return;
      
      isTouching = false;

      // Trigger refresh if pulled beyond threshold
      if (pullDistance >= threshold && !isRefreshing) {
        haptics.pullThreshold(); // Haptic feedback when threshold reached
        setIsRefreshing(true);
        setPullDistance(threshold); // Lock at threshold during refresh
        
        try {
          await onRefresh();
          haptics.refreshComplete(); // Haptic feedback when refresh completes
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        // Snap back if not enough pull
        setPullDistance(0);
      }
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [enabled, isRefreshing, pullDistance, threshold, maxPullDistance, onRefresh]);

  return {
    isRefreshing,
    pullDistance,
    progress: Math.min(pullDistance / threshold, 1),
    containerRef,
  };
}
