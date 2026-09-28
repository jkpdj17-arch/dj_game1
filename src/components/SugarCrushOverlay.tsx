import React from 'react';

interface SugarCrushOverlayProps {
  active: boolean;
}

export const SugarCrushOverlay: React.FC<SugarCrushOverlayProps> = ({ active }) => {
  if (!active) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center select-none animate-in zoom-in-50 duration-300">
      <div className="transform -rotate-6 bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-400 p-1.5 rounded-3xl shadow-[0_0_50px_rgba(236,72,153,0.8)] border-4 border-white">
        <div className="px-8 py-4 bg-purple-950/90 rounded-2xl flex flex-col items-center">
          <span className="text-3xl sm:text-5xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-pink-300 to-white candy-text-3d animate-pulse">
            SUGAR CRUSH!
          </span>
          <span className="text-xs sm:text-sm font-bold text-yellow-200 mt-1">
            남은 이동 횟수 보너스 정산 중!
          </span>
        </div>
      </div>
    </div>
  );
};
