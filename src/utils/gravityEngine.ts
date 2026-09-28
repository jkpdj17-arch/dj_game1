import { CandyColor, Tile } from '../types/game';
import { BOARD_SIZE, CANDY_COLORS } from '../constants/stages';

/**
 * Applies gravity to drop candies down into empty spaces (null)
 * and refills top empty spaces with newly generated random candies.
 * IMPORTANT: Caged candies (철망) are fixed obstacles and CANNOT fall!
 */
export function applyGravityAndRefill(board: (Tile | null)[][]): {
  newBoard: Tile[][];
  droppedCount: number;
} {
  let droppedCount = 0;
  const newBoard: Tile[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null as unknown as Tile)
  );

  for (let c = 0; c < BOARD_SIZE; c++) {
    // 1. Identify which rows in column c have fixed caged candies
    const isCagedRow = new Set<number>();
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (board[r][c]?.caged) {
        isCagedRow.add(r);
        // Caged candy stays in its exact place!
        newBoard[r][c] = {
          ...board[r][c]!,
          row: r,
          col: c,
          isNew: false
        };
      }
    }

    // 2. Collect all movable (non-caged, non-null) candies from bottom up
    const movableTiles: Tile[] = [];
    for (let r = BOARD_SIZE - 1; r >= 0; r--) {
      if (!isCagedRow.has(r) && board[r][c] !== null) {
        movableTiles.push(board[r][c]!);
      }
    }

    // 3. Fill the non-caged rows from bottom to top with movable candies
    let tileIdx = 0;
    for (let r = BOARD_SIZE - 1; r >= 0; r--) {
      if (isCagedRow.has(r)) continue;

      if (tileIdx < movableTiles.length) {
        const tile = movableTiles[tileIdx];
        if (tile.row !== r) {
          droppedCount++;
        }
        newBoard[r][c] = {
          ...tile,
          row: r,
          col: c,
          isNew: false
        };
        tileIdx++;
      } else {
        // Spawn fresh candy for remaining top empty spots
        const randomColor: CandyColor =
          CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)];
        newBoard[r][c] = {
          id: `spawn-${r}-${c}-${Date.now()}-${Math.random()}`,
          row: r,
          col: c,
          color: randomColor,
          special: 'normal',
          caged: false,
          isNew: true
        };
        droppedCount++;
      }
    }
  }

  return { newBoard, droppedCount };
}
