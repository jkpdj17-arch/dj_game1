import { CandyColor, SpecialType, Tile } from '../types/game';
import { BOARD_SIZE, CANDY_COLORS } from '../constants/stages';

export interface MatchResult {
  matchedCoords: [number, number][];
  specialsToCreate: {
    row: number;
    col: number;
    color: CandyColor;
    special: SpecialType;
  }[];
  fishesToLaunch: {
    startRow: number;
    startCol: number;
    color: CandyColor;
    bonusEffect?: 'striped' | 'wrapped';
  }[];
  damagedCages: [number, number][];
  megaBombsTriggered?: [number, number][];
  stripesTriggered?: { type: 'h' | 'v'; row: number; col: number }[];
  wrappedTriggered?: [number, number][];
}

/**
 * Generates an initial board with no initial 3-matches or 2x2 squares
 */
export function createInitialBoard(cages: [number, number][]): Tile[][] {
  const board: Tile[][] = [];
  const cageSet = new Set(cages.map(([r, c]) => `${r},${c}`));

  for (let r = 0; r < BOARD_SIZE; r++) {
    const row: Tile[] = [];
    for (let c = 0; c < BOARD_SIZE; c++) {
      let color: CandyColor;
      let attempts = 0;
      do {
        color = CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)];
        attempts++;
      } while (
        attempts < 30 &&
        ((c >= 2 && row[c - 1]?.color === color && row[c - 2]?.color === color) ||
          (r >= 2 && board[r - 1][c]?.color === color && board[r - 2][c]?.color === color) ||
          (r >= 1 && c >= 1 &&
            row[c - 1]?.color === color &&
            board[r - 1][c]?.color === color &&
            board[r - 1][c - 1]?.color === color))
      );

      row.push({
        id: `tile-${r}-${c}-${Date.now()}-${Math.random()}`,
        row: r,
        col: c,
        color,
        special: 'normal',
        caged: cageSet.has(`${r},${c}`)
      });
    }
    board.push(row);
  }

  return board;
}

/**
 * Detect all matches on the board:
 * 0. 8+ candies matched -> produces 'mega_bomb'
 * 1. 2x2 squares -> produces 'fish'
 * 2. 5-in-a-row -> produces 'color_bomb'
 * 3. T/L-shape -> produces 'wrapped'
 * 4. 4-in-a-row -> produces 'striped_h' / 'striped_v'
 * 5. Striped/Wrapped/MegaBomb detonation cascades -> clears entire row/col/area!
 */
