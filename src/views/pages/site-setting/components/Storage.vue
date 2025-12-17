<script setup lang="ts">
import { helpers } from '@vuelidate/validators'
import { SiteSettingView } from '@/types/site-setting/SiteSetting'
import { ref, reactive, computed, watch } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import SiteSettingService from '@/services/site-setting/SiteSettingService'

const props = defineProps<{ value: SiteSettingView | null }>()
const emit = defineEmits<{ (e: 'save', payload: Record<string, any>): void }>()

// Locked when API flag is true
const isLocked = computed(() => !!props.value?.display_storage)

const isSaving = ref(false)

const isUploading = ref(false)

const uploadTestFileUrl = ref('')
 
const testFile = reactive({
  file: [] as File | [],
})

const siteSettingService = new SiteSettingService()

const form = reactive<SiteSettingView>({
  storage_type: 'local',          // 'local' | 's3' | 'wasabi' | null
  storage_endpoint: null,
  storage_access_key: null,
  storage_secret_key: null,
  storage_region: null,
  storage_bucket_name: null,
  storage_url: null,
})

let original: SiteSettingView | null = null

function setFormFromValue(v: SiteSettingView | null) {
  form.storage_type = (v?.storage_type) ?? null
  form.storage_endpoint = v?.storage_endpoint ?? null
  form.storage_access_key = v?.storage_access_key ?? null
  form.storage_secret_key = v?.storage_secret_key ?? null
  form.storage_region = v?.storage_region ?? null
  form.storage_bucket_name = v?.storage_bucket_name ?? null
  form.storage_url = v?.storage_url ?? null
  original = JSON.parse(JSON.stringify(form))
}

watch(() => props.value, (v: any) => setFormFromValue(v ?? null), { immediate: true })

// ===== Validation (only when unlocked; dynamic for S3/Wasabi) =====
const isS3Like = computed(() => form.storage_type === 's3' || form.storage_type === 'wasabi')

const reqIf = (cond: () => boolean) =>
  helpers.withMessage('Required', (v: any) => isLocked.value || !cond() ? true : !!v)

const rules = computed(() => ({
  storage_type: { required: reqIf(() => true) },
  storage_url: {}, // optional CDN/public base URL
  storage_endpoint: {}, // optional, often needed for Wasabi/custom S3
  storage_access_key: { required: reqIf(() => isS3Like.value) },
  storage_secret_key: { required: reqIf(() => isS3Like.value) },
  storage_region: { required: reqIf(() => isS3Like.value) },
  storage_bucket_name: { required: reqIf(() => isS3Like.value) },
}))

const v$ = useVuelidate(rules, form)

