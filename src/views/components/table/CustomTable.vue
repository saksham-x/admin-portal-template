<template>
  <div 
    class="custom-table-wrapper"
    :class="{
      'striped': striped,
      'hover': hover,
      'dense': dense
    }"
  >
    <div class="table-container">
      <TableContent
        :header="header"
        :data="dataToDisplay"
        :checkbox-enabled="checkboxEnabled"
        :checkbox-label="checkboxLabel"
        :empty-table-text="emptyTableText"
        :draggable-sort="draggableSort"
        :loading="loading"
        :striped="striped"
        :hover="hover"
        :dense="dense"
        @on-items-select="onItemSelect"
        @on-sort-items="onSortItems"
      >
        <template
          v-for="(_, name) in $slots"
          #[name]="slotProps"
        >
          <slot
            :name="name"
            v-bind="slotProps"
          />
        </template>
      </TableContent>
    </div>
    <TableFooter
      v-if="paginate && totalItems > 0"
      v-model:items-per-page="itemsInTable"
      :current-page="currentPage"
      :page-count="pageCount"
      :count="totalItems"
      :items-per-page-dropdown-enabled="itemsPerPageDropdownEnabled"
      @page-change="pageChange"
    />
  </div>
</template>

<script setup lang="ts">
import TableContent from './components/table/TableContent.vue'
import TableFooter from './components/table/footer/TableFooter.vue'

interface TableColumn {
  title: string
  label: string
  columnWidth?: number
  sortEnabled?: boolean
  class?: string | string[] | ((col: TableColumn, row?: TableRow) => string | string[])
  textAlign?: 'left' | 'center' | 'right'
  [key: string]: unknown
}

interface TableRow {
  [key: string]: unknown
}

interface Props {
  header: Array<TableColumn>
  data?: Array<TableRow>
  itemsPerPage?: number
  itemsPerPageDropdownEnabled?: boolean
  checkboxEnabled?: boolean
  checkboxLabel?: string
  total?: number
  loading?: boolean
  paginate?: boolean
  emptyTableText?: string
  currentPage?: number
  pageCount?: number
  draggableSort?: boolean
  striped?: boolean
  hover?: boolean
  bordered?: boolean
  dense?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  itemsPerPage: 20,
  itemsPerPageDropdownEnabled: false,
  checkboxEnabled: false,
  checkboxLabel: 'id',
  total: undefined,
  loading: false,
  paginate: true,
  emptyTableText: 'No data found',
  currentPage: 1,
  pageCount: 0,
  draggableSort: false,
  striped: true,
  hover: true,
  bordered: true,
  dense: false,
})

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'on-page-change', page: number): void
  (e: 'on-items-select', selectedItems: unknown): void
  (e: 'on-items-per-page-change', itemsPerPage: number): void
  <T>(e: 'sort-items', items: T[]): void
}>()

const currentPage = ref<number>(props.currentPage)
const itemsInTable = ref<number>((props.itemsPerPage && props.itemsPerPage > 0) ? props.itemsPerPage : 20)

// Guard flag to avoid emitting when syncing from parent props
const syncingItemsPerPageFromProps = ref<boolean>(false)

watch(
  () => itemsInTable.value,
  (val: number) => {
    currentPage.value = 1
    
    // Avoid feedback loop if this change originated from props sync
    if (syncingItemsPerPageFromProps.value) {
      syncingItemsPerPageFromProps.value = false

      return
    }
    emit('on-items-per-page-change', val)
  },
)

// Keep internal itemsInTable in sync with prop changes (e.g., after first fetch)
watch(
  () => props.itemsPerPage,
  (val: number | undefined) => {
    if (typeof val === 'number' && val > 0 && val !== itemsInTable.value) {
      syncingItemsPerPageFromProps.value = true
      itemsInTable.value = val
    }
  },
)

// Keep internal currentPage in sync with prop changes (e.g., server-driven pagination)
watch(
  () => props.currentPage,
  (val: number | undefined) => {
    if (typeof val === 'number' && val > 0) currentPage.value = val
  },
)

const pageChange = (page: number) => {
  currentPage.value = page
  
  // Emit both event names for compatibility
  emit('page-change', page)
  emit('on-page-change', page)
}

const dataToDisplay = computed(() => props.data ?? [])

const totalItems = computed(() => {
  if (typeof props.total === 'number') return props.total

  if (props.data) return props.data.length

  return 0
})

const pageCount = computed(() => {
  // Prefer explicit pageCount prop (server-side pagination) only when provided (> 0)
  if (typeof props.pageCount === 'number' && props.pageCount > 0) return props.pageCount
  const perPage = Math.max(1, itemsInTable.value || props.itemsPerPage || 1)
  
  return Math.max(1, Math.ceil((totalItems.value || 0) / perPage))
})

