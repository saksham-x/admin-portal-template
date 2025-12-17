import { useSiteSettingStore } from '@/store/siteSetting'

export function useSiteSetting() {
  const storeOrg = useSiteSettingStore()

  return computed(() => storeOrg.setting)
}

export function useSiteSettingLoader() {
  const storeOrg = useSiteSettingStore()

  return computed(() => storeOrg.settingLoading)
}
