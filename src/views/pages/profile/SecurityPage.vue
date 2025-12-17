<script setup lang="ts">
import MfaSetupDialog from './components/MfaSetupDialog.vue'
import { ref, onMounted } from 'vue'
import AdminUserService from '@/services/adminUser/AdminUserService'
import SecuritySettingsCard from './components/SecuritySettingsCard.vue'
import ChangePasswordCard from './components/ChangePasswordCard.vue'

const adminUserSvc = new AdminUserService()

const isMfaLoading = ref(false)

const profileData = ref({
  is_mfa_enabled: false,
  is_email_authentication_enabled: false,
})

const formData = ref({
  first_name: '',
  last_name: '',
  email: '',
  mobile: '',
  address: '',
})

const userData = useCookie<any>('userData')
const userId = ref<number | null>(null)
const showMfaDialog = ref(false)
const mfaSetupData = ref<{ account: string; secret_key: string; image_url: string } | null>(null)
const isPasswordLoading = ref(false)

const toggleEmailAuthenticator = async () => {
  isMfaLoading.value = true
  try {
    if (profileData.value.is_email_authentication_enabled) {
      const response = await adminUserSvc.deactivateEmailAuthenticator()

      showSuccess('Email authentication disabled')
      profileData.value.is_email_authentication_enabled = response.is_email_authentication_enabled || false

      if (userData.value) {
        let parsedUserData = typeof userData.value === 'string' ? JSON.parse(userData.value) : userData.value
        parsedUserData.is_email_authentication_enabled = response.is_email_authentication_enabled || false
        userData.value = JSON.stringify(parsedUserData)
      }
    } else {
      const response = await adminUserSvc.activateEmailAuthenticator()

      showSuccess('Email authentication enabled')
      profileData.value.is_email_authentication_enabled = response.is_email_authentication_enabled || false

      if (userData.value) {
        let parsedUserData = typeof userData.value === 'string' ? JSON.parse(userData.value) : userData.value
        parsedUserData.is_email_authentication_enabled = response.is_email_authentication_enabled || false
        userData.value = JSON.stringify(parsedUserData)
      }
    }
  } catch (err) {
    showError(err)
  } finally {
    isMfaLoading.value = false
  }
}

const activateMfaAuthenticator = async (code: string) => {
  if (!code || code.length !== 6) {
    showError('Please enter a valid 6-digit code')

    return
  }

  if (!mfaSetupData.value) {
    showError('MFA setup data not found')

    return
  }

  isMfaLoading.value = true
  try {
    const response = await adminUserSvc.activateMfaAuthenticator({
      verification_code: code,
      secret_key: mfaSetupData.value.secret_key,
      image_url: mfaSetupData.value.image_url,
    })
    

    if (response.status === 'OK') {
      showSuccess('MFA authenticator enabled successfully')
      showMfaDialog.value = false
      profileData.value.is_mfa_enabled = true

      if (userData.value) {
        let parsedUserData = typeof userData.value === 'string' ? JSON.parse(userData.value) : userData.value
        parsedUserData.is_mfa_enabled = true
        userData.value = JSON.stringify(parsedUserData)
      }
    } else {
      showError('Failed to activate MFA authenticator')
    }
  } catch (err) {
    showError(err)
  } finally {
    isMfaLoading.value = false
  }
}


const deactivateMfaAuthenticator = async () => {
  isMfaLoading.value = true
  try {
    const response = await adminUserSvc.deactivateMfaAuthenticator()

    if (response.status === 'OK') {
      showSuccess('MFA authenticator disabled')
      profileData.value.is_mfa_enabled = false

      if (userData.value) {
        let parsedUserData = typeof userData.value === 'string' ? JSON.parse(userData.value) : userData.value
        parsedUserData.is_mfa_enabled = false
        userData.value = JSON.stringify(parsedUserData)
      }
    } else {
      showError('Failed to disable MFA authenticator')
    }
  } catch (err) {
    showError(err)
  } finally {
    isMfaLoading.value = false
  }
}

const openMfaSetup = async () => {
  try {
    const response = await adminUserSvc.getMfaAuthenticator()

    mfaSetupData.value = response
    showMfaDialog.value = true
  } catch (err) {
    showError(err)
  }
}

onMounted(() => {
  let parsedUserData = userData.value
  if (typeof userData.value === 'string') {
    parsedUserData = JSON.parse(userData.value)
  }

  if (parsedUserData) {
    userId.value = parsedUserData.id

    formData.value = {
      first_name: parsedUserData.first_name || '',
      last_name: parsedUserData.last_name || '',
      email: parsedUserData.email || '',
      mobile: parsedUserData.mobile || '',
      address: parsedUserData.address || '',
    }

    profileData.value = {
      is_mfa_enabled: parsedUserData.is_mfa_enabled || false,
      is_email_authentication_enabled: parsedUserData.is_email_authentication_enabled || false,
    }
  }
})

const handleChangePassword = async (passwordData: { password: string; password_confirmation: string }) => {
  if (!userId.value) {
    showError('User ID not found')

    return
  }

  isPasswordLoading.value = true

  try {
    // Combine existing user data with password
    const updateData = {
      ...formData.value,
      password: passwordData.password,
      password_confirmation: passwordData.password_confirmation,
    }

    await adminUserSvc.update(userId.value, updateData as any)

    showSuccess('Password updated successfully')
  } catch (err) {
    showError(err)
  } finally {
    isPasswordLoading.value = false
  }
}
</script>

<template>
  <div class="security-page">
    <VContainer fluid>
      <VRow>
        <VCol cols="12">
          <!-- Page Header -->
          <div class="d-flex align-center mb-6">
            <div class="">
              <h2 class="text-h5 font-weight-bold">
                Security settings
              </h2>
              <p class="text-body-2 text-medium-emphasis">
                Manage your authentication and security preferences
              </p>
            </div>
          </div>

          <VRow>
            <VCol
              cols="12"
              md="8"
              class="mx-auto"
            >
              <SecuritySettingsCard
                :is-email-auth-enabled="profileData.is_email_authentication_enabled"
                :is-mfa-enabled="profileData.is_mfa_enabled"
                :is-loading="isMfaLoading"
                @toggle-email-auth="toggleEmailAuthenticator"
                @open-mfa-setup="openMfaSetup"
                @deactivate-mfa="deactivateMfaAuthenticator"
              />

              <ChangePasswordCard
                class="mt-4"
                @change-password="handleChangePassword"
              />
            </VCol>
          </VRow>
        </VCol>
      </VRow>
    </VContainer>

    <!-- MFA Setup Dialog -->
    <MfaSetupDialog
      v-model:is-open="showMfaDialog"
      :mfa-data="mfaSetupData"
      :is-loading="isMfaLoading"
      @activate="activateMfaAuthenticator"
    />
  </div>
</template>

<style scoped>
.security-page {
  min-height: 100vh;
  background-color: rgb(var(--v-theme-surface));
}
</style>