<script setup lang="ts">
import SliderForm from './SliderForm.vue'
import SliderService from '@/services/cms/sliders/SlidersService'
import type { SliderView } from '@/types/cms/sliders/Sliders'

const sliderService = new SliderService()
const $confirm = useConfirm()
const isDrawerVisible = ref(false)
const sliderFormRef = ref()

const isLoading = ref(true)
const sliderList = ref<SliderView[]>([])

const searchQuery = ref({
  title: '',
  is_active: 1,
})

const tableHeaders = ref([  
  { title: 'Title', label: 'title' },
  { title: 'Image', label: 'image' },
  { title: 'Link', label: 'link' },
  { title: 'Show button', label: 'show_button' },
  { title: 'New tab', label: 'new_tab' },
  { title: 'Status', label: 'status' },
  { title: 'Actions', label: 'actions' },
])

const statusOptions = [  
  { title: 'Active', value: 1 },
  { title: 'Inactive', value: 0 },
]

// Fetch list
const getAllSliders = async () => {  
  isLoading.value = true
  try {
    const { data } = await sliderService.list(searchQuery.value)

    sliderList.value = data
  } catch (err) {
    showError(err)
  } finally {
    isLoading.value = false
  }
}

// Events
const performSearch = () => { 
  getAllSliders()
}

const editSliderItem = (item: SliderView) => { 
  isDrawerVisible.value = true
  sliderFormRef.value.edit(item)
}

const deleteSliderItem = async (id: number) => { 
  $confirm?.({
    message: 'Are you sure you want to delete this slider?',
    button: { no: 'No', yes: 'Yes' },
    callback: async (ok: boolean) => {  
      if (!ok) return
      try {
        const { status } = await sliderService.destroy(id)
        if (status === 'OK') {
          showSuccess('Slider deleted successfully')
          getAllSliders()
        }
      } catch (err) {
        showError(err)
      }
    },
  })
}

const handleSort = async (sorted: SliderView[]) => {
  try {
    const { status } = await sliderService.sortItem(sorted)
    if (status === 'OK') {
      showSuccess('Sliders sorted successfully')
      getAllSliders()
    }
  } catch (err) {
    showError(err)
  }
}

// Lifecycle
onMounted(getAllSliders)
</script>

<template>
  <section>
    <!-- Header -->
    <VCardText>
      <div class="d-flex flex-row-reverse">
        <VBtn @click="isDrawerVisible = true">
          Add slider
        </VBtn>
      </div>
    </VCardText>

    <!-- List card -->
    <VCard
      flat
      title="Sliders"
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
        :data="sliderList"
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
              @click="editSliderItem(item)"
            >
              {{ item.title }}
            </span>
          </div>
        </template>

        <template #image="{ row: item }">
          <VAvatar
            size="42"
            rounded="lg"
            class="elevation-1"
            :image="item.image_path?.thumb || item.image_path?.original || '/images/placeholder.png'"
          />
        </template>

        <template #link="{ row: item }">
          <a
            v-if="item.link"
            :href="item.link"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary"
          >
            {{ item.link }}
          </a>
          <span v-else>—</span>
        </template>

        <template #show_button="{ row: item }">
          <VChip
            size="small"
            :color="isActiveStatus(item.show_button)"
          >
            {{ item.show_button ? 'Yes' : 'No' }}
          </VChip>
        </template>

        <template #new_tab="{ row: item }">
          <VChip
            size="small"
            :color="isActiveStatus(item.new_tab)"
          >
            {{ item.new_tab ? 'Yes' : 'No' }}
          </VChip>
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
                  @click="editSliderItem(item)"
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
                  @click="deleteSliderItem(item.id)"
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
    <SliderForm
      ref="sliderFormRef"
      v-model:is-drawer-open="isDrawerVisible"
      @refresh="getAllSliders"
    />
  </section>
</template>

<style scoped>
.title-hover {
  color: rgb(104, 104, 234);
  transition: color 0.5s ease;
}
</style>