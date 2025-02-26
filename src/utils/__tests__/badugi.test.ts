import { describe, it, suite, expect } from 'vitest'
import { parseRange, calculateBadugiOdds, ALL_VALID_HANDS } from '../badugi'
describe('ALL_VALID_HANDS', () => {
  it('数が正しい', () => {
    expect(ALL_VALID_HANDS.length).toEqual(286);
  });
  it('すべての有効な3枚組み合わせを含む', () => {
    expect(ALL_VALID_HANDS[0]).toEqual('A23');
    expect(ALL_VALID_HANDS[1]).toEqual('A24');
    expect(ALL_VALID_HANDS[2]).toEqual('A34');
    expect(ALL_VALID_HANDS[ALL_VALID_HANDS.length - 2]).toEqual('TQK');
    expect(ALL_VALID_HANDS[ALL_VALID_HANDS.length - 1]).toEqual('JQK');
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