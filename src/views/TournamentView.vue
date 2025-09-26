<template>
  <div class="max-w-7xl mx-auto p-4 space-y-4">
    <textarea
      v-model="input"
      class="text-black w-full border p-2 rounded min-h-[180px] font-mono"
      placeholder="Insert the ENTIRE task here"
    ></textarea>
    <BaseButton class="px-6 py-2" @click="parseNow">Parse and generate template</BaseButton>
    <transition name="fade">
      <div v-if="Object.keys(allBrandMarkup).length" class="mt-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6" style="grid-auto-rows: 1fr">
          <div
            v-for="(markup, brand) in allBrandMarkup"
            :key="brand"
            class="border-1 border-dashed mb-8 p-4 rounded-lg"
          >
            <h2 class="text-center font-bold text-black text-xl mb-4 uppercase">{{ brand }}</h2>
            <div v-for="(value, type) in markup" :key="type" class="mb-6 capitalize">
              <div class="flex items-center justify-between mb-1">
                <span class="text-black font-bold text-lg mr-2">
                  {{ TEMPLATE_LABELS[type] || type }}
                </span>
                <BaseButton @click="copyToClipboard(value)" class="px-2 py-1">Copy</BaseButton>
              </div>
              <div class="relative">
                <pre
                  :class="[
                    'overflow-auto rounded-lg border-1 bg-white text-black p-3 whitespace-pre-wrap text-xs transition-all duration-300',
                    isExpanded(keyOf(brand, type)) ? 'max-h-[80vh]' : 'max-h-24',
                  ]"
                  >{{ value }}</pre
                >

                <BaseButton
                  type="button"
                  class="absolute top-2 right-2 p-1 rounded"
                  @click="toggleExpand(keyOf(brand, type))"
                  :aria-label="isExpanded(keyOf(brand, type)) ? 'Collapse' : 'Expand'"
                  :title="isExpanded(keyOf(brand, type)) ? 'Collapse' : 'Expand'"
                >
                  <ArrowsPointingOutIcon v-if="!isExpanded(keyOf(brand, type))" class="w-6 h-6" />
                  <ArrowsPointingInIcon v-else class="w-6 h-6" />
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
<script setup>
  import { ref } from 'vue'
  import { useParser } from '@/components/mixins/useParser.js'
  import BaseButton from '@/components/base/BaseButton.vue'
  import { ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/vue/24/solid'

  const expanded = ref({}) // { 'brand::type': true/false }

  const keyOf = (brand, type) => `${brand}::${type}`
  const isExpanded = (k) => !!expanded.value[k]
  const toggleExpand = (k) => {
    expanded.value[k] = !expanded.value[k]
  }
  // 1) Спочатку дістаємо parse
  const { input, allBrandMarkup, parse } = useParser()

  // 2) Приймаємо табу від батька
  const props = defineProps({
    currentTab: { type: String, default: 'tournaments' }, // 'tournaments' | 'promo'
  })

  // 3) Нормалізуємо назву таби в режим
  function toMode(tab) {
    const t = String(tab || '').toLowerCase()
    return t.includes('promo') ? 'promo' : 'tournaments'
  }

  // 5) Кнопка "Parse" — теж з поточною табою
  function parseNow() {
    parse(toMode(props.currentTab))
  }
  const TEMPLATE_LABELS = {
    tournamentInner: 'Internal tournament page',
    tournamentCard: 'Tournament card',
  }
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
  }
</script>

<style>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 1s;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  .fade-enter-to,
  .fade-leave-from {
    opacity: 1;
  }
</style>
