import React from 'react';
import { CandyColor, CandySkinTheme, SpecialType } from '../types/game';

interface CandyIconProps {
  color: CandyColor;
  special: SpecialType;
  caged?: boolean;
  skinTheme?: CandySkinTheme;
  className?: string;
}

const strokeColors: Record<CandySkinTheme, Record<CandyColor, string>> = {
  classic: {
    yellow: '#D97706',
    red: '#B91C1C',
    blue: '#0284C7',
    orange: '#C2410C',
    green: '#15803D'
  },
  crystal: {
    yellow: '#A16207',
    red: '#9F1239',
    blue: '#0369A1',
    orange: '#9A3412',
    green: '#166534'
  },
  neon: {
    yellow: '#FACC15',
    red: '#FB7185',
    blue: '#22D3EE',
    orange: '#FB923C',
    green: '#4ADE80'
  },
  bakery: {
    yellow: '#CA8A04',
    red: '#DC2626',
    blue: '#0284C7',
    orange: '#EA580C',
    green: '#16A34A'
  }
};

const getFillUrl = (theme: CandySkinTheme, color: CandyColor): string => {
  if (theme === 'crystal') return `url(#cryst-${color})`;
  if (theme === 'neon') return `url(#neon-${color})`;
  if (theme === 'bakery') return `url(#bake-${color})`;
  return `url(#rad-${color})`;
};

