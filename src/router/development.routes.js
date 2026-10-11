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
    meta: { section: 'development', subsection: 'roadmaps', requiresAuth: true },
  },
  {
    path: '/development/roadmaps/:id',
    name: 'development-workspace',
    component: () => import('@/views/development/DevelopmentWorkspaceView.vue'),
    meta: { section: 'development', subsection: 'roadmaps', requiresAuth: true },
  },
  {
    path: '/development/roadmaps/:id/edit',
    name: 'development-builder',
    component: () => import('@/views/development/DevelopmentBuilderView.vue'),
    meta: { section: 'development', subsection: 'roadmaps', requiresAuth: true },
  },
  {
    path: '/development/templates',
    name: 'development-templates',
    component: () => import('@/views/development/DevelopmentTemplatesView.vue'),
    meta: { section: 'development', subsection: 'templates', requiresAuth: true },
  },
  {
    path: '/development/imports',
    name: 'development-imports',
    component: () => import('@/views/development/DevelopmentImportsView.vue'),
    meta: { section: 'development', subsection: 'imports', requiresAuth: true },
  },
  {
    path: '/development/imports/:id',
    name: 'development-import-detail',
    component: () => import('@/views/development/DevelopmentImportsView.vue'),
    meta: { section: 'development', subsection: 'imports', requiresAuth: true },
  },
]
