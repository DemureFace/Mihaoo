<template>
  <BaseModal :model-value="modelValue" size="md" aria-label="Roadmap access"
    @update:model-value="emit('update:modelValue', $event)">
    <div class="space-y-5">
      <div>
        <h2 class="text-xl font-bold">Share roadmap</h2>
        <p class="mt-2 text-sm text-neutral-600">Only explicitly added users have access. A copied URL does not grant access.</p>
      </div>
      <p v-if="pending" role="status" class="text-sm text-neutral-600">Updating access...</p>
      <div v-if="error" class="space-y-2 rounded-lg border border-red-200 bg-red-50 p-3" role="alert">
        <p class="text-sm text-red-800">{{ error }}</p>
        <BaseButton variant="secondary" :disabled="pending" @click="load">Refresh access list</BaseButton>
      </div>
      <template v-if="members">
        <ul class="m-0 list-none space-y-3 p-0">
          <li v-for="member in members.items" :key="member.user.id"
            class="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 p-3">
            <div class="min-w-0 flex-1 break-words [overflow-wrap:anywhere]">
              <p class="font-medium">{{ member.user.displayName || member.user.email }}</p>
              <p class="text-xs text-neutral-500">{{ member.user.email }}</p>
              <p class="mt-1 text-xs font-semibold">{{ member.role }}</p>
            </div>
            <BaseButton v-if="member.role !== 'OWNER'" variant="secondary" size="sm" :disabled="pending"
              :aria-label="`Revoke access for ${member.user.email}`" @click="confirmUserId = member.user.id">Revoke</BaseButton>
          </li>
        </ul>
        <div v-if="confirmUserId" class="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p class="text-sm">Revoke this user's access? This stops future server access; it cannot erase copies they already downloaded.</p>
          <div class="flex flex-wrap gap-2">
            <BaseButton variant="primary" :disabled="pending" @click="revoke">Confirm revoke</BaseButton>
            <BaseButton variant="secondary" :disabled="pending" @click="confirmUserId = ''">Cancel</BaseButton>
          </div>
        </div>
        <form class="space-y-4 border-t border-black/10 pt-4" @submit.prevent="share">
          <BaseInput id="development-share-email" v-model="email" label="Existing Mihaoo user email"
            type="email" required maxlength="254" :disabled="pending" />
          <BaseSelect id="development-share-role" v-model="role" label="Access level"
            :options="SHARE_ROLES" required :disabled="pending" />
          <p class="text-xs leading-5 text-neutral-500">
            Enter an existing member's email to update their role. Only the owner can manage sharing.
            Contributor permissions apply to workspace fields, not to the plan or access settings.
          </p>
          <BaseButton type="submit" variant="primary" :disabled="pending" :loading="pending">Save access</BaseButton>
        </form>
      </template>
    </div>
  </BaseModal>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseInput from '@/components/base/BaseInput.vue'
  import BaseSelect from '@/components/base/BaseSelect.vue'
  import BaseModal from '@/components/base/BaseModal.vue'
  import { developmentApi } from '@/services/development.service.js'
  import { SHARE_ROLES } from '@/modules/development/development.model.js'
  import { useDevelopmentRequest } from '@/composables/useDevelopmentRequest.js'

  const props = defineProps({ modelValue: { type: Boolean, default: false }, roadmapId: { type: String, required: true } })
  const emit = defineEmits(['update:modelValue', 'changed', 'denied'])
  const { data: members, pending, error, errorStatus, run } = useDevelopmentRequest()
  const email = ref('')
  const role = ref('VIEWER')
  const confirmUserId = ref('')

  async function execute(work) {
    const result = await run(work)
    if ([401, 403, 404].includes(errorStatus.value)) emit('denied')
    return result
  }
  async function load() {
    confirmUserId.value = ''
    await execute((signal) => developmentApi.members(props.roadmapId, { signal }))
  }
  async function share() {
    if (pending.value || !members.value) return
    const input = { email: email.value, role: role.value, expectedAclVersion: members.value.aclVersion }
    const result = await execute((signal) => developmentApi.share(props.roadmapId, input, { signal }))
    if (result) { email.value = ''; confirmUserId.value = ''; emit('changed') }
  }
  async function revoke() {
    if (pending.value || !members.value || !confirmUserId.value) return
    const userId = confirmUserId.value
    const version = members.value.aclVersion
    const result = await execute((signal) => developmentApi.revoke(props.roadmapId, userId, version, { signal }))
    confirmUserId.value = ''
    if (result) emit('changed')
  }
  onMounted(load)
</script>
