<script setup lang="ts">
import FAQForm from './FaqForm.vue'
import FAQService from '@/services/cms/faq/FaqService'
import type { Faq, FaqView } from '@/types/cms/faq/Faq'

// ========================================
// Services
// ========================================
const faqService = new FAQService()

// ========================================
// Composables
// ========================================
const $confirm = useConfirm()

// ========================================
// Refs - Component
// ========================================
const isDrawerVisible = ref(false)
const faqFormRef = ref()

// ========================================
// Refs - Data
// ========================================
const isLoading = ref(true)
const faqList = ref<Faq[]>([])

// ========================================
// Search Filters
// ========================================
const searchQuery = ref({
  title: '',
  is_active: 1,
})

// ========================================
// Table Configuration
// ========================================
const tableHeaders = ref([
  { title: 'Title', label: 'title' },
  { title: 'Category', label: 'faq_category' },
  { title: 'Status', label: 'status' },
  { title: 'Actions', label: 'actions' },

])

const statusOptions = [
  { title: 'Active', value: true },
  { title: 'Inactive', value: false },
]

// ========================================
// Methods
// ========================================
const editFaqItem = (item: Faq) => {
  isDrawerVisible.value = true
  faqFormRef.value.edit(item)
}

const getAllFaqs = async () => {
  isLoading.value = true
  try {
    const { data } = await faqService.list(searchQuery.value)

    faqList.value = data
  }
  catch (err) {
    showError(err)
  }
  finally {
    isLoading.value = false
  }
}

const performSearch = () => {
  getAllFaqs()
}

const handleSort = async(sorted: FaqView[]) => {
  try {
    const { status } = await faqService.sortItems(sorted)
    if (status === 'OK') {
      showSuccess('FAQs sorted successfully')
      getAllFaqs()
    }
  }
  catch (err) {
    showError(err)
  }
}

const deleteFaqItem = async (id: number) => {
  $confirm?.({
    message: 'Are you sure you want to delete this FAQ?',
    button: { no: 'No', yes: 'Yes' },
    callback: async (ok: boolean) => {
      if (!ok) return
      try {
        await faqService.destroy(id)
        showSuccess('FAQ deleted successfully')
        getAllFaqs()
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
onMounted(() => {
  searchQuery.value.is_active = true
  getAllFaqs()
})
</script>

<template>
  <section>
    <!-- Header Section -->
    <VCardText>
      <div class="d-flex flex-row-reverse justify-right">
        <!-- Add FAQ button -->
        <div class="mx-2">
          <VBtn @click="isDrawerVisible = true">
            Add FAQ
          </VBtn>
        </div>

        <!-- Navigate to FAQ Category -->
        <div class="mx-2">
          <VBtn
            color="secondary"
            variant="outlined"
            @click="$router.push({ name: 'cms-faq-category' })"
          >
            <VIcon
              start
              icon="ri-folder-line"
            />
            FAQ category
          </VBtn>
        </div>
      </div>
    </VCardText>

    <!-- FAQs List -->
    <VCard
      flat
      title="FAQs"
      class="mb-6"
    >
      <!-- Search Filters -->
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
              @keyup.enter="performSearch"
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

      <!-- Data Table -->
      <CustomTable
        :header="tableHeaders"
        :data="faqList"
        :loading="isLoading"
        :paginate="false"
        draggable-sort
        @sort-items="handleSort"
      >
        <template #title="{ row: item }">
          <span
            class="text-bold cursor-pointer title-hover"
            @click="editFaqItem(item)"
          >
            <VIcon
              size="small"
              icon="ri-expand-up-down-line"
            />
            {{ item.title }}
          </span>
        </template>

       
        <template #faq_category="{ row: item }">
          <span>{{ item.faq_category || '-' }}</span>
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
                  @click="editFaqItem(item)"
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
                  @click="deleteFaqItem(item.id)"
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
    <FAQForm
      ref="faqFormRef"
      v-model:is-drawer-open="isDrawerVisible"
      @refresh="getAllFaqs"
    />
  </section>
</template>

<style scoped>
.title-hover {
  color: rgb(104, 104, 234);
  transition: color 0.5s ease;
}
</style>
