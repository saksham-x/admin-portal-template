<script setup lang="ts">
import { SiteSettingView } from '@/types/site-setting/SiteSetting'
import { ref, reactive, computed, watch } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { helpers } from '@vuelidate/validators'
import SiteSettingService from '@/services/site-setting/SiteSettingService'

// type SmtpForm = {
//   mail_driver: string | null
//   mail_host: string | null
//   mail_port: number | string | null
//   mail_user_name: string | null
//   mail_password: string | null
//   mail_encryption: string | nullp
//   mail_sender_name: string | null
//   mail_sender_address: string | null
// }

const props = defineProps<{ value: SiteSettingView | null }>()
const emit = defineEmits<{ (e: 'save', payload: Record<string, any>): void }>()

const isLocked = computed(() => !!props.value?.display_smtp_setting)
const $confirm = useConfirm()

const isSaving = ref(false)
const revealPassword = ref(false)
const isLoading = ref(false)

const form = reactive<SiteSettingView>({
  mail_driver: null,
  mail_host: null,
  mail_port: null,
  mail_user_name: null,
  mail_password: null,
  mail_encryption: null,
  mail_sender_name: null,
  mail_sender_address: null,
})

const formData = reactive({
  email: '',
})

const siteSettingService = new SiteSettingService()

let original: SiteSettingView | null = null

function setFormFromValue(v: SiteSettingView | null) {
  form.mail_driver = v?.mail_driver ?? null
  form.mail_host = v?.mail_host ?? null
  form.mail_port = (v?.mail_port as any) ?? null
  form.mail_user_name = v?.mail_user_name ?? null
  form.mail_password = v?.mail_password ?? null
  form.mail_encryption = v?.mail_encryption ?? null
  form.mail_sender_name = v?.mail_sender_name ?? null
  form.mail_sender_address = v?.mail_sender_address ?? null
  original = JSON.parse(JSON.stringify(form))
}

watch(
  () => props.value,
  (v: any) => setFormFromValue(v ?? null),
  { immediate: true },
)

// -------- Validation (only when unlocked) --------
const rules = computed(() => ({
  mail_driver: { required: helpers.withMessage('Required', (v: any) => isLocked.value || !!v) },
  mail_host: { required: helpers.withMessage('Required', (v: any) => isLocked.value || !!v) },
  mail_port: { 
    required: helpers.withMessage('Required', (v: any) => isLocked.value || v === 0 || v === '0' || !!v),

    // numeric: helpers.withMessage('Must be a number', (v: any) => isLocked.value || v === '' || numeric.$validator(String(v)))
  },
  mail_user_name: { required: helpers.withMessage('Required', (v: any) => isLocked.value || !!v) },
  mail_password: { required: helpers.withMessage('Required', (v: any) => isLocked.value || !!v) },
  mail_encryption: { required: helpers.withMessage('Required', (v: any) => isLocked.value || !!v) },
  mail_sender_name: { required: helpers.withMessage('Required', (v: any) => isLocked.value || !!v) },
  mail_sender_address: { 
    required: helpers.withMessage('Required', (v: any) => isLocked.value || !!v),

    // email: helpers.withMessage('Invalid email', (v: any) => isLocked.value || v === '' || email.$validator(v))
  },
}))

const v$ = useVuelidate(rules, form)

// -------- Actions --------
async function requestChange() {
  const emptyPayload: Record<string, any> = {
    mail_driver: '',
    mail_host: '',
    mail_port: '',
    mail_user_name: '',
    mail_password: '',
    mail_encryption: '',
    mail_sender_name: '',
    mail_sender_address: '',
  }

  try {
    isSaving.value = true
    await emit('save', emptyPayload)
  } finally {
    isSaving.value = false
  }
}

function cancelEdit() {
  if (original) Object.assign(form, original)
  revealPassword.value = false
  v$.value.$reset()
}

async function submit() {
  await v$.value.$validate()
  if (v$.value.$invalid) return

  const payload: Record<string, any> = {
    mail_driver: form.mail_driver ?? '',
    mail_host: form.mail_host ?? '',
    mail_port: form.mail_port === '' ? null : Number(form.mail_port),
    mail_user_name: form.mail_user_name ?? '',
    mail_password: form.mail_password ?? '',
    mail_encryption: form.mail_encryption ?? '',
    mail_sender_name: form.mail_sender_name ?? '',
    mail_sender_address: form.mail_sender_address ?? '',
  }

  try {
    isSaving.value = true
    await emit('save', payload)
  } finally {
    isSaving.value = false
  }
}
async function sendTestMail() {
  if (!formData.email) return

  $confirm?.({
    message: 'Are you sure you want to send a test email?',
    button: { no: 'No', yes: 'Yes' },
    callback: async (ok: boolean) => {
      if (!ok) return
      try {
        isLoading.value = true

        const { status } = await siteSettingService.testSMTP(formData)
        if (status === 'OK') {
          showSuccess('Test email sent successfully')
          formData.email = ''
        }
      } catch (err) {
        showError(err)
      } finally {
        isLoading.value = false
      }
    },
  })
}
</script>

