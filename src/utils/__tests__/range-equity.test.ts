import { describe, it, expect } from 'vitest'
import { calculateRangeVsRangeEquity, calculateDetailedEquity } from '../range-equity'

describe('calculateRangeVsRangeEquity', () => {
  it('空のレンジの場合は0を返す', () => {
    const result = calculateRangeVsRangeEquity('', 'A23');
    expect(result.range1Equity).toBe(0);
    expect(result.range2Equity).toBe(0);
    expect(result.ties).toBe(0);
  });

  it('同じハンドの場合は引き分けになる', () => {
    const result = calculateRangeVsRangeEquity('A23', 'A23');
    expect(result.range1Equity).toBe(50);
    expect(result.range2Equity).toBe(50);
    expect(result.ties).toBe(100);
  });

  it('明確な強さの差がある場合', () => {
    // A23（最強）vs KQJ（最弱）
    const result = calculateRangeVsRangeEquity('A23', 'KQJ');
    expect(result.range1Equity).toBe(100);
    expect(result.range2Equity).toBe(0);
    expect(result.ties).toBe(0);
  });

  it('複数ハンドのレンジ同士の計算', () => {
    // A23,A24 vs A25,KQJ
    const result = calculateRangeVsRangeEquity('A23,A24', 'A25,KQJ');
    
    // 実際の実装では、A23 > A24 > A25 > KQJの順になっている
    // A23 vs A25: A23の勝ち
    // A23 vs KQJ: A23の勝ち
    // A24 vs A25: A24の勝ち (実装では)
    // A24 vs KQJ: A24の勝ち
    // 合計: レンジ1が4勝0敗 = 100%
    
    expect(result.range1Equity).toBeCloseTo(100);
    expect(result.range2Equity).toBeCloseTo(0);
    expect(result.ties).toBeCloseTo(0);
  });

  it('プラス表記を含むレンジの計算', () => {
    const result = calculateRangeVsRangeEquity('A23+', '789');
    expect(result.range1Equity).toBeGreaterThan(50); // A23+は789より強いハンドを含む
  });
});

describe('calculateDetailedEquity', () => {
  it('空のレンジの場合は空の配列を返す', () => {
    const result = calculateDetailedEquity('', 'A23');
    expect(result.range1Hands).toEqual([]);
    expect(result.range2Hands).toEqual([]);
  });

  it('各ハンドの個別の勝率を計算する', () => {
    // A23,A24 vs A25,KQJ
    const result = calculateDetailedEquity('A23,A24', 'A25,KQJ');
    
    // レンジ1のハンド別勝率
    expect(result.range1Hands.length).toBe(2);
    
    // A23は両方に勝つ = 100%
    const a23Result = result.range1Hands.find(h => h.hand === 'A23');
    expect(a23Result).toBeDefined();
    expect(a23Result?.equity).toBeCloseTo(100);
    
    // A24も両方に勝つ = 100% (実装では)
    const a24Result = result.range1Hands.find(h => h.hand === 'A24');
    expect(a24Result).toBeDefined();
    expect(a24Result?.equity).toBeCloseTo(100);
    
    // レンジ2のハンド別勝率
    expect(result.range2Hands.length).toBe(2);
    
    // A25は両方に負ける = 0% (実装では)
    const a25Result = result.range2Hands.find(h => h.hand === 'A25');
    expect(a25Result).toBeDefined();
    expect(a25Result?.equity).toBeCloseTo(0);
    
    // KQJは両方に負ける = 0%
    const kqjResult = result.range2Hands.find(h => h.hand === 'JQK'); // 正規化されるのでJQKになる
    expect(kqjResult).toBeDefined();
    expect(kqjResult?.equity).toBeCloseTo(0);
  });

  it('結果がエクイティの降順でソートされている', () => {
    const result = calculateDetailedEquity('A23,A24,A25', 'A26,A27,A28');
    
    // レンジ1のハンドがエクイティ降順にソートされているか確認
    for (let i = 0; i < result.range1Hands.length - 1; i++) {
      expect(result.range1Hands[i].equity).toBeGreaterThanOrEqual(result.range1Hands[i + 1].equity);
    }
    
    // レンジ2のハンドがエクイティ降順にソートされているか確認
    for (let i = 0; i < result.range2Hands.length - 1; i++) {
      expect(result.range2Hands[i].equity).toBeGreaterThanOrEqual(result.range2Hands[i + 1].equity);
    }
  });
}); 
