<script setup lang="ts">
import { optionalUrlRule } from '@/utils/urlRules'
import { useVuelidate } from '@vuelidate/core'
import { helpers, required } from '@vuelidate/validators'
import MenuItemService from '@/services/cms/menu/items/MenuItemService'
import PageService from '@/services/cms/page/PageService'
import BlogService from '@/services/cms/blog/BlogService'
import type { MenuItem } from '@/types/cms/menu/items/MenuItems'
import type { Page } from '@/types/cms/page/Page'
import type { Blog } from '@/types/cms/blog/Blog'
import ValidationError from '@/components/ValidationError.vue'

// Props
interface Props {
  isDrawerOpen: boolean
  menuId: number
}
interface Emit {
  (e: 'update:isDrawerOpen', v: boolean): void
  (e: 'refresh'): void
}
const props = defineProps<Props>()
const emit = defineEmits<Emit>()
const { errors } = useErrors()

// Services
const menuItemService = new MenuItemService()
const pageService = new PageService()
const blogService = new BlogService()

// State
const isEditMode = ref(false)
const isSaving = ref(false)
const currentMenuItemId = ref<number | null>(null)

// Dropdown options
const pages = ref<Page[]>([])
const blogs = ref<Blog[]>([])

const menuItemForm = reactive<any>({
  title: '',
  item_type: 'Page',
  page_id: null,
  blog_id: null,
  link: '',
  new_tab: false,
  display_on_website: false,
  is_active: true,
})

watch(() => menuItemForm.item_type, (newType: any) => {
  if (newType === 'Page') {
    menuItemForm.blog_id = null
    menuItemForm.link = ''
  } else if (newType === 'Blog') {
    menuItemForm.page_id = null
    menuItemForm.link = ''
  } else if (newType === 'Custom') {
    menuItemForm.page_id = null
    menuItemForm.blog_id = null
  }
})

// Validation
const requiredRule = helpers.withMessage('This field is required', required)

const rules = computed(() => ({
  title: { required: requiredRule },
  item_type: { required: requiredRule },
  page_id: {
    required: helpers.withMessage('Page is required', (value: any) => {
      if (menuItemForm.item_type === 'Page') {
        return value != null
      }

      return true
    }),
  },
  blog_id: {
    required: helpers.withMessage('Blog is required', (value: any) => {
      if (menuItemForm.item_type === 'Blog') {
        return value != null
      }

      return true
    }),
  },
  link: {
    required: helpers.withMessage('Link is required', (value: any) => {
      if (menuItemForm.item_type === 'Custom') {
        return value != null && value !== ''
      }

      return true
    }),
    optionalUrlRule,
  },
}))

const v$ = useVuelidate(rules, menuItemForm)

const getDropdownData = async () => {
  try {
    const [pageRes, blogRes] = await Promise.all([
      pageService.list({}),
      blogService.paginate({}, 1),
    ])

    pages.value = pageRes.data || []
    blogs.value = blogRes.data || []
  } catch (err) {
    showError(err)
  }
}

// Reset
const resetForm = () => {
  isEditMode.value = false
  currentMenuItemId.value = null
  Object.assign(menuItemForm, {
    title: '',
    item_type: 'Page',
    page_id: null,
    blog_id: null,
    link: '',
    new_tab: false,
    display_on_website: false,
    is_active: true,
  })
  nextTick(() => v$.value.$reset())
}

const closeDrawer = () => {
  emit('update:isDrawerOpen', false)
  isEditMode.value = false
  currentMenuItemId.value = null
  resetForm()
}

const handleDrawerUpdate = (val: boolean) => {
  emit('update:isDrawerOpen', val)
}

// Watch drawer open
watch(
  () => props.isDrawerOpen,
  (newVal: any) => {
    if (newVal) {
      getDropdownData()
    }
  },
)

// Create
const createMenuItem = async () => {
  isSaving.value = true
  try {
    const payload: MenuItem = {
      title: menuItemForm.title,
      type: menuItemForm.item_type,
      page_id: menuItemForm.item_type === 'Page' ? menuItemForm.page_id : null,
      blog_id: menuItemForm.item_type === 'Blog' ? menuItemForm.blog_id : null,
      link: menuItemForm.item_type === 'Custom' ? menuItemForm.link : null,
      new_tab: menuItemForm.new_tab,
      display_on_website: menuItemForm.display_on_website,
      is_active: menuItemForm.is_active,
      position: null,
    }

    await menuItemService.store(props.menuId, payload)
    showSuccess('Menu item created successfully')
    emit('refresh')
    closeDrawer()
  } catch (err) {
    showError(err)
  } finally {
    isSaving.value = false
  }
}

