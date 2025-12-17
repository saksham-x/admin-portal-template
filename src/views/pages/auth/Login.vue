<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { VueRecaptcha } from 'vue-recaptcha'
import MultiAuthenicateVerification from './MultiAuthenicateVerification.vue'
import AdminUserLoginService from '@/services/auth/AdminUserLoginService'
import { useAuthStore } from '@/store/auth'
import type { UserCredentials } from '@/types/auth/UserCredentials'
import { VNodeRenderer } from '@/core/components/VNodeRenderer'
import { useSiteSetting, useSiteSettingLoader } from '@/composable/useSiteSetting'
import { appConfig } from '@themeConfig'

// import SiteSettingService from '@/services/site-setting/SiteSettingService'

// const { errors } = useErrors()

// Services
const adminUserLoginService = new AdminUserLoginService()

// const siteSettingService = new SiteSettingService()

// Store
const authStore = useAuthStore()

// Site Settings
const isSiteSettingLoading = useSiteSettingLoader()
const siteSetting = useSiteSetting()

// Refs
const isLoading = ref(false)
const isPasswordVisible = ref(false)
const errorMessage = ref('')
const isMfaEnabled = ref(false)
const isEmailAuthEnabled = ref(false)
const isMultiAuthEnabled = ref(false)
const recaptchaSiteKey = ref('')
const invisibleRecaptchaRef = ref<any>()
const userCredentials = ref<UserCredentials>({} as UserCredentials)

// Validation
const validationRules = {
  email: { required },
  password: { required },
}

const v$ = useVuelidate(validationRules, userCredentials)

// Computed
const logoImage = computed(() => {
  if (siteSetting.value?.logo_path?.original) {
    return h('img', {
      src: siteSetting.value.logo_path.original,
      style: 'display:block; max-width:75px; height:auto;',
    })
  }

  return appConfig.app.logo
})



// Methods
function submitLogin() {
  invisibleRecaptchaRef.value.execute()
}

function performUserLogin() {
  authStore.login(userCredentials.value)
}

async function handleCaptchaVerification(token: string) {
  v$.value.$touch()
  if (v$.value.$error) {
    setTimeout(() => {
      v$.value.$reset()
    }, 3000)
  }
  else {
    isLoading.value = true
    userCredentials.value.token = token

    errorMessage.value = ''

    try {
      const response = await adminUserLoginService.checkVerificationEnabled(
        userCredentials.value,
      )

      // const { data, status } = response
      const { data, status, message, errors } = response as any
      const errorMsg = message || errors || data?.errors || data?.message


      console.log('Status:', status, 'Message:', errorMsg)

      if (status === 'NOT_FOUND' || status === 'NOT_VERIFIED') {
        errorMessage.value = message || 'Invalid credentials provided'

        setTimeout(() => {
          errorMessage.value = ''
        }, 6000)
      }
      else if (data?.is_mfa_enabled && data?.is_email_authentication_enabled) {
        isMfaEnabled.value = true
        isEmailAuthEnabled.value = true
        isMultiAuthEnabled.value = true
      }
      else if (data?.is_mfa_enabled) {
        isMfaEnabled.value = true
        isMultiAuthEnabled.value = false
      }
      else if (data?.is_email_authentication_enabled) {
        isEmailAuthEnabled.value = true
        isMultiAuthEnabled.value = false
      }
      else {
        performUserLogin()
      }
    }
    catch (err: any) {
      errorMessage.value = err?.errors || err?.message || 'An error occurred'
      showError(err)
      setTimeout(() => {
        errorMessage.value = ''
      }, 6000)
    }
    finally {
      isLoading.value = false
    }
  }
}

// Lifecycle Hooks
onBeforeMount(() => {
  recaptchaSiteKey.value = import.meta.env.VITE_SITE_KEY
})
</script>

