<template>
  <section class="min-w-0 space-y-6">
    <header class="showcase-hero overflow-hidden rounded-3xl border border-black/10 p-5 sm:p-8">
      <div class="flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span class="rounded-full bg-black px-3 py-1.5 text-white">MIHAOO / RESPONSIVE</span>
        <span class="rounded-full border border-black/15 bg-white/70 px-3 py-1.5">
          Інтерактивна галерея
        </span>
      </div>
      <h1 class="mt-5 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
        Один Mihaoo.
        <br />
        Будь-який екран.
      </h1>
      <p class="mt-4 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">
        Приклади адаптації знайомих модулів: читабельні таблиці, гнучкі форми, доступні дії та
        модальні вікна. Спробуй змінити ширину й взаємодіяти з компонентами.
      </p>
      <div class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div v-for="item in principles" :key="item.title" class="rounded-2xl bg-white/75 p-4">
          <p class="font-semibold">{{ item.title }}</p>
          <p class="mt-1 text-xs leading-5 text-neutral-600">{{ item.text }}</p>
        </div>
      </div>
    </header>

    <div
      class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"
    >
      <strong>Демонстраційні дані.</strong>
      Це не робочі задачі чи звіти. Дії змінюють лише стан цієї сторінки; API-запити, backend-записи
      та збереження в localStorage не виконуються. Copy копіює лише демонстраційний CMS-текст.
    </div>

    <nav aria-label="Приклади модулів" class="flex min-w-0 flex-wrap gap-2">
      <BaseButton
        v-for="module in modules"
        :key="module.id"
        :variant="activeModule === module.id ? 'primary' : 'secondary'"
        :aria-pressed="activeModule === module.id"
        @click="selectModule(module.id)"
      >
        <component :is="module.icon" class="h-5 w-5 shrink-0" />
        {{ module.label }}
      </BaseButton>
    </nav>

    <section class="min-w-0 rounded-3xl border border-black/10 bg-neutral-50 p-3 sm:p-5">
      <header class="mb-4 flex min-w-0 flex-wrap items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="text-xs font-semibold uppercase tracking-widest text-neutral-500">
            Live example
          </p>
          <h2 class="mt-1 text-xl font-bold">{{ selectedModule.label }}</h2>
          <p class="mt-1 max-w-xl text-sm leading-6 text-neutral-600">
            {{ selectedModule.description }}
          </p>
        </div>
        <BaseActionBar aria-label="Ширина прикладу">
          <BaseButton
            v-for="size in sizes"
            :key="size.id"
            size="sm"
            :variant="previewSize === size.id ? 'primary' : 'secondary'"
            :aria-pressed="previewSize === size.id"
            @click="previewSize = size.id"
          >
            {{ size.label }}
          </BaseButton>
        </BaseActionBar>
      </header>
      <p class="mb-4 text-xs leading-5 text-neutral-500">
        Перемикач обмежує ширину контейнера, а не емулює пристрій чи viewport. На вузькому екрані
        приклад завжди залишається в межах доступної ширини.
      </p>

      <div
        data-testid="showcase-preview"
        class="@container mx-auto min-w-0 w-full rounded-2xl border border-black/10 bg-white p-3 shadow-sm sm:p-4"
        :style="{ maxWidth: previewWidth }"
      >
        <div v-if="activeModule === 'analytics'" class="min-w-0 space-y-4">
          <BaseActionBar class="justify-between">
            <h3 class="font-bold">Задачі команди</h3>
            <BaseButton variant="primary" @click="editorOpen = true">+ Demo задача</BaseButton>
          </BaseActionBar>
          <BaseFormGrid>
            <BaseInput
              v-model="search"
              id="showcase-search"
              label="Пошук задач"
              placeholder="Назва або бренд"
            />
            <BaseSelect
              v-model="status"
              id="showcase-status"
              label="Статус"
              :options="statusOptions"
              placeholder="Усі статуси"
            />
          </BaseFormGrid>
          <div class="grid grid-cols-1 gap-2 @lg:grid-cols-3">
            <div v-for="metric in metrics" :key="metric.label" class="rounded-xl bg-neutral-50 p-3">
              <p class="text-xs text-neutral-500">{{ metric.label }}</p>
              <p class="mt-1 text-2xl font-bold">{{ metric.value }}</p>
            </div>
          </div>
          <BaseTableScroll
            label="Демонстраційна таблиця задач"
            class="rounded-xl border border-black/10"
          >
            <table class="w-full min-w-[660px] text-left text-sm">
              <thead class="bg-neutral-50">
                <tr>
                  <th
                    v-for="label in ['Задача', 'Бренд', 'Тип', 'SP (оцінка)', 'Статус', 'Дія']"
                    :key="label"
                    scope="col"
                    class="p-3"
                  >
                    {{ label }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="task in filteredTasks" :key="task.id" class="border-t border-black/5">
                  <td class="max-w-64 p-3">
                    <p class="font-medium">{{ task.title }}</p>
                    <p class="mt-1 text-xs text-neutral-500">{{ task.key }}</p>
                  </td>
                  <td class="p-3">{{ task.brand }}</td>
                  <td class="p-3">{{ task.type }}</td>
                  <td class="p-3">{{ task.sp }}</td>
                  <td class="p-3">
                    <span
                      class="rounded-full px-2 py-1 text-xs"
                      :class="
                        task.status === 'Done'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-blue-50 text-blue-700'
                      "
                    >
                      {{ task.status }}
                    </span>
                  </td>
                  <td class="p-3">
                    <BaseButton size="sm" @click="openTask(task)">Деталі</BaseButton>
                  </td>
                </tr>
                <tr v-if="!filteredTasks.length">
                  <td colspan="6" class="p-5 text-center text-neutral-500">
                    Demo задач не знайдено
                  </td>
                </tr>
              </tbody>
            </table>
          </BaseTableScroll>
        </div>

        <div v-else-if="activeModule === 'generator'" class="min-w-0 space-y-4">
          <div class="rounded-xl bg-violet-50 p-4">
            <h3 class="font-bold">Promo / Tournament Generator</h3>
            <p class="mt-1 text-xs leading-5 text-violet-800">
              Форма адаптується до контейнера; CMS-результат не розтягує сторінку.
            </p>
          </div>
          <BaseFormGrid>
            <BaseSelect
              v-model="generatorBrand"
              id="showcase-brand"
              label="Brand"
              :options="brandOptions"
            />
            <BaseInput v-model="imageUrl" id="showcase-image" label="Desktop image URL" />
          </BaseFormGrid>
          <BaseTextarea
            v-model="description"
            id="showcase-description"
            label="Task description"
            :rows="3"
          />
          <BaseActionBar class="justify-end">
            <BaseButton variant="primary" @click="generated = true">
              Показати demo результат
            </BaseButton>
          </BaseActionBar>
          <GeneratedArtifact v-if="generated" title="Demo Promo Page" :content="demoArtifact" />
        </div>

        <div v-else-if="activeModule === 'checklists'" class="min-w-0 space-y-4">
          <BaseActionBar class="justify-between">
            <h3 class="font-bold">QA перед запуском кампанії</h3>
            <BaseButton size="sm" @click="checked = []">Скинути demo</BaseButton>
          </BaseActionBar>
          <div class="rounded-xl bg-emerald-50 p-4">
            <div class="flex justify-between gap-2 text-sm">
              <span>Прогрес перевірки</span>
              <strong>{{ checked.length }} / {{ checklistItems.length }}</strong>
            </div>
            <progress
              class="mt-3 h-2 w-full accent-emerald-600"
              :value="checked.length"
              :max="checklistItems.length"
              aria-label="Прогрес демонстраційного чекліста"
            />
          </div>
          <label
            v-for="(item, index) in checklistItems"
            :key="item"
            class="flex min-w-0 items-start gap-3 rounded-xl border border-black/10 p-3"
          >
            <input
              v-model="checked"
              type="checkbox"
              :value="index"
              class="mt-1 h-5 w-5 shrink-0 accent-black"
            />
            <span class="min-w-0 text-sm font-normal leading-6">{{ item }}</span>
          </label>
        </div>

        <div v-else-if="activeModule === 'banners'" class="min-w-0 space-y-4">
          <h3 class="font-bold">Banner Export</h3>
          <BaseFormGrid>
            <BaseInput v-model="campaign" id="showcase-campaign" label="Campaign ID" />
            <BaseSelect
              v-model="format"
              id="showcase-format"
              label="Format"
              :options="[
                { value: 'webp', label: 'WEBP' },
                { value: 'png', label: 'PNG' },
              ]"
            />
          </BaseFormGrid>
          <BaseTableScroll label="Демонстраційні банери" class="rounded-xl border border-black/10">
            <table class="w-full min-w-[560px] text-left text-sm">
              <thead class="bg-neutral-50">
                <tr>
                  <th scope="col" class="p-3">Banner</th>
                  <th scope="col" class="p-3">Size</th>
                  <th scope="col" class="p-3">Format</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="banner in banners" :key="banner.name" class="border-t border-black/5">
                  <td class="p-3 font-medium">{{ campaign }} / {{ banner.name }}</td>
                  <td class="p-3">{{ banner.size }}</td>
                  <td class="p-3 uppercase">{{ format }}</td>
                </tr>
              </tbody>
            </table>
          </BaseTableScroll>
          <p class="rounded-xl bg-blue-50 p-3 text-xs leading-5 text-blue-800">
            У прикладі не виконується Figma inspect або створення export job. Таблиця показує
            локальне прокручування без втрати колонок.
          </p>
        </div>

        <div v-else class="min-w-0 space-y-4">
          <h3 class="font-bold">Maps / картка кампанії</h3>
          <MapCard
            :map="demoMap"
            @open="notify('Demo карту відкрито у preview — робочі карти не змінено.')"
            @duplicate="notify('Demo duplicate: серверне копіювання не виконується.')"
            @delete="notify('Demo delete: жодні карти не видалено.')"
          />
          <div class="rounded-xl border border-dashed border-black/20 bg-neutral-50 p-4">
            <p class="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Схема процесу · демонстрація, не Vue Flow canvas
            </p>
            <ol class="mt-3 grid grid-cols-1 gap-2 @lg:grid-cols-3">
              <li
                v-for="(step, index) in mapSteps"
                :key="step"
                class="rounded-xl border border-black/10 bg-white p-3 text-sm"
              >
                <span
                  class="mb-2 grid h-6 w-6 place-items-center rounded-full bg-black text-xs text-white"
                >
                  {{ index + 1 }}
                </span>
                {{ step }}
              </li>
            </ol>
          </div>
        </div>
        <p v-if="notice" role="status" class="mt-4 rounded-xl bg-neutral-100 p-3 text-sm leading-6">
          {{ notice }}
        </p>
      </div>
    </section>

    <footer class="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
      <div class="rounded-2xl border border-black/10 p-5">
        <h2 class="font-bold">Що тут повторно використовується</h2>
        <p class="mt-2 text-sm leading-7 text-neutral-600">{{ selectedModule.pattern }}</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <span
            v-for="name in selectedModule.components"
            :key="name"
            class="rounded-lg bg-neutral-100 px-2 py-1 font-mono text-xs"
          >
            {{ name }}
          </span>
        </div>
      </div>
      <div class="rounded-2xl border border-black/10 p-5">
        <h2 class="font-bold">Від прикладу до робочого модуля</h2>
        <p class="mt-2 text-sm leading-7 text-neutral-600">
          Галерея ізольована від бізнес-даних. Робочий модуль відкривається окремо; його доступ і
          API залежать від звичайних правил Mihaoo.
        </p>
        <BaseButton class="mt-3" :to="selectedModule.route">
          Перейти до {{ selectedModule.label }}
        </BaseButton>
      </div>
    </footer>

    <BaseModal v-model="editorOpen" size="lg" aria-label="Демонстраційна задача">
      <form class="space-y-4" @submit.prevent="saveDemo">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Demo / Analytics
          </p>
          <h2 class="mt-1 text-xl font-bold">Нова демонстраційна задача</h2>
        </div>
        <p class="text-sm leading-6 text-neutral-500">
          Зміни застосовуються лише до preview. Спробуй resize — введені значення залишаються.
        </p>
        <BaseFormGrid>
          <BaseInput v-model="draft.title" id="showcase-task-title" label="Назва задачі" required />
          <BaseSelect
            v-model="draft.brand"
            id="showcase-task-brand"
            label="Бренд"
            :options="brandOptions"
          />
        </BaseFormGrid>
        <BaseTextarea
          v-model="draft.description"
          id="showcase-task-description"
          label="Опис"
          :rows="4"
        />
        <BaseActionBar class="justify-end">
          <BaseButton @click="editorOpen = false">Скасувати</BaseButton>
          <BaseButton type="submit" variant="primary">Додати до demo</BaseButton>
        </BaseActionBar>
      </form>
    </BaseModal>
    <BaseModal v-model="detailsOpen" size="md" aria-label="Деталі демонстраційної задачі">
      <h2 class="text-xl font-bold">{{ selectedTask?.title }}</h2>
      <p class="mt-3 text-sm leading-7 text-neutral-600">
        {{ selectedTask?.brand }} · {{ selectedTask?.type }} · {{ selectedTask?.status }}
      </p>
      <p class="mt-3 text-sm leading-7">
        {{
          selectedTask?.description ||
          'Демонстрація читабельної форми деталей і внутрішнього scroll.'
        }}
      </p>
    </BaseModal>
  </section>
