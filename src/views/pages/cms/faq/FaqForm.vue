<script setup lang="ts">
import ValidationError from '@/components/ValidationError.vue'
import { useVuelidate } from '@vuelidate/core'
import { helpers, required } from '@vuelidate/validators'
import FAQService from '@/services/cms/faq/FaqService'
import FaqCategoryService from '@/services/cms/faq/category/FaqCategoryService'
import type { Faq, FaqView } from '@/types/cms/faq/Faq'
import type { FaqCategoryView } from '@/types/cms/faq/category/FaqCategory'
import RichText from '@/components/form/RichText.vue'

// ========================================
// Props & Emits
// ========================================
interface Props { isDrawerOpen: boolean }
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
const faqService = new FAQService()
const faqCategoryService = new FaqCategoryService()

// ========================================
// State Management
// ========================================
const isEditMode = ref(false)
const isSaving = ref(false)
const isCategoriesLoading = ref(false)
const currentFaqId = ref<number | null>(null)


// ========================================
// Data
// ========================================
// type CategoryOption = Pick<FaqCategoryView, 'id'> & { name: string }
const categoryList = ref<FaqCategoryView[]>([])

const faqFormData = reactive<FaqView>({
  title: '',
  short_description: '',
  tags: '',
  description: '',
  faq_category_id: null,
  position: 0,
  is_active: true,
})

const tagsArray = computed<string[]>({
  get: () => faqFormData.tags ? faqFormData.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
  set: (value: string[]) => {
    faqFormData.tags = value.join(',')
  },
})

const requiredRule = helpers.withMessage('This field is required', required)

const formValidationRules = {
  title: { required: requiredRule },
  faq_category_id: { required: requiredRule },
  description: { required: requiredRule },
}

const v$ = useVuelidate(formValidationRules, faqFormData)


const toNum = (v: unknown) => (v === null || v === undefined || v === '' ? null : Number(v))


const resetForm = () => {
  Object.assign(faqFormData, {
    title: '',
    short_description: '',
    tags: '',
    description: '',
    faq_category_id: null,
    position: 0,
    is_active: true,
  })

  nextTick(() => v$.value.$reset())
}


const closeDrawer = () => {
  emit('update:isDrawerOpen', false)
}



const getAllCategories = async () => {
  isCategoriesLoading.value = true
  try {
    const { data } = await faqCategoryService.list()

    categoryList.value = data
  }
  catch (err) {
    showError(err)
  }
  finally {
    isCategoriesLoading.value = false
  }
}

const createFaq = async () => {
  try {
    isSaving.value = true
    await faqService.store({ ...faqFormData })
    showSuccess('FAQ created successfully')
    emit('refresh')
    closeDrawer()
  }
  catch (err) {
    showError(err)
  }
  finally {
    isSaving.value = false
  }
}

const updateFaq = async () => {
  if (currentFaqId.value == null) return false

  try {
    isSaving.value = true
    await faqService.update(currentFaqId.value, { ...faqFormData })
    showSuccess('FAQ updated successfully')
    emit('refresh')
    closeDrawer()
  }
  catch (err) {
    showError(err)
  }
  finally {
    isSaving.value = false
  }
}

const handleSubmitFaq = async () => {
  v$.value.$touch()
  if (v$.value.$error) return

  // isEditMode.value ? await updateFaq() : await createFaq()

  if (isEditMode.value) await updateFaq()
  else await createFaq()

}

const editFaqData = async (val: Faq) => {
  isEditMode.value = true
  currentFaqId.value = (val as any).id ?? null

  if (categoryList.value.length === 0) {
    await getAllCategories()
  }
  const rawId = (val as any).faq_category_id ?? (val as any).faq_category?.id ?? null
  const categoryId = toNum(rawId)


  // await nextTick()
  Object.assign(faqFormData, {
    title: val.title ?? '',
    short_description: val.short_description ?? '',
    tags: val.tags ?? '',
    description: val.description ?? '',
    faq_category_id: categoryId,
    position: toNum((val as any).position) ?? 0,
    is_active: Boolean((val as any).is_active),
  })

}


defineExpose({ edit: editFaqData })

watch(
  () => props.isDrawerOpen,
  async (open: boolean) => {
    if (open && categoryList.value.length === 0) {
      await getAllCategories()
    }
  },
)

watch(
  () => props.isDrawerOpen,
  (isOpen: boolean) => {
    if (!isOpen && !isSaving.value) {
      setTimeout(() => {
        isEditMode.value = false
        currentFaqId.value = null
        resetForm()
      }, 300)
    }
  },
)
</script>

<template>
  <VNavigationDrawer
    temporary
    :width="720"
    location="end"
    :model-value="props.isDrawerOpen"
    @update:model-value="(val: boolean) => emit('update:isDrawerOpen', val)"
  >
    <DrawerHeaderSection
      :title="isEditMode ? 'Edit faq' : 'Add faq'"
      @cancel="closeDrawer"
    />

    <VDivider />

    <VCard flat>
      <VCardText>
        <VRow>
          <!-- Title -->
          <VCol cols="12">
            <VTextField
              v-model="faqFormData.title"
              label="Title"
              :error-messages="v$.title.$errors.map((e: any) => e.$message)"
              @input="v$.title.$touch"
            >
              <template #label>
                <span>Title</span><span class="text-red">*</span>
              </template>
            </VTextField>
            <ValidationError
              :errors="errors"
              field="title"
              class="text-red"
            />
          </VCol>

          <!-- Category -->
          <VCol cols="12">
            <VSelect
              v-model="faqFormData.faq_category_id"
              :items="categoryList"
              item-title="name"
              item-value="id"
              label="Category"
              :loading="isCategoriesLoading"
              :return-object="false"
              :error-messages="v$.faq_category_id.$errors.map((e: any) => e.$message)"
              clearable
              @update:model-value="v$.faq_category_id.$touch"
            >
              <template #label>
                <span>Category</span><span class="text-red">*</span>
              </template>
            </VSelect>
          </VCol>

          <!-- Description -->
          <VCol cols="12">
            <label class="mb-2 d-block">
              <span>Description</span>
              <span class="text-red">*</span>
            </label>
            <RichText
              :key="richTextKey"
              v-model="faqFormData.description"
              label=""
              @blur="v$.description.$touch()"
              @input="v$.description.$touch()"
            />
            <small
              v-if="v$.description.$error"
              class="text-red"
            >
              {{ v$.description.$errors[0].$message }}
            </small>
            <ValidationError
              :errors="errors"
              field="description"
              class="text-red"
            />
          </VCol>

          <!-- Tags -->
          <VCol cols="12">
            <VCombobox
              v-model="tagsArray"
              label="Tags"
              placeholder="Type and press Enter to add tags"
              chips
              multiple
              closable-chips
              clearable
            />
          </VCol>

          <!-- Status -->
          <VCol cols="12">
            <label class="mb-1 d-block">Status</label>
            <VSwitch
              v-model="faqFormData.is_active"
              :label="faqFormData.is_active ? 'Active' : 'Inactive'"
            />
          </VCol>

          <!-- Actions -->
          <VCol
            cols="12"
            class="d-flex justify-end"
          >
            <VBtn
              variant="text"
              color="error"
              @click="closeDrawer"
            >
              Cancel
            </VBtn>
            <VBtn
              variant="outlined"
              color="secondary"
              :loading="isSaving"
              class="me-4"
              @click="handleSubmitFaq"
            >
              {{ isEditMode ? 'Update' : 'Save' }}
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </VNavigationDrawer>
</template>