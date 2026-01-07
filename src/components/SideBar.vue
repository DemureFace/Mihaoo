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
        class="push-button cursor-pointer bg-button-primary rounded-lg font-sans font-bold"
      >
        <!-- Клік обробляємо тут -->

        <BaseButton
          class="flex items-center gap-2 rounded-lg"
          :class="[{ active: currentTab === tab.value }, collapsed ? 'p-1' : 'px-3 py-1.5']"
          @click="handleClick(tab)"
        >
          <span
            class="relative grid place-items-center w-6 h-6 transition-all duration-500 ease-linear"
            :class="[
              currentTab === tab.value ? 'text-white' : 'text-black',
              bouncingTab === tab.value ? 'animate-bounce' : '',
            ]"
          >
            <!-- іконка — один раз і назавжди -->
            <component :is="tab.icon" class="w-6 h-6" />
          </span>
          <span
            v-show="!collapsed"
            :class="currentTab === tab.value ? 'text-white' : 'text-black'"
            class="transition-all duration-200 ease-linear whitespace-nowrap"
          >
            {{ tab.label }}
          </span>
        </BaseButton>
        <!-- DROPDOWN -->
        <transition name="dropdown">
          <ul
            v-show="openDropdown === tab.value && !collapsed"
            class="px-4 py-2 flex flex-col gap-1"
          >
            <li
              v-for="child in tab.children"
              :key="child.value"
              class="text-sm rounded-md px-3 py-1 cursor-pointer hover:bg-black/5"
              @click="router.push(child.path)"
            >
              {{ child.label }}
            </li>
          </ul>
        </transition>
      </li>
    </ul>
  </nav>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import {
    Squares2X2Icon, // Dashboard
    TrophyIcon, // Tournament
    TagIcon, // Promo
    NewspaperIcon, // News
    ClipboardDocumentCheckIcon,
    WrenchScrewdriverIcon, // ClipboardDocumentCheckIcon
  } from '@heroicons/vue/24/outline'

  const props = defineProps({
    collapsed: { type: Boolean, default: false },
    currentTab: { type: String, required: true },
  })
  const emit = defineEmits(['change-tab'])

  const bouncingTab = ref(null)
  const router = useRouter()
  const route = useRoute()
  const tabPath = {
    dashboard: '/dashboard',
    tournaments: '/tournaments',
    promo: '/promo',
    toolCurrencyConverter: '/currency-converter',
    toolCalendar: '/calendar',
    checklists: '/checklists',
    news: '/news',
  }

  const tabs = [
    { label: 'Dashboard', value: 'dashboard', icon: Squares2X2Icon },
    { label: 'Tournament', value: 'tournaments', icon: TrophyIcon },
    { label: 'Promo', value: 'promo', icon: TagIcon },
    {
      label: 'Tools',
      value: 'tools',
      icon: WrenchScrewdriverIcon,
      children: [
        { label: 'Currency', value: 'toolCurrencyConverter', path: '/currency-converter' },
        { label: 'Calendar', value: 'toolCalendar', path: '/calendar' },
      ],
    },
    { label: 'Checklists', value: 'checklists', icon: ClipboardDocumentCheckIcon },
    { label: 'News', value: 'news', icon: NewspaperIcon },
  ]
  const openDropdown = ref(null) // value таби або null

  function handleClick(tab) {
    // якщо таб з підпунктами
    if (tab.children) {
      openDropdown.value = openDropdown.value === tab.value ? null : tab.value
      return
    }

    // звичайна таба
    if (tab.value === props.currentTab) return

    emit('change-tab', tab.value)

    bouncingTab.value = tab.value
    setTimeout(() => {
      if (bouncingTab.value === tab.value) bouncingTab.value = null
    }, 700)

    if (tabPath[tab.value]) {
      router.push(tabPath[tab.value])
    }
  }
</script>

<style scoped>
  .active {
    background: black;
  }
  .push-button {
    transition: all 0.3s ease;
  }
  .push-button:hover {
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

  .dropdown-enter-active,
  .dropdown-leave-active {
    transition: all 0.25s ease;
  }

  .dropdown-enter-from,
  .dropdown-leave-to {
    opacity: 0;
    transform: translateY(-4px);
  }
</style>
