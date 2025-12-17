import { helpers } from '@vuelidate/validators'

const baseUrlValidator = (v: any): boolean => {
  try {
    const url = new URL(String(v))

    // Only allow http / https
    if (!['http:', 'https:'].includes(url.protocol)) return false

    const parts = url.hostname.split('.')
    if (parts.length < 2) return false

    const tld = parts[parts.length - 1]
    if ((tld as any).length < 2) return false

    return true
  } catch {
    return false
  }
}

export const isValidHttpUrl = (v: any): boolean => {
  try {
    const url = new URL(String(v))

    // Only allow http / https
    if (!['http:', 'https:'].includes(url.protocol)) return false

    const parts = url.hostname.split('.')
    if (parts.length < 2) return false

    const tld = parts[parts.length - 1]
    if ((tld as any).length < 2) return false

    return true
  } catch {
    return false
  }
}

//  Required URL (field must be filled & valid)
export const urlRule = helpers.withMessage(
  'Enter a valid URL with domain (e.g. http://example.com)',
  (v: any) => {
    if (!v) return false

    return baseUrlValidator(v)
  },
)

//  Optional URL (empty allowed, but if present must be valid)
export const optionalUrlRule = helpers.withMessage(
  'Enter a valid URL with domain (e.g. http://example.com)',
  (v: any) => {
    if (!v) return true

    return baseUrlValidator(v)
  },
)
