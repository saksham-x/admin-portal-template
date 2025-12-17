<script setup lang="ts">
const props = defineProps<{ value: any }>()
const emit = defineEmits<{ (e: 'save', payload: Record<string, any>): void }>()

const taxSettingsForm = ref({
  tax_percentage: props.value?.tax_percentage ?? 0,
  vat_no: props.value?.vat_no ?? '',
  pan_no: props.value?.pan_no ?? '',
})

function saveTaxSettings() {
  emit('save', { ...taxSettingsForm.value })
}
</script>

<template>
  <!-- Tax Settings Form -->
  <VCard flat>
    <VCardText class="d-grid gap-4">
      <VTextField
        v-model="taxSettingsForm.tax_percentage"
        type="number"
        label="Tax %"
        class="mt-3"
      />
      <VTextField
        v-model="taxSettingsForm.vat_no"
        label="VAT No."
        class="mt-3"
      />
      <VTextField
        v-model="taxSettingsForm.pan_no"
        label="PAN No."
        class="mt-3"
      />
      <VBtn
        class="mt-3"
        @click="saveTaxSettings"
      >
        Save
      </VBtn>
    </VCardText>
  </VCard>
</template>
