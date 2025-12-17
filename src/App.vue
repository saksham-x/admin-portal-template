<script setup lang="ts">
import { useTheme } from "vuetify"
import { initAppConfigStore } from "@/store/config"
import initCore from "./core/initConfig"
import { useAuthStore } from "./store/auth"
import { useCookie } from "@/composable/useCookie"

const authStore = useAuthStore()
const accessTokenCookie = useCookie("accessToken")

const { global } = useTheme()

const primaryColor = hexToRgbColor(global.current.value.colors.primary)

initCore()
initAppConfigStore()


const checkAuthLogin = async () => {
  try {
    await authStore.verifyAuth()
  } catch {
  }
}

watch(
  () => accessTokenCookie.value,
  async (token: string, previousToken: string) => {
    if (token && token !== previousToken) {
      await checkAuthLogin()
    }
  },
  { immediate: true },
)

onMounted(() => {
  Promise.all([ checkAuthLogin()])
})
</script>

<template>
  <VApp :style="`--v-global-theme-primary: ${primaryColor}`">
    <RouterView />
    <ScrollToTop />
    <Vue3ConfirmDialogBox />
    <Vue3notify />
  </VApp>
</template>

<style scoped>
#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

header {
  margin-bottom: 2rem;
}

h1 {
  color: #42b883;
  font-size: 2.5rem;
  margin-bottom: 1rem;
}
</style>
