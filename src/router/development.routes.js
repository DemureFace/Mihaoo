export const developmentRoutes = [
  {
    path: '/development',
    name: 'development',
    redirect: { name: 'development-roadmaps' },
    meta: { section: 'development', requiresAuth: true },
  },
  {
    path: '/development/roadmaps',
    name: 'development-roadmaps',
    component: () => import('@/views/development/DevelopmentRoadmapsView.vue'),
    meta: { section: 'development', requiresAuth: true },
  },
  {
    path: '/development/roadmaps/:id',
    name: 'development-workspace',
    component: () => import('@/views/development/DevelopmentWorkspaceView.vue'),
    meta: { section: 'development', requiresAuth: true },
  },
]
