/**
 * VENTURR Triangular Icon Set
 * 
 * Custom icons designed with sacred geometry principles:
 * - 60° and 120° angles preferred
 * - Triangular forms throughout
 * - Consistent stroke weight
 * - Minimal, futuristic aesthetic
 */

interface IconProps {
  className?: string;
  size?: number;
}

/**
 * Shield Icon - Triangular Protection Symbol
 * Represents: Security, trust, protection
 * Geometry: Upward-pointing triangle with inner reinforcement
 */
export function TriangularShield({ className = "", size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer shield triangle */}
      <path
        d="M12 2L4 7V13C4 17.5 7.5 21.5 12 22C16.5 21.5 20 17.5 20 13V7L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Inner triangle reinforcement (60° angles) */}
      <path
        d="M12 8L8.5 14H15.5L12 8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * Zap Icon - Triangular Energy Symbol
 * Represents: Speed, power, energy
 * Geometry: Lightning bolt composed of triangular segments (120° angles)
 */
export function TriangularZap({ className = "", size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Lightning bolt with triangular segments */}
      <path
        d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Inner energy triangles */}
      <path
        d="M12 10L10 14L14 14L12 10Z"
        fill="currentColor"
        opacity="0.3"
      />
    </svg>
  );
}

/**
 * TrendingUp Icon - Triangular Growth Symbol
 * Represents: Growth, progress, upward momentum
 * Geometry: Ascending line with triangular arrow (60° angle)
 */
export function TriangularTrendingUp({ className = "", size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Ascending trend line */}
      <path
        d="M3 17L9 11L13 15L21 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Triangular arrow head (60° angle) */}
      <path
        d="M16 7H21V12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Triangle accent at peak */}
      <path
        d="M21 7L18 10L21 10L21 7Z"
        fill="currentColor"
        opacity="0.5"
      />
    </svg>
  );
}

/**
 * ArrowRight Icon - Triangular Direction Symbol
 * Represents: Forward motion, progress, action
 * Geometry: Arrow with triangular head (60° angle)
 */
export function TriangularArrowRight({ className = "", size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Arrow shaft */}
      <path
        d="M5 12H19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Triangular arrow head (60° angle) */}
      <path
        d="M15 8L19 12L15 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Check Icon - Triangular Confirmation Symbol
 * Represents: Success, completion, verification
 * Geometry: Checkmark with triangular form
 */
export function TriangularCheck({ className = "", size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Checkmark with angular form */}
      <path
        d="M4 12L9 17L20 6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Triangle accent at junction */}
      <path
        d="M9 17L7 15L9 13L9 17Z"
        fill="currentColor"
        opacity="0.3"
      />
    </svg>
  );
}

/**
 * X Icon - Triangular Rejection Symbol
 * Represents: Error, cancellation, rejection
 * Geometry: X with triangular intersections
 */
export function TriangularX({ className = "", size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* X with angular form */}
      <path
        d="M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 6L18 18"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Triangle accent at center */}
      <path
        d="M12 10L10 12L12 14L14 12L12 10Z"
        fill="currentColor"
        opacity="0.3"
      />
    </svg>
  );
}

/**
 * Star Icon - Triangular Excellence Symbol
 * Represents: Quality, rating, excellence
 * Geometry: Star composed of triangular points
 */
export function TriangularStar({ className = "", size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Star with triangular points */}
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}

/**
 * Quote Icon - Triangular Quotation Symbol
 * Represents: Testimonial, speech, communication
 * Geometry: Quote marks with triangular form
 */
export function TriangularQuote({ className = "", size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left quote mark (triangular) */}
      <path
        d="M3 10C3 6 5 4 9 4V8C7 8 6 9 6 10V12H9V18H3V10Z"
        fill="currentColor"
        opacity="0.8"
      />
      {/* Right quote mark (triangular) */}
      <path
        d="M15 10C15 6 17 4 21 4V8C19 8 18 9 18 10V12H21V18H15V10Z"
        fill="currentColor"
        opacity="0.8"
      />
    </svg>
  );
}

/**
 * Menu Icon - Triangular Navigation Symbol
 * Represents: Navigation, options, menu
 * Geometry: Horizontal lines with triangular accents
 */
export function TriangularMenu({ className = "", size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Menu lines */}
      <path
        d="M3 6H21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M3 12H21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M3 18H21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Triangular accents */}
      <path
        d="M2 6L4 5L4 7L2 6Z"
        fill="currentColor"
        opacity="0.5"
      />
      <path
        d="M2 12L4 11L4 13L2 12Z"
        fill="currentColor"
        opacity="0.5"
      />
      <path
        d="M2 18L4 17L4 19L2 18Z"
        fill="currentColor"
        opacity="0.5"
      />
    </svg>
  );
}

/**
 * Upload Icon - Triangular Upload Symbol
 * Represents: Upload, submission, input
 * Geometry: Upward arrow with triangular form
 */
export function TriangularUpload({ className = "", size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Upload arrow shaft */}
      <path
        d="M12 19V5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Triangular arrow head (60° angle) */}
      <path
        d="M5 12L12 5L19 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Base line */}
      <path
        d="M5 19H19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
