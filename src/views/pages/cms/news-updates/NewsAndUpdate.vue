<script setup lang="ts">
import NewsAndUpdateService from '@/services/cms/news-and-update/NewsAndUpdateService'
import { NewsAndUpdateView } from '@/types/cms/news-and-update/NewsAndUpdate'
import NewsAndUpdateForm from './NewsAndUpdateForm.vue'


const newsService = new NewsAndUpdateService()
const $confirm = useConfirm()
const newsFormRef = ref()
const isDrawerVisible = ref(false)
const isLoading = ref(true)
const totalItems = ref(0)
const itemsPerPage = ref(0)
const currentPage = ref(1)
const newsList = ref<NewsAndUpdateView[]>([])

const searchQuery = ref({
  title: '',
  is_active: 1,
  limit: 25,
})

const headers = ref([
  { title: 'Title', label: 'title' },
  { title: 'Image', label: 'image' },
  { title: 'URL', label: 'url' },
  { title: 'Publish date', label: 'formatted_publish_date' },
  { title: 'Status', label: 'status' },
  { title: 'Actions', label: 'actions' },
])

const statusTypes = [
  { title: 'Active', value: 1 },
  { title: 'Inactive', value: 0 },
]

const editNewsItem = (item: NewsAndUpdateView) => {
  isDrawerVisible.value = true
  newsFormRef.value.edit(item)
}

const getAllNews = async () => {
  isLoading.value = true
  try {
    const { data, meta } = await newsService.paginate(searchQuery.value, currentPage.value)

    newsList.value = data
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
  getAllNews()
}

const handleItemsPerPageChange = (n: number) => {
  itemsPerPage.value = n
  searchQuery.value.limit = n
  currentPage.value = 1
  getAllNews()
}

const performSearch = () => {
  currentPage.value = 1
  getAllNews()
}

const deleteNewsItem = async (id: number) => {
  $confirm?.({
    message: 'Are you sure you want to delete this news/update?',
    button: { no: 'No', yes: 'Yes' },
    callback: async (btn: boolean) => {
      if (btn) {
        try {
          await newsService.destroy(id)
          showSuccess('News/Update deleted successfully')
          getAllNews()
        }
        catch (err) {
          showError(err)
        }
      }
    },
  })
}

onMounted(() => {
  getAllNews()
})
</script>

<template>
  <section>
    <!-- Action Buttons -->
    <VCardText>
      <div class="d-flex flex-row-reverse justify-right">
        <div class="mx-2">
          <VBtn @click="isDrawerVisible = true">
            Add news/update
          </VBtn>
        </div>
      </div>
    </VCardText>

    <!-- Table -->
    <VCard
      flat
      title="News & updates"
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
              :items="statusTypes"
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
        items-per-page-dropdown-enabled
        :header="headers"
        :data="newsList"
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
            @click="editNewsItem(item)"
          >{{
            String(item.title).replaceAll('"', '') }}</span>
        </template>

        <!-- Image -->
        <template #image="{ row: item }">
          <VAvatar
            size="36"
            rounded
          >
            <VImg
              :src="item.social_share_image_path?.thumb || item.social_share_image_path?.original"
              alt="thumb"
              cover
            />
          </VAvatar>
        </template>

        <!-- URL -->
        <template #url="{ row: item }">
          <a
            v-if="item.url"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary"
          >
            {{ item.url }}
          </a>
          <span v-else>—</span>
        </template>

        <!-- Publish Date -->
        <template #formatted_publish_date="{ row: item }">
          <span>{{ item.formatted_publish_date || item.publish_date || '-' }}</span>
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
                  @click="editNewsItem(item)"
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
                  @click="deleteNewsItem(item.id)"
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

    <!-- Drawer Form -->
    <NewsAndUpdateForm
      ref="newsFormRef"
      v-model:is-drawer-open="isDrawerVisible"
      @refresh="getAllNews"
    />
  </section>
</template>

<style scoped>
.title-hover {
  color: rgb(104, 104, 234);
  transition: color 0.5s ease;
}
</style>