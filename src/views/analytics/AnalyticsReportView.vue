<template>
  <section>
    <div class="mb-[22px] grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="kpi in kpis"
        :key="kpi.label"
        class="rounded-[14px] border border-black bg-white px-4 py-3"
      >
        <p class="m-0 text-xs text-neutral-500">
          {{ kpi.label }}
        </p>

        <p class="m-0 mt-1 text-[27px] font-bold leading-tight tracking-[-0.02em]">
          {{ kpi.value }}
        </p>

        <p class="mt-1 text-xs text-neutral-400">Дані ще не підключені</p>
      </article>
    </div>

    <div class="flex flex-col gap-[22px]">
      <article
        v-for="section in reportSections"
        :key="section.title"
        class="overflow-hidden rounded-[14px] border border-black bg-white"
      >
        <header class="border-b border-neutral-200 px-[18px] py-4">
          <h2 class="m-0 text-lg font-bold">
            {{ section.title }}
          </h2>

          <p class="mt-0.5 text-[13px] text-neutral-500">
            {{ section.description }}
          </p>
        </header>

        <div class="px-[18px] py-12 text-center text-sm text-neutral-500">
          Цей блок реалізуємо після Task List
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
  const kpis = [
    {
      label: 'Закрито задач',
      value: '—',
    },
    {
      label: 'SP за період',
      value: '—',
    },
    {
      label: 'Середній SP на задачу',
      value: '—',
    },
    {
      label: 'Задач на людину',
      value: '—',
    },
  ]

  const reportSections = [
    {
      title: 'Куди пішла робота: типи задач',
      description: 'Частка задач і SP за типом',
    },
    {
      title: 'Блок 1. Виконавці та бренди',
      description: 'Кількість закритих задач і SP за вибраний період',
    },
    {
      title: 'Блок 2. Динаміка по часу',
      description: 'Дані по тижнях і місяцях',
    },
    {
      title: 'Зведена: період × бренд',
      description: 'Розподіл задач або SP за періодами та брендами',
    },
  ]
</script>
