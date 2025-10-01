<template>
  <div class="w-full relative">
    <!-- Бекдроп (блюр) -->
    <div
      v-if="expanded"
      class="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm"
      @click="toggleFullscreen(false)"
    />

    <!-- Панель редактора (одна й та сама у двох режимах) -->
    <div
      class="relative"
      :class="
        expanded
          ? 'fixed z-[1000] left-1/2 top-1/2 -translate-x-1/2 ' +
            'w-[min(92vw,900px)] h-[85vh] bg-white rounded-2xl shadow-xl p-4'
          : ''
      "
    >
      <!-- Кнопка розгортання/згортання -->
      <BaseButton
        type="button"
        class="absolute top-2 right-2 p-1 rounded z-20"
        @click="toggleFullscreen(!expanded)"
        :title="expanded ? 'Collapse' : 'Expand'"
        :aria-label="expanded ? 'Collapse editor' : 'Expand editor'"
      >
        <ArrowsPointingInIcon v-if="expanded" class="w-5 h-5" />
        <ArrowsPointingOutIcon v-else class="w-5 h-5" />
      </BaseButton>

      <!-- Toolbar -->
      <div class="flex flex-wrap items-center gap-2 mb-2">
        <BaseButton class="px-2 py-1" @click="exec('bold')" title="Bold"><b>B</b></BaseButton>
        <BaseButton class="px-2 py-1" @click="exec('italic')" title="Italic"><i>I</i></BaseButton>
        <BaseButton class="px-2 py-1" @click="exec('underline')" title="Underline">
          <u>U</u>
        </BaseButton>

        <div class="w-px h-6 bg-black/10 mx-1" />

        <BaseButton class="px-2 py-1" @click="exec('insertUnorderedList')" title="Bulleted list">
          • List
        </BaseButton>
        <BaseButton class="px-2 py-1" @click="exec('insertOrderedList')" title="Numbered list">
          1. List
        </BaseButton>
        <BaseButton class="px-2 py-1" @click="insertBr" title="Line break (Shift+Enter)">
          BR
        </BaseButton>

        <div class="w-px h-6 bg-black/10 mx-1" />

        <BaseButton class="px-2 py-1" @click="addLink" title="Insert link">Link</BaseButton>
        <BaseButton class="px-2 py-1" @click="exec('removeFormat')" title="Clear formatting">
          Clear
        </BaseButton>

        <div class="w-px h-6 bg-black/10 mx-1" />

        <!-- Headings popover (вправо) -->
        <div ref="headingWrap" class="relative">
          <BaseButton class="px-2 py-1" @click="toggleHeadings" title="Headings">H</BaseButton>
          <div
            v-if="showHeadings"
            class="absolute left-full top-0 ml-2 z-[1001] w-36 rounded-lg border bg-white shadow-lg p-2 space-y-1"
          >
            <BaseButton
              v-for="n in 6"
              :key="n"
              class="w-full justify-start px-2 py-1"
              @click="setHeading(n)"
            >
              H{{ n }}
            </BaseButton>
            <div class="h-px bg-black/10 my-1" />
            <BaseButton class="w-full justify-start px-2 py-1" @click="setParagraph">
              P (Paragraph)
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Editor -->
      <div
        ref="editorEl"
        class="flex-1 border-dashed rounded border p-3 bg-white text-black font-mono focus:outline-none overflow-auto"
        :class="[editorClass, expanded ? 'h-[75vh]' : 'min-h-[180px]']"
        :data-placeholder="placeholder"
        :contenteditable="!disabled"
        :spellcheck="spellcheck ? 'true' : 'false'"
        role="textbox"
        aria-multiline="true"
        @input="onInput"
        @keydown="onKeydown"
        @keydown.shift.enter.prevent="insertBr"
        @paste="onPaste"
        @focus="$emit('focus')"
        @blur="$emit('blur')"
      ></div>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import { ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/vue/24/solid'

  /* props / emits */
  const props = defineProps({
    modelValue: { type: String, default: '' }, // HTML (v-model)
    plain: { type: String, default: '' }, // plain text (v-model:plain)
    placeholder: { type: String, default: 'Type here…' },
    disabled: { type: Boolean, default: false },
    spellcheck: { type: Boolean, default: true },
    editorClass: { type: [String, Array, Object], default: '' },
    pasteAsPlain: { type: Boolean, default: true },
  })
  const emit = defineEmits(['update:modelValue', 'update:plain', 'focus', 'blur', 'input'])

  /* state */
  const editorEl = ref(null)
  let internalHtml = props.modelValue || ''
  const expanded = ref(false)

  /* Headings popover */
  const showHeadings = ref(false)
  const headingWrap = ref(null)
  function toggleHeadings() {
    showHeadings.value = !showHeadings.value
  }
  function onDocClick(e) {
    if (!showHeadings.value) return
    const wrap = headingWrap.value
    if (wrap && !wrap.contains(e.target)) showHeadings.value = false
  }

  /* fullscreen */
  function toggleFullscreen(v) {
    expanded.value = !!v
    document.documentElement.classList.toggle('overflow-hidden', expanded.value)
    nextTick(() => editorEl.value?.focus())
  }

  /* utils */
  function htmlToPlain(html) {
    return String(html || '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
      .replace(/<li>/gi, '• ')
      .replace(/<[^>]+>/g, '')
      .replace(/\u00A0/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }
  function setHtmlUnsafe(html) {
    const el = editorEl.value
    if (el && el.innerHTML !== html) el.innerHTML = html
  }

  /* commands */
  function exec(cmd, val = null) {
    if (props.disabled) return
    editorEl.value?.focus()
    document.execCommand(cmd, false, val)
    onInput({ target: editorEl.value })
  }
  function insertBr() {
    if (props.disabled) return
    editorEl.value?.focus()
    document.execCommand('insertHTML', false, '<br>')
    onInput({ target: editorEl.value })
  }
  function addLink() {
    if (props.disabled) return
    const url = prompt('Enter URL', 'https://')
    if (!url) return
    exec('createLink', url)
  }
  function setHeading(n) {
    editorEl.value?.focus()
    document.execCommand('formatBlock', false, `H${n}`)
    onInput({ target: editorEl.value })
  }
  function setParagraph() {
    editorEl.value?.focus()
    document.execCommand('formatBlock', false, 'P')
    onInput({ target: editorEl.value })
  }

  /* events */
  function onInput(e) {
    const html = e?.target?.innerHTML ?? ''
    internalHtml = html
    const plain = htmlToPlain(html)
    emit('update:modelValue', html)
    emit('update:plain', plain)
    emit('input', { html, plain })
  }
  function onPaste(e) {
    if (!props.pasteAsPlain) return
    e.preventDefault()
    const text = (e.clipboardData || window.clipboardData).getData('text')
    document.execCommand('insertText', false, text)
  }
  function onKeydown(e) {
    // ESC закриває fullscreen
    if (expanded.value && e.key === 'Escape') {
      e.preventDefault()
      toggleFullscreen(false)
    }
    // Ctrl/⌘ + Alt + 1..6 → H1..H6, 0 → P
    if ((e.ctrlKey || e.metaKey) && e.altKey) {
      const n = parseInt(e.key, 10)
      if (n >= 1 && n <= 6) {
        e.preventDefault()
        setHeading(n)
      } else if (e.key === '0') {
        e.preventDefault()
        setParagraph()
      }
    }
  }

  /* sync з батька -> редактор */
  watch(
    () => props.modelValue,
    (v) => {
      if (v === internalHtml) return
      internalHtml = v || ''
      nextTick(() => setHtmlUnsafe(internalHtml))
    },
    { immediate: true },
  )

  /* mount */
  onMounted(() => {
    document.addEventListener('click', onDocClick)
  })
  onBeforeUnmount(() => {
    document.removeEventListener('click', onDocClick)
    document.documentElement.classList.remove('overflow-hidden')
  })
</script>

<style scoped>
  /* placeholder для contenteditable */
  div[contenteditable='true']:empty::before {
    content: attr(data-placeholder);
    color: #9ca3af; /* gray-400 */
  }
</style>
