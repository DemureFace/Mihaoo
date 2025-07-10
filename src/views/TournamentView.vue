``
<script setup>
  import { useParser } from '@/components/mixins/useParser.js'

  const { input, allBrandMarkup, parse } = useParser()
  const TEMPLATE_LABELS = {
    tournamentInner: 'Внутрішня сторінка турніру',
    tournamentCard: 'Картка турніру',
    promoInner: 'Внутрішня сторінка промо',
    promoCard: 'Картка промо',
  }
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
  }
</script>

<template>
  <div class="max-w-7xl mx-auto p-4 space-y-4">
    <textarea
      v-model="input"
      class="text-gray-200 w-full border p-2 rounded min-h-[180px] font-mono"
      placeholder="Встав сюди ВСЮ задачу"
    ></textarea>
    <button class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded" @click="parse">
      Парсити і згенерувати шаблон
    </button>
    <transition name="fade">
      <div v-if="Object.keys(allBrandMarkup).length" class="mt-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6" style="grid-auto-rows: 1fr">
          <div
            v-for="(markup, brand) in allBrandMarkup"
            :key="brand"
            class="mb-8 p-4 rounded"
          >
            <h2 class="font-bold text-gray-100 text-xl mb-4 uppercase">{{ brand }}</h2>
            <div v-for="(value, type) in markup" :key="type" class="mb-6">
              <div class="flex items-center mb-1">
                <span class="text-gray-100 font-bold text-lg mr-2">{{ TEMPLATE_LABELS[type] || type }}</span>
                <button
                  @click="copyToClipboard(value)"
                  class="bg-gray-700 text-white text-xs px-2 py-1 rounded hover:bg-gray-800 transition"
                >
                  Копіювати
                </button>
              </div>
              <pre class="overflow-x-auto bg-gray-900 text-green-400 p-3 rounded whitespace-pre-wrap text-xs">
        {{ value }}
      </pre
              >
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 1s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.fade-enter-to, .fade-leave-from {
  opacity: 1;
}
</style>
