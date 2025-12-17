<script setup lang="ts">
import { Popup, PopupView } from '@/types/cms/popup/Popup'
import { useVuelidate } from '@vuelidate/core'
import { helpers, required } from '@vuelidate/validators'
import PopupService from '@/services/cms/popup/PopupService'
import RichText from '@/components/form/RichText.vue'
import ValidationError from '@/components/ValidationError.vue'
import { optionalUrlRule } from '@/utils/urlRules'

const props = defineProps<Props>()
const emit = defineEmits<Emit>()


interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'refresh'): void
}

interface Props {
  isDrawerOpen: boolean
}

const popupService = new PopupService()
const { errors } = useErrors()


const popupId = ref<number | null>(null)
const isEdit = ref(false)
const isSaving = ref(false)
const richTextKey = ref(0)
const existingThumbUrl = ref<string | null>(null)

const popupForm = ref<Popup>({
  title: '',
  position: null,
  description: '',
  link: '',
  type: 'image',
  video_url: '',
  image: null,
  start_date: '',
  end_date: '',
  is_active: true,
})

const requiredRule = helpers.withMessage('This field is required', required)

const endDateAfterStart = helpers.withMessage(
  'End date must be after start date',
  (value: any, vm: any) => {
    const start = vm.start_date
    const end = value

    if (!start || !end) return true
    const s = new Date(start)
    const e = new Date(end)

    return e >= s
  },
)

const imageRequiredRule = helpers.withMessage(
  'Image is required',
  (value: any) => {
    if (popupForm.value.type !== 'image') return true
    if (isEdit.value && existingThumbUrl.value && !value) return true

    return !!value
  },
)

const linkRequiredRule = helpers.withMessage(
  'Link is required',
  (value: any) => {
    if (popupForm.value.type !== 'video') return true

    return !!value && String(value).trim().length > 0
  },
)

const descriptionRequiredRule = helpers.withMessage(
  'Description is required',
  (value: any) => {
    if (popupForm.value.type !== 'text') return true

    return !!value && String(value).trim().length > 0
  },
)

const rules = {
  title: { required: requiredRule },
  image: { imageRequiredRule },
  link: { optionalUrlRule, linkRequiredRule },
  description: { descriptionRequiredRule },
  start_date: {},
  end_date: { endDateAfterStart },
}

const v$ = useVuelidate(rules, popupForm)

const imagePreview = computed(() => {
  if (popupForm.value.image && popupForm.value.image instanceof File) {
    return URL.createObjectURL(popupForm.value.image)
  }
  
  return null
})

onUnmounted(() => {
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
  }
})


// ============== Utils ==============
const toDateInput = (v: any): string => {
  if (!v) return ''

  const s = String(v)

  if (/^\d{4}-\d{2}-\d{2}$/.test(s))
    return s

  if (/^\d{4}-\d{2}-\d{2}\s/.test(s))
    return s.slice(0, 10)

  return s.slice(0, 10)
}

const toBool = (v: any) => v === true || v === 1 || v === '1' || v === 'true'

const stripQuotes = (v: any) => {
  if (v == null) return v
  const s = String(v)

  return s.length >= 2 && s.startsWith('"') && s.endsWith('"') ? s.slice(1, -1) : s
}


// ============== Methods ==============
const resetForm = () => {
  existingThumbUrl.value = null
  popupForm.value = {
    title: '',
    position: null,
    description: '',
    link: '',
    type: '',
    video_url: '',
    location: '',
    show_location: '',
    image: null,
    start_date: '',
    end_date: '',
    is_active: true,
  }
  richTextKey.value++
}

const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)
}

const createPopup = async () => {
  try {
    isSaving.value = true
    await popupService.store(popupForm.value)
    showSuccess('Popup created successfully')
    emit('refresh')
    closeNavigationDrawer()
  } catch (err: any) {
    showError(err)
  } finally {
    isSaving.value = false
  }
}

const updatePopup = async () => {
  if (!popupId.value) return
  try {
    isSaving.value = true
    await popupService.update(popupId.value, popupForm.value)
    showSuccess('Popup updated successfully')
    emit('refresh')
    closeNavigationDrawer()
  } catch (err: any) {
    showError(err)
  } finally {
    isSaving.value = false
  }
}

const onSubmit = async () => {
  v$.value.$touch()
  if (v$.value.$error) {
    setTimeout(() => v$.value.$reset(), 3000)

    return
  } else {
    if (isEdit.value) await updatePopup()
    else await createPopup()

  }
}



const edit = (val: PopupView) => {
  isEdit.value = true
  popupId.value = val.id

  existingThumbUrl.value = val.image_path?.thumb ?? null

  Object.assign(popupForm.value, {
    title: stripQuotes(val.title) ?? '',
    position: (val as any).position ?? null,
    description: stripQuotes((val as any).description) ?? '',
    link: (val as any).link ?? '',
    type: stripQuotes((val as any).type) ?? '',
    video_url: (val as any).video_url ?? '',
    image: null,
    start_date: toDateInput((val as any).start_date),
    end_date: toDateInput((val as any).end_date),
    is_active: toBool((val as any).is_active),
  })

  nextTick(() => v$.value.$reset())
  emit('update:isDrawerOpen', true)
}


