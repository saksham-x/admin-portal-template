import { breakpointsVuetifyV3 } from '@vueuse/core'
import { VIcon } from 'vuetify/components/VIcon'
import { Skins } from '@/types/enums'
import { ContentWidth, FooterType, NavbarType } from '@/types/enums'

// import logo from '@/assets/logo.svg?raw'
import logoImg from '@/assets/newlogo.png'
import { defineLayoutThemeConfig } from '@/core'

export const { appConfig } = defineLayoutThemeConfig({
  app: {
    title: '',
    tagline: 'Admin Template',

    // logo: h('div', { innerHTML: logo, style: 'line-height:0; color: rgb(var(--v-global-theme-primary))' }),
    logo: h('img', { 
      src: logoImg, 
      alt: 'DroneGuru Logo',
      style: 'height: 60px; width: auto; display: block; margin-left:25px', 
    }),
    contentWidth: ContentWidth.Fluid,
    overlayNavFromBreakpoint: breakpointsVuetifyV3.md + 16,
    theme: 'light',
    skin: Skins.Bordered,
    iconRenderer: VIcon,
  },
  navbar: {
    type: NavbarType.Sticky,
    navbarBlur: true,
    isVerticalNavCollapsed: false,
    defaultNavItemIconProps: { icon: 'ri-circle-line' },
    isVerticalNavSemiDark: false,
  },
  topNavbar: {
    transition: 'slide-y-reverse-transition',
    popoverOffset: 4,
  },
  footer: { type: FooterType.Static },
  icons: {
    chevronDown: { icon: 'ri-arrow-down-s-line' },
    chevronRight: { icon: 'ri-arrow-right-s-line' },
    close: { icon: 'ri-close-line' },
    verticalNavPinned: { icon: 'ri-arrow-left-s-line' },
    verticalNavUnPinned: { icon: 'ri-arrow-right-s-line' },
    sectionTitlePlaceholder: { icon: 'ri-subtract-line' },
  },
})
