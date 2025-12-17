<script setup lang="ts">
import SiteSettingService from '@/services/site-setting/SiteSettingService'
import type { SiteSettingView } from '@/types/site-setting/SiteSetting'

import SSGeneral from './components/General.vue'
import SSBranding from './components/Branding.vue'
import SSSocial from './components/Social.vue'
import SSSmtp from './components/Smtp.vue'
import SSStorage from './components/Storage.vue'
import SSSecurity from './components/Security.vue'
import SSTax from './components/Tax.vue'
import SSAdvanced from './components/Advanced.vue'
import SSSeo from './components/Seo.vue'

import SSAdmissionForm from './components/AdmissionForm.vue'

const siteSettingService = new SiteSettingService()

const activeTab = ref('general')
const isLoading = ref(true)
const siteSettings = ref<SiteSettingView | null>(null)

async function loadSettings() {
  isLoading.value = true

  const { data } = await siteSettingService.getSetting()

  siteSettings.value = data ?? null
  isLoading.value = false
}

async function saveSetting(partial: FormData | Record<string, any>) {
  if (!siteSettings.value?.id) return

  try {
    const { status } = await siteSettingService.update(siteSettings.value.id, partial)

    if (status === 'OK') {
      showSuccess('Site settings updated successfully')
      await loadSettings()
    }
  }
  catch (err) {
    showError(err)
  }
}

// ℹ️ Lifecycle Hooks
onMounted(loadSettings)
</script>

<template>
  <section>
    <!-- ℹ️ Site Settings Card -->
    <VCard
      flat
      class="mb-6"
      title="Site settings"
    >
      <VCardText>
        <VProgressCircular
          v-if="isLoading"
          indeterminate
          class="mb-4"
        />
        <VRow v-else>
          <VCol
            cols="12"
            md="3"
          >
            <VTabs
              v-model="activeTab"
              direction="vertical"
              class="site-settings-tabs"
            >
              <VTab value="general">
                General
              </VTab>
              <VTab value="admission-form">
                Admission Form
              </VTab>
              <VTab value="branding">
                Branding
              </VTab>
              <VTab value="social">
                Social
              </VTab>

              <VTab value="smtp">
                SMTP
              </VTab>
              <VTab value="storage">
                Storage
              </VTab>
              <VTab value="security">
                Security
              </VTab>
              <VTab value="tax">
                Tax
              </VTab>
              <VTab value="advanced">
                Advanced
              </VTab>
              <VTab value="seo">
                SEO
              </VTab>
            </VTabs>
          </VCol>

          <VCol
            cols="12"
            md="9"
          >
            <VTabsWindow v-model="activeTab">
              <VTabsWindowItem value="general">
                <SSGeneral
                  :value="siteSettings"
                  @save="saveSetting"
                />
              </VTabsWindowItem>
              <VTabsWindowItem value="admission-form">
                <SSAdmissionForm
                  :value="siteSettings"
                  @save="saveSetting"
                />
              </VTabsWindowItem>
              <VTabsWindowItem value="branding">
                <SSBranding
                  :value="siteSettings"
                  @save="saveSetting"
                />
              </VTabsWindowItem>

              <VTabsWindowItem value="social">
                <SSSocial
                  :value="siteSettings"
                  @save="saveSetting"
                />
              </VTabsWindowItem>

              <!--
                <VTabsWindowItem value="legal">
                <SSLegal
                :value="siteSettings"
                @save="saveSetting"
                />
                </VTabsWindowItem> 
              -->

              <VTabsWindowItem value="smtp">
                <SSSmtp
                  :value="siteSettings"
                  @save="saveSetting"
                />
              </VTabsWindowItem>

              <VTabsWindowItem value="storage">
                <SSStorage
                  :value="siteSettings"
                  @save="saveSetting"
                />
              </VTabsWindowItem>

              <VTabsWindowItem value="security">
                <SSSecurity
                  :value="siteSettings"
                  @save="saveSetting"
                />
              </VTabsWindowItem>

              <VTabsWindowItem value="tax">
                <SSTax
                  :value="siteSettings"
                  @save="saveSetting"
                />
              </VTabsWindowItem>

              <VTabsWindowItem value="advanced">
                <SSAdvanced
                  :value="siteSettings"
                  @save="saveSetting"
                />
              </VTabsWindowItem>
              <VTabsWindowItem value="seo">
                <SSSeo
                  :value="siteSettings"
                  @save="saveSetting"
                />
              </VTabsWindowItem>

              <!--
                <VTabsWindowItem value="emailtemplate">
                <SSEmailTemplate
                :value="siteSettings"
                @save="saveSetting"
                />
                </VTabsWindowItem> 
              -->
            </VTabsWindow>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </section>
</template>

<style scoped>
.site-settings-tabs :deep(.v-tab) {
  min-width: 100%;
  white-space: normal !important;
  text-align: left;
  height: auto !important;
  min-height: 48px;
  padding: 12px 16px;
  word-wrap: break-word;
  line-height: 1.4;
}

.site-settings-tabs :deep(.v-tab__content) {
  white-space: normal !important;
  word-wrap: break-word;
  line-height: 1.4;
  display: block !important;
}
</style>