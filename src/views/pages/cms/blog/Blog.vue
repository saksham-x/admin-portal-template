<script setup lang="ts">
import type { Blog } from '@/types/cms/blog/Blog'
import type { BlogCategory } from '@/types/cms/blog/category/BlogCategory'
import BlogService from '@/services/cms/blog/BlogService'
import BlogCategoryService from '@/services/cms/blog/category/BlogCategoryService'
import BlogForm from './BlogForm.vue'

// ========================================
// Services
// ========================================
const blogService = new BlogService()
const blogCategoryService = new BlogCategoryService()

// ========================================
// Composables
// ========================================
const $confirm = useConfirm()
const router = useRouter()

// ========================================
// Refs - Component
// ========================================
const blogFormRef = ref()
const isDrawerVisible = ref(false)

// ========================================
// Refs - Data
// ========================================
const isLoading = ref(true)
const totalItems = ref(0)
const itemsPerPage = ref(0)
const currentPage = ref(1)
const blogList = ref<Blog[]>([])
const categoryList = ref<BlogCategory[]>([])

// ========================================
// Search Filters
// ========================================
const searchQuery = ref({
  title: '',
  is_active: 1,
  limit: 25,
})

// ========================================
// Table Configuration
// ========================================
const tableHeaders = ref([
  {
    title: 'Title',
    label: 'title',
  },
  {
    title: 'Category',
    label: 'category',
  },
  {
    title: 'Publish date',
    label: 'formatted_publish_date',
  },
  {
    title: 'Status',
    label: 'status',
  },
  {
    title: 'Actions',
    label: 'actions',
  },
])

const statusOptions = [
  { title: 'Active', value: 1 },
  { title: 'Inactive', value: 0 },
]

// ========================================
// Computed
// ========================================
const categoryNameById = computed<Record<number, string>>(() => {
  const map: Record<number, string> = {}
  for (const c of categoryList.value)
    map[c.id] = c.title

  return map
})


// ========================================
// Methods
// ========================================
const goToBlogCategories = () => {
  router.push({ name: 'cms-blog-category' })
}

const editBlogItem = (item: Blog) => {
  isDrawerVisible.value = true
  blogFormRef.value.edit(item)
}

const getAllCategories = async () => {
  try {
    const { data } = await blogCategoryService.paginate({})

    categoryList.value = data
  }
  catch (err) {
    console.error('Failed to fetch categories:', err)
  }
}

const getAllBlogs = async () => {
  isLoading.value = true
  try {

    const { data, meta } = await blogService.paginate(searchQuery.value, currentPage.value)

    blogList.value = data
    totalItems.value = meta.total
    currentPage.value = meta.current_page
    itemsPerPage.value = meta.per_page
    searchQuery.value.limit = meta.per_page
  }
  catch (err) {
    showError(err)
  }
  finally {
    isLoading.value = false
  }
}

const handlePageChange = (p: number) => {
  currentPage.value = p
  getAllBlogs()
}

const handleItemsPerPageChange = (n: number) => {
  itemsPerPage.value = n
  searchQuery.value.limit = n
  currentPage.value = 1
  getAllBlogs()
}

const performSearch = () => {
  currentPage.value = 1
  getAllBlogs()
}

const deleteBlogItem = async (id: number) => {
  $confirm?.({
    message: 'Are you sure you want to delete this blog?',
    button: {
      no: 'No',
      yes: 'Yes',
    },
    callback: async (btn: boolean) => {
      if (btn) {
        try {
          await blogService.destroy(id)
          showSuccess('Blog deleted successfully')

          getAllBlogs()
        }
        catch (err) {
          showError(err)
        }
      }
    },
  })
}

// ========================================
// Lifecycle Hooks
// ========================================
onMounted(async () => {
  await Promise.all([getAllCategories(), getAllBlogs()])
})
</script>

<template>
  <section>
    <VCardText>
      <div class="d-flex flex-row-reverse justify-right">
        <div class="mx-2">
          <VBtn @click="isDrawerVisible = true">
            Add blog
          </VBtn>
        </div>

        <div class="mx-2">
          <VBtn
            variant="outlined"
            color="secondary"
            @click="goToBlogCategories"
          >
            Blog categories
          </VBtn>
        </div>
      </div>
    </VCardText>


    <VCard
      flat
      title="Blogs"
      class="mb-6"
    >
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="searchQuery.title"
              label="Search by title"
              clearable
              clear-icon="ri-close-line"
              @keyup.enter="performSearch"
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <VSelect
              v-model="searchQuery.is_active"
              label="Status"
              :items="statusOptions"
              clearable
              clear-icon="ri-close-line"
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <SearchBtn
              :loading="isLoading"
              :disabled="isLoading"
              size="large"
              @click="performSearch"
            >
              Search
            </SearchBtn>
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

      <CustomTable
        items-per-page-dropdown-enabled
        :header="tableHeaders"
        :data="blogList"
        :items-per-page="itemsPerPage"
        :loading="isLoading"
        :total="totalItems"
        @page-change="handlePageChange"
        @on-items-per-page-change="handleItemsPerPageChange"
      >
        <!-- Title -->
        <template #title="{ row: item }">
          <span
            class="text-bold cursor-pointer title-hover"
            @click="editBlogItem(item)"
          >{{ item.title }}</span>
        </template>

        <!-- Publish Date -->
        <template #date="{ row: item }">
          <span>{{ item.formatted_publish_date || item.publish_date || '-' }}</span>
        </template>

        <!-- Category -->
        <template #category="{ row: item }">
          {{ categoryNameById[item.category_id] || '-' }}
        </template>

        <!-- Status -->
        <template #status="{ row: item }">
          <VChip
            :color="isActiveStatus(item.is_active)"
            size="small"
            class="text-capitalize"
          >
            {{ item.is_active ? 'Active' : 'Inactive' }}
          </VChip>
        </template>

        <!-- Actions -->
        <template #actions="{ row: item }">
          <IconBtn
            size="small"
            color="medium-emphasis"
          >
            <VIcon
              size="24"
              icon="ri-more-line"
            />

            <VMenu activator="parent">
              <VList>
                <VListItem
                  link
                  @click="editBlogItem(item)"
                >
                  <template #prepend>
                    <VIcon
                      size="small"
                      icon="ri-edit-line"
                    />
                  </template>
                  <VListItemTitle>Edit</VListItemTitle>
                </VListItem>

                <VListItem
                  link
                  @click="deleteBlogItem(item.id)"
                >
                  <template #prepend>
                    <VIcon
                      size="small"
                      color="error"
                      icon="ri-delete-bin-7-line"
                    />
                  </template>
                  <VListItemTitle class="text-error">
                    Delete
                  </VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </IconBtn>
        </template>
      </CustomTable>
    </VCard>

    <BlogForm
      ref="blogFormRef"
      v-model:is-drawer-open="isDrawerVisible"
      @refresh="getAllBlogs"
    />
  </section>
</template>

<style scoped>
.title-hover {
  color: rgb(104, 104, 234);
  transition: color 0.5s ease;
}
</style>
