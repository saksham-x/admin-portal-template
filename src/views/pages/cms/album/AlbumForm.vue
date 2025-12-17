<script setup lang="ts">
import ValidationError from '@/components/ValidationError.vue'
import AlbumService from '@/services/cms/album/AlbumService'
import type { Album } from '@/types/cms/album/Album'
import { useVuelidate } from '@vuelidate/core'
import { required, helpers } from '@vuelidate/validators'
import RichText from '@/components/form/RichText.vue'

interface Props { isDrawerOpen: boolean }
interface Emit {
  (e: 'update:isDrawerOpen', v: boolean): void
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()
const { errors } = useErrors()

const albumService = new AlbumService()

const isEditMode = ref(false)
const isSaving = ref(false)
const currentAlbumId = ref<number | null>(null)
const fileInputKey = ref(0)  
const previewUrl = ref<string | null>(null)
const currentImageUrl = ref<string | null>(null)
const richTextKey = ref(0)

const albumForm = reactive<Album>({
  title: '',
  cover_image: null,
  description: '',
  tags: [],
  event_date: null,
  is_active: true,
})

const requiredRule = helpers.withMessage('This field is required', required)

const rules = {
  title: { required: requiredRule },
}

const v$ = useVuelidate(rules, albumForm)

const resetForm = () => {
  Object.assign(albumForm, {
    title: '',
    cover_image: null,
    description: '',
    tags: [],
    event_date: null,
    is_active: true,
  })

  if (previewUrl.value?.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value)
  }

  previewUrl.value = null
  currentImageUrl.value = null
  fileInputKey.value++
  richTextKey.value++

  nextTick(() => v$.value.$reset())
}

const closeDrawer = () => {
  emit('update:isDrawerOpen', false)
}

const createAlbum = async () => {
  isSaving.value = true
  try {
    await albumService.store(albumForm)
    showSuccess('Album created successfully')
    emit('refresh')
    closeDrawer()
  } catch (err) {
    showError(err)
  } finally {
    isSaving.value = false
  }
}

const updateAlbum = async () => {
  if (currentAlbumId.value == null) return
  isSaving.value = true
  try {
    await albumService.update(currentAlbumId.value, albumForm)
    showSuccess('Album updated successfully')
    emit('refresh')
    closeDrawer()
  } catch (err) {
    showError(err)
  } finally {
    isSaving.value = false
  }
}

const handleSubmit = async () => {
  v$.value.$touch()
  if (v$.value.$error) return

  if (isEditMode.value) await updateAlbum()
  else await createAlbum()
}

const editAlbum = (val: Album) => {
  currentAlbumId.value = val.id
  isEditMode.value = true

  currentImageUrl.value =
    val.cover_image_path?.thumb ||
    val.cover_image_path?.original ||
    null

  previewUrl.value = currentImageUrl.value

  Object.assign(albumForm, {
    title: val.title,
    cover_image: null,
    description: val.description,
    tags: val.tags || [],
    event_date: val.event_date || null,
    is_active: Boolean(val.is_active),
  })

  nextTick(() => v$.value.$reset())
}

defineExpose({ edit: editAlbum })

watch(() => albumForm.cover_image, (file: File | null) => {
  if (previewUrl.value?.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value)
  }

  if (file instanceof File) {
    previewUrl.value = URL.createObjectURL(file)
  } else if (!file) {
    previewUrl.value = currentImageUrl.value
  }
})

watch(
  () => props.isDrawerOpen,
  (isOpen: boolean) => {
    if (!isOpen && !isSaving.value) {
      setTimeout(() => {
        isEditMode.value = false
        currentAlbumId.value = null
        resetForm()
      }, 300)
    }
  },
)

onBeforeUnmount(() => {
  if (previewUrl.value?.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value)
  }
})
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
      :title="isEditMode ? 'Edit album' : 'Add album'"
      @cancel="closeDrawer"
    />

    <VDivider />

    <VCard flat>
      <VCardText>
        <VRow dense>
          <!-- TITLE -->
          <VCol cols="12">
            <VTextField
              v-model="albumForm.title"
              :error-messages="v$.title.$errors.map((e: any) => e.$message)"
              @blur="v$.title.$touch"
            >
              <template #label>
                Title <span class="text-red ms-1">*</span>
              </template>
            </VTextField>
            <ValidationError
              :errors="errors"
              field="title"
              class="text-red"
            />
          </VCol>

          <!-- DESCRIPTION -->
          <VCol cols="12">
            <label class="mb-2 d-block">Description</label>
            <RichText
              :key="richTextKey"
              v-model="albumForm.description"
            />
          </VCol>

          <!-- EVENT DATE -->
          <VCol cols="12">
            <VTextField
              v-model="albumForm.event_date"
              type="date"
              label="Event date"
            />
          </VCol>

          <!-- COVER IMAGE -->
          <VCol cols="12">
            <VFileInput
              :key="fileInputKey"
              v-model="albumForm.cover_image"
              label="Cover image"
              accept="image/*"
              show-size
              truncate-length="18"
              prepend-icon=""
              prepend-inner-icon="ri-image-line"
              clear-icon="ri-close-circle-line"
              clearable
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

          <!-- STATUS -->
          <VCol cols="12">
            <label class="mb-1 d-block">Status</label>
            <VSwitch
              v-model="albumForm.is_active"
              :label="albumForm.is_active ? 'Active' : 'Inactive'"
            />
          </VCol>

          <!-- ACTION BUTTONS -->
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