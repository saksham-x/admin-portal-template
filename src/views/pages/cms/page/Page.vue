<script setup lang="ts">
import PageForm from './PageForm.vue'
import type { Page } from '@/types/cms/page/Page'
import PageService from '@/services/cms/page/PageService'

// Services
const pageService = new PageService()

// Composables
const $confirm = useConfirm()

// Refs
const pageFormRef = ref()
const isDrawerVisible = ref(false)
const isLoading = ref(true)
const pages = ref<Page[]>([])

// Search Query
const searchQuery = ref({
  title: '',
  is_active: 1,
})

// Table Configuration
const headers = ref([
  { title: 'Title', label: 'title' },
  { title: 'Status', label: 'status' },
  { title: 'Actions', label: 'actions' },
])

const statusTypes = [
  { title: 'Active', value: 1 },
  { title: 'Inactive', value: 0 },
]

// Methods
const getAllPages = async () => {
  isLoading.value = true
  try {
    const { data } = await pageService.list(searchQuery.value)

    pages.value = data
  } catch (err) {
    showError(err)
  } finally {
    isLoading.value = false
  }
}

const searchPages = () => {
  getAllPages()
}

const editPage = (item: Page) => {
  isDrawerVisible.value = true
  pageFormRef.value?.edit(item)
}

const deletePage = (id: number) => {
  $confirm?.({
    message: 'Are you sure you want to delete this page?',
    button: { no: 'No', yes: 'Yes' },
    callback: async (btn: boolean) => {
      if (btn) {
        try {
          const { status } = await pageService.destroy(id)
          if (status === 'OK') {
            showSuccess('Page deleted successfully')
            getAllPages()
          }
        } catch (err) {
          showError(err)
        }
      }
    },
  })
}

const handleSort = async (sorted: Page[]) => {
  try {
    const { status } = await pageService.sortItems(sorted)
    if (status === 'OK') {
      showSuccess('Pages sorted successfully')
      getAllPages()
    }
  } catch (err) {
    showError(err)
  }
}

// Lifecycle Hooks
onMounted(getAllPages)
</script>

<template>
  <section>
    <!-- Action Buttons -->
    <VCardText>
      <div class="d-flex flex-row-reverse">
        <VBtn @click="isDrawerVisible = true">
          Add Page
        </VBtn>
      </div>
    </VCardText>

    <VCard
      flat
      title="Pages"
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
              v-model="searchQuery.title"
              label="Search by title"
              placeholder="Search by title"
              clearable
              clear-icon="ri-close-line"
              @keyup.enter="searchPages"
            />
          </VCol>

          <VCol
            cols="12"
            md="4"
          >
            <VSelect
              v-model="searchQuery.is_active"
              :items="statusTypes"
              label="Status"
              placeholder="Status"
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
              @click="searchPages"
            >
              Search
            </SearchBtn>
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

      <!-- Data Table -->
      <CustomTable
        :header="headers"
        draggable-sort
        :data="pages"
        :loading="isLoading"
        :paginate="false"
        @sort-items="handleSort"
      >
        <template #title="{ row }">
          <span class="d-flex align-center">
            <VIcon
              icon="ri-expand-up-down-line"
              class="ma-2"
            />
            <span
              class="fw-medium cursor-pointer title-hover"
              @click="editPage(row)"
            >{{ row.title }}</span>
          </span>
        </template>

        <template #slug="{ row }">
          <span>{{ row.slug }}</span>
        </template>

        <template #status="{ row }">
          <VChip
            :color="isActiveStatus(row.is_active)"
            size="small"
          >
            {{ row.is_active ? 'Active' : 'Inactive' }}
          </VChip>
        </template>

        <template #actions="{ row }">
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
                  @click="editPage(row)"
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
                  @click="deletePage(row.id)"
                >
                  <template #prepend>
                    <VIcon
                      size="small"
                      icon="ri-delete-bin-7-line"
                      color="error"
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

    <!-- Page Form Drawer -->
    <PageForm
      ref="pageFormRef"
      v-model:is-drawer-open="isDrawerVisible"
      @refresh="getAllPages"
    />
  </section>
</template>

<style scoped>
.title-hover {
  transition: color 0.2s ease;
  color: rgb(104, 104, 234);
}
</style>