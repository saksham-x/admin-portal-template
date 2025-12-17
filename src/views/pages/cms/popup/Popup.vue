<script setup lang="ts">
import PopupService from '@/services/cms/popup/PopupService'
import { Popup, PopupView } from '@/types/cms/popup/Popup'
import PopupForm from './PopupForm.vue'

// Services
const popupService = new PopupService()
const $confirm = useConfirm()

// Drawer + form ref
const isDrawerVisible = ref(false)
const popupFormRef = ref()

// Table / list state
const isLoading = ref(true)
const popupList = ref<PopupView[]>([])  
const currentPage = ref(1)

// Filters
const searchQuery = ref({
  title: '',
  is_active: 1,
})

// Table headers
const tableHeaders = ref([  
  { title: 'Title', label: 'title' },
  { title: 'Image', label: 'image' },
  { title: 'Status', label: 'status' },
  { title: 'Duration', label: 'duration' },
  { title: 'Actions', label: 'actions' },
])

const statusOptions = [ 
  { title: 'Active', value: 1 },
  { title: 'Inactive', value: 0 },
]

// Fetch list
const getAllPopups = async () => {  
  isLoading.value = true
  try {
    const { data } = await popupService.list(searchQuery.value) 

    popupList.value = data
  } catch (err) {
    showError(err)
  } finally {
    isLoading.value = false
  }
}

// Events
const performSearch = () => {
  currentPage.value = 1
  getAllPopups()
}

const editPopup = (item: PopupView) => {
  isDrawerVisible.value = true
  popupFormRef.value.edit(item)
}

const deletePopup = async (id: number) => {
  $confirm?.({
    message: 'Are you sure you want to delete this popup?',
    button: { no: 'No', yes: 'Yes' },
    callback: async (ok: boolean) => {  
      if (!ok) return 
      try {
        const { status } = await popupService.destroy(id)
        if (status === 'OK') {
          showSuccess('Popup deleted successfully')
          getAllPopups()
        }
      } catch (err) {
        showError(err)
      }
    },
  })
}

const handleSort = async (sorted: Popup[]) => {
  try {
    const { status } = await popupService.sortItem(sorted)
    if (status === 'OK') {
      showSuccess('Popups sorted successfully')
      getAllPopups()
    }
  } catch (err) {
    showError(err)
  }
}

// Lifecycle
onMounted(getAllPopups)
</script>

<template>
  <section>
    <!-- Header -->
    <VCardText>
      <div class="d-flex flex-row-reverse">
        <VBtn @click="isDrawerVisible = true">
          Add popup
        </VBtn>
      </div>
    </VCardText>

    <!-- List card -->
    <VCard
      flat
      title="Popups"
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
        :data="popupList"
        :loading="isLoading"
        draggable-sort
        :paginate="false"
        @sort-items="handleSort"
      >
        <template #title="{ row: item }">
          <div class="d-flex align-center">
            <VIcon
              icon="ri-expand-up-down-line"
              class="me-3"
            />
            <span
              class="cursor-pointer title-hover"
              @click="editPopup(item)"
            >
              {{ item.title }}
            </span>
          </div>
        </template>

        <template #image="{ row: item }">
          <VAvatar
            v-if="item.image_path?.thumb"
            size="42"
            rounded="lg"
            class="elevation-1"
            :image="item.image_path.thumb"
          />
          <span v-else>—</span>
        </template>

        <template #duration="{ row: item }">
          Start: {{ item.start_date_value }} 
          <br>
          End: {{ item.end_date_value }}
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
                  @click="editPopup(item)"
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
                  @click="deletePopup(item.id)"
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
    <PopupForm
      ref="popupFormRef"
      v-model:is-drawer-open="isDrawerVisible"
      @refresh="getAllPopups"
    />
  </section>
</template>

<style scoped>
.title-hover {
  color: rgb(104, 104, 234);
  transition: color 0.5s ease;
}
</style>