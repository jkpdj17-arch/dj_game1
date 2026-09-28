import React, { useState } from 'react';
import { Volume2, VolumeX, Map, RotateCcw, Pause } from 'lucide-react';
import { Stage } from '../types/game';
import { sounds } from '../utils/soundEffects';

interface HeaderBarProps {
  stage: Stage;
  score: number;
  movesLeft: number;
  rescuedTargetCount: number;
  onOpenMap: () => void;
  onOpenShop: () => void;
  onRestart: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  stage,
  score,
  movesLeft,
  rescuedTargetCount,
  onOpenMap,
  onOpenShop,
  onRestart
}) => {
  const [isMuted, setIsMuted] = useState(sounds.getMuted());
  const [showMenu, setShowMenu] = useState(false);

  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  // Calculate star progress
  const [star1, star2, star3] = stage.starScores;
  const maxScore = star3 * 1.1;
  const progressPercent = Math.min(100, (score / maxScore) * 100);

  const earnedStars = score >= star3 ? 3 : score >= star2 ? 2 : score >= star1 ? 1 : 0;

  return (
    <div className="w-full relative z-30 select-none">
      {/* 3D Cyan Header Bar (Authentic styling matching the uploaded screenshot) */}
      <div 
        className="w-full px-3 py-2 flex items-center justify-between text-white border-b-4 border-cyan-600 shadow-lg"
        style={{
          background: 'linear-gradient(180deg, #53d2fc 0%, #29b6f6 45%, #0288d1 100%)',
          textShadow: '0 2px 3px rgba(0,0,0,0.4)'
        }}
      >
        {/* Left: 점수 and Star Gauge */}
        <div className="flex flex-col items-start min-w-[100px] sm:min-w-[140px]">
          <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base tracking-wide">
            <span className="text-white/95">점수:</span>
            <span className="text-yellow-200 tabular-nums font-extrabold text-base sm:text-lg">
              {score.toLocaleString()}
            </span>
          </div>

          {/* Star Progress Bar */}
          <div className="relative w-28 sm:w-36 h-3.5 bg-blue-900/60 rounded-full border border-blue-300/40 p-0.5 mt-0.5 shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progressPercent}%`,
                background: 'linear-gradient(90deg, #ec4899 0%, #f43f5e 100%)',
                boxShadow: '0 0 8px rgba(244, 63, 94, 0.7)'
              }}
            />
            {/* 3 Star markers along the bar */}
            <div className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
              <span className={`text-xs transition-transform ${earnedStars >= 1 ? 'scale-125 text-yellow-300 drop-shadow' : 'text-gray-400 opacity-60'}`}>
                ★
              </span>
              <span className={`text-xs transition-transform ${earnedStars >= 2 ? 'scale-125 text-yellow-300 drop-shadow' : 'text-gray-400 opacity-60'}`}>
                ★
              </span>
              <span className={`text-xs transition-transform ${earnedStars >= 3 ? 'scale-125 text-yellow-300 drop-shadow' : 'text-gray-400 opacity-60'}`}>
                ★
              </span>
            </div>
          </div>
        </div>

        {/* Center: Moves Counter Badge (Large 3D '25' like screenshot) */}
        <div className="flex items-center justify-center -my-1">
          <div className="flex items-center gap-1.5 bg-gradient-to-b from-sky-300 to-sky-600 px-3.5 py-1 rounded-full border-2 border-white shadow-md transform hover:scale-105 transition-transform">
            {/* Swap Arrows icon */}
            <span className="text-white text-base font-bold animate-pulse">
              ⇄
            </span>
            <span className="text-white text-2xl sm:text-3xl font-black italic tracking-wider drop-shadow-md">
              {movesLeft}
            </span>
          </div>
        </div>

        {/* Right: Mission Target (0/8 with caged candy icon) & Menu button */}
        <div className="flex items-center gap-2">
          {/* Mission Capsule */}
          <div className="flex items-center gap-1.5 bg-gradient-to-b from-sky-400/80 to-blue-600/90 px-2.5 py-1 rounded-full border border-white/60 shadow">
            {stage.targetType === 'cage' ? (
              <span className="text-base filter drop-shadow">🔒🍬</span>
            ) : stage.targetType === 'fish' ? (
              <span className="text-base filter drop-shadow animate-fish">🐟</span>
            ) : (
              <span className="text-base filter drop-shadow">🎯</span>
            )}
            <span className="text-white font-black text-sm sm:text-base tabular-nums italic drop-shadow">
              {rescuedTargetCount}/{stage.targetCount}
            </span>
          </div>

          {/* Shop button */}
          <button
            onClick={onOpenShop}
            className="p-1.5 bg-gradient-to-b from-amber-400 to-yellow-500 hover:brightness-110 active:scale-95 rounded-full border border-yellow-200 text-amber-950 shadow transition-all flex items-center justify-center text-sm"
            title="상점 열기"
          >
            🛍️
          </button>

          {/* Quick Menu Toggle */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full border border-white/40 active:scale-95 transition-all text-white"
            title="메뉴"
          >
            <Pause size={17} />
          </button>
        </div>
      </div>

      {/* Dropdown Pause/Settings Menu */}
      {showMenu && (
        <div className="absolute top-14 right-3 bg-indigo-950/95 backdrop-blur-md border-2 border-cyan-400/60 rounded-2xl p-3 shadow-2xl z-50 flex flex-col gap-2 min-w-[170px] animate-in fade-in zoom-in-95 duration-150">
          <button
            onClick={toggleSound}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            {isMuted ? <VolumeX size={18} className="text-red-400" /> : <Volume2 size={18} className="text-green-400" />}
            <span>{isMuted ? '소리 켜기' : '소리 끄기'}</span>
          </button>

          <button
            onClick={() => {
              setShowMenu(false);
              onOpenShop();
            }}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <span className="text-base">🛍️</span>
            <span>아이템 & 스킨 상점</span>
          </button>

          <button
            onClick={() => {
              setShowMenu(false);
              onRestart();
            }}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <RotateCcw size={18} className="text-amber-400" />
            <span>스테이지 재시작</span>
          </button>

          <button
            onClick={() => {
              setShowMenu(false);
              onOpenMap();
            }}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <Map size={18} className="text-cyan-400" />
            <span>스테이지 맵</span>
          </button>
        </div>
      )}
    </div>
  );
};
