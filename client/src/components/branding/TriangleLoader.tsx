import { motion } from "framer-motion";

interface TriangleLoaderProps {
  size?: number;
  text?: string;
  className?: string;
}

/**
 * VENTURR Triangle Loading Animation
 * 
 * Sacred Geometry Loading Indicator:
 * - Triangle rotates on vertical axis (3D effect)
 * - Halo pulses with breathing rhythm (3-second cycle)
 * - Particles emanate from triangle vertices
 * - Sacred geometry patterns emerge during transitions
 * 
 * Used for: Processing overlays, page transitions, data loading
 */
export function TriangleLoader({
  size = 80,
  text = "Processing...",
  className = "",
}: TriangleLoaderProps) {
  const trianglePath = `M ${size / 2} ${size * 0.2} L ${size * 0.85} ${size * 0.8} L ${size * 0.15} ${size * 0.8} Z`;
  const vPath = `M ${size * 0.35} ${size * 0.45} L ${size * 0.5} ${size * 0.65} L ${size * 0.65} ${size * 0.45}`;

  return (
    <div className={`flex flex-col items-center justify-center gap-6 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* Outer Halo Pulse (breathing rhythm, 3-second cycle) */}
        <motion.svg
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
          className="absolute inset-0"
          style={{ filter: "blur(20px)" }}
        >
          <motion.path
            d={trianglePath}
            stroke="var(--electric-blue, #00A8FF)"
            strokeWidth="4"
            fill="none"
            initial={{ opacity: 0.2, scale: 1 }}
            animate={{
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          />
        </motion.svg>

        {/* Inner Halo Glow */}
        <motion.svg
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
          className="absolute inset-0"
          style={{ filter: "blur(8px)" }}
        >
          <motion.path
            d={trianglePath}
            stroke="var(--electric-blue, #00A8FF)"
            strokeWidth="3"
            fill="none"
            initial={{ opacity: 0.4 }}
            animate={{
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          />
        </motion.svg>

        {/* Main Triangle (3D rotation on vertical axis) */}
        <motion.svg
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            perspective: "1000px",
          }}
        >
          <motion.g
            initial={{ rotateY: 0 }}
            animate={{ rotateY: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              transformOrigin: "center",
            }}
          >
            {/* Triangle outline */}
            <path
              d={trianglePath}
              stroke="var(--slate-blue, #4A90E2)"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Integrated V */}
            <path
              d={vPath}
              stroke="var(--electric-blue, #00A8FF)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.g>
        </motion.svg>

        {/* Particles emanating from vertices */}
        {[0, 1, 2].map((index) => {
          const angle = (index * 120 - 90) * (Math.PI / 180);
          const radius = size * 0.35;
          const x = size / 2 + Math.cos(angle) * radius;
          const y = size / 2 + Math.sin(angle) * radius;

          return (
            <motion.div
              key={index}
              className="absolute w-1 h-1 rounded-full bg-accent"
              style={{
                left: x,
                top: y,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                y: [0, -20],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.3,
              }}
            />
          );
        })}
      </div>

      {/* Loading text */}
      {text && (
        <motion.p
          className="text-sm font-medium text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

/**
 * Mini Triangle Loader (for inline use)
 */
export function MiniTriangleLoader({ size = 24 }: { size?: number }) {
  const trianglePath = `M ${size / 2} ${size * 0.2} L ${size * 0.85} ${size * 0.8} L ${size * 0.15} ${size * 0.8} Z`;

  return (
    <motion.svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className="inline-block"
    >
      <motion.path
        d={trianglePath}
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        initial={{ rotateY: 0 }}
        animate={{ rotateY: 360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          transformOrigin: "center",
        }}
      />
    </motion.svg>
  );
}
