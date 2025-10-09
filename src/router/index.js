import { createRouter, createWebHistory } from 'vue-router'
import BasicAuth from '../components/BasicAuth.vue'
import HomeView from '../views/PromoView.vue'
import CheckListsView from '@/views/CheckListsView.vue';
import ChecklistDetailView from '@/views/ChecklistDetailView.vue';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: BasicAuth,
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true }, // Метка для защиты маршрута
  },
  {
    path: '/',
    redirect: '/home', // Корень будет редиректить в /home
  },
  { path: '/checklists', name: 'checklists', component: CheckListsView },
  { path: '/checklists/:slug', name: 'checklist', component: ChecklistDetailView, props: true }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() { return { top: 0 }; }
})

// Глобальный Guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('authToken')
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    // Если уже вошёл и зашёл на /login, редирект на /home
    next('/home')
  } else {
    next()
  }
})

export default router
