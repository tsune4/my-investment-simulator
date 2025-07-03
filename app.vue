<template>
  <div class="min-h-screen bg-gray-100 p-4">
    <div class="max-w-screen-xl mx-auto flex flex-col items-center justify-center">
      <h1 class="text-4xl font-bold text-gray-800 mb-8">金融積立シミュレーター</h1>

      <InputForm @calculate="handleCalculation" />

      <div v-if="showResults" class="w-full flex flex-col items-center">
        <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-lg shadow-md w-full max-w-2xl mb-8 flex items-center justify-center text-center">
          <img src="/img/pose_dance_ukareru_woman.png" alt="喜ぶ女性" class="h-16 w-16 mr-4" />
          <div>
            <div class="text-lg font-semibold text-yellow-700">将来の運用資産額</div>
            <div class="text-5xl font-extrabold text-yellow-900">{{ formattedInvestmentTotalAmount }}</div>
          </div>
        </div>

        <InvestmentChart :chartData="chartData" />
      </div>
      <div v-else class="mt-8 text-gray-500">
        積立設定を入力し、「計算する」ボタンを押してください。
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import InputForm from '~/components/InputForm.vue';
import InvestmentChart from '~/components/InvestmentChart.vue';
import type { ChartData, ChartDataset } from 'chart.js';

const chartData = ref<ChartData<'line'>>({
  labels: [],
  datasets: []
});

const investmentTotalAmount = ref<number | null>(null);
const showResults = ref(false);

// 算出プロパティを修正
const formattedInvestmentTotalAmount = computed(() => {
  if (investmentTotalAmount.value === null) {
    return '';
  }

  let amount = investmentTotalAmount.value; // 単位は「万円」

  const KYO = 10000 * 10000 * 10000; // 1京 = 10,000兆 = 10^16 円 = 10^12 万円
  const CHO = 10000 * 10000;         // 1兆 = 10,000億 = 10^12 円 = 10^8 万円
  const OKU = 10000;                 // 1億 = 10,000万 = 10^8 円 = 10^4 万円

  let result = '';

  // 京単位
  if (amount >= KYO) {
    const kyoPart = Math.floor(amount / KYO);
    result += `${kyoPart.toLocaleString()}京`;
    amount %= KYO;
  }

  // 兆単位
  if (amount >= CHO) {
    const choPart = Math.floor(amount / CHO);
    result += `${choPart.toLocaleString()}兆`;
    amount %= CHO;
  }

  // 億単位
  if (amount >= OKU) {
    const okuPart = Math.floor(amount / OKU);
    result += `${okuPart.toLocaleString()}億`;
    amount %= OKU;
  }

  // 万単位（残りの部分、または1億未満の場合）
  if (amount > 0 || result === '') { // ゼロの場合も「0万円」と表示するか、何も表示しないかの調整
    result += `${amount.toLocaleString()}万円`;
  }

  return result;
});

// calculateInvestment, handleCalculation 関数は変更なし
const calculateInvestment = (currentAmount: number, monthlyDeposit: number, annualYield: number, period: number) => {
  const monthlyYieldRate = annualYield / 100 / 12;
  const numberOfMonths = period * 12;

  let currentPrincipal = currentAmount * 10000;
  let totalDeposits = currentAmount * 10000;

  const labels: number[] = [];
  const principalData: number[] = [];
  const totalAssetsData: number[] = [];

  labels.push(0);
    // 元本（万円）は、初期投入額を万円単位で記録
  principalData.push(Math.round(totalDeposits / 10000));
    // 合計資産額（万円）も、初期投入額を万円単位で記録
  totalAssetsData.push(Math.round(currentPrincipal / 10000));

  for (let i = 1; i <= numberOfMonths; i++) {
    const monthlyDepositAmount = monthlyDeposit * 10000;

    totalDeposits += monthlyDepositAmount; // 総積立額に今月の積立額を追加
    currentPrincipal += monthlyDepositAmount; // 元本に今月の積立額を追加

    const interestEarned = currentPrincipal * monthlyYieldRate; // 今月の運用益を計算
    currentPrincipal += interestEarned; // 元本に運用益を加算

    // 年単位でデータを記録
    if (i % 12 === 0) {
      const year = i / 12;
      labels.push(year);
      principalData.push(Math.round(totalDeposits / 10000)); // この時点での総積立額
      totalAssetsData.push(Math.round(currentPrincipal / 10000)); // この時点での総資産額
    }
  }

  // 期間の最終年がlabelsに含まれていることを確認し、含まれていなければ追加
  // 例えば期間が1.5年の場合など、端数年での最終データポイントを確実にする
  if (labels[labels.length - 1] !== period) {
     labels.push(period);
     principalData.push(Math.round(totalDeposits / 10000));
     totalAssetsData.push(Math.round(currentPrincipal / 10000));
  }


  investmentTotalAmount.value = Math.round(currentPrincipal / 10000); // 最終資産額を万円に丸める

  const interestOnlyData = totalAssetsData.map((total, index) => total - principalData[index]);

  const datasets: ChartDataset<'line'>[] = [
    {
      label: '元本',
      data: principalData,
      borderColor: 'rgba(92, 184, 92, 1)',
      backgroundColor: 'rgba(92, 184, 92, 0.5)',
      fill: true,
      tension: 0.4
    },
    {
      label: '運用収益',
      data: interestOnlyData,
      borderColor: 'rgba(240, 173, 78, 1)',
      backgroundColor: 'rgba(240, 173, 78, 0.5)',
      fill: true,
      tension: 0.4
    }
  ];

  chartData.value = {
    labels,
    datasets
  };

  showResults.value = true;
};

const handleCalculation = (data: { currentAmount: number, monthlyDeposit: number, annualYield: number, period: number }) => {
  if (data.monthlyDeposit === null || data.annualYield === null || data.period === null) {
    alert('毎月の積立額、想定利回り、積立期間は必須です。');
    showResults.value = false;
    chartData.value = { labels: [], datasets: [] };
    investmentTotalAmount.value = null;
    return;
  }
  if (data.monthlyDeposit < 0 || data.annualYield < 0 || data.period < 1) {
    alert('毎月の積立額、想定利回りは0以上、積立期間は1以上で入力してください。');
    showResults.value = false;
    chartData.value = { labels: [], datasets: [] };
    investmentTotalAmount.value = null;
    return;
  }

  calculateInvestment(data.currentAmount, data.monthlyDeposit, data.annualYield, data.period);
};
</script>

<style>
/* グローバルスタイルが必要な場合はここに記述 */
</style>