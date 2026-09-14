<template>
  <aside class="w-[190px] shrink-0 bg-white border border-black/10 rounded-2xl p-3 overflow-y-auto">
    <div class="mb-3">
      <h2 class="font-bold text-sm">Blocks</h2>

      <p class="mt-1 text-xs text-black/40">Drag onto canvas</p>
    </div>

    <div class="flex flex-col gap-2">
      <button
        v-for="item in items"
        :key="item.type"
        type="button"
        draggable="true"
        class="flex items-center gap-3 w-full border border-black/10 rounded-xl px-3 py-2.5 text-left hover:border-black hover:bg-black/[0.02] transition cursor-grab active:cursor-grabbing"
        @dragstart="handleDragStart($event, item.type)"
        @dblclick="$emit('add-node', item.type)"
      >
        <span class="w-8 h-8 shrink-0 rounded-lg grid place-items-center" :class="item.class">
          <component :is="item.icon" class="w-4 h-4" />
        </span>

        <span class="text-sm font-semibold">
          {{ item.label }}
        </span>
      </button>
    </div>
  </aside>
</template>

<script setup>
  import {
    ArrowRightCircleIcon,
    FlagIcon,
    QuestionMarkCircleIcon,
    ServerStackIcon,
    CircleStackIcon,
    UserIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    DocumentIcon,
  } from '@heroicons/vue/24/outline'

  defineEmits(['add-node'])

  const items = [
    {
      label: 'Step',
      type: 'step',
      icon: ArrowRightCircleIcon,
      class: 'bg-blue-50 text-blue-600',
    },

    {
      label: 'Milestone',
      type: 'milestone',
      icon: FlagIcon,
      class: 'bg-purple-50 text-purple-600',
    },

    {
      label: 'Decision',
      type: 'decision',
      icon: QuestionMarkCircleIcon,
      class: 'bg-orange-50 text-orange-600',
    },

    {
      label: 'Service',
      type: 'service',
      icon: ServerStackIcon,
      class: 'bg-green-50 text-green-600',
    },

    {
      label: 'Database',
      type: 'database',
      icon: CircleStackIcon,
      class: 'bg-cyan-50 text-cyan-600',
    },

    {
      label: 'Person',
      type: 'person',
      icon: UserIcon,
      class: 'bg-indigo-50 text-indigo-600',
    },

    {
      label: 'Document',
      type: 'document',
      icon: DocumentTextIcon,
      class: 'bg-yellow-50 text-yellow-700',
    },

    {
      label: 'Risk',
      type: 'risk',
      icon: ExclamationTriangleIcon,
      class: 'bg-red-50 text-red-600',
    },

    {
      label: 'Note',
      type: 'note',
      icon: DocumentIcon,
      class: 'bg-gray-100 text-gray-600',
    },
  ]

  function handleDragStart(event, type) {
    event.dataTransfer.setData('application/mihaoo-node', type)

    event.dataTransfer.effectAllowed = 'move'
  }
</script>
