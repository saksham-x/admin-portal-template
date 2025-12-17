<script setup lang="ts">
import BlogService from '@/services/cms/blog/BlogService'
import BlogCategoryService from '@/services/cms/blog/category/BlogCategoryService'
import type { Blog } from '@/types/cms/blog/Blog'
import type { BlogCategory } from '@/types/cms/blog/category/BlogCategory'
import { useVuelidate } from '@vuelidate/core'
import { helpers, required } from '@vuelidate/validators'
import RichText from '@/components/form/RichText.vue'
import { Filepath } from '@/types/FilePath'
import ValidationError from '@/components/ValidationError.vue'
import { FULL_EDITOR_TOOLBAR } from '@/constants/editorConfig'
import AppDatePicker from '@/components/AppDatePicker.vue'

interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'refresh'): void
}

interface Props {
  isDrawerOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const blogService = new BlogService()
const blogCategoryService = new BlogCategoryService()


const { errors } = useErrors()


const blogId = ref<number | null>(null)
const isEdit = ref(false)
const loading = ref(false)
const categories = ref<BlogCategory[]>([])


const existingImagePath = ref<Filepath | null>(null)
const removeImage = ref(false)
const objectUrl = ref<string | null>(null)

const imagePreview = computed(() => {
  if (objectUrl.value) return objectUrl.value
  if (removeImage.value) return null
  if (existingImagePath.value) return existingImagePath.value.thumb || existingImagePath.value.original

  return null
})

const blog = ref({
  title: '',
  publish_date: '',
  content: '',
  seo_title: '',
  seo_keyword: [] as string[],
  seo_description: '',
  file: null as File | null,

  category_id: null as number | null,
  type: 'blog',
  is_active: true,
})


const requiredRule = helpers.withMessage('This field is required', required)

const handleImageChange = (files: File[] | File | null) => {
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value)
    objectUrl.value = null
  }

  // Handle array from VFileInput
  const file = Array.isArray(files) ? files[0] : files

  if (file) {
    objectUrl.value = URL.createObjectURL(file)
    removeImage.value = false
  }
}




const rules = {
  title: { required: requiredRule },
  category_id: { required: requiredRule },
  content: { required: requiredRule },
  publish_date: {
    required: requiredRule,
  },
}

const v$ = useVuelidate(rules, blog)

const normalizeId = (v: unknown) => (v == null ? null : Number(v))


const resetForm = () => {
  isEdit.value = false
  blogId.value = null
  blog.value = {
    title: '',
    publish_date: '',
    content: '',
    seo_title: '',
    seo_keyword: [],
    seo_description: '',
    file: null,
    remove_social_share_image: false,
    category_id: null,
    type: 'blog',
    is_active: true,
  }
  existingImagePath.value = null
  removeImage.value = false
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value)
    objectUrl.value = null
  }
  nextTick(() => {
    v$.value.$reset()
  })
}

const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)
  resetForm()
}

const getAllCategories = async () => {
  try {
    const { data } = await blogCategoryService.paginate({})

    categories.value = data
  }
  catch {
    showError('Failed to fetch blog categories')
  }
}

const createBlog = async () => {
  try {
    loading.value = true

    const { status } = await blogService.store(prepareDataForSubmit())
    if (status === 'OK') {
      showSuccess('Blog created successfully')
      emit('refresh')
      closeNavigationDrawer()
    }
  }
  catch (error) {
    showError(error)
  }
  finally {
    loading.value = false
  }
}

const updateBlog = async () => {
  if (blogId.value == null)
    return false

  try {
    loading.value = true

    const { status } = await blogService.update(blogId.value, prepareDataForSubmit())

    if (status === 'OK') {
      showSuccess('Blog updated successfully')
      emit('refresh')
      closeNavigationDrawer()
    }
  }
  catch (error) {
    showError(error)
  }
  finally {
    loading.value = false
  }
}


const onSubmit = async () => {
  v$.value.$touch()
  if (v$.value.$error) {
    setTimeout(() => v$.value.$reset(), 3000)

    return
  }

  // isEdit.value ? await updateBlog() : await createBlog()

  if (isEdit.value) await updateBlog()
  else await createBlog()

}

const handleDrawerModelValueUpdate = (val: boolean) => {
  emit('update:isDrawerOpen', val)

  if (!val && !loading.value) {
    setTimeout(() => {
      resetForm()
    }, 300)
  }
}

