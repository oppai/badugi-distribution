import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import RangeEquity from '../RangeEquity.vue';
import * as rangeEquityUtils from '../../utils/range-equity';

// モック関数を作成
vi.mock('../../utils/range-equity', () => {
  return {
    calculateRangeVsRangeEquity: vi.fn(),
    calculateDetailedEquity: vi.fn()
  };
});

describe('RangeEquity', () => {
  beforeEach(() => {
    // モック関数をリセット
    vi.resetAllMocks();
    
    // デフォルトのモック実装を設定
    vi.mocked(rangeEquityUtils.calculateRangeVsRangeEquity).mockReturnValue({
      range1Equity: 60,
      range2Equity: 40,
      ties: 0
    });
    
    vi.mocked(rangeEquityUtils.calculateDetailedEquity).mockReturnValue({
      range1Hands: [
        { hand: 'A23', equity: 100 },
        { hand: 'A24', equity: 50 }
      ],
      range2Hands: [
        { hand: 'A25', equity: 50 },
        { hand: 'JQK', equity: 0 }
      ]
    });
  });
  
  it('初期状態では結果が表示されない', () => {
    const wrapper = mount(RangeEquity);
    expect(wrapper.find('.no-results').exists()).toBe(true);
    expect(wrapper.find('.equity-display').exists()).toBe(false);
  });
  
  it('両方のレンジが入力されると結果が表示される', async () => {
    const wrapper = mount(RangeEquity);
    
    // レンジを入力
    await wrapper.find('.range-input:nth-child(1) input').setValue('A23,A24');
    await wrapper.find('.range-input:nth-child(2) input').setValue('A25,KQJ');
    
    // 計算関数が呼ばれたことを確認
    expect(rangeEquityUtils.calculateRangeVsRangeEquity).toHaveBeenCalledWith('A23,A24', 'A25,KQJ');
    expect(rangeEquityUtils.calculateDetailedEquity).toHaveBeenCalledWith('A23,A24', 'A25,KQJ');
    
    // 結果が表示されることを確認
    expect(wrapper.find('.no-results').exists()).toBe(false);
    expect(wrapper.find('.equity-display').exists()).toBe(true);
    
    // 勝率バーが表示されることを確認
    expect(wrapper.find('.equity-bar-range1').exists()).toBe(true);
    expect(wrapper.find('.equity-bar-range2').exists()).toBe(true);
    
    // 詳細な結果が表示されることを確認
    const tables = wrapper.findAll('table');
    expect(tables.length).toBe(2);
    
    // レンジ1の詳細テーブル
    const range1Table = tables[0];
    const range1Rows = range1Table.findAll('tbody tr');
    expect(range1Rows.length).toBe(2);
    expect(range1Rows[0].text()).toContain('A23');
    expect(range1Rows[0].text()).toContain('100.0%');
    
    // レンジ2の詳細テーブル
    const range2Table = tables[1];
    const range2Rows = range2Table.findAll('tbody tr');
    expect(range2Rows.length).toBe(2);
    expect(range2Rows[0].text()).toContain('A25');
    expect(range2Rows[0].text()).toContain('50.0%');
  });
  
  it('引き分けがある場合は引き分けバーが表示される', async () => {
    // モックを変更して引き分けを含める
    vi.mocked(rangeEquityUtils.calculateRangeVsRangeEquity).mockReturnValue({
      range1Equity: 40,
      range2Equity: 40,
      ties: 20
    });
    
    const wrapper = mount(RangeEquity);
    
    // レンジを入力
    await wrapper.find('.range-input:nth-child(1) input').setValue('A23');
    await wrapper.find('.range-input:nth-child(2) input').setValue('A23');
    
    // 引き分けバーが表示されることを確認
    expect(wrapper.find('.equity-bar-ties').exists()).toBe(true);
    expect(wrapper.find('.equity-bar-ties').text()).toContain('20.0%');
  });
  
  it('レンジが空の場合は結果が表示されない', async () => {
    const wrapper = mount(RangeEquity);
    
    // 一方のレンジだけ入力
    await wrapper.find('.range-input:nth-child(1) input').setValue('A23');
    
    // 結果が表示されないことを確認
    expect(wrapper.find('.no-results').exists()).toBe(true);
    expect(wrapper.find('.equity-display').exists()).toBe(false);
  });
}); 
