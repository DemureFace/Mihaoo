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
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/promo',
    name: 'promo',
    component: PromoView,
    meta: {
      requiresAuth: true,
    },
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
    meta: {
      requiresAuth: true,
    },
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
    path: '/responsive-showcase',
    name: 'responsive-showcase',
    component: () => import('@/views/ResponsiveShowcaseView.vue'),
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
        component: () => import('@/views/analytics/AnalyticsTaskListView.vue'),

        meta: {
          section: 'analytics',
          subsection: 'tasks',
        },
      },

      {
        path: 'report',
        name: 'analytics-report',
        component: () => import('@/views/analytics/AnalyticsReportView.vue'),

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

const CHUNK_RELOAD_KEY = 'mihaoo:chunk-reload'

router.onError((error, to) => {
  const message = error?.message || String(error)

  const isChunkLoadError =
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Importing a module script failed') ||
    message.includes('error loading dynamically imported module')

  if (!isChunkLoadError) {
    return
  }

  const target =
    to?.fullPath || `${window.location.pathname}${window.location.search}${window.location.hash}`

  if (sessionStorage.getItem(CHUNK_RELOAD_KEY) === target) {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY)

    return
  }

  sessionStorage.setItem(CHUNK_RELOAD_KEY, target)

  window.location.assign(target)
})

router.afterEach((to) => {
  if (sessionStorage.getItem(CHUNK_RELOAD_KEY) === to.fullPath) {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY)
  }
})

router.beforeEach((to) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  if (!requiresAuth) {
    return true
  }

  const accessToken = localStorage.getItem('accessToken')

  if (accessToken) {
    return true
  }

  return {
    path: '/dashboard',
    query: {
      auth: 'login',
      redirect: to.fullPath,
    },
  }
})

export default router
