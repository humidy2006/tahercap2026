import React from 'react';

interface CompanyLogoProps {
  className?: string;
  size?: number;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({ className = 'w-12 h-12', size }) => {
  return (
    <div 
      className={`relative inline-flex items-center justify-center overflow-hidden shrink-0 ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      <svg 
        viewBox="0 0 200 200" 
        className="w-full h-full drop-shadow-md"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Black Outer Pentagon Background */}
        <polygon 
          points="100,5 195,74 158,185 42,185 5,74" 
          fill="#000000" 
        />
        
        {/* Inner Thin Silver/White Pentagon Line */}
        <polygon 
          points="100,26 175,81 146,168 54,168 25,81" 
          fill="none" 
          stroke="#a3a3a3" 
          strokeWidth="2.5" 
          strokeLinejoin="round"
        />

        {/* Monogram A */}
        {/* Left leg of A */}
        <line x1="82" y1="60" x2="68" y2="98" stroke="#ffffff" strokeWidth="6" strokeLinecap="square" />
        {/* Right leg of A */}
        <line x1="82" y1="60" x2="95" y2="96" stroke="#ffffff" strokeWidth="6" strokeLinecap="square" />
        {/* Crossbar of A */}
        <line x1="74" y1="88" x2="92" y2="88" stroke="#ffffff" strokeWidth="5" />

        {/* Monogram T */}
        {/* Top bar of T */}
        <line x1="92" y1="96" x2="122" y2="96" stroke="#ffffff" strokeWidth="6" strokeLinecap="square" />
        {/* Stem of T */}
        <line x1="108" y1="96" x2="108" y2="128" stroke="#ffffff" strokeWidth="6" strokeLinecap="square" />

        {/* Crescent Moon framing AT from right to bottom */}
        <path 
          d="M 125 68 A 52 52 0 1 1 54 134 A 46 46 0 1 0 125 68 Z" 
          fill="#ffffff" 
        />
      </svg>
    </div>
  );
};

// SVG Data URL for use in standard img src
export const COMPANY_LOGO_SVG_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <polygon points="100,5 195,74 158,185 42,185 5,74" fill="#000000" />
  <polygon points="100,26 175,81 146,168 54,168 25,81" fill="none" stroke="#a3a3a3" stroke-width="2.5" stroke-linejoin="round" />
  <line x1="82" y1="60" x2="68" y2="98" stroke="#ffffff" stroke-width="6" stroke-linecap="square" />
  <line x1="82" y1="60" x2="95" y2="96" stroke="#ffffff" stroke-width="6" stroke-linecap="square" />
  <line x1="74" y1="88" x2="92" y2="88" stroke="#ffffff" stroke-width="5" />
  <line x1="92" y1="96" x2="122" y2="96" stroke="#ffffff" stroke-width="6" stroke-linecap="square" />
  <line x1="108" y1="96" x2="108" y2="128" stroke="#ffffff" stroke-width="6" stroke-linecap="square" />
  <path d="M 125 68 A 52 52 0 1 1 54 134 A 46 46 0 1 0 125 68 Z" fill="#ffffff" />
</svg>
`)}`;
