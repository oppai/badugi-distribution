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
export const ALL_VALID_TRI_HANDS = (() => {
  const ranks = Object.keys(RANK_ORDER) as Rank[];
  return generateCombinations(ranks).sort((a, b) => {
    for (let i = 2; i >= 0; i--) {
      const diff = RANK_ORDER[a[i] as Rank] - RANK_ORDER[b[i] as Rank];
      if (diff !== 0) return diff;
    }
    return 0;
  });
})();

export const ALL_VALID_BADUGI_HANDS = (() => {
  const ranks = Object.keys(RANK_ORDER) as Rank[];
  const result: string[] = [];
  for (let i = 0; i < ranks.length - 3; i++) {
    for (let j = i + 1; j < ranks.length - 2; j++) {
      for (let k = j + 1; k < ranks.length - 1; k++) {
        for (let l = k + 1; l < ranks.length; l++) {
          result.push(normalizeHand([ranks[i], ranks[j], ranks[k], ranks[l]]));
        }
      }
    }
  }
  return result.sort((a, b) => {
    for (let i = 3; i >= 0; i--) {
      const diff = RANK_ORDER[a[i] as Rank] - RANK_ORDER[b[i] as Rank];
      if (diff !== 0) return diff;
    }
    return 0;
  });
})();

export const ALL_VALID_HANDS = [...ALL_VALID_BADUGI_HANDS, ...ALL_VALID_TRI_HANDS];

// レンジ表記を解析して3枚の組み合わせの配列を返す
export function parseRange(rangeStr: string): string[] {
  // すでに3枚/4枚の組み合わせの場合
  const idx = ALL_VALID_HANDS.indexOf(rangeStr);
  if (idx !== -1) {
    return [rangeStr];
  }

  const hands = rangeStr.split(',').map(h => h.trim());
  const result = new Set<string>();
  const removeHands = new Set<string>();

  for (let hand of hands) {
    if (hand.startsWith('-')) {
      // 括弧を削除
      hand = hand.replace(/[\(\)]/g, '');

      // マイナス表記の処理
      if (hand.endsWith('+')) {
        const baseHand = hand.slice(1, -1);
        if (baseHand.length !== 3) continue;

        const normalizedBase = normalizeHand(baseHand.split('') as Rank[]);
        const endIndex = ALL_VALID_HANDS.indexOf(normalizedBase);
        if (endIndex !== -1) {
          ALL_VALID_HANDS.slice(0, endIndex + 1).forEach(h => removeHands.add(h));
          console.log("removeHands", normalizedBase, removeHands);
        }
      } else {
        const baseHand = hand.slice(1);
        if (baseHand.length !== 3) continue;
        removeHands.add(normalizeHand(baseHand.split('') as Rank[]));
      }
    } else if (hand.endsWith('+')) {
      // プラス表記の処理
      const baseHand = hand.slice(0, -1);
      if (baseHand.length !== 3) continue;
      
      const normalizedBase = normalizeHand(baseHand.split('') as Rank[]);
      const endIndex = ALL_VALID_TRI_HANDS.indexOf(normalizedBase);
      if (endIndex !== -1) {
        ALL_VALID_TRI_HANDS.slice(0, endIndex + 1).forEach(h => result.add(h));
      }
    } else {
      if (hand.length !== 3) continue;
      result.add(normalizeHand(hand.split('') as Rank[]));
    }
  }

  for (const hand of removeHands) {
    result.delete(hand);
  }
  return Array.from(result).sort((a, b) => ALL_VALID_TRI_HANDS.indexOf(a) - ALL_VALID_TRI_HANDS.indexOf(b));
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

function drawOneCard(hand: string): string {
  const ranks = Object.keys(RANK_ORDER) as Rank[];
  const cards = hand.split('');
  const blanks = Array(52 - 13).fill("");
  const deck = [...ranks, ...blanks];

  if (cards.length == 4) {
    return hand;
  }

  const picked = deck[Math.floor(Math.random() * deck.length)];
  return [...new Set(cards.concat(picked))].sort((a, b) => RANK_ORDER[a as Rank] - RANK_ORDER[b as Rank]).join('');
}

// 3枚のハンドvs3枚のハンドの勝率を計算
function internalWinCount(hand1: string, hand2: string, iterations: number = 100_000): { hand1Wins: number, hand2Wins: number, ties: number } {
  let hand1Wins = 0;
  let hand2Wins = 0;
  let ties = 0;

  for (let i = 0; i < iterations; i++) {
    const newHand1 = drawOneCard(hand1);
    const newHand2 = drawOneCard(hand2);
    const newHand1Score = ALL_VALID_HANDS.indexOf(newHand1);
    const newHand2Score = ALL_VALID_HANDS.indexOf(newHand2);

    // 小さいほうが勝つ
    if (newHand1Score < newHand2Score) {
      hand1Wins++;
    } else if (newHand1Score > newHand2Score) {
      hand2Wins++;
    } else {
      ties++;
    }
  }

  return { hand1Wins, hand2Wins, ties };
}

export function calculateBadugiEquity(heroHands: string[], villainHands: string[], iterations: number = 10_000): { heroEquity: number, villainEquity: number, tiesEquity: number } {
  const allHeroHands = heroHands.flatMap(h => parseRange(h));
  const allVillainHands = villainHands.flatMap(h => parseRange(h));
  const allUniqueHeroHands = [...new Set(allHeroHands)];
  const allUniqueVillainHands = [...new Set(allVillainHands)];
  let totalIteration = 0
  let heroWins = 0;
  let villainWins = 0;
  let ties = 0;

  for (let heroHand of allUniqueHeroHands) {
    for (let villainHand of allUniqueVillainHands) {
      const count = internalWinCount(heroHand, villainHand, iterations);
      console.log(`${heroHand} vs ${villainHand}`, count);
      heroWins += count.hand1Wins;
      villainWins += count.hand2Wins;
      ties += count.ties;
      totalIteration += iterations;
    }
  }

  const heroEquity = Math.round(heroWins / totalIteration * 10_000) / 100;
  const villainEquity = Math.round(villainWins / totalIteration * 10_000) / 100;
  const tiesEquity = Math.round(ties / totalIteration * 10_000) / 100;

  return { heroEquity, villainEquity, tiesEquity };
}
