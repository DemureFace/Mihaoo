<template>
  <div class="fixed inset-0 bg-black/30 z-[1000] grid place-items-center" @click.self="onCancel">
    <div class="w-[min(700px,95vw)] bg-white rounded-2xl border p-4">
      <header class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-semibold">{{ isEdit ? 'Редагувати' : 'Новий чекліст' }}</h3>
        <button class="text-gray-500" @click="onCancel">✕</button>
      </header>

      <form class="space-y-3" @submit.prevent="onSubmit">
        <div>
          <label class="block text-sm mb-1">Назва</label>
          <input v-model="form.title" required class="w-full border rounded-lg px-3 py-2" />
        </div>

        <div>
          <label class="block text-sm mb-1">Опис</label>
          <textarea
            v-model="form.description"
            rows="2"
            class="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label class="block text-sm mb-1">Пункти</label>
          <div class="space-y-2">
            <div v-for="(it, idx) in form.items" :key="it.id" class="flex gap-2">
              <input
                v-model="it.text"
                class="flex-1 border rounded-lg px-3 py-2"
                placeholder="Текст пункту"
              />
              <button type="button" class="border rounded px-2" @click="removeItem(idx)">−</button>
            </div>
            <button type="button" class="border rounded px-3 py-1" @click="addItem">
              Додати пункт
            </button>
          </div>
        </div>

        <footer class="flex justify-end gap-2 pt-2">
          <button type="button" class="border rounded px-3 py-1" @click="onCancel">
            Скасувати
          </button>
          <button type="submit" class="border rounded px-3 py-1 bg-gray-900 text-white">
            {{ isEdit ? 'Зберегти' : 'Створити' }}
          </button>
        </footer>
      </form>
    </div>
  </div>
</template>

<script setup>
  import { reactive, computed, toRefs, watchEffect } from 'vue'
  import { generateSlug } from '@/lib/checklistsRepo'

  const props = defineProps({
    modelValue: { type: Boolean, default: false },
    // якщо редагування — передаємо існуючий чекліст
    value: { type: Object, default: null },
  })
  const emit = defineEmits(['update:modelValue', 'save'])

  const isEdit = computed(() => !!props.value)

  const form = reactive({
    title: '',
    description: '',
    items: [],
  })

  watchEffect(() => {
    if (props.value) {
      form.title = props.value.title || ''
      form.description = props.value.description || ''
      form.items = (props.value.items || []).map((x) => ({ ...x })) // клон
    } else {
      form.title = ''
      form.description = ''
      form.items = [{ id: 'item-1', text: '' }]
    }
  })

  function addItem() {
    const id = `item-${Math.random().toString(36).slice(2, 7)}`
    form.items.push({ id, text: '' })
  }
  function removeItem(idx) {
    form.items.splice(idx, 1)
  }

  function onCancel() {
    emit('update:modelValue', false)
  }

  function onSubmit() {
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      items: form.items
        .filter((i) => i.text.trim())
        .map((i) => ({ id: i.id || generateSlug(i.text), text: i.text.trim() })),
    }
    emit('save', payload) // повідомляємо батька
    emit('update:modelValue', false) // закриваємо модалку
  }
</script>

<style scoped>
  /* затемнення фону */
  .fixed {
    background-color: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(2px);
  }

  /* вікно по центру */
  .fixed > div {
    max-height: 90vh;
    overflow-y: auto;
  }
</style>
