<template>
  <section class="overflow-hidden rounded-[14px] border border-black bg-white">
    <header class="border-b border-neutral-200 px-[18px] py-4">
      <h2 class="m-0 text-lg font-bold">Період × бренд</h2>

      <p class="mt-0.5 text-[13px] text-neutral-500">
        Фактично зараховані SP по брендах у кожному Sprint
      </p>
    </header>

    <div v-if="loading" class="px-4 py-12 text-center text-sm text-neutral-500">
      Завантажуємо дані...
    </div>

    <div v-else-if="!apiReady" class="px-4 py-12 text-center text-sm text-neutral-500">
      Pivot зʼявиться після підключення Analytics Report API.
    </div>

    <div
      v-else-if="!rows.length || !brands.length"
      class="px-4 py-12 text-center text-sm text-neutral-500"
    >
      За вибраними фільтрами немає даних.
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full min-w-[760px] border-collapse text-sm">
        <thead>
          <tr class="border-b border-neutral-200 bg-neutral-50">
            <th
              class="sticky left-0 z-10 min-w-[190px] bg-neutral-50 px-4 py-3 text-left text-xs font-semibold text-neutral-500"
            >
              Sprint
            </th>

            <th
              v-for="brand in brands"
              :key="brand"
              class="min-w-[100px] px-4 py-3 text-right text-xs font-semibold text-neutral-500"
            >
              {{ brandLabel(brand) }}

              <span class="ml-1 font-normal text-neutral-400">
                {{ brand }}
              </span>
            </th>

            <th class="min-w-[110px] px-4 py-3 text-right text-xs font-semibold text-neutral-500">
              Total SP
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="row in rows"
            :key="rowKey(row)"
            class="border-b border-neutral-100 last:border-b-0"
          >
            <td class="sticky left-0 z-10 bg-white px-4 py-3">
              <p class="m-0 font-semibold">
                {{ sprintName(row) }}
              </p>

              <p v-if="sprintPeriod(row)" class="mt-0.5 text-xs text-neutral-400">
                {{ sprintPeriod(row) }}
              </p>
            </td>

            <td
              v-for="brand in brands"
              :key="`${rowKey(row)}-${brand}`"
              class="px-4 py-3 text-right transition"
              :class="
                cellFilters(row, brand) ? 'cursor-pointer font-semibold hover:bg-neutral-100' : ''
              "
              :tabindex="cellFilters(row, brand) ? 0 : undefined"
              :role="cellFilters(row, brand) ? 'button' : undefined"
              @click="openCell(row, brand)"
              @keydown.enter="openCell(row, brand)"
              @keydown.space.prevent="openCell(row, brand)"
            >
              {{ formatNumber(cellSp(row, brand)) }}
            </td>

            <td class="px-4 py-3 text-right font-bold">
              {{ formatNumber(rowTotal(row)) }}
            </td>
          </tr>

          <tr class="border-t border-black bg-neutral-50">
            <td class="sticky left-0 z-10 bg-neutral-50 px-4 py-3 font-bold">Total</td>

            <td
              v-for="brand in brands"
              :key="`total-${brand}`"
              class="px-4 py-3 text-right font-semibold"
            >
              {{ formatNumber(brandTotal(brand)) }}
            </td>

            <td class="px-4 py-3 text-right font-bold">
              {{ formatNumber(grandTotal) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
  import { computed } from 'vue'
  import { useStore } from 'vuex'

  const props = defineProps({
    rows: {
      type: Array,
      default: () => [],
    },

    brands: {
      type: Array,
      default: () => [],
    },

    loading: {
      type: Boolean,
      default: false,
    },

    apiReady: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits(['drilldown'])

  const store = useStore()

  const grandTotal = computed(() => {
    return props.rows.reduce((sum, row) => sum + rowTotal(row), 0)
  })

  function cellData(row, brand) {
    const cells = row.cells || row.values || row.brands || {}

    if (Array.isArray(cells)) {
      return cells.find((item) => item.brand === brand || item.brandCode === brand)
    }

    return cells[brand]
  }

  function cellSp(row, brand) {
    const cell = cellData(row, brand)

    if (typeof cell === 'number' || typeof cell === 'string') {
      return Number(cell) || 0
    }

    return Number(cell?.totalSP ?? cell?.storyPoints ?? cell?.value ?? 0)
  }

  function cellFilters(row, brand) {
    const cell = cellData(row, brand)

    if (!cell || typeof cell !== 'object') {
      return null
    }

    return cell.filters || null
  }

  function openCell(row, brand) {
    const filters = cellFilters(row, brand)

    if (!filters) {
      return
    }

    emit('drilldown', filters)
  }

  function rowTotal(row) {
    return props.brands.reduce((sum, brand) => sum + cellSp(row, brand), 0)
  }

  function brandTotal(brand) {
    return props.rows.reduce((sum, row) => sum + cellSp(row, brand), 0)
  }

  function brandLabel(code) {
    return store.getters['analytics/brandLabel'](code)
  }

  function rowKey(row) {
    return row.sprintId || row.sprint?.id || sprintName(row)
  }

  function sprintName(row) {
    return row.sprintName || row.sprint?.name || `Sprint ${row.sprintId || row.sprint?.id || '—'}`
  }

  function sprintPeriod(row) {
    const start = row.startDate || row.sprint?.startDate

    const end = row.endDate || row.sprint?.endDate

    if (!start || !end) {
      return ''
    }

    return `${formatDate(start)} — ${formatDate(end)}`
  }

  function formatNumber(value) {
    const number = Number(value)

    if (!Number.isFinite(number)) {
      return '0'
    }

    return number.toLocaleString('en-US', {
      maximumFractionDigits: 2,
    })
  }

  function formatDate(value) {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return ''
    }

    return new Intl.DateTimeFormat('uk-UA', {
      day: '2-digit',
      month: '2-digit',
    }).format(date)
  }
</script>
