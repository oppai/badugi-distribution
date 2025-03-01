import { describe, it, expect } from 'vitest'
import { parseRange, calculateBadugiOdds, calculateBadugiEquity, ALL_VALID_TRI_HANDS } from '../badugi'
describe('ALL_VALID_TRI_HANDS', () => {
  it('数が正しい', () => {
    expect(ALL_VALID_TRI_HANDS.length).toEqual(286);
  });
  it('すべての有効な3枚組み合わせを含む', () => {
    expect(ALL_VALID_TRI_HANDS[0]).toEqual('A23');
    expect(ALL_VALID_TRI_HANDS[1]).toEqual('A24');
    expect(ALL_VALID_TRI_HANDS[2]).toEqual('A34');
    expect(ALL_VALID_TRI_HANDS[ALL_VALID_TRI_HANDS.length - 2]).toEqual('TQK');
    expect(ALL_VALID_TRI_HANDS[ALL_VALID_TRI_HANDS.length - 1]).toEqual('JQK');
  });
});

describe('parseRange', () => {
  it('単一の3枚組み合わせを解析できる', () => {
    expect(parseRange('A23')).toEqual(['A23']);
    expect(parseRange('KQJ')).toEqual(['JQK']);
  });

  it('複数の3枚組み合わせを解析できる', () => {
    expect(parseRange('A23,238')).toEqual(['A23', '238']);
    expect(parseRange('A23, 238')).toEqual(['A23', '238']); // スペースを含む
  });

  it('プラス表記を解析できる', () => {
    expect(parseRange('A34+')).toEqual(['A23', 'A24', 'A34']);
    expect(parseRange('234+')).toEqual(['A23', 'A24', 'A34', '234']);
  });

  it('無効な入力を無視する', () => {
    expect(parseRange('A2,234')).toEqual(['234']); // 2文字は無視
    expect(parseRange('AAAA')).toEqual([]); // 4文字は無視
    expect(parseRange('')).toEqual([]); // 空文字列
  });

  it('重複を除去する', () => {
    expect(parseRange('A23,A23')).toEqual(['A23']);
    expect(parseRange('A23+,A23')).toEqual(['A23']);
  });

  it('ソートされた結果を返す', () => {
    expect(parseRange('KQJ,A23')).toEqual(['A23', 'JQK']);
  });
});

describe('calculateBadugiOdds', () => {
  it('Triを表示しない場合', () => {
    const odds = calculateBadugiOdds(['A23'], false);
    expect(odds.get('4')).toBeCloseTo(10.0);
    expect(odds.get('5')).toBeCloseTo(10.0);
    expect(odds.get('6')).toBeCloseTo(10.0);
  });
  it('Triを表示する場合', () => {
    const odds = calculateBadugiOdds(['A23'], true);
    expect(odds.get('4')).toBeCloseTo(1/49 * 100);
    expect(odds.get('5')).toBeCloseTo(1/49 * 100);
    expect(odds.get('Tri')).toBeCloseTo((1.0 - 10/49) * 100);
  });
}); 

describe('calculateBadugiEquity', () => {
  const testCases = [
    {
      hand1: ['A23'], hand2: ['A23'],
      expected: { hand1Equity: 33.3, hand2Equity: 33.3, ties: 50.0 },
    },
    {
      hand1: ['A23'], hand2: ['A2QK'],
      expected: { hand1Equity: 20.0, hand2Equity: 80.0, ties: 0.0 },
    },
  ];
  for (const testCase of testCases) {
    it(`${testCase.hand1} vs ${testCase.hand2}`, () => {
      const equity = calculateBadugiEquity(testCase.hand1, testCase.hand2);
      expect(equity.hand1Equity).toBeCloseTo(testCase.expected.hand1Equity);
      expect(equity.hand2Equity).toBeCloseTo(testCase.expected.hand2Equity);
      expect(equity.ties).toBeCloseTo(testCase.expected.ties);
      const total = equity.hand1Equity + equity.hand2Equity - equity.ties;
      expect(total).toBeCloseTo(100.0);
    });
  }
});
