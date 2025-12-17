<script setup lang="ts">
import { useRouter } from 'vue-router'
import AdminUserLoginService from '@/services/auth/AdminUserLoginService'
import axios from 'axios'
import AdminUserService from '@/services/adminUser/AdminUserService'

// import ProfileForm from '@/views/pages/profile/ProfileForm.vue'

const adminUserSvc = new AdminUserService()

const router = useRouter()

const userData = useCookie<any>('userData')
const accessToken = useCookie<string | null>('accessToken')
const userAbilityRules = useCookie<any>('userAbilityRules')

const svc = new AdminUserLoginService()

// const isProfileFormOpen = ref(false)
// const profileFormRef = ref<InstanceType<typeof ProfileForm>>()

const avatarSrc = computed(() => userData.value?.avatar || null)
const displayName = computed(() => userData.value?.full_name || userData.value?.fullName || userData.value?.username || 'User')
const roleName = computed(() => userData.value?.user_type || userData.value?.role || 'User')

const clearClientAuth = () => {
  accessToken.value = null
  userData.value = null
  userAbilityRules.value = null
  delete axios.defaults.headers.common['Authorization']
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  sessionStorage.clear()
}

const getProfile = async () => {
  try {
    const response = await adminUserSvc.getProfile()

    userData.value = response
  } catch (err) {
    console.error('Failed to get profile:', err)
  }
}

const logout = async () => {
  try {
    await svc.logout({})
  } catch (err) {
    console.warn('Logout API error (ignored):', err)
  } finally {
    clearClientAuth()
    await router.replace('/login')
    window.location.reload()
  }
}

const manageProfile = () => {
  if (!userData.value || !userData.value.id) {
    showError('Profile data not loaded')

    return
  }

  // isProfileFormOpen.value = true
  // nextTick(() => {
  //   profileFormRef.value?.loadProfile(userData.value)
  // })
  router.push('/admin-profile')
}

const profileSecurity = () => {
  if (!userData.value || !userData.value.id) {
    showError('Profile data not loaded')

    return
  }
  router.push('/admin-profile/security')
}

// const handleProfileRefresh = async () => {
//   await getProfile()
// }

onMounted(() => {
  getProfile()
})
</script>

<template>
  <VBadge
    dot
    bordered
    location="bottom right"
    offset-x="3"
    offset-y="3"
    color="success"
  >
    <VAvatar
      class="cursor-pointer"
      size="38"
      :color="!avatarSrc ? 'primary' : undefined"
      :variant="!avatarSrc ? 'tonal' : undefined"
    >
      <VImg
        v-if="avatarSrc"
        :src="avatarSrc"
      />
      <VIcon
        v-else
        icon="ri-user-line"
      />

      <VMenu
        activator="parent"
        width="230"
        location="bottom end"
        offset="15px"
      >
        <VList>
          <!-- Mini header -->
          <VListItem>
            <div class="d-flex gap-2 align-center">
              <VListItemAction>
                <VBadge
                  dot
                  location="bottom right"
                  offset-x="3"
                  offset-y="3"
                  color="success"
                >
                  <VAvatar
                    :color="!avatarSrc ? 'primary' : undefined"
                    :variant="!avatarSrc ? 'tonal' : undefined"
                  >
                    <VImg
                      v-if="avatarSrc"
                      :src="avatarSrc"
                    />
                    <VIcon
                      v-else
                      icon="ri-user-line"
                    />
                  </VAvatar>
                </VBadge>
              </VListItemAction>
              <div>
                <h6 class="text-h6 font-weight-medium">
                  {{ displayName }}
                </h6>
                <VListItemSubtitle class="text-capitalize text-disabled">
                  {{ roleName }}
                </VListItemSubtitle>
              </div>
            </div>
          </VListItem>

          <VDivider class="my-1" />

          <VListItem @click="manageProfile">
            <template #prepend>
              <VIcon
                size="22"
                icon="ri-user-settings-line"
              />
            </template>
            <VListItemTitle>Manage profile</VListItemTitle>
          </VListItem>

          <VListItem @click="profileSecurity">
            <template #prepend>
              <VIcon
                size="22"
                icon="ri-lock-line"
              />
            </template>
            <VListItemTitle>Account security</VListItemTitle>
          </VListItem>
          <VDivider class="my-1" />

          <!-- Logout -->
          <VListItem>
            <VBtn
              block
              color="error"
              size="small"
              variant="tonal"
              append-icon="ri-logout-box-r-line"
              @click="logout"
            >
              Logout
            </VBtn>
          </VListItem>
        </VList>
      </VMenu>
    </VAvatar>
  </VBadge>
  <!--
    <ProfileForm
    ref="profileFormRef"
    v-model:is-drawer-open="isProfileFormOpen"
    @refresh="handleProfileRefresh"
    /> 
  -->
</template>
