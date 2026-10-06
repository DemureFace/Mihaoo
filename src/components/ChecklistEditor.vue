<template>
  <form class="min-w-0 space-y-4" @submit.prevent="onSubmit">
    <BaseInput v-model="form.title" id="checklist-title" label="Назва" required />
    <BaseTextarea v-model="form.description" id="checklist-description" label="Опис" :rows="2" />
    <div class="min-w-0 space-y-2">
      <h3 class="text-sm font-semibold">Пункти</h3>
      <div v-for="(it, idx) in form.items" :key="it.id" class="flex min-w-0 items-end gap-2">
        <BaseInput
          v-model="it.text"
          :id="`checklist-item-${it.id}`"
          :label="`Пункт ${idx + 1}`"
          placeholder="Текст пункту"
          class="flex-1"
        />
        <BaseButton
          type="button"
          :aria-label="`Видалити пункт ${idx + 1}`"
          @click="removeItem(idx)"
        >
          −
        </BaseButton>
      </div>
      <BaseButton type="button" @click="addItem">Додати пункт</BaseButton>
    </div>
    <BaseActionBar class="justify-end pt-2">
      <BaseButton type="button" @click="onCancel">Скасувати</BaseButton>
      <BaseButton type="submit" variant="primary">
        {{ isEdit ? 'Зберегти' : 'Створити' }}
      </BaseButton>
    </BaseActionBar>
  </form>
</template>

<script setup>
  import BaseActionBar from '@/components/base/BaseActionBar.vue'

  import BaseButton from '@/components/base/BaseButton.vue'

  import BaseTextarea from '@/components/base/BaseTextarea.vue'

  import BaseInput from '@/components/base/BaseInput.vue'

  import { reactive, computed, watchEffect } from 'vue'
  import { generateSlug } from '@/lib/checklistsRepo'

  const props = defineProps({
    modelValue: { type: Boolean, default: false },
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
      form.items = (props.value.items || []).map((x) => ({ ...x }))
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
    emit('save', payload)
    emit('update:modelValue', false)
  }
</script>
