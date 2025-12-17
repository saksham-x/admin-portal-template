import type { App } from "vue"
import { createRouter, createWebHistory } from "vue-router"
import { setupGuards } from "./guards"

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: "/dashboard",
      component: () => import("@/layouts/DefaultLayout.vue"),
      meta: {
        middleware: "auth",
      },
      children: [
        {
          path: "dashboard",
          name: "dashboard",
          component: () => import("@/views/pages/Dashboard.vue"),
          meta: {
            title: "Dashboard",
            closable: false,
            icon: "ri-dashboard-line",
            key: "fullPath",
          },
        },

        //admin profile

        {
          path: "admin-profile",
          name: "admin-profile",
          component: () => import("@/views/pages/profile/ProfilePage.vue"),
          meta: {
            requiresAuth: true,
            title: "Profile",
            icon: "ri-user-line",
            key: "fullPath",
          },
        },
        {
          path: "admin-profile/security",
          name: "admin-profile-security",
          component: () => import("@/views/pages/profile/SecurityPage.vue"),
          meta: {
            requiresAuth: true,
            title: "Security",
            icon: "ri-user-line",
            key: "fullPath",
          },
        },

       
        // CMS
        {
          path: "teams",
          name: "teams",
          component: () => import("@/views/pages/cms/teams/Teams.vue"),
          meta: {
            title: "Teams",
            icon: "ri-group-line",
            key: "fullPath",
          },
        },
        {
          path: "faq-category",
          name: "cms-faq-category",
          component: () =>
            import("@/views/pages/cms/faq/category/FaqCategory.vue"),
          meta: {
            title: "FAQ category",
            icon: "ri-questionnaire-line",
            key: "fullPath",
          },
        },
        {
          path: "faq",
          name: "cms-faq",
          component: () => import("@/views/pages/cms/faq/Faq.vue"),
          meta: {
            title: "FAQ",
            icon: "ri-question-line",
            key: "fullPath",
          },
        },
        {
          path: "blog",
          name: "cms-blog",
          component: () => import("@/views/pages/cms/blog/Blog.vue"),
          meta: {
            title: "Blog",
            icon: "ri-article-line",
            key: "fullPath",
          },
        },
        {
          path: "blog-category",
          name: "cms-blog-category",
          component: () =>
            import("@/views/pages/cms/blog/category/BlogCategory.vue"),
          meta: {
            title: "Blog category",
            icon: "ri-questionnaire-line",
            key: "fullPath",
          },
        },
        {
          path: "popup",
          name: "popup",
          component: () => import("@/views/pages/cms/popup/Popup.vue"),
          meta: {
            title: "Popup",
            icon: "ri-window-line",
            key: "fullPath",
          },
        },
        {
          path: "news-and-update",
          name: "news-and-update",
          component: () =>
            import("@/views/pages/cms/news-updates/NewsAndUpdate.vue"),
          meta: {
            title: "News & update",
            icon: "ri-newspaper-line",
            key: "fullPath",
          },
        },
        {
          path: "our-service",
          name: "cms-our-service",
          component: () =>
            import("@/views/pages/cms/our-service/OurService.vue"),
          meta: {
            title: "Our service",
            icon: "ri-service-line",
            key: "fullPath",
          },
        },
        {
          path: "page",
          name: "cms-page",
          component: () => import("@/views/pages/cms/page/Page.vue"),
          meta: {
            title: "Page",
            icon: "ri-pages-line",
            key: "fullPath",
          },
        },
        {
          path: "album",
          name: "album",

          component: () => import("@/views/pages/cms/album/Album.vue"),
          meta: {
            title: "Album",
            icon: "ri-image-line",
            key: "fullPath",
          },
        },
        {
          path: "/album/:id/value",
          name: "album-values",
          component: () =>
            import("@/views/pages/cms/album/value/AlbumValue.vue"),
          meta: {
            title: "Gallery",
            icon: "ri-image-line",
            key: "fullPath",
          },
        },

        {
          path: "menu",
          name: "menu",
          component: () => import("@/views/pages/cms/menu/Menu.vue"),
          meta: {
            title: "Menu",
            icon: "ri-menu-3-line",
            key: "fullPath",
          },
        },
        {
          path: "menu/:menuId/items",
          name: "menu-items",
          component: () =>
            import("@/views/pages/cms/menu/items/MenuItem.vue"),
          meta: {
            title: "Menu Items",
            icon: "ri-menu-line",
            key: "fullPath",
          },
        },
        {
          path: "enquiry",
          name: "enquiry",
          component: () => import("@/views/pages/cms/enquiry/Enquiry.vue"),
          meta: {
            title: "Enquiry",
            icon: "ri-customer-service-2-line",
            key: "fullPath",
          },
        },
        {
          path: "sliders",
          name: "sliders",
          component: () => import("@/views/pages/cms/sliders/Sliders.vue"),
          meta: {
            title: "Sliders",
            icon: "ri-slideshow-line",
            key: "fullPath",
          },
        },
        {
          path: "site-setting",
          name: "site-setting",
          component: () => import("@/views/pages/site-setting/SiteSetting.vue"),
          meta: {
            title: "Site settings",
            icon: "ri-settings-4-line",
            key: "fullPath",
          },
        },

        //EMail  Template
        {
          path: "email-template",
          name: "email-template",
          component: () =>
            import("@/views/pages/site-setting/Emailtemplate.vue"),
          meta: {
            title: "Email template",
            icon: "ri-mail-settings-line",
            key: "fullPath",
          },
        },

        //Admin Users

        {
          path: "admin-users",
          name: "admin-users",
          component: () => import("@/views/pages/admin-users/AdminUser.vue"),
          meta: {
            title: "Admin user",
            icon: "ri-shield-user-line",
            key: "fullPath",
          },
        },
        // Error & Other
        {
          path: "/404",
          name: "404",
          component: () => import("@/views/Error.vue"),
          meta: {
            title: "Error 404",
            icon: "ri-error-warning-line",
            key: "fullPath",
          },
        },
      ],
    },
    {
      path: "/",
      component: () => import("@/layouts/AuthLayout.vue"), // Auth layout wrapper
      children: [
        {
          path: "/login",
          name: "login",
          component: () => import("@/views/pages/auth/Login.vue"),
          meta: { unauthenticatedOnly: true }, // Redirect if logged in
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/404",
    },
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: "smooth", top: 60 }

    return { top: 0 }
  },
})

setupGuards(router)

export { router }

export default function (app: App) {
  app.use(router)
}
