<script setup lang="ts">
import MenuService from '@/services/cms/menu/MenuService'
import { MenuView } from '@/types/cms/menu/Menu'
import { useVuelidate } from '@vuelidate/core'
import { helpers, required } from '@vuelidate/validators'
import ValidationError from '@/components/ValidationError.vue'

// Props & Emits
interface Props { isDrawerOpen: boolean }
interface Emit { (e: 'update:isDrawerOpen', value: boolean): void;(e: 'refresh'): void }

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const { errors } = useErrors()

const menuService = new MenuService()

const isEditMode = ref(false)
const isSaving = ref(false)
const currentMenuId = ref<number | null>(null)

const menuFormData = reactive<any>({
  title: '',
  menu_type: 'Header',
  header: true,
  position: 0,
  is_active: true,
})

watch(() => menuFormData.header, (newValue: boolean) => {
  menuFormData.menu_type = newValue ? 'Header' : 'Footer'
})

const requiredRule = helpers.withMessage('This field is required', required)

const formValidationRules = {
  title: { required: requiredRule },
}

const v$ = useVuelidate(formValidationRules, menuFormData)

const resetForm = () => {
  Object.assign(menuFormData, {
    title: '',
    menu_type: 'Header',
    header: true,
    position: 0,
    is_active: true,
  })
  nextTick(() => v$.value.$reset())
}

const closeDrawer = () => {
  emit('update:isDrawerOpen', false)
}

watch(
  () => props.isDrawerOpen,
  (isOpen: boolean) => {
    if (!isOpen && !isSaving.value) {
      setTimeout(() => {
        isEditMode.value = false
        currentMenuId.value = null
        resetForm()
      }, 300)
    }
  },
)

const createMenu = async () => {
  try {
    isSaving.value = true
    await menuService.store(menuFormData)
    showSuccess('Menu created successfully')
    emit('refresh')
    closeDrawer()
  }
  catch (err) {
    showError(err)
  } finally {
    isSaving.value = false
  }
}

const updateMenu = async () => {
  try {
    if (currentMenuId.value == null) return
    isSaving.value = true
    await menuService.update(currentMenuId.value, menuFormData)
    showSuccess('Menu updated successfully')
    emit('refresh')
    closeDrawer()
  }
  catch (err) {
    showError(err)
  } finally {
    isSaving.value = false
  }
}

const handleSubmitMenu = async () => {
  v$.value.$touch()
  if (v$.value.$error) return

  if (isEditMode.value) await updateMenu()
  else await createMenu()
}

const editMenuData = (val: MenuView) => {
  currentMenuId.value = val.id
  isEditMode.value = true

  Object.assign(menuFormData, {
    title: val.title,
    menu_type: val.menu_type,
    header: Boolean(val.header),
    position: val.position ?? 0,
    is_active: Boolean(val.is_active),
  })
}

defineExpose({ edit: editMenuData })
</script>

<template>
  <VNavigationDrawer
    temporary
    :width="520"
    location="end"
    :model-value="props.isDrawerOpen"
    @update:model-value="(val: boolean) => emit('update:isDrawerOpen', val)"
  >
    <!-- Drawer Header -->
    <DrawerHeaderSection
      :title="isEditMode ? 'Edit menu' : 'Add menu'"
      @cancel="closeDrawer"
    />

    <VDivider />

    <VCard flat>
      <VCardText>
        <VRow>
          <!-- Title -->
          <VCol cols="12">
            <VTextField
              v-model="menuFormData.title"
              label="Title"
              :error-messages="v$.title.$errors.map((e: any) => e.$message)"
              @input="v$.title.$touch"
            >
              <template #label>
                <span>Title</span><span class="text-red">*</span>
              </template>
            </VTextField>
            <ValidationError
              :errors="errors"
              field="title"
              class="text-red"
            />
          </VCol>
          <!-- Header Toggle -->
          <VCol cols="12">
            <!--
              <label>Is header menu?</label>
              <VSwitch 
              v-model="menuFormData.header" 
              :label="menuFormData.header ? 'Yes' : 'No'"
              /> 
            -->
            <VSwitch
              v-model="menuFormData.header"
              :label="menuFormData.header ? 'Header' : 'Footer'"
            />
          </VCol>

          <!-- Menu Type (Disabled - Controlled by Header Toggle) -->
          <VCol cols="12">
            <VSelect
              v-model="menuFormData.menu_type"
              :items="['Header', 'Footer']"
              label="Menu type"
              disabled
              readonly
            />
          </VCol>

          <!-- Status -->
          <VCol
            cols="12"
            md="6"
          >
            <label>Status</label>
            <VSwitch
              v-model="menuFormData.is_active"
              :label="menuFormData.is_active ? 'Active' : 'Inactive'"
            />
          </VCol>

          <!-- Actions -->
          <VCol
            cols="12"
            class="d-flex justify-end"
          >
            <VBtn
              type="reset"
              variant="text"
              color="error"
              @click="closeDrawer"
            >
              Cancel
            </VBtn>
            <VBtn
              variant="outlined"
              color="secondary"
              :loading="isSaving"
              class="me-4"
              @click="handleSubmitMenu"
            >
              {{ isEditMode ? 'Update' : 'Save' }}
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </VNavigationDrawer>
</template>