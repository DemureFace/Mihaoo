export const CHECKLISTS = [
  {
    slug: 'promo-page',
    title: '[SS]Promotions',
    description: 'Чек перед релізом промо-сторінки.',
    createdAt: '2025-09-25T09:00:00+03:00',
    sections: [
      {
        id: 'first-sec',
        title: '1. Страница Promotions', // якщо не треба заголовок секції — став null
        items: [
          { id: 'title-descr', type: 'check', text: 'Тайтл і коротке описание соответствует задаче' },
          { id: 'short-descr', type: 'check', text: 'Краткое описание с условиями и датами присутствует' },
          { id: 'bonus-code-propisan', type: 'check', text: 'Прописан корректный Bonus Code' },
          { id: 'all-bonuses-listed', type: 'check', text: 'Приведены все доступные бонусы и их условия (сумма депозита, % кешбэка, вейджер, FS)' },
          { id: 'all-links-clickable', type: 'check', text: 'Все ссылки (Bonus Rules, Terms & Conditions) кликабельны и ведут на правильные страницы' },
          {
            id: 'bonus-rules-block',
            type: 'group',
            text: 'Блок «Bonus Rules» содержит:',
            children: [
              { id: 'period', type: 'check', text: 'период проведения промо' },
              { id: 'code-deposit-cashback-fs', type: 'check', text: 'бонускод, сумма депозита, % кешбэка, FS совпадают с описанием' },
              { id: 'each-bonus-conditions', type: 'check', text: 'условия получения каждого бонуса' },
              { id: 'wager-per-level', type: 'check', text: 'вейджер для каждого уровня' },
              { id: 'bonus-expiry', type: 'check', text: 'срок действия бонуса' },
              { id: 'limits', type: 'check', text: 'ограничения по ставкам и выигрышам' },
              { id: 'tech-conditions', type: 'check', text: 'технические условия (активация, поддержка, ручная выдача)' },
            ],
          },
          { id: 'code-matches', type: 'check', text: 'Bonus Code совпадает с условием в задаче' },
          { id: 'get-bonus-btn', type: 'check', text: 'Кнопка Get Bonus работает и ведет на корректное действие' },
          { id: 'currency-snippets', type: 'check', text: 'Добавлены валютные сниппеты' },
          { id: 'pokies-au', type: 'check', text: 'Slots для AU гео отображается как Pokies' },
          { id: 'responsive-check', type: 'check', text: 'Проверка отображения на мобильной и десктопной версии' },
        ],
      },
      {
        id: 'second-sec',
        title: '2. Карточка на странице всех Promotions', // якщо не треба заголовок секції — став null
        items: [
          { id: 'card-added', type: 'check', text: 'Карточка добавлена в общий список Promotions' },
          { id: 'show-title', type: 'check', text: 'Отображается название промо' },
          { id: 'short-descr', type: 'check', text: 'Есть краткое описание' },
          { id: 'link', type: 'check', text: 'Ссылка с карточки ведет на страницу промо' },
          { id: 'responsive-check', type: 'check', text: 'Проверена адаптивность отображения карточки' },
          { id: 'group-check', type: 'check', text: 'Проверено отображение по группам' },
        ],
      },
      {
        id: 'third-sec',
        title: '3. Главная страница и слайдер', // якщо не треба заголовок секції — став null
        items: [

            {
              id: 'card-added',
              type: 'check',
              text: 'Добавлен баннер или слайд промо',
            },
            {
              id: 'show-title',
              type: 'check',
              text: 'Указано название промо',
            },
            {
              id: 'short-descr',
              type: 'check',
              text: 'Присутствует краткое описание',
            },
            {
              id: 'link',
              type: 'check',
              text: 'Баннер кликабелен и ведет на страницу промо',
            },
            {
              id: 'responsive-check',
              type: 'check',
              text: 'Проверено отображение на всех устройствах desktop и mobile',
            },
            {
              id: 'slider-rotation',
              type: 'check',
              text: 'Слайдер работает корректно и промо появляется в ротации',
            },
            {
              id: 'group-check',
              type: 'check',
              text: 'Проверено отображение по группам',
            },
        ],
      },
      {
        id: 'third-sec',
        title: '✅ Финальная проверка:', // якщо не треба заголовок секції — став null
        items: [
            {
              id: 'sync',
              type: 'check',
              text: 'Все элементы синхронизированы (названия, даты, проценты кешбэка везде одинаковые)',
            },
            {
              id: 'show-title',
              type: 'check',
              text: 'Ничего не дублируется и не противоречит условиям',
            },
            {
              id: 'check-loc',
              type: 'check',
              text: 'Проверка всех локалей бренда',
            },
        ],
      },
    ],
  },
  {
    slug: 'tourn-page',
    title: '[SS]Страница Tournaments',
    description: 'Чек перед релізом турнірної сторінки',
    createdAt: '2025-09-25T09:00:00+03:00',
    sections: [
      {
        id: 'sec-tournament-page',
        title: '1. Страница Турнира',
        items: [
          { id: 'tourn-title', type: 'check', text: 'Заголовок турнира соответствует задаче' },
          { id: 'prize-pool', type: 'check', text: 'Указан общий призовой фонд турнира' },
          { id: 'tourn-timer', type: 'check', text: 'Добавлен таймер до конца турнира' },
          { id: 'currency-geo', type: 'check', text: 'Валюта корректно отображается в зависимости от GEO или IP' },
          { id: 'responsive', type: 'check', text: 'Проверено отображение на desktop и mobile' },
        ],
      },

      {
        id: 'sec-terms',
        title: '2. Блок «Термзы» (Правила турнира)',
        items: [
          { id: 'terms-period', type: 'check', text: 'Четко указан период проведения турнира' },
          { id: 'terms-prize', type: 'check', text: 'Прописан общий призовой фонд' },
          {
            id: 'terms-conditions',
            type: 'check',
            text: 'Указаны условия участия (минимальная ставка, количество спинов, механика)',
          },
          {
            id: 'unique-mechanics',
            type: 'check',
            text: 'Описана уникальная механика турнира, если предусмотрена',
          },
          {
            id: 'win-rules',
            type: 'check',
            text: 'Прописаны правила распределения выигрышей',
          },
          {
            id: 'terms-currency',
            type: 'check',
            text: 'Отображение валюты в правилах корректно в зависимости от гео',
          },
          {
            id: 'terms-link',
            type: 'check',
            text: 'Присутствует ссылка на общие Terms & Conditions',
          },
        ],
      },

      {
        id: 'sec-card-all',
        title: '3. Карточка турнира на странице «Все турниры»',
        items: [
          { id: 'card-added-all', type: 'check', text: 'Карточка турнира добавлена в общий список' },
          { id: 'card-title-all', type: 'check', text: 'Указано название турнира' },
          { id: 'card-prize-all', type: 'check', text: 'Прописан общий призовой фонд' },
          { id: 'card-timer-all', type: 'check', text: 'Добавлен таймер с обратным отсчетом' },
          {
            id: 'card-link-all',
            type: 'check',
            text: 'Ссылка с карточки ведет на страницу турнира',
          },
          {
            id: 'card-responsive-all',
            type: 'check',
            text: 'Проверено адаптивное отображение карточки',
          },
          {
            id: 'card-geo-all',
            type: 'check',
            text: 'Карточка турнира отображается для всех доступных стран провайдера',
          },
        ],
      },

      {
        id: 'sec-card-main',
        title: '4. Главная страница',
        items: [
          { id: 'card-added-main', type: 'check', text: 'Карточка турнира добавлена в общий список' },
          { id: 'card-title-main', type: 'check', text: 'Указано название турнира' },
          { id: 'card-prize-main', type: 'check', text: 'Прописан общий призовой фонд' },
          { id: 'card-timer-main', type: 'check', text: 'Добавлен таймер с обратным отсчетом' },
          {
            id: 'card-link-main',
            type: 'check',
            text: 'Ссылка с карточки ведет на страницу турнира',
          },
          {
            id: 'card-responsive-main',
            type: 'check',
            text: 'Проверено адаптивное отображение карточки',
          },
          {
            id: 'card-geo-main',
            type: 'check',
            text: 'Карточка турнира отображается для всех доступных стран провайдера',
          },
        ],
      },

      {
        id: 'sec-final',
        title: '✅ Финальная проверка',
        items: [
          {
            id: 'sync-data',
            type: 'check',
            text: 'Все данные синхронизированы между страницами (название, призовой фонд, даты, механика)',
          },
          {
            id: 'timers-ok',
            type: 'check',
            text: 'Таймеры работают корректно и совпадают с периодом проведения',
          },
          {
            id: 'currency-ok',
            type: 'check',
            text: 'Валюта отображается корректно в зависимости от гео',
          },
          {
            id: 'browsers-test',
            type: 'check',
            text: 'Тестирование в основных браузерах и на мобильных устройствах пройдено',
          },
          {
            id: 'geo-final',
            type: 'check',
            text: 'Карточка турнира отображается для всех доступных стран провайдера',
          },
        ],
      },
    ],
  },
  {
    slug: 'promo-landing',
    title: '[SS]Promo Landing',
    description: 'Чек перед релізом Promo Landing і повʼязаних елементів.',
    createdAt: '2025-09-25T09:00:00+03:00',
    sections: [
      {
        id: 'sec-1',
        title: '1. Страница Promo Landing',
        items: [
          { id: 'pl-title', type: 'check', text: 'Отображается корректное название Promo Landing' },
          { id: 'pl-dates', type: 'check', text: 'Прописаны даты начала и конца' },
          { id: 'pl-prize', type: 'check', text: 'Указан общий прайз пул' },
          { id: 'pl-cta', type: 'check', text: 'Присутствует блок с CTA' },
          {
            id: 'pl-timer',
            type: 'check',
            text: 'Таймер с обратным отсчетом работает и синхронизирован с периодом акции',
          },
          {
            id: 'pl-period-badge',
            type: 'check',
            text: 'На промо добавлена плашка с периодом проведения промо',
          },

          {
            id: 'pl-regular-block',
            type: 'group',
            text: 'Разделы для обычных пользователей',
            children: [
              { id: 'reg-tournament', type: 'check', text: 'Отображается турнир для обычных пользователей' },
              { id: 'reg-promos', type: 'check', text: 'Отображаются 4 промо доступные обычным пользователям' },
              { id: 'reg-game-block', type: 'check', text: 'Отображается игровой блок' },
            ],
          },

          {
            id: 'pl-vip-block',
            type: 'group',
            text: 'Разделы для VIP пользователей',
            children: [
              { id: 'vip-tournament', type: 'check', text: 'Отображается 1 турнир только для VIP' },
              { id: 'vip-promos', type: 'check', text: 'Отображаются 3 промо только для VIP' },
            ],
          },

          {
            id: 'pl-logic',
            type: 'group',
            text: 'Логика отображения работает корректно',
            children: [
              {
                id: 'logic-regular',
                type: 'check',
                text: 'Обычный пользователь видит только обычные промо и турниры',
              },
              {
                id: 'logic-vip',
                type: 'check',
                text: 'VIP пользователь видит только VIP блоки',
              },
              { id: 'pl-responsive', type: 'check', text: 'Проверено отображение на desktop и mobile' },
            ],
          },
        ],
      },

      {
        id: 'sec-2',
        title: '2. Дополнительные элементы вне Promo Landing',
        items: [
          {
            id: 'home-page-block',
            type: 'group',
            text: 'Главная страница',
            children: [
              { id: 'home-category', type: 'check', text: 'Добавлена игровая категория для Promo Landing' },
              {
                id: 'home-slider',
                type: 'group',
                text: 'В слайдер добавлен баннер или слайд Promo Landing',
                children: [
                  { id: 'home-banner-title', type: 'check', text: 'Отображается название' },
                  { id: 'home-banner-descr', type: 'check', text: 'Присутствует краткое описание' },
                  {
                    id: 'home-banner-link',
                    type: 'check',
                    text: 'Ссылка с баннера ведет на Promo Landing',
                  },
                ],
              },
              {
                id: 'home-all-added',
                type: 'check',
                text: 'Все промо и турниры Promo Landing добавлены на главную страницу с логикой обычный и VIP',
              },
            ],
          },
        ],
      },

      {
        id: 'sec-3',
        title: '3. Разделы Tournaments и Promotions',
        items: [
          {
            id: 'sections-block',
            type: 'group',
            text: 'Отображение в разделах',
            children: [
              {
                id: 'tourn-added',
                type: 'check',
                text: 'Турниры Promo Landing добавлены в Tournaments с логикой обычный и VIP',
              },
              {
                id: 'promo-added',
                type: 'check',
                text: 'Промо Promo Landing добавлены в Promotions с логикой обычный и VIP',
              },
            ],
          },
        ],
      },

      {
        id: 'sec-4',
        title: '4. Header и Pop-ups',
        items: [
          { id: 'header-btn', type: 'check', text: 'В хедер добавлена кнопка ведущая на Promo Landing' },
          {
            id: 'popups-updated',
            type: 'check',
            text: 'Поп апы обновлены с учетом информации о Promo Landing',
          },
        ],
      },

      {
        id: 'sec-5',
        title: '✅ Финальная проверка',
        items: [
          {
            id: 'final-sync',
            type: 'check',
            text: 'Все данные синхронизированы (название, даты, прайз пул, описание, таймеры)',
          },
          {
            id: 'final-logic',
            type: 'check',
            text: 'Проверена корректность отображения логики для обычных пользователей и VIP',
          },
          {
            id: 'final-links',
            type: 'check',
            text: 'Все ссылки кликабельны и ведут на правильные страницы',
          },
        ],
      },
    ],
  },
  {
    slug: 'promo-calendar',
    title: '[SS]Promo Calendar',
    description: 'Чек перед релізом Promo Calendar і повʼязаних елементів.',
    createdAt: '2025-09-25T09:00:00+03:00',
    sections: [
      {
        id: 'sec-1',
        title: '1. Основной блок страницы (календарь)',
        items: [
          { id: 'cal-title', type: 'check', text: 'Отображается корректное название календаря' },
          { id: 'cal-dates', type: 'check', text: 'Прописаны даты начала и конца' },
          {
            id: 'cal-visual-theme',
            type: 'check',
            text: 'Визуал страницы изменен под тематику календаря',
          },
          {
            id: 'cal-timer',
            type: 'check',
            text: 'Таймер обратного отсчета работает и синхронизирован с периодом кампании',
          },
          {
            id: 'cal-days',
            type: 'check',
            text: 'Календарь корректно отображает все дни периода',
          },
          {
            id: 'cal-period-badge',
            type: 'check',
            text: 'На промо добавлена плашка с периодом проведения промо',
          },

          {
            id: 'cal-regular-blocks',
            type: 'group',
            text: 'Разделы для обычных пользователей',
            children: [
              { id: 'reg-tournament', type: 'check', text: 'Отображается турнир для обычных пользователей' },
              { id: 'reg-promos', type: 'check', text: 'Отображаются 4 промо доступные обычным пользователям' },
              { id: 'reg-game-block', type: 'check', text: 'Отображается игровой блок' },
            ],
          },

          {
            id: 'cal-vip-blocks',
            type: 'group',
            text: 'Разделы для VIP пользователей',
            children: [
              { id: 'vip-tournament', type: 'check', text: 'Отображается 1 турнир только для VIP' },
              { id: 'vip-promos', type: 'check', text: 'Отображаются 3 промо только для VIP' },
            ],
          },

          {
            id: 'cal-logic',
            type: 'group',
            text: 'Логика отображения работает корректно',
            children: [
              {
                id: 'logic-regular',
                type: 'check',
                text: 'Обычный пользователь видит только обычные промо и турниры',
              },
              {
                id: 'logic-vip',
                type: 'check',
                text: 'VIP пользователь видит только VIP блоки',
              },
              { id: 'cal-responsive', type: 'check', text: 'Проверено отображение на desktop и mobile' },
            ],
          },
        ],
      },

      {
        id: 'sec-2',
        title: '2. Функциональность календаря',
        items: [
          {
            id: 'day-bonus',
            type: 'check',
            text: 'На каждый день в календаре прописан бонус с текстом условиями и призом',
          },
          {
            id: 'past-days',
            type: 'check',
            text: 'Для прошедших дней отображается статус Закрыто и они некликабельны',
          },
          {
            id: 'future-days',
            type: 'check',
            text: 'Для будущих дней отображается статус Заблокировано и они некликабельны',
          },

          {
            id: 'current-day',
            type: 'group',
            text: 'Для текущего дня',
            children: [
              {
                id: 'current-open',
                type: 'check',
                text: 'При нажатии открывается карточка с информацией про бонус',
              },
              {
                id: 'current-conditions',
                type: 'check',
                text: 'Отображаются условия бонуса (депозит, ставка, механика, призы)',
              },
              {
                id: 'current-cta',
                type: 'check',
                text: 'CTA кнопка активна и ведет на правильное действие',
              },
            ],
          },
        ],
      },

      {
        id: 'sec-3',
        title: '3. Дополнительные элементы и визуал',
        items: [
          {
            id: 'visual-popups',
            type: 'check',
            text: 'Все поп апы обновлены и соответствуют тематике календаря',
          },
          {
            id: 'visual-slider',
            type: 'check',
            text: 'Баннеры в слайдере заменены под тематику календаря',
          },
          {
            id: 'visual-inner-banners',
            type: 'check',
            text: 'Баннеры внутри промо синхронизированы с календарем',
          },
          {
            id: 'visual-page',
            type: 'check',
            text: 'Визуал на промо странице полностью обновлен под календарь',
          },
        ],
      },

      {
        id: 'sec-4',
        title: '4. Вне страницы Promo Calendar',
        items: [
          {
            id: 'outside-home',
            type: 'group',
            text: 'На главной странице',
            children: [
              {
                id: 'home-category',
                type: 'check',
                text: 'Добавлена игровая категория для Promo Calendar',
              },
              {
                id: 'home-slider-card',
                type: 'check',
                text: 'Слайдер содержит карточку Promo Calendar',
              },
            ],
          },

          {
            id: 'outside-sections',
            type: 'group',
            text: 'В разделах Promotions и Tournaments',
            children: [
              {
                id: 'outside-added',
                type: 'check',
                text: 'Промо и турниры привязанные к календарю отображаются корректно',
              },
              {
                id: 'outside-logic',
                type: 'check',
                text: 'Работает логика отображения обычный и VIP',
              },
            ],
          },

          {
            id: 'outside-header',
            type: 'check',
            text: 'В хедере добавлена кнопка с переходом на Promo Calendar',
          },
        ],
      },

      {
        id: 'sec-5',
        title: '5. Логика отображения (обычные / VIP пользователи)',
        items: [
          {
            id: 'logic-regular-bonus',
            type: 'check',
            text: 'Для обычных пользователей отображаются только стандартные бонусы календаря',
          },
          {
            id: 'logic-vip-bonus',
            type: 'check',
            text: 'Для VIP пользователей отображаются только VIP бонусы и промо календаря',
          },
          {
            id: 'logic-switch',
            type: 'check',
            text: 'Проверено что логика переключается корректно',
          },
        ],
      },

      {
        id: 'sec-6',
        title: '✅ Финальная проверка',
        items: [
          {
            id: 'final-sync',
            type: 'check',
            text: 'Все даты бонусы и визуальные элементы синхронизированы',
          },
          {
            id: 'final-links',
            type: 'check',
            text: 'Все CTA кнопки и ссылки кликабельны и ведут на нужные страницы',
          },
          { id: 'final-timers', type: 'check', text: 'Таймеры работают корректно' },
          {
            id: 'final-logic',
            type: 'check',
            text: 'Логика отображения обычный и VIP протестирована на разных типах аккаунтов',
          },
          {
            id: 'final-responsive',
            type: 'check',
            text: 'Проверено отображение на desktop и mobile',
          },
        ],
      },
    ],
  },
  {
    slug: 'event-promotions-and-detail',
    title: '[TL]Event (Promotions + Event page)',
    description: 'Перевірка картки івенту на Promotions та внутрішньої сторінки івенту.',
    createdAt: '2025-09-25T09:00:00+03:00',
    sections: [
      {
        id: 'sec-1',
        title: '1. Картка івенту на сторінці Promotions',
        items: [
          {
            id: 'event-type',
            type: 'group',
            text: 'Коректно обрано тип івента відповідно до механіки',
            children: [
              { id: 'type-tournament', type: 'check', text: 'Tournament' },
              { id: 'type-promo-event', type: 'check', text: 'Promo event' },
              { id: 'type-bonus', type: 'check', text: 'Bonus' },
            ],
          },
          {
            id: 'title-slogan',
            type: 'group',
            text: 'Назва та слоган івенту',
            children: [
              { id: 'no-art-overlap', type: 'check', text: 'Не перекривають арт на прев’ю банері' },
              { id: 'max-lines', type: 'check', text: 'Не виходять за допустиму кількість рядків' },
              { id: 'title-responsive', type: 'check', text: 'Коректно відображаються на desktop та mobile' },
            ],
          },
          {
            id: 'translations-preview',
            type: 'group',
            text: 'Переклади для інших локалей',
            children: [
              { id: 'translations-all', type: 'check', text: 'Присутні для всіх доступних мов' },
              {
                id: 'translations-length',
                type: 'check',
                text: 'Відповідають вимогам до довжини та верстки як вище',
              },
            ],
          },
          {
            id: 'preview-banner',
            type: 'group',
            text: 'Прев’ю банер',
            children: [
              { id: 'banner-loaded', type: 'check', text: 'Завантажений' },
              { id: 'banner-ratio', type: 'check', text: 'Має коректне співвідношення сторін' },
              {
                id: 'banner-quality',
                type: 'check',
                text: 'Без артефактів, розмиття або обрізаного контенту',
              },
            ],
          },
        ],
      },

      {
        id: 'sec-2',
        title: '2. Внутрішня сторінка івенту',
        items: [
          {
            id: 'main-banner',
            type: 'group',
            text: 'Основний банер',
            children: [
              { id: 'main-banner-format', type: 'check', text: 'Завантажений у правильному форматі' },
              { id: 'main-banner-responsive', type: 'check', text: 'Коректно відображається на desktop та mobile' },
            ],
          },
          {
            id: 'event-dates',
            type: 'group',
            text: 'Дати проведення івенту',
            children: [
              { id: 'dates-correct', type: 'check', text: 'Вказані коректно' },
              { id: 'dates-match-task', type: 'check', text: 'Відповідають умовам івенту та поставленій задачі' },
            ],
          },
          {
            id: 'rewards-sums',
            type: 'group',
            text: 'Суми винагород',
            children: [
              { id: 'rewards-correct', type: 'check', text: 'Вказані коректно' },
              { id: 'rewards-match-task', type: 'check', text: 'Відповідають умовам івенту та поставленій задачі' },
            ],
          },
          {
            id: 'text-terms',
            type: 'group',
            text: 'Текст опису і термзи',
            children: [
              {
                id: 'no-bad-linebreaks',
                type: 'check',
                text: 'Немає некоректних переносів і неестетичних розривів тексту',
              },
              {
                id: 'no-split-currency-percent',
                type: 'check',
                text: 'Немає розривів між числом і валютою або % (з урахуванням правил локалі)',
              },
              { id: 'text-responsive', type: 'check', text: 'Перевірено на desktop та mobile' },
            ],
          },
          {
            id: 'translations-detail',
            type: 'group',
            text: 'Переклади для інших локалей',
            children: [
              { id: 'detail-locale-all', type: 'check', text: 'Наявні для всіх доступних локалей' },
              { id: 'detail-locale-no-gaps', type: 'check', text: 'Без пропусків або некоректних символів' },
              { id: 'currency-conversion', type: 'check', text: 'Конвертація валют коректна (якщо необхідна)' },
              {
                id: 'currency-format',
                type: 'check',
                text: 'Форматування валют відповідає правилам локалі (позиція символу, роздільники, формат чисел)',
              },
              { id: 'values-consistent', type: 'check', text: 'Значення узгоджені між собою' },
            ],
          },
          {
            id: 'games-list',
            type: 'group',
            text: 'Список ігор',
            children: [
              { id: 'games-present', type: 'check', text: 'Присутній (якщо передбачено в івенті)' },
              { id: 'games-count', type: 'check', text: 'Відображена необхідна кількість ігор' },
            ],
          },
          {
            id: 'data-consistency',
            type: 'group',
            text: 'Узгодженість даних',
            children: [
              {
                id: 'params-same-everywhere',
                type: 'check',
                text: 'Дати, суми нагород та ключові параметри однакові у всіх блоках сторінки',
              },
              {
                id: 'no-contradictions',
                type: 'check',
                text: 'Немає розбіжностей між банерами, текстами та умовами',
              },
            ],
          },
        ],
      },
    ],
  }


]

