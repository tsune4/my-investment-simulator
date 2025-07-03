<template>
  <div v-if="chartData && chartData.labels.length > 0" class="bg-white p-6 rounded-lg shadow-md w-full max-w-4xl mt-8">
    <canvas ref="chartCanvas"></canvas>
  </div>
  <div v-else class="mt-8 text-gray-500">
    計算結果はありません。
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { Chart, registerables } from 'chart.js';
import type { ChartData, ChartDataset, ChartOptions } from 'chart.js';

Chart.register(...registerables);

const chartCanvas = ref<HTMLCanvasElement | null>(null);
const chartInstance = ref<Chart | null>(null);

const props = defineProps<{
  chartData: ChartData<'line'>;
}>();


watch(() => props.chartData, (newChartData) => {
  if (newChartData && newChartData.labels.length > 0) {
    createChart(newChartData);
  } else {
    if (chartInstance.value) {
      chartInstance.value.destroy();
      chartInstance.value = null;
    }
  }
}, { deep: true });

onMounted(() => {
  if (props.chartData && props.chartData.labels.length > 0) {
    createChart(props.chartData);
  }
});

onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy();
    chartInstance.value = null;
  }
});

const createChart = (data: ChartData<'line'>) => {
  if (!chartCanvas.value) {
    console.error("Canvas element not found.");
    return;
  }
  const ctx = chartCanvas.value.getContext('2d');
  if (!ctx) {
    console.error("2D context not available.");
    return;
  }

  if (chartInstance.value) {
    chartInstance.value.destroy();
    chartInstance.value = null;
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: function(tooltipItems) {
            return `${tooltipItems?.[0]?.label}年目`;
          },
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += `${context.parsed.y.toLocaleString()}万円`;
            }
            return label;
          },
          footer: function(tooltipItems) {
            if (!tooltipItems || tooltipItems.length < 2) {
              return [];
            }
            const principal = tooltipItems.find(item => item.dataset.label === '元本')?.parsed?.y || 0;
            const interest = tooltipItems.find(item => item.dataset.label === '運用収益')?.parsed?.y || 0;
            const total = principal + interest;
            return [`合計: ${total.toLocaleString()}万円`];
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '年目'
        },
        grid: {
          display: false
        },
        ticks: {
          autoSkip: true,
          maxRotation: 0,
          minRotation: 0,
          callback: function(value, index, ticks) {
            const label = data.labels?.[index];
            if (typeof label === 'number' && label % 3 === 0) {
              return `${label}年目`;
            }
            return null;
          }
        }
      },
      y: {
        title: {
          display: true,
          text: '金額（万円）'
        },
        beginAtZero: true,
        stacked: true,
        ticks: {
          callback: function(value, index, ticks) {
            return `${value.toLocaleString()}`;
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    }
  };

  chartInstance.value = new Chart(ctx, {
    type: 'line',
    data,
    options
  });
};
</script>

<style scoped>
div {
  height: 500px;
  width: 100%;
}
</style>