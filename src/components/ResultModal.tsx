import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Stage } from '../types/game';
import { Star, Trophy, RotateCcw, ArrowRight, Map, Plus } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface ResultModalProps {
  isVictory: boolean;
  score: number;
  stage: Stage;
  rescuedCount: number;
  coins: number;
  onNextStage: () => void;
  onRetry: () => void;
  onOpenMap: () => void;
  onAddExtraMoves: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  isVictory,
  score,
  stage,
  rescuedCount,
  coins,
  onNextStage,
  onRetry,
  onOpenMap,
  onAddExtraMoves
}) => {
  const [star1, star2, star3] = stage.starScores;
  const starsEarned = score >= star3 ? 3 : score >= star2 ? 2 : score >= star1 ? 1 : (isVictory ? 1 : 0);

  useEffect(() => {
    if (isVictory) {
      sounds.playVictory();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      const timer = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 400);
      return () => clearTimeout(timer);
    } else {
      sounds.playDefeat();
    }
  }, [isVictory]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-sky-900 via-indigo-950 to-purple-950 border-4 border-cyan-400 p-6 text-center shadow-2xl flex flex-col items-center gap-4">
        {/* Header Ribbon Title */}
        <div
          className={`-mt-10 px-6 py-2 rounded-full border-2 border-white shadow-xl text-lg sm:text-xl font-black italic tracking-wide text-white uppercase ${
            isVictory
              ? 'bg-gradient-to-r from-emerald-500 via-green-400 to-teal-500'
              : 'bg-gradient-to-r from-rose-500 via-red-500 to-amber-600'
          }`}
        >
          {isVictory ? '🎉 스테이지 클리어!' : '💔 이동 횟수 소진'}
        </div>

        {/* Stars Animation (For Victory) */}
        {isVictory ? (
          <div className="flex items-center justify-center gap-2 my-1">
            {[1, 2, 3].map((starIdx) => (
              <div
                key={starIdx}
                className={`transform transition-all duration-500 ${
                  starsEarned >= starIdx
                    ? 'scale-110 text-yellow-300 fill-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]'
                    : 'text-slate-600 fill-slate-800 scale-90'
                }`}
              >
                <Star size={42} strokeWidth={2.5} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-4xl my-1 animate-bounce">😢</div>
        )}

        {/* Score & Mission Status */}
        <div className="w-full bg-slate-900/60 rounded-2xl border border-sky-400/30 p-3.5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-sky-200 font-semibold">최종 점수</span>
            <span className="text-yellow-300 font-black text-lg tabular-nums">
              {score.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm border-t border-slate-700/60 pt-2">
            <span className="text-sky-200 font-semibold">
              {stage.targetType === 'cage' ? '구출한 캔디' : '달성 목표'}
            </span>
            <span className="text-white font-extrabold tabular-nums">
              {rescuedCount} / {stage.targetCount}
            </span>
          </div>

          {isVictory && (
            <div className="flex items-center justify-between text-sm border-t border-slate-700/60 pt-2">
              <span className="text-amber-300 font-semibold">클리어 보상</span>
              <span className="text-yellow-300 font-black flex items-center gap-1">
                <span>+100</span>
                <span>🪙</span>
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5 mt-2">
          {isVictory ? (
            <>
              <button
                onClick={onNextStage}
                className="w-full py-3 bg-gradient-to-r from-emerald-400 to-green-600 hover:brightness-110 active:scale-98 text-white font-extrabold text-base rounded-2xl border border-green-200 shadow-lg shadow-green-500/40 flex items-center justify-center gap-2 transition-all"
              >
                <span>다음 스테이지</span>
                <ArrowRight size={18} />
              </button>

              <div className="flex gap-2">
                <button
                  onClick={onRetry}
                  className="flex-1 py-2.5 bg-sky-700/80 hover:bg-sky-600/90 active:scale-98 text-white font-bold text-sm rounded-xl border border-sky-300/40 flex items-center justify-center gap-1.5 transition-all"
                >
                  <RotateCcw size={16} />
                  <span>다시 하기</span>
                </button>

                <button
                  onClick={onOpenMap}
                  className="flex-1 py-2.5 bg-purple-700/80 hover:bg-purple-600/90 active:scale-98 text-white font-bold text-sm rounded-xl border border-purple-300/40 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Map size={16} />
                  <span>월드맵</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Extra Moves booster option */}
              <button
                onClick={onAddExtraMoves}
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-110 active:scale-98 text-amber-950 font-black text-base rounded-2xl border border-amber-200 shadow-lg shadow-amber-500/40 flex items-center justify-center gap-2 transition-all"
              >
                <Plus size={18} strokeWidth={3} />
                <span>+5회 추가 이동 (60🪙)</span>
              </button>

              <button
                onClick={onRetry}
                className="w-full py-2.5 bg-sky-700/80 hover:bg-sky-600/90 active:scale-98 text-white font-bold text-sm rounded-xl border border-sky-300/40 flex items-center justify-center gap-1.5 transition-all"
              >
                <RotateCcw size={16} />
                <span>스테이지 재도전</span>
              </button>

              <button
                onClick={onOpenMap}
                className="w-full py-2 bg-slate-800/80 hover:bg-slate-700/90 active:scale-98 text-slate-300 font-semibold text-xs rounded-xl transition-all"
              >
                월드맵으로 나가기
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
