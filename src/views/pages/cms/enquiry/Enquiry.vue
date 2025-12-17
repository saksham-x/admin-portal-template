<script setup lang="ts">
import type { EnquiryView } from '@/types/cms/enquiry/Enquiry'
import EnquiryService from '@/services/cms/enquiry/EnquiryService'

const enquiryService = new EnquiryService()
const $confirm = useConfirm()

// Refs - Component
const isLoading = ref(true)

// Refs - Pagination
const totalItems = ref(0)
const itemsPerPage = ref(0)
const currentPage = ref(1)

const searchQuery = ref({
  limit: 25,  
})


// Table Data
const enquiries = ref<EnquiryView[]>([])

// Table Headers
const headers = ref([
  { title: 'Name', label: 'name' },
  { title: 'Email', label: 'email' },
  { title: 'Message', label: 'message' },
  { title: 'Phone', label: 'phone' },
  { title: 'Received at', label: 'created_at' },
  { title: 'Actions', label: 'actions' },
])


const getEnquiries = async () => {
  isLoading.value = true
  try {
    const { data, meta } = await enquiryService.paginate(searchQuery.value, currentPage.value)  
    
    enquiries.value = data
    totalItems.value = meta.total
    currentPage.value = meta.current_page
    itemsPerPage.value = meta.per_page
    searchQuery.value.limit = meta.per_page 
  } catch (err) {
    showError(err)
  } finally {
    isLoading.value = false
  }
}

const onNextPageChange = (p: number) => {
  currentPage.value = p
  getEnquiries()
}

const onItemsPerPageChange = (n: number) => {
  itemsPerPage.value = n
  searchQuery.value.limit = n
  currentPage.value = 1
  getEnquiries()
}

// Delete
const deleteEnquiry = (id: number) => {
  $confirm?.({
    message: 'Are you sure you want to delete this enquiry?',
    button: { no: 'No', yes: 'Yes' },
    callback: async ok => {
      if (!ok) return
      try {
        const { status } = await enquiryService.destroy(id)
        if (status === 'SUCCESS') {
          showSuccess('Enquiry deleted successfully')
          getEnquiries()

        }
      } catch (err) {
        showError(err)
      }
    },
  })
}

onMounted(getEnquiries)
</script>

<template>
  <section>
    <VCard
      flat
      title="Enquiries"
      class="mb-6"
    >
      <!-- Show table while loading OR when there is data -->
      <CustomTable
        items-per-page-dropdown-enabled
        :header="headers"
        :data="enquiries"
        :items-per-page="itemsPerPage"
        :loading="isLoading"
        :total="totalItems"
        @page-change="onNextPageChange"
        @on-items-per-page-change="onItemsPerPageChange"
      >
        <!-- Name -->
        <template #name="{ row: item }">
          <span class="font-weight-medium">{{ item.name }}</span>
        </template>

        <!-- Email -->
        <template #email="{ row: item }">
          <a
            :href="`mailto:${item.email}`"
            class="text-primary"
          >
            {{ item.email }}
          </a>
        </template>

        <!-- Message -->
        <template #message="{ row: item }">
          <span class="text-body-2">{{ item.message }}</span>
        </template>

        <!-- Created At -->
        <template #created_at="{ row: item }">
          <span>{{ new Date(item.created_at).toLocaleString() }}</span>
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
                  @click="deleteEnquiry(item.id)"
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

      <!-- Empty state when NOT loading and no data -->
      <!--
        <VAlert
        v-else
        type="info"
        variant="tonal"
        class="ma-4"
        >
        No enquiries found
        </VAlert> 
      -->
    </VCard>
  </section>
</template>
