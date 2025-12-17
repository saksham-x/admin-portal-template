<script setup lang="ts">
import CustomTable from '@/views/components/table/CustomTable.vue'
import type { AdminUserView } from '@/types/adminUser/AdminUser'
import AdminUserService from '@/services/adminUser/AdminUserService'
import AdminUserForm from './AdminUserForm.vue'

// ========================================
// Services
// ========================================
const adminUserService = new AdminUserService()

// ========================================
// Composables
// ========================================
const $confirm = useConfirm()

// ========================================
// Refs - Component
// ========================================
const adminUserFormRef = ref()
const isDrawerVisible = ref(false)

// ========================================
// Refs - Data
// ========================================
const isLoading = ref(true)

const searchQuery = ref({
  name: '',
  is_active: 1,
  limit: 25,
})

// ========================================
// Table Configuration
// ========================================
const tableHeaders = ref([
  {
    title: 'Full name',
    label: 'full_name',
  },
  {
    title: 'Email',
    label: 'email',
  },
  {
    title: 'Mobile',
    label: 'mobile',
  },
  {
    title: 'User type',
    label: 'user_type',
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

const adminUserList = ref<AdminUserView[]>([])

// ========================================
// Methods
// ========================================
const editAdminUserItem = (item: AdminUserView) => {
  isDrawerVisible.value = true
  adminUserFormRef.value.edit(item)
}

const getAllAdminUsers = async () => {
  isLoading.value = true
  try {
    const res = await adminUserService.paginate({
      name: searchQuery.value.name,
      is_active: searchQuery.value.is_active,
    })

    adminUserList.value = res 

  }
  catch (err) {
    showError(err)
  }
  finally {
    isLoading.value = false
  }
}

const performSearch = () => {
  getAllAdminUsers()
}

const deleteAdminUserItem = async (id: number) => {
  $confirm?.({
    message: 'Are you sure you want to delete this admin user?',
    button: {
      no: 'No',
      yes: 'Yes',
    },
    callback: async (btn: boolean) => {
      if (btn) {
        try {
          await adminUserService.destroy(id)
          showSuccess('Admin user deleted successfully')
          getAllAdminUsers()
        }
        catch (err) {
          showError(err)
        }
      }
    },
  })
}

// ========================================
// Lifecycle Hooks
// ========================================
onMounted(() => {
  getAllAdminUsers()
})
</script>

<template>
  <!-- Admin User Management Component -->
  <section>
    <VCardText>
      <div class="d-flex flex-row-reverse justify-right">
        <div class="mx-2">
          <VBtn @click="isDrawerVisible = true">
            Add Admin User
          </VBtn>
        </div>
      </div>
    </VCardText>

    <VCard
      flat
      title="Admin users"
      class="mb-6"
    >
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="searchQuery.name"
              label="Search by name"
              placeholder="Search by name"
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
              placeholder="Select status"
              :items="[
                { title: 'Active', value: 1 },
                { title: 'Inactive', value: 0 },
              ]"
              clearable
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

      <CustomTable
        :header="tableHeaders"
        :data="adminUserList"
        :loading="isLoading"
        :paginate="false"
      >
        <!-- Full Name -->
        <template #full_name="{ row: item }">
          <span
            class="text-bold cursor-pointer title-hover"
            @click="editAdminUserItem(item)"
          >{{ item.full_name }}</span>
        </template>

        <!-- Email -->
        <template #email="{ row: item }">
          <span>{{ item.email || '-' }}</span>
        </template>

        <!-- Mobile -->
        <template #mobile="{ row: item }">
          <span>{{ item.mobile || '-' }}</span>
        </template>

        <!-- User Type -->
        <template #user_type="{ row: item }">
          <VChip
            v-if="item.user_type"
            size="small"
            color="primary"
          >
            {{ item.user_type }}
          </VChip>
          <span
            v-else
            class="text-disabled text-caption"
          >
            -
          </span>
        </template>

        <!-- Status -->
        <template #is_active="{ row: item }">
          <VChip
            :color="item.is_active ? 'success' : 'error'"
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
                  @click="editAdminUserItem(item)"
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
                  @click="deleteAdminUserItem(item.id)"
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

    <AdminUserForm
      ref="adminUserFormRef"
      v-model:is-drawer-open="isDrawerVisible"
      @refresh="getAllAdminUsers"
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