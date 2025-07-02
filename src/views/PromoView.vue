``
<script setup>
  import { useParser } from '@/components/mixins/useParser.js'

  const { input, cmsCodeInnerPage, cmsCodeSr, parse } = useParser()

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
  }
</script>

<template>
  <div class="max-w-5xl mx-auto p-4 space-y-4">
    <textarea
      v-model="input"
      class="text-gray-200 w-full border p-2 rounded min-h-[180px] font-mono"
      placeholder="Встав сюди ВСЮ задачу JC"
    ></textarea>
    <button class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded" @click="parse">
      Парсити і згенерувати шаблон
    </button>

    <div v-if="cmsCodeInnerPage" class="mt-6">
      <div class="flex gap-8">
        <div>
          <div class="flex items-center mb-1">
            <span class="font-bold text-lg mr-2">JC</span>
            <button
              @click="copyToClipboard(cmsCodeInnerPage)"
              class="bg-gray-700 text-white text-xs px-2 py-1 rounded hover:bg-gray-800 transition"
            >
              Копировать
            </button>
          </div>
          <pre class="bg-gray-900 text-green-400 p-3 rounded whitespace-pre-wrap text-xs">{{
            cmsCodeInnerPage
          }}</pre>
        </div>
        <div>
          <div class="flex items-center mb-1">
            <span class="font-bold text-lg mr-2">SR</span>
            <button
              @click="copyToClipboard(cmsCodeSr)"
              class="bg-gray-700 text-white text-xs px-2 py-1 rounded hover:bg-gray-800 transition"
            >
              Копировать
            </button>
          </div>
          <pre class="bg-gray-900 text-green-400 p-3 rounded whitespace-pre-wrap text-xs">{{
            cmsCodeSr
          }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>
