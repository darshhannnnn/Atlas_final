export default function AtlasLogo({ size = 'md', animated = true }) {
  const sizes = {
    sm: { container: 'w-8 h-8', svg: 32 },
    md: { container: 'w-16 h-16', svg: 64 },
    lg: { container: 'w-24 h-24', svg: 96 },
    xl: { container: 'w-32 h-32', svg: 128 }
  }

  const { container, svg: svgSize } = sizes[size]

  return (
    <div className={`${container} flex items-center justify-center mx-auto ${animated ? 'animate-float' : ''}`}>
      <svg 
        width={svgSize} 
        height={svgSize} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer rotating ring */}
        <g className={animated ? 'animate-orbit' : ''} style={{ transformOrigin: '50% 50%' }}>
          <circle 
            cx="50" 
            cy="50" 
            r="42" 
            stroke="#C9A574" 
            strokeWidth="1.5" 
            fill="none"
            opacity="0.3"
          />
          <circle cx="92" cy="50" r="2.5" fill="#C9A574" opacity="0.8" />
        </g>

        {/* Middle rotating ring */}
        <g className={animated ? 'animate-orbit-reverse' : ''} style={{ transformOrigin: '50% 50%' }}>
          <circle 
            cx="50" 
            cy="50" 
            r="36" 
            stroke="#C9A574" 
            strokeWidth="1.5" 
            fill="none"
            opacity="0.4"
          />
          <circle cx="14" cy="50" r="2.5" fill="#C9A574" opacity="0.8" />
        </g>

        {/* Inner static ring */}
        <circle 
          cx="50" 
          cy="50" 
          r="30" 
          stroke="#C9A574" 
          strokeWidth="1.5" 
          fill="none"
          opacity="0.5"
        />

        {/* Central glowing circle */}
        <circle 
          cx="50" 
          cy="50" 
          r="22" 
          fill="#C9A574"
          className={animated ? 'animate-pulse-glow' : ''}
        />

        {/* Letter A */}
        <g>
          <path 
            d="M 50 36 L 58 60 L 54 60 L 52.5 56 L 47.5 56 L 46 60 L 42 60 Z M 48.5 53 L 51.5 53 L 50 45 Z" 
            fill="#2C2C2C"
            className="drop-shadow-sm"
          />
        </g>
      </svg>
    </div>
  )
}
