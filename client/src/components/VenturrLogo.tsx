/**
 * Venturr Dot Logo Component
 * Simple blue circle representing the Venturr brand
 */

interface VenturrLogoProps {
  size?: number;
  className?: string;
}

export function VenturrLogo({ size = 32, className = "" }: VenturrLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="16" cy="16" r="16" fill="#3B82F6" />
    </svg>
  );
}

interface VenturrLogoWithTextProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function VenturrLogoWithText({ size = "md", className = "" }: VenturrLogoWithTextProps) {
  const sizes = {
    sm: { logo: 24, text: "text-lg" },
    md: { logo: 32, text: "text-xl" },
    lg: { logo: 40, text: "text-2xl" }
  };

  const { logo, text } = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <VenturrLogo size={logo} />
      <span className={`font-semibold tracking-tight ${text}`}>
        VENTURR OS
      </span>
    </div>
  );
}

