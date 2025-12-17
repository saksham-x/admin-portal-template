<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'
import { helpers } from '@vuelidate/validators'
import { ref, computed } from 'vue'

const props = defineProps<{ value: any }>()
const emit = defineEmits<{ (e: 'save', payload: Record<string, any>): void }>()

const advancedSettingsForm = ref({
  enable_level: props.value?.enable_level ?? false,
  enable_buildings: props.value?.enable_buildings ?? false,
  zoom_link: props.value?.zoom_link ?? '',
  map_url: props.value?.map_url ?? '',
})

// Check if map_url is a valid URL for iframe
const isValidMapUrl = computed(() => {
  try {
    if (!advancedSettingsForm.value.map_url) return false
    new URL(advancedSettingsForm.value.map_url)
    
    return true
  } catch {
    return false
  }
})

const urlRule = helpers.withMessage(
  'Enter a valid URL with domain (e.g. http://example.com)',
  (v: any) => {
    if (!v) return true 

    try {
      const url = new URL(String(v))

      if (!['http:', 'https:'].includes(url.protocol))
        return false

      const parts = url.hostname.split('.')
      if (parts.length < 2) return false

      const tld = parts[parts.length - 1]
      if ((tld as any).length < 2) return false

      return true
    }
    catch {
      return false
    }
  },
)

const rules = {
  zoom_link: { urlRule },
  map_url: {  },
}

const v$ = useVuelidate(rules, advancedSettingsForm)

function saveAdvancedSettings() {
  v$.value.$touch()
  if (v$.value.$error) {
    setTimeout(() => v$.value.$reset(), 3000)
    
    return
  }

  emit('save', { ...advancedSettingsForm.value })
}
</script>

<template>
  <!-- Advanced Settings Form -->
  <VCard flat>
    <VCardText class="d-grid gap-4">
      <VTextField
        v-model="advancedSettingsForm.zoom_link"
        label="Zoom link"
        class="mt-2"
        :error-messages="v$.zoom_link.$errors.map((e: any) => e.$message)"
        @input="v$.zoom_link.$touch"
      />
      
      <div>
        <VTextField
          v-model="advancedSettingsForm.map_url"
          label="Map URL (Google maps embed link)"
          placeholder="https://www.google.com/maps/embed?pb=..."
          class="mt-3"
          :error-messages="v$.map_url.$errors.map((e: any) => e.$message)"
          @input="v$.map_url.$touch"
        />
        
        <!-- Map Preview -->
        <div
          v-if="isValidMapUrl"
          class="mt-4"
        >
          <label class="text-subtitle-2 mb-2 d-block">Map preview:</label>
          <iframe
            :src="advancedSettingsForm.map_url"
            width="100%"
            height="400"
            style="border:0; border-radius: 8px;"
            allowfullscreen
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
      
      <VBtn
        class="mt-2"
        @click="saveAdvancedSettings"
      >
        Save
      </VBtn>
    </VCardText>
  </VCard>
</template>