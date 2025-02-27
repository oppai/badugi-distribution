<template>
  <div class="container">
    <h1>Badugi 1枚ドロー確率分布</h1>
    <div class="calculator">
      <div class="range-input">
        <h2>レンジを入力してください</h2>
            <div class="settings">
                <div class="setting-item">
                <label>
                    <input 
                    type="checkbox" 
                    v-model="showTri"
                    > Triを含める
                </label>
                </div>
            </div>
        <div class="input-group">
          <input 
            v-model="rangeInput"
            type="text"
            placeholder="例: A23,456+,789"
            @input="updateRange"
          />
          <div class="input-help">
            カンマ区切りで入力。プラス記号(+)で範囲指定可能
          </div>
        </div>
        <div class="selected-hands">
          <div v-for="hand in selectedHands" :key="hand" class="hand-item">
            {{ hand }}
          </div>
        </div>
      </div>
      
      <div class="probability-display">
        <h2>確率分布</h2>
        <div class="chart-container">
          <BarChart :data="chartData" :options="chartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartOptions } from 'chart.js'
import { parseRange, calculateBadugiOdds, BADUGI_LABELS } from '../utils/badugi'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }>;
}

export default defineComponent({
  name: 'BadugiDistribution',
  components: {
    BarChart: Bar
  },
  data() {
    return {
      showTri: false,
      labels: BADUGI_LABELS,
      rangeInput: '',
      selectedHands: [] as string[],
      chartColors: {
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
      }
    }
  },
  computed: {
    displayLabels(): string[] {
      return this.showTri ? this.labels : this.labels.filter(l => l !== 'Tri');
    },
    chartData(): ChartData {
      const odds = this.calculateBadugiOddsList();
      return {
        labels: this.displayLabels,
        datasets: [{
          label: 'バドゥギ確率',
          data: this.displayLabels.map(label => odds.get(label) || 0),
          backgroundColor: Array(this.displayLabels.length).fill(this.chartColors.backgroundColor),
          borderColor: Array(this.displayLabels.length).fill(this.chartColors.borderColor),
          borderWidth: 1
        }]
      }
    },
    chartOptions(): ChartOptions<'bar'> {
      return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 50,
            title: {
              display: true,
              text: '確率 (%)'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'バドゥギ確率分布'
          }
        }
      }
    }
  },
  methods: {
    updateRange() {
      this.selectedHands = parseRange(this.rangeInput);
    },
    calculateBadugiOddsList(): Map<string, number> {
      return calculateBadugiOdds(this.selectedHands, this.showTri);
    }
  }
})
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.calculator {
  display: grid;
  gap: 20px;
}

.settings {
  display: flex;
  gap: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.setting-item {
  display: flex;
  align-items: center;
}

.dead-cards-input {
  width: 60px;
  padding: 4px;
  margin-left: 8px;
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
}

.hand-item {
  padding: 4px 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  font-family: monospace;
}

.chart-container {
  height: 300px;
  margin-bottom: 20px;
}

.probability-list {
  margin-top: 20px;
}

.probability-item {
  display: flex;
  justify-content: space-between;
  margin: 5px 0;
  padding: 5px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-family: monospace;
}

.no-hands-message {
  text-align: center;
  color: #666;
}
</style> 
