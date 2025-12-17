import type { Router } from "vue-router"

import { useAuthStore } from "@/store/auth"
import { useCookie } from "@/composable/useCookie"

export const setupGuards = (router: Router) => {
  router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore()
    
    const accessToken = useCookie("accessToken").value
    const userData = useCookie("userData").value

    const isLoggedIn =
      authStore.isAuthenticated || (!!userData && !!accessToken)

    if (
      to.meta.unauthenticatedOnly &&
      isLoggedIn &&
      authStore.isAuthenticated
    ) {
      if (to.name === "dashboard") return next() // Avoid re-redirecting to the same page

      return next({ name: "dashboard" }) // Redirect to dashboard if logged in
    }

    if (
      to.meta.middleware === "auth" &&
      !isLoggedIn
    ) {
      if (to.name === "login") return next() // Avoid re-redirecting to login

      return next({
        name: "login",
        query: { to: to.fullPath !== "/" ? to.path : undefined },
      })
    }

    return next()
  })
}
