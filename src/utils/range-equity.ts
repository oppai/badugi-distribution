import { parseRange, ALL_VALID_BADUGI_HANDS } from './badugi';

// バドゥギの手札の強さを評価する関数
// 数字が小さいほど強い
function evaluateHand(hand: string): number {
  // 最も高いランクのカードの値を返す（バドゥギでは低いカードが強い）
  return Math.max(...hand.split('').map(card => {
    if (card === 'A') return 1;
    if (card === 'T') return 10;
    if (card === 'J') return 11;
    if (card === 'Q') return 12;
    if (card === 'K') return 13;
    return parseInt(card);
  }));
}

// 2つの手札を比較する関数
function compareHands(hand1: string, hand2: string): number {
  const value1 = evaluateHand(hand1);
  const value2 = evaluateHand(hand2);
  
  // 値が小さい方が強い
  return value1 - value2;
}

// レンジvsレンジの勝率を計算する関数
export function calculateRangeVsRangeEquity(range1: string, range2: string): {
  range1Equity: number;
  range2Equity: number;
  ties: number;
} {
  const hands1 = parseRange(range1);
  const hands2 = parseRange(range2);
  
  if (hands1.length === 0 || hands2.length === 0) {
    return {
      range1Equity: 0,
      range2Equity: 0,
      ties: 0
    };
  }
  
  let range1Wins = 0;
  let range2Wins = 0;
  let ties = 0;
  const totalMatchups = hands1.length * hands2.length;
  
  for (const hand1 of hands1) {
    for (const hand2 of hands2) {
      const result = compareHands(hand1, hand2);
      
      if (result < 0) {
        range1Wins++;
      } else if (result > 0) {
        range2Wins++;
      } else {
        ties++;
      }
    }
  }
  
  return {
    range1Equity: (range1Wins + ties / 2) / totalMatchups * 100,
    range2Equity: (range2Wins + ties / 2) / totalMatchups * 100,
    ties: ties / totalMatchups * 100
  };
}

// レンジvsレンジの詳細な勝率分布を計算する関数
export function calculateDetailedEquity(range1: string, range2: string): {
  range1Hands: { hand: string; equity: number }[];
  range2Hands: { hand: string; equity: number }[];
} {
  const hands1 = parseRange(range1);
  const hands2 = parseRange(range2);
  
  if (hands1.length === 0 || hands2.length === 0) {
    return {
      range1Hands: [],
      range2Hands: []
    };
  }
  
  const range1Results = hands1.map(hand1 => {
    let wins = 0;
    let ties = 0;
    
    for (const hand2 of hands2) {
      const result = compareHands(hand1, hand2);
      
      if (result < 0) {
        wins++;
      } else if (result === 0) {
        ties++;
      }
    }
    
    return {
      hand: hand1,
      equity: (wins + ties / 2) / hands2.length * 100
    };
  });
  
  const range2Results = hands2.map(hand2 => {
    let wins = 0;
    let ties = 0;
    
    for (const hand1 of hands1) {
      const result = compareHands(hand2, hand1);
      
      if (result < 0) {
        wins++;
      } else if (result === 0) {
        ties++;
      }
    }
    
    return {
      hand: hand2,
      equity: (wins + ties / 2) / hands1.length * 100
    };
  });
  
  return {
    range1Hands: range1Results.sort((a, b) => b.equity - a.equity),
    range2Hands: range2Results.sort((a, b) => b.equity - a.equity)
  };
} 
