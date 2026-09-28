import React, { useRef, memo, useCallback } from 'react';
import { BoardSkinTheme, BoosterType, CandySkinTheme, FloatingText, FlyingFish, Particle, Tile } from '../types/game';
import { BOARD_SIZE } from '../constants/stages';
import { CandyIcon } from './CandyIcon';
import { CandyDefs } from './CandyDefs';

interface GameBoardProps {
  board: Tile[][];
  selectedTile: { r: number; c: number } | null;
  activeBooster: BoosterType | null;
  hintTiles: [number, number][] | null;
  flyingFishes: FlyingFish[];
  floatingTexts: FloatingText[];
  particles: Particle[];
  candySkin?: CandySkinTheme;
  boardSkin?: BoardSkinTheme;
  onTileClick: (r: number, c: number) => void;
  onSwipe: (fromR: number, fromC: number, toR: number, toC: number) => void;
}

// Memoized individual cell to prevent lag and ensure perfect 100% containment
const TileCell: React.FC<{
  tile: Tile;
  r: number;
  c: number;
  isSelected: boolean;
  isNeighbor: boolean;
  isHinted: boolean;
  activeBooster: BoosterType | null;
  candySkin?: CandySkinTheme;
  onCellTouchStart: (r: number, c: number, e: React.TouchEvent) => void;
  onCellTouchMove: (e: React.TouchEvent) => void;
  onCellTouchEnd: (r: number, c: number) => void;
  onCellMouseDown: (r: number, c: number, e: React.MouseEvent) => void;
  onCellMouseUp: (r: number, c: number) => void;
}> = memo(({
  tile,
  r,
  c,
  isSelected,
  isNeighbor,
  isHinted,
  activeBooster,
  candySkin,
  onCellTouchStart,
  onCellTouchMove,
  onCellTouchEnd,
  onCellMouseDown,
  onCellMouseUp
}) => {
  const isEmpty = tile.isMatched || tile.id.startsWith('empty-');

  return (
    <div
      onTouchStart={(e) => onCellTouchStart(r, c, e)}
      onTouchMove={onCellTouchMove}
      onTouchEnd={() => onCellTouchEnd(r, c)}
      onMouseDown={(e) => onCellMouseDown(r, c, e)}
      onMouseUp={() => onCellMouseUp(r, c)}
      className={`relative w-full h-full p-0.5 flex items-center justify-center cursor-pointer box-border overflow-hidden select-none touch-none ${
        isSelected
          ? 'z-20 ring-2 ring-yellow-300 ring-inset bg-yellow-400/25'
          : isNeighbor && !activeBooster
          ? 'ring-1 ring-cyan-300 ring-inset bg-cyan-400/10'
          : ''
      } ${isHinted ? 'animate-hint z-10' : ''}`}
    >
      {/* Directional Guides strictly indicating 위, 아래, 왼쪽, 오른쪽 */}
      {isSelected && (
        <>
          <span className="absolute top-0 text-[10px] text-yellow-300 font-black pointer-events-none drop-shadow">▲</span>
          <span className="absolute bottom-0 text-[10px] text-yellow-300 font-black pointer-events-none drop-shadow">▼</span>
          <span className="absolute left-0 text-[10px] text-yellow-300 font-black pointer-events-none drop-shadow">◀</span>
          <span className="absolute right-0 text-[10px] text-yellow-300 font-black pointer-events-none drop-shadow">▶</span>
        </>
      )}

      {/* Active Booster Cursor */}
      {activeBooster && (
        <div className="absolute inset-0.5 rounded-lg border border-dashed border-amber-300/80 bg-amber-400/20 pointer-events-none" />
      )}

      {/* Plump Candy Icon with dynamic Skin theme */}
      {!isEmpty && (
        <CandyIcon
          color={tile.color}
          special={tile.special}
          caged={tile.caged}
          skinTheme={candySkin}
          className="w-full h-full"
        />
      )}
    </div>
  );
});

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  selectedTile,
  activeBooster,
  hintTiles,
  flyingFishes,
  floatingTexts,
  particles,
  candySkin = 'classic',
  boardSkin = 'cyan',
  onTileClick,
  onSwipe
}) => {
  const touchStartRef = useRef<{ x: number; y: number; r: number; c: number } | null>(null);
  const isSwipedRef = useRef<boolean>(false);
  const mouseStartRef = useRef<{ x: number; y: number; r: number; c: number } | null>(null);

  // Strict 4-way orthogonal direction calculator (위, 아래, 왼쪽, 오른쪽 ONLY)
  const calculateOrthogonalTarget = useCallback((
    startR: number,
    startC: number,
    dx: number,
    dy: number
  ): { targetR: number; targetC: number } | null => {
    const threshold = 16;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (absX < threshold && absY < threshold) return null;

    let targetR = startR;
    let targetC = startC;

    // Strictly enforce dominant axis to guarantee ONLY 4 directions (위, 아래, 왼쪽, 오른쪽)
    if (absX >= absY) {
      targetC = dx > 0 ? startC + 1 : startC - 1;
    } else {
      targetR = dy > 0 ? startR + 1 : startR - 1;
    }

    if (targetR >= 0 && targetR < BOARD_SIZE && targetC >= 0 && targetC < BOARD_SIZE) {
      return { targetR, targetC };
    }
    return null;
  }, []);

  const handleCellTouchStart = useCallback((r: number, c: number, e: React.TouchEvent) => {
    if (activeBooster) {
      onTileClick(r, c);
      return;
    }
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      r,
      c
    };
    isSwipedRef.current = false;
  }, [activeBooster, onTileClick]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || isSwipedRef.current || activeBooster) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    const target = calculateOrthogonalTarget(
      touchStartRef.current.r,
      touchStartRef.current.c,
      dx,
      dy
    );

    if (target) {
      isSwipedRef.current = true;
      onSwipe(touchStartRef.current.r, touchStartRef.current.c, target.targetR, target.targetC);
      touchStartRef.current = null;
    }
  }, [activeBooster, calculateOrthogonalTarget, onSwipe]);

  const handleCellTouchEnd = useCallback((r: number, c: number) => {
    if (!isSwipedRef.current && touchStartRef.current) {
      onTileClick(r, c);
    }
    touchStartRef.current = null;
    isSwipedRef.current = false;
  }, [onTileClick]);

  const handleCellMouseDown = useCallback((r: number, c: number, e: React.MouseEvent) => {
    if (activeBooster) {
      onTileClick(r, c);
      return;
    }
    mouseStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      r,
      c
    };
  }, [activeBooster, onTileClick]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!mouseStartRef.current || activeBooster) return;
    const dx = e.clientX - mouseStartRef.current.x;
    const dy = e.clientY - mouseStartRef.current.y;

    const target = calculateOrthogonalTarget(
      mouseStartRef.current.r,
      mouseStartRef.current.c,
      dx,
      dy
    );

    if (target) {
      onSwipe(mouseStartRef.current.r, mouseStartRef.current.c, target.targetR, target.targetC);
      mouseStartRef.current = null;
    }
  }, [activeBooster, calculateOrthogonalTarget, onSwipe]);

  const handleCellMouseUp = useCallback((r: number, c: number) => {
    if (mouseStartRef.current) {
      onTileClick(r, c);
    }
    mouseStartRef.current = null;
  }, [onTileClick]);

  const isOrthogonalNeighbor = useCallback((r: number, c: number): boolean => {
    if (!selectedTile) return false;
    const dr = Math.abs(selectedTile.r - r);
    const dc = Math.abs(selectedTile.c - c);
    return dr + dc === 1; // Strictly 1 Manhattan distance (위, 아래, 왼쪽, 오른쪽)
  }, [selectedTile]);

  // Board theme visual styling
  const boardStyles = {
    cyan: {
      border: 'border-cyan-400',
      bg: 'bg-sky-950/80',
      altTile: 'bg-sky-700/60',
      mainTile: 'bg-sky-600/40',
      gridBorder: 'border-sky-400/20',
      frosting: 'linear-gradient(180deg, #f472b6 0%, #db2777 100%)'
    },
    golden: {
      border: 'border-amber-400',
      bg: 'bg-purple-950/85',
      altTile: 'bg-purple-900/60',
      mainTile: 'bg-purple-800/40',
      gridBorder: 'border-amber-400/25',
      frosting: 'linear-gradient(180deg, #f59e0b 0%, #b45309 100%)'
    },
    pink: {
      border: 'border-pink-400',
      bg: 'bg-rose-950/85',
      altTile: 'bg-rose-900/60',
      mainTile: 'bg-rose-800/40',
      gridBorder: 'border-pink-300/25',
      frosting: 'linear-gradient(180deg, #f472b6 0%, #be185d 100%)'
    }
  }[boardSkin] || {
    border: 'border-cyan-400',
    bg: 'bg-sky-950/80',
    altTile: 'bg-sky-700/60',
    mainTile: 'bg-sky-600/40',
    gridBorder: 'border-sky-400/20',
    frosting: 'linear-gradient(180deg, #f472b6 0%, #db2777 100%)'
  };

  return (
    <div className="relative w-full max-w-[420px] aspect-square mx-auto p-1 select-none touch-none">
      {/* 1. Global SVG Definitions (Only defined once) */}
      <CandyDefs />

      {/* 2. 9x9 Board Frame Container */}
      <div
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className={`w-full h-full relative rounded-2xl overflow-hidden border-4 ${boardStyles.border} shadow-2xl ${boardStyles.bg} gpu-60fps`}
        style={{
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5), inset 0 2px 6px rgba(255, 255, 255, 0.35)'
        }}
      >
        {/* 9x9 Checkerboard Background */}
        <div className="absolute inset-0 grid grid-cols-9 grid-rows-9 pointer-events-none">
          {Array.from({ length: 81 }).map((_, idx) => {
            const r = Math.floor(idx / 9);
            const c = idx % 9;
            const isAlt = (r + c) % 2 === 1;

            return (
              <div
                key={`bg-${r}-${c}`}
                className={`w-full h-full border-[0.5px] ${boardStyles.gridBorder} ${
                  isAlt ? boardStyles.altTile : boardStyles.mainTile
                }`}
              />
            );
          })}
        </div>

        {/* Pink / Gold / Berry Bottom Frosting Bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-2 sm:h-2.5 z-10 pointer-events-none"
          style={{
            background: boardStyles.frosting,
            boxShadow: '0 -2px 6px rgba(0, 0, 0, 0.4)'
          }}
        />

        {/* 9x9 Interactive Candy Tiles Grid */}
        <div className="relative z-10 w-full h-full grid grid-cols-9 grid-rows-9">
          {board.map((row, r) =>
            row.map((tile, c) => {
              const isSelected = selectedTile?.r === r && selectedTile?.c === c;
              const isNeighbor = isOrthogonalNeighbor(r, c);
              const isHinted = hintTiles?.some(([hr, hc]) => hr === r && hc === c) || false;

              return (
                <TileCell
                  key={tile.id || `${r}-${c}`}
                  tile={tile}
                  r={r}
                  c={c}
                  isSelected={isSelected}
                  isNeighbor={isNeighbor}
                  isHinted={isHinted}
                  activeBooster={activeBooster}
                  candySkin={candySkin}
                  onCellTouchStart={handleCellTouchStart}
                  onCellTouchMove={handleTouchMove}
                  onCellTouchEnd={handleCellTouchEnd}
                  onCellMouseDown={handleCellMouseDown}
                  onCellMouseUp={handleCellMouseUp}
                />
              );
            })
          )}
        </div>

        {/* Dynamic Flying Jelly Fishes */}
        {flyingFishes.map((fish) => {
          return (
            <div
              key={fish.id}
              className="absolute z-40 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-all duration-350 ease-out gpu-60fps"
              style={{
                left: `${(fish.targetCol + 0.5) * (100 / 9)}%`,
                top: `${(fish.targetRow + 0.5) * (100 / 9)}%`
              }}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 animate-bounce">
                <CandyIcon color={fish.color} special="fish" skinTheme={candySkin} />
              </div>
              <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-cyan-300/80 animate-ping" />
            </div>
          );
        })}

        {/* Floating Score and Praise Texts */}
        {floatingTexts.map((ft) => (
          <div
            key={ft.id}
            className="absolute z-50 pointer-events-none font-black text-center candy-text-stroke transform -translate-x-1/2 -translate-y-1/2 animate-out fade-out slide-out-to-top duration-600 whitespace-nowrap gpu-60fps"
            style={{
              left: `${ft.x}%`,
              top: `${ft.y}%`,
              color: ft.color || '#FACC15',
              fontSize: ft.size === 'lg' ? '1.4rem' : ft.size === 'md' ? '1.15rem' : '0.9rem'
            }}
          >
            {ft.text}
          </div>
        ))}

        {/* Sparkle Particle Bursts */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute z-30 pointer-events-none rounded-full gpu-60fps"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              opacity: p.life / p.maxLife,
              boxShadow: `0 0 5px ${p.color}`
            }}
          />
        ))}
      </div>
    </div>
  );
};
