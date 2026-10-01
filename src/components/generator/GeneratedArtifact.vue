<template>
  <section class="space-y-2 rounded-lg border border-black p-4">
    <div class="flex items-center justify-between gap-3">
      <h2 class="font-bold text-black">
        {{ title }}
      </h2>

      <div class="flex items-center gap-2">
        <BaseButton size="sm" @click="copyContent">
          {{ copied ? 'Copied' : 'Copy' }}
        </BaseButton>

        <BaseButton variant="ghost" size="sm" @click="expanded = !expanded">
          {{ expanded ? 'Collapse' : 'Expand' }}
        </BaseButton>
      </div>
    </div>

    <pre
      :class="[
        'overflow-auto whitespace-pre-wrap rounded-lg bg-neutral-50 p-3 text-xs text-black',
        expanded ? 'max-h-[75vh]' : 'max-h-52',
      ]"
      >{{ formattedContent }}</pre
    >
  </section>
</template>

<script setup>
  import { computed, ref } from 'vue'

  import BaseButton from '@/components/base/BaseButton.vue'

  const props = defineProps({
    title: {
      type: String,
      required: true,
    },

    content: {
      type: [String, Object, Array],
      required: true,
    },
  })

  const expanded = ref(false)
  const copied = ref(false)

  const formattedContent = computed(() => {
    if (typeof props.content === 'string') {
      return props.content
    }

    return JSON.stringify(props.content, null, 2)
  })

  async function copyContent() {
    await navigator.clipboard.writeText(formattedContent.value)

    copied.value = true

    window.setTimeout(() => {
      copied.value = false
    }, 1500)
  }
</script>
