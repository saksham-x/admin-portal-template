<script lang="ts" setup>
import mainItems from '@/navigation/index'
import navItems from '@/navigation/navbar'
import Footer from '@/layouts/components/Footer.vue'
import NavBarNotifications from '@/layouts/components/NavBarNotifications.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import UserProfile from '@/layouts/components/UserProfile.vue'
import VerticalNavLayout from '@/core/components/VerticalNavLayout.vue'
</script>

<template>
  <VerticalNavLayout :nav-items="mainItems">
    <!--  navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center">
        <IconBtn
          id="vertical-nav-toggle-btn"
          class="ms-n2 d-lg-none"
          @click="toggleVerticalOverlayNavActive(true)"
        >
          <VIcon icon="ri-menu-line" />
        </IconBtn>

        <TopNavbar :nav-items="navItems" />

        <VSpacer />

        <NavbarThemeSwitcher />
        <NavBarNotifications class="me-2" />
       
        <UserProfile />
      </div>
    </template>

    <slot />

    <template #footer>
      <Footer />
    </template>
  </VerticalNavLayout>
</template>
