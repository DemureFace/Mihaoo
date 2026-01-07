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
        :key="tab.name"
        class="push-button cursor-pointer bg-button-primary rounded-lg font-sans font-bold"
      >
        <!-- Клік обробляємо тут -->

        <BaseButton
          class="flex items-center gap-2 rounded-lg"
          :class="[{ active: currentTab === tab.name }, collapsed ? 'p-1' : 'px-3 py-1.5']"
          @click="handleClick(tab)"
        >
          <span
            class="relative grid place-items-center w-6 h-6 transition-all duration-500 ease-linear"
            :class="[
              currentTab === tab.name ? 'text-white' : 'text-black',
              bouncingTab === tab.name ? 'animate-bounce' : '',
            ]"
          >
            <!-- іконка — один раз і назавжди -->
            <component :is="tab.icon" class="w-6 h-6" />
          </span>
          <span
            v-show="!collapsed"
            :class="currentTab === tab.name ? 'text-white' : 'text-black'"
            class="transition-all duration-200 ease-linear whitespace-nowrap"
          >
            {{ tab.label }}
          </span>
        </BaseButton>
        <!-- DROPDOWN -->
        <transition name="dropdown">
          <ul
            v-show="openDropdown === tab.name && !collapsed"
            class="px-4 py-2 flex flex-col gap-1"
          >
            <li
              v-for="child in tab.children || []"
              :key="child.name"
              class="text-sm rounded-md px-3 py-1 cursor-pointer hover:bg-black/5"
              :class="[
                { active: route.name === child.name },
                route.name === child.name ? 'text-white' : 'text-black',
              ]"
              @click="handleChildClick(child)"
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
  import { ref, computed, watch } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import {
    Squares2X2Icon,
    TrophyIcon,
    TagIcon,
    NewspaperIcon,
    ClipboardDocumentCheckIcon,
    WrenchScrewdriverIcon,
  } from '@heroicons/vue/24/outline'

  const props = defineProps({
    collapsed: { type: Boolean, default: false },
  })

  const router = useRouter()
  const route = useRoute()

  const bouncingTab = ref(null)
  const openDropdown = ref(null)

  // 1) Меню (залишив твої label/icon 1-в-1)
  const tabs = [
    { label: 'Dashboard', name: 'home', icon: Squares2X2Icon },
    { label: 'Tournament', name: 'tournament', icon: TrophyIcon }, // <-- як у твоєму router зараз
    { label: 'Promo', name: 'promo', icon: TagIcon },
    {
      label: 'Tools',
      name: 'tools',
      icon: WrenchScrewdriverIcon,
      children: [
        { label: 'Currency', name: 'currency-converter' },
        { label: 'Calendar', name: 'calendar' },
      ],
    },
    { label: 'Checklists', name: 'checklists', icon: ClipboardDocumentCheckIcon },
    { label: 'News', name: 'news', icon: NewspaperIcon },
  ]

  // 2) Визначаємо "поточну вкладку" з URL (для active стилів)
  const currentTab = computed(() => {
    // коли ми на tools children — вважаємо активним tools
    if (route.name === 'currency-converter' || route.name === 'calendar') return 'tools'
    return route.name || null
  })

  // 3) Автовідкриття dropdown коли ми на Currency/Calendar
  watch(
    () => route.name,
    (name) => {
      if (name === 'currency-converter' || name === 'calendar') {
        openDropdown.value = 'tools'
      }
    },
    { immediate: true },
  )

  function bounce(name) {
    bouncingTab.value = name
    setTimeout(() => {
      if (bouncingTab.value === name) bouncingTab.value = null
    }, 500)
  }

  function handleClick(tab) {
    // якщо Tools (dropdown)
    if (tab.children) {
      openDropdown.value = openDropdown.value === tab.name ? null : tab.name
      return
    }

    if (route.name === tab.name) return

    bounce(tab.name)
    router.push({ name: tab.name })
  }

  function handleChildClick(child) {
    if (route.name === child.name) return

    // bounce можна зробити або на tools, або на конкретний child
    bounce('tools')
    router.push({ name: child.name })
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
