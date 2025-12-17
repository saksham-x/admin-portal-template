<script setup lang="ts">
import { MenuView } from '@/types/cms/menu/Menu'
import MenuForm from './MenuForm.vue'
import MenuService from '@/services/cms/menu/MenuService'


const menuService = new MenuService()

const $confirm = useConfirm()

const router = useRouter()

const isDrawerVisible = ref(false)
const menuFormRef = ref()

const isLoading = ref(true)

const searchQuery = ref({
  title: '',
  is_active: true as boolean | null,
})

const menuList = ref<MenuView[]>([])

const tableHeaders = ref([
  { title: 'Title', label: 'title' },
  { title: 'Type', label: 'menu_type' },
  { title: 'Header', label: 'header' },
  { title: 'Status', label: 'status' },
  { title: 'Actions', label: 'actions' },
])

const statusOptions = [
  { title: 'Active', value: true },
  { title: 'Inactive', value: false },
]

const getAllMenus = async () => {
  isLoading.value = true
  try {
    const params: any = {}

    if (searchQuery.value.title?.trim()) {
      params.title = searchQuery.value.title.trim()
    }

    if (searchQuery.value.is_active !== null) {
      params.is_active = searchQuery.value.is_active ? 1 : 0
    }
    const { data } = await menuService.list(params)

    menuList.value = data
  }
  catch (err) {
    showError(err)
  }
  finally {
    isLoading.value = false
  }
}

const performSearch = () => {
  getAllMenus()
}

const handleSortMenus = async (sorted: MenuView[]) => {
  try {
    const { status } = await menuService.sortItems(sorted)

    if (status === 'OK') {
      showSuccess('Menus sorted successfully')
      getAllMenus()
    }
  }
  catch (err) {
    showError(err)
  }
}

const editMenuItem = (item: MenuView) => {
  isDrawerVisible.value = true
  menuFormRef.value?.edit(item)
}

const openMenuItems = (item: MenuView) => {
  router.push({ name: 'menu-items', params: { menuId: item.id } })
}

const deleteMenuItem = async (id: number) => {
  $confirm?.({
    message: 'Are you sure you want to delete this menu?',
    button: { no: 'No', yes: 'Yes' },
    callback: async (ok: boolean) => {
      if (!ok) return
      try {
        await menuService.destroy(id)
        showSuccess('Menu deleted successfully')
        getAllMenus()
      }
      catch (err) {
        showError(err)
      }
    },
  })
}


onMounted(getAllMenus)
</script>

<template>
  <section>
    <!--
      Header Section 
      <VCardText>
      <div class="d-flex flex-row-reverse justify-right">
      <div class="mx-2">
      <VBtn 
      :disabled="isMaxMenusReached"
      @click="isDrawerVisible = true"
      >
      Add menu
      </VBtn>
      </div>
      </div>
      </VCardText> 
    -->

    <!-- Menu List -->
    <VCard
      flat
      title="Menus"
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
        :data="menuList"
        :loading="isLoading"
        :paginate="false"
        draggable-sort
        @sort-items="handleSortMenus"
      >
        <template #title="{ row: item }">
          <span class="text-bold">
            <VIcon icon="ri-expand-up-down-line" />
            <span
              class="cursor-pointer title-hover"
              @click="openMenuItems(item)"
            > {{ item.title }} </span>
          </span>
        </template>

        <template #menu_type="{ row: item }">
          <span class="text-capitalize">
            {{ item.menu_type }}
          </span>
        </template>

        <template #header="{ row: item }">
          <VChip
            size="small"
            class="text-capitalize"
            :color="item.header ? 'secondary' : 'error'"
          >
            {{ item.header ? 'Yes' : 'No' }}
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
                  @click="openMenuItems(item)"
                >
                  <template #prepend>
                    <VIcon
                      size="small"
                      icon="ri-list-check"
                    />
                  </template>
                  <VListItemTitle>Menu Items</VListItemTitle>
                </VListItem>
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
    <MenuForm
      ref="menuFormRef"
      v-model:is-drawer-open="isDrawerVisible"
      @refresh="getAllMenus"
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