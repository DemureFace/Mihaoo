export const CHECKLISTS = [
  {
  slug: 'pre-merge-qa',
  title: 'Швидкий чек перед злиттям',
  description: 'AC виконані, консоль без помилок, адаптивність перевірена.',
  createdAt: '2025-09-20T10:00:00+03:00',
  items: [
  { id: 'ac', text: 'Acceptance Criteria виконані' },
  { id: 'console', text: 'Консоль без помилок' },
  { id: 'i18n', text: 'Локалізація на місці' },
  { id: 'responsive', text: 'Адаптивність: моб, таб, десктоп' }
  ]
  },
  {
  slug: 'promo-tournament',
  title: 'Турнірна промо',
  description: 'Таймер, геообмеження, лінки, лідерборд.',
  createdAt: '2025-09-23T09:00:00+03:00',
  items: [
  { id: 'dates', text: 'Start/End у TZ Europe/Kyiv' },
  { id: 'geo', text: 'Geo-обмеження працюють' },
  { id: 'timer', text: 'Таймер відлічує коректно' },
  { id: 'link', text: 'Посилання веде на актуальну сторінку' }
  ]
  }
  ]
