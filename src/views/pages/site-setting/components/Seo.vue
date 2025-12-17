<script setup lang="ts">
import { SiteSettingView } from '@/types/site-setting/SiteSetting'

interface Props {
  value: SiteSettingView | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  save: [payload: Record<string, any>]
}>()

const seoTitle = ref('')
const seoKeywords = ref<string[]>([])
const seoDescription = ref('')
const isSaving = ref(false)

watch(
  () => props.value,
  (newValue: SiteSettingView | null) => {
    if (newValue) {
      seoTitle.value = newValue.seo_title || ''
      seoDescription.value = newValue.seo_description || ''

      if (newValue.seo_keyword) {
        seoKeywords.value = typeof newValue.seo_keyword === 'string'
          ? newValue.seo_keyword.split(',').map((k: string) => k.trim()).filter((k: string) => k)
          : newValue.seo_keyword
      } else {
        seoKeywords.value = []
      }
    }
  },
  { immediate: true },
)

async function handleSave() {
  isSaving.value = true

  const payload = {
    seo_title: seoTitle.value,
    seo_keyword: seoKeywords.value.join(', '),
    seo_description: seoDescription.value,
  }

  emit('save', payload)

  isSaving.value = false
}
</script>

<template>
  <VCard flat>
    <VCardText>
      <VForm @submit.prevent="handleSave">
        <VRow>
          <VCol cols="12">
            <VTextField
              v-model="seoTitle"
              label="SEO title"
              placeholder="Enter SEO title for your website"
            />
          </VCol>

          <VCol cols="12">
            <VCombobox
              v-model="seoKeywords"
              label="SEO Keywords"
              placeholder="Type keyword and press Enter"
              chips
              closable-chips
              multiple
              :delimiters="[',', 'Enter']"
            />
          </VCol>

          <VCol cols="12">
            <VTextarea
              v-model="seoDescription"
              label="SEO description"
              placeholder="Enter SEO meta description for your website"
              rows="4"
            />
          </VCol>

          <VCol cols="12">
            <VBtn
              type="submit"
              color="primary"
              :loading="isSaving"
            >
              Save
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
  </VCard>
</template>

<style scoped>
.v-chip {
  font-size: 14px;
}
</style>