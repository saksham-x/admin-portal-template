<script setup lang="ts">
import ValidationError from '@/components/ValidationError.vue'
import AlbumValueService from '@/services/cms/album/value/AlbumValueService'
import type { AlbumValue } from '@/types/cms/album/value/AlbumValue'
import { useVuelidate } from '@vuelidate/core'
import { helpers } from '@vuelidate/validators'

// Props & Emits
interface Props {
  isDrawerOpen: boolean
  albumId: number | string
}

interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()
  
const { errors } = useErrors()

// Service
const albumValueService = new AlbumValueService()

// State
const isEditMode = ref(false)
const isSaving = ref(false)
const currentValueId = ref<number | null>(null)

const previewUrl = ref<string | null>(null)
const currentImageUrl = ref<string | null>(null)

// Form
const valueForm = reactive<Partial<AlbumValue>>({
  title: '',
  path: null,
  is_featured: false,
})

// Validation
const requiredImageRule = helpers.withMessage(
  'Image is required',
  (val: unknown) => {
    if (isEditMode.value) return true

    return val instanceof File
  },
)

const rules = computed(() => ({
  path: { required: requiredImageRule },
}))

const v$ = useVuelidate(rules, valueForm)

// Helpers
const resetForm = () => {
  Object.assign(valueForm, {
    title: '',
    path: null,
    is_featured: false,
  })

  if (previewUrl.value?.startsWith('blob:')) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = null
  currentImageUrl.value = null

  nextTick(() => v$.value.$reset())
}

const closeDrawer = () => {
  emit('update:isDrawerOpen', false)

}

// Create
const createAlbumValue = async () => {
  isSaving.value = true
  try {
    await albumValueService.store(props.albumId, valueForm)
    showSuccess('Album item created successfully')
    emit('refresh')
    closeDrawer()
  } catch (err) {
    showError(err)
  } finally {
    isSaving.value = false
  }
}

// Update
const updateAlbumValue = async () => {
  if (!currentValueId.value) return
  isSaving.value = true
  try {
    await albumValueService.update(props.albumId, currentValueId.value, valueForm)
    showSuccess('Album item updated successfully')
    emit('refresh')
    closeDrawer()
  } catch (err) {
    showError(err)
  } finally {
    isSaving.value = false
  }
}

// Submit handler
const handleSubmit = async () => {
  v$.value.$touch()
  if (v$.value.$error) return

  if (isEditMode.value) await updateAlbumValue()
  else await createAlbumValue()
}

// Edit fill
const editValue = (val: AlbumValue) => {
  currentValueId.value = val.id
  isEditMode.value = true

  currentImageUrl.value =
    val.image_path?.thumb ||
    val.image_path?.original ||
    null

  previewUrl.value = currentImageUrl.value

  Object.assign(valueForm, {
    title: val.title,
    path: null,
    is_featured: Boolean(val.is_featured),
  })
}

watch(
  () => valueForm.path,
  (file: any) => {
    if (previewUrl.value?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl.value)
    }

    if (file instanceof File) {
      previewUrl.value = URL.createObjectURL(file)
    } else if (!file) {
      previewUrl.value = currentImageUrl.value
    }
  },
)
watch(
  () => props.isDrawerOpen,
  (isOpen: boolean) => {
    if (!isOpen && !isSaving.value) {
      setTimeout(() => {
        isEditMode.value = false
        currentValueId.value = null
        resetForm()
      }, 300)
    }
  })

defineExpose({ edit: editValue })
</script>

<template>
  <VNavigationDrawer
    temporary
    location="end"
    :width="520"
    :model-value="props.isDrawerOpen"
    @update:model-value="(val: boolean) => emit('update:isDrawerOpen', val)"
  >
    <DrawerHeaderSection
      :title="isEditMode ? 'Edit album item' : 'Add album item'"
      @cancel="closeDrawer"
    />

    <VDivider />

    <VCard flat>
      <VCardText>
        <VRow dense>
          <!-- Title -->
          <VCol cols="12">
            <VTextField
              v-model="valueForm.title"
              label="Title"
              placeholder="Optional title"
            />
          </VCol>

          <!-- Image -->
          <VCol cols="12">
            <VFileInput
              v-model="valueForm.path"
              label="Image"
              accept="image/*"
              show-size
              truncate-length="18"
              prepend-inner-icon="ri-image-line"
              clear-icon="ri-close-circle-line"
              clearable
              :error-messages="v$.path.$errors.map((e: any) => e.$message)"
              @blur="v$.path.$touch"
            >
              <template #label>
                Image
                <span class="text-red">*</span>
              </template>
            </VFileInput>
            <ValidationError
              :errors="errors"
              field="path"
              class="text-red"
            />

            <div
              v-if="previewUrl"
              class="mt-3"
            >
              <label class="text-medium-emphasis d-block mb-1">Preview</label>
              <VImg
                :src="previewUrl"
                max-height="80"
                max-width="80"
                class="rounded-lg border"
              />
            </div>
          </VCol>

          <!-- Featured -->
          <VCol cols="12">
            <VSwitch
              v-model="valueForm.is_featured"
              :label="valueForm.is_featured ? 'Featured' : 'Not featured'"
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
              :loading="isSaving"
              variant="outlined"
              color="secondary"
              class="me-4"
              @click="handleSubmit"
            >
              {{ isEditMode ? 'Update' : 'Save' }}
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </VNavigationDrawer>
</template>
