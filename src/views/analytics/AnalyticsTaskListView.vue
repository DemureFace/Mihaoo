<script setup>
  import { computed } from 'vue'

  import { ANALYTICS_BRANDS, ANALYTICS_TASKS } from '@/mocks/analytics/analytics.mock'

  const tasks = computed(() => {
    return [...ANALYTICS_TASKS].sort((a, b) => b.id - a.id)
  })

  function getBrand(brandCode) {
    return ANALYTICS_BRANDS.find((brand) => brand.code === brandCode)
  }

  function brandStyle(brandCode) {
    const brand = getBrand(brandCode)

    if (!brand) {
      return {}
    }

    return {
      backgroundColor: brand.color,
    }
  }

  function formatDate(date) {
    if (!date) {
      return '—'
    }

    return new Intl.DateTimeFormat('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    }).format(new Date(date))
  }

  function formatSp(sp) {
    return Number(sp).toFixed(1)
  }
</script>

<template>
  <section class="overflow-hidden rounded-[14px] border border-black bg-white">
    <header class="flex flex-wrap items-center gap-4 border-b border-neutral-200 px-[18px] py-4">
      <div>
        <h2 class="m-0 text-lg font-bold">Таск Ліст</h2>

        <p class="mt-0.5 text-[13px] text-neutral-500">Одиниця обліку — задача на один бренд</p>
      </div>

      <div class="ml-auto flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Пошук за назвою або Jira"
          disabled
          class="min-w-[220px] rounded-lg border border-black bg-white px-3 py-2 text-sm disabled:opacity-50"
        />

        <button
          type="button"
          disabled
          class="rounded-lg border border-black bg-white px-3 py-2 text-sm font-medium disabled:opacity-40"
        >
          Експорт CSV
        </button>

        <button
          type="button"
          disabled
          class="rounded-[10px] border border-black bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          + Нова задача
        </button>
      </div>
    </header>

    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th
              class="whitespace-nowrap border-b border-black px-3.5 py-3 text-right text-xs font-semibold text-neutral-500"
            >
              №
            </th>

            <th
              class="whitespace-nowrap border-b border-black px-3.5 py-3 text-left text-xs font-semibold text-neutral-500"
            >
              Jira
            </th>

            <th
              class="whitespace-nowrap border-b border-black px-3.5 py-3 text-left text-xs font-semibold text-neutral-500"
            >
              Назва
            </th>

            <th
              class="whitespace-nowrap border-b border-black px-3.5 py-3 text-left text-xs font-semibold text-neutral-500"
            >
              Тип
            </th>

            <th
              class="whitespace-nowrap border-b border-black px-3.5 py-3 text-left text-xs font-semibold text-neutral-500"
            >
              Платформа
            </th>

            <th
              class="whitespace-nowrap border-b border-black px-3.5 py-3 text-left text-xs font-semibold text-neutral-500"
            >
              Бренд
            </th>

            <th
              class="whitespace-nowrap border-b border-black px-3.5 py-3 text-left text-xs font-semibold text-neutral-500"
            >
              Виконавець
            </th>

            <th
              class="whitespace-nowrap border-b border-black px-3.5 py-3 text-left text-xs font-semibold text-neutral-500"
            >
              Від кого
            </th>

            <th
              class="whitespace-nowrap border-b border-black px-3.5 py-3 text-right text-xs font-semibold text-neutral-500"
            >
              SP
            </th>

            <th
              class="whitespace-nowrap border-b border-black px-3.5 py-3 text-left text-xs font-semibold text-neutral-500"
            >
              Дата
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="task in tasks"
            :key="task.id"
            class="cursor-pointer border-b border-neutral-100 transition hover:bg-neutral-100"
          >
            <td class="whitespace-nowrap px-3.5 py-2.5 text-right text-neutral-500">
              {{ task.id }}
            </td>

            <td class="whitespace-nowrap px-3.5 py-2.5">
              <span v-if="task.jira" class="underline underline-offset-2">
                {{ task.jira }}
              </span>

              <span v-else class="text-neutral-400">—</span>
            </td>

            <td class="min-w-[230px] px-3.5 py-2.5 font-medium">
              {{ task.title }}
            </td>

            <td class="whitespace-nowrap px-3.5 py-2.5">
              {{ task.type }}
            </td>

            <td class="whitespace-nowrap px-3.5 py-2.5">
              {{ task.platform }}
            </td>

            <td class="whitespace-nowrap px-3.5 py-2.5">
              <span
                class="inline-flex rounded-full border border-black px-2.5 py-0.5 text-xs font-semibold"
                :style="brandStyle(task.brand)"
              >
                {{ task.brand }}
              </span>
            </td>

            <td class="whitespace-nowrap px-3.5 py-2.5">
              {{ task.assignee }}
            </td>

            <td class="whitespace-nowrap px-3.5 py-2.5">
              {{ task.reporter }}
            </td>

            <td class="whitespace-nowrap px-3.5 py-2.5 text-right font-medium">
              {{ formatSp(task.sp) }}
            </td>

            <td class="whitespace-nowrap px-3.5 py-2.5">
              <template v-if="task.status === 'done'">
                {{ formatDate(task.completed) }}
              </template>

              <span
                v-else
                class="inline-flex rounded-full border border-blue-700 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-800"
              >
                In Progress
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer
      class="flex items-center gap-3 border-t border-neutral-200 px-[18px] py-3 text-[13px] text-neutral-500"
    >
      <span>{{ tasks.length }} рядків</span>

      <span>·</span>

      <span>
        SP:
        {{ formatSp(tasks.reduce((total, task) => total + task.sp, 0)) }}
      </span>

      <div class="ml-auto flex items-center gap-2">
        <button
          type="button"
          disabled
          class="rounded-lg border border-black px-3 py-1.5 disabled:opacity-30"
        >
          ‹
        </button>

        <span>1 / 1</span>

        <button
          type="button"
          disabled
          class="rounded-lg border border-black px-3 py-1.5 disabled:opacity-30"
        >
          ›
        </button>
      </div>
    </footer>
  </section>
</template>
