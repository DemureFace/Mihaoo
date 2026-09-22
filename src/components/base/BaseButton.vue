<template>
  <component
    :is="componentTag"
    :type="componentTag === 'button' ? type : undefined"
    :disabled="componentTag === 'button' ? disabled || loading : undefined"
    :to="to || undefined"
    :href="href || undefined"
    :aria-disabled="disabled || loading || undefined"
    :tabindex="disabled || loading ? -1 : undefined"
    :class="buttonClasses"
    @click="handleClick"
  >
    <span
      v-if="loading"
      class="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />

    <slot />
  </component>
</template>

<script setup>
  import { computed } from 'vue'
  import { RouterLink } from 'vue-router'

  const props = defineProps({
    variant: {
      type: String,
      default: 'secondary',
      validator: (value) =>
        ['primary', 'secondary', 'ghost', 'danger', 'link', 'plain'].includes(value),
    },

    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg'].includes(value),
    },

    type: {
      type: String,
      default: 'button',
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    loading: {
      type: Boolean,
      default: false,
    },

    to: {
      type: [String, Object],
      default: null,
    },

    href: {
      type: String,
      default: '',
    },

    fullWidth: {
      type: Boolean,
      default: false,
    },
  })
  const emit = defineEmits(['click'])
  const componentTag = computed(() => {
    if (props.to) {
      return RouterLink
    }

    if (props.href) {
      return 'a'
    }

    return 'button'
  })

  const variantClasses = computed(() => {
    const variants = {
      primary: 'border-black bg-black text-white hover:bg-neutral-800',

      secondary: 'border-black bg-white text-black hover:bg-neutral-100',

      ghost: 'border-transparent bg-transparent text-black hover:bg-neutral-100',

      danger: 'border-red-700 bg-red-700 text-white hover:bg-red-800',

      link: 'border-transparent bg-transparent p-0 text-black underline underline-offset-2 hover:no-underline',

      plain: 'border-transparent bg-transparent text-inherit',
    }

    return variants[props.variant]
  })

  const sizeClasses = computed(() => {
    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-3 text-base',
    }

    return props.variant === 'link' || props.variant === 'plain' ? '' : sizes[props.size]
  })

  const buttonClasses = computed(() => [
    'inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30',
    'disabled:cursor-not-allowed disabled:opacity-40',
    props.disabled || props.loading ? 'cursor-not-allowed opacity-40' : '',
    variantClasses.value,
    sizeClasses.value,
    props.fullWidth ? 'w-full' : '',
  ])

  function handleClick(event) {
    if (props.disabled || props.loading) {
      event.preventDefault()
      event.stopPropagation()
      return
    }

    emit('click', event)
  }
</script>
