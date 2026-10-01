<template>
  <section class="mx-auto w-full max-w-6xl space-y-6">
    <header
      class="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <div class="mb-2 flex items-center gap-2">
          <span
            class="rounded-full border border-black/10 bg-neutral-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-500"
          >
            Generator
          </span>

          <span class="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
            <span class="h-2 w-2 rounded-full bg-green-500" />

            Backend
          </span>
        </div>

        <h1 class="text-2xl font-bold tracking-tight text-black sm:text-3xl">
          {{ title }}
        </h1>

        <p class="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
          {{ description }}
        </p>
      </div>
    </header>

    <div class="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
      <slot />
    </div>

    <section v-if="showResults && $slots.result" class="space-y-4">
      <div>
        <h2 class="text-lg font-bold text-black">Generated content</h2>

        <p class="mt-1 text-sm text-neutral-500">Copy or expand generated CMS artifacts below.</p>
      </div>

      <slot name="result" />
    </section>
  </section>
</template>

<script setup>
  defineProps({
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: '',
    },

    showResults: {
      type: Boolean,
      default: false,
    },
  })
</script>