<template>
  <!-- Login Form with Multi-Factor Authentication Support -->
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <VCard
      v-if="!isMfaEnabled && !isEmailAuthEnabled && !isMultiAuthEnabled"
      class="auth-card pa-sm-4 pa-md-7 pa-0"
      max-width="500"
    >
      <VCardText v-if="!isSiteSettingLoading">
        <div class="d-flex align-center justify-center mb-1">
          <VNodeRenderer :nodes="logoImage" />
          <br>
        </div>
        <div class="d-flex align-center justify-center mb-1">
          <h1 class="auth-title">
            {{ (siteSetting as any).display_name || appConfig.app.title }}
          </h1>
        </div>
        <h4 class="text-h4 mb-1">
          <span class="text-capitalize">{{ siteSetting.tagline || appConfig.app.tagline }}!</span>
        </h4>
      </VCardText>

      <VCardText>
        <VRow>
          <!-- Email field -->
          <VCol cols="12">
            <VTextField
              v-model="userCredentials.email"
              :error="v$.email.$error"
              autofocus
              label="Email"
              type="email"
            />
            <span
              v-if="v$.email.$error"
              class="text-error"
            >This information is required</span>
          </VCol>

          <!-- Password field -->
          <VCol cols="12">
            <VTextField
              v-model="userCredentials.password"
              :error="v$.password.$error"
              label="Password"
              :type="isPasswordVisible ? 'text' : 'password'"
              :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
              @click:append-inner="isPasswordVisible = !isPasswordVisible"
            />
            <span
              v-if="v$.password.$error"
              class="text-error"
            >This information is required</span>

            <VBtn
              class="mt-4"
              block
              :loading="isLoading"
              @click="submitLogin"
            >
              Login
            </VBtn>
          </VCol>

          <!-- Backend error message display -->
          <VCol
            v-if="errorMessage"
            cols="12"
            class="text-center"
          >
            <VAlert
              type="error"
              variant="tonal"
              density="compact"
            >
              {{ errorMessage }}
            </VAlert>
          </VCol>

          <!-- Auth store errors (if any) -->
          <VCol
            v-if="authStore.errors && authStore.errors.length > 0"
            cols="12"
            class="text-center"
          >
            <VAlert
              type="error"
              variant="tonal"
              density="compact"
            >
              {{ authStore.errors[0] }}
            </VAlert>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <MultiAuthenicateVerification
      v-if="isMfaEnabled || isEmailAuthEnabled || isMultiAuthEnabled"
      :site-key="recaptchaSiteKey"
      :email="userCredentials.email"
      :password="userCredentials.password"
      :mfa-authenticator="isMfaEnabled"
      :email-authenticator="isEmailAuthEnabled"
      :multi-authenticator="isMultiAuthEnabled"
      @set-user-login="performUserLogin"
    />

    <VueRecaptcha
      v-if="!isMfaEnabled && !isEmailAuthEnabled && !isMultiAuthEnabled"
      ref="invisibleRecaptchaRef"
      :sitekey="recaptchaSiteKey"
      load-recaptcha-script
      size="invisible"
      @verify="handleCaptchaVerification"
    />
  </div>
</template>

<style lang="scss">
.layout-blank {
  .auth-wrapper {
    min-block-size: 100dvh;
  }

  .auth-footer-mask {
    position: absolute;
    inset-block-end: 0;
    max-inline-size: 100%;
    min-inline-size: 100%;
  }

  .auth-footer-tree {
    position: absolute !important;
    inset-block-end: 70px;
    inset-inline-start: 70px;
  }

  .auth-footer-start-tree,
  .auth-footer-end-tree {
    position: absolute !important;
    z-index: 1 !important;
  }

  .auth-footer-start-tree {
    inset-block-end: 3.75rem;
    inset-inline-start: 3.75rem;
  }

  .auth-footer-end-tree {
    inset-block-end: 4.625rem;
    inset-inline-end: 5rem;
  }

  .auth-card,
  .auth-card-v2,
  .auth-illustration {
    z-index: 1 !important;
  }
}

@media (min-width: 960px) {
  .skin--bordered {
    .auth-card-v2 {
      border-inline-start: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
    }
  }
}
.auth-logo {
  position: absolute;
  z-index: 2;
  inset-block-start: 2rem;
  inset-inline-start: 2.3rem;
}

.auth-title {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.273px;
  line-height: normal;
  text-transform: capitalize;
}
</style>
