/**
 * Animation Utilities for World-Class UI/UX
 * Smooth, performant animations that enhance user experience
 */

export const animations = {
  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2, ease: 'easeOut' },
  },

  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },

  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },

  // Scale animations
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  },

  scaleUp: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.15, ease: 'easeOut' },
  },

  // Slide animations
  slideInLeft: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },

  slideInRight: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },

  // Stagger children
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  },

  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },

  // Button interactions
  buttonHover: {
    whileHover: { scale: 1.02, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)' },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.15, ease: 'easeOut' },
  },

  buttonPrimary: {
    whileHover: { 
      scale: 1.02, 
      boxShadow: '0 10px 30px rgba(37, 99, 235, 0.3)',
      y: -2,
    },
    whileTap: { scale: 0.98, y: 0 },
    transition: { duration: 0.15, ease: 'easeOut' },
  },

  // Card interactions
  cardHover: {
    whileHover: { 
      y: -4, 
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    },
    transition: { duration: 0.2, ease: 'easeOut' },
  },

  cardPress: {
    whileTap: { scale: 0.98 },
    transition: { duration: 0.1 },
  },

  // Loading animations
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
    },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },

  spin: {
    animate: { rotate: 360 },
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },

  // Success/Error feedback
  successPop: {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: [0, 1.2, 1], 
      opacity: [0, 1, 1],
    },
    transition: { 
      duration: 0.5, 
      ease: [0.34, 1.56, 0.64, 1],
    },
  },

  shake: {
    animate: {
      x: [0, -10, 10, -10, 10, 0],
    },
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },

  // Page transitions
  pageTransition: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },

  // Modal/Dialog
  modalOverlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },

  modalContent: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },

  // Mobile bottom sheet
  bottomSheet: {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },

  // Notification toast
  toastSlideIn: {
    initial: { opacity: 0, y: -50, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -50, scale: 0.95 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
};

/**
 * Easing functions for custom animations
 */
export const easings = {
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  sharp: [0.4, 0, 0.6, 1],
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  springBouncy: { type: 'spring', stiffness: 400, damping: 20 },
};

/**
 * Duration constants (in seconds)
 */
export const durations = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
};

/**
 * Utility to create stagger animations for lists
 */
export function createStaggerAnimation(itemCount: number, delayBetween = 0.05) {
  return {
    container: {
      animate: {
        transition: {
          staggerChildren: delayBetween,
          delayChildren: 0.1,
        },
      },
    },
    item: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3, ease: easings.easeOut },
    },
  };
}

/**
 * Utility for scroll-triggered animations
 */
export const scrollAnimations = {
  viewport: { once: true, margin: '-100px' },
  fadeInOnScroll: {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-100px' },
    transition: { duration: 0.5, ease: easings.easeOut },
  },
};

