<template>
  <article
    class="card group relative hover:shadow-md transition cursor-pointer overflow-hidden"
    role="button"
    :aria-label="`Open checklist ${checklist.title}`"
    @click="go"
  >
    <div class="p-4 flex flex-col gap-3">
      <div class="flex items-start justify-between gap-3">
        <h3 class="text-lg font-semibold leading-tight group-hover:underline">
          {{ checklist.title }}
        </h3>
        <span class="badge">{{ completed }}/{{ total }}</span>
      </div>
      <p class="text-sm text-gray-600">{{ checklist.description }}</p>
      <dl class="text-xs text-gray-500 grid grid-cols-2 gap-x-6 gap-y-1">
        <div>
          <dd>Створено: {{ formatDate(checklist.createdAt) }}</dd>
        </div>
        <div>
          <dd>Останнє заповнення: {{ lastFilledLabel }}</dd>
        </div>
      </dl>
      <div class="mt-2">
        <router-link
          class="btn text-sm"
          :to="{ name: 'checklist', params: { slug: checklist.slug } }"
          @click.stop
        >
          Відкрити
        </router-link>
      </div>
    </div>
  </article>
</template>

<script setup>
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { getProgress, getLastFilledAt } from '@/lib/storage'

  const props = defineProps({ checklist: { type: Object, required: true } })
  const router = useRouter()

  const progress = computed(() => getProgress(props.checklist.slug))
  const completed = computed(() => progress.value.length)
  const total = computed(() => props.checklist.items.length)

  const lastFilled = computed(() => getLastFilledAt(props.checklist.slug))
  const lastFilledLabel = computed(() => (lastFilled.value ? formatDate(lastFilled.value) : '—'))

  function go() {
    router.push({ name: 'checklist', params: { slug: props.checklist.slug } })
  }
  function formatDate(iso) {
    return new Date(iso).toLocaleString()
  }
</script>

<style scoped>
  .card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 0.5rem 0.75rem;
    text-decoration: none;
  }
  .btn:hover {
    background: #f3f4f6;
  }
  .badge {
    font-size: 0.75rem;
    color: #6b7280;
  }
</style>
