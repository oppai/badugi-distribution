type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K';
export const BADUGI_LABELS = ['4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'Tri']

// ランクの強さを定義
const RANK_ORDER: Record<Rank, number> = {
  'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, 
  '7': 7, '8': 8, '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13
};

// 3枚のカードを並び替えて文字列に変換
function normalizeHand(cards: Rank[]): string {
  return [...cards].sort((a, b) => RANK_ORDER[a] - RANK_ORDER[b]).join('');
}

// 3枚組み合わせを生成
function generateCombinations(ranks: Rank[]): string[] {
  const result: string[] = [];
  for (let i = 0; i < ranks.length - 2; i++) {
    for (let j = i + 1; j < ranks.length - 1; j++) {
      for (let k = j + 1; k < ranks.length; k++) {
        result.push(normalizeHand([ranks[i], ranks[j], ranks[k]]));
      }
    }
  }
  return result;
}

// すべての有効な3枚組み合わせをあらかじめ生成
export const ALL_VALID_HANDS = (() => {
  const ranks = Object.keys(RANK_ORDER) as Rank[];
  return generateCombinations(ranks).sort((a, b) => {
    for (let i = 2; i >= 0; i--) {
      const diff = RANK_ORDER[a[i] as Rank] - RANK_ORDER[b[i] as Rank];
      if (diff !== 0) return diff;
    }
    return 0;
  });
})();

// レンジ表記を解析して3枚の組み合わせの配列を返す
export function parseRange(rangeStr: string): string[] {
  const hands = rangeStr.split(',').map(h => h.trim());
  const result = new Set<string>();

  for (const hand of hands) {
    if (hand.endsWith('+')) {
      // プラス表記の処理
      const baseHand = hand.slice(0, -1);
      if (baseHand.length !== 3) continue;
      
      const normalizedBase = normalizeHand(baseHand.split('') as Rank[]);
      const endIndex = ALL_VALID_HANDS.indexOf(normalizedBase);
      if (endIndex !== -1) {
        ALL_VALID_HANDS.slice(0, endIndex + 1).forEach(h => result.add(h));
      }
    } else {
      // 通常の3枚表記の処理
      if (hand.length !== 3) continue;
      result.add(normalizeHand(hand.split('') as Rank[]));
    }
  }

  return Array.from(result).sort((a, b) => ALL_VALID_HANDS.indexOf(a) - ALL_VALID_HANDS.indexOf(b));
}

// バドゥギの確率を計算
export function calculateBadugiOdds(hands: string[], showTri: boolean = false): Map<string, number> {
  if (hands.length == 0) {
    return new Map<string, number>();
  }

  const remainingCards = 52 - 3; // 3は選択された3枚
  const remainingTri = remainingCards - 10; // Badugiは10アウツ
  const outs = new Map<string, number>();
  for (const hand of hands) {
    const lastRank = hand[2];
    const lastRankIndex = RANK_ORDER[lastRank as Rank];
    for (let label of BADUGI_LABELS) {
      const current = outs.get(label) || 0;
      if (label == 'Tri' && !showTri) {
        continue
      } else if (label == 'Tri' && showTri) {
        outs.set(label, current + remainingTri);
      } else if (RANK_ORDER[label as Rank] < lastRankIndex) {
        outs.set(label, current);
      } else if (RANK_ORDER[label as Rank] == lastRankIndex) {
        outs.set(label, current + (lastRankIndex - 3));
      } else {
        outs.set(label, current + 1);
      }
    }
  }
  const odds = new Map<string, number>();
  const remaining = showTri ? remainingCards : remainingCards - remainingTri;
  for (const [label, value] of outs.entries()) {
    odds.set(label, value / (remaining * hands.length) * 100);
  }
  return odds;
} 