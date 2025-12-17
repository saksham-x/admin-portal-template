<script setup lang="ts">
import { SiteSettingView } from '@/types/site-setting/SiteSetting'

type BrandingAssetKey = 'logo' | 'fav_icon' | 'app_logo' | 'email_logo_image' | 'footer_logo'

const props = defineProps<{ value: SiteSettingView | null }>()
const emit = defineEmits<{ (e: 'save', payload: FormData): void }>()
const isSaving = ref(false)
const BRANDING_ASSET_KEYS: readonly BrandingAssetKey[] = ['logo', 'fav_icon', 'app_logo', 'email_logo_image', 'footer_logo'] as const

// UI config for each asset
const ASSET_UI: Record<BrandingAssetKey, { label: string; accept: string; hint: string }> = {
  logo: {
    label: 'Logo',
    accept: 'image/*',
    hint: 'Recommended: 600x200px, PNG or JPG',
  },
  fav_icon: {
    label: 'Favicon',
    accept: 'image/*,.ico',
    hint: 'Recommended: 32x32px or 64x64px, PNG or ICO',
  },
  app_logo: {
    label: 'App logo',
    accept: 'image/*',
    hint: 'Recommended: 200x80px, PNG with transparent background',
  },
  email_logo_image: {
    label: 'Email logo',
    accept: 'image/*',
    hint: 'Recommended: 600x200px, PNG or JPG for email templates',
  },
  footer_logo: {
    label: 'Footer logo',
    accept: 'image/*',
    hint: 'Recommended: 200x80px, PNG with transparent background',
  },
}

const API_BASE = import.meta.env.VITE_API_URL || window.location.origin

const normalizeUrl = (url: string) => url.replace(/([^:]\/)\/+/g, '$1')

const forceHost = (absOrRel: string) => {
  try {
    const u = new URL(absOrRel, API_BASE)
    const base = new URL(API_BASE)

    u.protocol = base.protocol
    u.host = base.host

    return normalizeUrl(u.toString())
  } catch {
    return normalizeUrl(`${API_BASE}${absOrRel.startsWith('/') ? '' : '/'}${absOrRel}`)
  }
}

const getImageCandidates = (assetKey: BrandingAssetKey) => {
  const list: string[] = []
  const settings = props.value
  if (!settings) return list

  let pathObj: any = null
  let imageProp: string | null = null

  switch (assetKey) {
  case 'logo':
    pathObj = settings.logo_path
    imageProp = settings.logo as any
    break
  case 'fav_icon':
    pathObj = settings.fav_icon_path
    imageProp = settings.fav_icon as any
    break
  case 'app_logo':
    pathObj = settings.app_logo_path
    imageProp = settings.app_logo as any
    break
  case 'email_logo_image':
    pathObj = settings.email_logo_path
    imageProp = settings.email_logo as any
    break
  case 'footer_logo':
    pathObj = settings.footer_logo_path
    imageProp = settings.footer_logo as any
    break
  }

  if (imageProp && imageProp.startsWith('/images/')) {
    list.push(normalizeUrl(`${API_BASE}${imageProp}`))
  }

  if (pathObj?.thumb) list.push(forceHost(pathObj.thumb))
  if (pathObj?.original) list.push(forceHost(pathObj.original))

  if (imageProp && /^https?:\/\//i.test(imageProp)) {
    list.push(forceHost(imageProp))
  }

  // Bare filename in DB (common Laravel pattern)
  if (imageProp && !imageProp.startsWith('/')) {
    list.push(normalizeUrl(`${API_BASE}/uploads/setting/${imageProp}`))

    // fallback path you previously used; keep if needed:
    list.push(normalizeUrl(`${API_BASE}/uploads/uploads/setting/${imageProp}`))
  }

  // Final fallback placeholder
  list.push(normalizeUrl(`${API_BASE}/images/placeholder.png`))

  return [...new Set(list)]
}

const getFullImageUrl = (assetKey: BrandingAssetKey) => {
  const candidates = getImageCandidates(assetKey)

  return candidates[0] || ''
}

const handleImageError = (e: Event, assetKey: BrandingAssetKey) => {
  const el = e?.target as HTMLImageElement | null
  if (!el) return
  const candidates = getImageCandidates(assetKey)
  const current = el.src
  const idx = candidates.findIndex(u => u === current || u === decodeURI(current))
  const next = candidates[idx + 1]

  if (next) el.src = next
}

const imagePreviewUrls: Record<BrandingAssetKey, string> = reactive({
  logo: '',
  fav_icon: '',
  app_logo: '',
  email_logo_image: '',
  footer_logo: '',
})

const selectedFiles: Record<BrandingAssetKey, File | null> = reactive({
  logo: null,
  fav_icon: null,
  app_logo: null,
  email_logo_image: null,
  footer_logo: null,
})

const handleFileSelection = (file: File | File[] | null, assetKey: BrandingAssetKey) => {
  const selectedFile: File | null = Array.isArray(file) ? (file[0] ?? null) : file

  if (imagePreviewUrls[assetKey] && imagePreviewUrls[assetKey].startsWith('blob:')) {
    URL.revokeObjectURL(imagePreviewUrls[assetKey])
  }

  selectedFiles[assetKey] = selectedFile
  imagePreviewUrls[assetKey] = selectedFile ? URL.createObjectURL(selectedFile) : getFullImageUrl(assetKey)
}

const saveBrandingAssets = async () => {
  isSaving.value = true
  try {
    const formData = new FormData()

    BRANDING_ASSET_KEYS.forEach(key => {
      const file = selectedFiles[key]
      if (file instanceof File) {
        formData.append(key, file, file.name)
      }
    })

    emit('save', formData)

    await new Promise(resolve => setTimeout(resolve, 500))
  } finally {
    isSaving.value = false
  }
}

watch(
  () => props.value,
  (settings: SiteSettingView | null) => {
    if (settings) {
      BRANDING_ASSET_KEYS.forEach(k => {
        imagePreviewUrls[k] = getFullImageUrl(k)
      })
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  BRANDING_ASSET_KEYS.forEach(key => {
    const url = imagePreviewUrls[key]
    if (url && url.startsWith('blob:')) URL.revokeObjectURL(url)
  })
})
</script>

<template>
  <VCard flat>
    <VCardText>
      <VRow class="gy-6">
        <VCol
          v-for="key in BRANDING_ASSET_KEYS"
          :key="key"
          cols="12"
        >
          <div class="d-flex align-center gap-4">
            <VAvatar size="56">
              <img
                :src="imagePreviewUrls[key]"
                :alt="ASSET_UI[key].label"
                style="width: 100%; height: 100%; object-fit: cover;"
                @error="(e) => handleImageError(e, key)"
              >
            </VAvatar>

            <div class="flex-grow-1">
              <VFileInput
                :label="ASSET_UI[key].label"
                :accept="ASSET_UI[key].accept"
                density="comfortable"
                clearable
                @update:model-value="(f: any) => handleFileSelection(f, key)"
              />
              <div class="text-caption text-disabled mt-1">
                {{ ASSET_UI[key].hint }}
              </div>
            </div>
          </div>
        </VCol>

        <VCol
          cols="12"
          class="d-flex justify-end"
        >
          <VBtn
            color="primary"
            size="large"
            :loading="isSaving"
            :disabled="isSaving"
            @click="saveBrandingAssets"
          >
            Save Changes
          </VBtn>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
