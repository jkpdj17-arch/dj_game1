export type CandyColor = 'yellow' | 'red' | 'blue' | 'orange' | 'green';

export type SpecialType = 
  | 'normal' 
  | 'striped_h' 
  | 'striped_v' 
  | 'wrapped' 
  | 'color_bomb' 
  | 'fish'
  | 'mega_bomb';

export type CandySkinTheme = 'classic' | 'crystal' | 'neon' | 'bakery';
export type BoardSkinTheme = 'cyan' | 'golden' | 'pink';

export interface Tile {
  id: string;
  row: number;
  col: number;
  color: CandyColor;
  special: SpecialType;
  caged: boolean; // Iron cage around candy (obstacle to rescue)
  isMatched?: boolean;
  isNew?: boolean;
}

export type BoosterType = 'hammer' | 'switch' | 'bomb' | 'fish_summon';

export interface BoosterInfo {
  id: BoosterType;
  name: string;
  icon: string;
  desc: string;
  cost: number;
}

export interface SkinItem {
  id: string;
  type: 'candy' | 'board';
  key: CandySkinTheme | BoardSkinTheme;
  name: string;
  desc: string;
  cost: number;
  previewIcon: string;
  previewColors: string[];
}

export type StageTargetType = 'cage' | 'fish' | 'score';

export interface Stage {
  id: number;
  title: string;
  subtitle: string;
  moves: number;
  targetType: StageTargetType;
  targetCount: number;
  starScores: [number, number, number];
  cages: [number, number][]; // row, col coordinates for caged candies
  description: string;
}

export interface FlyingFish {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  targetRow: number;
  targetCol: number;
  color: CandyColor;
  bonusEffect?: 'striped' | 'wrapped';
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export interface UserProgress {
  unlockedStage: number;
  stageScores: Record<number, number>;
  stageStars: Record<number, number>;
  coins: number;
  boosters: Record<BoosterType, number>;
  equippedCandySkin: CandySkinTheme;
  equippedBoardSkin: BoardSkinTheme;
  unlockedCandySkins: CandySkinTheme[];
  unlockedBoardSkins: BoardSkinTheme[];
}
