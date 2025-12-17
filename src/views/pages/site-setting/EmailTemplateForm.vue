<script setup lang="ts">
import EmailTemplateService from '@/services/site-setting/email-template/EmailTemplateService'

import { EmailTemplate, EmailTemplateView } from '@/types/site-setting/EmailTemplate'
import RichText from '@/components/form/RichText.vue'
import { useVuelidate } from '@vuelidate/core'
import { helpers, required } from '@vuelidate/validators'
import ValidationError from '@/components/ValidationError.vue'

// import { VTextField } from 'vuetify/components'


const props = defineProps<{
  isDrawerOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'refresh'): void
}>()

const { errors } = useErrors()
const emailTemplateService = new EmailTemplateService()

// ========================================
// Refs / State
// ========================================
const templateId = ref<number | null>(null)
const isEdit = ref(false)
const saving = ref(false)
const richTextKey = ref(0)

const form = reactive<EmailTemplate>({
  title: '',
  role: '',
  subject: '',
  description: '',
  type: '',
  is_active: 1,
  identifier: '',
  accepted_inputs: '',

})


const rules = {
  title: {
    required: helpers.withMessage('Title is required', required),
  },
  role: {
    required: helpers.withMessage('Role is required', required),
  },
  subject: {
    required: helpers.withMessage('Subject is required', required),
  },
  description: {
    required: helpers.withMessage('Description is required', required),
  },
  type: {
    required: helpers.withMessage('Type is required', required),
  },
  identifier: {
    required: helpers.withMessage('Identifier is required', required),
  },
  accepted_inputs: {
    required: helpers.withMessage('Accepted inputs is required', required),
  },
}

const v$ = useVuelidate(rules, form)

const resetForm = () => {
  form.title = ''
  form.role = ''
  form.subject = ''
  form.description = ''
  form.type = ''
  form.is_active = 1
  form.identifier = ''
  form.accepted_inputs = ''
  templateId.value = null
  isEdit.value = false
  v$.value.$reset()

  richTextKey.value++
}

const closeDrawer = () => {
  emit('update:isDrawerOpen', false)
}

watch(
  () => props.isDrawerOpen,
  (val: any) => {
    if (!val)
      resetForm()
  },
)

const saveTemplate = async () => {
  await v$.value.$validate()

  if (v$.value.$invalid)
    return

  saving.value = true

  try {
    const payload: EmailTemplate = {
      title: form.title,
      role: form.role,
      subject: form.subject,
      description: form.description,
      type: form.type,
      is_active: form.is_active ?? 1,
      identifier: form.identifier,
      accepted_inputs: form.accepted_inputs,

    }

    if (isEdit.value && templateId.value) {
      await emailTemplateService.update(templateId.value, payload)
      showSuccess('Email template updated successfully')
    }
    else {
      await emailTemplateService.store(payload)
      showSuccess('Email template created successfully')
    }

    emit('refresh')
    closeDrawer()
  }
  catch (err) {
    showError(err)
  }
  finally {
    saving.value = false
  }
}

const edit = (item: EmailTemplateView) => {
  isEdit.value = true
  templateId.value = item.id

  form.title = item.title
  form.role = item.role
  form.subject = item.subject
  form.description = item.description
  form.type = item.type
  form.is_active = item.is_active ?? 1
  form.identifier = item.identifier
  form.accepted_inputs = item.accepted_inputs


  emit('update:isDrawerOpen', true)
}

defineExpose({ edit })
</script>

