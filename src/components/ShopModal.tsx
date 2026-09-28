import React, { useState } from 'react';
import { BoardSkinTheme, BoosterType, CandySkinTheme, UserProgress } from '../types/game';
import { CANDY_SKINS, BOARD_SKINS, ITEM_BUNDLES, ItemBundle } from '../constants/shop';
import { X, Sparkles, Check, ShoppingBag, Gift, Zap, Palette, Plus } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface ShopModalProps {
  progress: UserProgress;
  onBuySkin: (type: 'candy' | 'board', key: string, cost: number) => void;
  onEquipSkin: (type: 'candy' | 'board', key: string) => void;
  onBuyBundle: (bundle: ItemBundle) => void;
  onClaimDailyReward: () => void;
  canClaimDaily: boolean;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  progress,
  onBuySkin,
  onEquipSkin,
  onBuyBundle,
  onClaimDailyReward,
  canClaimDaily,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'skins' | 'items' | 'bonus'>('skins');
  const [skinSubTab, setSkinSubTab] = useState<'candy' | 'board'>('candy');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg h-[90vh] max-h-[640px] rounded-3xl bg-gradient-to-b from-sky-950 via-indigo-950 to-purple-950 border-4 border-cyan-400 shadow-2xl flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="w-full px-4 py-3 flex items-center justify-between border-b-2 border-cyan-400/30 bg-sky-900/60 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛍️</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black italic tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300 candy-text-3d">
                캔디 왕국 상점
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Coins Balance */}
            <div className="flex items-center gap-1.5 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-400/50 shadow">
              <span className="text-base">🪙</span>
              <span className="text-yellow-300 font-black text-sm sm:text-base tabular-nums">
                {progress.coins.toLocaleString()}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-full transition-all border border-white/30"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-around bg-sky-950/90 border-b border-sky-400/20 p-1.5">
          <button
            onClick={() => setActiveTab('skins')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'skins'
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/30'
                : 'text-sky-300 hover:text-white'
            }`}
          >
            <Palette size={16} />
            <span>스킨 숍</span>
          </button>

          <button
            onClick={() => setActiveTab('items')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'items'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/30'
                : 'text-sky-300 hover:text-white'
            }`}
          >
            <Zap size={16} />
            <span>부스터 아이템</span>
          </button>

          <button
            onClick={() => setActiveTab('bonus')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 transition-all relative ${
              activeTab === 'bonus'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30'
                : 'text-sky-300 hover:text-white'
            }`}
          >
            <Gift size={16} />
            <span>무료 선물</span>
            {canClaimDaily && (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute top-1 right-3 animate-ping" />
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {/* TAB 1: SKINS */}
          {activeTab === 'skins' && (
            <div className="flex flex-col gap-3">
              {/* Sub-tabs for Candy vs Board Skins */}
              <div className="flex gap-2 p-1 bg-slate-900/60 rounded-xl border border-sky-400/20">
                <button
                  onClick={() => setSkinSubTab('candy')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    skinSubTab === 'candy'
                      ? 'bg-sky-600 text-white shadow'
                      : 'text-sky-300 hover:text-white'
                  }`}
                >
                  🍬 캔디 스킨 ({CANDY_SKINS.length})
                </button>
                <button
                  onClick={() => setSkinSubTab('board')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    skinSubTab === 'board'
                      ? 'bg-sky-600 text-white shadow'
                      : 'text-sky-300 hover:text-white'
                  }`}
                >
                  🏰 보드 테마 ({BOARD_SKINS.length})
                </button>
              </div>

              {/* Candy Skins List */}
              {skinSubTab === 'candy' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CANDY_SKINS.map((skin) => {
                    const isUnlocked = progress.unlockedCandySkins.includes(skin.key as CandySkinTheme);
                    const isEquipped = progress.equippedCandySkin === skin.key;
                    const canAfford = progress.coins >= skin.cost;

                    return (
                      <div
                        key={skin.id}
                        className={`rounded-2xl p-3 border-2 flex flex-col justify-between transition-all ${
                          isEquipped
                            ? 'bg-sky-900/90 border-yellow-300 shadow-lg shadow-yellow-500/20'
                            : isUnlocked
                            ? 'bg-slate-900/80 border-cyan-400/40 hover:border-cyan-300'
                            : 'bg-slate-950/70 border-slate-700/60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl">{skin.previewIcon}</span>
                            {/* Color preview dots */}
                            <div className="flex gap-1">
                              {skin.previewColors.map((color, idx) => (
                                <span
                                  key={idx}
                                  className="w-3.5 h-3.5 rounded-full border border-white/60 shadow-sm"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>

                          <h4 className="font-extrabold text-sm text-white mt-1.5">
                            {skin.name}
                          </h4>
                          <p className="text-[11px] text-sky-200/80 mt-0.5 line-clamp-2 leading-tight">
                            {skin.desc}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                          {isEquipped ? (
                            <span className="w-full py-1.5 bg-emerald-600/90 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1 border border-emerald-300/40">
                              <Check size={14} strokeWidth={3} />
                              <span>장착 중</span>
                            </span>
                          ) : isUnlocked ? (
                            <button
                              onClick={() => {
                                sounds.playSpecialCreate();
                                onEquipSkin('candy', skin.key);
                              }}
                              className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 active:scale-98 text-white text-xs font-black rounded-xl transition-all border border-cyan-300/40"
                            >
                              장착하기
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (canAfford) {
                                  sounds.playSpecialCreate();
                                  onBuySkin('candy', skin.key, skin.cost);
                                } else {
                                  sounds.playInvalid();
                                }
                              }}
                              className={`w-full py-1.5 text-xs font-black rounded-xl flex items-center justify-center gap-1 transition-all border ${
                                canAfford
                                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 active:scale-98 text-yellow-950 border-yellow-200 shadow-md'
                                  : 'bg-slate-800 text-slate-400 border-slate-700 cursor-not-allowed'
                              }`}
                            >
                              <span>{skin.cost.toLocaleString()}</span>
                              <span>🪙 구매</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Board Skins List */}
              {skinSubTab === 'board' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {BOARD_SKINS.map((skin) => {
                    const isUnlocked = progress.unlockedBoardSkins.includes(skin.key as BoardSkinTheme);
                    const isEquipped = progress.equippedBoardSkin === skin.key;
                    const canAfford = progress.coins >= skin.cost;

                    return (
                      <div
                        key={skin.id}
                        className={`rounded-2xl p-3 border-2 flex flex-col justify-between transition-all ${
                          isEquipped
                            ? 'bg-sky-900/90 border-yellow-300 shadow-lg shadow-yellow-500/20'
                            : isUnlocked
                            ? 'bg-slate-900/80 border-cyan-400/40 hover:border-cyan-300'
                            : 'bg-slate-950/70 border-slate-700/60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl">{skin.previewIcon}</span>
                            <div className="flex gap-1">
                              {skin.previewColors.map((color, idx) => (
                                <span
                                  key={idx}
                                  className="w-3.5 h-3.5 rounded-full border border-white/60 shadow-sm"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>

                          <h4 className="font-extrabold text-sm text-white mt-1.5">
                            {skin.name}
                          </h4>
                          <p className="text-[11px] text-sky-200/80 mt-0.5 line-clamp-2 leading-tight">
                            {skin.desc}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                          {isEquipped ? (
                            <span className="w-full py-1.5 bg-emerald-600/90 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1 border border-emerald-300/40">
                              <Check size={14} strokeWidth={3} />
                              <span>장착 중</span>
                            </span>
                          ) : isUnlocked ? (
                            <button
                              onClick={() => {
                                sounds.playSpecialCreate();
                                onEquipSkin('board', skin.key);
                              }}
                              className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 active:scale-98 text-white text-xs font-black rounded-xl transition-all border border-cyan-300/40"
                            >
                              장착하기
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (canAfford) {
                                  sounds.playSpecialCreate();
                                  onBuySkin('board', skin.key, skin.cost);
                                } else {
                                  sounds.playInvalid();
                                }
                              }}
                              className={`w-full py-1.5 text-xs font-black rounded-xl flex items-center justify-center gap-1 transition-all border ${
                                canAfford
                                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 active:scale-98 text-yellow-950 border-yellow-200 shadow-md'
                                  : 'bg-slate-800 text-slate-400 border-slate-700 cursor-not-allowed'
                              }`}
                            >
                              <span>{skin.cost.toLocaleString()}</span>
                              <span>🪙 구매</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ITEMS & BOOSTERS */}
          {activeTab === 'items' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ITEM_BUNDLES.map((bundle) => {
                const owned = progress.boosters[bundle.type] || 0;
                const canAfford = progress.coins >= bundle.cost;

                return (
                  <div
                    key={bundle.id}
                    className="rounded-2xl p-3 bg-slate-900/80 border-2 border-sky-400/40 flex flex-col justify-between hover:border-sky-300 transition-all shadow-md relative"
                  >
                    {bundle.discountBadge && (
                      <span className="absolute -top-2 -right-1 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-white shadow">
                        {bundle.discountBadge}
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl">{bundle.icon}</span>
                        <span className="bg-sky-950/80 text-sky-200 text-xs font-bold px-2 py-0.5 rounded-full border border-sky-400/30">
                          보유: {owned}개
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm text-white mt-1.5">
                        {bundle.name}
                      </h4>
                      <p className="text-[11px] text-sky-200/80 mt-0.5 leading-tight">
                        {bundle.desc}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/10">
                      <button
                        onClick={() => {
                          if (canAfford) {
                            sounds.playSpecialCreate();
                            onBuyBundle(bundle);
                          } else {
                            sounds.playInvalid();
                          }
                        }}
                        className={`w-full py-2 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-all border ${
                          canAfford
                            ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:brightness-110 active:scale-98 text-amber-950 border-amber-200 shadow-md'
                            : 'bg-slate-800 text-slate-400 border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        <span>{bundle.cost.toLocaleString()}</span>
                        <span>🪙 구매 (+{bundle.count}개)</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: FREE BONUS GIFTS */}
          {activeTab === 'bonus' && (
            <div className="flex flex-col gap-3">
              {/* Daily Free Coins */}
              <div className="rounded-2xl p-4 bg-gradient-to-r from-emerald-900/80 to-teal-950/80 border-2 border-emerald-400/50 shadow-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-4xl animate-bounce">🎁</div>
                  <div>
                    <h4 className="font-black text-white text-base">
                      일일 무료 출석 선물
                    </h4>
                    <p className="text-xs text-emerald-200 mt-0.5">
                      매일 무료로 지급되는 특별 보너스 코인!
                    </p>
                    <span className="text-sm font-extrabold text-yellow-300 mt-1 inline-block">
                      +250 🪙
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (canClaimDaily) {
                      sounds.playVictory();
                      onClaimDailyReward();
                    } else {
                      sounds.playInvalid();
                    }
                  }}
                  className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm border transition-all ${
                    canClaimDaily
                      ? 'bg-gradient-to-r from-emerald-400 to-green-500 hover:brightness-110 active:scale-98 text-white border-green-200 shadow-md shadow-green-500/30'
                      : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                  }`}
                >
                  {canClaimDaily ? '선물 받기!' : '수령 완료'}
                </button>
              </div>

              {/* Bonus Info Card */}
              <div className="rounded-2xl p-3.5 bg-slate-900/60 border border-sky-400/20 text-center">
                <p className="text-xs text-sky-200 font-medium">
                  💡 스테이지를 3성으로 클리어하면 추가로 대량의 보너스 코인을 획득할 수 있습니다!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
