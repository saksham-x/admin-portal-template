import { useAbility } from '@casl/vue'
import type { RouteLocationNormalized } from 'vue-router'
import type { NavGroup } from '@/types/layouts'

export const can = (action: string | undefined, subject: string | undefined) => {
  const vm = getCurrentInstance()

  if (!vm)
    return false

  const localCan = vm.proxy && '$can' in vm.proxy

  return localCan ? (vm.proxy as any)?.$can(action, subject) : true
}

export const canViewNavMenuGroup = (item: NavGroup) => {
  const hasAnyVisibleChild = item.children.some(i => can(i.action, i.subject))

  if (!(item.action && item.subject))
    return hasAnyVisibleChild

  return can(item.action, item.subject) && hasAnyVisibleChild
}

export const canNavigate = (to: RouteLocationNormalized) => {
  const ability = useAbility()

  return to.matched.some(route => {
    const meta = route.meta as any

    return ability.can(meta.action, meta.subject)
  })
}
