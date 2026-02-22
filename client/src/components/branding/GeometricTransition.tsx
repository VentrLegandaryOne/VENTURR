import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

/**
 * Geometric Transition Component
 * 
 * Sacred geometry transition animations for page changes:
 * - Triangle pattern emergence
 * - 3-6-9 sacred geometry morphing
 * - Fibonacci-based timing
 * - Electric Blue halo glow
 */

interface GeometricTransitionProps {
  children: React.ReactNode;
}

export function GeometricTransition({ children }: GeometricTransitionProps) {
  const [location] = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 800); // Fibonacci: 0.8s
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      {/* Triangle pattern emergence overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 pointer-events-none"
          >
            {/* Triangular pattern overlay */}
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 1.5, rotate: 120 }}
              exit={{ scale: 0, rotate: 240 }}
              transition={{
                duration: 0.8,
                ease: [0.43, 0.13, 0.23, 0.96],
              }}
              className="absolute inset-0 triangle-pattern opacity-20"
              style={{
                background: "radial-gradient(circle at center, var(--electric-blue) 0%, transparent 70%)",
              }}
            />

            {/* Sacred geometry triangles (3-6-9 pattern) */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* 3 primary triangles */}
              {[0, 120, 240].map((rotation, i) => (
                <motion.div
                  key={`primary-${i}`}
                  initial={{ scale: 0, rotate: rotation, opacity: 0 }}
                  animate={{
                    scale: [0, 1.2, 0],
                    rotate: [rotation, rotation + 120, rotation + 240],
                    opacity: [0, 0.6, 0],
                  }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.1, // Fibonacci timing
                    ease: "easeInOut",
                  }}
                  className="absolute"
                  style={{
                    width: "200px",
                    height: "200px",
                  }}
                >
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full"
                    style={{
                      filter: "drop-shadow(0 0 20px var(--electric-blue))",
                    }}
                  >
                    <path
                      d="M50 10 L90 80 L10 80 Z"
                      fill="none"
                      stroke="var(--electric-blue)"
                      strokeWidth="2"
                    />
                  </svg>
                </motion.div>
              ))}

              {/* 6 secondary triangles (hexagonal arrangement) */}
              {[0, 60, 120, 180, 240, 300].map((rotation, i) => (
                <motion.div
                  key={`secondary-${i}`}
                  initial={{ scale: 0, rotate: rotation, opacity: 0 }}
                  animate={{
                    scale: [0, 0.8, 0],
                    rotate: [rotation, rotation + 60, rotation + 120],
                    opacity: [0, 0.4, 0],
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.1 + i * 0.05, // Fibonacci timing
                    ease: "easeInOut",
                  }}
                  className="absolute"
                  style={{
                    width: "120px",
                    height: "120px",
                  }}
                >
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full"
                    style={{
                      filter: "drop-shadow(0 0 10px var(--slate-blue))",
                    }}
                  >
                    <path
                      d="M50 20 L80 70 L20 70 Z"
                      fill="none"
                      stroke="var(--slate-blue)"
                      strokeWidth="1.5"
                    />
                  </svg>
                </motion.div>
              ))}

              {/* 9 tertiary particles (complete integration) */}
              {[...Array(9)].map((_, i) => {
                const angle = (i * 40) * (Math.PI / 180); // 9 × 40° = 360°
                const radius = 150;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <motion.div
                    key={`particle-${i}`}
                    initial={{
                      x: 0,
                      y: 0,
                      scale: 0,
                      opacity: 0,
                    }}
                    animate={{
                      x: [0, x, 0],
                      y: [0, y, 0],
                      scale: [0, 1, 0],
                      opacity: [0, 0.8, 0],
                    }}
                    transition={{
                      duration: 0.8,
                      delay: i * 0.05,
                      ease: "easeOut",
                    }}
                    className="absolute"
                    style={{
                      left: "50%",
                      top: "50%",
                      width: "8px",
                      height: "8px",
                    }}
                  >
                    <div
                      className="w-full h-full"
                      style={{
                        background: "var(--electric-blue)",
                        clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                        filter: "drop-shadow(0 0 4px var(--electric-blue))",
                      }}
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* Central halo pulse */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 2, 3],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div
                style={{
                  width: "200px",
                  height: "200px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, var(--electric-blue) 0%, transparent 70%)",
                  filter: "blur(40px)",
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page content with fade transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.5,
            delay: 0.3, // Wait for geometric transition
            ease: "easeInOut",
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

/**
 * Triangle Morphing Effect
 * 
 * Morphs between different triangular states for interactive elements
 */
interface TriangleMorphProps {
  isActive: boolean;
  className?: string;
  size?: number;
}

export function TriangleMorph({
  isActive,
  className = "",
  size = 60,
}: TriangleMorphProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
    >
      {/* Morphing triangle */}
      <motion.path
        animate={
          isActive
            ? {
                d: [
                  "M50 20 L80 80 L20 80 Z", // Upward triangle
                  "M50 50 L90 50 L50 90 L10 50 Z", // Diamond
                  "M50 20 L80 80 L20 80 Z", // Back to triangle
                ],
              }
            : {
                d: "M50 20 L80 80 L20 80 Z",
              }
        }
        transition={{
          duration: 1.2,
          repeat: isActive ? Infinity : 0,
          ease: "easeInOut",
        }}
        fill="none"
        stroke="var(--electric-blue)"
        strokeWidth="2"
        style={{
          filter: "drop-shadow(0 0 10px var(--electric-blue))",
        }}
      />

      {/* Inner glow */}
      <motion.circle
        cx="50"
        cy="50"
        r="5"
        fill="var(--electric-blue)"
        animate={
          isActive
            ? {
                scale: [1, 1.5, 1],
                opacity: [0.6, 1, 0.6],
              }
            : {}
        }
        transition={{
          duration: 1.2,
          repeat: isActive ? Infinity : 0,
          ease: "easeInOut",
        }}
      />
    </motion.svg>
  );
}

/**
 * Loading Spinner with Sacred Geometry
 * 
 * Triangular loading animation following 3-6-9 principles
 */
interface GeometricLoadingProps {
  size?: number;
  className?: string;
}

export function GeometricLoading({
  size = 60,
  className = "",
}: GeometricLoadingProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* 3 rotating triangles */}
      {[0, 120, 240].map((rotation, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          animate={{
            rotate: [rotation, rotation + 360],
          }}
          transition={{
            duration: 3, // 3-second cycle (sacred number)
            repeat: Infinity,
            ease: "linear",
            delay: i * 0.3,
          }}
        >
          <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            className="w-full h-full"
          >
            <path
              d="M50 10 L90 80 L10 80 Z"
              fill="none"
              stroke="var(--electric-blue)"
              strokeWidth="3"
              strokeLinecap="round"
              style={{
                filter: "drop-shadow(0 0 8px var(--electric-blue))",
              }}
            />
          </svg>
        </motion.div>
      ))}

      {/* Central pulsing dot */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div
          style={{
            width: size * 0.15,
            height: size * 0.15,
            borderRadius: "50%",
            background: "var(--electric-blue)",
            boxShadow: "0 0 20px var(--electric-blue)",
          }}
        />
      </motion.div>
    </div>
  );
}
