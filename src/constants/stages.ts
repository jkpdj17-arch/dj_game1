import { Stage } from '../types/game';

export const STAGES: Stage[] = [
  {
    id: 1,
    title: '스테이지 1',
    subtitle: '달콤한 첫걸음',
    moves: 20,
    targetType: 'score',
    targetCount: 3000,
    starScores: [2000, 3500, 5000],
    cages: [],
    description: '캔디를 스왑하여 3개 이상 매치하고 3,000점을 달성하세요!'
  },
  {
    id: 2,
    title: '스테이지 2',
    subtitle: '신비한 젤리 물고기',
    moves: 22,
    targetType: 'fish',
    targetCount: 5,
    starScores: [3000, 5500, 8000],
    cages: [
      [3, 3], [3, 5],
      [5, 3], [5, 5]
    ],
    description: '캔디 4개를 2×2 정사각형으로 매치하여 젤리 물고기를 5번 소환하세요!'
  },
  {
    id: 3,
    title: '스테이지 3',
    subtitle: '철망 속 캔디 구출',
    moves: 25,
    targetType: 'cage',
    targetCount: 8,
    starScores: [4000, 7500, 11000],
    // The exact 8 cages matching the user's provided screenshot
    cages: [
      [2, 1], [2, 7],
      [3, 3], [3, 5],
      [5, 3], [5, 5],
      [6, 1], [6, 7]
    ],
    description: '철망에 갇힌 캔디 8개를 인접 매치나 물고기로 모두 구출하세요!'
  },
  {
    id: 4,
    title: '스테이지 4',
    subtitle: '컬러밤과 특수 콤보',
    moves: 24,
    targetType: 'score',
    targetCount: 12000,
    starScores: [6000, 10000, 15000],
    cages: [
      [1, 4], [7, 4],
      [4, 1], [4, 7]
    ],
    description: '5개 일렬 매치로 컬러밤을 만들고 대량의 점수를 획득하세요!'
  },
  {
    id: 5,
    title: '스테이지 5',
    subtitle: '캔디 왕국 대모험',
    moves: 26,
    targetType: 'cage',
    targetCount: 10,
    starScores: [8000, 14000, 20000],
    cages: [
      [1, 1], [1, 7],
      [2, 3], [2, 5],
      [4, 0], [4, 8],
      [6, 3], [6, 5],
      [7, 1], [7, 7]
    ],
    description: '보드 전역에 갇힌 10개의 캔디를 26턴 안에 모두 구출해내세요!'
  }
];

export const BOARD_SIZE = 9;

export const CANDY_COLORS = ['yellow', 'red', 'blue', 'orange', 'green'] as const;
