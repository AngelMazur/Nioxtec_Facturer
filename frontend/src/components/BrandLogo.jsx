export default function BrandLogo({ className = "h-8" }) {
  return (
    <div className={`inline-flex items-center ${className}`} aria-label="NIOXTEC">
      <svg viewBox="0 0 360 48" className="h-full w-auto" role="img">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#08b4d8" />
            <stop offset="100%" stopColor="#0b3c5d" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="356" height="44" rx="8" fill="none" stroke="url(#g)" strokeWidth="3" />
        <text x="24" y="32" fontFamily="ui-sans-serif, system-ui" fontWeight="800" fontSize="28" fill="currentColor" className="text-gray-900 dark:text-white">NIOXTEC</text>
      </svg>
    </div>
  )
}


