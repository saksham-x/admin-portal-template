<script setup lang="ts">
import EmailTemplateService from '@/services/site-setting/email-template/EmailTemplateService'
import type { EmailTemplateRoleOption, EmailTemplateView } from '@/types/site-setting/EmailTemplate' 
import EmailTemplateForm from './EmailTemplateForm.vue'


const emailTemplateService = new EmailTemplateService()

const $confirm = useConfirm()

const emailTemplateFormRef = ref<InstanceType<typeof EmailTemplateForm> | null>(null)
const isDrawerVisible = ref(false)

const isLoading = ref(true)
const totalItems = ref(0)
const itemsPerPage = ref(0)
const currentPage = ref(1)
const templateList = ref<EmailTemplateView[]>([])

const roleOptionsRaw = ref<EmailTemplateRoleOption[]>([])

const roleOptions = computed(() =>
  roleOptionsRaw.value.map(([label, value]: EmailTemplateRoleOption) => ({
    label,
    value,
  })),
)

const selectedRole = ref<string | null>(null)

const searchQuery = ref({
  title: '',
  identifier: '',
  is_active: 1,
  limit: 25,
})

const tableHeaders = ref([
  {
    title: 'Title',
    label: 'title',
  },
  {
    title: 'Subject',
    label: 'subject',
  },
  {
    title: 'Identifier',
    label: 'identifier',
  },
  {
    title: 'Type',
    label: 'type',
  },
  {
    title: 'Status',
    label: 'status',
  },
  {
    title: 'Actions',
    label: 'actions',
  },
])

const statusOptions = [
  { title: 'Active', value: 1 },
  { title: 'Inactive', value: 0 },
]

const editTemplateItem = (item: EmailTemplateView) => {
  isDrawerVisible.value = true
  emailTemplateFormRef.value?.edit?.(item)
}

const selectRole = (roleValue: string) => {
  selectedRole.value = roleValue
  currentPage.value = 1
  getEmailTemplates()
}

const getRoles = async () => {
  try {
    const roles = await emailTemplateService.roles()

    roleOptionsRaw.value = roles


    if (!selectedRole.value && roleOptions.value.length > 0)
      selectedRole.value = roleOptions.value[0].value
  }
  catch (err) {
    console.error(err)
  }
}

const getEmailTemplates = async () => {
  isLoading.value = true
  try {
    const { data, meta } = await emailTemplateService.paginate(
      {
        title: searchQuery.value.title,
        identifier: searchQuery.value.identifier,
        is_active: searchQuery.value.is_active,
        role: selectedRole.value,
        limit: searchQuery.value.limit,
      },
      currentPage.value,
    )

    templateList.value = data
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
  getEmailTemplates()
}

const handleItemsPerPageChange = (n: number) => {
  itemsPerPage.value = n
  searchQuery.value.limit = n
  currentPage.value = 1
  getEmailTemplates()
}

const performSearch = () => {
  currentPage.value = 1
  getEmailTemplates()
}

const deleteTemplateItem = async (id: number) => {
  $confirm?.({
    message: 'Are you sure you want to delete this email template?',
    button: {
      no: 'No',
      yes: 'Yes',
    },
    callback: async (btn: boolean) => {
      if (btn) {
        try {
          await emailTemplateService.destroy(id)
          showSuccess('Email template deleted successfully')
          getEmailTemplates()
        }
        catch (err) {
          showError(err)
        }
      }
    },
  })
}

onMounted(async () => {
  await getRoles()
  await getEmailTemplates()
})
</script>

<template>
  <section>
    <!-- Top Actions -->
    <VCardText class="d-flex align-center justify-space-between">
      <div>
        <!-- Role Selector -->
        <VCardText class="pb-0">
          <div class="d-flex flex-column gap-4">
            <div class="text-subtitle-1" />
            <div class="d-flex flex-wrap gap-2 align-center">
              <span>
                Roles :
              </span>
              <VBtn
                v-for="role in roleOptions"
                :key="role.value"
                size="small"
                :variant="selectedRole === role.value ? 'flat' : 'outlined'"
                :color="selectedRole === role.value ? 'primary' : 'default'"
                @click="selectRole(role.value)"
              >
                {{ role.label }}
              </VBtn>
            </div>
          </div>
        </VCardText>
      </div>
      <!--
        <div class="d-flex flex-row-reverse justify-right">
        <div class="mx-2">
        <VBtn @click="openCreateForm">
        Add email template
        </VBtn>
        </div>
        </div> 
      -->
    </VCardText>

    <!-- Main Card -->
    <VCard
      flat
      title="Email templates"
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
              clearable
              clear-icon="ri-close-line"
              @keyup.enter="performSearch"
            />
          </VCol>

          <!--
            <VCol
            cols="12"
            md="4"
            >
            <VTextField
            v-model="searchQuery.identifier"
            label="Search by identifier"
            clearable
            clear-icon="ri-close-line"
            />
            </VCol> 
          -->

          <VCol
            cols="12"
            md="2"
          >
            <VSelect
              v-model="searchQuery.is_active"
              label="Status"
              :items="statusOptions"
              clearable
              clear-icon="ri-close-line"
            />
          </VCol>

          <VCol
            cols="12"
            md="2"
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
        items-per-page-dropdown-enabled
        :header="tableHeaders"
        :data="templateList"
        :items-per-page="itemsPerPage"
        :loading="isLoading"
        :total="totalItems"
        @page-change="handlePageChange"
        @on-items-per-page-change="handleItemsPerPageChange"
      >
        <!-- Title -->
        <template #title="{ row: item }">
          <span
            class="cursor-pointer title-hover"
            @click="editTemplateItem(item)"
          >{{ item.title }}</span>
        </template>

        <!-- Subject -->
        <template #subject="{ row: item }">
          <span>{{ item.subject || '-' }}</span>
        </template>

        <!-- Identifier -->
        <template #identifier="{ row: item }">
          <span>{{ item.identifier || '-' }}</span>
        </template>

        <!-- Type -->
        <template #type="{ row: item }">
          <span>{{ item.type || '-' }}</span>
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
                  @click="editTemplateItem(item)"
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
                  @click="deleteTemplateItem(item.id)"
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
    <EmailTemplateForm
      ref="emailTemplateFormRef"
      v-model:is-drawer-open="isDrawerVisible"
      @refresh="getEmailTemplates"
    />
  </section>
</template>

<style scoped>
.title-hover {
  transition: color 0.5s ease;
  color: rgb(104, 104, 234);
}
</style>