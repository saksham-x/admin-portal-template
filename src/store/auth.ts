import { defineStore } from 'pinia'
import JwtService from '@/services/JwtService'
import type { UserCredentials } from '@/types/auth/UserCredentials'
import AdminUserLoginService from '@/services/auth/AdminUserLoginService'
import type { AdminUserView } from '@/types/admin-user/AdminUser'
import { useCookie } from '@/composable/useCookie'

export const useAuthStore = defineStore('auth', () => {
  const errors = ref([])
  const user = ref<AdminUserView>({} as AdminUserView)
  const router = useRouter()

  const jwtService = JwtService
  const orgUser = new AdminUserLoginService()
  const isAuthenticated = ref(!!jwtService.getToken())

  // Cookies
  const accessTokenCookie = useCookie('accessToken')

  const setAuth = (authUser: AdminUserView) => {
    isAuthenticated.value = true
    user.value = authUser
    errors.value = []
    jwtService.saveToken(user.value?.token)
  }

  const setError = (error: any) => {
    errors.value = error
  }

  const purgeAuth = () => {
    isAuthenticated.value = false
    user.value = {} as AdminUserView
    errors.value = []

    // Destroy tokens and cookies
    jwtService.destroyToken()
    accessTokenCookie.value = null
    router.push({ name: 'login' })
  }

  const setUserAuthData = (data: AdminUserView) => {
    setAuth(data)

    const { token } = data

    accessTokenCookie.value = token
  }

  const login = async (credentials: UserCredentials) => {
    try {
      const { data } = await orgUser.checkLoginUser(credentials)
      if (data) {
        setUserAuthData(data)

        // Navigate to dashboard
        router.push({ name: 'dashboard' })
      }
    }
    catch (error: any) {
      setError(error)
      setTimeout(() => {
        errors.value = []
      }, 10000)
    }
  }

  const logout = async () => {
    try {
      const { status } = await orgUser.logout({ token: user.value?.id })
      if (status === 'OK')
        purgeAuth()
    }
    catch (error: any) {
      setError(error)
      purgeAuth()
    }
  }

  const verifyAuth = async () => {
    if (jwtService.getToken()) {
      try {
        const { data } = await orgUser.doVerify()

        if (data)
          setUserAuthData(data)
      }
      catch (error: any) {
        setError(error)
        purgeAuth()
        setTimeout(() => {
          router.push({ name: 'login' })
        }, 1000)
      }
    }
  }

  return {
    errors,
    user,
    isAuthenticated,
    login,
    logout,
    setAuth,
    purgeAuth,
    setError,
    verifyAuth,
  }
})
