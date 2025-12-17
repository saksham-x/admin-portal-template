import { useStorage } from '@vueuse/core'
import { useTheme } from 'vuetify'
import type { ThemeDefinition } from 'vuetify'
import { useAppConfigStore } from '@/store/config'
import { setRouterTabsTheme, setRouterTabsPrimary } from 'vue3-router-tab'
import { namespaceConfig } from '@/utils/helpers'

export interface ColorStyle {

 // Core colors
  primary: string;
  background: string;
  text: string;
  border: string;
  
  // Interactive states
  activeBackground: string;
  activeText: string;
  activeBorder: string;
  
  // Header specific
  headerBackground: string;
  
  // Button specific
  buttonBackground: string;
  buttonColor: string;
  activeButtonBackground: string;
  activeButtonColor: string;
  
  // Icon specific
  iconColor: string;
}

const defaultColors: ColorStyle = {
  primary: "#f56505",
  background: "#ffffff",
  text: "#2a2525",
  border: "#e2e8f0",
  
  activeBackground: "#f56505",
  activeText: "#ffffff",
  activeBorder: "#f56505",
  
  headerBackground: "#ffff",
  
  buttonBackground: "#f8fafc",
  buttonColor: "#f56505",
  activeButtonBackground: "#f56505",
  activeButtonColor: "#ffffff",
  
  iconColor: "#475569",
}

const defaultDarkColor: ColorStyle = {
  primary: "#f56505",
  background: "#2a2525",
  text: "#f1f5f9",
  border: "#2d2a2aff",
  
  activeBackground: "#2a2525",
  activeText: "#f56505",
  activeBorder: "#f56505",
  
  headerBackground: "#fffff", // Darker shade of primary
  
  buttonBackground: "#2a2525",
  buttonColor: "#f1f5f9",
  activeButtonBackground: "#f56505",
  activeButtonColor: "#2a2525",
  
  iconColor: "#cbd5e1",
}


const _handleSkinChanges = () => {
  const { themes } = useTheme()
  const configStore = useAppConfigStore()

  // Create skin default color so that we can revert back to original (default skin) color when switch to default skin from bordered skin
  const themeDefinitions = Object.values(themes.value) as ThemeDefinition[]

  themeDefinitions.forEach(themeDefinition => {
    if (!themeDefinition.colors)
      return

    const colors = themeDefinition.colors

    colors['skin-default-background'] = colors.background ?? ''
    colors['skin-default-surface'] = colors.surface ?? ''
  })

  watch(
    () => configStore.skin,
    (val: string) => {
      themeDefinitions.forEach(themeDefinition => {
        if (!themeDefinition.colors)
          return

        const colors = themeDefinition.colors

        colors.background = colors[`skin-${val}-background`] ?? colors.background
        colors.surface = colors[`skin-${val}-surface`] ?? colors.surface
      })
    },
    { immediate: true },
  )
}

const _syncInitialLoaderTheme = () => {
  const themeStyle = useTheme()

  watch(
    () => useAppConfigStore().theme,
    () => {
      const color: ColorStyle = useAppConfigStore().theme === 'system' || useAppConfigStore().theme === 'dark' ? defaultDarkColor : defaultColors
     
      window.localStorage.setItem('tab-theme-style', useAppConfigStore().theme)
      
      useStorage<string | null>(namespaceConfig('initial-loader-bg'), null).value = themeStyle.current.value.colors.surface
      useStorage<string | null>(namespaceConfig('initial-loader-color'), null).value = themeStyle.current.value.colors.primary

      setRouterTabsTheme(useAppConfigStore().theme)
      setRouterTabsPrimary(color)
    },
    { immediate: true },
  )
}

const initCore = () => {
  _syncInitialLoaderTheme()
  _handleSkinChanges()
}

export default initCore
