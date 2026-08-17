import React from 'react';

interface LogoProps {
  /** Font size (px) of the "Vendora" wordmark — the icon scales to match. */
  size?: number;
  className?: string;
  /** Light wordmark for use on dark grounds. */
  inverted?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 28, className, inverted = false }) => {
  const iconSize = Math.round(size * 1.24);
  const ink = inverted ? '#faf6f0' : '#191410';
  const clay = inverted ? '#e08a6d' : '#c1553a';

  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(size * 0.3), lineHeight: 1 }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* striped awning */}
        <path d="M12 6 L36 6 L42 18 L6 18 Z" fill={clay} opacity=".16" />
        <path d="M18 6 L14 18" stroke={clay} strokeWidth="3" strokeLinecap="round" />
        <path d="M30 6 L30 18" stroke={clay} strokeWidth="3" strokeLinecap="round" />
        <path d="M12 6 L36 6 L42 18 L42 21 L6 21 L6 18 Z" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
        {/* shop body + doorway */}
        <path d="M10 21 L10 34 L38 34 L38 21" stroke={ink} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M19 34 L19 25 L29 25 L29 34" stroke={ink} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      </svg>

      <span
        style={{
          fontSize: size * 1.06,
          fontWeight: 700,
          letterSpacing: '-0.028em',
          fontFamily: "'Fraunces', 'Iowan Old Style', Georgia, serif",
          fontOpticalSizing: 'auto',
          color: ink,
        }}
      >
        Vendora
        <span style={{ color: clay }}>.</span>
      </span>
    </span>
  );
};

export default Logo;
