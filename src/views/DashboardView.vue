<template>
  <div class="relative w-full h-full">
    <div class="scene soon">
      <div class="sky">
        <div class="sun"></div>
      </div>

      <!-- Контурні пагорби (лише stroke, без fill) -->
      <svg class="hills " viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true">
        <!-- Далекі пагорби -->
        <path
          d="M0,160 C120,110 200,140 320,120 C440,100 560,150 680,120 C800,90 880,120 1000,80"
          fill="none"
          stroke="black"
          stroke-width="2"
          stroke-linecap="round"
        />
        <!-- Ближчі пагорби -->
        <path
          d="M0,180 C140,120 240,160 380,140 C520,120 640,170 780,140 C920,110 960,140 1000,120"
          fill="none"
          stroke="black"
          stroke-width="3"
          stroke-linecap="round"
        />
      </svg>
    </div>

    <h1 class="absolute top-2/3 left-2/5 -translate-x-1/3 -translate-y-1/3 text-4xl font-bold flex">
      Soon
      <span class="dots ml-1 flex"></span>
    </h1>
  </div>
</template>

<script setup>
  import { useParser } from '@/components/mixins/useParser.js'
  import BaseButton from '@/components/base/BaseButton.vue'

  const { input, cmsCodeInnerPage, cmsCodeSr, parse } = useParser()

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
  }
</script>
