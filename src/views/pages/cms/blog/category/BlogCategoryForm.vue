<script setup lang="ts">
import ValidationError from '@/components/ValidationError.vue'
import BlogCategoryService from '@/services/cms/blog/category/BlogCategoryService'
import { BlogCategory, BlogCategoryView } from '@/types/cms/blog/category/BlogCategory'
import { useVuelidate } from '@vuelidate/core'
import { helpers, required } from '@vuelidate/validators'

interface Props { isDrawerOpen: boolean }
interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'refresh'): void
}
const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const blogCategoryService = new BlogCategoryService()

const { errors } = useErrors()


const isEditMode = ref(false)
const isSaving = ref(false)
const currentCategoryId = ref<number | null>(null)
const currentImageUrl = ref<string | null>(null)
const previewUrl = ref<string | null>(null)

const categoryFormData = reactive<BlogCategory>({
  title: '',
  description: '',
  featured_image: null,
  is_active: true,
})

const requiredRule = helpers.withMessage('This field is required', required)

const rules = computed(() => ({
  title: { required: requiredRule },

  // parent category validation removed
}))

const v$ = useVuelidate(rules, categoryFormData)

const resetForm = () => {
  Object.assign(categoryFormData, {
    title: '',
    description: '',
    featured_image: null,
    is_active: true,
  })
  if (previewUrl.value?.startsWith('blob:')) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = null
  currentImageUrl.value = null
  nextTick(() => v$.value.$reset())
}

const closeDrawer = () => {
  emit('update:isDrawerOpen', false)

}


// parent category fetching removed

const createCategory = async () => {
  isSaving.value = true
  try {
    await blogCategoryService.store(categoryFormData)
    showSuccess('Category created successfully')
    emit('refresh')
    closeDrawer()
  } catch (err) {
    showError(err)
  } finally {
    isSaving.value = false
  }
}

const updateCategory = async () => {
  if (currentCategoryId.value == null) return
  isSaving.value = true
  try {
    await blogCategoryService.update(currentCategoryId.value, categoryFormData)
    showSuccess('Category updated successfully')
    emit('refresh')
    closeDrawer()
  } catch (err) {
    showError(err)
  } finally {
    isSaving.value = false
  }
}

const handleSubmitCategory = async () => {
  v$.value.$touch()
  if (v$.value.$error) return
  if (isEditMode.value) await updateCategory()
  else await createCategory()
}

const editCategoryData = (val: BlogCategoryView) => {
  currentCategoryId.value = val.id
  isEditMode.value = true

  currentImageUrl.value = val.image_path?.thumb || val.image_path?.original || null
  previewUrl.value = currentImageUrl.value
  Object.assign(categoryFormData, {
    title: val.title,
    description: val.description,
    featured_image: null,
    is_active: Boolean(val.is_active),
  })
}


watch(() => categoryFormData.featured_image, (file: any) => {
  if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value)
  }

  if (file instanceof File) {
    previewUrl.value = URL.createObjectURL(file)
  } else if (!file) {
    previewUrl.value = currentImageUrl.value
  }
})

defineExpose({ edit: editCategoryData })
watch(
  () => props.isDrawerOpen,
  (isOpen:boolean) => {
    if (!isOpen && !isSaving.value) {
      setTimeout(() => {
        isEditMode.value = false
        currentCategoryId.value = null
        resetForm()
      }, 300)
    }
  },
)
</script>

<template>
  <VNavigationDrawer
    temporary
    :width="520"
    location="end"
    :model-value="props.isDrawerOpen"
    @update:model-value="(val: any) => emit('update:isDrawerOpen', val)"
  >
    <DrawerHeaderSection
      :title="isEditMode ? 'Edit category' : 'Add category'"
      @cancel="closeDrawer"
    />

    <VDivider />

    <VCard flat>
      <VCardText>
        <VRow>
          <VCol cols="12">
            <VTextField
              v-model="categoryFormData.title"
              label="Title"
              :error-messages="v$.title.$errors.map((e: any) => e.$message)"
              @blur="v$.title.$touch"
            >
              <template #label>
                <span>Title</span><span class="text-red ms-1">*</span>
              </template>
            </VTextField>
          </VCol>

          <VCol cols="12">
            <VTextarea
              v-model="categoryFormData.description"
              label="Description"
              rows="3"
            />
          </VCol>

          <!-- parent fields removed -->

          <VCol cols="12">
            <VFileInput
              v-model="categoryFormData.featured_image"
              label="Featured image"
              accept="image/*"
              show-size
              truncate-length="18"
              prepend-icon=""
              prepend-inner-icon="ri-image-line"
              clear-icon="ri-close-circle-line"
            />
            <ValidationError
              :errors="errors"
              field="featured_image"
              class="text-red"
            />
            <div
              v-if="previewUrl"
              class="mt-3"
            >
              <label class="text-medium-emphasis d-block mb-1">Preview</label>
              <VImg
                :src="previewUrl"
                max-height="70"
                max-width="70"
                class="rounded-lg border"
              />
            </div>
          </VCol>

          <VCol cols="12">
            <label class="mb-1 d-block">Status</label>
            <VSwitch
              v-model="categoryFormData.is_active"
              :label="categoryFormData.is_active ? 'Active' : 'Inactive'"
            />
          </VCol>

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
              :loading="isSaving"
              variant="outlined"
              color="secondary"
              class="me-4"
              @click="handleSubmitCategory"
            >
              {{ isEditMode ? 'Update' : 'Save' }}
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </VNavigationDrawer>
</template>
