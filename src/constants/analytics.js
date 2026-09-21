export const ANALYTICS_PLATFORMS = [
  { value: 'SS', label: 'SS' },
  { value: 'P8', label: '8P' },
  { value: 'TL', label: 'TL' },
]

export const ANALYTICS_BRANDS = [
  { value: 'JC', label: 'JC' },
  { value: 'MW', label: 'MW' },
  { value: 'SR', label: 'SR' },
  { value: 'SG', label: 'SG' },
  { value: 'BH', label: 'BH' },
  { value: 'WR', label: 'WR' },
  { value: 'RO', label: 'RO' },
  { value: 'RANDOM', label: 'Random' },
]

export const ANALYTICS_TASK_TYPES = [
  {
    value: 'NETWORK_TOURNAMENT',
    label: 'Network Tournament',
  },
  {
    value: 'PROMO',
    label: 'Promo',
  },
  {
    value: 'SLIDER',
    label: 'Slider',
  },
  {
    value: 'PROMO_LANDING',
    label: 'Promo Landing',
  },
  {
    value: 'AFFILIATE_LANDING',
    label: 'Affiliate Landing',
  },
  {
    value: 'LEGAL',
    label: 'Legal',
  },
  {
    value: 'TRANSLATION_KEY',
    label: 'Translation Key',
  },
]

export const ANALYTICS_STATUSES = [
  {
    value: 'IN_PROGRESS',
    label: 'In Progress',
  },
  {
    value: 'DONE',
    label: 'Done',
  },
]

export function createDefaultAnalyticsFilters() {
  return {
    search: '',
    from: '',
    to: '',
    executorId: '',
    brand: '',
    platform: '',
    taskType: '',
    requestedById: '',
    status: '',
  }
}
