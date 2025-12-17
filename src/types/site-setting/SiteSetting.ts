export type StorageType =
  | 'local'
  | 's3'
  | 'wasabi'
  | 'minio'
  | 'digitalocean'
  | string
export type ActionLinkAction =
  | 'open'
  | 'download'
  | 'nav'
  | 'external'
  | string

export interface SiteSetting {
  phone?: string | null
  email?: string | null
  vat_number?: string | null
  website?: string | null
  address?: string | null
  whatsapp?: string | null
  viber?: string | null
  pininterest?: string | null
  tiktok?: string | null
  linkedin?: string | null
  instagram?: string | null
  youtube?: string | null
  twitter?: string | null
  facebook?: string | null
  zoom_link?: string | null
  map_url?: string | null
  tagline?: string | null
  logo?: string | null // url/path
  email_logo_image?: string | null
  app_logo?: string | null
  enable_cookies?: boolean
  fav_icon?: string | null
  slogan?: string | null
  storage_type?: StorageType
  storage_endpoint?: string | null
  storage_access_key?: string | null
  storage_secret_key?: string | null
  storage_region?: string | null
  storage_bucket_name?: string | null
  storage_url?: string | null
  recaptcha_site_key?: string | null
  recaptcha_secret_key?: string | null
  mail_driver?: string | null // 'smtp' | 'ses' | etc.
  mail_host?: string | null
  mail_port?: number | null
  mail_user_name?: string | null
  mail_password?: string | null
  mail_encryption?: string | null // 'tls' | 'ssl' | null
  mail_sender_name?: string | null
  mail_sender_address?: string | null
  twilio_sid?: string | null
  twilio_token?: string | null
  twilio_from?: string | null
  date_format?: string | null // e.g. 'YYYY-MM-DD'
  enable_level?: boolean
  enable_buildings?: boolean
  tax_percentage?: number | null
  pan_no?: string | null
  vat_no?: string | null
  company_name?: string | null
  address_type?: string | null // 'billing' | 'shipping' | etc.
  footer_logo?: string | null
  total_email_sent?: number
  total_sms_sent?: number
  is_admission_form_active?: boolean
  seo_title?: string
  seo_keyword?: string
  seo_description?: string
}

export interface SiteSettingView extends SiteSetting {
  id: string
  logo_path?: { original: string; thumb: string }
  fav_icon_path?: { original: string; thumb: string }
  app_logo_path?: { original: string; thumb: string }
  email_logo_path?: { original: string; thumb: string }
  footer_logo_path?: { original: string; thumb: string }
  full_address: string | null
}
