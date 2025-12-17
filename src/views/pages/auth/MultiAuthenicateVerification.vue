<script setup lang="ts">
import { VueRecaptcha } from 'vue-recaptcha'
import { useVuelidate } from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { appConfig } from '@themeConfig'
import { useAuthStore } from '@/store/auth'
import AdminUserLoginService from '@/services/auth/AdminUserLoginService'
import type { UserVerificationCredentials } from '@/types/auth/UserCredentials'
import { VNodeRenderer } from '@/core/components/VNodeRenderer'

// Props Interface
interface Props {
  email: string
  password: string
  siteKey: string
  mfaAuthenticator?: boolean
  emailAuthenticator?: boolean
  multiAuthenticator?: boolean
}

const props = defineProps<Props>()

definePage({
  meta: {
    layout: 'blank',
  },
})


// Services
const adminUserLoginService = new AdminUserLoginService()

// Store
const authStore = useAuthStore()

// Refs
const recaptchaRef = ref()
const otpInputRef = ref()
const isSubmittingOtp = ref(false)
const isEmailVerificationRequested = ref(false)

// Injected
const confirmDialog: any = inject('vue3-confirm-dialog-box')

// Reactive Form
const verificationCredentials = ref<UserVerificationCredentials>({
  email: props.email,
  password: props.password,
  verification_code: '',
  token: '',
})

// Validation
const validationRules = {
  email: { required },
  verification_code: { required },
}

const v$ = useVuelidate(validationRules, verificationCredentials)

// Utility Functions
function maskSensitiveInfo(email: string): string {
  if (email.includes('@')) {
    // Mask Email
    const [local = '', domain = ''] = email.split('@')
    if (!local || !domain)
      return '*'.repeat(email.length)
    if (local.length <= 2)
      return `${'*'.repeat(local.length)}@${domain}`
    const first = local.slice(0, 2)
    const last = local.slice(-1)
    const masked = '*'.repeat(local.length - 3)

    return `${first}${masked}${last}@${domain}`
  }
  else {
    // Mask Mobile (Assuming 10 digits, e.g., 9876543210 -> 98****3210)
    const digitsOnly = email.replace(/\D/g, '')
    if (digitsOnly.length < 6)
      return '*'.repeat(digitsOnly.length)
    const first = digitsOnly.slice(0, 2)
    const last = digitsOnly.slice(-4)
    const masked = '*'.repeat(digitsOnly.length - 6)

    return `${first}${masked}${last}`
  }
}

// Methods
function performUserLogin() {
  authStore.login(verificationCredentials.value)
}

function requestEmailVerification() {
  confirmDialog({
    message: 'Are you sure you want to request email verification ?',
    button: {
      no: 'No',
      yes: 'Yes',
    },
    callback: async (btn: boolean) => {
      if (btn) {
        try {
          isEmailVerificationRequested.value = true

          const { status, message } = await adminUserLoginService.requestEmailVerificationCode(verificationCredentials.value)
          if (status === 'OK')
            showSuccess('Email verification requested successfully')
          else if (status === 'ERROR')

          

            showErrorMsg("Email verification request failed: " + message)
        }
        catch (err) {
          showError(err)
          isEmailVerificationRequested.value = false
        }
        finally {
          setTimeout(() => {
            isEmailVerificationRequested.value = false
          }, 60000)
        }
      }
    },
  })
}

function submitVerification() {
  recaptchaRef.value.execute()
}


async function handleCaptchaVerification(token: string) {
  v$.value.$touch()
  if (v$.value.$error) {
    setTimeout(() => {
      v$.value.$reset()
    }, 3000)
  }
  else {
    verificationCredentials.value.token = token
    isSubmittingOtp.value = true
    
    try {
      const response = await adminUserLoginService.verifyEmailVerificationCode(verificationCredentials.value) as any
      
      if (response.status === 'OK') {
        performUserLogin()
      }
      else {
        const errorMessage = response.errors || 'Verification failed. Please try again.'

        showErrorMsg(errorMessage)
        
        verificationCredentials.value.verification_code = ''
        
        nextTick(() => {
          const input = otpInputRef.value.$el.querySelector('input')
          if (input) input.focus()
        })
      }
    }
    catch (err) {
      showError(err)
      verificationCredentials.value.verification_code = ''
    }
    finally {
      isSubmittingOtp.value = false
    }
  }
}

// Lifecycle Hooks
onMounted(() => {
  nextTick(() => {
    const input = otpInputRef.value.$el.querySelector('input')
    if (input) {
      input.focus()

      input.selectionStart = input.selectionEnd = input.value.length
    }
  })
})
</script>

<template>
  <!-- Multi-Factor Authentication Verification Form -->
  <section>
    <VCard
      class="auth-card pa-sm-4 pa-md-7 pa-0"
      max-width="460"
    >
      <VCardText>
        <div class="d-flex align-center gap-x-3 justify-center mb-6">
          <VNodeRenderer :nodes="appConfig.app.logo" />

          <h1 class="auth-title">
            {{ appConfig.app.title }}
          </h1>
        </div>
      </VCardText>

      <VCardText>
        <VRow>
          <!-- Heading and instructions -->
          <VCol cols="12">
            <h4 class="text-h4 mb-1">
              Multi-Factor Authentication
            </h4>
            <p class="mb-3">
              A 6-digit verification code was sent to your registered email. Please enter it below to continue.
            </p>
            <h5> {{ maskSensitiveInfo(props.email) }}</h5>
          </VCol>

          <!-- OTP input -->
          <VCol cols="12">
            <div class="mb-2">
              Enter your 6-digit security code
            </div>
            <VOtpInput
              ref="otpInputRef"
              v-model="verificationCredentials.verification_code"
              :error="v$.verification_code.$error"
              length="6"
              :disabled="isSubmittingOtp"
              class="pa-0"
              variant="solo-filled"
              focus-all
              @finish="submitVerification"
            />
          </VCol>

          <!-- Verify button -->
          <VCol cols="12">
            <VBtn
              block
              :loading="isSubmittingOtp"
              :disabled="isSubmittingOtp"
              type="submit"
              @click="submitVerification"
            >
              Verify My Account
            </VBtn>
          </VCol>

          <!-- Alternative login option -->
          <VCol
            v-if="props.multiAuthenticator && !isEmailVerificationRequested"
            cols="12"
          >
            <div class="d-flex justify-center align-center flex-wrap">
              <span class="me-1">Prefer another method?</span>
              <VBtn
                variant="flat"
                color="primary"
                :loading="isEmailVerificationRequested"
                @click="requestEmailVerification"
              >
                Request Email Code
              </VBtn>
            </div>
          </VCol>

          <!-- Email code wait notice -->
          <VCol
            v-if="props.multiAuthenticator && isEmailVerificationRequested"
            cols="12"
          >
            <div class="text-center">
              Didn't receive a verification code? You can request a new one after a minute.
            </div>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
    <VueRecaptcha
      v-if="props.mfaAuthenticator || props.emailAuthenticator || props.multiAuthenticator"
      ref="recaptchaRef"
      :sitekey="props.siteKey"
      load-recaptcha-script
      size="invisible"
      @verify="handleCaptchaVerification"
    />
  </section>
</template>
