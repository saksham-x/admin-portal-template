<script setup lang="ts">
import { ref } from 'vue'

interface Emits {
    (e: 'changePassword', data: { password: string; password_confirmation: string }): void
}

const emit = defineEmits<Emits>()

const showPassword = ref(false)
const showPasswordConfirmation = ref(false)
const showPasswordSection = ref(false)

const passwordData = ref({
  password: '',
  password_confirmation: '',
})

const togglePasswordSection = () => {
  showPasswordSection.value = !showPasswordSection.value
  if (!showPasswordSection.value) {
    passwordData.value.password = ''
    passwordData.value.password_confirmation = ''
  }
}

const handleChangePassword = () => {
  if (!passwordData.value.password || !passwordData.value.password_confirmation) {
    showError('Please fill in both password fields')
    
    return
  }

  if (passwordData.value.password !== passwordData.value.password_confirmation) {
    showError('Passwords do not match')
    
    return
  }

  emit('changePassword', passwordData.value)

  passwordData.value.password = ''
  passwordData.value.password_confirmation = ''
  showPasswordSection.value = false
}
</script>

<template>
  <VCard>
    <VCardTitle class="d-flex align-center gap-2 pa-4">
      <VIcon icon="ri-lock-password-line" />
      <span>Change password</span>
    </VCardTitle>

    <VDivider />

    <VCardText class="pa-4">
      <div class="mb-4">
        <VBtn
          :color="showPasswordSection ? 'primary' : 'default'"
          variant="tonal"
          block
          @click="togglePasswordSection"
        >
          <VIcon
            start
            :icon="showPasswordSection ? 'ri-lock-unlock-line' : 'ri-lock-line'"
          />
          {{ showPasswordSection ? 'Hide password fields' : 'Change password' }}
        </VBtn>

        <!-- Password Fields -->
        <VExpandTransition>
          <div
            v-show="showPasswordSection"
            class="mt-4"
          >
            <!-- New Password -->
            <VTextField
              v-model="passwordData.password"
              label="New password"
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="showPassword ? 'ri-eye-off-line' : 'ri-eye-line'"
              class="mb-4"
              @click:append-inner="showPassword = !showPassword"
            />

            <!-- Confirm Password -->
            <VTextField
              v-model="passwordData.password_confirmation"
              label="Confirm  new password"
              :type="showPasswordConfirmation ? 'text' : 'password'"
              :append-inner-icon="showPasswordConfirmation ? 'ri-eye-off-line' : 'ri-eye-line'"
              class="mb-4"
              @click:append-inner="showPasswordConfirmation = !showPasswordConfirmation"
            />

            <!-- Change Password Button -->
            <VBtn
              color="primary"
              block
              @click="handleChangePassword"
            >
              Update password
            </VBtn>
          </div>
        </VExpandTransition>
      </div>
    </VCardText>
  </VCard>
</template>