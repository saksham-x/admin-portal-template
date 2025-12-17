<script setup lang="ts">
import type { SiteSettingView } from '@/types/site-setting/SiteSetting'
import { useVuelidate } from '@vuelidate/core'
import { helpers } from '@vuelidate/validators'

// Props & Emits
const props = defineProps<{ value: SiteSettingView | null }>()
const emit = defineEmits<{ (e: 'save', payload: Record<string, any>): void }>()

// Reactive Form
const socialLinksForm = ref({
  facebook: props.value?.facebook ?? '',
  twitter: props.value?.twitter ?? '',
  instagram: props.value?.instagram ?? '',
  youtube: props.value?.youtube ?? '',
  linkedin: props.value?.linkedin ?? '',
  tiktok: props.value?.tiktok ?? '',
  pinterest: props.value?.pinterest ?? '',
  whatsapp: props.value?.whatsapp?.replace('https://wa.me/', '') ?? '',
  viber: props.value?.viber?.replace('https://viber.click/', '') ?? '',
})


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

const whatsappUrl = computed(() => {
  if (!socialLinksForm.value.whatsapp) return ''
  if (socialLinksForm.value.whatsapp.startsWith('http')) {
    return socialLinksForm.value.whatsapp
  }
  
  return `https://wa.me/${socialLinksForm.value.whatsapp}`
})

const viberUrl = computed(() => {
  if (!socialLinksForm.value.viber) return ''
  if (socialLinksForm.value.viber.startsWith('http')) {
    return socialLinksForm.value.viber
  }

  // Using the proper Viber web URL format
  return `https://viber.click/${socialLinksForm.value.viber}`
})

const numberOnlyRule = helpers.withMessage(
  'Enter numbers only',
  (v: any) => {
    if (!v) return true
    
    return /^\d+$/.test(String(v))
  },
)


// Vuelidate rules
const rules = {
  facebook: { urlRule },
  twitter: { urlRule },
  instagram: { urlRule },
  youtube: { urlRule },
  linkedin: { urlRule },
  tiktok: { urlRule },
  pinterest: { urlRule },
  whatsapp: { numberOnlyRule },
  viber: { numberOnlyRule },
}

const v$ = useVuelidate(rules, socialLinksForm)

// Methods
const saveSocialLinks = () => {
  v$.value.$touch()

  if (v$.value.$error)
    return

  emit('save', {
    facebook: socialLinksForm.value.facebook,
    twitter: socialLinksForm.value.twitter,
    instagram: socialLinksForm.value.instagram,
    youtube: socialLinksForm.value.youtube,
    linkedin: socialLinksForm.value.linkedin,
    tiktok: socialLinksForm.value.tiktok,
    pinterest: socialLinksForm.value.pinterest,
    whatsapp: whatsappUrl.value,
    viber: viberUrl.value,
  })
}
</script>

<template>
  <VCard flat>
    <VCardText class="d-grid gap-4">
      <VTextField
        v-model="socialLinksForm.facebook"
        label="Facebook"
        class="mt-3"
        :error-messages="v$.facebook.$errors.map((e: any) => e.$message)"
        @input="v$.facebook.$touch"
      />

      <VTextField
        v-model="socialLinksForm.twitter"
        label="Twitter/X"
        class="mt-3"
        :error-messages="v$.twitter.$errors.map((e: any) => e.$message)"
        @input="v$.twitter.$touch"
      />

      <VTextField
        v-model="socialLinksForm.instagram"
        label="Instagram"
        class="mt-3"
        :error-messages="v$.instagram.$errors.map((e: any) => e.$message)"
        @input="v$.instagram.$touch"
      />

      <VTextField
        v-model="socialLinksForm.youtube"
        label="YouTube"
        class="mt-3"
        :error-messages="v$.youtube.$errors.map((e: any) => e.$message)"
        @input="v$.youtube.$touch"
      />

      <VTextField
        v-model="socialLinksForm.linkedin"
        label="LinkedIn"
        class="mt-3"
        :error-messages="v$.linkedin.$errors.map((e: any) => e.$message)"
        @input="v$.linkedin.$touch"
      />

      <VTextField
        v-model="socialLinksForm.tiktok"
        label="TikTok"
        class="mt-3"
        :error-messages="v$.tiktok.$errors.map((e: any) => e.$message)"
        @input="v$.tiktok.$touch"
      />

      <VTextField
        v-model="socialLinksForm.pinterest"
        label="Pinterest"
        class="mt-3"
        :error-messages="v$.pinterest.$errors.map((e: any) => e.$message)"
        @input="v$.pinterest.$touch"
      />

      <VTextField
        v-model="socialLinksForm.whatsapp"
        label="WhatsApp number" 
        placeholder="Enter phone number with country code (e.g., 9779800000000)"
        class="mt-3"
        :error-messages="v$.whatsapp.$errors.map((e: any) => e.$message)"
        @input="v$.whatsapp.$touch"
      />

      <VTextField
        v-model="socialLinksForm.viber"
        label="Viber number"
        placeholder="Enter phone number with country code (e.g., 9779800000000"
        class="mt-3"
        :error-messages="v$.viber.$errors.map((e: any) => e.$message)"
        @input="v$.viber.$touch"
      />

      <VBtn
        class="mt-3 d-flex justify-end"
        @click="saveSocialLinks"
      >
        Save
      </VBtn>
    </VCardText>
  </VCard>
</template>