watch(
  () => popupForm.value.type,
  (newType: any) => {
    if (newType === 'image') {
      popupForm.value.video_url = ''
      popupForm.value.link = ''
      popupForm.value.description = ''
    } else if (newType === 'video') {
      popupForm.value.image = null
      popupForm.value.description = ''
    } else if (newType === 'text') {
      popupForm.value.image = null
      popupForm.value.video_url = ''
      popupForm.value.link = ''
    }
  },
)

watch(
  () => props.isDrawerOpen,
  (isOpen: boolean) => {
    if (!isOpen && !isSaving.value) {
      setTimeout(() => {
        isEdit.value = false
        popupId.value = null
        resetForm()
        nextTick(() => v$.value.$reset())
      }, 300)
    }
  },
)

defineExpose({ edit })
</script>

<template>
  <VNavigationDrawer
    temporary
    :width="520"
    location="end"
    :model-value="props.isDrawerOpen"
    @update:model-value="(val: boolean) => emit('update:isDrawerOpen', val)"
  >
    <DrawerHeaderSection
      :title="isEdit ? 'Edit popup' : 'Add popup'"
      @cancel="closeNavigationDrawer"
    />

    <VDivider />


    <VCard flat>
      <VCardText>
        <VRow>
          <!-- Title -->
          <VCol cols="12">
            <VTextField
              v-model="popupForm.title"
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

          <!-- Type -->

          <VCol cols="12">
            <VSelect
              v-model="popupForm.type"
              :items="[
                { title: 'Image', value: 'image' },
                { title: 'Video', value: 'video' },
                { title: 'Text', value: 'text' }
              ]"
              label="Type"
            />
          </VCol>

          <!-- Link -->
          <VCol
            v-if="popupForm.type === 'video'"
            cols="12"
          >
            <VTextField
              v-model="popupForm.link"
              placeholder="https://youtube.com/alajhfdf"
              :error-messages="v$.link.$errors.map((e: any) => e.$message)"
              @input="v$.link.$touch"
            >
              <template #label>
                <span>Link URL</span>
                <span class="text-red">*</span>
              </template>
            </VTextField>
          </VCol>

          <!-- Dates -->
          <!--
            <VCol
            cols="12"
            md="6"
            >
            <VTextField
            v-model="popupForm.start_date"
            label="Start date"
            type="date"
            />
            </VCol> 
          -->
          <VCol
            cols="12"
            md="6"
          >
            <AppDatePicker
              v-model="popupForm.start_date"
              label="Start date"
              clearable
              :error-messages="v$.start_date.$errors.map((e: any) => e.$message)"
              @update:model-value="v$.start_date.$touch()"
              @blur="v$.start_date.$touch()"
            />
          </VCol>

          <!--
            <VCol cols="12" md="6">
            <VTextField v-model="popupForm.end_date" label="End date" type="date"
            :error-messages="v$.end_date.$errors.map((e: any) => e.$message)" @input="v$.end_date.$touch" />
            </VCol> 
          -->
          <VCol
            cols="12"
            md="6"
          >
            <AppDatePicker
              v-model="popupForm.end_date"
              label="End date"
              clearable
              :error-messages="v$.end_date.$errors.map((e: any) => e.$message)"
              @update:model-value="v$.end_date.$touch()"
              @blur="v$.end_date.$touch()"
            />
          </VCol>
          <!-- Description -->
          <VCol
            v-if="popupForm.type === 'text'"
            cols="12"
          >
            <label class="mb-2 d-block">
              <span>Description</span>
              <span class="text-red">*</span>
            </label>
            <RichText
              :key="richTextKey"
              v-model="popupForm.description"
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
          </VCol>
          <!-- Existing Image Preview (edit only) -->
          <VCol
            v-if="existingThumbUrl && popupForm.type === 'image'"
            cols="12"
          >
            <label class="mb-2 d-inline-block">Current image</label>
            <div class="d-flex align-center">
              <VAvatar
                size="64"
                rounded="lg"
              >
                <VImg
                  :src="existingThumbUrl"
                  alt="Current image"
                />
              </VAvatar>
            </div>
          </VCol>

          <!-- Image Upload -->
          <VCol
            v-if="popupForm.type === 'image'"
            cols="12"
          >
            <VFileInput
              v-model="popupForm.image"
              accept="image/*"
              prepend-inner-icon="ri-image-add-line"
              show-size
              :error-messages="v$.image.$errors.map((e: any) => e.$message)"
              @change="v$.image.$touch"
            >
              <template #label>
                <span>Upload image</span>
                <span class="text-red">*</span>
              </template>
            </VFileInput>
          </VCol>
          <VCol
            v-if="imagePreview && popupForm.type === 'image'"
            cols="12"
          >
            <label class="mb-2 d-inline-block">Preview</label>
            <div class="d-flex align-center">
              <VAvatar
                size="64"
                rounded="lg"
              >
                <VImg
                  :src="imagePreview"
                  alt="Preview"
                />
              </VAvatar>
            </div>
          </VCol>
          <!-- Status -->
          <VCol
            cols="12"
            md="6"
          >
            <label for="status">Status</label>
            <VSwitch
              v-model="popupForm.is_active"
              :label="popupForm.is_active ? 'Active' : 'Inactive'"
            />
          </VCol>
        </VRow>
      </VCardText>

      <VCardActions>
        <VSpacer />

        <VBtn
          variant="text"
          color="error"
          @click="closeNavigationDrawer"
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
