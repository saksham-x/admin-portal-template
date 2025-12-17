<script setup lang="ts">
import { TeamView } from '@/types/cms/team/Team'
import TeamForm from './TeamForm.vue'
import TeamService from '@/services/cms/team/TeamService'

const teamService = new TeamService()

const $confirm = useConfirm()


const teamFormRef = ref()
const isDrawerVisible = ref(false)


const isLoading = ref(true)

const searchQuery = ref({
  title: '',
  is_active: 1,
})

const teamList = ref<TeamView[]>([])

const tableHeaders = ref([
  { title: 'Image', label: 'image' },
  { title: 'Name', label: 'name' },
  { title: 'Role', label: 'role' },
  { title: 'Status', label: 'status' },
  { title: 'Actions', label: 'actions' },
])

const statusOptions = [
  { title: 'Active', value: 1 },
  { title: 'Inactive', value: 0 },
]



const getAllTeams = async () => {
  isLoading.value = true
  try {
    const { data } = await teamService.list(searchQuery.value)

    teamList.value = data
  } catch (err) {
    showError(err)
  } finally {
    isLoading.value = false
  }
}

const performSearch = () => getAllTeams()

const handleSortTeams = async (sorted: TeamView[]) => {
  try {
    const { status } = await teamService.sortItems(sorted)
    if (status === 'OK') {
      showSuccess('Team members sorted successfully')
      getAllTeams()
    }
  } catch (err) {
    showError(err)
  }
}

const editTeamItem = (item: TeamView) => {
  isDrawerVisible.value = true
  teamFormRef.value.edit(item)
}

const deleteTeamItem = async (id: number) => {
  $confirm?.({
    message: 'Are you sure you want to delete this team member?',
    button: { no: 'No', yes: 'Yes' },
    callback: async (ok: boolean) => {
      if (!ok) return
      try {
        const { status } = await teamService.destroy(id)
        if (status === 'OK') {
          showSuccess('Team member deleted successfully')
          getAllTeams()
        }
      } catch (err) {
        showError(err)
      }
    },
  })
}

// ========================================
// Lifecycle Hooks
// ========================================
onMounted(() => {
  getAllTeams()
})
</script>

<template>
  <!-- Team Management Component -->
  <section>
    <!-- Header Section -->
    <VCardText>
      <div class="d-flex flex-row-reverse justify-right">
        <div class="mx-2">
          <VBtn @click="isDrawerVisible = true">
            Add team member
          </VBtn>
        </div>
      </div>
    </VCardText>

    <!-- Team Members List -->
    <VCard
      flat
      title="Team members"
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
              placeholder="Status"
              :items="statusOptions"
              clearable
              clear-icon="ri-close-line"
              @keyup.enter="performSearch"
            />
          </VCol>

          <VCol
            cols="12"
            md="2"
            class="mt-1"
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
        :data="teamList"
        :loading="isLoading"
        :paginate="false"
        draggable-sort
        @sort-items="handleSortTeams"
      >
        <template #image="{ row: item }">
          <VIcon
            icon="ri-expand-up-down-line"
            class="ma-1"
          />
          <VAvatar size="40">
            <VImg
              :src="item.image_path?.thumb || item.image_path?.original || '/images/placeholder-avatar.png'"
              :alt="item.name"
            />
          </VAvatar>
        </template>

        <template #name="{ row: item }">
          <span
            class="text-bold cursor-pointer title-hover"
            @click="editTeamItem(item)"
          >{{ item.name }}</span>
        </template>

        <template #role="{ row: item }">
          <span>{{ item.role || 'N/A' }}</span>
        </template>
        <template #status="{ row: item }">
          <VChip
            :color="item.is_active ? 'secondary' : 'error'"
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
                  @click="editTeamItem(item)"
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
                  @click="deleteTeamItem(item.id)"
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
    <TeamForm
      ref="teamFormRef"
      v-model:is-drawer-open="isDrawerVisible"
      @refresh="getAllTeams"
    />
  </section>
</template>

<style scoped>
.title-hover {
  transition: color 0.5s ease;
  color: rgb(104, 104, 234);
}
</style>
