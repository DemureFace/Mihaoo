<template>
  <article class="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
    <header
      class="flex flex-col gap-3 border-b border-black/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex items-center gap-3">
        <div class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-neutral-100">
          <CodeBracketIcon class="h-5 w-5 text-black" />
        </div>

        <div>
          <h3 class="font-semibold text-black">
            {{ title }}
          </h3>

          <p class="text-xs text-neutral-500">Generated CMS artifact</p>
        </div>
      </div>

      <BaseActionBar>
        <BaseButton size="sm" variant="secondary" @click="copyContent">
          <CheckIcon v-if="copied" class="h-4 w-4" />

          <ClipboardDocumentIcon v-else class="h-4 w-4" />

          {{ copied ? 'Copied' : 'Copy' }}
        </BaseButton>

        <BaseButton
          size="sm"
          variant="ghost"
          :aria-label="expanded ? 'Collapse content' : 'Expand content'"
          @click="expanded = !expanded"
        >
          <ArrowsPointingInIcon v-if="expanded" class="h-4 w-4" />

          <ArrowsPointingOutIcon v-else class="h-4 w-4" />

          <span class="hidden sm:inline">
            {{ expanded ? 'Collapse' : 'Expand' }}
          </span>
        </BaseButton>
      </BaseActionBar>
    </header>

    <div class="bg-neutral-950 p-1">
      <pre
        :class="[
          'overflow-auto whitespace-pre-wrap break-words rounded-xl p-4 font-mono text-xs leading-5 text-neutral-100 transition-all',
          expanded ? 'max-h-[75vh]' : 'max-h-64',
        ]"
        >{{ formattedContent }}</pre
      >
    </div>

    <div v-if="copyError" class="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-700">
      Failed to copy content.
    </div>
  </article>
</template>

<script setup>
  import BaseActionBar from '@/components/base/BaseActionBar.vue'

  import { computed, ref } from 'vue'

  import {
    ArrowsPointingInIcon,
    ArrowsPointingOutIcon,
    CheckIcon,
    ClipboardDocumentIcon,
    CodeBracketIcon,
  } from '@heroicons/vue/24/outline'

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
  const copyError = ref(false)

  let copiedTimer = null

  const formattedContent = computed(() => {
    if (typeof props.content === 'string') {
      return props.content
    }

    return JSON.stringify(props.content, null, 2)
  })

  async function copyContent() {
    copyError.value = false

    try {
      await navigator.clipboard.writeText(formattedContent.value)

      copied.value = true

      if (copiedTimer) {
        window.clearTimeout(copiedTimer)
      }

      copiedTimer = window.setTimeout(() => {
        copied.value = false
      }, 1500)
    } catch {
      copied.value = false
      copyError.value = true
    }
  }
</script>
