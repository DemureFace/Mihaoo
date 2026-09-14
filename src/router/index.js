import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/DashboardView.vue'
import TournamentView from '@/views/TournamentView.vue'
import DashboardView from '@/views/DashboardView.vue'
import PromoView from '@/views/PromoView.vue'
import CalendarView from '@/views/CalendarView.vue'
import CurrencyConverterView from '@/views/CurrencyConverterView.vue'
import NewsView from '@/views/NewsView.vue'
import CheckListsView from '@/views/CheckListsView.vue'
import ChecklistDetailView from '@/views/ChecklistDetailView.vue'
import BannerExport from '@/views/BannerExport.vue'
import MapsView from '@/views/MapsView.vue'
import MapView from '@/views/MapView.vue'
import MapEditorView from '@/views/MapEditorView.vue'

const routes = [
  {
    path: '/',
    redirect: '/home',
  },

  {
    path: '/home',
    name: 'home',
    component: HomeView,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
  },

  {
    path: '/tournaments',
    name: 'tournaments',
    component: TournamentView,
  },

  {
    path: '/promo',
    name: 'promo',
    component: PromoView,
  },

  {
    path: '/news',
    name: 'news',
    component: NewsView,
  },

  {
    path: '/currency-converter',
    name: 'currency-converter',
    component: CurrencyConverterView,
  },

  {
    path: '/calendar',
    name: 'calendar',
    component: CalendarView,
  },

  {
    path: '/checklists',
    name: 'checklists',
    component: CheckListsView,
  },

  {
    path: '/checklists/:slug',
    name: 'checklist-detail',
    component: ChecklistDetailView,
    props: true,
  },

  {
    path: '/banner-export',
    name: 'banner-export',
    component: BannerExport,
  },
  {
  path: '/maps',
  name: 'maps',
  component: MapsView,
},
{
  path: '/maps/:id',
  name: 'map-view',
  component: MapView,
  props: true,
},
{
  path: '/maps/:id/edit',
  name: 'map-edit',
  component: MapEditorView,
  props: true,
},

  {
    path: '/analytics',
    component: () => import('@/views/analytics/AnalyticsView.vue'),

    redirect: {
      name: 'analytics-tasks',
    },

    meta: {
      section: 'analytics',
      requiresAuth: true,
    },

    children: [
      {
        path: 'tasks',
        name: 'analytics-tasks',
        component: () =>
          import('@/views/analytics/AnalyticsTaskListView.vue'),

        meta: {
          section: 'analytics',
          subsection: 'tasks',
        },
      },

      {
        path: 'report',
        name: 'analytics-report',
        component: () =>
          import('@/views/analytics/AnalyticsReportView.vue'),

        meta: {
          section: 'analytics',
          subsection: 'report',
        },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes,

  scrollBehavior() {
    return {
      top: 0,
    }
  },
})

// Глобальний Guard
// Поки він вимкнений, meta.requiresAuth ні на що не впливає.
//
// router.beforeEach((to, from, next) => {
//   const isAuthenticated = Boolean(localStorage.getItem('authToken'))
//   const requiresAuth = to.matched.some(
//     (record) => record.meta.requiresAuth,
//   )
//
//   if (requiresAuth && !isAuthenticated) {
//     next('/login')
//     return
//   }
//
//   if (to.path === '/login' && isAuthenticated) {
//     next('/home')
//     return
//   }
//
//   next()
// })

export default router
