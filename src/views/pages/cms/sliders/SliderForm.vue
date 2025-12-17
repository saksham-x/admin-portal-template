<script setup lang="ts">
import { optionalUrlRule } from '@/utils/urlRules'
import SliderService from '@/services/cms/sliders/SlidersService'
import type { Slider, SliderView } from '@/types/cms/sliders/Sliders'
import { useVuelidate } from '@vuelidate/core'
import { helpers, required, requiredIf } from '@vuelidate/validators'
import RichText from '@/components/form/RichText.vue'


const props = defineProps<{ isDrawerOpen: boolean }>()

const emit = defineEmits<{
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'refresh'): void
}>()


const sliderService = new SliderService()


const itemId = ref<number | null>(null)
const isEdit = ref(false)
const isSaving = ref(false)
const fileInputKey = ref(0)
const existingImage = ref<string | null>(null)
const richTextKey = ref(0)
let lastObjectUrl: string | null = null

const form = reactive<Slider>({
  title: '',
  heading_text: '',
  sub_heading_text: '',
  description: '',
  button_text: '',
  show_button: true,
  link: '',
  image: null,
  new_tab: true,
  is_active: true,
})

const requiredRule = helpers.withMessage('This field is required', required)

const rules = {
  title: { required: requiredRule },
  link: { optionalUrlRule },
  image: { requiredIfCreating: requiredIf(() => !isEdit.value) },
}

const v$ = useVuelidate(rules, form)


const resetForm = () => {
  Object.assign(form, {
    title: '',
    heading_text: '',
    sub_heading_text: '',
    description: '',
    button_text: '',
    show_button: true,
    link: '',
    image: null,
    new_tab: true,
    is_active: true,
  })
  existingImage.value = null
  fileInputKey.value++
  richTextKey.value++

  if (lastObjectUrl) {
    URL.revokeObjectURL(lastObjectUrl)
    lastObjectUrl = null
  }

  nextTick(() => v$.value.$reset())
}

const closeDrawer = () => {
  emit('update:isDrawerOpen', false)
}


const createSlider = async () => {
  isSaving.value = true
  try {
    await sliderService.store(form)
    showSuccess('Slider created successfully')
    emit('refresh')
    closeDrawer()
  } catch (err) {
    showError(err)
  } finally {
    isSaving.value = false
  }
}

const updateItem = async () => {
  if (!itemId.value) return
  isSaving.value = true
  try {
    await sliderService.update(itemId.value, form)
    showSuccess('Slider updated successfully')
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

  if (isEdit.value) await updateItem()
  else await createSlider()
}

const edit = (val: SliderView) => {
  isEdit.value = true
  itemId.value = val.id

  existingImage.value = val.image_path?.thumb || val.image_path?.original || null

  Object.assign(form, {
    title: val.title ?? '',
    heading_text: val.heading_text ?? '',
    sub_heading_text: val.sub_heading_text ?? '',
    description: val.description ?? '',
    button_text: val.button_text ?? '',
    show_button: Boolean(val.show_button),
    link: val.link ?? '',
    image: null,
    new_tab: Boolean(val.new_tab),
    is_active: Boolean(val.is_active),
  })

  nextTick(() => v$.value.$reset())
}

defineExpose({ edit })

watch(
  () => form.image,
  (f: File | null) => {
    if (lastObjectUrl) {
      URL.revokeObjectURL(lastObjectUrl)
      lastObjectUrl = null
    }

    if (f instanceof File) {
      const url = URL.createObjectURL(f)

      existingImage.value = url
      lastObjectUrl = url
    }
  },
)

watch(
  () => props.isDrawerOpen,
  (isOpen: boolean) => {
    if (!isOpen && !isSaving.value) {
      setTimeout(() => {
        isEdit.value = false
        itemId.value = null
        resetForm()
      }, 300)
    }
  },
)

onBeforeUnmount(() => {
  if (lastObjectUrl) {
    URL.revokeObjectURL(lastObjectUrl)
  }
})
</script>

<template>
  <VNavigationDrawer
    temporary
    :width="560"
    location="end"
    :model-value="props.isDrawerOpen"
    @update:model-value="(val: boolean) => emit('update:isDrawerOpen', val)"
  >
    <DrawerHeaderSection
      :title="isEdit ? 'Edit slider' : 'Add slider'"
      @cancel="closeDrawer"
    />
    <VDivider />

    <VCard flat>
      <VCardText>
        <VRow>
          <!-- Title -->
          <VCol cols="12">
            <VTextField
              v-model="form.title"
              :error-messages="v$.title.$errors.map((e: any) => e.$message)"
              @blur="v$.title.$touch"
            >
              <template #label>
                <span>Title</span>
                <span class="text-red ms-1">*</span>
              </template>
            </VTextField>
          </VCol>

          <!-- Heading / Subheading -->
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="form.heading_text"
              label="Heading text"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="form.sub_heading_text"
              label="Sub heading text"
            />
          </VCol>

          <!-- Description -->
          <VCol cols="12">
            <label class="mb-2 d-block">Description</label>
            <RichText
              :key="richTextKey"
              v-model="form.description"
            />
          </VCol>

          <!-- Button text -->
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="form.button_text"
              label="Button text"
            />
          </VCol>

          <!-- Link -->
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="form.link"
              label="Link (URL)"
              placeholder="https://example.com"
              :error-messages="v$.link.$errors.map((e: any) => e.$message)"
              @blur="v$.link.$touch"
            />
          </VCol>

          <!-- Switches -->
          <VCol
            cols="12"
            md="6"
            class="d-flex align-center"
          >
            <VSwitch
              v-model="form.show_button"
              :label="form.show_button ? 'Show button: Yes' : 'Show button: No'"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
            class="d-flex align-center"
          >
            <VSwitch
              v-model="form.new_tab"
              :label="form.new_tab ? 'Open in new tab: Yes' : 'Open in new tab: No'"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
            class="d-flex align-center"
          >
            <VSwitch
              v-model="form.is_active"
              :label="form.is_active ? 'Status: Active' : 'Status: Inactive'"
            />
          </VCol>

          <!-- Existing image -->
          <VCol
            v-if="existingImage"
            cols="12"
          >
            <label class="mb-2 d-inline-block">Current image</label>
            <div class="d-flex align-center">
              <VAvatar
                size="64"
                rounded="lg"
              >
                <VImg
                  :src="existingImage"
                  alt="Current image"
                />
              </VAvatar>
            </div>
          </VCol>

          <!-- Upload -->
          <VCol cols="12">
            <VFileInput
              :key="fileInputKey"
              v-model="form.image"
              label="Upload image"
              accept="image/*"
              prepend-icon=""
              prepend-inner-icon="ri-image-add-line"
              show-size
              :error-messages="v$.image.$errors.map((e: any) => e.$message)"
              @change="v$.image.$touch"
            >
              <template #label>
                <span>Image</span>
                <span class="text-red ms-1">*</span>
              </template>
            </VFileInput>
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