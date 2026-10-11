<template>
  <section class="min-w-0 space-y-6">
    <header
      class="rounded-3xl border border-black/10 bg-gradient-to-br from-emerald-50 via-white to-indigo-50 p-5 sm:p-8"
    >
      <p class="text-xs font-semibold uppercase tracking-widest text-neutral-500">
        Content / Retention workspace
      </p>
      <h1 class="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Dashboard</h1>
      <p class="mt-3 max-w-2xl text-sm leading-7 text-neutral-600">
        Усе для роботи з контентом в одному місці: генератори, задачі, QA, банери та карти процесів.
      </p>
      <BaseActionBar class="mt-5">
        <BaseButton variant="primary" to="/analytics/tasks">Відкрити задачі</BaseButton>
        <BaseButton to="/checklists">Почати QA</BaseButton>
      </BaseActionBar>
      <p v-if="!authenticated" class="mt-4 text-xs leading-5 text-neutral-500">
        Для Tasks, генераторів і Banner Export потрібен Login. Локальні Maps і Checklists доступні
        без входу.
      </p>
    </header>

    <div class="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
      <article
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-2xl border border-black/10 p-5"
      >
        <p class="text-sm text-neutral-500">{{ stat.label }}</p>
        <p class="mt-2 text-3xl font-bold">{{ stat.value }}</p>
        <p class="mt-2 text-xs text-neutral-500">{{ stat.note }}</p>
      </article>
    </div>

    <section aria-labelledby="dashboard-tools">
      <BaseActionBar class="mb-4 justify-between">
        <h2 id="dashboard-tools" class="text-xl font-bold">Робочі модулі</h2>
        <BaseButton variant="link" to="/responsive-showcase">Приклади адаптації</BaseButton>
      </BaseActionBar>
      <div class="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="tool in tools"
          :key="tool.path"
          class="flex min-w-0 flex-col rounded-2xl border border-black/10 bg-white p-5"
        >
          <div class="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-neutral-100">
            <component :is="tool.icon" class="h-6 w-6" />
          </div>
          <h3 class="text-lg font-semibold">{{ tool.title }}</h3>
          <p class="mt-2 flex-1 text-sm leading-6 text-neutral-600">{{ tool.description }}</p>
          <BaseButton
            class="mt-5 self-start"
            :to="tool.path"
            :aria-label="`Відкрити ${tool.title}`"
          >
            Відкрити
            <ArrowRightIcon class="h-4 w-4" />
          </BaseButton>
        </article>
      </div>
    </section>

    <div class="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2">
      <section class="rounded-2xl border border-black/10 p-5">
        <h2 class="text-xl font-bold">Останні оновлення</h2>
        <p class="mt-2 text-xs text-neutral-500">
          Редакційний журнал frontend-можливостей, не повідомлення про deployment.
        </p>
        <ul class="mt-4 space-y-4">
          <li
            v-for="update in productUpdates.slice(0, 3)"
            :key="update.id"
            class="border-b border-black/5 pb-4 last:border-0"
          >
            <p class="text-xs text-neutral-500">{{ update.category }} · {{ update.date }}</p>
            <h3 class="mt-1 font-semibold">{{ update.title }}</h3>
            <p class="mt-1 text-sm leading-6 text-neutral-600">{{ update.summary }}</p>
          </li>
        </ul>
        <BaseButton class="mt-3" to="/news">Усі оновлення</BaseButton>
      </section>
      <section class="rounded-2xl border border-black/10 bg-neutral-50 p-5">
        <h2 class="text-xl font-bold">Перед запуском кампанії</h2>
        <ol class="mt-4 space-y-4">
          <li v-for="(step, index) in steps" :key="step.title" class="flex min-w-0 gap-3">
            <span
              class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black text-sm text-white"
            >
              {{ index + 1 }}
            </span>
            <div>
              <h3 class="font-semibold">{{ step.title }}</h3>
              <p class="mt-1 text-sm leading-6 text-neutral-600">{{ step.text }}</p>
            </div>
          </li>
        </ol>
        <p class="mt-5 rounded-xl bg-white p-3 text-xs leading-5 text-neutral-500">
          Лічильники вище відображають лише локальні дані цього браузера. Статус backend і командні
          KPI тут не імітуються.
        </p>
      </section>
    </div>
  </section>
</template>
<script setup>
  import { computed } from 'vue'
  import { useStore } from 'vuex'
  import { useChecklists } from '@/composables/useChecklists'
  import { productUpdates } from '@/data/productUpdates'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseActionBar from '@/components/base/BaseActionBar.vue'
  import {
    TrophyIcon,
    TagIcon,
    ChartBarIcon,
    ClipboardDocumentCheckIcon,
    PhotoIcon,
    MapIcon,
    ArrowRightIcon,
  } from '@heroicons/vue/24/outline'
  const store = useStore()
  const { all } = useChecklists()
  const authenticated = computed(() => Boolean(store.state.auth.accessToken))
  const stats = computed(() => [
    { label: 'Локальні чеклісти', value: all.value.length, note: 'Визначення в цьому браузері' },
    { label: 'Локальні карти', value: store.state.maps.maps.length, note: 'Maps у localStorage' },
    { label: 'Робочі модулі', value: tools.length, note: 'Швидкі переходи нижче' },
  ])
  const tools = [
    {
      title: 'Tournament',
      path: '/tournaments',
      icon: TrophyIcon,
      description: 'Підготуй CMS-контент звичайного або мережевого турніру з опису задачі.',
    },
    {
      title: 'Promo',
      path: '/promo',
      icon: TagIcon,
      description: 'Генеруй promo page, картки й правила для підтримуваних брендів.',
    },
    {
      title: 'Analytics / Tasks',
      path: '/analytics/tasks',
      icon: ChartBarIcon,
      description: 'Фільтруй задачі команди, переглядай деталі та експортуй CSV.',
    },
    {
      title: 'Checklists',
      path: '/checklists',
      icon: ClipboardDocumentCheckIcon,
      description: 'Виконуй локальні QA-перевірки або завантажуй серверні списки окремо.',
    },
    {
      title: 'Banner Export',
      path: '/banner-export',
      icon: PhotoIcon,
      description: 'Обирай Figma-банери, параметри оптимізації та формати архіву.',
    },
    {
      title: 'Maps',
      path: '/maps',
      icon: MapIcon,
      description: 'Створюй карти процесів, редагуй вузли та зберігай JSON локально.',
    },
  ]
  const steps = [
    { title: 'Підготуй контент', text: 'Перевір назви, дати, бренди та правила в генераторі.' },
    { title: 'Перевір банери', text: 'Звір desktop/mobile розміри й доступність Figma-джерела.' },
    {
      title: 'Пройди QA',
      text: 'Відкрий відповідний чекліст і перевір усі посилання та локалізації.',
    },
    {
      title: 'Зафіксуй роботу',
      text: 'Онови задачу й оцінку; не плутай estimated SP із фактично зарахованими.',
    },
  ]
</script>
