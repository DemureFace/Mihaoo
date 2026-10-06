<template>
  <div>
    <BaseButton
      type="button"
      variant="secondary"
      size="sm"
      class="relative min-h-11 min-w-11"
      :aria-label="headerLabel"
      @click="openAndCheck"
    >
      <ServerStackIcon class="h-5 w-5" />

      <span class="hidden lg:inline">Backend</span>

      <span class="h-2.5 w-2.5 shrink-0 rounded-full" :class="indicatorClass" aria-hidden="true" />
    </BaseButton>

    <BaseModal v-model="modalOpen" size="sm" aria-label="Backend services status">
      <div class="space-y-5">
        <div>
          <div class="flex items-center gap-3">
            <ServerStackIcon class="h-6 w-6 shrink-0" />

            <div>
              <h2 class="text-xl font-bold">Backend services</h2>

              <p class="mt-1 text-sm text-neutral-500">Статус основних мікросервісів Mihaoo</p>
            </div>
          </div>
        </div>

        <div
          v-if="waking"
          class="rounded-xl border border-amber-200 bg-amber-50 p-3"
          role="status"
          aria-live="polite"
        >
          <div class="flex items-center gap-2 text-sm font-medium text-amber-900">
            <ArrowPathIcon class="h-4 w-4 animate-spin" />

            Будимо backend…
          </div>

          <p class="mt-1 text-xs text-amber-800">Cold start на Render може зайняти деякий час.</p>
        </div>

        <div
          v-else-if="wakeFinished && allOnline"
          class="rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-800"
          role="status"
        >
          Усі основні сервіси online.
        </div>

        <div
          v-else-if="wakeFinished && !allOnline"
          class="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          role="alert"
        >
          Не всі сервіси відповіли. Можна повторити Wake Backend.
        </div>

        <div class="overflow-hidden rounded-xl border border-black/10">
          <div
            v-for="service in services"
            :key="service.key"
            class="flex min-w-0 items-center justify-between gap-3 border-b border-black/5 px-4 py-3 last:border-b-0"
          >
            <div class="min-w-0">
              <p class="font-medium text-black">
                {{ service.label }}
              </p>

              <p class="mt-0.5 text-xs text-neutral-500">
                {{ service.key }}
              </p>
            </div>

            <div class="flex shrink-0 items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full" :class="serviceStatusClass(service.status)" />

              <span
                class="min-w-[88px] text-right text-xs font-semibold"
                :class="serviceTextClass(service.status)"
              >
                {{ serviceStatusLabel(service.status) }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500">
          <span>
            Online:

            <strong class="text-black">{{ onlineCount }}/{{ services.length }}</strong>
          </span>

          <span v-if="lastCheckedAt">
            Last check:

            {{ formattedLastChecked }}
          </span>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <BaseButton :loading="checking" :disabled="waking" @click="checkStatus">
            Check status
          </BaseButton>

          <BaseButton variant="primary" :loading="waking" :disabled="checking" @click="wakeBackend">
            Wake Backend
          </BaseButton>
        </div>

        <p class="text-xs leading-5 text-neutral-500">
          Status check виконує один health request до кожного сервісу. Wake Backend запускає
          перевірку повторно, поки сервіси прокидаються після Render cold start.
        </p>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
  import { computed, ref } from 'vue'

  import { ArrowPathIcon, ServerStackIcon } from '@heroicons/vue/24/outline'

  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseModal from '@/components/base/BaseModal.vue'

  import {
    CORE_SERVICES,
    areCoreServicesOnline,
    getSystemHealth,
    wakeSystem,
  } from '@/services/systemHealth.service'

  const modalOpen = ref(false)

  const health = ref(null)

  const checking = ref(false)

  const waking = ref(false)

  const wakeFinished = ref(false)

  const lastCheckedAt = ref(null)

  const services = computed(() => {
    return CORE_SERVICES.map((service) => {
      let status = 'not-checked'

      const apiStatus = health.value?.services?.[service.key]

      if (apiStatus === 'ok') {
        status = 'online'
      } else if (waking.value) {
        status = 'waking'
      } else if (apiStatus === 'error') {
        status = 'unavailable'
      }

      return {
        ...service,
        status,
      }
    })
  })

  const onlineCount = computed(() => {
    return services.value.filter((service) => service.status === 'online').length
  })

  const allOnline = computed(() => {
    return areCoreServicesOnline(health.value)
  })

  const headerStatus = computed(() => {
    if (waking.value) {
      return 'waking'
    }

    if (!health.value) {
      return 'not-checked'
    }

    if (allOnline.value) {
      return 'online'
    }

    return 'unavailable'
  })

  const indicatorClass = computed(() => {
    return {
      'not-checked': 'bg-neutral-400',

      waking: 'bg-amber-500 animate-pulse',

      online: 'bg-green-500',

      unavailable: 'bg-red-500',
    }[headerStatus.value]
  })

  const headerLabel = computed(() => {
    if (waking.value) {
      return `Backend waking, ${onlineCount.value} of ${services.value.length} services online`
    }

    if (!health.value) {
      return 'Backend status not checked'
    }

    return `Backend: ${onlineCount.value} of ${services.value.length} services online`
  })

  const formattedLastChecked = computed(() => {
    if (!lastCheckedAt.value) {
      return ''
    }

    return new Intl.DateTimeFormat('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(lastCheckedAt.value)
  })

  function recordHealth(result) {
    health.value = result

    lastCheckedAt.value = new Date()
  }

  async function openAndCheck() {
    modalOpen.value = true

    if (checking.value || waking.value) {
      return
    }

    await checkStatus()
  }

  async function checkStatus() {
    if (checking.value || waking.value) {
      return
    }

    checking.value = true

    wakeFinished.value = false

    try {
      const result = await getSystemHealth()

      recordHealth(result)
    } finally {
      checking.value = false
    }
  }

  async function wakeBackend() {
    if (waking.value || checking.value) {
      return
    }

    waking.value = true

    wakeFinished.value = false

    try {
      const result = await wakeSystem({
        onUpdate: recordHealth,
      })

      if (result.health) {
        recordHealth(result.health)
      }
    } finally {
      waking.value = false

      wakeFinished.value = true
    }
  }

  function serviceStatusLabel(status) {
    return {
      'not-checked': 'Not checked',

      online: 'Online',

      waking: 'Waking…',

      unavailable: 'No response',
    }[status]
  }

  function serviceStatusClass(status) {
    return {
      'not-checked': 'bg-neutral-400',

      online: 'bg-green-500',

      waking: 'bg-amber-500 animate-pulse',

      unavailable: 'bg-red-500',
    }[status]
  }

  function serviceTextClass(status) {
    return {
      'not-checked': 'text-neutral-500',

      online: 'text-green-700',

      waking: 'text-amber-700',

      unavailable: 'text-red-700',
    }[status]
  }
</script>
