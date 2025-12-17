<script setup lang="ts">
import OurServiceService from '@/services/cms/our-service/OurServiceService'
import type { OurService } from '@/types/cms/our-service/OurService'
import { useVuelidate } from '@vuelidate/core'
import { helpers, required } from '@vuelidate/validators'
import RichText from '@/components/form/RichText.vue'
import ValidationError from '@/components/ValidationError.vue'


interface Props {
  isDrawerOpen: boolean
}
interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'refresh'): void
}
const props = defineProps<Props>()
const emit = defineEmits<Emit>()
const { errors } = useErrors()

const ourServiceService = new OurServiceService()
const currentServiceId = ref<number | null>(null)
const isEditMode = ref(false)
const isSaving = ref(false)

const existingIconUrl = ref<string | null>(null)
const newIconPreviewUrl = ref<string | null>(null)
let lastObjectUrl: string | null = null

const serviceFormData = reactive<OurService>({
  title: '',
  description: '',
  icon: null,
  is_active: true,
})

const requiredRule = helpers.withMessage('This field is required', required)

const iconRequiredRule = helpers.withMessage(
  'This field is required',
  (value: any) => {
    const file = getSingleFile(value)


    if (isEditMode.value && existingIconUrl.value && !file)
      return true

    return !!file
  },
)

const formValidationRules = {
  title: { required: requiredRule },
  icon: { required: iconRequiredRule },
}

const v$ = useVuelidate(formValidationRules, serviceFormData)

const getSingleFile = (val: any): File | null => {
  if (val instanceof File)
    return val
  if (Array.isArray(val) && val.length && val[0] instanceof File)
    return val[0]

  return null
}

const resetForm = () => {
  Object.assign(serviceFormData, {
    title: '',
    description: '',
    icon: null,
    is_active: true,
  })
  existingIconUrl.value = null
  newIconPreviewUrl.value = null
  if (lastObjectUrl) {
    URL.revokeObjectURL(lastObjectUrl)
    lastObjectUrl = null
  }
  nextTick(() => v$.value.$reset())
}

const closeDrawer = () => {
  emit('update:isDrawerOpen', false)
}

const createService = async () => {
  isSaving.value = true
  try {
    await ourServiceService.store(serviceFormData)
    showSuccess('Service created successfully')
    emit('refresh')
    closeDrawer()
  } catch (err) {
    showError(err)
  } finally {
    isSaving.value = false
  }
}

const updateService = async () => {
  if (!currentServiceId.value) return
  isSaving.value = true
  try {
    await ourServiceService.update(currentServiceId.value, serviceFormData)
    showSuccess('Service updated successfully')
    emit('refresh')
    closeDrawer()
  } catch (err) {
    showError(err)
  } finally {
    isSaving.value = false
  }
}

const handleSubmit = () => {
  v$.value.$touch()
  if (v$.value.$error) {
    setTimeout(() => {
      v$.value.$reset()
    }, 3000)
  }
  else {
    if (isEditMode.value)
      updateService()
    else
      createService()
  }
}

const editServiceData = (val: OurService) => {
  currentServiceId.value = val.id
  isEditMode.value = true

  Object.assign(serviceFormData, {
    title: val.title,
    description: val.description ?? '',
    icon: null,
    is_active: val.is_active ?? true,
  })

  existingIconUrl.value =
    val.icon_image_path?.thumb ||
    val.icon_image_path?.original ||
    null

  newIconPreviewUrl.value = null
  nextTick(() => v$.value.$reset())
  emit('update:isDrawerOpen', true)
}


watch(
  () => serviceFormData.icon,
  (val: any) => {
    if (lastObjectUrl) {
      URL.revokeObjectURL(lastObjectUrl)
      lastObjectUrl = null
    }

    const file = getSingleFile(val)
    if (file) {
      const url = URL.createObjectURL(file)

      newIconPreviewUrl.value = url
      lastObjectUrl = url
    }
    else {
      newIconPreviewUrl.value = null
    }
  },
)
defineExpose({
  edit: editServiceData,
})

watch(
  () => props.isDrawerOpen,
  (isOpen: boolean) => {
    if (!isOpen && !isSaving.value) {
      setTimeout(() => {
        isEditMode.value = false
        currentServiceId.value = null
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
      :title="isEditMode ? 'Edit service' : 'Add service'"
      @cancel="closeDrawer"
    />

    <VDivider />

    <VCard flat>
      <VCardText>
        <VRow>
          <VCol cols="12">
            <VTextField
              v-model="serviceFormData.title"
              label="Title"
              :error-messages="v$.title.$errors.map((e: any) => e.$message)"
              @input="v$.title.$touch"
            >
              <template #label>
                <span>Title</span>
                <span class="text-red">*</span>
              </template>
            </VTextField>
            <ValidationError
              :errors="errors"
              field="title"
              class="text-red"
            />
          </VCol>

          <VCol cols="12">
            <label class="mb-2 d-block">Description</label>
            <RichText
              v-model="serviceFormData.description"
              label=""
            />
          </VCol>
          <!-- Status -->
          <VCol cols="12">
            <VSwitch
              v-model="serviceFormData.is_active"
              :label="serviceFormData.is_active ? 'Active' : 'Inactive'"
              color="primary"
            />
          </VCol>
          <VCol
            v-if="existingIconUrl || newIconPreviewUrl"
            cols="12"
          >
            <label class="mb-2 d-inline-block">Icon preview</label>
            <div class="d-flex align-center">
              <VAvatar
                size="64"
                rounded="lg"
              >
                <VImg
                  :src="newIconPreviewUrl || existingIconUrl"
                  alt="Service icon preview"
                />
              </VAvatar>
            </div>
          </VCol>
          <VCol cols="12">
            <VFileInput
              v-model="serviceFormData.icon"
              label="Icon"
              accept="image/*, .svg"
              show-size
              truncate-length="15"
              prepend-icon=""
              prepend-inner-icon="ri-image-line"
              clear-icon="ri-close-circle-line"
              :error-messages="v$.icon.$errors.map((e: any) => e.$message)"
              @change="v$.icon.$touch"
            >
              <template #label>
                <span>Image</span>
                <span class="text-red">*</span>
              </template>
            </VFileInput>
            <ValidationError
              :errors="errors"
              field="icon"
              class="text-red"
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
          @click="handleSubmit"
        >
          {{ isEditMode ? 'Update' : 'Save' }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VNavigationDrawer>
</template>
