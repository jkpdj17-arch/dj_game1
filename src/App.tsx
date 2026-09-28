/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  BoardSkinTheme,
  BoosterType,
  CandyColor,
  CandySkinTheme,
  FloatingText,
  FlyingFish,
  Particle,
  SpecialType,
  Stage,
  Tile,
  UserProgress
} from './types/game';
import { STAGES, BOARD_SIZE } from './constants/stages';
import { BOOSTERS } from './constants/boosters';
import {
  createInitialBoard,
  findMatches,
  findFishTarget,
  MatchResult
} from './utils/matchEngine';
import { applyGravityAndRefill } from './utils/gravityEngine';
import { findPossibleMove, shuffleBoard } from './utils/hintSolver';
import { loadUserProgress, saveUserProgress } from './utils/storage';
import { sounds } from './utils/soundEffects';
import { HeaderBar } from './components/HeaderBar';
import { GameBoard } from './components/GameBoard';
import { BoosterBar } from './components/BoosterBar';
import { StageMap } from './components/StageMap';
import { ResultModal } from './components/ResultModal';
import { SugarCrushOverlay } from './components/SugarCrushOverlay';
import { ShopModal } from './components/ShopModal';
import { ItemBundle } from './constants/shop';

export default function App() {
  // User Persistent State
  const [progress, setProgress] = useState<UserProgress>(() => loadUserProgress());

  // Active Stage (Default to Stage 3: The exact 8-cage level from user screenshot!)
  const [currentStage, setCurrentStage] = useState<Stage>(
    () => STAGES.find((s) => s.id === 3) || STAGES[0]
  );

  // In-Game Play State
  const [board, setBoard] = useState<Tile[][]>(() => createInitialBoard(currentStage.cages));
  const [score, setScore] = useState<number>(0);
  const [movesLeft, setMovesLeft] = useState<number>(currentStage.moves);
  const [rescuedTargetCount, setRescuedTargetCount] = useState<number>(0);
  const [selectedTile, setSelectedTile] = useState<{ r: number; c: number } | null>(null);
  const [activeBooster, setActiveBooster] = useState<BoosterType | null>(null);
  const [switchFirstTile, setSwitchFirstTile] = useState<{ r: number; c: number } | null>(null);

  // Visual Effects & Animations
  const [flyingFishes, setFlyingFishes] = useState<FlyingFish[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [hintTiles, setHintTiles] = useState<[number, number][] | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSugarCrush, setIsSugarCrush] = useState<boolean>(false);

  // Modals & Navigation
  const [showStageMap, setShowStageMap] = useState<boolean>(false);
  const [showShop, setShowShop] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<'victory' | 'defeat' | null>(null);

  // Daily free bonus key
  const [canClaimDaily, setCanClaimDaily] = useState<boolean>(() => {
    const last = localStorage.getItem('candy_daily_reward_claim');
    if (!last) return true;
    return Date.now() - Number(last) > 1000 * 60 * 60 * 2; // Every 2 hours or once per session
  });

  // Save progress helper
  const updateProgress = useCallback((updater: (prev: UserProgress) => UserProgress) => {
    setProgress((prev) => {
      const next = updater(prev);
      saveUserProgress(next);
      return next;
    });
  }, []);

  // Shop Handlers
  const handleBuySkin = useCallback((type: 'candy' | 'board', key: string, cost: number) => {
    updateProgress((prev) => {
      if (prev.coins < cost) return prev;
      if (type === 'candy') {
        const candyKey = key as CandySkinTheme;
        const unlocked = prev.unlockedCandySkins.includes(candyKey)
          ? prev.unlockedCandySkins
          : [...prev.unlockedCandySkins, candyKey];
        return {
          ...prev,
          coins: prev.coins - cost,
          unlockedCandySkins: unlocked,
          equippedCandySkin: candyKey
        };
      } else {
        const boardKey = key as BoardSkinTheme;
        const unlocked = prev.unlockedBoardSkins.includes(boardKey)
          ? prev.unlockedBoardSkins
          : [...prev.unlockedBoardSkins, boardKey];
        return {
          ...prev,
          coins: prev.coins - cost,
          unlockedBoardSkins: unlocked,
          equippedBoardSkin: boardKey
        };
      }
    });
    addFloatingText('스킨 구매 & 장착 완료!', 50, 45, '#38BDF8', 'md');
  }, [updateProgress]);

  const handleEquipSkin = useCallback((type: 'candy' | 'board', key: string) => {
    updateProgress((prev) => ({
      ...prev,
      [type === 'candy' ? 'equippedCandySkin' : 'equippedBoardSkin']: key
    }));
    addFloatingText('스킨 변경 완료!', 50, 45, '#4ADE80', 'sm');
  }, [updateProgress]);

  const handleBuyBundle = useCallback((bundle: ItemBundle) => {
    updateProgress((prev) => {
      if (prev.coins < bundle.cost) return prev;
      return {
        ...prev,
        coins: prev.coins - bundle.cost,
        boosters: {
          ...prev.boosters,
          [bundle.type]: (prev.boosters[bundle.type] || 0) + bundle.count
        }
      };
    });
    addFloatingText(`+${bundle.count} ${bundle.name}!`, 50, 45, '#FACC15', 'md');
  }, [updateProgress]);

  const handleClaimDailyReward = useCallback(() => {
    localStorage.setItem('candy_daily_reward_claim', String(Date.now()));
    setCanClaimDaily(false);
    updateProgress((prev) => ({
      ...prev,
      coins: prev.coins + 250
    }));
    addFloatingText('+250 🪙 무료 보너스 획득!', 50, 45, '#FACC15', 'lg');
  }, [updateProgress]);

  // Timers
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize/Reset Stage
  const startStage = useCallback((stage: Stage) => {
    setCurrentStage(stage);
    setBoard(createInitialBoard(stage.cages));
    setScore(0);
    setMovesLeft(stage.moves);
    setRescuedTargetCount(0);
    setSelectedTile(null);
    setActiveBooster(null);
    setSwitchFirstTile(null);
    setFlyingFishes([]);
    setFloatingTexts([]);
    setParticles([]);
    setHintTiles(null);
    setIsProcessing(false);
    setIsSugarCrush(false);
    setGameResult(null);
  }, []);

  // Idle Hint Reset
  const resetHintTimer = useCallback(() => {
    setHintTiles(null);
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
    }
    hintTimeoutRef.current = setTimeout(() => {
      if (!isProcessing && !gameResult && !showStageMap) {
        setBoard((currentBoard) => {
          const move = findPossibleMove(currentBoard);
          if (move) {
            setHintTiles([
              [move.r1, move.c1],
              [move.r2, move.c2]
            ]);
          } else {
            // Auto shuffle if no moves exist
            sounds.playSwap();
            const shuffled = shuffleBoard(currentBoard);
            addFloatingText('SHUFFLE!', 50, 50, '#38BDF8', 'lg');
            return shuffled;
          }
          return currentBoard;
        });
      }
    }, 5000);
  }, [isProcessing, gameResult, showStageMap]);

  useEffect(() => {
    resetHintTimer();
    return () => {
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    };
  }, [resetHintTimer]);

  // Floating Text Generator
  const addFloatingText = (
    text: string,
    x: number,
    y: number,
    color?: string,
    size: 'sm' | 'md' | 'lg' = 'md'
  ) => {
    const id = `ft-${Date.now()}-${Math.random()}`;
    setFloatingTexts((prev) => [...prev, { id, text, x, y, color, size }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 800);
  };

  // Particle Bursts Generator
  const spawnParticles = (row: number, col: number, colorHex: string) => {
    const count = 8;
    const newParticles: Particle[] = [];
    const cellPercentX = (col + 0.5) * (100 / 9);
    const cellPercentY = (row + 0.5) * (100 / 9);

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 3;
      newParticles.push({
        id: `p-${Date.now()}-${i}-${Math.random()}`,
        x: cellPercentX,
        y: cellPercentY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colorHex,
        size: 4 + Math.random() * 4,
        life: 1,
        maxLife: 1
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
    }, 450);
  };

  // Launch a Flying Jelly Fish to target!
  const launchFish = useCallback(
    (
      startRow: number,
      startCol: number,
      color: CandyColor,
      currentBoard: Tile[][],
      bonusEffect?: 'striped' | 'wrapped'
    ): Promise<{ targetR: number; targetC: number } | null> => {
      sounds.playFishSwim();
      const target = findFishTarget(currentBoard, new Set([`${startRow},${startCol}`]));
      if (!target) return Promise.resolve(null);

      const [tr, tc] = target;
      const fishId = `fish-${Date.now()}-${Math.random()}`;

      setFlyingFishes((prev) => [
        ...prev,
        {
          id: fishId,
          startX: startCol,
          startY: startRow,
          targetX: tc,
          targetY: tr,
          targetRow: tr,
          targetCol: tc,
          color,
          bonusEffect
        }
      ]);

      return new Promise((resolve) => {
        setTimeout(() => {
          sounds.playFishImpact();
          // Remove flying fish element and resolve target coordinates
          setFlyingFishes((prev) => prev.filter((f) => f.id !== fishId));
          resolve({ targetR: tr, targetC: tc });
        }, 340);
      });
    },
    []
  );

  // Cascade & Match Resolution Loop
  const resolveBoard = useCallback(
    async (
      initialBoard: Tile[][],
      source?: { r: number; c: number },
      target?: { r: number; c: number },
      comboLevel: number = 1
    ): Promise<Tile[][]> => {
      let curBoard = initialBoard.map((row) => row.map((t) => ({ ...t })));

      const matchRes: MatchResult = findMatches(curBoard, source, target);
      if (matchRes.matchedCoords.length === 0 && matchRes.damagedCages.length === 0) {
        return curBoard;
      }

      sounds.playPop(comboLevel);

      // Score Calculation
      const pts = matchRes.matchedCoords.length * 60 * comboLevel;
      setScore((s) => s + pts);

      // Praise Floaters
      if (comboLevel === 2) {
        addFloatingText('SWEET!', 50, 45, '#F472B6', 'lg');
      } else if (comboLevel === 3) {
        addFloatingText('TASTY!', 50, 45, '#38BDF8', 'lg');
      } else if (comboLevel >= 4) {
        addFloatingText('DELICIOUS!!', 50, 45, '#FACC15', 'lg');
      }

      // Handle Damaged Cages (Freeing caged candies)
      let newlyRescued = 0;
      matchRes.damagedCages.forEach(([cr, cc]) => {
        if (curBoard[cr]?.[cc]?.caged) {
          curBoard[cr][cc].caged = false;
          newlyRescued++;
          sounds.playCageBreak();
          spawnParticles(cr, cc, '#E2E8F0');
          addFloatingText('구출!', (cc + 0.5) * (100 / 9), (cr + 0.5) * (100 / 9), '#4ADE80', 'sm');
        }
      });

      if (newlyRescued > 0 && currentStage.targetType === 'cage') {
        setRescuedTargetCount((c) => Math.min(currentStage.targetCount, c + newlyRescued));
      }

      // Spawn Specials (Fish from 2x2, Color Bomb, Striped, Wrapped)
      const specialSpawnMap = new Map<string, { color: CandyColor; special: SpecialType }>();
      matchRes.specialsToCreate.forEach((spec) => {
        specialSpawnMap.set(`${spec.row},${spec.col}`, {
          color: spec.color,
          special: spec.special
        });
        if (spec.special === 'fish') {
          addFloatingText('🐟 젤리 물고기!', (spec.col + 0.5) * (100 / 9), (spec.row + 0.5) * (100 / 9), '#38BDF8', 'md');
          if (currentStage.targetType === 'fish') {
            setRescuedTargetCount((fc) => Math.min(currentStage.targetCount, fc + 1));
          }
        } else if (spec.special === 'mega_bomb') {
          addFloatingText('💣 8+ 메가 폭탄!', (spec.col + 0.5) * (100 / 9), (spec.row + 0.5) * (100 / 9), '#EF4444', 'lg');
        }
        sounds.playSpecialCreate();
      });

      // Mega Bomb 9-cell super shockwave feedback
      if (matchRes.megaBombsTriggered && matchRes.megaBombsTriggered.length > 0) {
        sounds.playColorBomb();
        sounds.playCageBreak();
        addFloatingText('💥 9칸 초토화!', 50, 45, '#EF4444', 'lg');
      }

      // Striped Candy laser beam feedback ("이 캔디가 부서지면 표시되어있는 줄이 없어지게")
      if (matchRes.stripesTriggered && matchRes.stripesTriggered.length > 0) {
        sounds.playStripedBeam();
        matchRes.stripesTriggered.forEach((st) => {
          if (st.type === 'h') {
            addFloatingText('⚡ 가로 전체 줄 폭파!', 50, (st.row + 0.5) * (100 / 9), '#38BDF8', 'md');
            for (let c = 0; c < 9; c++) spawnParticles(st.row, c, '#38BDF8');
          } else {
            addFloatingText('⚡ 세로 전체 줄 폭파!', (st.col + 0.5) * (100 / 9), 50, '#38BDF8', 'md');
            for (let r = 0; r < 9; r++) spawnParticles(r, st.col, '#38BDF8');
          }
        });
      }

      // Wrapped Candy blast feedback ("저사진은 주변 6칸 없어지게 만들어줘")
      if (matchRes.wrappedTriggered && matchRes.wrappedTriggered.length > 0) {
        sounds.playPop(3);
        matchRes.wrappedTriggered.forEach(([wr, wc]) => {
          addFloatingText('💥 주변 6칸 폭파!', (wc + 0.5) * (100 / 9), (wr + 0.5) * (100 / 9), '#F97316', 'md');
          spawnParticles(wr, wc, '#F97316');
        });
      }

      // Clear Matched Tiles (except those becoming specials)
      const workingBoard: (Tile | null)[][] = curBoard.map((row) => [...row]);

      matchRes.matchedCoords.forEach(([mr, mc]) => {
        const spec = specialSpawnMap.get(`${mr},${mc}`);
        if (spec) {
          workingBoard[mr][mc] = {
            id: `spec-${mr}-${mc}-${Date.now()}`,
            row: mr,
            col: mc,
            color: spec.color,
            special: spec.special,
            caged: false
          };
        } else {
          workingBoard[mr][mc] = null;
        }
      });

      // Rescued caged candies also pop ("터지게") upon same-color match!
      matchRes.damagedCages.forEach(([cr, cc]) => {
        if (!specialSpawnMap.has(`${cr},${cc}`)) {
          workingBoard[cr][cc] = null;
        }
      });

      // Handle Flying Fishes launched in this match
      for (const fish of matchRes.fishesToLaunch) {
        const fishTarget = await launchFish(fish.startRow, fish.startCol, fish.color, curBoard);
        if (fishTarget) {
          const { targetR, targetC } = fishTarget;
          const targetTile = workingBoard[targetR]?.[targetC];
          if (targetTile) {
            if (targetTile.caged) {
              targetTile.caged = false;
              sounds.playCageBreak();
              if (currentStage.targetType === 'cage') {
                setRescuedTargetCount((c) => Math.min(currentStage.targetCount, c + 1));
              }
            }
            // Pop target tile
            workingBoard[targetR][targetC] = null;
            spawnParticles(targetR, targetC, '#38BDF8');
            setScore((s) => s + 200);
          }
        }
      }

      // Update board visually with gaps (clean empty slots)
      setBoard(
        workingBoard.map((r, ri) =>
          r.map((t, ci) =>
            t || {
              id: `empty-${ri}-${ci}-${Date.now()}`,
              row: ri,
              col: ci,
              color: 'yellow',
              special: 'normal',
              caged: false,
              isMatched: true
            }
          )
        )
      );

      // 60 FPS requestAnimationFrame synchronized delays
      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 100)));

      // Gravity Fall & Refill
      const { newBoard } = applyGravityAndRefill(workingBoard);
      setBoard(newBoard);

      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 110)));

      // Recursive Cascade
      return resolveBoard(newBoard, undefined, undefined, comboLevel + 1);
    },
    [currentStage, launchFish]
  );

  // Check Victory / Defeat status
  useEffect(() => {
    if (isProcessing || gameResult || isSugarCrush) return;

    let targetMet = false;
    if (currentStage.targetType === 'cage' || currentStage.targetType === 'fish') {
      targetMet = rescuedTargetCount >= currentStage.targetCount;
    } else if (currentStage.targetType === 'score') {
      targetMet = score >= currentStage.targetCount;
    }

    if (targetMet) {
      // Victory Triggered!
      if (movesLeft > 0) {
        // Sugar Crush Bonus sequence
        setIsSugarCrush(true);
        sounds.playSpecialCreate();

        let remaining = movesLeft;
        const interval = setInterval(() => {
          if (remaining > 0) {
            remaining--;
            setMovesLeft(remaining);
            setScore((s) => s + 1000);
            sounds.playPop(1);
          } else {
            clearInterval(interval);
            setIsSugarCrush(false);

            // Record Stage Progress
            const [s1, s2, s3] = currentStage.starScores;
            const stars = score >= s3 ? 3 : score >= s2 ? 2 : score >= s1 ? 1 : 1;
            updateProgress((prev) => ({
              ...prev,
              unlockedStage: Math.max(prev.unlockedStage, currentStage.id + 1),
              coins: prev.coins + 100,
              stageScores: {
                ...prev.stageScores,
                [currentStage.id]: Math.max(prev.stageScores[currentStage.id] || 0, score)
              },
              stageStars: {
                ...prev.stageStars,
                [currentStage.id]: Math.max(prev.stageStars[currentStage.id] || 0, stars)
              }
            }));
            setGameResult('victory');
          }
        }, 180);
      } else {
        setGameResult('victory');
      }
    } else if (movesLeft <= 0) {
      setGameResult('defeat');
    }
  }, [
    movesLeft,
    rescuedTargetCount,
    score,
    currentStage,
    isProcessing,
    gameResult,
    isSugarCrush,
    updateProgress
  ]);

  // Main Swap Action
  const performSwap = async (r1: number, c1: number, r2: number, c2: number) => {
    if (isProcessing || gameResult) return;

    const t1 = board[r1]?.[c1];
    const t2 = board[r2]?.[c2];
    if (!t1 || !t2) return;

    // Caged candies cannot be swapped
    if (t1.caged || t2.caged) {
      sounds.playInvalid();
      addFloatingText('철망을 먼저 부수세요!', 50, 50, '#EF4444', 'sm');
      return;
    }

    setIsProcessing(true);
    resetHintTimer();
    setSelectedTile(null);

    // 0. 8+ Mega Bomb Interactions ("주변 범위 9칸에 철창이든 뭐든 전부 부수게 해줘 그대신 칸은 빼고")
    if (t1.special === 'mega_bomb' || t2.special === 'mega_bomb') {
      sounds.playColorBomb();
      sounds.playCageBreak();
      addFloatingText('💥 9칸 메가 대폭발!', 50, 45, '#EF4444', 'lg');

      setMovesLeft((m) => m - 1);
      const centerR = t1.special === 'mega_bomb' ? r1 : r2;
      const centerC = t1.special === 'mega_bomb' ? c1 : c2;

      // Blast all 9 surrounding cells (3x3 area)
      const nextBoard: (Tile | null)[][] = board.map((row) => row.map((t) => ({ ...t })));
      let newlyRescued = 0;

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = centerR + dr;
          const nc = centerC + dc;
          if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
            const tile = nextBoard[nr][nc];
            if (tile?.caged) {
              newlyRescued++;
              sounds.playCageBreak();
            }
            // Clear content: candies and iron cages destroyed, grid cell remains intact!
            nextBoard[nr][nc] = null;
            spawnParticles(nr, nc, '#EF4444');
          }
        }
      }

      if (newlyRescued > 0 && currentStage.targetType === 'cage') {
        setRescuedTargetCount((cnt) => Math.min(currentStage.targetCount, cnt + newlyRescued));
      }

      setScore((s) => s + 3500);

      // Brief gap flash
      setBoard(
        nextBoard.map((r, ri) =>
          r.map((t, ci) =>
            t || {
              id: `empty-mega-${ri}-${ci}-${Date.now()}`,
              row: ri,
              col: ci,
              color: 'yellow',
              special: 'normal',
              caged: false,
              isMatched: true
            }
          )
        )
      );

      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 120)));

      const { newBoard } = applyGravityAndRefill(nextBoard);
      setBoard(newBoard);

      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 130)));
      await resolveBoard(newBoard, undefined, undefined, 1);
      setIsProcessing(false);
      return;
    }

    // 0-B. Single Striped Candy Direct Detonation (Double-tap)
    if (r1 === r2 && c1 === c2 && (t1.special === 'striped_h' || t1.special === 'striped_v')) {
      sounds.playStripedBeam();
      const isHorizontal = t1.special === 'striped_h';
      addFloatingText(isHorizontal ? '⚡ 가로 줄 전체 폭파!' : '⚡ 세로 줄 전체 폭파!', 50, 45, '#38BDF8', 'lg');

      setMovesLeft((m) => m - 1);
      const nextBoard: (Tile | null)[][] = board.map((row) => row.map((t) => ({ ...t })));
      let newlyRescued = 0;

      if (isHorizontal) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          if (nextBoard[r1][col]?.caged) newlyRescued++;
          nextBoard[r1][col] = null;
          spawnParticles(r1, col, '#38BDF8');
        }
      } else {
        for (let row = 0; row < BOARD_SIZE; row++) {
          if (nextBoard[row][c1]?.caged) newlyRescued++;
          nextBoard[row][c1] = null;
          spawnParticles(row, c1, '#38BDF8');
        }
      }

      if (newlyRescued > 0 && currentStage.targetType === 'cage') {
        setRescuedTargetCount((cnt) => Math.min(currentStage.targetCount, cnt + newlyRescued));
      }

      setScore((s) => s + 1800);

      setBoard(
        nextBoard.map((r, ri) =>
          r.map((t, ci) =>
            t || {
              id: `empty-laser-${ri}-${ci}-${Date.now()}`,
              row: ri,
              col: ci,
              color: 'yellow',
              special: 'normal',
              caged: false,
              isMatched: true
            }
          )
        )
      );

      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 120)));
      const { newBoard } = applyGravityAndRefill(nextBoard);
      setBoard(newBoard);

      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 130)));
      await resolveBoard(newBoard, undefined, undefined, 1);
      setIsProcessing(false);
      return;
    }

    // 0-B2. Single Wrapped Candy Direct Detonation (Double-tap: 주변 6칸 폭파!)
    if (r1 === r2 && c1 === c2 && t1.special === 'wrapped') {
      sounds.playColorBomb();
      sounds.playPop(3);
      addFloatingText('💥 주변 6칸 폭파!', 50, 45, '#F97316', 'lg');

      setMovesLeft((m) => m - 1);
      const nextBoard: (Tile | null)[][] = board.map((row) => row.map((t) => ({ ...t })));
      let newlyRescued = 0;

      if (nextBoard[r1][c1]?.caged) newlyRescued++;
      nextBoard[r1][c1] = null;
      spawnParticles(r1, c1, '#F97316');

      const candidateOffsets = [
        [-1, 0], [1, 0], [0, -1], [0, 1],
        [-1, -1], [1, 1], [-1, 1], [1, -1]
      ];
      let poppedCount = 0;
      for (const [dr, dc] of candidateOffsets) {
        if (poppedCount >= 6) break;
        const nr = r1 + dr;
        const nc = c1 + dc;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
          if (nextBoard[nr][nc]?.caged) newlyRescued++;
          nextBoard[nr][nc] = null;
          spawnParticles(nr, nc, '#F97316');
          poppedCount++;
        }
      }

      if (newlyRescued > 0 && currentStage.targetType === 'cage') {
        setRescuedTargetCount((cnt) => Math.min(currentStage.targetCount, cnt + newlyRescued));
      }

      setScore((s) => s + 2200);

      setBoard(
        nextBoard.map((r, ri) =>
          r.map((t, ci) =>
            t || {
              id: `empty-wrapped-${ri}-${ci}-${Date.now()}`,
              row: ri,
              col: ci,
              color: 'yellow',
              special: 'normal',
              caged: false,
              isMatched: true
            }
          )
        )
      );

      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 120)));
      const { newBoard } = applyGravityAndRefill(nextBoard);
      setBoard(newBoard);

      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 130)));
      await resolveBoard(newBoard, undefined, undefined, 1);
      setIsProcessing(false);
      return;
    }

    // 0-C. Striped + Striped Combo (Cross Laser: both row and column obliterated!)
    const isT1Striped = t1.special === 'striped_h' || t1.special === 'striped_v';
    const isT2Striped = t2.special === 'striped_h' || t2.special === 'striped_v';

    if (isT1Striped && isT2Striped) {
      sounds.playStripedBeam();
      addFloatingText('⚡➕ 십자 크로스 레이저!', 50, 45, '#38BDF8', 'lg');

      setMovesLeft((m) => m - 1);
      const centerR = r2;
      const centerC = c2;

      const nextBoard: (Tile | null)[][] = board.map((row) => row.map((t) => ({ ...t })));
      let newlyRescued = 0;

      for (let col = 0; col < BOARD_SIZE; col++) {
        if (nextBoard[centerR][col]?.caged) newlyRescued++;
        nextBoard[centerR][col] = null;
        spawnParticles(centerR, col, '#38BDF8');
      }
      for (let row = 0; row < BOARD_SIZE; row++) {
        if (nextBoard[row][centerC]?.caged) newlyRescued++;
        nextBoard[row][centerC] = null;
        spawnParticles(row, centerC, '#38BDF8');
      }

      if (newlyRescued > 0 && currentStage.targetType === 'cage') {
        setRescuedTargetCount((cnt) => Math.min(currentStage.targetCount, cnt + newlyRescued));
      }

      setScore((s) => s + 2800);

      setBoard(
        nextBoard.map((r, ri) =>
          r.map((t, ci) =>
            t || {
              id: `empty-cross-${ri}-${ci}-${Date.now()}`,
              row: ri,
              col: ci,
              color: 'yellow',
              special: 'normal',
              caged: false,
              isMatched: true
            }
          )
        )
      );

      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 120)));
      const { newBoard } = applyGravityAndRefill(nextBoard);
      setBoard(newBoard);

      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 130)));
      await resolveBoard(newBoard, undefined, undefined, 1);
      setIsProcessing(false);
      return;
    }

    // 0-D. Striped + Wrapped Combo (Mega Giant Cross 3-row, 3-column blast!)
    const isT1Wrapped = t1.special === 'wrapped';
    const isT2Wrapped = t2.special === 'wrapped';

    if ((isT1Striped && isT2Wrapped) || (isT2Striped && isT1Wrapped)) {
      sounds.playStripedBeam();
      sounds.playColorBomb();
      addFloatingText('⚡💥 메가 크로스 빔!', 50, 45, '#F59E0B', 'lg');

      setMovesLeft((m) => m - 1);
      const centerR = r2;
      const centerC = c2;

      const nextBoard: (Tile | null)[][] = board.map((row) => row.map((t) => ({ ...t })));
      let newlyRescued = 0;

      for (let dr = -1; dr <= 1; dr++) {
        const row = centerR + dr;
        if (row >= 0 && row < BOARD_SIZE) {
          for (let col = 0; col < BOARD_SIZE; col++) {
            if (nextBoard[row][col]?.caged) newlyRescued++;
            nextBoard[row][col] = null;
            spawnParticles(row, col, '#F59E0B');
          }
        }
      }
      for (let dc = -1; dc <= 1; dc++) {
        const col = centerC + dc;
        if (col >= 0 && col < BOARD_SIZE) {
          for (let row = 0; row < BOARD_SIZE; row++) {
            if (nextBoard[row][col]?.caged) newlyRescued++;
            nextBoard[row][col] = null;
            spawnParticles(row, col, '#F59E0B');
          }
        }
      }

      if (newlyRescued > 0 && currentStage.targetType === 'cage') {
        setRescuedTargetCount((cnt) => Math.min(currentStage.targetCount, cnt + newlyRescued));
      }

      setScore((s) => s + 4200);

      setBoard(
        nextBoard.map((r, ri) =>
          r.map((t, ci) =>
            t || {
              id: `empty-megacross-${ri}-${ci}-${Date.now()}`,
              row: ri,
              col: ci,
              color: 'yellow',
              special: 'normal',
              caged: false,
              isMatched: true
            }
          )
        )
      );

      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 120)));
      const { newBoard } = applyGravityAndRefill(nextBoard);
      setBoard(newBoard);

      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 130)));
      await resolveBoard(newBoard, undefined, undefined, 1);
      setIsProcessing(false);
      return;
    }

    // 1. Color Bomb Interactions
    if (t1.special === 'color_bomb' || t2.special === 'color_bomb') {
      sounds.playColorBomb();
      const targetColor = t1.special === 'color_bomb' ? t2.color : t1.color;
      addFloatingText('COLOR BOMB!', 50, 45, '#F59E0B', 'lg');

      setMovesLeft((m) => m - 1);

      // Destroy all candies of target color
      const nextBoard = board.map((row) =>
        row.map((tile) => {
          if (tile.color === targetColor || tile.special === 'color_bomb') {
            return null;
          }
          return { ...tile };
        })
      );

      setScore((s) => s + 1500);
      const { newBoard } = applyGravityAndRefill(nextBoard);
      setBoard(newBoard);

      await new Promise((r) => setTimeout(r, 280));
      await resolveBoard(newBoard, undefined, undefined, 1);
      setIsProcessing(false);
      return;
    }

    // 2. Fish Combo Interactions (e.g. Fish + Fish or Fish + Special)
    if (t1.special === 'fish' && t2.special === 'fish') {
      setMovesLeft((m) => m - 1);
      sounds.playFishSwim();
      addFloatingText('FISH FRENZY!', 50, 45, '#38BDF8', 'lg');

      // Launch 3 fish!
      await Promise.all([
        launchFish(r1, c1, t1.color, board),
        launchFish(r1, c1, t2.color, board),
        launchFish(r2, c2, t1.color, board)
      ]);

      const cleared = board.map((r, ri) =>
        r.map((c, ci) => ((ri === r1 && ci === c1) || (ri === r2 && ci === c2) ? null : { ...c }))
      );
      const { newBoard } = applyGravityAndRefill(cleared);
      setBoard(newBoard);
      await resolveBoard(newBoard);
      setIsProcessing(false);
      return;
    }

    // 3. Standard Swap & Verification
    sounds.playSwap();

    const swappedBoard = board.map((row) => row.map((t) => ({ ...t })));
    swappedBoard[r1][c1] = { ...t2, row: r1, col: c1 };
    swappedBoard[r2][c2] = { ...t1, row: r2, col: c2 };

    setBoard(swappedBoard);

    // Check matches
    const matchCheck = findMatches(swappedBoard, { r: r1, c: c1 }, { r: r2, c: c2 });

    if (matchCheck.matchedCoords.length > 0 || matchCheck.damagedCages.length > 0) {
      // Valid move!
      setMovesLeft((m) => m - 1);
      await resolveBoard(swappedBoard, { r: r1, c: c1 }, { r: r2, c: c2 }, 1);
    } else {
      // Invalid move -> Revert
      await new Promise((r) => setTimeout(r, 220));
      sounds.playInvalid();
      setBoard(board);
    }

    setIsProcessing(false);
  };

  // Tile Click Handler
  const handleTileClick = async (r: number, c: number) => {
    if (isProcessing || gameResult) return;

    // Handle Active Booster Actions
    if (activeBooster === 'hammer') {
      // Hammer strike: destroys target or breaks cage
      sounds.playCageBreak();
      const targetTile = board[r][c];

      const newBoard = board.map((row) => row.map((t) => ({ ...t })));
      if (targetTile.caged) {
        newBoard[r][c].caged = false;
        if (currentStage.targetType === 'cage') {
          setRescuedTargetCount((cnt) => Math.min(currentStage.targetCount, cnt + 1));
        }
      } else {
        newBoard[r][c].special = 'normal';
      }

      spawnParticles(r, c, '#F59E0B');
      addFloatingText('🔨 SMASH!', (c + 0.5) * (100 / 9), (r + 0.5) * (100 / 9), '#F59E0B', 'md');

      // Deduct booster
      updateProgress((p) => ({
        ...p,
        boosters: { ...p.boosters, hammer: Math.max(0, p.boosters.hammer - 1) }
      }));
      setActiveBooster(null);

      // Gravity and resolve
      const withNull: (Tile | null)[][] = newBoard.map((row, ri) =>
        row.map((tile, ci) => (ri === r && ci === c && !tile.caged ? null : tile))
      );
      const { newBoard: refilled } = applyGravityAndRefill(withNull);
      setBoard(refilled);
      setIsProcessing(true);
      await resolveBoard(refilled);
      setIsProcessing(false);
      return;
    }

    if (activeBooster === 'switch') {
      if (!switchFirstTile) {
        setSwitchFirstTile({ r, c });
        sounds.playSwap();
      } else {
        const { r: r1, c: c1 } = switchFirstTile;
        const isNeighbor = Math.abs(r1 - r) + Math.abs(c1 - c) === 1;
        if (isNeighbor) {
          sounds.playSwap();
          const next = board.map((row) => row.map((t) => ({ ...t })));
          const t1 = next[r1][c1];
          const t2 = next[r][c];
          next[r1][c1] = { ...t2, row: r1, col: c1 };
          next[r][c] = { ...t1, row: r, col: c };

          updateProgress((p) => ({
            ...p,
            boosters: { ...p.boosters, switch: Math.max(0, p.boosters.switch - 1) }
          }));
          setActiveBooster(null);
          setSwitchFirstTile(null);
          setBoard(next);

          setIsProcessing(true);
          await resolveBoard(next, { r: r1, c: c1 }, { r, c }, 1);
          setIsProcessing(false);
        } else {
          setSwitchFirstTile({ r, c });
        }
      }
      return;
    }

    // Normal Click Interaction (Click 1st tile, then click neighbor)
    if (!selectedTile) {
      // If clicking directly on a Special Candy, offer instant tap detonation
      if (
        board[r][c].special === 'mega_bomb' ||
        board[r][c].special === 'striped_h' ||
        board[r][c].special === 'striped_v'
      ) {
        setSelectedTile({ r, c });
        sounds.playSwap();
        addFloatingText('한 번 더 탭하면 줄 폭파!', (c + 0.5) * (100 / 9), (r + 0.5) * (100 / 9), '#38BDF8', 'sm');
        return;
      }
      setSelectedTile({ r, c });
      sounds.playSwap();
    } else {
      // If tapping the already-selected Special Candy again -> Immediate Detonation!
      if (
        selectedTile.r === r &&
        selectedTile.c === c &&
        (board[r][c].special === 'mega_bomb' ||
          board[r][c].special === 'striped_h' ||
          board[r][c].special === 'striped_v')
      ) {
        performSwap(r, c, r, c);
        return;
      }
      const isNeighbor = Math.abs(selectedTile.r - r) + Math.abs(selectedTile.c - c) === 1;
      if (isNeighbor) {
        performSwap(selectedTile.r, selectedTile.c, r, c);
      } else {
        setSelectedTile({ r, c });
        sounds.playSwap();
      }
    }
  };

  // Mobile / Drag Swipe Handler
  const handleSwipe = (fromR: number, fromC: number, toR: number, toC: number) => {
    performSwap(fromR, fromC, toR, toC);
  };

  // Booster Selection / Use
  const handleSelectBooster = async (type: BoosterType | null) => {
    if (isProcessing) return;

    if (type === 'bomb') {
      // Immediately place a color bomb at random un-caged position
      sounds.playColorBomb();
      const validCoords: [number, number][] = [];
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (!board[r][c].caged && board[r][c].special === 'normal') {
            validCoords.push([r, c]);
          }
        }
      }

      if (validCoords.length > 0) {
        const [br, bc] = validCoords[Math.floor(Math.random() * validCoords.length)];
        const nextBoard = board.map((row) => row.map((t) => ({ ...t })));
        nextBoard[br][bc].special = 'color_bomb';
        setBoard(nextBoard);
        addFloatingText('💣 컬러밤 장착!', (bc + 0.5) * (100 / 9), (br + 0.5) * (100 / 9), '#EC4899', 'lg');

        updateProgress((p) => ({
          ...p,
          boosters: { ...p.boosters, bomb: Math.max(0, p.boosters.bomb - 1) }
        }));
      }
      return;
    }

    if (type === 'fish_summon') {
      // Summon 2 fish immediately!
      sounds.playFishSwim();
      updateProgress((p) => ({
        ...p,
        boosters: { ...p.boosters, fish_summon: Math.max(0, p.boosters.fish_summon - 1) }
      }));

      setIsProcessing(true);
      await Promise.all([
        launchFish(4, 4, 'blue', board),
        launchFish(4, 4, 'yellow', board)
      ]);
      await resolveBoard(board);
      setIsProcessing(false);
      return;
    }

    setActiveBooster(type);
    setSwitchFirstTile(null);
  };

  // Buy Booster with Coins
  const handleBuyBooster = (type: BoosterType) => {
    const booster = BOOSTERS.find((b) => b.id === type);
    if (!booster) return;

    if (progress.coins >= booster.cost) {
      sounds.playSpecialCreate();
      updateProgress((p) => ({
        ...p,
        coins: p.coins - booster.cost,
        boosters: { ...p.boosters, [type]: (p.boosters[type] || 0) + 1 }
      }));
      addFloatingText(`+1 ${booster.name}!`, 50, 50, '#38BDF8', 'md');
    } else {
      sounds.playInvalid();
      addFloatingText('코인이 부족합니다! (스테이지를 클리어해 획득)', 50, 50, '#F87171', 'sm');
    }
  };

  // Extra +5 Moves on Defeat
  const handleAddExtraMoves = () => {
    if (progress.coins >= 60) {
      sounds.playSpecialCreate();
      updateProgress((p) => ({ ...p, coins: p.coins - 60 }));
      setMovesLeft((m) => m + 5);
      setGameResult(null);
    } else {
      sounds.playInvalid();
      addFloatingText('코인이 부족합니다!', 50, 50, '#F87171', 'sm');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-sky-950 font-sans select-none">
      {/* Whimsical Pastel Candy Sky Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/src/assets/images/candy_game_sky_bg_1790582146541.jpg"
          alt="Candy Sky Background"
          className="w-full h-full object-cover object-top filter brightness-105"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sky-300/30 via-transparent to-sky-950/80" />
      </div>

      {/* 1. Header Bar (Matching original screenshot) */}
      <HeaderBar
        stage={currentStage}
        score={score}
        movesLeft={movesLeft}
        rescuedTargetCount={rescuedTargetCount}
        onOpenMap={() => setShowStageMap(true)}
        onOpenShop={() => setShowShop(true)}
        onRestart={() => startStage(currentStage)}
      />

      {/* 2. Interactive Game Board */}
      <div className="flex-1 flex items-center justify-center py-1 sm:py-2 z-10 w-full">
        <GameBoard
          board={board}
          selectedTile={activeBooster === 'switch' ? switchFirstTile : selectedTile}
          activeBooster={activeBooster}
          hintTiles={hintTiles}
          flyingFishes={flyingFishes}
          floatingTexts={floatingTexts}
          particles={particles}
          candySkin={progress.equippedCandySkin}
          boardSkin={progress.equippedBoardSkin}
          onTileClick={handleTileClick}
          onSwipe={handleSwipe}
        />
      </div>

      {/* 3. Bottom Booster Inventory Bar */}
      <BoosterBar
        boosters={progress.boosters}
        activeBooster={activeBooster}
        coins={progress.coins}
        onSelectBooster={handleSelectBooster}
        onBuyBooster={handleBuyBooster}
        onOpenShop={() => setShowShop(true)}
      />

      {/* Sugar Crush Overlay Animation */}
      <SugarCrushOverlay active={isSugarCrush} />

      {/* Saga World Map Modal */}
      {showStageMap && (
        <StageMap
          progress={progress}
          currentStageId={currentStage.id}
          onSelectStage={(newStg) => {
            setShowStageMap(false);
            startStage(newStg);
          }}
          onOpenShop={() => setShowShop(true)}
          onClose={() => setShowStageMap(false)}
        />
      )}

      {/* Candy Shop Modal */}
      {showShop && (
        <ShopModal
          progress={progress}
          onBuySkin={handleBuySkin}
          onEquipSkin={handleEquipSkin}
          onBuyBundle={handleBuyBundle}
          onClaimDailyReward={handleClaimDailyReward}
          canClaimDaily={canClaimDaily}
          onClose={() => setShowShop(false)}
        />
      )}

      {/* Victory / Defeat Result Modal */}
      {gameResult && (
        <ResultModal
          isVictory={gameResult === 'victory'}
          score={score}
          stage={currentStage}
          rescuedCount={rescuedTargetCount}
          coins={progress.coins}
          onNextStage={() => {
            const nextIdx = STAGES.findIndex((s) => s.id === currentStage.id) + 1;
            const nextStage = STAGES[nextIdx] || STAGES[0];
            startStage(nextStage);
          }}
          onRetry={() => startStage(currentStage)}
          onOpenMap={() => {
            setGameResult(null);
            setShowStageMap(true);
          }}
          onAddExtraMoves={handleAddExtraMoves}
        />
      )}
    </div>
  );
}
