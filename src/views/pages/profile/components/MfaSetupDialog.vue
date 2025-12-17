<script setup lang="ts">
interface Props {
  isOpen: boolean
  mfaData: {
    account: string
    secret_key: string
    image_url: string
  } | null
  isLoading: boolean
}

interface Emits {
  (e: 'update:isOpen', value: boolean): void
  (e: 'activate', code: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const isImageLoading = ref(false)
const mfaCode = ref('')

const handleClose = () => {
  mfaCode.value = ''
  emit('update:isOpen', false)
}

const handleActivate = () => {
  emit('activate', mfaCode.value)
  mfaCode.value = ''
}

watch(() => props.isOpen, (newVal: any) => {
  if (newVal) {
    mfaCode.value = ''
  }
})
watch(() => props.mfaData?.image_url, (newUrl: any) => {
  if (newUrl) {
    isImageLoading.value = true
    setTimeout(() => {
      isImageLoading.value = false
    }, 900)
  }
})
</script>

<template>
  <VDialog
    :model-value="isOpen"
    max-width="500"
    persistent
    @update:model-value="emit('update:isOpen', $event)"
  >
    <VCard>
      <VCardTitle class="d-flex align-center gap-2 pa-4">
        <VIcon icon="ri-qr-code-line" />
        <span>Set up authenticator</span>
        <VSpacer />
        <VBtn
          icon="ri-close-line"
          variant="text"
          size="small"
          @click="handleClose"
        />
      </VCardTitle>

      <VDivider />

      <VCardText class="pa-6">
        <div
          v-if="mfaData"
          class="text-center"
        >
          <!-- QR Code -->
          <div class="mb-4">
            <div
              v-if="isImageLoading"
              class="d-flex justify-center align-center"
              style="height: 250px;"
            >
              <VProgressCircular
                indeterminate
                color="primary"
                size="64"
              />
            </div>
            <VImg
              v-else
              :src="mfaData.image_url"
              max-width="250"
              class="mx-auto"
            />
          </div>

          <!-- Instructions -->
          <VAlert
            type="info"
            variant="tonal"
            class="mb-4 text-left"
          >
            <div class="text-body-2">
              <strong>Steps:</strong>
              <ol class="mt-2 ">
                <li>Download google authenticator or authy</li>
                <li>Scan the QR code above</li>
                <li>Enter the 6-digit code below</li>
              </ol>
            </div>
          </VAlert>

          <!-- Secret Key -->
          <div class="mb-4">
            <div class="text-caption text-medium-emphasis mb-1">
              Or enter this key manually:
            </div>
            <VTextField
              :model-value="mfaData.secret_key"
              readonly
              density="compact"
              variant="outlined"
              hide-details
            >
              <template #append-inner>
                <VBtn
                  icon="ri-file-copy-line"
                  variant="text"
                  size="small"
                  @click="() => navigator.clipboard.writeText(mfaData?.secret_key || '')"
                />
              </template>
            </VTextField>
          </div>

          <!-- Code Input -->
          <VTextField
            v-model="mfaCode"
            label="Enter 6-digit code"
            placeholder="000000"
            type="text"
            maxlength="6"
            variant="outlined"
            hide-details
            class="mb-4"
          />

          <!-- Activate Button -->
          <VBtn
            color="primary"
            block
            :loading="isLoading"
            :disabled="mfaCode.length !== 6"
            @click="handleActivate"
          >
            Activate authenticator
          </VBtn>
        </div>
      </VCardText>
    </VCard>
  </VDialog>
</template>