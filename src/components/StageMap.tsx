import React, { useState } from 'react';
import { STAGES } from '../constants/stages';
import { Stage, UserProgress } from '../types/game';
import { Play, Star, Lock, Volume2, VolumeX, ArrowLeft, Trophy } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface StageMapProps {
  progress: UserProgress;
  currentStageId: number;
  onSelectStage: (stage: Stage) => void;
  onOpenShop?: () => void;
  onClose: () => void;
}

export const StageMap: React.FC<StageMapProps> = ({
  progress,
  currentStageId,
  onSelectStage,
  onOpenShop,
  onClose
}) => {
  const [selectedStage, setSelectedStage] = useState<Stage>(
    STAGES.find((s) => s.id === currentStageId) || STAGES[0]
  );
  const [isMuted, setIsMuted] = useState(sounds.getMuted());

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white overflow-hidden select-none">
      {/* Background Graphic */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/candy_world_map_bg_1790582161386.jpg"
          alt="Candy World Map"
          className="w-full h-full object-cover opacity-85 filter brightness-95"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Graceful fallback to rich candy gradient if image is absent
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sky-950/70 via-transparent to-purple-950/85" />
      </div>

      {/* Top Header Bar */}
      <div className="relative z-10 w-full px-4 py-3 flex items-center justify-between bg-sky-950/80 backdrop-blur-md border-b-2 border-sky-400/40 shadow-lg">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 active:scale-95 rounded-full border border-white/40 text-sm font-bold text-white transition-all"
        >
          <ArrowLeft size={16} />
          <span>게임으로 복귀</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-black italic tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300 candy-text-3d">
          캔디 월드맵
        </h1>

        <div className="flex items-center gap-2.5">
          {/* Shop button */}
          {onOpenShop && (
            <button
              onClick={onOpenShop}
              className="p-1.5 bg-gradient-to-b from-amber-400 to-yellow-500 hover:brightness-110 active:scale-95 rounded-full border border-yellow-200 text-amber-950 shadow transition-all flex items-center justify-center text-sm"
              title="상점 열기"
            >
              🛍️
            </button>
          )}

          {/* Coins Counter */}
          <div className="flex items-center gap-1.5 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-400/50 shadow">
            <span className="text-base">🪙</span>
            <span className="text-amber-300 font-extrabold text-sm tabular-nums">
              {progress.coins.toLocaleString()}
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full border border-white/40 text-white transition-all"
            title="소리 설정"
          >
            {isMuted ? <VolumeX size={18} className="text-red-400" /> : <Volume2 size={18} className="text-green-400" />}
          </button>
        </div>
      </div>

      {/* Map Content & Stage Path */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-md flex flex-col gap-3 py-4">
          {STAGES.map((stg) => {
            const isUnlocked = stg.id <= progress.unlockedStage;
            const stars = progress.stageStars[stg.id] || 0;
            const isSelected = selectedStage.id === stg.id;
            const isCurrent = currentStageId === stg.id;

            return (
              <div
                key={stg.id}
                onClick={() => isUnlocked && setSelectedStage(stg)}
                className={`relative rounded-2xl p-4 transition-all duration-200 border-2 cursor-pointer flex items-center justify-between ${
                  !isUnlocked
                    ? 'bg-slate-900/70 border-slate-700/50 opacity-60 cursor-not-allowed'
                    : isSelected
                    ? 'bg-gradient-to-r from-sky-600/90 to-blue-700/90 border-yellow-300 scale-102 shadow-xl shadow-blue-500/30'
                    : 'bg-sky-950/80 hover:bg-sky-900/80 border-sky-400/40 hover:scale-101 shadow-md'
                }`}
              >
                {/* Left: Stage Icon & Number */}
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl border-2 shadow-md ${
                      !isUnlocked
                        ? 'bg-slate-800 border-slate-600 text-slate-500'
                        : isCurrent
                        ? 'bg-gradient-to-b from-amber-300 to-yellow-500 text-yellow-950 border-white animate-pulse'
                        : 'bg-gradient-to-b from-cyan-400 to-blue-600 text-white border-cyan-200'
                    }`}
                  >
                    {!isUnlocked ? <Lock size={18} /> : stg.id}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base sm:text-lg text-white">
                        {stg.title}
                      </span>
                      {stg.id === 3 && (
                        <span className="bg-pink-500/80 text-[10px] font-black px-2 py-0.5 rounded-full border border-pink-300">
                          대표 미션
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-sky-200 font-medium">
                      {stg.subtitle}
                    </span>
                  </div>
                </div>

                {/* Right: Stars Earned & Target */}
                <div className="flex flex-col items-end gap-1">
                  {isUnlocked ? (
                    <>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3].map((starNum) => (
                          <Star
                            key={starNum}
                            size={16}
                            className={
                              stars >= starNum
                                ? 'fill-yellow-400 text-yellow-300 filter drop-shadow'
                                : 'text-slate-600 fill-slate-800'
                            }
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-yellow-200/90 font-bold tabular-nums">
                        최고: {(progress.stageScores[stg.id] || 0).toLocaleString()}점
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 font-semibold">
                      잠김
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Stage Detail Bottom Drawer */}
      {selectedStage && (
        <div className="relative z-20 w-full bg-slate-900/95 backdrop-blur-xl border-t-2 border-cyan-400/50 p-4 shadow-2xl">
          <div className="max-w-md mx-auto flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>{selectedStage.title}: {selectedStage.subtitle}</span>
                </h3>
                <p className="text-xs text-sky-200 mt-0.5">
                  {selectedStage.description}
                </p>
              </div>

              {/* Goal Pill */}
              <div className="flex flex-col items-end bg-blue-950/70 border border-blue-400/40 px-3 py-1.5 rounded-xl">
                <span className="text-[10px] text-sky-300 font-bold">목표</span>
                <span className="text-sm font-extrabold text-amber-300">
                  {selectedStage.targetType === 'cage' && `철망 ${selectedStage.targetCount}개 구출`}
                  {selectedStage.targetType === 'fish' && `물고기 ${selectedStage.targetCount}마리 소환`}
                  {selectedStage.targetType === 'score' && `${selectedStage.targetCount.toLocaleString()}점 달성`}
                </span>
              </div>
            </div>

            {/* Play Button */}
            <button
              onClick={() => onSelectStage(selectedStage)}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 hover:brightness-110 active:scale-98 text-white font-black text-lg rounded-2xl border-2 border-green-200 shadow-lg shadow-green-500/40 flex items-center justify-center gap-2 transition-all"
            >
              <Play size={20} className="fill-white" />
              <span>스테이지 플레이 시작!</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
