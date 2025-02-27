<template>
  <div class="container">
    <h1>Badugi レンジvsレンジ勝率計算</h1>
    <div class="calculator">
      <div class="range-inputs">
        <div class="range-input">
          <h2>レンジ1</h2>
          <div class="input-group">
            <input 
              v-model="range1Input"
              type="text"
              placeholder="例: A23,456+,789"
              @input="updateRanges"
            />
            <div class="input-help">
              カンマ区切りで入力。プラス記号(+)で範囲指定可能
            </div>
          </div>
          <div class="selected-hands">
            <div v-for="hand in range1Hands" :key="hand" class="hand-item">
              {{ hand }}
            </div>
          </div>
        </div>
        
        <div class="range-input">
          <h2>レンジ2</h2>
          <div class="input-group">
            <input 
              v-model="range2Input"
              type="text"
              placeholder="例: A23,456+,789"
              @input="updateRanges"
            />
            <div class="input-help">
              カンマ区切りで入力。プラス記号(+)で範囲指定可能
            </div>
          </div>
          <div class="selected-hands">
            <div v-for="hand in range2Hands" :key="hand" class="hand-item">
              {{ hand }}
            </div>
          </div>
        </div>
      </div>
      
      <div class="equity-display" v-if="hasResults">
        <h2>勝率結果</h2>
        <div class="equity-summary">
          <div class="equity-bar">
            <div 
              class="equity-bar-range1" 
              :style="{ width: `${equity.range1Equity}%` }"
            >
              {{ equity.range1Equity.toFixed(1) }}%
            </div>
            <div 
              class="equity-bar-ties" 
              :style="{ width: `${equity.ties}%` }"
              v-if="equity.ties > 0"
            >
              {{ equity.ties.toFixed(1) }}%
            </div>
            <div 
              class="equity-bar-range2" 
              :style="{ width: `${equity.range2Equity}%` }"
            >
              {{ equity.range2Equity.toFixed(1) }}%
            </div>
          </div>
          <div class="equity-labels">
            <div>レンジ1</div>
            <div v-if="equity.ties > 0">引き分け</div>
            <div>レンジ2</div>
          </div>
        </div>
        
        <div class="detailed-results">
          <div class="range-details">
            <h3>レンジ1の詳細</h3>
            <table>
              <thead>
                <tr>
                  <th>ハンド</th>
                  <th>勝率</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in detailedEquity.range1Hands" :key="item.hand">
                  <td>{{ item.hand }}</td>
                  <td>{{ item.equity.toFixed(1) }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="range-details">
            <h3>レンジ2の詳細</h3>
            <table>
              <thead>
                <tr>
                  <th>ハンド</th>
                  <th>勝率</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in detailedEquity.range2Hands" :key="item.hand">
                  <td>{{ item.hand }}</td>
                  <td>{{ item.equity.toFixed(1) }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div class="no-results" v-else>
        <p>両方のレンジを入力すると勝率が表示されます</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { parseRange } from '../utils/badugi';
import { calculateRangeVsRangeEquity, calculateDetailedEquity } from '../utils/range-equity';

interface DetailedEquity {
  range1Hands: { hand: string; equity: number }[];
  range2Hands: { hand: string; equity: number }[];
}

export default defineComponent({
  name: 'RangeEquity',
  data() {
    return {
      range1Input: '',
      range2Input: '',
      range1Hands: [] as string[],
      range2Hands: [] as string[],
      equity: {
        range1Equity: 0,
        range2Equity: 0,
        ties: 0
      },
      detailedEquity: {
        range1Hands: [],
        range2Hands: []
      } as DetailedEquity
    };
  },
  computed: {
    hasResults(): boolean {
      return this.range1Hands.length > 0 && this.range2Hands.length > 0;
    }
  },
  methods: {
    updateRanges() {
      this.range1Hands = parseRange(this.range1Input);
      this.range2Hands = parseRange(this.range2Input);
      
      if (this.hasResults) {
        this.calculateEquity();
      }
    },
    calculateEquity() {
      this.equity = calculateRangeVsRangeEquity(this.range1Input, this.range2Input);
      this.detailedEquity = calculateDetailedEquity(this.range1Input, this.range2Input);
    }
  }
});
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.calculator {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.range-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.input-group {
  margin-bottom: 10px;
}

input[type="text"] {
  width: 100%;
  padding: 8px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.input-help {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.selected-hands {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
  max-height: 150px;
  overflow-y: auto;
}

.hand-item {
  padding: 4px 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  font-family: monospace;
}

.equity-display {
  margin-top: 20px;
}

.equity-summary {
  margin-bottom: 20px;
}

.equity-bar {
  display: flex;
  height: 40px;
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
}

.equity-bar-range1 {
  background-color: #4CAF50;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.equity-bar-ties {
  background-color: #9E9E9E;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.equity-bar-range2 {
  background-color: #2196F3;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.equity-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
}

.detailed-results {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f2f2f2;
}

.no-results {
  text-align: center;
  color: #666;
  padding: 20px;
}

@media (max-width: 600px) {
  .range-inputs {
    grid-template-columns: 1fr;
  }
  
  .detailed-results {
    grid-template-columns: 1fr;
  }
}
</style> 