// Update
const updateMenuItem = async () => {
  if (!currentMenuItemId.value) return
  isSaving.value = true
  try {
    const payload: MenuItem = {
      title: menuItemForm.title,
      type: menuItemForm.item_type,
      page_id: menuItemForm.item_type === 'Page' ? menuItemForm.page_id : null,
      blog_id: menuItemForm.item_type === 'Blog' ? menuItemForm.blog_id : null,
      link: menuItemForm.item_type === 'Custom' ? menuItemForm.link : null,
      new_tab: menuItemForm.new_tab,
      display_on_website: menuItemForm.display_on_website,
      is_active: menuItemForm.is_active,
      position: null,
    }

    await menuItemService.update(props.menuId, currentMenuItemId.value, payload)
    showSuccess('Menu item updated successfully')
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
  if (v$.value.$error) {
    setTimeout(() => v$.value.$reset(), 3000)
    
    return
  }
  if (isEditMode.value) await updateMenuItem()
  else await createMenuItem()
}

// Edit
const editMenuItem = (val: MenuItem) => {
  currentMenuItemId.value = val.id
  isEditMode.value = true

  let itemType = 'Page'
  if (val.blog_id) {
    itemType = 'Blog'
  } else if (!val.page_id && !val.blog_id && val.link) {
    itemType = 'Custom'
  }
  Object.assign(menuItemForm, {
    title: val.title,
    item_type: itemType,
    page_id: val.page_id,
    blog_id: val.blog_id,
    link: val.link || '',
    display_on_website: Boolean(val.display_on_website),
    new_tab: Boolean(val.new_tab),
    is_active: Boolean(val.is_active),
  })
}

defineExpose({ edit: editMenuItem })

watch(
  () => props.isDrawerOpen,
  (isOpen: boolean) => {
    if (!isOpen && !isSaving.value) {
      setTimeout(() => {
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
    @update:model-value="handleDrawerUpdate"
  >
    <DrawerHeaderSection
      :title="isEditMode ? 'Edit menu item' : 'Add menu item'"
      @cancel="closeDrawer"
    />

    <VDivider />

    <VCard flat>
      <VCardText>
        <VRow>
          <!-- Title -->
          <VCol cols="12">
            <VTextField
              v-model="menuItemForm.title"
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

          <!-- Item Type -->
          <VCol cols="12">
            <VSelect
              v-model="menuItemForm.item_type"
              :items="['Page', 'Blog', 'Custom']"
              :error-messages="v$.item_type.$errors.map((e: any) => e.$message)"
              @blur="v$.item_type.$touch"
            >
              <template #label>
                <span>Item type</span><span class="text-red">*</span>
              </template>
            </VSelect>
          </VCol>

          <!-- Page Selection -->
          <VCol
            v-if="menuItemForm.item_type === 'Page'"
            cols="12"
          >
            <VSelect
              v-model="menuItemForm.page_id"
              :items="pages"
              item-title="title"
              item-value="id"
              :error-messages="v$.page_id.$errors.map((e: any) => e.$message)"
              @blur="v$.page_id.$touch"
            >
              <template #label>
                <span>Select page</span><span class="text-red">*</span>
              </template>
            </VSelect>
          </VCol>

          <!-- Blog Selection  -->
          <VCol
            v-if="menuItemForm.item_type === 'Blog'"
            cols="12"
          >
            <VSelect
              v-model="menuItemForm.blog_id"
              :items="blogs"
              item-title="title"
              item-value="id"
              :error-messages="v$.blog_id.$errors.map((e: any) => e.$message)"
              @blur="v$.blog_id.$touch"
            >
              <template #label>
                <span>Select blog</span><span class="text-red">*</span>
              </template>
            </VSelect>
          </VCol>

          <!-- Link -->
          <VCol
            v-if="menuItemForm.item_type === 'Custom'"
            cols="12"
          >
            <VTextField
              v-model="menuItemForm.link"
              :error-messages="v$.link.$errors.map((e: any) => e.$message)"
              @blur="v$.link.$touch"
            >
              <template #label>
                <span>Link</span><span class="text-red">*</span>
              </template>
            </VTextField>
          </VCol>

          <!-- New Tab -->
          <VCol cols="12">
            <label>Open in new tab</label>
            <VSwitch
              v-model="menuItemForm.new_tab"
              :label="menuItemForm.new_tab ? 'Yes' : 'No'"
            />
          </VCol>

          <!-- Display on Website -->
          <VCol cols="12">
            <label>Display on website</label>
            <VSwitch
              v-model="menuItemForm.display_on_website"
              :label="menuItemForm.display_on_website ? 'Yes' : 'No'"
            />
          </VCol>

          <!-- Status -->
          <VCol cols="12">
            <label>Status</label>
            <VSwitch
              v-model="menuItemForm.is_active"
              :label="menuItemForm.is_active ? 'Active' : 'Inactive'"
            />
          </VCol>

          <!-- Actions -->
          <VCol
            cols="12"
            class="d-flex justify-end"
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