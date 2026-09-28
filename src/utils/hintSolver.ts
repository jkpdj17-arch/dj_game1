import { Tile } from '../types/game';
import { BOARD_SIZE } from '../constants/stages';
import { findMatches } from './matchEngine';

export interface PossibleMove {
  r1: number;
  c1: number;
  r2: number;
  c2: number;
}

/**
 * Simulates swapping two adjacent tiles and checking if it produces any match
 */
function testSwap(board: Tile[][], r1: number, c1: number, r2: number, c2: number): boolean {
  const t1 = board[r1]?.[c1];
  const t2 = board[r2]?.[c2];
  if (!t1 || !t2) return false;

  // Caged candies cannot be swapped directly
  if (t1.caged || t2.caged) return false;

  // Swapping any special candy with another or color bomb is always a valid move
  if (t1.special === 'color_bomb' || t2.special === 'color_bomb') return true;
  if (t1.special !== 'normal' && t2.special !== 'normal') return true;

  // Clone board shallowly
  const tempBoard = board.map((row) => [...row]);
  tempBoard[r1][c1] = { ...t2, row: r1, col: c1 };
  tempBoard[r2][c2] = { ...t1, row: r2, col: c2 };

  const { matchedCoords } = findMatches(tempBoard);
  return matchedCoords.length > 0;
}

/**
 * Finds the first available move on the board to provide a gentle hint
 */
export function findPossibleMove(board: Tile[][]): PossibleMove | null {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      // Test right swap
      if (c + 1 < BOARD_SIZE && testSwap(board, r, c, r, c + 1)) {
        return { r1: r, c1: c, r2: r, c2: c + 1 };
      }
      // Test down swap
      if (r + 1 < BOARD_SIZE && testSwap(board, r, c, r + 1, c)) {
        return { r1: r, c1: c, r2: r + 1, c2: c };
      }
    }
  }
  return null;
}

/**
 * Shuffles all non-caged candies on the board until at least one valid move exists
 */
export function shuffleBoard(board: Tile[][]): Tile[][] {
  let attempts = 0;
  let newBoard = board.map((row) => row.map((t) => ({ ...t })));

  while (attempts < 50) {
    attempts++;
    // Gather all non-caged colors and specials
    const movablePositions: [number, number][] = [];
    const movablePayloads: { color: Tile['color']; special: Tile['special'] }[] = [];

    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (!newBoard[r][c].caged) {
          movablePositions.push([r, c]);
          movablePayloads.push({
            color: newBoard[r][c].color,
            special: newBoard[r][c].special
          });
        }
      }
    }

    // Shuffle payloads
    for (let i = movablePayloads.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [movablePayloads[i], movablePayloads[j]] = [movablePayloads[j], movablePayloads[i]];
    }

    // Reassign
    movablePositions.forEach(([r, c], idx) => {
      newBoard[r][c].color = movablePayloads[idx].color;
      newBoard[r][c].special = movablePayloads[idx].special;
      newBoard[r][c].id = `shuffled-${r}-${c}-${Date.now()}-${Math.random()}`;
    });

    // Check if initial match exists
    const match = findMatches(newBoard);
    if (match.matchedCoords.length === 0) {
      const move = findPossibleMove(newBoard);
      if (move) {
        return newBoard;
      }
    }
  }

  return newBoard;
}
