// Three stacked layers: JavaScript (yellow), C++ core (blue), native (green).
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="React Native Internals logo"
      className="logomark"
    >
      <rect width="64" height="64" rx="14" fill="#0d1220" />
      <g stroke="#0d1220" strokeWidth="2.5" strokeLinejoin="round">
        <path d="M32 32 L54 44 L32 56 L10 44 Z" fill="#3ed6a0" />
        <path d="M32 21 L54 33 L32 45 L10 33 Z" fill="#7db3ff" />
        <path d="M32 10 L54 22 L32 34 L10 22 Z" fill="#f2b84b" />
      </g>
      <circle cx="32" cy="22" r="3.2" fill="#0d1220" />
    </svg>
  )
}

export function Logo() {
  return (
    <span className="logo">
      <LogoMark />
      <span className="logotext">
        <span className="logo-rn">React Native</span> <span className="logo-int">Internals</span>
      </span>
    </span>
  )
}