<template>
  <VNavigationDrawer
    temporary
    width="840"
    location="end"
    :model-value="props.isDrawerOpen"
    @update:model-value="(v: boolean) => emit('update:isDrawerOpen', v)"
  >
    <DrawerHeaderSection
      :title="isEdit ? 'Edit email template' : 'Add email template'"
      @cancel="closeDrawer"
    />

    <VDivider />

    <VForm
      class="pa-4 d-grid gap-4"
      @submit.prevent="saveTemplate"
    >
      <VRow>
        <!-- Title -->
        <VCol
          cols="12"
          md="6"
        >
          <VTextField
            v-model="form.title"
            :error-messages="v$.title.$errors.map((e: any) => e.$message as string)"
            @blur="v$.title.$touch()"
          >
            <template #label>
              Title <span style="color: red">*</span>
            </template>
          </VTextField>
          <ValidationError
            :errors="errors"
            field="title"
            class="text-red"
          />
        </VCol>

        <!-- Role -->
        <VCol
          cols="12"
          md="6"
        >
          <VTextField
            v-model="form.role"
            readonly
            :error-messages="v$.role.$errors.map((e: any) => e.$message as string)"
            @blur="v$.role.$touch()"
          >
            <template #label>
              Role <span style="color: red">*</span>
            </template>
          </VTextField>
        </VCol>

        <!-- Subject -->
        <VCol
          cols="12"
          md="6"
        >
          <VTextField
            v-model="form.subject"
            :error-messages="v$.subject.$errors.map((e: any) => e.$message as string)"
            clearable
            clear-icon="ri-close-line"
            @blur="v$.subject.$touch()"
          >
            <template #label>
              Subject <span style="color: red">*</span>
            </template>
          </VTextField>
          <ValidationError
            :errors="errors"
            field="subject"
            class="text-red"
          />
        </VCol>

        <!-- Identifier -->
        <VCol
          cols="12"
          md="6"
        >
          <VTextField
            v-model="form.identifier"
            readonly
            :error-messages="v$.identifier.$errors.map((e: any) => e.$message as string)"
            hint="Unique identifier for this template (e.g. welcome-email)"
            persistent-hint
            @blur="v$.identifier.$touch()"
          >
            <template #label>
              Identifier <span style="color: red">*</span>
            </template>
          </VTextField>
        </VCol>

        <!-- Type -->
        <VCol
          cols="12"
          md="6"
        >
          <VTextField
            v-model="form.type"
            readonly
            :error-messages="v$.type.$errors.map((e: any) => e.$message as string)"
            hint="Internal type key (e.g. password_reset_email)"
            persistent-hint
            @blur="v$.type.$touch()"
          >
            <template #label>
              Type <span style="color: red">*</span>
            </template>
          </VTextField>
        </VCol>

        <!-- Accepted Inputs -->
        <VCol
          cols="12"
          md="6"
        >
          <VTextField
            v-model="form.accepted_inputs"
            :error-messages="v$.accepted_inputs.$errors.map((e: any) => e.$message as string)"
            readonly
            hint="Comma separated variables (e.g. first_name,verification_code)"
            persistent-hint
            @blur="v$.accepted_inputs.$touch()"
          >
            <template #label>
              Accepted inputs <span style="color: red">*</span>
            </template>
          </VTextField>
        </VCol>



        <!-- Description -->
        <VCol cols="12">
          <label class="mb-2 d-block">
            <span>Description</span>
            <span class="text-red">*</span>
          </label>

          <RichText
            :key="richTextKey"
            v-model="form.description"
            label=""
            @blur="v$.description.$touch()"
            @input="v$.description.$touch()"
          />

          <small
            v-if="v$.description.$error"
            class="text-red"
          >
            {{ v$.description.$errors[0].$message }}
          </small>

          <ValidationError
            :errors="errors"
            field="description"
            class="text-red"
          />
        </VCol>
        <!-- Is Active -->
        <VCol
          cols="12"
          md="6"
        >
          <VSwitch
            v-model="form.is_active"
            :true-value="1"
            :false-value="0"
            :label="form.is_active ? 'Active' : 'Inactive'"
          />
        </VCol>
    

        <!-- Actions -->
        <VCol
          cols="12"
          class="d-flex justify-end gap-4"
        >
          <VBtn
            variant="text"
            color="error"
            :disabled="saving"
            @click="closeDrawer"
          >
            Cancel
          </VBtn>

          <VBtn
            type="submit"
            variant="outlined"
            color="secondary"
            :loading="saving"
          >
            {{ isEdit ? 'Update' : 'Save' }}
          </VBtn>
        </VCol>
      </VRow>
    </VForm>
  </VNavigationDrawer>
</template>