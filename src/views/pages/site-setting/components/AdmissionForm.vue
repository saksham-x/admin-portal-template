<script setup lang="ts">
import SiteSettingService from '@/services/site-setting/SiteSettingService'
import type { SiteSettingView } from '@/types/site-setting/SiteSetting'

const props = defineProps<Props>()
const emit = defineEmits<Emit>()
const $confirm = useConfirm()
interface Props {
  value: SiteSettingView | null
}

interface Emit {
  (e: 'save', payload: Record<string, any> | FormData): void
}

const siteSettingService = new SiteSettingService()

const isSaving = ref(false)

const isAdmissionFormActive = ref(false)

watch(
  () => props.value?.is_admission_form_active,
  (v: any) => {
    isAdmissionFormActive.value = !!v
  },
  { immediate: true },
)

const handleToggle = async () => {
  if (!props.value?.id) return

  const targetState = isAdmissionFormActive.value

  $confirm?.({
    message: targetState
      ? 'Do you want to activate the admission form?'
      : 'Do you want to deactivate the admission form?',
    button: { yes: 'Yes', no: 'Cancel' },
    callback: async ok => {
      if (!ok) {
        isAdmissionFormActive.value = !targetState
        
        return
      }

      isSaving.value = true
      try {
        if (targetState) {
          await siteSettingService.activateAdmissionForm()

          // showSuccess('Admission form activated successfully')
        } else {
          await siteSettingService.deactivateAdmissionForm()

          // showSuccess('Admission form deactivated successfully')
        }

        emit('save', {
          is_admission_form_active: targetState ? 1 : 0,
        })
      } catch (err) {
        showError(err)
        isAdmissionFormActive.value = !targetState
      } finally {
        isSaving.value = false
      }
    },
  })
}
</script>

<template>
  <VCard flat>
    <VCardText>
      <VRow>
        <VCol
          cols="12"
          md="8"
        >
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-subtitle-1 fw-medium">
                Admission form visibility
              </div>
              <div class="text-caption text-medium-emphasis">
                Toggle to show or hide the admission form on the frontend.
              </div>
            </div>

            <VSwitch
              v-model="isAdmissionFormActive"
              :loading="isSaving"
              :label="isAdmissionFormActive ? 'Active' : 'Inactive'"
              @change="handleToggle"
            />
          </div>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
