// Curated frontend release notes, not a live news API or deployment log.
export const productUpdates = [
  {
    id: 'responsive-model',
    date: '2026-10-06',
    category: 'Interface',
    title: 'Адаптивний інтерфейс і галерея прикладів',
    summary:
      'Навігація на малих екранах відкривається як drawer. Форми адаптуються до ширини контейнера, а щільні таблиці прокручуються всередині секції.',
    details:
      'На сторінці Responsive можна спробувати приклади Analytics, генераторів, Checklists, Banner Export і Maps. Перемикач ширини — preview контейнера, а не емуляція пристрою.',
    route: '/responsive-showcase',
    action: 'Відкрити галерею',
  },
  {
    id: 'banner-auth',
    date: '2026-10-06',
    category: 'Tools',
    title: 'Banner Export: авторизоване завантаження ZIP',
    summary:
      'Запити експорту й завантаження архіву використовують спільний API-клієнт із JWT. Токен не додається до URL.',
    details:
      'Доступ до Figma та фактичне виконання export job залежать від backend і прав облікового запису. Повідомлення про помилки API показуються окремо.',
    route: '/banner-export',
    action: 'Відкрити Banner Export',
  },
  {
    id: 'server-checklists',
    date: '2026-10-06',
    category: 'Workflow',
    title: 'Локальні та серверні чеклісти — окремі джерела',
    summary:
      'На сторінці Checklists доступний окремий блок серверних списків: завантаження з API, заповнення й явне збереження виконання.',
    details:
      'Локальні визначення, групи та прогрес не імпортуються автоматично. Для серверних списків потрібен Login; доступність API й збереження потребують інтеграційної перевірки.',
    route: '/checklists',
    action: 'Відкрити Checklists',
  },
  {
    id: 'currency-modes',
    date: '2026-10-06',
    category: 'Tools',
    title: 'Currency Converter: локальний і серверний режими',
    summary:
      'Локальні Content / Data / Snippet залишаються доступними. Backend mode надсилає текст на конвертацію лише після натискання Convert.',
    details:
      'Серверний режим потребує Login та повертає локалізовані результати й переклади. Помилка API не підміняється локальним результатом.',
    route: '/currency-converter',
    action: 'Відкрити конвертер',
  },
]
