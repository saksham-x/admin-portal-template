<script setup lang="ts">
import MenuItemService from '@/services/cms/menu/items/MenuItemService'
import MenuItemForm from './MenuItemForm.vue'
import type { MenuItem } from '@/types/cms/menu/items/MenuItems'
import MenuService from '@/services/cms/menu/MenuService'

const route = useRoute()
const menuId = computed(() => Number(route.params.menuId))

// Services
const menuItemService = new MenuItemService()
const menuService = new MenuService()

// Globals
const $confirm = useConfirm()

// Drawer + ref
const isDrawerVisible = ref(false)
const menuItemFormRef = ref()

// List state
const isLoading = ref(true)
const menuItems = ref<MenuItem[]>([])

// Search
const searchQuery = ref({
  title: '',
  active: true as boolean | null,

})

// Tab title
const routeTabTitle = ref('Menu items')
const menuName = ref<string>('')

// Table headers
const tableHeaders = ref([
  { title: 'Title', label: 'title' },
  { title: 'Type', label: 'type' },
  { title: 'Dispaly in webiste', label: 'display_on_website' },
  { title: 'Status', label: 'status' },
  { title: 'Actions', label: 'actions' },
])

const statusOptions = [
  { title: 'Active', value: true },
  { title: 'Inactive', value: false },
]

const getMenuDetails = async () => {
  try {
    const response = await menuService.show(menuId.value)

    menuName.value = response.data.title
    routeTabTitle.value = response.data.title
  } catch (err) {
    showError(err)
    routeTabTitle.value = 'Menu items'
  }
}

const getAllMenuItems = async () => {
  isLoading.value = true
  try {
    const params: { title?: string; active?: number } = {}

    if (searchQuery.value.title?.trim()) {
      params.title = searchQuery.value.title.trim()
    }

    if (searchQuery.value.active !== null) {
      params.active = searchQuery.value.active ? 1 : 0
    }
    const response = await menuItemService.list(menuId.value, params)

    menuItems.value = response.data || []
  } catch (err) {
    showError(err)
  } finally {
    isLoading.value = false
  }
}

const performSearch = () => {
  getAllMenuItems()
}

// Edit
const editMenuItem = (item: MenuItem) => {
  isDrawerVisible.value = true
  menuItemFormRef.value?.edit(item)
}

// Delete
const deleteMenuItem = (id: number) => {
  $confirm?.({
    message: 'Are you sure you want to delete this menu item?',
    button: { yes: 'Yes', no: 'No' },
    callback: async ok => {
      if (!ok) return
      try {
        const res = await menuItemService.destroy(menuId.value, id)

        showSuccess(res?.message || 'Menu item deleted successfully')
        getAllMenuItems()
      } catch (err) {
        showError(err)
      }
    },
  })
}

// Sort
const handleSort = async (sorted: MenuItem[]) => {
  try {
    const { status } = await menuItemService.sortItems(menuId.value, sorted)
    if (status === 'OK') {
      showSuccess('Menu items sorted successfully')
      getAllMenuItems()
    }
  } catch (err) {
    showError(err)
  }
}

onMounted(() => {
  getMenuDetails()
  getAllMenuItems()
})

defineExpose({ routeTabTitle })
</script>

<template>
  <section>
    <!-- Header Section -->
    <VCardText class="d-flex justify-space-between">
      <VCardTitle>{{ menuName }} items</VCardTitle>

      <div class="d-flex flex-row-reverse justify-right">
        <div class="mx-2">
          <VBtn @click="isDrawerVisible = true">
            Add menu item
          </VBtn>
        </div>
      </div>
    </VCardText>

    <!-- Menu Items List -->
    <VCard
      flat
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
              v-model="searchQuery.active"
              label="Status"
              :items="statusOptions"
              clearable
              clear-icon="ri-close-line"
              @keyup.enter="performSearch"
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
        :data="menuItems"
        :loading="isLoading"
        :paginate="false"
        draggable-sort
        @sort-items="handleSort"
      >
        <template #title="{ row: item }">
          <span class="text-bold">
            <VIcon icon="ri-expand-up-down-line" />
            <span
              class="cursor-pointer title-hover"
              @click="editMenuItem(item)"
            > {{ item.title }} </span>
          </span>
        </template>

      
        <template #type="{ row: item }">
          <VChip
            size="small"
            :color="item.type === 'Page' ? 'primary' : item.type === 'Blog' ? 'secondary' : 'info'"
            class="text-capitalize"
          >
            {{ item.type || 'Page' }}
          </VChip>
        </template>
        <template #display_on_website="{ row: item }">
          <!--
            <span class="text-body-2">
            {{ item.display_on_website ? 'Yes' : 'No' }}
            </span> 
          -->
          <VChip
            size="small"
            :color="item.display_on_website ? 'success' : 'error'"
            class="text-capitalize"
          >
            {{ item.display_on_website ? 'Yes' : 'No' }}
          </VChip>
        </template>

        <template #source="{ row: item }">
          <span class="text-body-2">
            {{ item.page || item.blog || '-' }}
          </span>
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
                  @click="editMenuItem(item)"
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
                  @click="deleteMenuItem(item.id)"
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
    <MenuItemForm
      ref="menuItemFormRef"
      v-model:is-drawer-open="isDrawerVisible"
      :menu-id="menuId"
      @refresh="getAllMenuItems"
    />
  </section>
</template>

<style scoped>
.title-hover {
  transition: color 0.5s ease;
  color: rgb(104, 104, 234);
}
</style>