<template>
  <li class="py-1">
    <!-- leaf -->
    <label v-if="node.type === 'check'" class="flex gap-3 items-center cursor-pointer">
      <input type="checkbox" :checked="isChecked(node.id)" @change="toggle(node.id)" />
      <span>{{ node.text }}</span>
    </label>

    <!-- group -->
    <div v-else-if="node.type === 'group'" class="space-y-2">
      <div class="font-medium">{{ node.text }}</div>
      <ul class="pl-4 border-l">
        <ChecklistNode
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          :isChecked="isChecked"
          :toggle="toggle"
        />
      </ul>
    </div>
  </li>
</template>

<script setup>
defineProps({
  node: { type: Object, required: true },
  isChecked: { type: Function, required: true },
  toggle: { type: Function, required: true },
})
</script>
