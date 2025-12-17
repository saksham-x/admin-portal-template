<script setup lang="ts">
import FaqCategoryForm from './FaqCategoryForm.vue'
import FaqCategoryService from '@/services/cms/faq/category/FaqCategoryService'
import type { FaqCategory, FaqCategoryView } from '@/types/cms/faq/category/FaqCategory'

// ========================================
// Services
// ========================================
const faqCategoryService = new FaqCategoryService()

// ========================================
// Composables
// ========================================
const $confirm = useConfirm()

// ========================================
// Refs - Component
// ========================================
const isDrawerVisible = ref(false)
const faqCategoryFormRef = ref()

// ========================================
// Refs - Data
// ========================================
const isLoading = ref(true)


const searchQuery = ref({
  name: '',
  is_active: 1,
})



const categoryList = ref<FaqCategory[]>([])

// ========================================
// Table Configuration
// ========================================
const tableHeaders = ref([
  { title: 'Name', label: 'name' },
  { title: 'Status', label: 'status' },
  { title: 'Actions', label: 'actions' },
])

const statusOptions = [
  { title: 'Active', value: 1 },
  { title: 'Inactive', value: 0 },
]

// ========================================
// Methods
// ========================================
const getAllCategories = async () => {
  isLoading.value = true
  try {
    const { data } = await faqCategoryService.list(searchQuery.value)

    categoryList.value = data

  }
  catch (err) {
    showError(err)
  }
  finally {
    isLoading.value = false
  }
}

const performSearch = () => {
  getAllCategories()
}

const handleSortCategories = async(sorted: FaqCategoryView[]) => {
  try {
    const { status } = await faqCategoryService.sortItems(sorted)
    if (status === 'OK') {
      showSuccess('Faq categories sorted successfully')
      getAllCategories()
    }
  }
  catch (err) {
    showError(err)
  }
}


const editCategoryItem = (item: FaqCategory) => {
  isDrawerVisible.value = true
  faqCategoryFormRef.value?.edit(item)
}

const deleteCategoryItem = async (id: number) => {
  $confirm?.({
    message: 'Are you sure you want to delete this category?',
    button: { no: 'No', yes: 'Yes' },
    callback: async (ok: boolean) => {
      if (!ok) return
      try {
        await faqCategoryService.destroy(id)
        showSuccess('Category deleted successfully')
        getAllCategories()
      }
      catch (err) {
        showError(err)
      }
    },
  })
}

// ========================================
// Lifecycle Hooks
// ========================================
onMounted(getAllCategories)
</script>

<template>
  <!-- FAQ Category Management Component -->
  <section>
    <!-- Header Section -->
    <VCardText>
      <div class="d-flex flex-row-reverse justify-right">
        <div class="mx-2">
          <VBtn @click="isDrawerVisible = true">
            Add category
          </VBtn>
        </div>
      </div>
    </VCardText>

    <!-- FAQ Categories List -->
    <VCard
      flat
      title="FAQ categories"
      class="mb-6"
    >
      <!-- Search Filters -->
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="4"
          >
            <VTextField
              v-model="searchQuery.name"
              label="Search by name"
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
              :items="statusOptions"
              clearable
              clear-icon="ri-close-line"
            />
          </VCol>
          <VCol
            cols="12"
            md="4"
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

      <!-- Data Table -->
      <CustomTable
        :header="tableHeaders"
        :data="categoryList"
        :loading="isLoading"
        :paginate="false"
        draggable-sort
        @sort-items="handleSortCategories"
      >
        <template #name="{ row: item }">
          <span
            class="text-bold cursor-pointer title-hover"
            @click="editCategoryItem(item)"
          ><VIcon icon="ri-expand-up-down-line" />{{ item.name }}</span>
        </template>

        <!--
          <template #parent="{ row: item }">
          <span>{{ item.parent_name || '-' }}</span>
          </template> 
        -->

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

    <!-- Form Drawer -->
    <FaqCategoryForm
      ref="faqCategoryFormRef"
      v-model:is-drawer-open="isDrawerVisible"
      @refresh="getAllCategories"
    />
  </section>
</template>

<style scoped>
.title-hover {
  transition: color 0.5s ease;
  color: rgb(104, 104, 234);
}
</style>
