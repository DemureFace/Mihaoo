<template>
  <div
    class="min-w-[220px] max-w-[260px] rounded-2xl border-2 bg-white shadow-sm transition-all"
    :class="[selected ? 'border-black shadow-lg' : 'border-black/10']"
  >
    <Handle type="target" :position="Position.Left" class="!w-3 !h-3 !bg-black" />

    <div class="p-4">
      <div class="flex items-center justify-between gap-3">
        <span class="px-2 py-1 rounded-lg text-[10px] font-bold uppercase" :class="typeClass">
          {{ data.type }}
        </span>

        <span class="w-2.5 h-2.5 rounded-full" :class="statusClass" />
      </div>

      <h3 class="mt-3 font-bold text-sm">
        {{ data.title }}
      </h3>

      <p v-if="data.description" class="mt-1 text-xs leading-5 text-black/50">
        {{ data.description }}
      </p>

      <div
        v-if="data.owner || data.dueDate"
        class="mt-3 pt-3 border-t border-black/5 flex justify-between gap-3 text-[11px] text-black/50"
      >
        <span>
          {{ data.owner || 'No owner' }}
        </span>

        <span v-if="data.dueDate">
          {{ data.dueDate }}
        </span>
      </div>
    </div>

    <Handle type="source" :position="Position.Right" class="!w-3 !h-3 !bg-black" />
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { Handle, Position } from '@vue-flow/core'

  const props = defineProps({
    data: {
      type: Object,
      required: true,
    },

    selected: {
      type: Boolean,
      default: false,
    },
  })

  const typeClass = computed(() => {
    const classes = {
      step: 'bg-blue-50 text-blue-700',

      milestone: 'bg-purple-50 text-purple-700',

      decision: 'bg-orange-50 text-orange-700',

      service: 'bg-green-50 text-green-700',

      database: 'bg-cyan-50 text-cyan-700',

      person: 'bg-indigo-50 text-indigo-700',

      document: 'bg-yellow-50 text-yellow-700',

      risk: 'bg-red-50 text-red-700',

      note: 'bg-gray-100 text-gray-600',
    }

    return classes[props.data.type] || classes.step
  })

  const statusClass = computed(() => {
    const classes = {
      draft: 'bg-gray-400',
      active: 'bg-blue-500',
      completed: 'bg-green-500',
      blocked: 'bg-red-500',
    }

    return classes[props.data.status] || classes.draft
  })
</script>
