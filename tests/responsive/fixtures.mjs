// Synthetic local-only UI fixtures. These are not verified backend contracts.
export const longText = 'Fixture_' + 'LongUnbrokenText'.repeat(12)
export const member = { id: 1, displayName: 'Fixture Specialist', email: 'fixture@example.test' }
export const brand = { code: 'JC', name: 'Fixture Brand', platform: 'SS' }
export const referenceData = {
  platforms: [{ code: 'SS', name: 'Fixture Platform' }],
  taskTypes: [{ code: 'PROMO', name: 'Fixture Promo' }],
  brands: [brand],
  brandsByPlatform: { SS: [brand] },
}
export const taskGroup = {
  id: 1,
  title: longText,
  description: 'Synthetic responsive fixture description',
  jiraKey: 'FIXTURE-1',
  platform: 'SS',
  taskType: 'PROMO',
  requestedById: 1,
  reportDate: '2026-10-06',
  dueDate: '2026-10-09',
}
export const taskRow = {
  id: 1,
  taskGroupId: 1,
  taskGroup,
  brand: 'JC',
  executorId: 1,
  executor: member,
  storyPoints: 1.5,
  status: 'IN_PROGRESS',
}
export const taskDetails = { ...taskGroup, requestedBy: member, brands: [taskRow], comments: [] }
export const map = {
  id: 'responsive-fixture',
  title: 'Responsive fixture map',
  description: longText,
  type: 'blank',
  status: 'draft',
  createdAt: '2026-10-06T00:00:00Z',
  updatedAt: '2026-10-06T00:00:00Z',
  nodes: [
    {
      id: 'node-1',
      type: 'mihaoo',
      position: { x: 80, y: 80 },
      data: { title: 'Fixture Step', description: longText, type: 'step', status: 'draft' },
    },
  ],
  edges: [],
}
export const checklist = {
  slug: 'responsive-fixture',
  title: 'Responsive fixture checklist',
  description: longText,
  createdAt: '2026-10-06T00:00:00Z',
  items: [{ id: 'item-1', type: 'check', text: longText }],
}
export function responseFor(path, method, mode = 'populated') {
  if (path === '/auth/profile')
    return { body: { sub: 1, email: 'fixture@example.test', roles: [] } }
  if (path === '/reference-data') return { body: referenceData }
  if (path === '/team-members') return { body: [member] }
  if (path === '/sprints')
    return {
      body: [{ id: 1, name: 'Fixture Sprint', startDate: '2026-10-05', endDate: '2026-10-11' }],
    }
  if (path === '/tasks/export')
    return {
      text: 'id,title\n1,Fixture\n',
      contentType: 'text/csv',
      headers: { 'content-disposition': 'attachment; filename="fixture.csv"' },
    }
  if (path === '/tasks' && method === 'GET') {
    if (mode === 'error') return { status: 503, body: { message: 'Isolated fixture failure' } }
    return { body: { items: mode === 'empty' ? [] : [taskRow], total: mode === 'empty' ? 0 : 1 } }
  }
  if (path === '/tasks/1') return { body: taskDetails }
  if (path === '/tasks' && method === 'POST')
    return { delay: 600, status: 503, body: { message: 'Isolated save failure' } }
  if (
    path.startsWith('/bonus-templates/generate') ||
    path.startsWith('/tournament-templates/generate')
  ) {
    return {
      body: {
        slug: longText,
        template: `<article>${longText}</article>`,
        card: '<p>Fixture card</p>',
        rulesHtml: '<p>Fixture rules</p>',
      },
    }
  }
  if (path === '/banner-exports/inspect')
    return {
      body: {
        fileKey: 'fixture',
        sourceNodeId: '1:1',
        sourceName: longText,
        banners: [{ id: '1:2', name: longText, width: 1200, height: 600, type: 'desktop' }],
      },
    }
  return null
}
