import React from 'react';
import { BOOSTERS } from '../constants/boosters';
import { BoosterType } from '../types/game';
import { Plus, ShoppingBag } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface BoosterBarProps {
  boosters: Record<BoosterType, number>;
  activeBooster: BoosterType | null;
  coins: number;
  onSelectBooster: (type: BoosterType | null) => void;
  onBuyBooster: (type: BoosterType) => void;
  onOpenShop?: () => void;
}

export const BoosterBar: React.FC<BoosterBarProps> = ({
  boosters,
  activeBooster,
  coins,
  onSelectBooster,
  onBuyBooster,
  onOpenShop
}) => {
  return (
    <div className="w-full max-w-md mx-auto px-2 sm:px-3 py-2 z-20 select-none">
      <div className="bg-sky-950/85 backdrop-blur-md rounded-2xl border-2 border-sky-400/50 p-2 shadow-xl flex items-center justify-around gap-1">
        {BOOSTERS.map((booster) => {
          const count = boosters[booster.id] || 0;
          const isActive = activeBooster === booster.id;

          return (
            <div key={booster.id} className="relative flex flex-col items-center">
              <button
                onClick={() => {
                  if (count > 0) {
                    sounds.playSwap();
                    onSelectBooster(isActive ? null : booster.id);
                  } else {
                    if (onOpenShop) {
                      onOpenShop();
                    } else {
                      onBuyBooster(booster.id);
                    }
                  }
                }}
                className={`w-13 h-13 sm:w-15 sm:h-15 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 relative ${
                  isActive
                    ? 'bg-gradient-to-b from-amber-300 to-yellow-500 scale-105 shadow-lg shadow-yellow-500/50 border-2 border-white'
                    : count > 0
                    ? 'bg-gradient-to-b from-sky-500 to-blue-700 hover:brightness-110 active:scale-95 border-2 border-cyan-300/60 shadow-md'
                    : 'bg-slate-800/80 border border-slate-600/50 opacity-75 hover:opacity-100'
                }`}
                title={`${booster.name}: ${booster.desc}`}
              >
                <span className="text-2xl sm:text-3xl filter drop-shadow">
                  {booster.icon}
                </span>

                {/* Badge Count or Buy Plus */}
                {count > 0 ? (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border border-white shadow">
                    {count}
                  </span>
                ) : (
                  <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[9px] font-black p-0.5 rounded-full border border-white shadow flex items-center justify-center w-4.5 h-4.5">
                    <Plus size={11} strokeWidth={3} />
                  </span>
                )}
              </button>

              <span className="text-[10px] sm:text-[11px] font-bold text-sky-200 mt-1 truncate max-w-[58px] text-center">
                {booster.name}
              </span>
            </div>
          );
        })}

        {/* Dedicated Shop Shortcut in BoosterBar */}
        {onOpenShop && (
          <div className="relative flex flex-col items-center">
            <button
              onClick={onOpenShop}
              className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 bg-gradient-to-b from-amber-400 via-orange-500 to-amber-600 hover:brightness-110 active:scale-95 border-2 border-amber-200 shadow-md text-white"
              title="스킨 & 아이템 상점"
            >
              <span className="text-2xl">🛍️</span>
            </button>
            <span className="text-[10px] sm:text-[11px] font-bold text-amber-300 mt-1 text-center">
              상점
            </span>
          </div>
        )}
      </div>

      {/* Active Booster Prompt notification */}
      {activeBooster && (
        <div className="mt-1.5 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400 text-amber-950 font-extrabold text-xs sm:text-sm rounded-full shadow-lg border border-yellow-200 animate-bounce">
            <span>
              {activeBooster === 'hammer' && '🔨 부술 캔디나 감옥을 터치하세요!'}
              {activeBooster === 'switch' && '👆 맞바꿀 두 캔디를 차례로 터치하세요!'}
              {activeBooster === 'bomb' && '💣 컬러밤이 보드에 생성됩니다!'}
              {activeBooster === 'fish_summon' && '🐟 젤리 물고기가 출격합니다!'}
            </span>
            <button
              onClick={() => onSelectBooster(null)}
              className="ml-1 bg-amber-950/20 hover:bg-amber-950/30 text-amber-950 px-1.5 py-0.5 rounded-full text-xs font-bold"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
