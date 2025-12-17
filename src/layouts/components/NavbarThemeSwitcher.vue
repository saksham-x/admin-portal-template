<script setup lang="ts">
import type { ThemeStyle } from '@/types/layouts'

const themes: ThemeStyle[] = [

  {
    name: 'light',
    icon: 'ri-sun-line',
  },
  {
    name: 'dark',
    icon: 'ri-moon-clear-line',
  },
]
</script>

<template>
  <ThemeStyle :themes="themes" />
</template>
