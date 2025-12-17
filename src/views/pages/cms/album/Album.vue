<script setup lang="ts">
import AlbumForm from './AlbumForm.vue'
import AlbumService from '@/services/cms/album/AlbumService'
import type { AlbumView } from '@/types/cms/album/Album'

// Services
const albumService = new AlbumService()
const $confirm = useConfirm()

// Composables
const router = useRouter()

// Drawer + form ref
const isDrawerVisible = ref(false)
const albumFormRef = ref()

// Table / list state
const isLoading = ref(true)
const albumList = ref<AlbumView[]>([])

// Filters
const searchQuery = ref({
  title: '',
  is_active: 1,
})

// Table headers
const tableHeaders = ref([
  { title: 'Cover', label: 'cover' },
  { title: 'Title', label: 'title' },
  { title: 'Event date', label: 'formatted_event_date' },
  { title: 'Status', label: 'status' },
  { title: 'Actions', label: 'actions' },
])

const statusOptions = [
  { title: 'Active', value: 1 },
  { title: 'Inactive', value: 0 },
]

// Fetch list
const getAllAlbums = async () => {
  isLoading.value = true
  try {
    const { data } = await albumService.list(searchQuery.value)

    albumList.value = data
  } catch (err) {
    showError(err)
  } finally {
    isLoading.value = false
  }
}

// Events
const performSearch = () => {
  getAllAlbums()
}

const editAlbumItem = (item: AlbumView) => {
  isDrawerVisible.value = true
  albumFormRef.value.edit(item)
}

const deleteAlbumItem = async (id: number) => {
  $confirm?.({
    message: 'Are you sure you want to delete this album?',
    button: { no: 'No', yes: 'Yes' },
    callback: async (ok: boolean) => {
      if (!ok) return
      try {
        const { status } = await albumService.destroy(id)
        if (status === 'OK') {
          showSuccess('Album deleted successfully')
          getAllAlbums()
        }
      } catch (err) {
        showError(err)
      }
    },
  })
}

const handleSort = async (sorted: AlbumView[]) => {
  try {
    const { status } = await albumService.sortItems(sorted)
    if (status === 'OK') {
      showSuccess('Albums sorted successfully')
      getAllAlbums()
    }
  } catch (err) {
    showError(err)
  }
}

const goToAlbumValues = (albumId: number) => {
  router.push({ name: 'album-values', params: { id: albumId } })
}

// Lifecycle
onMounted(getAllAlbums)
</script>

<template>
  <section>
    <!-- Header -->
    <VCardText>
      <div class="d-flex flex-row-reverse">
        <VBtn @click="isDrawerVisible = true">
          Add album
        </VBtn>
      </div>
    </VCardText>

    <!-- List card -->
    <VCard
      flat
      title="Albums"
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
        :data="albumList"
        :loading="isLoading"
        :paginate="false"
        draggable-sort
        @sort-items="handleSort"
      >
        <template #cover="{ row: item }">
          <div class="d-flex align-center">
            <VIcon
              icon="ri-expand-up-down-line"
              class="me-3"
            />
            <VAvatar
              size="42"
              rounded="lg"
              class="elevation-1"
              :image="item.cover_image_path?.thumb || item.cover_image_path?.original || '/images/placeholder.png'"
            />
          </div>
        </template>

        <template #title="{ row: item }">
          <span
            class="cursor-pointer title-hover"
            @click="goToAlbumValues(item.id)"
          >
            {{ item.title }}
          </span>
        </template>

        <template #formatted_event_date="{ row: item }">
          <span>{{ item.formatted_event_date || '-' }}</span>
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
                  @click="editAlbumItem(item)"
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
                  @click="goToAlbumValues(item.id)"
                >
                  <template #prepend>
                    <VIcon
                      size="small"
                      icon="ri-image-line"
                    />
                  </template>
                  <VListItemTitle>Album values</VListItemTitle>
                </VListItem>

                <VListItem
                  link
                  @click="deleteAlbumItem(item.id)"
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
    <AlbumForm
      ref="albumFormRef"
      v-model:is-drawer-open="isDrawerVisible"
      @refresh="getAllAlbums"
    />
  </section>
</template>

<style scoped>
.title-hover {
  color: rgb(104, 104, 234);
  transition: color 0.5s ease;
}
</style>