export function findMatches(
  board: Tile[][],
  lastSwapSource?: { r: number; c: number },
  lastSwapTarget?: { r: number; c: number }
): MatchResult {
  const hMatches: [number, number][][] = [];
  const vMatches: [number, number][][] = [];
  const square2x2Matches: [number, number][][] = [];

  // 1. Horizontal 3+ matches
  for (let r = 0; r < BOARD_SIZE; r++) {
    let matchGroup: [number, number][] = [];
    for (let c = 0; c < BOARD_SIZE; c++) {
      const tile = board[r][c];
      if (!tile) continue;

      if (matchGroup.length === 0) {
        matchGroup.push([r, c]);
      } else {
        const prevTile = board[matchGroup[0][0]][matchGroup[0][1]];
        if (tile.color === prevTile.color) {
          matchGroup.push([r, c]);
        } else {
          if (matchGroup.length >= 3) {
            hMatches.push([...matchGroup]);
          }
          matchGroup = [[r, c]];
        }
      }
    }
    if (matchGroup.length >= 3) {
      hMatches.push([...matchGroup]);
    }
  }

  // 2. Vertical 3+ matches
  for (let c = 0; c < BOARD_SIZE; c++) {
    let matchGroup: [number, number][] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      const tile = board[r][c];
      if (!tile) continue;

      if (matchGroup.length === 0) {
        matchGroup.push([r, c]);
      } else {
        const prevTile = board[matchGroup[0][0]][matchGroup[0][1]];
        if (tile.color === prevTile.color) {
          matchGroup.push([r, c]);
        } else {
          if (matchGroup.length >= 3) {
            vMatches.push([...matchGroup]);
          }
          matchGroup = [[r, c]];
        }
      }
    }
    if (matchGroup.length >= 3) {
      vMatches.push([...matchGroup]);
    }
  }

  // 3. 2x2 Square Matches (Jelly Fish Creation)
  const squareUsed = new Set<string>();
  for (let r = 0; r < BOARD_SIZE - 1; r++) {
    for (let c = 0; c < BOARD_SIZE - 1; c++) {
      const t1 = board[r][c];
      const t2 = board[r][c + 1];
      const t3 = board[r + 1][c];
      const t4 = board[r + 1][c + 1];

      if (
        t1 && t2 && t3 && t4 &&
        t1.color === t2.color &&
        t1.color === t3.color &&
        t1.color === t4.color
      ) {
        const key = `${r},${c}`;
        if (!squareUsed.has(key)) {
          square2x2Matches.push([
            [r, c],
            [r, c + 1],
            [r + 1, c],
            [r + 1, c + 1]
          ]);
          squareUsed.add(key);
        }
      }
    }
  }

  const matchedSet = new Set<string>();
  const specialsToCreate: MatchResult['specialsToCreate'] = [];
  const fishesToLaunch: MatchResult['fishesToLaunch'] = [];

  // Helper to pick the best spot for special creation
  const getSpawnCoord = (coords: [number, number][]): [number, number] => {
    if (lastSwapTarget && coords.some(([r, c]) => r === lastSwapTarget.r && c === lastSwapTarget.c)) {
      return [lastSwapTarget.r, lastSwapTarget.c];
    }
    if (lastSwapSource && coords.some(([r, c]) => r === lastSwapSource.r && c === lastSwapSource.c)) {
      return [lastSwapSource.r, lastSwapSource.c];
    }
    return coords[Math.floor(coords.length / 2)];
  };

  const allLines = [...hMatches, ...vMatches];
  const consumedLineIndices = new Set<number>();
  const megaBombCreatedCoords = new Set<string>();

  // 0. CHECK FOR 8+ CANDY MATCHES (CREATES 8+ MEGA BOMB)
  const colorGroupsMap = new Map<CandyColor, { lineIndices: number[]; coords: [number, number][] }>();
  allLines.forEach((line, idx) => {
    const col = board[line[0][0]][line[0][1]]?.color;
    if (col) {
      if (!colorGroupsMap.has(col)) {
        colorGroupsMap.set(col, { lineIndices: [], coords: [] });
      }
      colorGroupsMap.get(col)!.lineIndices.push(idx);
      colorGroupsMap.get(col)!.coords.push(...line);
    }
  });

  colorGroupsMap.forEach(({ lineIndices, coords }, col) => {
    const unique = new Set<string>();
    coords.forEach(([r, c]) => unique.add(`${r},${c}`));

    if (unique.size >= 8) {
      const arr = Array.from(unique).map((s) => s.split(',').map(Number) as [number, number]);
      const [sr, sc] = getSpawnCoord(arr);

      specialsToCreate.push({
        row: sr,
        col: sc,
        color: col,
        special: 'mega_bomb'
      });
      megaBombCreatedCoords.add(`${sr},${sc}`);
      lineIndices.forEach((i) => consumedLineIndices.add(i));
      arr.forEach(([r, c]) => matchedSet.add(`${r},${c}`));
    }
  });

  // 1. Process 5-in-a-row (Color Bomb)
  allLines.forEach((line, idx) => {
    if (consumedLineIndices.has(idx)) return;
    if (line.length >= 5) {
      consumedLineIndices.add(idx);
      const [sr, sc] = getSpawnCoord(line);
      specialsToCreate.push({
        row: sr,
        col: sc,
        color: board[sr][sc].color,
        special: 'color_bomb'
      });
      line.forEach(([r, c]) => matchedSet.add(`${r},${c}`));
    }
  });

  // 2. Process T / L shapes (Wrapped Candy)
  for (let i = 0; i < hMatches.length; i++) {
    if (consumedLineIndices.has(i)) continue;
    for (let j = 0; j < vMatches.length; j++) {
      if (consumedLineIndices.has(j + hMatches.length)) continue;

      const h = hMatches[i];
      const v = vMatches[j];

      const intersection = h.find(([hr, hc]) => v.some(([vr, vc]) => vr === hr && vc === hc));
      if (intersection) {
        const [ir, ic] = intersection;
        if (board[ir][ic].color === board[h[0][0]][h[0][1]].color) {
          consumedLineIndices.add(i);
          consumedLineIndices.add(j + hMatches.length);

          specialsToCreate.push({
            row: ir,
            col: ic,
            color: board[ir][ic].color,
            special: 'wrapped'
          });

          h.forEach(([r, c]) => matchedSet.add(`${r},${c}`));
          v.forEach(([r, c]) => matchedSet.add(`${r},${c}`));
        }
      }
    }
  }

  // 3. Process 4-in-a-row (Striped Candy: Horizontal Match -> striped_h, Vertical Match -> striped_v)
  hMatches.forEach((line, idx) => {
    if (consumedLineIndices.has(idx)) return;
    if (line.length === 4) {
      consumedLineIndices.add(idx);
      const [sr, sc] = getSpawnCoord(line);
      specialsToCreate.push({
        row: sr,
        col: sc,
        color: board[sr][sc].color,
        special: 'striped_h' // Horizontal striped candy
      });
      line.forEach(([r, c]) => matchedSet.add(`${r},${c}`));
    } else if (line.length === 3) {
      line.forEach(([r, c]) => matchedSet.add(`${r},${c}`));
    }
  });

  vMatches.forEach((line, idx) => {
    const globalIdx = idx + hMatches.length;
    if (consumedLineIndices.has(globalIdx)) return;
    if (line.length === 4) {
      consumedLineIndices.add(globalIdx);
      const [sr, sc] = getSpawnCoord(line);
      specialsToCreate.push({
        row: sr,
        col: sc,
        color: board[sr][sc].color,
        special: 'striped_v' // Vertical striped candy
      });
      line.forEach(([r, c]) => matchedSet.add(`${r},${c}`));
    } else if (line.length === 3) {
      line.forEach(([r, c]) => matchedSet.add(`${r},${c}`));
    }
  });

  // 4. Process 2x2 Square matches -> Produce Jelly Fish!
  square2x2Matches.forEach((square) => {
    const [sr, sc] = getSpawnCoord(square);
    const alreadySpecial = specialsToCreate.some((s) => s.row === sr && s.col === sc);
    if (!alreadySpecial) {
      specialsToCreate.push({
        row: sr,
        col: sc,
        color: board[sr][sc].color,
        special: 'fish'
      });
    }
    square.forEach(([r, c]) => matchedSet.add(`${r},${c}`));
  });

  // Initial matched coordinates from standard 3-matches & 2x2s
  const initialMatchedCoords: [number, number][] = Array.from(matchedSet).map((s) => {
    const [r, c] = s.split(',').map(Number);
    return [r, c];
  });

  // Identify fish launched directly in match
  initialMatchedCoords.forEach(([r, c]) => {
    const tile = board[r][c];
    if (tile && tile.special === 'fish') {
      fishesToLaunch.push({
        startRow: r,
        startCol: c,
        color: tile.color
      });
    }
  });

  // Damage iron cages with exact same-color match
  const damagedCagesSet = new Set<string>();
  const orthDirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1]
  ];

  initialMatchedCoords.forEach(([mr, mc]) => {
    const matchedTile = board[mr]?.[mc];
    if (!matchedTile) return;

    if (matchedTile.caged) {
      damagedCagesSet.add(`${mr},${mc}`);
    }

    orthDirs.forEach(([dr, dc]) => {
      const nr = mr + dr;
      const nc = mc + dc;
      if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
        const neighbor = board[nr][nc];
        if (neighbor?.caged && neighbor.color === matchedTile.color) {
          damagedCagesSet.add(`${nr},${nc}`);
        }
      }
    });
  });

  // ===============================================================
  // 5. STRIPED CANDY & SPECIAL DETONATION CASCADE
  // "이 캔디가 부서지면 표시되어있는 줄이 없어지게 해줘"
  // Horizontal Striped (striped_h): Clears entire row [tr, 0..8]!
  // Vertical Striped (striped_v): Clears entire col [0..8, tc]!
  // Wrapped Candy: Clears 3x3 surrounding area!
  // Mega Bomb: Clears 9 cells!
  // ===============================================================
  const stripesTriggered: { type: 'h' | 'v'; row: number; col: number }[] = [];
  const megaBombsTriggered: [number, number][] = [];
  const wrappedTriggered: [number, number][] = [];
  const triggeredQueue: [number, number][] = [...initialMatchedCoords];
  const processedSpecials = new Set<string>();

  while (triggeredQueue.length > 0) {
    const [tr, tc] = triggeredQueue.shift()!;
    const key = `${tr},${tc}`;
    if (processedSpecials.has(key)) continue;
    processedSpecials.add(key);

    const tile = board[tr]?.[tc];
    if (!tile) continue;

    // A. HORIZONTAL STRIPED CANDY (가로 줄무늬 캔디가 부서지면 -> 가로 전체 줄 9칸 전부 폭파!)
    if (tile.special === 'striped_h') {
      stripesTriggered.push({ type: 'h', row: tr, col: tc });
      for (let col = 0; col < BOARD_SIZE; col++) {
        const cellKey = `${tr},${col}`;
        if (!matchedSet.has(cellKey)) {
          matchedSet.add(cellKey);
          // Chain reaction: if the laser hits another special candy, detonate it too!
          if (board[tr][col]?.special && board[tr][col]?.special !== 'normal') {
            triggeredQueue.push([tr, col]);
          }
        }
        if (board[tr][col]?.caged) {
          damagedCagesSet.add(cellKey);
        }
      }
    }

    // B. VERTICAL STRIPED CANDY (세로 줄무늬 캔디가 부서지면 -> 세로 전체 줄 9칸 전부 폭파!)
    if (tile.special === 'striped_v') {
      stripesTriggered.push({ type: 'v', row: tr, col: tc });
      for (let row = 0; row < BOARD_SIZE; row++) {
        const cellKey = `${row},${tc}`;
        if (!matchedSet.has(cellKey)) {
          matchedSet.add(cellKey);
          // Chain reaction: if the laser hits another special candy, detonate it too!
          if (board[row][tc]?.special && board[row][tc]?.special !== 'normal') {
            triggeredQueue.push([row, tc]);
          }
        }
        if (board[row][tc]?.caged) {
          damagedCagesSet.add(cellKey);
        }
      }
    }

    // C. WRAPPED CANDY (사진의 포장 캔디: 주변 6칸 없어지게 파괴!)
    if (tile.special === 'wrapped') {
      wrappedTriggered.push([tr, tc]);
      const candidateOffsets = [
        [-1, 0], [1, 0], [0, -1], [0, 1],
        [-1, -1], [1, 1], [-1, 1], [1, -1]
      ];
      let count = 0;
      for (const [dr, dc] of candidateOffsets) {
        if (count >= 6) break;
        const nr = tr + dr;
        const nc = tc + dc;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
          const cellKey = `${nr},${nc}`;
          if (!matchedSet.has(cellKey)) {
            matchedSet.add(cellKey);
            if (board[nr][nc]?.special && board[nr][nc]?.special !== 'normal') {
              triggeredQueue.push([nr, nc]);
            }
          }
          if (board[nr][nc]?.caged) {
            damagedCagesSet.add(cellKey);
          }
          count++;
        }
      }
    }

    // D. 8+ MEGA BOMB (9-cell super explosion)
    if (tile.special === 'mega_bomb') {
      megaBombsTriggered.push([tr, tc]);
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = tr + dr;
          const nc = tc + dc;
          if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
            const cellKey = `${nr},${nc}`;
            if (!matchedSet.has(cellKey)) {
              matchedSet.add(cellKey);
              if (board[nr][nc]?.special && board[nr][nc]?.special !== 'normal') {
                triggeredQueue.push([nr, nc]);
              }
            }
            if (board[nr][nc]?.caged) {
              damagedCagesSet.add(cellKey);
            }
          }
        }
      }
    }
  }

  // Final matched coords and damaged cages after all lasers and special explosions
  const matchedCoords: [number, number][] = Array.from(matchedSet).map((s) => {
    const [r, c] = s.split(',').map(Number);
    return [r, c];
  });

  const damagedCages: [number, number][] = Array.from(damagedCagesSet).map((s) => {
    const [r, c] = s.split(',').map(Number);
    return [r, c];
  });

  return {
    matchedCoords,
    specialsToCreate,
    fishesToLaunch,
    damagedCages,
    megaBombsTriggered,
    stripesTriggered,
    wrappedTriggered
  };
}

/**
 * Smart AI for Jelly Fish target selection
 */
export function findFishTarget(board: Tile[][], excludeCoords: Set<string>): [number, number] | null {
  const cagedTargets: [number, number][] = [];
  const specialTargets: [number, number][] = [];
  const normalTargets: [number, number][] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const tile = board[r][c];
      if (!tile || excludeCoords.has(`${r},${c}`)) continue;

      if (tile.caged) {
        cagedTargets.push([r, c]);
      } else if (tile.special !== 'normal') {
        specialTargets.push([r, c]);
      } else {
        normalTargets.push([r, c]);
      }
    }
  }

  if (cagedTargets.length > 0) {
    return cagedTargets[Math.floor(Math.random() * cagedTargets.length)];
  }
  if (specialTargets.length > 0) {
    return specialTargets[Math.floor(Math.random() * specialTargets.length)];
  }
  if (normalTargets.length > 0) {
    return normalTargets[Math.floor(Math.random() * normalTargets.length)];
  }
  return null;
}
