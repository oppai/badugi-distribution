import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import RangeEquity from '../RangeEquity.vue';
import * as badugiUtils from '../../utils/badugi';

// モック関数を作成
vi.mock('../../utils/badugi', () => {
  return {
    parseRange: vi.fn().mockReturnValue(['A23', 'A24']),
    calculateBadugiEquity: vi.fn().mockReturnValue({
      heroEquity: 60,
      villainEquity: 40,
      tiesEquity: 0
    }),
    ALL_VALID_TRI_HANDS: [],
    BADUGI_LABELS: []
  };
});

describe('RangeEquity', () => {
  beforeEach(() => {
    // モック関数をリセット
    vi.clearAllMocks();
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
    expect(badugiUtils.calculateBadugiEquity).toHaveBeenCalled();
    expect(badugiUtils.parseRange).toHaveBeenCalled();
    
    // 結果が表示されることを確認
    expect(wrapper.find('.no-results').exists()).toBe(false);
    expect(wrapper.find('.equity-display').exists()).toBe(true);
    
    // 勝率バーが表示されることを確認
    expect(wrapper.find('.equity-bar-range1').exists()).toBe(true);
    expect(wrapper.find('.equity-bar-range2').exists()).toBe(true);
    
    // 詳細な結果が表示されることを確認
    const tables = wrapper.findAll('table');
    expect(tables.length).toBe(2);
  });
  
  it('引き分けがある場合は引き分けバーが表示される', async () => {
    // モックの戻り値を変更
    vi.mocked(badugiUtils.calculateBadugiEquity).mockReturnValueOnce({
      heroEquity: 40,
      villainEquity: 40,
      tiesEquity: 20
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
    // parseRangeが空の配列を返すようにモック
    vi.mocked(badugiUtils.parseRange).mockReturnValueOnce([]);
    
    const wrapper = mount(RangeEquity);
    
    // 一方のレンジだけ入力
    await wrapper.find('.range-input:nth-child(1) input').setValue('A23');
    
    // 結果が表示されないことを確認
    expect(wrapper.find('.no-results').exists()).toBe(true);
    expect(wrapper.find('.equity-display').exists()).toBe(false);
  });
}); 
