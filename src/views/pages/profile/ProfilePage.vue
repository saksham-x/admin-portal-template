<script setup lang="ts">
import MfaSetupDialog from './components/MfaSetupDialog.vue'
import { ref, onMounted } from 'vue'
import AdminUserService from '@/services/adminUser/AdminUserService'
import ProfileInformationCard from './components/ProfileInformationCard.vue'

const adminUserSvc = new AdminUserService()

const isLoading = ref(false)
const isProfileLoading = ref(false)
const isMfaLoading = ref(false)

const userId = ref<number | null>(null)

const profileData = ref({
  is_mfa_enabled: false,
  is_email_authentication_enabled: false,
})

const formData = ref({
  first_name: '',
  middle_name: '',
  last_name: '',
  email: '',
  phone: '',
  mobile: '',
  address: '',
  password: '',
  password_confirmation: '',
})

const editingFields = ref<Record<string, boolean>>({
  first_name: false,
  middle_name: false,
  last_name: false,
  address: false,
})

const showMfaDialog = ref(false)
const mfaSetupData = ref<{ account: string; secret_key: string; image_url: string } | null>(null)

const loadProfile = async () => {
  isProfileLoading.value = true
  try {
    const response = await adminUserSvc.getProfile()

    userId.value = response.id
    profileData.value = {
      is_mfa_enabled: response.is_mfa_enabled || false,
      is_email_authentication_enabled: response.is_email_authentication_enabled || false,
    }

    formData.value = {
      first_name: response.first_name || '',
      middle_name: response.middle_name || '',
      last_name: response.last_name || '',
      email: response.email || '',
      phone: response.phone || '',
      mobile: response.mobile || '',
      address: response.address || '',
         
    }

    Object.keys(editingFields.value).forEach(key => {
      editingFields.value[key] = false
    })
  } catch (err) {
    showError(err)
  } finally {
    isProfileLoading.value = false
  }
}

const toggleEdit = (field: string) => {
  editingFields.value[field] = !editingFields.value[field]
}

const handleSubmit = async () => {
  if (!userId.value) {
    showError('User ID not found')
    
    return
  }

 

  isLoading.value = true

  try {
    const submitData: any = { ...formData.value }


    await adminUserSvc.update(userId.value, submitData)
    showSuccess('Profile updated successfully')

    Object.keys(editingFields.value).forEach(key => {
      editingFields.value[key] = false
    })

    await loadProfile()
  } catch (err) {
    showError(err)
  } finally {
    isLoading.value = false
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
    const response = await adminUserSvc.activateMfaAuthenticator(
      code,
      mfaSetupData.value.secret_key,
      mfaSetupData.value.image_url,
    )
    
    if (response.status === 'OK') {
      showSuccess('MFA authenticator enabled successfully')
      showMfaDialog.value = false
      await loadProfile()
    } else {
      showError('Failed to activate MFA authenticator')
    }
  } catch (err) {
    showError(err)
  } finally {
    isMfaLoading.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<template>
  <div class="profile-page">
    <VContainer fluid>
      <VRow>
        <VCol cols="12">
          <div class="d-flex align-center mb-6">
            <div class="">
              <h2 class="text-h4 font-weight-bold">
                My profile
              </h2>
              <p class="text-body-2 text-medium-emphasis">
                Manage your profile and security settings
              </p>
            </div>
          </div>

          <VRow class="d-flex flex-column">
            <VCol>
              <ProfileInformationCard
                :form-data="formData"
                :editing-fields="editingFields"
                :is-loading="isLoading"
                @toggle-edit="toggleEdit"
                @submit="handleSubmit"
                @update:form-data="formData = $event"
              />
            </VCol>
          </VRow>
        </VCol>
      </VRow>
    </VContainer>

    <MfaSetupDialog
      v-model:is-open="showMfaDialog"
      :mfa-data="mfaSetupData"
      :is-loading="isMfaLoading"
      @activate="activateMfaAuthenticator"
    />
  </div>
</template>

<style scoped>
.profile-page {
    min-height: 100vh;
    background-color: rgb(var(--v-theme-surface));
}
</style>