// ===== Actions =====
async function requestChange() {
  const emptyPayload: Record<string, any> = {
    storage_type: 'local',
    storage_endpoint: '',
    storage_access_key: '',
    storage_secret_key: '',
    storage_region: '',
    storage_bucket_name: '',
    storage_url: '',
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
  v$.value.$reset()
}

async function submit() {
  await v$.value.$validate()
  if (v$.value.$invalid) return

  const payload: Record<string, any> = {
    storage_type: form.storage_type ?? null,
    storage_url: form.storage_url ?? '',
  }

  if (isS3Like.value) {
    payload.storage_endpoint = form.storage_endpoint ?? ''
    payload.storage_access_key = form.storage_access_key ?? ''
    payload.storage_secret_key = form.storage_secret_key ?? ''
    payload.storage_region = form.storage_region ?? ''
    payload.storage_bucket_name = form.storage_bucket_name ?? ''
  } else {
    payload.storage_endpoint = ''
    payload.storage_access_key = ''
    payload.storage_secret_key = ''
    payload.storage_region = ''
    payload.storage_bucket_name = ''
  }

  try {
    isSaving.value = true
    await emit('save', payload)
  } finally {
    isSaving.value = false
  }
}

const uploadTestFile = async () => {
  if (!testFile.file || (Array.isArray(testFile.file) && testFile.file.length === 0)) {
    alert('Please select a file to upload for testing.')
    
    return
  }

  const fileToUpload = Array.isArray(testFile.file) ? testFile.file[0] : testFile.file

  const formData = new FormData()

  formData.append('file', fileToUpload)

  try {
    isUploading.value = true

    const { status, url } = await siteSettingService.uploadStorageTestFile(formData)
    if (status === "OK") {
      uploadTestFileUrl.value = url
      showSuccess('Test file uploaded successfully. ')
    } else {
      showError('Failed to upload test file.')
    }
  } catch (error) {
    showError(error)
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
  <VCard flat>
    <VCardTitle class="text-h6">
      Storage
    </VCardTitle>
    <VCardText class="pt-2">
      <!-- LOCKED VIEW -->
      <VSheet
        v-if="isLocked"
        color="surface"
        elevation="2"
        class="pa-6 rounded-lg d-flex flex-column gap-6"
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
                Storage settings are locked
              </div>
              <div class="text-body-2 text-medium-emphasis">
                Object storage credentials can only be updated after requesting a change.
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
            Request change
          </VBtn>
        </div>

        <VDivider class="my-2" />

        <!-- Bottom section: Test upload -->
        <div class="d-flex align-center flex-wrap gap-4">
          <VFileInput
            v-model="testFile.file"
            label="Upload storage test file"
            prepend-icon="mdi-upload"
            :disabled="isUploading"
            show-size
            hide-details
            class="flex-grow-1"
          />

          <VBtn
            variant="tonal"
            color="secondary"
            prepend-icon="mdi-flask"
            :loading="isUploading"
            class="text-none"
            @click="uploadTestFile"
          >
            Test Storage
          </VBtn>

          <a
            v-if="uploadTestFileUrl"
            :href="uploadTestFileUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-none"
          >
            View Uploaded File
          </a>
        </div>
      </VSheet>

      <!-- Edit Mode -->
      <VSheet
        v-else
        color="surface"
        elevation="2"
        class="pa-6 rounded-lg"
      >
        <!-- Header Actions -->
        <div class="d-flex align-center justify-space-between mb-6 flex-wrap gap-3">
          <div>
            <h3 class="text-h6 mb-1">
              Edit storage settings
            </h3>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Update your storage credentials and configuration below.
            </p>
          </div>

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

        <!-- Divider for structure -->
        <VDivider class="mb-6" />

        <!-- Storage Configuration Form -->
        <VRow dense>
          <VCol
            cols="12"
            md="6"
          >
            <VSelect
              v-model="form.storage_type"
              :items="['local', 's3', 'wasabi']"
              label="Driver"
              :error-messages="v$.storage_type.$errors.map((e:any)=>e.$message)"
            />
          </VCol>

          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="form.storage_url"
              label="Public base URL (optional)"
              hint="CDN/public URL for serving files"
              persistent-hint
            />
          </VCol>

          <!-- Conditional Fields for S3/Wasabi -->
          <template v-if="form.storage_type === 's3' || form.storage_type === 'wasabi'">
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="form.storage_endpoint"
                label="Endpoint (optional)"
                hint="Required for Wasabi or custom S3 endpoints"
                persistent-hint
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="form.storage_region"
                label="Region"
                :error-messages="v$.storage_region.$errors.map((e:any)=>e.$message)"
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="form.storage_access_key"
                label="Access Key"
                :error-messages="v$.storage_access_key.$errors.map((e:any)=>e.$message)"
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="form.storage_secret_key"
                label="Secret Key"
                type="password"
                :error-messages="v$.storage_secret_key.$errors.map((e:any)=>e.$message)"
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="form.storage_bucket_name"
                label="Bucket Name"
                :error-messages="v$.storage_bucket_name.$errors.map((e:any)=>e.$message)"
              />
            </VCol>
          </template>
        </VRow>
      </VSheet>
    </VCardText>
  </VCard>
</template>
