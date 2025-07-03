<template>
  <div class="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl mb-8">
    <h2 class="text-2xl font-semibold text-gray-700 mb-4">積立設定</h2>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
      <div>
        <label for="currentAmount" class="block text-sm font-medium text-gray-700">現状資産額（万円）</label>
        <UInput
          id="currentAmount"
          v-model.number="currentAmount"
          type="number"
          placeholder="0"
          min="0"
          class="mt-1 block w-full"
        />
      </div>

      <div>
        <label for="monthlyDeposit" class="block text-sm font-medium text-gray-700">毎月の積立額（万円）</label>
        <UInput
          id="monthlyDeposit"
          v-model.number="monthlyDeposit"
          type="number"
          placeholder="3"
          min="0"
          class="mt-1 block w-full"
        />
      </div>

      <div>
        <label for="annualYield" class="block text-sm font-medium text-gray-700">想定利回り（年率 %）</label>
        <UInput
          id="annualYield"
          v-model.number="annualYield"
          type="number"
          placeholder="3"
          min="0"
          step="0.1"
          class="mt-1 block w-full"
        />
      </div>

      <div>
        <label for="period" class="block text-sm font-medium text-gray-700">積立期間（年）</label>
        <UInput
          id="period"
          v-model.number="period"
          type="number"
          placeholder="20"
          min="1"
          class="mt-1 block w-full"
        />
      </div>
    </div>

    <div class="mt-6 flex justify-center">
      <UButton @click="emitCalculation" size="xl" color="primary">計算する</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits(['calculate']);

// 入力項目のリアクティブな変数 - 初期値を設定
const currentAmount = ref(0);   // 現状資産額（デフォルト0万円）
const monthlyDeposit = ref(3);  // 毎月の積立額（デフォルト3万円）
const annualYield = ref(3);     // 想定利回り（デフォルト3%）
const period = ref(20);         // 積立期間（デフォルト20年）

const emitCalculation = () => {
  // バリデーションはapp.vueで行うため、ここでは純粋に現在の値をemit
  // nullish coalescing operator (??) は、v-modelが直接値をバインドするため不要になります。
  emit('calculate', {
    currentAmount: currentAmount.value,
    monthlyDeposit: monthlyDeposit.value,
    annualYield: annualYield.value,
    period: period.value
  });
};
</script>