<script setup lang="ts">
import { urlRule } from '@/utils/urlRules'
import { NewsAndUpdate, NewsAndUpdateView } from '@/types/cms/news-and-update/NewsAndUpdate'
import { useVuelidate } from '@vuelidate/core'
import { helpers, required } from '@vuelidate/validators'
import NewsAndUpdateService from '@/services/cms/news-and-update/NewsAndUpdateService'
import ValidationError from '@/components/ValidationError.vue'


const props = defineProps<{ isDrawerOpen: boolean }>()

const emit = defineEmits<{
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'refresh'): void
}>()

const newsService = new NewsAndUpdateService()
const { errors } = useErrors()

const itemId = ref<number | null>(null)
const isEdit = ref(false)
const isSaving = ref(false)
const fileInputKey = ref(0)
const existingImage = ref<string | null>(null)
let lastObjectUrl: string | null = null

const form = reactive<NewsAndUpdate>({
  title: '',
  url: '',
  published_by: '',
  publish_date: '',
  social_share_image: null,
  is_active: true,
})

const requiredRule = helpers.withMessage('This field is required', required)

const rules = {
  title: { required: requiredRule },
  url: {
    required: requiredRule,
    urlRule,
  },
  publish_date: { required: requiredRule },
}

const v$ = useVuelidate(rules, form)

const resetForm = () => {
  Object.assign(form, {
    title: '',
    url: '',
    published_by: '',
    publish_date: '',
    social_share_image: null,
    is_active: true,
  })
  existingImage.value = null
  fileInputKey.value++

  if (lastObjectUrl) {
    URL.revokeObjectURL(lastObjectUrl)
    lastObjectUrl = null
  }

  nextTick(() => v$.value.$reset())
}

const closeDrawer = () => {
  emit('update:isDrawerOpen', false)
}

const createItem = async () => {
  isSaving.value = true
  try {
    await newsService.store(form)
    showSuccess('News/Update created successfully')
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
    await newsService.update(itemId.value, form)
    showSuccess('News/Update updated successfully')
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
  else await createItem()
}

const edit = (val: NewsAndUpdateView) => {
  isEdit.value = true
  itemId.value = val.id

  existingImage.value =
    (val as any).social_share_image_path?.thumb ||
    (val as any).social_share_image_path?.original ||
    null

  Object.assign(form, {
    title: val.title ?? '',
    url: val.url ?? '',
    published_by: val.published_by ?? '',
    publish_date: val.publish_date ?? '',
    social_share_image: null,
    is_active: Boolean(val.is_active),
  })

  nextTick(() => v$.value.$reset())
}

defineExpose({ edit })

watch(() => form.social_share_image, (f: File | null) => {
  if (lastObjectUrl) {
    URL.revokeObjectURL(lastObjectUrl)
    lastObjectUrl = null
  }

  if (f instanceof File) {
    const url = URL.createObjectURL(f)

    existingImage.value = url
    lastObjectUrl = url
  }
})

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
    :width="520"
    location="end"
    :model-value="props.isDrawerOpen"
    @update:model-value="(val: boolean) => emit('update:isDrawerOpen', val)"
  >
    <DrawerHeaderSection
      :title="isEdit ? 'Edit news/update' : 'Add news/update'"
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
            <ValidationError
              :errors="errors"
              field="title"
              class="text-red"
            />
          </VCol>

          <!-- URL -->
          <VCol cols="12">
            <VTextField
              v-model="form.url"
              :error-messages="v$.url.$errors.map((e: any) => e.$message)"
              @blur="v$.url.$touch"
            >
              <template #label>
                <span>URL</span>
                <span class="text-red ms-1">*</span>
              </template>
            </VTextField>
            <ValidationError
              :errors="errors"
              field="url"
              class="text-red"
            />
          </VCol>

          <!-- Publish date -->
          <!--
            <VCol cols="12">
            <VTextField
            v-model="form.publish_date"
            type="date"
            :error-messages="v$.publish_date.$errors.map((e: any) => e.$message)"
            @blur="v$.publish_date.$touch"
            >
            <template #label>
            <span>Publish date</span>
            <span class="text-red ms-1">*</span>
            </template>
            </VTextField>
            <ValidationError
            :errors="errors"
            field="publish_date"
            class="text-red"
            />
            </VCol> 
          -->
          <!-- Datepicker  -->
          <VCol
            cols="12"
            md="6"
          >
            <AppDatePicker
              v-model="form.publish_date"
              label="Publish date"
              placeholder="Select publish date"
              clearable
              :error-messages="v$.publish_date.$errors.map((e: any) => e.$message)"
              @update:model-value="v$.publish_date.$touch()"
              @blur="v$.publish_date.$touch()"
            >
              <template #label>
                <span>Publish date</span>
                <span class="text-red">*</span>
              </template>
            </AppDatePicker>
            <ValidationError
              :errors="errors"
              field="publish_date"
              class="text-red"
            />
          </VCol>

          <!-- Existing image (if any) -->
          <VCol
            v-if="existingImage"
            cols="12"
          >
            <label class="mb-2 d-inline-block">Current social share image</label>
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

          <!-- Upload image -->
          <VCol cols="12">
            <VFileInput
              :key="fileInputKey"
              v-model="form.social_share_image"
              label="Social share image"
              accept="image/*"
              prepend-icon=""
              prepend-inner-icon="ri-image-add-line"
              show-size
            />
            <ValidationError
              :errors="errors"
              field="social_share_image"
              class="text-red"
            />
          </VCol>

          <!-- Status -->
          <VCol cols="12">
            <label class="mb-1 d-block">Status</label>
            <VSwitch
              v-model="form.is_active"
              :label="form.is_active ? 'Active' : 'Inactive'"
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