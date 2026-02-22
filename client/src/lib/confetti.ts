import confetti from 'canvas-confetti';

/**
 * Trigger celebratory confetti animation with VENTURR branding colors
 */
export function triggerSuccessConfetti() {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { 
    startVelocity: 30, 
    spread: 360, 
    ticks: 60, 
    zIndex: 9999,
    colors: [
      '#4A90E2', // Steel Blue (primary)
      '#5BA3F5', // Vibrant Cyan Blue (accent)
      '#10B981', // Success Green
      '#F59E0B', // Warning Amber
      '#60A5FA', // Light Blue
    ],
  };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: ReturnType<typeof setInterval> = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    
    // Burst from left side
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    });
    
    // Burst from right side
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    });
  }, 250);
}

/**
 * Trigger a single confetti burst from the center
 */
export function triggerCenterBurst() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: [
      '#4A90E2', // Steel Blue
      '#5BA3F5', // Vibrant Cyan Blue
      '#10B981', // Success Green
      '#60A5FA', // Light Blue
    ],
    zIndex: 9999,
  });
}

/**
 * Trigger confetti cannon from bottom
 */
export function triggerConfettiCannon() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    colors: [
      '#4A90E2',
      '#5BA3F5',
      '#10B981',
      '#F59E0B',
      '#60A5FA',
    ],
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });

  fire(0.2, {
    spread: 60,
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}
