<script setup lang="ts">
import AlbumValueService from '@/services/cms/album/value/AlbumValueService'
import { AlbumValue } from '@/types/cms/album/value/AlbumValue'
import AlbumValueForm from './AlbumValueForm.vue'
import AlbumService from '@/services/cms/album/AlbumService'

// Service
const albumValueService = new AlbumValueService()
const albumService = new AlbumService()

// Router
const route = useRoute()
const albumId = computed(() => route.params.id as string | number)

// Composables
const $confirm = useConfirm()

// Drawer + ref
const isDrawerVisible = ref(false)
const albumValueFormRef = ref()

// List state
const isLoading = ref(true)
const albumValues = ref<AlbumValue[]>([])

// Album title state
const routeTabTitle = ref('Album items')
const albumTitle = ref<string | null>(null)

// Table headers
const tableHeaders = ref([
  { title: 'Image', label: 'image' },
  { title: 'Title', label: 'title' },
  { title: 'Featured', label: 'featured' },
  { title: 'Actions', label: 'actions' },
])

const getFeaturedColor = (v: boolean) => (v ? 'secondary' : 'error')


const getAlbumDetails = async () => {
  try {
    const response = await albumService.show(albumId.value) as any

    albumTitle.value = response.album.title
    routeTabTitle.value = response.album.title
  } catch (err) {
    showError(err)
    routeTabTitle.value = 'Album items'
  }
}

// Fetch list
const getAlbumValues = async () => {
  if (!albumId.value) return

  isLoading.value = true
  try {
    const { data } = await albumValueService.list(albumId.value)

    albumValues.value = data


  } catch (err) {
    showError(err)
  } finally {
    isLoading.value = false
  }
}

// Edit
const editAlbumValue = (item: AlbumValue) => {
  isDrawerVisible.value = true
  albumValueFormRef.value?.edit(item)
}

// Delete
const deleteAlbumValue = (id: number) => {
  if (!albumId.value) return

  $confirm?.({
    message: 'Are you sure you want to delete this album item?',
    button: { yes: 'Yes', no: 'No' },
    callback: async ok => {
      if (!ok) return
      try {
        const res = await albumValueService.destroy(albumId.value, id)

        showSuccess(res?.message || 'Album item deleted successfully')
        getAlbumValues()
      } catch (err) {
        showError(err)
      }
    },
  })
}

// Sort
const handleSort = async (sorted: any) => {
  if (!albumId.value) return

  try {
    const { status } = await albumValueService.sortItems(albumId.value, sorted)
    if (status === 'OK') {
      showSuccess('Album items sorted successfully')
      getAlbumValues()
    }
  } catch (err) {
    showError(err)
  }
}

onMounted(() => {
  getAlbumDetails()
  getAlbumValues()
})

defineExpose({ routeTabTitle })
</script>

<template>
  <section>
    <!-- Header / Add button -->
    <VCardText>
      <div class="d-flex justify-space-between align-center">
        <VCardTitle>{{ albumTitle }} items</VCardTitle>

        <VBtn @click="isDrawerVisible = true">
          Add item
        </VBtn>
      </div>
    </VCardText>

    <!-- List -->
    <VCard
      flat
      class="mb-6"
    >
      <CustomTable
        :header="tableHeaders"
        :data="albumValues"
        :loading="isLoading"
        :paginate="false"
        draggable-sort
        @sort-items="handleSort"
      >
        <!-- Image + drag handle -->
        <template #image="{ row }">
          <VIcon
            icon="ri-expand-up-down-line"
            class="me-2 align-self-center"
          />
          <VAvatar
            size="42"
            rounded="lg"
            class="elevation-1"
            :image="row.image_path?.thumb || row.image_path?.original || '/images/placeholder.png'"
          />
        </template>

        <!-- Title -->
        <template #title="{ row }">
          <span
            class="fw-medium cursor-pointer title-hover"
            @click="editAlbumValue(row)"
          >{{ row.title || '-' }}</span>
        </template>

        <!-- Featured -->
        <template #featured="{ row }">
          <VChip
            :color="getFeaturedColor(!!row.is_featured)"
            size="small"
          >
            {{ row.is_featured ? 'Featured' : 'Not featured' }}
          </VChip>
        </template>

        <!-- Actions -->
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
                  @click="editAlbumValue(row)"
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
                  @click="deleteAlbumValue(row.id)"
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
    <AlbumValueForm
      ref="albumValueFormRef"
      v-model:is-drawer-open="isDrawerVisible"
      :album-id="albumId"
      @refresh="getAlbumValues"
    />
  </section>
</template>

<style scoped>
.title-hover {
  transition: color 0.5s ease;
}

.title-hover {
  color: rgb(104, 104, 234);
}
</style>