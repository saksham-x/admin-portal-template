<script setup lang="ts">
import misc404 from '@/assets/pages/404.png'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})
</script>

<template>
  <div class="misc-wrapper">
    <ErrorHeader
      status-code="404"
      title="Page Not Found ⚠️"
      description="We couldn't find the page you are looking for."
      class="mb-10"
    />

    <!--  Image -->
    <div class="misc-avatar w-100 text-center">
      <VImg
        :src="misc404"
        alt="Coming Soon"
        :max-width="800"
        class="mx-auto"
      />
      <VBtn
        to="/"
        class="mt-10"
        style="z-index: 1;"
      >
        Back to Home
      </VBtn>
    </div>
  </div>
</template>

<style lang="scss">
.layout-blank {
  .misc-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.25rem;
    min-block-size: 100dvh;

    .misc-footer-img {
      position: absolute;
      inline-size: 100%;
      inset-block-end: 0;
      inset-inline-start: 0;
    }

    .misc-footer-tree, .misc-footer-tree-1 {
      position: absolute;
    }
    
    .misc-footer-tree {
      inset-block-end: 3.75rem;
      inset-inline-start: 3.75rem;
    }
    
    .misc-footer-tree-1 {
      inset-block-end: 5rem;
      inset-inline-end: 4.75rem;
    }

  }

  .misc-avatar {
    z-index: 1;
  }
}

.misc-footer-tree, .misc-footer-tree-1 {
  position: absolute;
}

.misc-footer-tree {
  inset-block-end: 3.75rem;
  inset-inline-start: 3.75rem;
}

.misc-footer-tree-1 {
  inset-block-end: 5rem;
  inset-inline-end: 4.75rem;
}
</style>
