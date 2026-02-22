import { useEffect, useRef, useState, RefObject } from "react";
import { haptics } from "@/lib/haptics";

export interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number; // Minimum distance to trigger swipe (px)
  velocityThreshold?: number; // Minimum velocity to trigger swipe (px/ms)
  restraint?: number; // Maximum perpendicular distance (px)
}

export interface SwipeState {
  isSwiping: boolean;
  direction: 'left' | 'right' | null;
  distance: number;
  progress: number; // 0-1, based on threshold
}

/**
 * useSwipeGesture - Detects horizontal swipe gestures on touch devices
 * 
 * Features:
 * - Left and right swipe detection
 * - Configurable threshold and velocity
 * - Visual feedback during swipe
 * - Haptic feedback on swipe actions
 * 
 * @param elementRef - Ref to the element to attach swipe listeners
 * @param options - Swipe configuration options
 * @returns Swipe state for visual feedback
 */
export function useSwipeGesture(
  elementRef: RefObject<HTMLElement | null>,
  options: SwipeGestureOptions
): SwipeState {
  const {
    onSwipeLeft,
    onSwipeRight,
    threshold = 100,
    velocityThreshold = 0.3,
    restraint = 100,
  } = options;

  const [swipeState, setSwipeState] = useState<SwipeState>({
    isSwiping: false,
    direction: null,
    distance: 0,
    progress: 0,
  });

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const hasTriggeredHaptic = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
      touchStartTime.current = Date.now();
      hasTriggeredHaptic.current = false;

      setSwipeState({
        isSwiping: true,
        direction: null,
        distance: 0,
        progress: 0,
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!swipeState.isSwiping && touchStartX.current === 0) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX.current;
      const deltaY = touch.clientY - touchStartY.current;

      // Check if swipe is horizontal enough
      if (Math.abs(deltaY) > restraint) {
        // Too much vertical movement, cancel swipe
        setSwipeState({
          isSwiping: false,
          direction: null,
          distance: 0,
          progress: 0,
        });
        return;
      }

      const direction = deltaX > 0 ? 'right' : 'left';
      const distance = Math.abs(deltaX);
      const progress = Math.min(distance / threshold, 1);

      // Trigger haptic feedback at 50% threshold
      if (progress >= 0.5 && !hasTriggeredHaptic.current) {
        haptics.swipeThreshold();
        hasTriggeredHaptic.current = true;
      }

      setSwipeState({
        isSwiping: true,
        direction,
        distance,
        progress,
      });

      // Prevent scrolling during horizontal swipe
      if (distance > 10) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === 0) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX.current;
      const deltaY = touch.clientY - touchStartY.current;
      const distance = Math.abs(deltaX);
      const duration = Date.now() - touchStartTime.current;
      const velocity = distance / duration;

      // Check if swipe meets criteria
      const isHorizontal = Math.abs(deltaY) <= restraint;
      const meetsThreshold = distance >= threshold;
      const meetsVelocity = velocity >= velocityThreshold;

      if (isHorizontal && (meetsThreshold || meetsVelocity)) {
        if (deltaX < 0 && onSwipeLeft) {
          // Swipe left
          haptics.swipeComplete();
          onSwipeLeft();
        } else if (deltaX > 0 && onSwipeRight) {
          // Swipe right
          haptics.swipeComplete();
          onSwipeRight();
        }
      }

      // Reset state
      touchStartX.current = 0;
      touchStartY.current = 0;
      touchStartTime.current = 0;
      hasTriggeredHaptic.current = false;

      setSwipeState({
        isSwiping: false,
        direction: null,
        distance: 0,
        progress: 0,
      });
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [
    elementRef,
    onSwipeLeft,
    onSwipeRight,
    threshold,
    velocityThreshold,
    restraint,
    swipeState.isSwiping,
  ]);

  return swipeState;
}
