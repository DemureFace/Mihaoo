<template>
  <section class="min-w-0 space-y-4 rounded-2xl border border-black/10 p-4">
    <BaseActionBar class="justify-between">
      <h2 class="text-lg font-semibold">Серверні чеклісти</h2>
      <BaseButton :loading="loading" :disabled="saving" @click="load">Завантажити з API</BaseButton>
    </BaseActionBar>
    <p class="text-sm text-neutral-500">
      Окремі від локальних списків. Потрібен Login; дані браузера не імпортуються автоматично.
    </p>
    <p v-if="error" role="alert" class="break-words text-sm text-red-700">{{ error }}</p>
    <p v-if="success" role="status" class="break-words text-sm text-emerald-700">{{ success }}</p>
    <p v-if="loaded && !loading && !error && !rows.length" class="text-sm">
      Серверних чеклістів немає.
    </p>
    <div class="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
      <article
        v-for="row in rows"
        :key="row.id"
        class="min-w-0 rounded-xl border border-black/10 p-4"
      >
        <h3 class="break-words font-semibold">{{ row.title }}</h3>
        <p class="mt-1 text-xs text-neutral-500">
          {{ row.items.length }} пунктів · API #{{ row.id }}
        </p>
        <BaseButton class="mt-3" :disabled="saving" @click="open(row)">Заповнити</BaseButton>
      </article>
    </div>
    <form
      v-if="selected"
      class="min-w-0 space-y-3 rounded-xl bg-neutral-50 p-4"
      @submit.prevent="submit"
    >
      <h3 class="break-words font-semibold">{{ selected.title }}</h3>
      <label
        v-for="item in selected.items"
        :key="item.id"
        class="flex min-w-0 items-start gap-3 text-sm"
      >
        <input
          v-model="checked"
          type="checkbox"
          :value="item.id"
          :disabled="saving"
          class="mt-1 shrink-0"
        />
        <span class="min-w-0 break-words">{{ item.text }}</span>
      </label>
      <BaseActionBar>
        <BaseButton
          type="submit"
          variant="primary"
          :loading="saving"
          :disabled="!selected.items.length"
        >
          Зберегти виконання на сервері
        </BaseButton>
        <BaseButton :disabled="saving" @click="selected = null">Закрити</BaseButton>
      </BaseActionBar>
      <p class="text-xs text-neutral-500">
        Запис створюється тільки після натискання кнопки збереження.
      </p>
    </form>
  </section>
</template>

<script setup>
  import { onBeforeUnmount, onDeactivated, ref } from 'vue'
  import BaseActionBar from '@/components/base/BaseActionBar.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import { checklistsService } from '@/services/checklists.service'

  const rows = ref([])
  const selected = ref(null)
  const checked = ref([])
  const loading = ref(false)
  const saving = ref(false)
  const loaded = ref(false)
  const error = ref('')
  const success = ref('')
  let controller = null

  async function load() {
    if (loading.value || saving.value) return
    error.value = ''
    success.value = ''
    if (!localStorage.getItem('accessToken')) {
      error.value = 'Увійди через Login для серверних чеклістів.'
      return
    }
    const current = new AbortController()
    controller = current
    loading.value = true
    try {
      const result = await checklistsService.list(current.signal)
      if (!current.signal.aborted) {
        rows.value = result
        loaded.value = true
      }
    } catch (requestError) {
      if (!current.signal.aborted) error.value = requestError.message
    } finally {
      if (controller === current) {
        controller = null
        loading.value = false
      }
    }
  }

  function open(row) {
    selected.value = row
    checked.value = []
    error.value = ''
    success.value = ''
  }

  async function submit() {
    if (saving.value || !selected.value) return
    saving.value = true
    error.value = ''
    success.value = ''
    const row = selected.value
    try {
      const result = await checklistsService.submit(
        row.id,
        row.items.map((item) => ({
          itemId: item.id,
          checked: checked.value.includes(item.id),
        })),
      )
      success.value = `Виконання збережено на сервері: #${result.id}.`
      selected.value = null
    } catch (requestError) {
      error.value = requestError.message
    } finally {
      saving.value = false
    }
  }

  function cancelRead() {
    controller?.abort()
    controller = null
    loading.value = false
  }
  onDeactivated(cancelRead)
  onBeforeUnmount(cancelRead)
</script>
