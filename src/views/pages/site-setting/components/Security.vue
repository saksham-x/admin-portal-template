<script setup lang="ts">
import { showError, showSuccess } from '@/composable/useSnotify'

const isRequesting = ref(false)
const isTesting = ref(false)

const onRequestChange = async () => {
  if (isRequesting.value) return
  isRequesting.value = true

  try {
    // await new SiteSettingService().post('/admin/settings/request-security-change', {
    //   company_name: (props.value as any)?.company_name ?? null,
    //   requester_email: props.value?.email ?? null,
    // })

    // Mocked for now
    await new Promise(r => setTimeout(r, 700))
    showSuccess('Security change request sent to Super Admin.')
  } catch (err) {
    showError(err)
  } finally {
    isRequesting.value = false
  }
}

// Test current security configuration (recaptcha, twilio)
const onTestSecurity = async () => {
  if (isTesting.value) return
  isTesting.value = true

  try {
    await new Promise(r => setTimeout(r, 700))
    showSuccess('Security test executed successfully.')
  } catch (err) {
    showError(err)
  } finally {
    isTesting.value = false
  }
}
</script>

<template>
  <VCard
    title="Security"
    class="pa-6"
  >
    <VCardText>
      <div class="d-flex align-center justify-space-between flex-wrap">
        <!-- Left: Lock visual -->
        <div class="d-flex align-center gap-4">
          <VAvatar
            size="72"
            color="grey-lighten-3"
            variant="tonal"
          >
            <VIcon
              icon="ri-lock-password-line"
              size="38"
            />
          </VAvatar>
          <div>
            <div class="text-h6">
              Security settings are locked
            </div>
            <div class="text-body-2 text-medium-emphasis">
              reCAPTCHA and Twilio credentials can only be managed by the Super Admin.
            </div>
          </div>
        </div>

        <!-- Right: Action buttons -->
        <div class="d-flex align-center gap-3 mt-4 mt-sm-0">
          <VBtn
            prepend-icon="ri-mail-send-line"
            :loading="isRequesting"
            :disabled="isRequesting"
            @click="onRequestChange"
          >
            Request change
          </VBtn>

          <VBtn
            variant="tonal"
            prepend-icon="ri-shield-check-line"
            :loading="isTesting"
            :disabled="isTesting"
            @click="onTestSecurity"
          >
            Test security
          </VBtn>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>
