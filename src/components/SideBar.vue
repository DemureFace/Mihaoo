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
        class="cursor-pointer bg-button-primary rounded-lg font-sans font-bold"
      >
        <!-- Основна таба -->
        <BaseButton
          class="flex items-center gap-2 rounded-lg w-full transition-all duration-300 ease-in-out"
          :class="[
            isTabActive(tab) ? 'active' : '',
            collapsed ? 'p-1 justify-center' : 'px-3 py-1.5',
          ]"
          @click="handleClick(tab)"
        >
          <!-- Іконка -->
          <span
            class="relative grid place-items-center w-6 h-6 shrink-0 transition-all duration-300 ease-linear"
            :class="[
              isTabActive(tab) ? 'text-white' : 'text-black',
              bouncingTab === tab.value ? 'animate-bounce' : '',
            ]"
          >
            <component :is="tab.icon" class="w-6 h-6" />
          </span>

          <!-- Назва таби -->
          <span
            v-show="!collapsed"
            class="transition-all duration-200 ease-linear whitespace-nowrap flex-1 text-left"
            :class="isTabActive(tab) ? 'text-white' : 'text-black'"
          >
            {{ tab.label }}
          </span>

          <!-- Стрілка для dropdown -->
          <ChevronDownIcon
            v-if="tab.children && !collapsed"
            class="w-4 h-4 shrink-0 transition-transform duration-300"
            :class="[
              openDropdown === tab.value ? 'rotate-180' : '',
              isTabActive(tab) ? 'text-white' : 'text-black',
            ]"
          />
        </BaseButton>

        <!-- Dropdown -->
        <transition name="dropdown">
          <ul
            v-show="tab.children && openDropdown === tab.value && !collapsed"
            class="ml-8 mt-1 flex flex-col gap-1"
          >
            <li v-for="child in tab.children" :key="child.value">
              <button
                type="button"
                class="w-full text-left text-sm rounded-md px-3 py-1.5 transition-all duration-200 hover:bg-black/5"
                :class="isChildActive(child) ? 'text-brand-blue font-bold' : 'text-black'"
                @click.stop="handleChildClick(child, tab)"
              >
                {{ child.label }}
              </button>
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
    Squares2X2Icon,
    TrophyIcon,
    TagIcon,
    NewspaperIcon,
    ClipboardDocumentCheckIcon,
    ChevronDownIcon,
  } from '@heroicons/vue/24/outline'

  const props = defineProps({
    collapsed: { type: Boolean, default: false },
    currentTab: { type: String, required: true },
  })

  const emit = defineEmits(['change-tab'])

  const router = useRouter()
  const route = useRoute()

  const bouncingTab = ref(null)
  const openDropdown = ref(null)

  const tabs = [
    {
      label: 'Dashboard',
      value: 'dashboard',
      icon: Squares2X2Icon,
      path: '/dashboard',
    },
    {
      label: 'Tournament',
      value: 'tournaments',
      icon: TrophyIcon,
      path: '/tournaments',
    },
    {
      label: 'Promo',
      value: 'promo',
      icon: TagIcon,
      path: '/promo',
    },
    {
      label: 'Checklists',
      value: 'checklists',
      icon: ClipboardDocumentCheckIcon,
      children: [
        {
          label: 'All Checklists',
          value: 'checklists',
          path: '/checklists',
        },
        {
          label: 'Daily Checklist',
          value: 'checklists-daily',
          path: '/checklists/daily',
        },
        {
          label: 'QA Checklist',
          value: 'checklists-qa',
          path: '/checklists/qa',
        },
      ],
    },
    {
      label: 'News',
      value: 'news',
      icon: NewspaperIcon,
      path: '/news',
    },
  ]

  function bounce(value) {
    bouncingTab.value = value

    setTimeout(() => {
      if (bouncingTab.value === value) {
        bouncingTab.value = null
      }
    }, 700)
  }

  function handleClick(tab) {
    // Якщо у таби є dropdown — тільки відкриваємо/закриваємо меню
    if (tab.children && tab.children.length) {
      openDropdown.value = openDropdown.value === tab.value ? null : tab.value
      return
    }

    // Якщо клікнули по вже активній табі — нічого не робимо
    if (tab.value === props.currentTab) return

    emit('change-tab', tab.value)
    bounce(tab.value)

    if (tab.path) {
      router.push(tab.path)
    }
  }

  function handleChildClick(child, parentTab) {
    // Якщо цей child вже відкритий — нічого не робимо
    if (route.path === child.path) return

    // Якщо у App.vue немає компонента для child.value,
    // краще залишати активною батьківську табу
    emit('change-tab', parentTab.value)

    bounce(parentTab.value)

    if (child.path) {
      router.push(child.path)
    }
  }

  function isChildActive(child) {
    return route.path === child.path
  }

  function isTabActive(tab) {
    if (props.currentTab === tab.value) return true
    if (tab.path && route.path === tab.path) return true

    if (tab.children) {
      return tab.children.some((child) => isChildActive(child))
    }

    return false
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
