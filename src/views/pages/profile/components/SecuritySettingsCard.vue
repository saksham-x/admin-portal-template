<script setup lang="ts">
interface Emits {
  (e: 'toggleEmailAuth'): void
  (e: 'openMfaSetup'): void
  (e: 'deactivateMfa'): void
}

interface Props {
  isEmailAuthEnabled: boolean
  isMfaEnabled: boolean
  isLoading: boolean
}
defineProps<Props>()

const emit = defineEmits<Emits>()
</script>

<template>
  <VCard>
    <VCardTitle class="d-flex align-center gap-2 pa-4">
      <VIcon icon="ri-shield-line" />
      <span>Security settings</span>
    </VCardTitle>

    <VDivider />

    <VCardText class="pa-4">
      <!-- Email Authentication -->
      <div class="mb-6">
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="d-flex align-center gap-2">
            <VIcon
              icon="ri-mail-line"
              size="24"
            />
            <div>
              <div class="text-body-1 font-weight-medium">
                Email authentication
              </div>
              <div class="text-caption text-medium-emphasis">
                Receive verification codes via email
              </div>
            </div>
          </div>
          <VChip
            :color="isEmailAuthEnabled ? 'success' : 'default'"
            size="small"
          >
            {{ isEmailAuthEnabled ? 'Active' : 'Inactive' }}
          </VChip>
        </div>

        <VSwitch
          :model-value="isEmailAuthEnabled"
          :loading="isLoading"
          color="primary"
          hide-details
          @update:model-value="emit('toggleEmailAuth')"
        >
          <template #label>
            <span class="text-body-2">
              {{ isEmailAuthEnabled ? 'Enabled' : 'Enable email authentication' }}
            </span>
          </template>
        </VSwitch>
      </div>

      <VDivider class="my-4" />

      <!-- MFA Authenticator -->
      <div>
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="d-flex align-center gap-2">
            <VIcon
              icon="ri-smartphone-line"
              size="24"
            />
            <div>
              <div class="text-body-1 font-weight-medium">
                Authenticator app
              </div>
              <div class="text-caption text-medium-emphasis">
                Use google authenticator or similar app
              </div>
            </div>
          </div>
          <VChip
            :color="isMfaEnabled ? 'success' : 'default'"
            size="small"
          >
            {{ isMfaEnabled ? 'Active' : 'Inactive' }}
          </VChip>
        </div>

        <VBtn
          v-if="!isMfaEnabled"
          color="primary"
          variant="tonal"
          block
          :loading="isLoading"
          @click="emit('openMfaSetup')"
        >
          <VIcon
            start
            icon="ri-qr-code-line"
          />
          Set up authenticator
        </VBtn>

        <VBtn
          v-else
          color="error"
          variant="tonal"
          block
          :loading="isLoading"
          @click="emit('deactivateMfa')"
        >
          <VIcon
            start
            icon="ri-close-circle-line"
          />
          Disable authenticator
        </VBtn>
      </div>

      <!-- Info Alert -->
      <!--
        <VAlert
        type="info"
        variant="tonal"
        class="mt-6"
        >
        <template #prepend>
        <VIcon icon="ri-information-line" />
        </template>
        <div class="text-caption">
        Two-factor authentication adds an extra layer of security to your account.
        </div>
        </VAlert> 
      -->
    </VCardText>
  </VCard>
</template>