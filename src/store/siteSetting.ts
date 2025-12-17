import SiteSettingService from '@/services/site-setting/SiteSettingService'
import type { SiteSettingView } from '@/types/site-setting/SiteSetting'

const settingService = new SiteSettingService()

export const useSiteSettingStore = defineStore('siteSetting', () => {
  const settingLoading = ref(false)

  const setting = ref<SiteSettingView>({
    id: '',
    full_name: '',
    logo_path: null,
    favicon_path: null,
    full_address: null,
  })

  const getOrganisationByName = async () => {
    try {
      const { data } = await settingService.getSetting()

      if (data)
        setting.value = data
    }
    catch (err) {
      showError(err)
    }
    finally {
      settingLoading.value = false
    }
  }

  return { setting, settingLoading, getOrganisationByName }
})
