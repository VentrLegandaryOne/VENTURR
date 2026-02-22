import { motion } from "framer-motion";

interface TriangleLogoProps {
  size?: number;
  withHalo?: boolean;
  animated?: boolean;
  className?: string;
}

/**
 * VENTURR Triangle/V Logo with Ethereal Halo
 * 
 * Sacred Geometry Design:
 * - Upward-pointing equilateral triangle (apex orientation)
 * - Integrated V letterform within triangle geometry
 * - Electric blue (#00A8FF) halo glow effect
 * - Layered glow: Inner (tight, 20px) + Outer (diffuse, 60px)
 * 
 * Represents: Ascension, precision, structural integrity, upward momentum
 */
export function TriangleLogo({
  size = 60,
  withHalo = true,
  animated = false,
  className = "",
}: TriangleLogoProps) {
  const trianglePath = `M ${size / 2} ${size * 0.15} L ${size * 0.9} ${size * 0.85} L ${size * 0.1} ${size * 0.85} Z`;
  const vPath = `M ${size * 0.3} ${size * 0.4} L ${size * 0.5} ${size * 0.7} L ${size * 0.7} ${size * 0.4}`;

  const logoVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  const haloVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: [0.3, 0.6, 0.3],
      scale: [1, 1.1, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
      },
    },
  };

  const Component = animated ? motion.svg : "svg";

  return (
    <Component
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={className}
      {...(animated && { variants: logoVariants, initial: "initial", animate: "animate" })}
    >
      <defs>
        {/* Layered Halo Glow Filter */}
        {withHalo && (
          <>
            <filter id="halo-inner" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0
                        0 0 0 0 0.659
                        0 0 0 0 1
                        0 0 0 0.6 0"
              />
            </filter>
            <filter id="halo-outer" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="12" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0
                        0 0 0 0 0.659
                        0 0 0 0 1
                        0 0 0 0.3 0"
              />
            </filter>
          </>
        )}
      </defs>

      {/* Outer Halo Glow (diffuse, 60px equivalent) */}
      {withHalo && (
        <motion.path
          d={trianglePath}
          stroke="var(--electric-blue, #00A8FF)"
          strokeWidth="3"
          fill="none"
          filter="url(#halo-outer)"
          variants={haloVariants}
          initial="initial"
          animate="animate"
        />
      )}

      {/* Inner Halo Glow (tight, 20px equivalent) */}
      {withHalo && (
        <motion.path
          d={trianglePath}
          stroke="var(--electric-blue, #00A8FF)"
          strokeWidth="2"
          fill="none"
          filter="url(#halo-inner)"
          variants={haloVariants}
          initial="initial"
          animate="animate"
        />
      )}

      {/* Main Triangle (Slate Blue) */}
      <path
        d={trianglePath}
        stroke="var(--slate-blue, #4A90E2)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Integrated V Letterform (Electric Blue) */}
      <path
        d={vPath}
        stroke="var(--electric-blue, #00A8FF)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Component>
  );
}

/**
 * Inverted Triangle Mark (∇) - Product Identifier
 * 
 * Simplified inverted triangle used as minimal product identifier
 * Represents: Grounding, stability, foundation (complement to apex)
 */
export function InvertedTriangleMark({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const trianglePath = `M ${size * 0.1} ${size * 0.2} L ${size * 0.9} ${size * 0.2} L ${size * 0.5} ${size * 0.8} Z`;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={className}
    >
      <path
        d={trianglePath}
        fill="var(--slate-blue, #4A90E2)"
        stroke="none"
      />
    </svg>
  );
}
