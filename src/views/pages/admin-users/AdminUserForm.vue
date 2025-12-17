<script setup lang="ts">
import { nextTick, ref } from 'vue'
import AdminUserService from '@/services/adminUser/AdminUserService'
import type { AdminUser, AdminUserView } from '@/types/adminUser/AdminUser'
import { useVuelidate } from '@vuelidate/core'
import { helpers, required } from '@vuelidate/validators'
import ValidationError from '@/components/ValidationError.vue'

// ========================================
// Props & Emits
// ========================================
interface Props {
  isDrawerOpen: boolean
}

interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()


const { errors } = useErrors()

// ========================================
// Services
// ========================================
const adminUserService = new AdminUserService()

// ========================================
// Refs
// ========================================
const currentAdminUserId = ref<number | null>(null)
const isEditMode = ref(false)
const isSaving = ref(false)
const showPassword = ref(false)

// ========================================
// Reactive Form Data
// ========================================
const adminUserFormData = ref<AdminUser>({
  first_name: null,
  middle_name: null,
  last_name: null,
  mobile: null,
  phone: null,

  // username: null,
  email: null,
  password: '',
  address: null,
  user_type: null,
  is_mfa_enabled: false,
  is_email_authentication_enabled: false,
  mfa_secret_code: null,
  mfa_authentication_image: null,
  is_active: true,
})

// ========================================
// Validation Rules
// ========================================

const nameFormatRule = helpers.withMessage('Only letters and spaces are allowed', (value: string | null) => {
  if (!value) return true

  return /^[a-zA-Z\s]+$/.test(value)
})

const phoneFormatRule = helpers.withMessage('Only numbers and phone characters are allowed', (value: string | null) => {
  if (!value) return true

  return /^[0-9\s\-+()]+$/.test(value)
})

const emailRule = helpers.withMessage('Please enter a valid email', (value: unknown) => {
  if (!value) return true
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

  return re.test(String(value))
})

const requiredRule = helpers.withMessage('This field is required', required)


const passwordRequiredRule = helpers.withMessage(
  'This field is required',
  (value: string) => {
    if (isEditMode.value && !value)
      return true

    return !!value
  },
)

const passwordMinLengthRule = helpers.withMessage(
  'Password must be at least 8 characters',
  (value: string) => {
    if (isEditMode.value && !value)
      return true

    return value.length >= 8
  },
)

const formValidationRules = {
  first_name: { required: requiredRule, nameFormat: nameFormatRule },
  last_name: { required: requiredRule, nameFormat: nameFormatRule },
  email: { required: requiredRule, email: emailRule },
  mobile: { phoneFormat: phoneFormatRule },
  password: { required: passwordRequiredRule, minLength: passwordMinLengthRule },
  user_type: { required: requiredRule },
  is_active: { required: requiredRule },
}

const v$ = useVuelidate(formValidationRules, adminUserFormData)

// ========================================
// Methods
// ========================================

const resetForm = () => {
  isEditMode.value = false
  currentAdminUserId.value = null
  adminUserFormData.value = {
    first_name: null,
    middle_name: null,
    last_name: null,
    mobile: null,
    phone: null,

    // username: null,
    email: null,
    password: '',
    address: null,
    user_type: '',
    is_mfa_enabled: false,
    is_email_authentication_enabled: false,
    mfa_secret_code: null,
    mfa_authentication_image: null,
    is_active: true,
  }
  showPassword.value = false
  nextTick(() => {
    v$.value.$reset()
  })
}

const closeDrawer = () => {
  emit('update:isDrawerOpen', false)
}


const createAdminUser = async () => {
  try {
    isSaving.value = true

    const payload: AdminUser = {
      ...adminUserFormData.value,
    }

    await adminUserService.store(payload)

    isSaving.value = false
    showSuccess('Admin user created successfully')
    emit('refresh')
    closeDrawer()
  }
  catch (err: any) {
    isSaving.value = false
    showError(err)
  }
}

const updateAdminUser = async () => {
  if (currentAdminUserId.value == null)
    return

  try {
    isSaving.value = true

    const payload: AdminUser = {
      ...adminUserFormData.value,
    }

    if (!payload.password) {
      delete payload.password
    }

    await adminUserService.update(currentAdminUserId.value, payload)

    isSaving.value = false
    showSuccess('Admin user updated successfully')
    emit('refresh')
    closeDrawer()
  }
  catch (err: any) {
    isSaving.value = false
    showError(err)
  }
}

const handleSubmitAdminUser = () => {
  v$.value.$touch()

  if (v$.value.$error) {
    setTimeout(() => v$.value.$reset(), 3000)
    
    return
  }
  else {
    if (isEditMode.value) {
      updateAdminUser()
    }
    else {
      createAdminUser()
    }
  }
 
}

const handleDrawerModelValueUpdate = (val: boolean) => {
  emit('update:isDrawerOpen', val)
}

const editAdminUserData = (val: AdminUserView) => {



  currentAdminUserId.value = val.id
  isEditMode.value = true

  adminUserFormData.value = {
    first_name: val.first_name,
    middle_name: val.middle_name,
    last_name: val.last_name,
    mobile: val.mobile,
    phone: val.phone,

    // username: val.username,
    email: val.email,
    password: '',
    address: val.address,
    user_type: val.user_type,
    is_mfa_enabled: val.is_mfa_enabled,
    is_email_authentication_enabled: val.is_email_authentication_enabled,
    mfa_secret_code: null,
    mfa_authentication_image: null,
    is_active: val.is_active,
  }


  

  // Reset validation
  v$.value.$reset()

  // Open drawer LAST
  emit('update:isDrawerOpen', true)
}