<template>
  <VCard flat>
    <VCardTitle class="text-h6">
      SMTP
    </VCardTitle>
    <VCardText class="pt-2">
      <!-- LOCKED VIEW -->
      <VSheet
        v-if="isLocked"
        class="pa-6 "
        color="surface"
        elevation="1"
      >
        <!-- Top section: Lock info -->
        <div class="d-flex align-center justify-space-between flex-wrap gap-4">
          <div class="d-flex align-center">
            <VAvatar
              size="72"
              color="red-lighten-4"
              variant="flat"
            >
              <VIcon
                icon="ri-lock-password-line"
                size="38"
                color="red-darken-2"
              />
            </VAvatar>

            <div>
              <div class="text-subtitle-1 font-weight-medium mb-1">
                SMTP settings are locked
              </div>
              <div class="text-body-2 text-medium-emphasis">
                SMTP credentials can only be updated after requesting a change.
              </div>
            </div>
          </div>

          <VBtn
            color="orange-darken-1"
            variant="flat"
            prepend-icon="mdi-database-edit"
            :loading="isSaving"
            class="text-none"
            @click="requestChange"
          >
            Request Change
          </VBtn>
        </div>

        <!-- Bottom section: Test upload -->
        <div class="mt-5">
          <VTextField
            v-model="formData.email"
            type="email"
            label="Enter email"
            :disabled="isLoading"
            show-size
            hide-details
            class="flex-grow-1"
          />

          <VBtn
            variant="tonal"
            color="secondary"
            prepend-icon="mdi-flask"
            :loading="isLoading"
            class="mt-4 text-none"
            @click="sendTestMail"
          >
            Test mail
          </VBtn>
        </div>
      </VSheet>

      <!-- EDIT VIEW -->
      <div v-else>
        <div class="d-flex align-center justify-space-between mb-4">
          <div class="d-flex gap-2">
            <VBtn
              variant="text"
              color="secondary"
              @click="cancelEdit"
            >
              Cancel
            </VBtn>
            <VBtn
              color="primary"
              :loading="isSaving"
              :disabled="v$.$invalid"
              @click="submit"
            >
              Save
            </VBtn>
          </div>
        </div>

        <VRow>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="form.mail_driver"
              label="Driver"
              :error-messages="v$.mail_driver.$errors.map((e: any)=>e.$message)"
              placeholder="smtp"
            />
          </VCol>

          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="form.mail_host"
              label="Host"
              :error-messages="v$.mail_host.$errors.map((e: any)=>e.$message)"
              placeholder="smtp.mailprovider.com"
            />
          </VCol>

          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="form.mail_port"
              label="Port"
              type="text"
              inputmode="numeric"
              :error-messages="v$.mail_port.$errors.map((e: any)=>e.$message)"
              placeholder="587"
            />
          </VCol>

          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="form.mail_encryption"
              label="Encryption"
              :error-messages="v$.mail_encryption.$errors.map((e: any)=>e.$message)"
              placeholder="tls or ssl"
            />
          </VCol>

          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="form.mail_user_name"
              label="Username"
              :error-messages="v$.mail_user_name.$errors.map((e: any)=>e.$message)"
              placeholder="no-reply@yourdomain.com"
            />
          </VCol>

          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="form.mail_password"
              :type="revealPassword ? 'text' : 'password'"
              label="Password"
              :append-inner-icon="revealPassword ? 'mdi-eye-off' : 'mdi-eye'"
              :error-messages="v$.mail_password.$errors.map((e: any)=>e.$message)"
              @click:append-inner="revealPassword = !revealPassword"
            />
          </VCol>

          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="form.mail_sender_name"
              label="Sender name"
              :error-messages="v$.mail_sender_name.$errors.map((e: any)=>e.$message)"
              placeholder="DroneGuru"
            />
          </VCol>

          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="form.mail_sender_address"
              label="Sender email"
              :error-messages="v$.mail_sender_address.$errors.map((e: any)=>e.$message)"
              placeholder="no-reply@droneguru.com"
            />
          </VCol>
        </VRow>
      </div>
    </VCardText>
  </VCard>
</template>
