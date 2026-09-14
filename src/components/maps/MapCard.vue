<template>
  <article
    class="bg-white border border-black/10 rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
  >
    <div class="flex items-start justify-between gap-4">
      <div>
        <span
          class="inline-flex px-2.5 py-1 rounded-full bg-black/5 text-xs font-semibold uppercase"
        >
          {{ map.type }}
        </span>

        <h3 class="mt-3 text-lg font-bold text-black">
          {{ map.title }}
        </h3>

        <p v-if="map.description" class="mt-1 text-sm text-black/60">
          {{ map.description }}
        </p>
      </div>

      <span class="shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold" :class="statusClass">
        {{ map.status }}
      </span>
    </div>

    <div class="text-xs text-black/50">Updated {{ formattedDate }}</div>

    <div class="mt-auto flex items-center gap-2">
      <BaseButton class="px-3 py-2" @click="$emit('open', map)">Open</BaseButton>

      <BaseButton class="px-3 py-2" @click="$emit('duplicate', map)">Duplicate</BaseButton>

      <button
        type="button"
        class="ml-auto px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
        @click="$emit('delete', map)"
      >
        Delete
      </button>
    </div>
  </article>
</template>

<script setup>
  import { computed } from 'vue'
  import BaseButton from '@/components/base/BaseButton.vue'

  const props = defineProps({
    map: {
      type: Object,
      required: true,
    },
  })

  defineEmits(['open', 'duplicate', 'delete'])

  const formattedDate = computed(() => {
    if (!props.map.updatedAt) return '—'

    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(props.map.updatedAt))
  })

  const statusClass = computed(() => {
    const classes = {
      draft: 'bg-gray-100 text-gray-700',
      active: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      archived: 'bg-yellow-100 text-yellow-700',
    }

    return classes[props.map.status] || classes.draft
  })
</script>
