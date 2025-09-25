<template>
  <nav
    :class="[
      'bg-surface-primary h-full p-4 flex flex-col gap-2 transition-all duration-300 ease-in-out',
      collapsed ? 'w-16' : 'w-56',
    ]"
  >
    <ul class="flex flex-col gap-2 list-none m-0 p-0">
      <li
        v-for="tab in tabs"
        :key="tab.value"
        :class="[ {active: currentTab === tab.value}, collapsed ? 'p-1' : 'px-3 py-1.5' ]"
        class="cursor-pointer bg-button-primary rounded-lg font-sans font-bold"
      >
        <!-- Клік обробляємо тут -->
        <BaseButton class="flex items-center gap-2" @click="handleClick(tab.value)">
          <component
            :is="tab.icon"
            :class="[
              'w-6 h-6 transition-all duration-500 ease-linear',
              currentTab === tab.value ? 'text-white' : 'text-black',
              bouncingTab === tab.value ? 'animate-bounce' : '',
            ]"
          />
          <span
            v-if="!collapsed"
            :class="currentTab === tab.value ? 'text-white' : 'text-black'"
            class="transition-all duration-200 ease-linear whitespace-nowrap"
          >
            {{ tab.label }}
          </span>
        </BaseButton>
      </li>
    </ul>
  </nav>
</template>

<script setup>
  import { ref } from 'vue'
  import {
    Squares2X2Icon, // Dashboard
    TrophyIcon, // Tournament
    TagIcon, // Promo
    NewspaperIcon, // News
  } from '@heroicons/vue/24/outline'

  const props = defineProps({
    collapsed: { type: Boolean, default: false },
    currentTab: { type: String, required: true },
  })
  const emit = defineEmits(['change-tab'])

  const bouncingTab = ref(null)

  const tabs = [
    { label: 'Dashboard', value: 'dashboard', icon: Squares2X2Icon },
    { label: 'Tournament', value: 'tournaments', icon: TrophyIcon },
    { label: 'Promo', value: 'promo', icon: TagIcon },
    { label: 'News', value: 'news', icon: NewspaperIcon },
  ]

  function handleClick(value) {
    if (value === props.currentTab) return

    emit('change-tab', value)
    bouncingTab.value = value
    setTimeout(() => {
      if (bouncingTab.value === value) bouncingTab.value = null
    }, 1500)
  }
</script>

<style scoped>
  .active {
    background: black;
  }
  li {
    transition: all 0.3s ease;
  }
  li:hover {
    animation: push-button 2s linear infinite;
  }

  @keyframes push-button {
    0%,
    100% {
      box-shadow: 0px 0px 0px 0px black;
    }
    50% {
      box-shadow: 0px 2px 0px 0px black;
    }
  }
</style>