const onItemSelect = (selectedItems: unknown) => emit('on-items-select', selectedItems)
const onSortItems = <T>(items: T[]) => emit('sort-items', items)
</script>

<style scoped>
.custom-table-wrapper {
  border: 1px solid rgb(var(--v-theme-outline, 222 226 230) / 1);
  border-top-width: 0px;
   border-radius: 0 0 0.375rem 0.375rem;
  overflow: hidden;
  background-color: rgb(var(--v-theme-background, 255 255 255) / 1);
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  color: rgb(var(--v-theme-on-surface, 33 37 41) / 1);
}

.custom-table-wrapper .table-container {
  position: relative;
  overflow-x: auto;
}

.custom-table-wrapper table {
  width: 100%;
  margin-bottom: 0;
  color: rgb(var(--v-theme-on-surface, 33 37 41) / 1);
  border-collapse: collapse;
  vertical-align: top;
}

.custom-table-wrapper thead th {
  padding: 0.75rem;
  /* Use Vuetify surface so header matches light/dark theme */
  background-color: rgb(var(--v-theme-surface, 248 249 250) / 1);
  border-bottom: 2px solid rgb(var(--v-theme-outline, 222 226 230) / 1);
  border-top: none;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface, 73 80 87) / 1);
  text-align: center;
  vertical-align: bottom;
  position: sticky;
  top: 0;
  z-index: 10;
  white-space: nowrap;
}

.custom-table-wrapper.dense thead th {
  padding: 0.5rem;
  font-size: 0.875rem;
}

.custom-table-wrapper tbody td {
  padding: 0.75rem;
  border-bottom: 1px solid rgb(var(--v-theme-outline, 222 226 230) / 1);
  vertical-align: middle;
  color: rgb(var(--v-theme-on-surface, 33 37 41) / 1);
}

.custom-table-wrapper.dense tbody td {
  padding: 0.5rem;
  font-size: 0.875rem;
}

.custom-table-wrapper.hover tbody tr:hover {
  background-color: rgb(var(--v-theme-on-surface, 33 37 41) / 0.04);
  transition: background-color 0.15s ease-in-out;
}

.custom-table-wrapper.striped tbody tr:nth-child(even) {
  background-color: rgb(var(--v-theme-on-surface, 33 37 41) / 0.02);
}

.custom-table-wrapper.striped.hover tbody tr:nth-child(even):hover {
  background-color: rgba(0, 0, 0, 0.06);
}

.custom-table-wrapper .empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  color: var(--v-theme-on-surface-variant, #6c757d);
  font-size: 1.1rem;
  font-weight: 500;
}

.custom-table-wrapper .table-loading {
  opacity: 0.6;
  pointer-events: none;
}

.sortable-header {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s ease-in-out;
}

.sortable-header:hover {
  background-color: rgb(var(--v-theme-surface-variant, 233 237 239) / 1) !important;
}

.sort-icon {
  margin-left: 0.25rem;
  opacity: 0.7;
}

/* Text alignment utilities */
.custom-table-wrapper :deep(.text-left) {
  text-align: left !important;
}

.custom-table-wrapper :deep(.text-center) {
  text-align: center !important;
}

.custom-table-wrapper :deep(.text-right) {
  text-align: right !important;
}

/* Responsive design */
@media (max-width: 768px) {
  .custom-table-wrapper thead th,
  .custom-table-wrapper tbody td {
    padding: 0.5rem 0.25rem;
    font-size: 0.875rem;
  }
}

/* Ensure dark theme overrides in case global stylesheet order prevents them from applying */
:deep(.v-theme--dark) .custom-table-wrapper thead th,
:deep(body.v-theme--dark) .custom-table-wrapper thead th,
:deep(.theme--dark) .custom-table-wrapper thead th,
:deep([data-theme="dark"]) .custom-table-wrapper thead th {
  background-color: rgb(var(--v-theme-surface, 17 17 17) / 1) !important;
  color: rgb(var(--v-theme-on-surface, 230 238 248) / 1) !important;
  border-bottom-color: rgb(var(--v-theme-outline, 255 255 255) / 0.06) !important;
}

:deep(.v-theme--dark) .custom-table-wrapper,
:deep(body.v-theme--dark) .custom-table-wrapper,
:deep(.theme--dark) .custom-table-wrapper,
:deep([data-theme="dark"]) .custom-table-wrapper {
  background-color: rgb(var(--v-theme-surface, 17 17 17) / 1) !important;
  color: rgb(var(--v-theme-on-surface, 230 238 248) / 1) !important;
  border-color: rgb(var(--v-theme-outline, 255 255 255) / 0.06) !important;
}
</style>
