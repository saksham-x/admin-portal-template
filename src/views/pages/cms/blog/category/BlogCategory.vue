<script setup lang="ts">
import BlogCategoryService from '@/services/cms/blog/category/BlogCategoryService'
import { BlogCategory } from '@/types/cms/blog/category/BlogCategory'
import BlogCategoryForm from './BlogCategoryForm.vue'

// Services
const blogCategoryService = new BlogCategoryService()
const $confirm = useConfirm()

// Drawer + form ref
const isDrawerVisible = ref(false)
const blogCategoryFormRef = ref()

// Table / list state
const isLoading = ref(true)
const categoryList = ref<BlogCategory[]>([])

// Filters
const searchQuery = ref({
  title: '',
  is_active: 1,
})

// Table headers
const tableHeaders = ref([
  { title: 'Title', label: 'title' },
  { title: 'Status', label: 'status' },
  { title: 'Actions', label: 'actions' },
])

const statusOptions = [
  { title: 'Active', value: 1 },
  { title: 'Inactive', value: 0 },
]

// Fetch list
const getAllCategories = async () => {
  isLoading.value = true
  try {
    const { data } = await blogCategoryService.paginate(searchQuery.value)

    categoryList.value = data
  } catch (err) {
    showError(err)
  } finally {
    isLoading.value = false
  }
}

// Events
const performSearch = () => {
  getAllCategories()
}

const editCategoryItem = (item: BlogCategory) => {
  isDrawerVisible.value = true
  blogCategoryFormRef.value?.edit(item)
}

const deleteCategoryItem = async (id: number) => {
  $confirm?.({
    message: 'Are you sure you want to delete this category?',
    button: { no: 'No', yes: 'Yes' },
    callback: async (ok: boolean) => {
      if (!ok) return
      try {
        const { status } = await blogCategoryService.destroy(id)
        if (status === 'OK') {
          showSuccess('Blog category deleted successfully')
          getAllCategories()
        }
      } catch (err) {
        showError(err)
      }
    },
  })
}

const handleSort = async (sorted: BlogCategory[]) => {
  try {
    const { status } = await blogCategoryService.sortItems(sorted)
    if (status === 'OK') {
      showSuccess('Categories sorted successfully')
      getAllCategories()
    }
  } catch (err) {
    showError(err)
  }
}

// Lifecycle
onMounted(getAllCategories)
</script>

<template>
  <section>
    <!-- Header -->
    <VCardText>
      <div class="d-flex flex-row-reverse">
        <VBtn @click="isDrawerVisible = true">
          Add category
        </VBtn>
      </div>
    </VCardText>

    <!-- List card -->
    <VCard
      flat
      title="Blog categories"
      class="mb-6"
    >
      <!-- Filters -->
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="4"
          >
            <VTextField 
              v-model="searchQuery.title" 
              label="Search by title" 
              placeholder="Search by title" 
              clearable
              clear-icon="ri-close-line" 
              @keyup.enter="performSearch" 
            />
          </VCol>

          <VCol
            cols="12"
            md="4"
          >
            <VSelect 
              v-model="searchQuery.is_active" 
              label="Status" 
              placeholder="Status" 
              :items="statusOptions"
              clearable 
              clear-icon="ri-close-line" 
            />
          </VCol>

          <VCol
            cols="12"
            md="4"
            class="d-flex align-end"
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

      <!-- Table -->
      <CustomTable 
        :header="tableHeaders" 
        draggable-sort 
        :data="categoryList" 
        :loading="isLoading" 
        :paginate="false"
        @sort-items="handleSort"
      >
        <template #title="{ row: item }">
          <div class="d-flex align-center">
            <VIcon
              icon="ri-expand-up-down-line"
              class="me-3"
            />
            <VAvatar 
              size="42" 
              rounded="lg" 
              class="elevation-1 me-3"
              :image="item.image_path?.thumb || item.image_path?.original || '/images/placeholder.png'" 
            />
            <span
              class="cursor-pointer title-hover"
              @click="editCategoryItem(item)"
            >
              {{ item.title }}
            </span>
          </div>
        </template>

        <template #parent="{ row: item }">
          <span>{{ item.parent_title || '-' }}</span>
        </template>

        <template #status="{ row: item }">
          <VChip 
            :color="isActiveStatus(item.is_active)" 
            size="small" 
            class="text-capitalize"
          >
            {{ item.is_active ? 'Active' : 'Inactive' }}
          </VChip>
        </template>

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
                  @click="editCategoryItem(item)"
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
                  @click="deleteCategoryItem(item.id)"
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

    <!-- Drawer form -->
    <BlogCategoryForm 
      ref="blogCategoryFormRef" 
      v-model:is-drawer-open="isDrawerVisible"
      @refresh="getAllCategories" 
    />
  </section>
</template>

<style scoped>
.title-hover {
  color: rgb(104, 104, 234);
  transition: color 0.5s ease;
}
</style>