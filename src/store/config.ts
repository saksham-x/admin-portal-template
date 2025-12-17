import { appConfig } from '@themeConfig'
import { useTheme } from 'vuetify'
import { getCurrentInstance, inject } from 'vue'

export const useAppConfigStore = defineStore('appConfig', () => {
  const route = useRoute()

  // //  Theme
  // const userPreferredColorScheme = usePreferredColorScheme()
  // const cookieColorScheme = cookieRef<'light' | 'dark'>('theme-style', 'light')

  // watch(
  //   userPreferredColorScheme,
  //   (val: 'light' | 'dark' | 'no-preference') => {
  //     if (val !== 'no-preference')
  //       cookieColorScheme.value = val
  //   },
  //   { immediate: true },
  // )

  // const theme = cookieRef<'light' | 'dark' | 'system'>('theme-style', appConfig.app.theme)

  // single cookie-backed theme (light | dark | system)
  const theme = cookieRef<'light' | 'dark' | 'system'>('theme-style', appConfig.app.theme)


  // watch system pref only to update runtime theme when user chose 'system'
  // but DO NOT write to the cookie — leave the persisted value as the user's choice
  watch(
    usePreferredColorScheme(),
    (val: 'light' | 'dark' | 'no-preference') => {
      if (theme.value === 'system' && val !== 'no-preference') {
        const effective = val === 'dark' ? 'dark' : 'light'


        // just change runtime theme — do not overwrite cookie
        useTheme().change(effective)
      }
    },
    { immediate: true },
  )


  //  isVerticalNavSemiDark
  const isVerticalNavSemiDark = cookieRef('isVerticalNavSemiDark', appConfig.navbar.isVerticalNavSemiDark)

  //  isVerticalNavSemiDark
  const skin = cookieRef('skin', appConfig.app.skin)

  //  Navbar Type
  const navbarType = ref(appConfig.navbar.type)

  //  Navbar Type
  const isNavbarBlurEnabled = cookieRef('isNavbarBlurEnabled', appConfig.navbar.navbarBlur)

  //  Vertical Nav Collapsed
  const isVerticalNavCollapsed = cookieRef('isVerticalNavCollapsed', appConfig.navbar.isVerticalNavCollapsed)

  //  App Content Width
  const appContentWidth = cookieRef('appContentWidth', appConfig.app.contentWidth)

  //  App Content Layout Nav
  const appContentLayoutNav = ref('vertical')

  const topNavbarPopoverOffset = ref(appConfig.topNavbar.popoverOffset)

  //  Footer Type
  const footerType = ref(appConfig.footer.type)

  //  Misc
  const isLessThanOverlayNavBreakpoint = computed(() => useMediaQuery(`(max-width: ${appConfig.app.overlayNavFromBreakpoint}px)`).value)

  const windowScroll = getCurrentInstance()
    ? useWindowScroll()
    : { y: ref(0) }

  //  Layout Classes
  const _layoutClasses = computed(() => {
    const windowScrollY = windowScroll.y

    return [
      `layout-nav-type-${appContentLayoutNav.value}`,
      `layout-navbar-${navbarType.value}`,
      `layout-footer-${footerType.value}`,
      {
        'layout-vertical-nav-collapsed':
          isVerticalNavCollapsed.value
          && appContentLayoutNav.value === 'vertical'
          && !isLessThanOverlayNavBreakpoint.value,
      },
      { [`horizontal-nav-horizontal-layout`]: appContentLayoutNav.value === 'horizontal' },
      `layout-content-width-${appContentWidth.value}`,
      { 'layout-overlay-nav': isLessThanOverlayNavBreakpoint.value },
      { 'window-scrolled': unref(windowScrollY) },
      route.meta.layoutWrapperClasses ? route.meta.layoutWrapperClasses : null,
    ]
  })



  const isVerticalNavMini = (isVerticalNavHovered: Ref<boolean> | null = null) => {
    const fallback = ref(false)

    const isVerticalNavHoveredLocal = isVerticalNavHovered
      || inject(injectionKeyIsVerticalNavHovered, fallback)

    return computed(() => isVerticalNavCollapsed.value && !isVerticalNavHoveredLocal.value && !isLessThanOverlayNavBreakpoint.value)
  }

  const isAppRTL = 'rtl'

  return {
    theme,
    skin,
    isVerticalNavSemiDark,
    appContentWidth,
    appContentLayoutNav,
    navbarType,
    isNavbarBlurEnabled,
    isVerticalNavCollapsed,
    footerType,
    isLessThanOverlayNavBreakpoint,
    _layoutClasses,
    isVerticalNavMini,
    topNavbarPopoverOffset,
    isAppRTL,
  }
})

export const initAppConfigStore = () => {
  const userPreferredColorScheme = usePreferredColorScheme()
  const themeStyle = useTheme()
  const configStore = useAppConfigStore()

  watch(
    [() => configStore.theme, userPreferredColorScheme],
    () => {
      const theme = configStore.theme === 'system'
        ? userPreferredColorScheme.value === 'dark'
          ? 'dark'
          : 'light'
        : configStore.theme

      themeStyle.change(theme)
    })

  onMounted(() => {
    if (configStore.theme === 'system')
      themeStyle.change(userPreferredColorScheme.value)
  })
}
