import { BoosterInfo, UserProgress } from '../types/game';

export const BOOSTERS: BoosterInfo[] = [
  {
    id: 'hammer',
    name: '롤리팝 해머',
    icon: '🍭',
    desc: '원하는 캔디나 장애물 1개를 즉시 부숩니다.',
    cost: 150
  },
  {
    id: 'switch',
    name: '자유 스왑',
    icon: '👆',
    desc: '매치와 상관없이 두 캔디의 자리를 맞바꿉니다.',
    cost: 120
  },
  {
    id: 'bomb',
    name: '컬러밤 투척',
    icon: '💣',
    desc: '보드에 즉시 무지개 컬러밤 1개를 생성합니다.',
    cost: 200
  },
  {
    id: 'fish_summon',
    name: '물고기 소환',
    icon: '🐟',
    desc: '젤리 물고기 2마리를 즉시 소환하여 목표물을 타격합니다.',
    cost: 180
  }
];

export const INITIAL_USER_PROGRESS: UserProgress = {
  unlockedStage: 3, // Enable Stage 3 directly so user can immediately play the requested stage, with Stage 1 & 2 also playable!
  stageScores: { 1: 4200, 2: 6800 },
  stageStars: { 1: 3, 2: 2 },
  coins: 500,
  boosters: {
    hammer: 3,
    switch: 3,
    bomb: 2,
    fish_summon: 3
  },
  equippedCandySkin: 'classic',
  equippedBoardSkin: 'cyan',
  unlockedCandySkins: ['classic'],
  unlockedBoardSkins: ['cyan']
};
