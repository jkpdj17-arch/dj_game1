import { INITIAL_USER_PROGRESS } from '../constants/boosters';
import { UserProgress } from '../types/game';

const STORAGE_KEY = 'candy_jewel_progress_v1';

export function loadUserProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...INITIAL_USER_PROGRESS,
        ...parsed,
        boosters: {
          ...INITIAL_USER_PROGRESS.boosters,
          ...(parsed.boosters || {})
        },
        equippedCandySkin: parsed.equippedCandySkin || INITIAL_USER_PROGRESS.equippedCandySkin,
        equippedBoardSkin: parsed.equippedBoardSkin || INITIAL_USER_PROGRESS.equippedBoardSkin,
        unlockedCandySkins: parsed.unlockedCandySkins || INITIAL_USER_PROGRESS.unlockedCandySkins,
        unlockedBoardSkins: parsed.unlockedBoardSkins || INITIAL_USER_PROGRESS.unlockedBoardSkins
      };
    }
  } catch (e) {
    console.error('Failed to load user progress:', e);
  }
  return INITIAL_USER_PROGRESS;
}

export function saveUserProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save user progress:', e);
  }
}
