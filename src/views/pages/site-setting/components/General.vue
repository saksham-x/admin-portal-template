<script setup lang="ts">
import type { SiteSettingView } from '@/types/site-setting/SiteSetting'
import { useVuelidate } from '@vuelidate/core'
import { numeric } from '@vuelidate/validators'
import { helpers, email as emailValidator } from '@vuelidate/validators'

// Props & Emits
const props = defineProps<{ value: SiteSettingView | null }>()
const emit = defineEmits<{ (e: 'save', payload: Record<string, any>): void }>()


const generalSettingsForm = ref({
  company_name: props.value?.company_name ?? '',
  address_type: props.value?.address_type ?? '',
  phone: props.value?.phone ?? '',
  email: props.value?.email ?? '',
  website: props.value?.website ?? '',
  address: props.value?.address ?? '',
  tagline: props.value?.tagline ?? '',
  slogan: props.value?.slogan ?? '',
  enable_cookies: props.value?.enable_cookies ?? 0,
  date_format: props.value?.date_format ?? 'YYYY-MM-DD',
  copy_right_text: props.value?.copy_right_text ?? '',
})


const isCookiesEnabled = computed({
  get: () => generalSettingsForm.value.enable_cookies === 1,
  set: (val: boolean) => {
    generalSettingsForm.value.enable_cookies = val ? 1 : 0
  },
})

//validations 
const urlRule = helpers.withMessage(
  'Enter a valid URL with domain (e.g. https://example.com)',
  (v: any) => {
    if (!v) return true

    try {
      const url = new URL(String(v))

      if (!['http:', 'https:'].includes(url.protocol))
        return false

      const parts = url.hostname.split('.')
      if (parts.length < 2)
        return false

      const tld = parts[parts.length - 1]
      if ((tld as any).length < 2)
        return false

      return true
    }
    catch {
      return false
    }
  },
)


const emailRule = helpers.withMessage(
  'Enter a valid email address',
  (v: any) => {
    if (!v) return true

    return emailValidator.$validator(String(v))
  },
)


const rules = {
  email: { emailRule },
  website: { urlRule },
  phone: { numeric },
}

const v$ = useVuelidate(rules, generalSettingsForm)


// Methods
const saveGeneralSettings = () => {
  v$.value.$touch()

  if (v$.value.$error)
    return

  emit('save', { ...generalSettingsForm.value })
}

// Watchers
watch(() => props.value, (settings: any) => Object.assign(generalSettingsForm.value, {
  company_name: settings?.company_name ?? '',
  address_type: settings?.address_type ?? '',
  phone: settings?.phone ?? '',
  email: settings?.email ?? '',
  website: settings?.website ?? '',
  address: settings?.address ?? '',
  tagline: settings?.tagline ?? '',
  slogan: settings?.slogan ?? '',
  enable_cookies: settings?.enable_cookies ?? 0,
  copy_right_text: settings?.copy_right_text ?? '',

  date_format: settings?.date_format ?? 'YYYY-MM-DD',
}))
</script>

<template>
  <!-- Template Section: General site settings form -->
  <VCard flat>
    <VCardText class="d-grid gap-4">
      <VTextField
        v-model="generalSettingsForm.phone"
        label="Phone"
        class="mt-3"
        :error-messages="v$.phone.$errors.map((e: any) => e.$message)"
        @input="v$.phone.$touch"
      />
      <VTextField
        v-model="generalSettingsForm.email"
        label="Email"
        class="mt-3"
        :error-messages="v$.email.$errors.map((e: any) => e.$message)"
        @input="v$.email.$touch"
      />
      <VTextField
        v-model="generalSettingsForm.company_name"
        label="Company name"
        class="mt-3"
      />

      <VTextField
        v-model="generalSettingsForm.website"
        label="Website"
        class="mt-3"
        :error-messages="v$.website.$errors.map((e: any) => e.$message)"
        @input="v$.website.$touch"
      />
      <VTextField
        v-model="generalSettingsForm.address"
        label="Address"
        class="mt-3"
      />

      <VTextField
        v-model="generalSettingsForm.tagline"
        label="Tagline"
        class="mt-3"
      />
      <VTextField
        v-model="generalSettingsForm.slogan"
        label="Slogan"
        class="mt-3"
      />

      <VSwitch
        v-model="isCookiesEnabled"
        label="Enable cookies"
        class="mt-3"
      />

      <VTextField
        v-model="generalSettingsForm.copy_right_text"
        label="Copyright text"
        placeholder="© 2024 your-company. All rights reserved."
        class="mt-3"
      />
      <VTextField
        v-model="generalSettingsForm.date_format"
        label="Date format"
        class="mt-3"
      />
      <VBtn
        class="mt-3"
        @click="saveGeneralSettings"
      >
        Save
      </VBtn>
    </VCardText>
  </VCard>
</template>