export const CandyIcon: React.FC<CandyIconProps> = React.memo(({
  color,
  special,
  caged = false,
  skinTheme = 'classic',
  className = ''
}) => {
  const currentTheme = skinTheme || 'classic';
  const strokeColor = strokeColors[currentTheme]?.[color] || strokeColors.classic[color];
  const fillUrl = getFillUrl(currentTheme, color);

  return (
    <div className={`relative w-full h-full flex items-center justify-center pointer-events-none select-none ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full transition-transform duration-100"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* 0. 8+ MEGA BOMB SPECIAL */}
        {special === 'mega_bomb' ? (
          <g>
            {/* Outer Bomb Shell */}
            <circle cx="50" cy="54" r="39" fill="#09090B" stroke="#DC2626" strokeWidth="3" />
            <circle cx="50" cy="54" r="36" fill="url(#rad-red)" />
            {/* Inner Metallic Core */}
            <circle cx="50" cy="54" r="28" fill="#18181B" stroke="#F59E0B" strokeWidth="2.5" />
            {/* Bomb Fuse & Spark */}
            <path d="M50 15 Q54 5 62 8" stroke="#FBBF24" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <circle cx="62" cy="8" r="4.5" fill="#EF4444" className="animate-pulse" />
            <circle cx="62" cy="8" r="2.5" fill="#FEF08A" />
            <rect x="44" y="15" width="12" height="6" rx="2" fill="#71717A" stroke="#27272A" strokeWidth="1.5" />
            {/* Bold 8+ Badge Center */}
            <text
              x="50"
              y="61"
              textAnchor="middle"
              fill="#FEF08A"
              fontSize="20"
              fontWeight="900"
              letterSpacing="-1"
              stroke="#B91C1C"
              strokeWidth="1.5"
              className="drop-shadow"
            >
              8+
            </text>
            <ellipse cx="38" cy="36" rx="10" ry="5" fill="#FFFFFF" opacity="0.4" transform="rotate(-30 38 36)" />
          </g>
        ) : special === 'color_bomb' ? (
          /* 1. COLOR BOMB SPECIAL */
          <g>
            <circle cx="50" cy="50" r="41" fill="#21110A" stroke="#5D4037" strokeWidth="2.5" />
            <circle cx="50" cy="50" r="39" fill="url(#choco-spec)" />

            {/* Rainbow sprinkles */}
            <circle cx="34" cy="30" r="4.5" fill="#FF1744" />
            <circle cx="66" cy="32" r="4.5" fill="#00E676" />
            <circle cx="48" cy="22" r="4" fill="#FFEA00" />
            <circle cx="30" cy="62" r="4.5" fill="#2979FF" />
            <circle cx="66" cy="62" r="5" fill="#FF9100" />
            <circle cx="50" cy="72" r="4.5" fill="#E040FB" />
            <circle cx="48" cy="48" r="5.5" fill="#00E5FF" />
            <circle cx="28" cy="46" r="3.5" fill="#FF5252" />
            <circle cx="70" cy="46" r="3.5" fill="#FFD600" />

            <ellipse cx="38" cy="26" rx="13" ry="6" fill="#FFFFFF" opacity="0.35" transform="rotate(-25 38 26)" />
          </g>
        ) : special === 'fish' ? (
          /* 2. JELLY FISH SPECIAL */
          <g className="animate-fish">
            {/* Tail */}
            <path
              d="M22 50 L8 36 C16 46 16 54 8 64 Z"
              fill={fillUrl}
              stroke={strokeColor}
              strokeWidth="2"
            />
            {/* Body */}
            <ellipse
              cx="54"
              cy="50"
              rx="35"
              ry="26"
              fill={fillUrl}
              stroke={strokeColor}
              strokeWidth="2.5"
            />
            {/* Fins */}
            <path d="M46 24 Q60 14 70 26 Z" fill={strokeColor} opacity="0.8" />
            <path d="M48 76 Q60 86 68 74 Z" fill={strokeColor} opacity="0.8" />
            {/* Eye */}
            <circle cx="74" cy="44" r="6.5" fill="#FFFFFF" />
            <circle cx="76" cy="44" r="3.5" fill="#212121" />
            <circle cx="77" cy="42" r="1.5" fill="#FFFFFF" />
            {/* Scales & highlight */}
            <path d="M34 50 Q48 42 62 50" stroke="#FFFFFF" strokeWidth="2.2" fill="none" opacity="0.5" />
            <path d="M42 58 Q52 50 62 58" stroke="#FFFFFF" strokeWidth="2.2" fill="none" opacity="0.4" />
            <ellipse cx="50" cy="38" rx="14" ry="5.5" fill="#FFFFFF" opacity="0.5" />
          </g>
        ) : (
          /* 3. NORMAL CANDIES WITH DYNAMIC SKIN THEMES */
          <g>
            {color === 'yellow' ? (
              // Yellow Drop Shape
              <path
                d="M50 8 C50 8 13 42 13 67 C13 84 29 92 50 92 C71 92 87 84 87 67 C87 42 50 8 50 8 Z"
                fill={fillUrl}
                stroke={strokeColor}
                strokeWidth={currentTheme === 'neon' ? '3.5' : '2.5'}
              />
            ) : color === 'red' ? (
              // Red Jelly Bean
              <path
                d="M32 18 C52 12 78 18 86 34 C94 52 86 76 64 84 C42 92 18 84 15 64 C13 46 16 26 32 18 Z"
                fill={fillUrl}
                stroke={strokeColor}
                strokeWidth={currentTheme === 'neon' ? '3.5' : '2.5'}
              />
            ) : color === 'blue' ? (
              // Blue Diamond
              <polygon
                points="50,8 92,50 50,92 8,50"
                fill={fillUrl}
                stroke={strokeColor}
                strokeWidth={currentTheme === 'neon' ? '3.5' : '2.5'}
                strokeLinejoin="round"
              />
            ) : color === 'orange' ? (
              // Orange Oval
              <ellipse
                cx="50"
                cy="50"
                rx="42"
                ry="31"
                fill={fillUrl}
                stroke={strokeColor}
                strokeWidth={currentTheme === 'neon' ? '3.5' : '2.5'}
              />
            ) : (
              // Green Cushion Square
              <rect
                x="10"
                y="10"
                width="80"
                height="80"
                rx="20"
                fill={fillUrl}
                stroke={strokeColor}
                strokeWidth={currentTheme === 'neon' ? '3.5' : '2.5'}
              />
            )}

            {/* Crystal Gemstone Facet Lines (Crystal Theme only) */}
            {currentTheme === 'crystal' && (
              <g stroke="#FFFFFF" strokeWidth="1.4" opacity="0.65" strokeLinecap="round">
                <line x1="50" y1="16" x2="32" y2="46" />
                <line x1="50" y1="16" x2="68" y2="46" />
                <line x1="32" y1="46" x2="68" y2="46" />
                <line x1="32" y1="46" x2="50" y2="82" />
                <line x1="68" y1="46" x2="50" y2="82" />
              </g>
            )}

            {/* Bakery Macaron Cream Middle Layer (Bakery Theme only) */}
            {currentTheme === 'bakery' && (
              <g>
                <ellipse cx="50" cy="50" rx="36" ry="6" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1" />
                <ellipse cx="44" cy="36" rx="4" ry="2" fill="#FFFFFF" opacity="0.7" />
              </g>
            )}

            {/* Gloss specular highlight */}
            {currentTheme !== 'neon' && (
              <ellipse
                cx={color === 'yellow' ? 44 : 40}
                cy={color === 'yellow' ? 44 : 36}
                rx={color === 'yellow' ? 13 : 15}
                ry={color === 'yellow' ? 7.5 : 9}
                fill="#FFFFFF"
                opacity={currentTheme === 'crystal' ? 0.7 : 0.48}
                transform={color === 'yellow' ? 'rotate(-20 44 44)' : 'rotate(-25 40 36)'}
              />
            )}

            {/* Striped Overlays */}
            {special === 'striped_h' && (
              <g opacity="0.9">
                <line x1="12" y1="36" x2="88" y2="36" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
                <line x1="10" y1="50" x2="90" y2="50" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
                <line x1="12" y1="64" x2="88" y2="64" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
              </g>
            )}
            {special === 'striped_v' && (
              <g opacity="0.9">
                <line x1="36" y1="12" x2="36" y2="88" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
                <line x1="50" y1="10" x2="50" y2="90" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
                <line x1="64" y1="12" x2="64" y2="88" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
              </g>
            )}

            {/* Wrapped Candy Foil Knots */}
            {special === 'wrapped' && (
              <g>
                <circle cx="50" cy="50" r="36" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeDasharray="5 4" opacity="0.9" />
                <path d="M12 18 L28 32 L16 38 Z" fill="#FFFFFF" opacity="0.95" />
                <path d="M88 18 L72 32 L84 38 Z" fill="#FFFFFF" opacity="0.95" />
                <path d="M12 82 L28 68 L16 62 Z" fill="#FFFFFF" opacity="0.95" />
                <path d="M88 82 L72 68 L84 62 Z" fill="#FFFFFF" opacity="0.95" />
              </g>
            )}
          </g>
        )}

        {/* 4. IRON CAGE OVERLAY */}
        {caged && (
          <g>
            <rect
              x="7"
              y="7"
              width="86"
              height="86"
              rx="9"
              fill="rgba(0, 0, 0, 0.12)"
              stroke="#0f172a"
              strokeWidth="4"
            />
            <line x1="9" y1="9" x2="91" y2="91" stroke="#0f172a" strokeWidth="3.8" />
            <line x1="91" y1="9" x2="9" y2="91" stroke="#0f172a" strokeWidth="3.8" />

            <circle cx="50" cy="50" r="5.5" fill="#334155" stroke="#0f172a" strokeWidth="2" />
            <circle cx="48" cy="48" r="1.6" fill="#cbd5e1" />

            <circle cx="14" cy="14" r="2.8" fill="#334155" />
            <circle cx="86" cy="14" r="2.8" fill="#334155" />
            <circle cx="14" cy="86" r="2.8" fill="#334155" />
            <circle cx="86" cy="86" r="2.8" fill="#334155" />
          </g>
        )}
      </svg>
    </div>
  );
});
