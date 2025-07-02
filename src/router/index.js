import { createRouter, createWebHistory } from 'vue-router'
import BasicAuth from '../components/BasicAuth.vue'
// import HomeView from '../views/PromoView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: BasicAuth,
    },
    // {
    //   path: '/home',
    //   name: 'home',
    //   component: HomeView,
    //   beforeEnter: (to, from, next) => {
    //     const token = localStorage.getItem('authToken')
    //     if (!token) {
    //       next('/')
    //     } else {
    //       next()
    //     }
    //   },
    // },
  ],
})

export default router
