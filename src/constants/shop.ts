import { SkinItem, BoosterType } from '../types/game';

export const CANDY_SKINS: SkinItem[] = [
  {
    id: 'skin_candy_classic',
    type: 'candy',
    key: 'classic',
    name: '클래식 달콤 캔디',
    desc: '원작 그대로의 달콤하고 광택 있는 5가지 기본 젤리 & 사탕',
    cost: 0,
    previewIcon: '🍬',
    previewColors: ['#FDD835', '#E53935', '#00B0FF', '#FB8C00', '#00E676']
  },
  {
    id: 'skin_candy_crystal',
    type: 'candy',
    key: 'crystal',
    name: '찬란한 크리스탈 보석',
    desc: '다이아몬드 커팅과 영롱한 보석 광택 (루비, 사파이어, 에메랄드 등)',
    cost: 350,
    previewIcon: '💎',
    previewColors: ['#FDE047', '#F43F5E', '#38BDF8', '#FB923C', '#34D399']
  },
  {
    id: 'skin_candy_neon',
    type: 'candy',
    key: 'neon',
    name: '사이버 네온 글로우',
    desc: '어두운 우주 속에서 형광으로 발광하는 일렉트릭 네온 젤리',
    cost: 450,
    previewIcon: '⚡',
    previewColors: ['#FEF08A', '#FF007A', '#00F0FF', '#FF7700', '#00FF66']
  },
  {
    id: 'skin_candy_bakery',
    type: 'candy',
    key: 'bakery',
    name: '스위트 마카롱 베이커리',
    desc: '부드러운 크림과 파스텔 감성의 디저트 마카롱 테마',
    cost: 400,
    previewIcon: '🧁',
    previewColors: ['#FEF9C3', '#FDA4AF', '#BAE6FD', '#FED7AA', '#BBF7D0']
  }
];

export const BOARD_SKINS: SkinItem[] = [
  {
    id: 'skin_board_cyan',
    type: 'board',
    key: 'cyan',
    name: '하늘빛 캔디 궁전',
    desc: '청량한 하늘색 테두리와 맑은 푸른빛 체크보드',
    cost: 0,
    previewIcon: '🏰',
    previewColors: ['#0288D1', '#29B6F6', '#38BDF8']
  },
  {
    id: 'skin_board_golden',
    type: 'board',
    key: 'golden',
    name: '황금 로열 팰리스',
    desc: '럭셔리 골드 프레임과 깊이 있는 로열 퍼플 벨벳 격자',
    cost: 300,
    previewIcon: '👑',
    previewColors: ['#F59E0B', '#7C3AED', '#4C1D95']
  },
  {
    id: 'skin_board_pink',
    type: 'board',
    key: 'pink',
    name: '달콤 딸기 베리',
    desc: '러블리한 딸기우유 핑크 프레임과 달콤한 로즈 격자',
    cost: 250,
    previewIcon: '🍓',
    previewColors: ['#EC4899', '#DB2777', '#831843']
  }
];

export interface ItemBundle {
  id: string;
  type: BoosterType;
  count: number;
  name: string;
  desc: string;
  icon: string;
  cost: number;
  discountBadge?: string;
}

export const ITEM_BUNDLES: ItemBundle[] = [
  {
    id: 'bundle_hammer_1',
    type: 'hammer',
    count: 1,
    name: '롤리팝 해머 (1개)',
    desc: '원하는 캔디나 장애물 1개를 즉시 파괴',
    icon: '🍭',
    cost: 150
  },
  {
    id: 'bundle_hammer_3',
    type: 'hammer',
    count: 3,
    name: '롤리팝 해머 (3개 팩)',
    desc: '3개 묶음 15% 할인 세트',
    icon: '🍭',
    cost: 380,
    discountBadge: '15% 할인'
  },
  {
    id: 'bundle_switch_1',
    type: 'switch',
    count: 1,
    name: '자유 스왑 (1개)',
    desc: '매치와 상관없이 두 캔디 자리 교환',
    icon: '👆',
    cost: 120
  },
  {
    id: 'bundle_switch_3',
    type: 'switch',
    count: 3,
    name: '자유 스왑 (3개 팩)',
    desc: '3개 묶음 15% 할인 세트',
    icon: '👆',
    cost: 300,
    discountBadge: '15% 할인'
  },
  {
    id: 'bundle_bomb_1',
    type: 'bomb',
    count: 1,
    name: '컬러밤 투척 (1개)',
    desc: '보드에 즉시 무지개 컬러밤 1개 생성',
    icon: '💣',
    cost: 200
  },
  {
    id: 'bundle_bomb_3',
    type: 'bomb',
    count: 3,
    name: '컬러밤 투척 (3개 팩)',
    desc: '3개 묶음 15% 할인 세트',
    icon: '💣',
    cost: 510,
    discountBadge: '15% 할인'
  },
  {
    id: 'bundle_fish_1',
    type: 'fish_summon',
    count: 1,
    name: '물고기 소환 (1개)',
    desc: '젤리 물고기 2마리를 즉시 출격',
    icon: '🐟',
    cost: 180
  },
  {
    id: 'bundle_fish_3',
    type: 'fish_summon',
    count: 3,
    name: '물고기 소환 (3개 팩)',
    desc: '3개 묶음 15% 할인 세트',
    icon: '🐟',
    cost: 460,
    discountBadge: '15% 할인'
  }
];
