<template>
  <div class="@container/form min-w-0">
    <div
      class="grid min-w-0 grid-cols-1 gap-4 @lg/form:grid-cols-2 [&>*]:min-w-0"
      :class="columns === 3 ? '@3xl/form:grid-cols-3' : ''"
    >
      <slot />
    </div>
  </div>
</template>

<script setup>
  defineProps({
    columns: { type: Number, default: 2, validator: (value) => [2, 3].includes(value) },
  })
</script>
