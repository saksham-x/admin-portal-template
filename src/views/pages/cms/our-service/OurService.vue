<script setup lang="ts">
import type { OurService } from '@/types/cms/our-service/OurService'
import OurServiceService from '@/services/cms/our-service/OurServiceService'
import OurServiceForm from './OurServiceForm.vue'

const ourServiceService = new OurServiceService()

const $confirm = useConfirm()

const serviceFormRef = ref()
const isDrawerVisible = ref(false)

const isLoading = ref(true)

const searchQuery = ref({
  title: '',
  is_active: true as boolean | null,
})

const tableHeaders = ref([
  {
    title: 'Title',
    label: 'title',
  },
  {
    title: 'Image',
    label: 'icon',
  },
  {
    title: 'Status',
    label: 'is_active',
  },

  {
    title: 'Actions',
    label: 'actions',
  },
])

const serviceList = ref<OurService[]>([])

const editServiceItem = (item: OurService) => {
  isDrawerVisible.value = true
  serviceFormRef.value.edit(item)
}

const getAllServices = async () => {
  isLoading.value = true
  try {
    const { data } = await ourServiceService.list(searchQuery.value)

    serviceList.value = data

  }
  catch (err) {
    showError(err)
  }
  finally {
    isLoading.value = false
  }
}



const performSearch = () => {
  getAllServices()
}

const deleteServiceItem = async (id: number) => {
  $confirm?.({
    message: 'Are you sure you want to delete this service?',
    button: { no: 'No', yes: 'Yes' },
    callback: async (ok: boolean) => {
      if (!ok) return
      try {
        const { status } = await ourServiceService.destroy(id)
        if (status === 'OK') {
          showSuccess('Service deleted successfully')
          getAllServices()
        }
      } catch (err) {
        showError(err)
      }
    },
  })
}

const handleSortItems = async (sorted: OurService[]) => {
  try {
    const { status } = await ourServiceService.sortItems(sorted)
    if (status === 'OK') {
      showSuccess('Services sorted successfully')
      getAllServices()
    }
  } catch (err) {
    showError(err)
  }
}

onMounted(() => {
  getAllServices()
})
</script>

<template>
  <section>
    <VCardText>
      <div class="d-flex flex-row-reverse justify-right">
        <div class="mx-2">
          <VBtn @click="isDrawerVisible = true">
            Add Service
          </VBtn>
        </div>
      </div>
    </VCardText>

    <VCard
      flat
      title="Our services"
      class="mb-6"
    >
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
              placeholder="Select status"
              :items="[
                { title: 'All', value: null },
                { title: 'Active', value: true },
                { title: 'Inactive', value: false },
              ]"
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

      <CustomTable
        :header="tableHeaders"
        :data="serviceList"
        :loading="isLoading"
        :paginate="false"
        draggable-sort
        @sort-items="handleSortItems"
      >
        <!-- Title -->
        <template #title="{ row: item }">
          <VIcon
            size="24"
            icon="ri-expand-up-down-line"
          />
          <span
            class="text-bold cursor-pointer title-hover"
            @click="editServiceItem(item)"
          >{{ item.title }}</span>
        </template>

        <!-- Icon -->
        <template #icon="{ row: item }">
          <VAvatar
            v-if="item.icon_image_path"
            size="40"
            rounded="lg"
          >
            <VImg
              :src="item.icon_image_path.thumb || item.icon_image_path.original"
              alt="Service icon"
            />
          </VAvatar>

          <span
            v-else
            class="text-disabled text-caption"
          >
            No icon
          </span>
        </template>

        <!-- Status -->
        <template #is_active="{ row: item }">
          <VChip
            :color="isActiveStatus(item.is_active)"
            size="small"
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
                  @click="editServiceItem(item)"
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
                  @click="deleteServiceItem(item.id)"
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

    <OurServiceForm
      ref="serviceFormRef"
      v-model:is-drawer-open="isDrawerVisible"
      @refresh="getAllServices"
    />
  </section>
</template>

<style scoped>
.title-hover {
  transition: color 0.5s ease;
  color: rgb(104, 104, 234);
}
</style>
