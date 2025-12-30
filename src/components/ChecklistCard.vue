<template>
  <article class="border rounded-2xl p-4 flex flex-col gap-2">
    <h3 class="text-lg font-semibold">{{ checklist.title }}</h3>
    <p class="text-sm text-gray-600">{{ checklist.description }}</p>

    <p class="text-xs text-gray-500">
      Створено: {{ fmt(checklist.createdAt) }}
      <span v-if="lastFilledLabel">· Останнє заповнення: {{ lastFilledLabel }}</span>
    </p>

    <p class="text-xs text-gray-500">Усього пунктів: {{ totalItems }}</p>

    <div class="mt-3 flex gap-2">
      <button class="border rounded px-3 py-1" @click="open">Відкрити</button>
      <button class="border rounded px-3 py-1" @click="edit">Редагувати</button>
      <button class="border rounded px-3 py-1" @click="remove">Видалити</button>
    </div>
  </article>
</template>

<script setup>
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { getLastFilledAt } from '@/lib/storage'

  const props = defineProps({
    checklist: { type: Object, required: true },
  })

  const router = useRouter()

  // 👉 Нормалізація: перетворюємо і старі .items, і нові .sections у плоский список leaf-пунктів
  function collectLeafItems(ch) {
    const out = []
    const walk = (items) => {
      for (const it of items || []) {
        if (!it) continue
        if (!it.type || it.type === 'check') out.push(it)
        if (it.type === 'group') walk(it.children)
      }
    }

    if (Array.isArray(ch.items)) {
      walk(ch.items)
    } else if (Array.isArray(ch.sections)) {
      ch.sections.forEach((sec) => walk(sec.items))
    }
    return out
  }

  const flatItems = computed(() => collectLeafItems(props.checklist))
  const totalItems = computed(() => flatItems.value.length)

  const lastFilledLabel = computed(() => {
    const ts = getLastFilledAt(props.checklist.slug)
    return ts ? new Date(ts).toLocaleString() : ''
  })

  function open() {
    router.push({ name: 'checklist-detail', params: { slug: props.checklist.slug } })
  }
  function edit() {
    // якийсь твій emit / навігація в редактор
  }
  function remove() {
    // emit('remove', props.checklist.slug) або твоя логіка
  }

  function fmt(iso) {
    return new Date(iso).toLocaleString()
  }
</script>
