<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { helpers, required } from '@vuelidate/validators'
import FaqCategoryService from '@/services/cms/faq/category/FaqCategoryService'
import type { FaqCategoryView } from '@/types/cms/faq/category/FaqCategory'

// Props & Emits
interface Props { isDrawerOpen: boolean }
interface Emit { (e: 'update:isDrawerOpen', value: boolean): void;(e: 'refresh'): void }

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const faqCategoryService = new FaqCategoryService()

const isEditMode = ref(false)
const isSaving = ref(false)
const currentCategoryId = ref<number | null>(null)

// parent category fields removed

const categoryFormData = reactive<FaqCategoryView>({
  name: '',
  description: '',
  position: 0,
  is_active: true,
})

const requiredRule = helpers.withMessage('This field is required', required)
const formValidationRules = { name: { required: requiredRule } }
const v$ = useVuelidate(formValidationRules, categoryFormData)


const resetForm = () => {

  Object.assign(categoryFormData, {
    name: '',
    description: '',
    position: 0,
    is_active: true,
  })
  nextTick(() => v$.value.$reset())
}


const closeDrawer = () => {
  emit('update:isDrawerOpen', false)
}


// parent category geting removed

const createCategory = async () => {
  try {
    isSaving.value = true
    await faqCategoryService.store(categoryFormData)
    isSaving.value = false
    showSuccess('Category created successfully')
    emit('refresh')
    closeDrawer()
  }
  catch (err) {
    isSaving.value = false
    showError(err)
  }
}

const updateCategory = async () => {
  try {
    if (currentCategoryId.value == null) return
    isSaving.value = true
    await faqCategoryService.update(currentCategoryId.value, categoryFormData)
    isSaving.value = false
    showSuccess('Category updated successfully')
    emit('refresh')
    closeDrawer()
  }
  catch (err) {
    isSaving.value = false
    showError(err)
  }
}

const handleSubmitCategory = () => {
  v$.value.$touch()
  if (v$.value.$error) {
    setTimeout(() => v$.value.$reset(), 3000)
  }
  else {
    if (isEditMode.value) updateCategory()
    else createCategory()

  }
}

const editCategoryData = (val: FaqCategoryView) => {
  currentCategoryId.value = val.id
  isEditMode.value = true
  Object.assign(categoryFormData, {
    name: val.name,
    description: val.description ?? '',
    position: val.position,
    is_active: Boolean(val.is_active),
  })
}



defineExpose({ edit: editCategoryData })



watch(
  () => props.isDrawerOpen,
  (isOpen: boolean) => {
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
  <!-- FAQ Category Drawer Form Component -->
  <VNavigationDrawer
    temporary
    :width="520"
    location="end"
    :model-value="props.isDrawerOpen"
    @update:model-value="(val: boolean) => emit('update:isDrawerOpen', val)"
  >
    <!-- Drawer Header -->
    <DrawerHeaderSection
      :title="isEditMode ? 'Edit category' : 'Add category'"
      @cancel="closeDrawer"
    />

    <VDivider />

    <!-- Form Content -->
    <VCard flat>
      <VCardText>
        <VRow>
          <!-- Name Field -->
          <VCol cols="12">
            <VTextField
              v-model="categoryFormData.name"
              label="Name"
              :error-messages="v$.name.$errors.map((e: any) => e.$message)"
              @input="v$.name.$touch"
            >
              <template #label>
                <span>Name</span><span class="text-red">*</span>
              </template>
            </VTextField>
          </VCol>

          <!-- Description Field -->
          <VCol cols="12">
            <VTextarea
              v-model="categoryFormData.description"
              label="Description"
              rows="3"
            />
          </VCol>

          <!-- parent fields removed -->


          <!-- Status Field -->
          <VCol
            cols="12"
            md="6"
          >
            <label>Status</label>
            <VSwitch
              v-model="categoryFormData.is_active"
              :label="categoryFormData.is_active ? 'Active' : 'Inactive'"
            />
          </VCol>

          <!-- Form Actions -->
          <VCol
            cols="12"
            class="d-flex justify-end "
          >
            <VBtn
              type="reset"
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
