<script setup lang="ts">
interface Props {
  formData: {
    first_name: string
    middle_name: string
    last_name: string
    email: string
    phone: string
    mobile: string
    address: string
    password: string
    password_confirmation: string
  }
  editingFields: Record<string, boolean>
  isLoading: boolean
}

interface Emits {
  (e: 'toggleEdit', field: string): void
  (e: 'submit'): void
  (e: 'update:formData', value: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()



const updateField = (field: string, value: any) => {
  const updated = { ...props.formData, [field]: value }

  emit('update:formData', updated)
}
</script>

<template>
  <VCard>
    <VCardText class="pa-4">
      <VForm @submit.prevent="emit('submit')">
        <VList>
          <!-- Name Fields Row -->
          <div class="d-flex justify-space-between align-center ga-4">
            <!-- First Name -->
            <VListItem class="flex-grow-1">
              <div class="d-flex align-center ga-2 flex-grow-1">
                <div class="text-caption text-medium-emphasis text-no-wrap">
                  First name:
                </div>
                <VTextField
                  v-if="editingFields.first_name"
                  :model-value="formData.first_name"
                  density="compact"
                  variant="outlined"
                  hide-details
                  autofocus
                  class="flex-grow-1"
                  style="min-width: 150px;"
                  @update:model-value="updateField('first_name', $event)"
                />
                <div
                  v-else
                  class="text-body-1 font-weight-medium"
                >
                  {{ formData.first_name || '-' }}
                </div>
              </div>
              <template #append>
                <VBtn
                  :icon="editingFields.first_name ? 'ri-check-line' : 'ri-edit-line'"
                  :color="editingFields.first_name ? 'success' : 'default'"
                  variant="text"
                  size="x-small"
                  @click="emit('toggleEdit', 'first_name')"
                />
              </template>
            </VListItem>

            <!-- Middle Name -->
            <VListItem class="flex-grow-1">
              <div class="d-flex align-center ga-2 flex-grow-1">
                <div class="text-caption text-medium-emphasis text-no-wrap">
                  Middle name:
                </div>
                <VTextField
                  v-if="editingFields.middle_name"
                  :model-value="formData.middle_name"
                  density="compact"
                  variant="outlined"
                  hide-details
                  autofocus
                  class="flex-grow-1"
                  style="min-width: 150px;"
                  @update:model-value="updateField('middle_name', $event)"
                />
                <div
                  v-else
                  class="text-body-1 font-weight-medium"
                >
                  {{ formData.middle_name || '-' }}
                </div>
              </div>
              <template #append>
                <VBtn
                  :icon="editingFields.middle_name ? 'ri-check-line' : 'ri-edit-line'"
                  :color="editingFields.middle_name ? 'success' : 'default'"
                  variant="text"
                  size="x-small"
                  @click="emit('toggleEdit', 'middle_name')"
                />
              </template>
            </VListItem>

            <!-- Last Name -->
            <VListItem class="flex-grow-1">
              <div class="d-flex align-center ga-2 flex-grow-1">
                <div class="text-caption text-medium-emphasis text-no-wrap">
                  Last name:
                </div>
                <VTextField
                  v-if="editingFields.last_name"
                  :model-value="formData.last_name"
                  density="compact"
                  variant="outlined"
                  hide-details
                  autofocus
                  class="flex-grow-1" 
                  style="min-width: 150px;"
                  @update:model-value="updateField('last_name', $event)"
                />
                <div
                  v-else
                  class="text-body-1 font-weight-medium"
                >
                  {{ formData.last_name || '-' }}
                </div>
              </div>
              <template #append>
                <VBtn
                  :icon="editingFields.last_name ? 'ri-check-line' : 'ri-edit-line'"
                  :color="editingFields.last_name ? 'success' : 'default'"
                  variant="text"
                  size="x-small"
                  @click="emit('toggleEdit', 'last_name')"
                />
              </template>
            </VListItem>
          </div>

          <VDivider class="my-4" />

          <!-- Contact Info Row -->
          <div class="d-flex justify-start ga-8">
            <!-- Email -->
            <VListItem class="flex-grow-0">
              <div class="d-flex align-center ga-2">
                <VIcon
                  icon="ri-mail-line"
                  size="small"
                />
                <div class="text-caption text-medium-emphasis">
                  Email:
                </div>
                <div class="text-body-1 font-weight-medium">
                  {{ formData.email || '-' }}
                </div>
              </div>
            </VListItem>

            <!-- Mobile -->
            <VListItem class="flex-grow-0">
              <div class="d-flex align-center ga-2">
                <VIcon
                  icon="ri-smartphone-line"
                  size="small"
                />
                <div class="text-caption text-medium-emphasis">
                  Mobile:
                </div>
                <div class="text-body-1 font-weight-medium">
                  {{ formData.mobile || '-' }}
                </div>
              </div>
            </VListItem>
          </div>

          <VDivider class="my-4" />

          <!-- Address -->
          <VListItem>
            <template #prepend>
              <VIcon
                icon="ri-map-pin-line"
                size="small"
              />
            </template>
            <div class="d-flex align-center ga-2 flex-grow-1">
              <div class="text-caption text-medium-emphasis">
                Address:
              </div>
              <VTextField
                v-if="editingFields.address"
                :model-value="formData.address"
                density="compact"
                variant="outlined"
                hide-details
                autofocus
                class="flex-grow-1"
                @update:model-value="updateField('address', $event)"
              />
              <div
                v-else
                class="text-body-1 font-weight-medium"
              >
                {{ formData.address || '-' }}
              </div>
            </div>
            <template #append>
              <VBtn
                :icon="editingFields.address ? 'ri-check-line' : 'ri-edit-line'"
                :color="editingFields.address ? 'success' : 'default'"
                variant="text"
                size="x-small"
                @click="emit('toggleEdit', 'address')"
              />
            </template>
          </VListItem>
        </VList>


        <div class="d-flex justify-end mt-4">
          <VBtn
            :loading="isSaving"
            type="submit"
            color="primary"
          >
            Save
          </VBtn>
        </div>
      </VForm>
    </VCardText>
  </VCard>
</template>