<template>
  <section v-if="hasChecklist">
    <header class="mb-4">
      <div class="mb-4 flex justify-between items-center">
        <button
          type="button"
          @click="goBack"
          class="inline-flex items-center gap-2 border rounded-xl px-3 py-1.5 hover:bg-gray-50"
        >
          ← Назад до всіх чеклістів
        </button>
        <div class="flex gap-2">
          <button class="border rounded px-3 py-1" @click="openEdit">Редагувати</button>
          <button class="border rounded px-3 py-1" @click="onDelete">Видалити</button>
        </div>
      </div>

      <h2 class="text-2xl font-semibold">{{ checklist.title }}</h2>
      <p class="text-gray-600">{{ checklist.description }}</p>
      <p class="text-xs text-gray-500 mt-1">
        Створено: {{ fmt(checklist.createdAt) }} · Останнє заповнення: {{ lastFilledLabel }}
      </p>
    </header>

    <BaseModal v-model="showEditor">
      <ChecklistEditor v-model="showEditor" :value="checklist" @save="onSave" />
    </BaseModal>

    <ul class="space-y-2">
      <li v-for="item in checklist.items" :key="item.id" class="border rounded p-3">
        <label class="flex gap-3 items-center cursor-pointer">
          <input
            type="checkbox"
            :checked="isChecked(item.id)"
            @change="toggle(item.id)"
            class="accent-green-600 focus:ring-2 focus:ring-green-400"
          />
          <span>{{ item.text }}</span>
        </label>
      </li>
    </ul>
    <div class="space-y-6">
      <div
        v-for="sec in checklist.sections"
        :key="sec.id"
        class="space-y-2 border-dashed rounded border p-2"
      >
        <h3 v-if="sec.title" class="text-lg font-semibold">{{ sec.title }}</h3>
        <ul class="space-y-1">
          <ChecklistNode
            v-for="n in sec.items"
            :key="n.id"
            :node="n"
            :isChecked="isChecked"
            :toggle="toggle"
          />
        </ul>
      </div>
    </div>

    <div class="mt-5 flex gap-2">
      <button class="border rounded px-3 py-1" @click="markAll">Позначити все</button>
      <button class="border rounded px-3 py-1" @click="reset">Скинути</button>
    </div>
  </section>

  <section v-else class="p-4">Чекліст не знайдено.</section>
</template>

<script setup>
  import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import BaseModal from '@/components/base/BaseModal.vue'
  import ChecklistEditor from '@/components/ChecklistEditor.vue'
  import { useChecklists } from '@/composables/useChecklists'
  import ChecklistNode from '@/components/ChecklistNode.vue'

  const { findBySlug } = useChecklists()
  import {
    getProgress,
    setProgress,
    touchLastFilledAt,
    getLastFilledAt,
    resetAll,
  } from '@/lib/storage'
  function openEdit() {
    showEditor.value = true
  }
  const { update, remove } = useChecklists()
  const router = useRouter()
  function goBack() {
    // якщо прийшли напряму по URL, гарантовано ведемо в список
    router.push({ name: 'checklists' })
  }

  function handleKey(e) {
    if (showEditor.value) return
    if (e.key === 'Escape') goBack()
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKey)
    load()
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKey)
  })
  const showEditor = ref(false)

  function onSave(payload) {
    const prevSlug = checklist.value?.slug
    const updated = update(prevSlug, payload)
    if (updated) {
      checklist.value = findBySlug(updated.slug)
      showEditor.value = false
    }
  }

  function onDelete() {
    if (confirm(`Видалити "${checklist.value.title}"?`)) {
      remove(checklist.value.slug)
      router.push({ name: 'checklists' })
    }
  }

  const route = useRoute()
  const checklist = ref(null)
  const progress = ref([])
  const lastFilled = ref(null)

  const slug = computed(() => String(route.params.slug || '').trim())

  function load() {
    const s = slug.value
    const found = findBySlug(s)
    checklist.value = found
    progress.value = found ? getProgress(s) : []
    lastFilled.value = getLastFilledAt(s)
  }

  watch(slug, load)

  const hasChecklist = computed(() => !!checklist.value)
  const lastFilledLabel = computed(() =>
    lastFilled.value ? new Date(lastFilled.value).toLocaleString() : '—',
  )

  function isChecked(id) {
    return progress.value.includes(id)
  }
  function toggle(id) {
    const i = progress.value.indexOf(id)
    if (i >= 0) progress.value.splice(i, 1)
    else progress.value.push(id)
    setProgress(slug.value, progress.value)
    touchLastFilledAt(slug.value)
    lastFilled.value = getLastFilledAt(slug.value)
  }
  function markAll() {
    if (checklist.value) {
      const ids = checklist.value.sections
        ? checklist.value.sections.flatMap((sec) => collectLeafIds(sec.items))
        : collectLeafIds(checklist.value.items) // на випадок старої схеми
      progress.value = ids
      setProgress(slug.value, progress.value)
      touchLastFilledAt(slug.value)
      lastFilled.value = getLastFilledAt(slug.value)
    }
  }
  function reset() {
    resetAll(slug.value)
    progress.value = []
    lastFilled.value = null
  }
  function fmt(iso) {
    return new Date(iso).toLocaleString()
  }

  function collectLeafIds(items, out = []) {
    for (const it of items || []) {
      if (it.type === 'check') out.push(it.id)
      if (it.type === 'group') collectLeafIds(it.children, out)
    }
    return out
  }
</script>