const editNavigationDrawer = async (val: Blog) => {
  isEdit.value = true
  blogId.value = val.id

  if (!categories.value.length)
    await getAllCategories()

  Object.assign(blog.value, {
    title: val.title ?? '',
    publish_date: val.publish_date ? val.publish_date.split(' ')[0] : '',
    content: val.content ?? '',
    seo_title: val.seo_title ?? '',
    seo_keyword: val.seo_keyword || [],
    seo_description: val.seo_description ?? '',
    file: null,
    category_id: normalizeId((val as any).category_id ?? (val as any)?.category?.id),
    type: val.type ?? 'blog',
    is_active: !!val.is_active,
  })

  nextTick(() => v$.value.$reset())
  existingImagePath.value = (val as any).image_path || null
  emit('update:isDrawerOpen', true)
}

const prepareDataForSubmit = () => {
  const data = {
    ...blog.value,
    file: Array.isArray(blog.value.file)
      ? blog.value.file[0] || null
      : blog.value.file,
    seo_keyword: Array.isArray(blog.value.seo_keyword)
      ? blog.value.seo_keyword.join(', ')
      : blog.value.seo_keyword,
  }



  return data
}

defineExpose({
  edit: editNavigationDrawer,
})



onMounted(() => {
  getAllCategories()
})

onBeforeUnmount(() => {
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value)
  }
})
</script>

<template>
  <VNavigationDrawer
    temporary
    :width="720"
    location="end"
    :model-value="props.isDrawerOpen"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <DrawerHeaderSection
      :title="isEdit ? 'Edit blog' : 'Add blog'"
      @cancel="closeNavigationDrawer"
    />

    <VDivider />


    <VCard flat>
      <VCardText>
        <VRow>
          <VCol cols="12">
            <VTextField
              v-model="blog.title"
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

          <VCol
            cols="12"
            md="6"
          >
            <VSelect
              v-model="blog.category_id"
              :items="categories"
              item-title="title"
              item-value="id"
              label="Category"
              clearable
              :error-messages="v$.category_id.$errors.map((e: any) => e.$message)"
              @update:model-value="v$.category_id.$touch"
            >
              <template #label>
                <span>Category</span>
                <span class="text-red">*</span>
              </template>
            </VSelect>
          </VCol>

          <!-- Datepicker  -->
          <VCol
            cols="12"
            md="6"
          >
            <AppDatePicker
              v-model="blog.publish_date"
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

          <!-- Date Picker Test  -->
          <!--
            <VCol cols="12" md="6">
            <AppDatePicker v-model="dateRange" label="Date Range" :config="{ mode: 'range' }" />
            <AppDatePicker v-model="dateTime" label="Date & Time"
            :config="{ enableTime: true, dateFormat: 'Y-m-d H:i' }" />
            <ValidationError :errors="errors" field="publish_date" class="text-red" />
            </VCol> 
          -->

          <VCol cols="12">
            <label class="mb-2 d-block">
              <span>Content</span>
              <span class="text-red">*</span>
            </label>
            <RichText
              v-model="blog.content"
              :toolbar="FULL_EDITOR_TOOLBAR"
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

          <VCol
            cols="12"
            md="6"
          >
            <label for="status">Status</label>
            <VSwitch
              v-model="blog.is_active"
              :label="blog.is_active ? 'Active' : 'Inactive'"
            />
          </VCol>
          <VCol cols="12">
            <VFileInput
              v-model="blog.file"
              label="Image"
              accept="image/*"
              show-size
              truncate-length="15"
              prepend-icon=""
              prepend-inner-icon="ri-image-line"
              clear-icon="ri-close-circle-line"
              @update:model-value="handleImageChange"
            />

            <ValidationError
              :errors="errors"
              field="image"
              class="text-red"
            />
            <div class="mt-3">
              <VImg
                v-if="imagePreview && !removeImage"
                :src="imagePreview"
                max-width="220"
                class="rounded-lg"
                cover
              />
            </div>
          </VCol>

          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="blog.seo_title"
              label="SEO title"
              placeholder="Enter SEO title"
            />
          </VCol>

          <VCol
            cols="12"
            md="6"
          >
            <VCombobox
              v-model="blog.seo_keyword"
              label="SEO keywords"
              placeholder="Type and press Enter to add keywords"
              chips
              multiple
              closable-chips
              clearable
            />
          </VCol>

          <VCol cols="12">
            <VTextarea
              v-model="blog.seo_description"
              label="SEO description"
              placeholder="Enter SEO description"
              rows="3"
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
          :loading="loading"
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

<style scoped>
.rich-text label {
  display: none !important;
}
</style>