<script setup lang="ts">
import ValidationError from '@/components/ValidationError.vue'
import PageService from '@/services/cms/page/PageService'
import type { Page } from '@/types/cms/page/Page'
import { useVuelidate } from '@vuelidate/core'
import { required, helpers } from '@vuelidate/validators'
import RichText from '@/components/form/RichText.vue'
import { FULL_EDITOR_TOOLBAR } from '@/constants/editorConfig'


interface Props { isDrawerOpen: boolean }
interface Emit {
  (e: 'update:isDrawerOpen', v: boolean): void
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()
const { errors } = useErrors()

const pageService = new PageService()

const pageId = ref<number | null>(null)
const isEdit = ref(false)
const isSaving = ref(false)
const richTextKey = ref(0)

const pageForm = reactive<Page>({
  id: 0,
  title: '',
  slug: '',
  content: '',
  position: null,
  seo_title: '',
  seo_keyword: [],
  seo_description: '',
  views: null,
  is_active: true,
})

const requiredRule = helpers.withMessage('This field is required', required)

const rules = {
  title: { required: requiredRule },
  content: { required: requiredRule },
}

const v$ = useVuelidate(rules, pageForm)

const resetForm = () => {
  Object.assign(pageForm, {
    id: 0,
    title: '',
    slug: '',
    content: '',
    position: null,
    seo_title: '',
    seo_keyword: [],
    seo_description: '',
    views: null,
    is_active: true,
  })
  richTextKey.value++
  nextTick(() => v$.value.$reset())
}

const closeDrawer = () => {
  emit('update:isDrawerOpen', false)
}

const createPage = async () => {
  isSaving.value = true
  try {
    await pageService.store(pageForm)
    showSuccess('Page created successfully')
    emit('refresh')
    closeDrawer()
  } catch (err) {
    showError(err)
  } finally {
    isSaving.value = false
  }
}

const updatePage = async () => {
  if (pageId.value == null) return
  isSaving.value = true
  try {
    await pageService.update(pageId.value, pageForm)
    showSuccess('Page updated successfully')
    emit('refresh')
    closeDrawer()
  } catch (err) {
    showError(err)
  } finally {
    isSaving.value = false
  }
}

const onSubmit = async () => {
  v$.value.$touch()
  if (v$.value.$error) return

  if (isEdit.value) await updatePage()
  else await createPage()
}

const editPage = (val: Page) => {
  isEdit.value = true
  pageId.value = val.id

  Object.assign(pageForm, {
    id: val.id,
    title: val.title ?? '',
    slug: val.slug ?? '',
    content: val.content ?? '',
    position: val.position ?? null,
    seo_title: val.seo_title ?? '',
    seo_keyword: val.seo_keyword || [],
    seo_description: val.seo_description ?? '',
    views: val.views ?? null,
    is_active: Boolean(val.is_active),
  })

  nextTick(() => v$.value.$reset())
}

defineExpose({ edit: editPage })

watch(
  () => props.isDrawerOpen,
  (isOpen: boolean) => {
    if (!isOpen && !isSaving.value) {
      setTimeout(() => {
        isEdit.value = false
        pageId.value = null
        resetForm()
      }, 300)
    }
  },
)
</script>

<template>
  <VNavigationDrawer
    temporary
    :width="450"
    location="end"
    :model-value="props.isDrawerOpen"
    @update:model-value="(val: boolean) => emit('update:isDrawerOpen', val)"
  >
    <DrawerHeaderSection
      :title="isEdit ? 'Edit page' : 'Add page'"
      @cancel="closeDrawer"
    />

    <VDivider />

    <VCard flat>
      <VCardText>
        <VRow>
          <!-- Title -->
          <VCol cols="12">
            <VTextField
              v-model="pageForm.title"
              label="Title"
              :error-messages="v$.title.$errors.map((e: any) => e.$message)"
              @blur="v$.title.$touch"
            >
              <template #label>
                <span>Title</span>
                <span class="text-red ms-1">*</span>
              </template>
            </VTextField>
            <ValidationError
              :errors="errors"
              field="title"
              class="text-red"
            />
          </VCol>

          <!-- Content -->
          <VCol cols="12">
            <label class="mb-2 d-block">
              <span>Content</span>
              <span class="text-red ms-1">*</span>
            </label>
            <RichText
              :key="richTextKey"
              v-model="pageForm.content"
              :toolbar="FULL_EDITOR_TOOLBAR"
              @blur="v$.content.$touch"
            />
            <small
              v-if="v$.content.$error"
              class="text-red"
            >
              {{ v$.content.$errors[0].$message }}
            </small>
            <ValidationError
              :errors="errors"
              field="content"
              class="text-red"
            />
          </VCol>

          <!-- SEO Title -->
          <VCol cols="12">
            <VTextField
              v-model="pageForm.seo_title"
              label="SEO title"
            />
          </VCol>

          <!-- SEO Keywords -->
          <VCol cols="12">
            <VCombobox
              v-model="pageForm.seo_keyword"
              chips
              clearable
              multiple
              label="SEO keywords"
            />
          </VCol>

          <!-- SEO Description -->
          <VCol cols="12">
            <VTextarea
              v-model="pageForm.seo_description"
              rows="3"
              label="SEO description"
            />
          </VCol>

          <!-- Status -->
          <VCol cols="12">
            <label class="mb-1 d-block">Status</label>
            <VSwitch
              v-model="pageForm.is_active"
              :label="pageForm.is_active ? 'Active' : 'Inactive'"
            />
          </VCol>
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
          @click="onSubmit"
        >
          {{ isEdit ? 'Update' : 'Save' }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VNavigationDrawer>
</template>