<template>
  <aside class="w-[300px] shrink-0 bg-white border border-black/10 rounded-2xl p-5 overflow-y-auto">
    <template v-if="node">
      <div class="flex items-center justify-between">
        <h2 class="font-bold text-lg">Properties</h2>

        <span class="text-xs text-black/40">Node</span>
      </div>

      <div class="mt-6 flex flex-col gap-4">
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold">Title</span>

          <input
            :value="node.data.title"
            type="text"
            class="field"
            @input="update('title', $event.target.value)"
          />
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold">Description</span>

          <textarea
            :value="node.data.description"
            rows="4"
            class="field resize-none"
            @input="update('description', $event.target.value)"
          />
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold">Type</span>

          <select
            :value="node.data.type"
            class="field"
            @change="update('type', $event.target.value)"
          >
            <option value="step">Step</option>

            <option value="milestone">Milestone</option>

            <option value="decision">Decision</option>

            <option value="service">Service</option>

            <option value="note">Note</option>
          </select>
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold">Status</span>

          <select
            :value="node.data.status"
            class="field"
            @change="update('status', $event.target.value)"
          >
            <option value="draft">Draft</option>

            <option value="active">Active</option>

            <option value="completed">Completed</option>

            <option value="blocked">Blocked</option>
          </select>
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold">Owner</span>

          <input
            :value="node.data.owner"
            type="text"
            placeholder="Mykhailo B"
            class="field"
            @input="update('owner', $event.target.value)"
          />
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold">Due date</span>

          <input
            :value="node.data.dueDate"
            type="date"
            class="field"
            @input="update('dueDate', $event.target.value)"
          />
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold">Link</span>

          <input
            :value="node.data.url"
            type="url"
            placeholder="Jira / document URL"
            class="field"
            @input="update('url', $event.target.value)"
          />
        </label>
      </div>
    </template>

    <template v-else-if="edge">
      <div class="flex items-center justify-between">
        <h2 class="font-bold text-lg">Connection</h2>

        <span class="text-xs text-black/40">Edge</span>
      </div>

      <div class="mt-6 flex flex-col gap-4">
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold">Label</span>

          <input
            :value="edge.label || ''"
            type="text"
            placeholder="e.g. GO"
            class="field"
            @input="updateEdgeField('label', $event.target.value)"
          />
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold">Connection type</span>

          <select
            :value="edge.type || 'smoothstep'"
            class="field"
            @change="updateEdgeField('type', $event.target.value)"
          >
            <option value="smoothstep">Smooth Step</option>

            <option value="straight">Straight</option>

            <option value="step">Step</option>
          </select>
        </label>

        <button
          type="button"
          class="mt-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100"
          @click="$emit('delete-edge', edge.id)"
        >
          Delete connection
        </button>
      </div>
    </template>

    <div v-else class="h-full flex flex-col items-center justify-center text-center text-black/40">
      <p class="font-semibold">Nothing selected</p>

      <p class="mt-1 text-xs">Select a block on the map to edit its properties.</p>
    </div>
  </aside>
</template>

<script setup>
  const props = defineProps({
    node: {
      type: Object,
      default: null,
    },

    edge: {
      type: Object,
      default: null,
    },
  })

  const emit = defineEmits(['update-node', 'update-edge', 'delete-edge'])

  function update(key, value) {
    if (!props.node) return

    emit('update-node', {
      id: props.node.id,

      patch: {
        [key]: value,
      },
    })
  }

  function updateEdgeField(key, value) {
    if (!props.edge) return

    emit('update-edge', {
      id: props.edge.id,

      patch: {
        [key]: value,
      },
    })
  }
</script>

<style scoped>
  .field {
    width: 100%;
    border: 1px solid rgb(0 0 0 / 0.1);
    border-radius: 0.75rem;
    padding: 0.65rem 0.75rem;
    outline: none;
    font-size: 0.875rem;
  }

  .field:focus {
    border-color: rgb(0 0 0 / 0.35);
  }
</style>
