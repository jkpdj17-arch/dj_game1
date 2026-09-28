import React from 'react';

/**
 * Shared SVG Gradients and Patterns for all Skin Themes
 * Defined ONCE at board level for maximum 60 FPS performance
 */
export const CandyDefs: React.FC = () => {
  return (
    <svg className="absolute w-0 h-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <defs>
        {/* =========================================
            1. CLASSIC THEME GRADIENTS
        ========================================= */}
        {/* Yellow */}
        <radialGradient id="rad-yellow" cx="38%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#FFFDE7" />
          <stop offset="35%" stopColor="#FFF176" />
          <stop offset="70%" stopColor="#FDD835" />
          <stop offset="100%" stopColor="#E65100" />
        </radialGradient>
        <linearGradient id="lin-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF176" />
          <stop offset="60%" stopColor="#FDD835" />
          <stop offset="100%" stopColor="#F57F17" />
        </linearGradient>

        {/* Red */}
        <radialGradient id="rad-red" cx="38%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#FFCDD2" />
          <stop offset="35%" stopColor="#FF5252" />
          <stop offset="70%" stopColor="#E53935" />
          <stop offset="100%" stopColor="#B71C1C" />
        </radialGradient>
        <linearGradient id="lin-red" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF5252" />
          <stop offset="60%" stopColor="#E53935" />
          <stop offset="100%" stopColor="#B71C1C" />
        </linearGradient>

        {/* Blue */}
        <radialGradient id="rad-blue" cx="38%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#E1F5FE" />
          <stop offset="35%" stopColor="#40C4FF" />
          <stop offset="70%" stopColor="#00B0FF" />
          <stop offset="100%" stopColor="#01579B" />
        </radialGradient>
        <linearGradient id="lin-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#40C4FF" />
          <stop offset="60%" stopColor="#00B0FF" />
          <stop offset="100%" stopColor="#01579B" />
        </linearGradient>

        {/* Orange */}
        <radialGradient id="rad-orange" cx="38%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#FFE0B2" />
          <stop offset="35%" stopColor="#FFA726" />
          <stop offset="70%" stopColor="#FB8C00" />
          <stop offset="100%" stopColor="#BF360C" />
        </radialGradient>
        <linearGradient id="lin-orange" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFA726" />
          <stop offset="60%" stopColor="#FB8C00" />
          <stop offset="100%" stopColor="#E65100" />
        </linearGradient>

        {/* Green */}
        <radialGradient id="rad-green" cx="38%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#E8F5E9" />
          <stop offset="35%" stopColor="#69F0AE" />
          <stop offset="70%" stopColor="#00E676" />
          <stop offset="100%" stopColor="#1B5E20" />
        </radialGradient>
        <linearGradient id="lin-green" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#69F0AE" />
          <stop offset="60%" stopColor="#00E676" />
          <stop offset="100%" stopColor="#1B5E20" />
        </linearGradient>

        {/* =========================================
            2. CRYSTAL JEWEL THEME GRADIENTS
        ========================================= */}
        <linearGradient id="cryst-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF9C3" />
          <stop offset="40%" stopColor="#FACC15" />
          <stop offset="75%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#854D0E" />
        </linearGradient>
        <linearGradient id="cryst-red" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE4E6" />
          <stop offset="40%" stopColor="#FB7185" />
          <stop offset="75%" stopColor="#E11D48" />
          <stop offset="100%" stopColor="#881337" />
        </linearGradient>
        <linearGradient id="cryst-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E0F2FE" />
          <stop offset="40%" stopColor="#38BDF8" />
          <stop offset="75%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#082F49" />
        </linearGradient>
        <linearGradient id="cryst-orange" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFEDD5" />
          <stop offset="40%" stopColor="#FB923C" />
          <stop offset="75%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#7C2D12" />
        </linearGradient>
        <linearGradient id="cryst-green" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DCFCE7" />
          <stop offset="40%" stopColor="#4ADE80" />
          <stop offset="75%" stopColor="#16A34A" />
          <stop offset="100%" stopColor="#14532D" />
        </linearGradient>

        {/* =========================================
            3. NEON ARCADE THEME GRADIENTS
        ========================================= */}
        <radialGradient id="neon-yellow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#18181B" />
        </radialGradient>
        <radialGradient id="neon-red" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FDA4AF" />
          <stop offset="50%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#18181B" />
        </radialGradient>
        <radialGradient id="neon-blue" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#BAE6FD" />
          <stop offset="50%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#18181B" />
        </radialGradient>
        <radialGradient id="neon-orange" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FED7AA" />
          <stop offset="50%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#18181B" />
        </radialGradient>
        <radialGradient id="neon-green" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#BBF7D0" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#18181B" />
        </radialGradient>

        {/* =========================================
            4. BAKERY MACARON THEME GRADIENTS
        ========================================= */}
        <radialGradient id="bake-yellow" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#CA8A04" />
        </radialGradient>
        <radialGradient id="bake-red" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor="#FCA5A5" />
          <stop offset="100%" stopColor="#DC2626" />
        </radialGradient>
        <radialGradient id="bake-blue" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor="#7DD3FC" />
          <stop offset="100%" stopColor="#0284C7" />
        </radialGradient>
        <radialGradient id="bake-orange" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor="#FDBA74" />
          <stop offset="100%" stopColor="#C2410C" />
        </radialGradient>
        <radialGradient id="bake-green" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor="#86EFAC" />
          <stop offset="100%" stopColor="#15803D" />
        </radialGradient>

        {/* Choco Sphere Gradient */}
        <radialGradient id="choco-spec" cx="35%" cy="30%" r="55%">
          <stop offset="0%" stopColor="#8D6E63" />
          <stop offset="60%" stopColor="#3E2723" />
          <stop offset="100%" stopColor="#1A0C08" />
        </radialGradient>

        {/* Striped patterns */}
        <pattern id="stripe-h" width="10" height="20" patternUnits="userSpaceOnUse">
          <line x1="0" y1="5" x2="10" y2="5" stroke="#FFFFFF" strokeWidth="4" opacity="0.9" />
          <line x1="0" y1="15" x2="10" y2="15" stroke="#FFFFFF" strokeWidth="4" opacity="0.9" />
        </pattern>
        <pattern id="stripe-v" width="20" height="10" patternUnits="userSpaceOnUse">
          <line x1="5" y1="0" x2="5" y2="10" stroke="#FFFFFF" strokeWidth="4" opacity="0.9" />
          <line x1="15" y1="0" x2="15" y2="10" stroke="#FFFFFF" strokeWidth="4" opacity="0.9" />
        </pattern>
      </defs>
    </svg>
  );
};