// ========================================
// Expose
// ========================================
defineExpose({
  edit: editAdminUserData,
})


watch(
  () => props.isDrawerOpen,
  (isOpen: boolean) => {

    if (!isOpen && !isSaving.value) {
      setTimeout(() => {
        resetForm()
      }, 300)
    }
  },
)
</script>

<template>
  <!-- Admin User Form Component -->
  <VNavigationDrawer
    temporary
    :width="450"
    location="end"
    :model-value="props.isDrawerOpen"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <DrawerHeaderSection
      :title="isEditMode ? 'Edit admin user' : 'Add admin user'"
      @cancel="closeDrawer"
    />

    <VDivider />

    <VCard flat>
      <VCardText>
        <VRow>
          <VCol cols="12">
            <VTextField
              v-model="adminUserFormData.first_name"
              label="First name"
              placeholder="Enter first name"
              :error-messages="v$.first_name.$errors.map((e: any) => e.$message)"
              @blur="v$.first_name.$touch"
            >
              <template #label>
                <span>First name </span><span class="text-red">*</span>
              </template>
            </VTextField>
          </VCol>

          <VCol cols="12">
            <VTextField
              v-model="adminUserFormData.middle_name"
              label="Middle name"
              placeholder="Enter middle name"
            />
          </VCol>

          <VCol cols="12">
            <VTextField
              v-model="adminUserFormData.last_name"
              label="Last name"
              placeholder="Enter last name"
              :error-messages="v$.last_name.$errors.map((e: any) => e.$message)"
              @blur="v$.last_name.$touch"
            >
              <template #label>
                <span>Last name </span><span class="text-red">*</span>
              </template>
            </VTextField>
          </VCol>

          <VCol cols="12">
            <VTextField
              v-model="adminUserFormData.email"
              label="Email"
              placeholder="Enter email"
              type="email"
              :error-messages="v$.email.$errors.map((e: any) => e.$message)"
              @blur="v$.email.$touch"
            >
              <template #label>
                <span>Email </span><span class="text-red">*</span>
              </template>
            </VTextField>
            <ValidationError
              :errors="errors"
              field="email"
              class="text-red"
            />
          </VCol>

          <!--
            <VCol cols="12">
            <VTextField
            v-model="adminUserFormData.username"
            label="Username"
            placeholder="Enter username"
            />
            </VCol> 
          -->

          <VCol cols="12">
            <VTextField
              v-if="!isEditMode"
              v-model="adminUserFormData.password"
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="showPassword ? 'ri-eye-off-line' : 'ri-eye-line'"
              :placeholder="isEditMode ? 'Leave empty to keep current password' : 'Enter password'"
              :error-messages="v$.password.$errors.map((e: any) => e.$message)"
              @click:append-inner="showPassword = !showPassword"
              @blur="v$.password.$touch"
            >
              <template #label>
                <span>Password</span>
                <span
                  v-if="!isEditMode"
                  class="text-red"
                >*</span>
              </template>
            </VTextField>
          </VCol>

          <VCol cols="12">
            <VTextField
              v-model="adminUserFormData.mobile"
              label="Mobile"
              placeholder="Enter mobile number"
              :error-messages="v$.mobile.$errors.map((e: any) => e.$message)"
              @blur="v$.mobile.$touch"
            />
          </VCol>

          <VCol cols="12">
            <VTextField
              v-model="adminUserFormData.phone"
              label="Phone"
              placeholder="Enter phone number"
            />
          </VCol>

          <VCol cols="12">
            <VTextarea
              v-model="adminUserFormData.address"
              label="Address"
              placeholder="Enter address"
              rows="3"
            />
          </VCol>

          <VCol cols="12">
            <VTextField
              v-model="adminUserFormData.user_type"
              label="User type"
              placeholder="Enter user type"
              type="text"
              :error-messages="v$.user_type.$errors.map((e: any) => e.$message)"
              @blur="v$.user_type.$touch"
            >
              <template #label>
                <span>User type </span><span class="text-red">*</span>
              </template>
            </VTextField>
            <ValidationError
              :errors="errors"
              field="user_type"
              class="text-red"
            />
          </VCol>

          <VCol cols="12">
            <VSwitch
              v-model="adminUserFormData.is_active"
              :label="adminUserFormData.is_active ? 'Active' : 'Inactive'"
            />
          </VCol>

          <!--
            <VCol cols="12">
            <VSwitch v-model="adminUserFormData.is_mfa_enabled"
            :label="adminUserFormData.is_mfa_enabled ? 'MFA enabled' : 'MFA disabled'" />
            </VCol> 
          -->

          <!--
            <VCol cols="12">
            <VSwitch v-model="adminUserFormData.is_email_authentication_enabled"
            :label="adminUserFormData.is_email_authentication_enabled ? 'Email authentication enabled' : 'Email authentication disabled'" />
            </VCol> 
          -->
        </VRow>
      </VCardText>

      <VCardActions>
        <VSpacer />

        <VBtn
          variant="text"
          color="error"
          @click="closeDrawer"
        >
          Cancel
        </VBtn>

        <VBtn
          :loading="isSaving"
          class="me-4"
          color="secondary"
          variant="outlined"
          @click="handleSubmitAdminUser"
        >
          {{ isEditMode ? 'Update' : 'Save' }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VNavigationDrawer>
</template>