</template>

<script setup>
  import { computed, reactive, ref } from 'vue'
  import {
    ChartBarIcon,
    SparklesIcon,
    ClipboardDocumentCheckIcon,
    PhotoIcon,
    MapIcon,
  } from '@heroicons/vue/24/outline'
  import BaseActionBar from '@/components/base/BaseActionBar.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseFormGrid from '@/components/base/BaseFormGrid.vue'
  import BaseInput from '@/components/base/BaseInput.vue'
  import BaseSelect from '@/components/base/BaseSelect.vue'
  import BaseTextarea from '@/components/base/BaseTextarea.vue'
  import BaseTableScroll from '@/components/base/BaseTableScroll.vue'
  import BaseModal from '@/components/base/BaseModal.vue'
  import GeneratedArtifact from '@/components/generator/GeneratedArtifact.vue'
  import MapCard from '@/components/maps/MapCard.vue'

  const principles = [
    { title: 'Mobile-first', text: 'Контент і дії залишаються доступними від вузького екрана.' },
    { title: 'Спільні патерни', text: 'Ті самі Base-компоненти для різних робочих модулів.' },
    {
      title: 'Без втрати даних',
      text: 'Таблиці прокручуються локально, форми зберігають введення.',
    },
  ]
  const modules = [
    {
      id: 'analytics',
      label: 'Analytics',
      icon: ChartBarIcon,
      route: '/analytics/tasks',
      description: 'Фільтри, KPI та щільна таблиця з доступними деталями.',
      pattern: 'Container-responsive grid, локальний table scroll і спільна modal lifecycle.',
      components: ['BaseFormGrid', 'BaseTableScroll', 'BaseModal'],
    },
    {
      id: 'generator',
      label: 'Promo / Tournament',
      icon: SparklesIcon,
      route: '/promo',
      description: 'Гнучка форма й CMS-результат із робочими Copy / Expand.',
      pattern:
        'Форма реагує на ширину контейнера; GeneratedArtifact використовується в обох генераторах.',
      components: ['BaseFormGrid', 'GeneratedArtifact', 'BaseActionBar'],
    },
    {
      id: 'checklists',
      label: 'Checklists',
      icon: ClipboardDocumentCheckIcon,
      route: '/checklists',
      description: 'Довгі пункти, touch-friendly controls і прогрес перевірки.',
      pattern:
        'Одноколонковий читабельний список без hover-only дій; progress і reset працюють локально.',
      components: ['BaseActionBar', 'BaseButton', 'Native checkbox'],
    },
    {
      id: 'banners',
      label: 'Banner Export',
      icon: PhotoIcon,
      route: '/banner-export',
      description: 'Параметри експорту й таблиця банерів, яка не розтягує сторінку.',
      pattern:
        'Форма та результати мають незалежне containment; усі колонки доступні через scroll.',
      components: ['BaseFormGrid', 'BaseSelect', 'BaseTableScroll'],
    },
    {
      id: 'maps',
      label: 'Maps',
      icon: MapIcon,
      route: '/maps',
      description: 'Справжня картка Maps і гнучка демонстраційна схема процесу.',
      pattern:
        'MapCard переносить текст і дії; canvas у робочому редакторі має окрему wide-політику.',
      components: ['MapCard', 'BaseActionBar', 'Container queries'],
    },
  ]
  const activeModule = ref('analytics')
  const selectedModule = computed(() => modules.find((module) => module.id === activeModule.value))
  const sizes = [
    { id: 'phone', label: 'Вузький · 375' },
    { id: 'tablet', label: 'Середній · 768' },
    { id: 'wide', label: 'На всю ширину' },
  ]
  const previewSize = ref('wide')
  const previewWidth = computed(
    () => ({ phone: '375px', tablet: '768px', wide: '100%' })[previewSize.value],
  )
  const notice = ref('')
  const search = ref('')
  const status = ref('')
  const statusOptions = [
    { value: 'Done', label: 'Done' },
    { value: 'In Progress', label: 'In Progress' },
  ]
  const brandOptions = [
    { value: 'JC', label: 'JeetCity' },
    { value: 'MW', label: 'MoonWin' },
    { value: 'BH', label: 'Boho Casino' },
  ]
  const tasks = ref([
    {
      id: 1,
      key: 'DEMO-101',
      title: 'Підготувати контент сезонного турніру',
      brand: 'JC',
      type: 'Tournament',
      sp: 2,
      status: 'In Progress',
    },
    {
      id: 2,
      key: 'DEMO-102',
      title: 'Перевірити promo page та mobile banners',
      brand: 'MW',
      type: 'Promo',
      sp: 1,
      status: 'Done',
    },
    {
      id: 3,
      key: 'DEMO-103',
      title: 'QA локалізацій і посилань кампанії',
      brand: 'BH',
      type: 'QA',
      sp: 1.5,
      status: 'Done',
    },
  ])
  const filteredTasks = computed(() =>
    tasks.value.filter(
      (task) =>
        (!status.value || task.status === status.value) &&
        `${task.title} ${task.brand}`.toLowerCase().includes(search.value.toLowerCase()),
    ),
  )
  const metrics = computed(() => [
    { label: 'Demo задачі', value: tasks.value.length },
    { label: 'Завершено', value: tasks.value.filter((task) => task.status === 'Done').length },
    { label: 'Брендів у прикладі', value: new Set(tasks.value.map((task) => task.brand)).size },
  ])
  const editorOpen = ref(false)
  const detailsOpen = ref(false)
  const selectedTask = ref(null)
  const draft = reactive({ title: '', brand: 'JC', description: '' })
  const generatorBrand = ref('JC')
  const imageUrl = ref('https://example.test/campaign/desktop-banner.webp')
  const description = ref(
    'Сезонна кампанія: promo page, банери та локалізації для desktop і mobile.',
  )
  const generated = ref(false)
  const demoArtifact = computed(
    () =>
      `<article data-demo="true" data-brand="${generatorBrand.value}">\n  <h1>Demo seasonal campaign</h1>\n  <!-- Synthetic example. Not production CMS output. -->\n</article>`,
  )
  const checked = ref([])
  const checklistItems = [
    'Перевірити desktop і mobile банери та відповідність розмірів.',
    'Перевірити назви, дати й локалізовані правила кампанії.',
    'Перевірити всі посилання та bonus code перед публікацією.',
    'Підтвердити QA та готовність контенту до запуску.',
  ]
  const campaign = ref('DEMO-SEASONAL-2026')
  const format = ref('webp')
  const banners = [
    { name: 'Desktop hero', size: '1200 × 600' },
    { name: 'Mobile card', size: '640 × 800' },
    { name: 'Promo tile', size: '800 × 400' },
  ]
  const demoMap = {
    id: 'showcase-only',
    title: 'Demo · запуск сезонної кампанії',
    description:
      'Від ідеї до QA: контент, банери й перевірка готовності. Ця картка не пов’язана з робочими картами.',
    type: 'campaign',
    status: 'draft',
    updatedAt: '2026-10-06T00:00:00Z',
  }
  const mapSteps = ['Контент і правила', 'Банери та локалізації', 'QA і запуск']

  function selectModule(id) {
    activeModule.value = id
    notice.value = ''
  }

  function notify(message) {
    notice.value = message
  }

  function openTask(task) {
    selectedTask.value = task
    detailsOpen.value = true
  }

  function saveDemo() {
    if (!draft.title.trim()) return
    const id = Math.max(...tasks.value.map((task) => task.id)) + 1
    tasks.value.push({
      id,
      key: `DEMO-${100 + id}`,
      title: draft.title.trim(),
      brand: draft.brand,
      description: draft.description,
      type: 'Promo',
      sp: '—',
      status: 'In Progress',
    })
    editorOpen.value = false
    notify('Задачу додано лише до демонстрації. Backend і робочі дані не змінено.')
    Object.assign(draft, { title: '', brand: 'JC', description: '' })
  }
</script>

<style scoped>
  .showcase-hero {
    background:
      radial-gradient(ellipse at 100% 0%, #c4e9df 0%, transparent 55%),
      radial-gradient(ellipse at 0% 100%, #e1defb 0%, transparent 50%), #f2f6f5;
  }
</style>
