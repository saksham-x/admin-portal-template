<script setup lang="ts">
import RichText from '@/components/form/RichText.vue'
import { useVuelidate } from '@vuelidate/core'
import { helpers, required } from '@vuelidate/validators'
import ValidationError from '@/components/ValidationError.vue'
import { Team, TeamView } from '@/types/cms/team/Team'
import TeamService from '@/services/cms/team/TeamService'


interface Props { isDrawerOpen: boolean }
interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()
const { errors } = useErrors()

const teamService = new TeamService()


const isSaving = ref(false)
const isEditMode = ref(false)
const currentTeamId = ref<number | null>(null)
const fileInputKey = ref(0)


const teamFormData = reactive<Team>({
  name: '',
  description: '',
  role: null,
  position: null,
  fb_url: null,
  linked_url: null,
  image: null,
  is_active: true,
})

const imagePreviewUrl = ref<string | null>(null)


const descriptionLength = computed(() => {
  const text = teamFormData.description || ''
  const strippedText = text.replace(/<[^>]*>/g, '')
  
  return strippedText.length
})


const requiredRule = helpers.withMessage('This field is required', required)

const urlValidator = (value: string | null) => {
  if (!value) return true
  try {
    const url = new URL(value)
    
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const rules = {
  name: { required: requiredRule },
  description: { required: requiredRule },
  fb_url: {
    url: helpers.withMessage(
      'Enter a valid URL (e.g. https://example.com)',
      urlValidator,
    ),
  },
  linked_url: {
    url: helpers.withMessage(
      'Enter a valid URL (e.g. https://example.com)',
      urlValidator,
    ),
  },
}

const v$ = useVuelidate(rules, teamFormData)

// ========================================
// Form Methods
// ========================================
const resetForm = () => {
  Object.assign(teamFormData, {
    name: '',
    description: '',
    role: null,
    position: null,
    fb_url: null,
    linked_url: null,
    image: null,
    is_active: true,
  })
  imagePreviewUrl.value = null
  fileInputKey.value++
  nextTick(() => v$.value.$reset())
}

const closeDrawer = () => {
  emit('update:isDrawerOpen', false)
}

const handleFileChange = (f: File | File[] | null) => {
  const file = Array.isArray(f) ? (f[0] ?? null) : f
  if (file) {
    teamFormData.image = file

    const reader = new FileReader()

    reader.onload = e => {
      imagePreviewUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  } else {
    teamFormData.image = null
    imagePreviewUrl.value = null
  }
}


const createTeam = async () => {
  try {
    isSaving.value = true
    await teamService.store(teamFormData)
    showSuccess('Team member created successfully')
    emit('refresh')
    closeDrawer()
  } catch (err) {
    showError(err)
  } finally {
    isSaving.value = false
  }
}

const updateTeam = async () => {
  if (currentTeamId.value == null) return false
  
  try {
    isSaving.value = true
    await teamService.update(currentTeamId.value, teamFormData)
    showSuccess('Team member updated successfully')
    emit('refresh')
    closeDrawer()
  } catch (err) {
    showError(err)
  } finally {
    isSaving.value = false
  }
}

const handleSubmitTeam = async () => {
  v$.value.$touch()
  if (descriptionLength.value > 1500) {
    showError('Description cannot exceed 1500 characters')
    
    return
  }
  if (v$.value.$error) return
  if (isEditMode.value) await updateTeam()
  else await createTeam()
}

const editTeamData = async (item: TeamView) => {
  isEditMode.value = true
  currentTeamId.value = item.id

  Object.assign(teamFormData, {
    name: item.name,
    description: item.description,
    role: item.role ?? null,
    position: item.position ?? null,
    fb_url: item.fb_url ?? null,
    linked_url: item.linked_url ?? null,
    image: null,
    is_active: Boolean(item.is_active),
  })

  imagePreviewUrl.value =
    item.image_path?.thumb ??
    item.image_path?.original
}

// ========================================
// Expose
// ========================================
defineExpose({ edit: editTeamData })

// ========================================
// Watchers
// ========================================
watch(
  () => props.isDrawerOpen,
  (isOpen: boolean) => {
    if (!isOpen && !isSaving.value) {
      setTimeout(() => {
        isEditMode.value = false
        currentTeamId.value = null
        resetForm()
      }, 300)
    }
  },
)
</script>

<template>
  <VNavigationDrawer
    temporary
    location="end"
    width="500"
    :model-value="props.isDrawerOpen"
    @update:model-value="(val: boolean) => emit('update:isDrawerOpen', val)"
  >
    <DrawerHeaderSection
      :title="isEditMode ? 'Edit team member' : 'Add team member'"
      @cancel="closeDrawer"
    />
    <VDivider />

    <VCard flat>
      <VCardText>
        <VRow>
          <!-- Name -->
          <VCol cols="12">
            <VTextField
              v-model="teamFormData.name"
              label="Name"
              placeholder="Enter name"
              :error-messages="v$.name.$errors.map((e: any) => e.$message)"
              @blur="v$.name.$touch"
            >
              <template #label>
                <span>Name</span><span class="text-red ms-1">*</span>
              </template>
            </VTextField>
            <ValidationError
              :errors="errors"
              field="name"
              class="text-red"
            />
          </VCol>

          <!-- Role -->
          <VCol cols="12">
            <VTextField
              v-model="teamFormData.role"
              label="Role"
              placeholder="Enter role (e.g., Chairperson, Developer)"
            />
          </VCol>

          <!-- Description -->
          <VCol cols="12">
            <label class="mb-2 d-block">
              <span>Description</span>
              <span class="text-red">*</span>
            </label>
            <RichText
              v-model="teamFormData.description"
              @blur="v$.description.$touch()"
            />
            <small
              v-if="v$.description.$error"
              class="text-red"
            >
              {{ v$.description.$errors[0].$message }}
            </small>
            <div class="d-flex justify-space-between mt-1">
              <small
                v-if="descriptionLength > 1500"
                class="text-red"
              >
                Maximum 1500 characters allowed
              </small>
              <small
                v-else
                class="text-grey"
              >
                &nbsp;
              </small>
              <small :class="descriptionLength > 1500 ? 'text-red' : 'text-grey'">
                {{ descriptionLength }}/1500
              </small>
            </div>
            <ValidationError
              :errors="errors"
              field="description"
              class="text-red"
            />
          </VCol>

          <!-- Image -->
          <VCol cols="12">
            <VFileInput
              :key="fileInputKey"
              accept="image/*"
              label="Profile image"
              prepend-icon=""
              prepend-inner-icon="ri-image-line"
              @update:model-value="handleFileChange"
            />
            <ValidationError
              :errors="errors"
              field="image"
              class="text-red"
            />

            <div
              v-if="imagePreviewUrl"
              class="mt-2 d-flex align-center gap-3"
            >
              <VAvatar size="64">
                <VImg :src="imagePreviewUrl" />
              </VAvatar>
            </div>
          </VCol>

          <!-- Facebook URL -->
          <VCol cols="12">
            <VTextField
              v-model="teamFormData.fb_url"
              label="Facebook URL"
              placeholder="https://facebook.com/..."
              prepend-inner-icon="ri-facebook-fill"
              :error-messages="v$.fb_url.$errors.map((e: any) => e.$message)"
              @blur="v$.fb_url.$touch"
            />
          </VCol>

          <!-- LinkedIn URL -->
          <VCol cols="12">
            <VTextField
              v-model="teamFormData.linked_url"
              label="LinkedIn URL"
              placeholder="https://linkedin.com/in/..."
              prepend-inner-icon="ri-linkedin-fill"
              :error-messages="v$.linked_url.$errors.map((e: any) => e.$message)"
              @blur="v$.linked_url.$touch"
            />
          </VCol>

          <!-- Status -->
          <VCol cols="12">
            <label class="mb-1 d-block">Status</label>
            <VSwitch
              v-model="teamFormData.is_active"
              :label="teamFormData.is_active ? 'Active' : 'Inactive'"
            />
          </VCol>

          <!-- Actions -->
          <VCol
            cols="12"
            class="d-flex justify-end"
          >
            <VBtn
              color="error"
              variant="text"
              @click="closeDrawer"
            >
              Cancel
            </VBtn>
            <VBtn
              variant="outlined"
              color="secondary"
              :loading="isSaving"
              class="me-4"
              @click="handleSubmitTeam"
            >
              {{ isEditMode ? 'Update' : 'Save' }}
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </VNavigationDrawer>
</template>