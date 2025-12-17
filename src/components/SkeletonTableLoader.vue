<template>
  <div
    class="skeleton-table-loader"
    role="status"
    aria-hidden="true"
  >
    <div class="skeleton-table">
      <div class="skeleton-row header">
        <div
          v-for="n in 4"
          :key="n"
          class="cell"
        />
      </div>
      <div
        v-for="r in 6"
        :key="r"
        class="skeleton-row"
      >
        <div
          v-for="c in 4"
          :key="c"
          class="cell"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

// simple presentational loader
</script>

<style scoped lang="scss">
.skeleton-table-loader {
  .skeleton-table {
    display: grid;
    gap: 8px;
    .skeleton-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
        .cell {
        height: 16px;
        border-radius: 4px;
        background: linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.06) 75%);
        background-size: 200% 100%;
        animation: shimmer 1.25s linear infinite;
      }
      // Dark theme shimmer
      body.v-theme--dark & {
        .cell {
          background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%);
        }
      }
      &.header .cell { height: 18px; border-radius: 6px; }
    }
  }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
