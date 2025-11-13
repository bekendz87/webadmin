import { IconProps } from "@/types/icon-props";

export function AlertWarningIcon(props: IconProps) {
  return (
    <div className="relative">
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none" {...props}>
        {/* macOS26 style background with gradient */}
        <rect width={28} height={28} rx={7} fill="url(#warningGradient)" />
        <rect width={28} height={28} rx={7} fill="rgba(255, 255, 255, 0.1)" />

        {/* Warning symbol */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14 8a1 1 0 01.993.883L15 9v7a1 1 0 01-1.993.117L13 16V9a1 1 0 011-1zm0 11a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
          fill="#fff"
          fillOpacity="0.95"
        />

        {/* Gradient definitions */}
        <defs>
          <linearGradient id="warningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#ff9500', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#ff6b00', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
      </svg>

      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-lg bg-orange-400 opacity-20 blur-sm -z-10"></div>
    </div>
  );
}

export function AlertSuccessIcon(props: IconProps) {
  return (
    <div className="relative">
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none" {...props}>
        {/* macOS26 style background with gradient */}
        <rect width={28} height={28} rx={7} fill="url(#successGradient)" />
        <rect width={28} height={28} rx={7} fill="rgba(255, 255, 255, 0.1)" />

        {/* Checkmark */}
        <path
          d="M20.285 9.567a.875.875 0 01.148 1.227l-8.75 11.25a.875.875 0 01-1.375 0l-4.375-5.625a.875.875 0 111.375-1.227l3.687 4.736 8.063-10.361a.875.875 0 011.227-.148z"
          fill="#fff"
          fillOpacity="0.95"
        />

        {/* Gradient definitions */}
        <defs>
          <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#34c759', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#248a3d', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
      </svg>

      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-lg bg-green-400 opacity-20 blur-sm -z-10"></div>
    </div >
  );
}

export function AlertErrorIcon(props: IconProps) {
  return (
    <div className="relative">
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none" {...props}>
        {/* macOS26 style background with gradient */}
        <rect width={28} height={28} rx={7} fill="url(#errorGradient)" />
        <rect width={28} height={28} rx={7} fill="rgba(255, 255, 255, 0.1)" />

        {/* X symbol */}
        <path
          d="M19.25 8.75a.875.875 0 00-1.238 0L14 12.762 9.988 8.75a.875.875 0 00-1.238 1.238L12.762 14l-4.012 4.012a.875.875 0 001.238 1.238L14 15.238l4.012 4.012a.875.875 0 001.238-1.238L15.238 14l4.012-4.012a.875.875 0 000-1.238z"
          fill="#fff"
          fillOpacity="0.95"
        />

        {/* Gradient definitions */}
        <defs>
          <linearGradient id="errorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#ff3b30', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#d70015', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
      </svg>

      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-lg bg-red-400 opacity-20 blur-sm -z-10"></div>
    </div>
  );
}
