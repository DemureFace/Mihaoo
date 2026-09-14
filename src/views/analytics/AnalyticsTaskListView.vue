<template>
  <section class="overflow-hidden rounded-[14px] border border-black bg-white">
    <header class="flex flex-wrap items-center gap-4 border-b border-neutral-200 px-[18px] py-4">
      <div>
        <h2 class="m-0 text-lg font-bold text-black">Таск Ліст</h2>

        <p class="mt-0.5 text-[13px] text-neutral-500">Одиниця обліку — задача на один бренд</p>
      </div>

      <div class="ml-auto flex flex-wrap items-center gap-2">
        <input
          type="search"
          disabled
          placeholder="Пошук за назвою або Jira"
          class="min-w-[220px] rounded-lg border border-black bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        />

        <button
          type="button"
          disabled
          class="rounded-lg border border-black px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
        >
          Експорт CSV
        </button>

        <button
          type="button"
          disabled
          class="rounded-[10px] border border-black bg-black px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
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
              v-for="column in columns"
              :key="column"
              class="whitespace-nowrap border-b border-black px-3.5 py-3 text-left text-xs font-semibold text-neutral-500"
              :class="{
                'text-right': column === '№' || column === 'SP',
              }"
            >
              {{ column }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td :colspan="columns.length" class="px-5 py-12 text-center text-sm text-neutral-500">
              Дані задач підключимо на наступному кроці
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer
      class="flex items-center gap-3 border-t border-neutral-200 px-[18px] py-3 text-[13px] text-neutral-500"
    >
      <span>0 рядків</span>

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

<script setup>
  const columns = [
    '№',
    'Jira',
    'Назва',
    'Тип',
    'Платформа',
    'Бренд',
    'Виконавець',
    'Від кого',
    'SP',
    'Дата',
  ]
</script>
