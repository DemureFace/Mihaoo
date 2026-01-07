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
          { id: 'page-title-descr', type: 'check', text: 'Тайтл і коротке описание соответствует задаче' },
          { id: 'page-short-descr', type: 'check', text: 'Краткое описание с условиями и датами присутствует' },
          { id: 'page-bonus-code-propisan', type: 'check', text: 'Прописан корректный Bonus Code' },
          { id: 'page-all-bonuses-listed', type: 'check', text: 'Приведены все доступные бонусы и их условия (сумма депозита, % кешбэка, вейджер, FS)' },
          { id: 'page-all-links-clickable', type: 'check', text: 'Все ссылки (Bonus Rules, Terms & Conditions) кликабельны и ведут на правильные страницы' },
          {
            id: 'bonus-rules-block',
            type: 'group',
            text: 'Блок «Bonus Rules» содержит:',
            children: [
              { id: 'page-period', type: 'check', text: 'период проведения промо' },
              { id: 'page-code-deposit-cashback-fs', type: 'check', text: 'бонускод, сумма депозита, % кешбэка, FS совпадают с описанием' },
              { id: 'page-each-bonus-conditions', type: 'check', text: 'условия получения каждого бонуса' },
              { id: 'page-wager-per-level', type: 'check', text: 'вейджер для каждого уровня' },
              { id: 'page-bonus-expiry', type: 'check', text: 'срок действия бонуса' },
              { id: 'page-limits', type: 'check', text: 'ограничения по ставкам и выигрышам' },
              { id: 'page-tech-conditions', type: 'check', text: 'технические условия (активация, поддержка, ручная выдача)' },
            ],
          },
          { id: 'page-code-matches', type: 'check', text: 'Bonus Code совпадает с условием в задаче' },
          { id: 'page-get-bonus-btn', type: 'check', text: 'Кнопка Get Bonus работает и ведет на корректное действие' },
          { id: 'page-currency-snippets', type: 'check', text: 'Добавлены валютные сниппеты' },
          { id: 'page-pokies-au', type: 'check', text: 'Slots для AU гео отображается как Pokies' },
          { id: 'page-responsive-check', type: 'check', text: 'Проверка отображения на мобильной и десктопной версии' },
        ],
      },
      {
        id: 'second-sec',
        title: '2. Карточка на странице всех Promotions', // якщо не треба заголовок секції — став null
        items: [
          { id: 'card-added', type: 'check', text: 'Карточка добавлена в общий список Promotions' },
          { id: 'card-show-title', type: 'check', text: 'Отображается название промо' },
          { id: 'card-short-descr', type: 'check', text: 'Есть краткое описание' },
          { id: 'card-link', type: 'check', text: 'Ссылка с карточки ведет на страницу промо' },
          { id: 'card-responsive-check', type: 'check', text: 'Проверена адаптивность отображения карточки' },
          { id: 'card-group-check', type: 'check', text: 'Проверено отображение по группам' },
        ],
      },
      {
        id: 'third-sec',
        title: '3. Главная страница и слайдер', // якщо не треба заголовок секції — став null
        items: [

            {
              id: 'main-card-added',
              type: 'check',
              text: 'Добавлен баннер или слайд промо',
            },
            {
              id: 'main-show-title',
              type: 'check',
              text: 'Указано название промо',
            },
            {
              id: 'main-short-descr',
              type: 'check',
              text: 'Присутствует краткое описание',
            },
            {
              id: 'main-link',
              type: 'check',
              text: 'Баннер кликабелен и ведет на страницу промо',
            },
            {
              id: 'main-responsive-check',
              type: 'check',
              text: 'Проверено отображение на всех устройствах desktop и mobile',
            },
            {
              id: 'main-slider-rotation',
              type: 'check',
              text: 'Слайдер работает корректно и промо появляется в ротации',
            },
            {
              id: 'main-group-check',
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
              id: 'check-duplicated',
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
          { id: 'page-tourn-title', type: 'check', text: 'Заголовок турнира соответствует задаче' },
          { id: 'page-prize-pool', type: 'check', text: 'Указан общий призовой фонд турнира' },
          { id: 'page-tourn-timer', type: 'check', text: 'Добавлен таймер до конца турнира' },
          { id: 'page-currency-geo', type: 'check', text: 'Валюта корректно отображается в зависимости от GEO или IP' },
          { id: 'page-responsive', type: 'check', text: 'Проверено отображение на desktop и mobile' },
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
            id: 'terms-unique-mechanics',
            type: 'check',
            text: 'Описана уникальная механика турнира, если предусмотрена',
          },
          {
            id: 'terms-win-rules',
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
          { id: 'main-added-main', type: 'check', text: 'Карточка турнира добавлена в общий список' },
          { id: 'main-title-main', type: 'check', text: 'Указано название турнира' },
          { id: 'main-prize-main', type: 'check', text: 'Прописан общий призовой фонд' },
          { id: 'main-timer-main', type: 'check', text: 'Добавлен таймер с обратным отсчетом' },
          {
            id: 'main-link-main',
            type: 'check',
            text: 'Ссылка с карточки ведет на страницу турнира',
          },
          {
            id: 'main-responsive-main',
            type: 'check',
            text: 'Проверено адаптивное отображение карточки',
          },
          {
            id: 'main-geo-main',
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
              { id: 'pl-reg-tournament', type: 'check', text: 'Отображается турнир для обычных пользователей' },
              { id: 'pl-reg-promos', type: 'check', text: 'Отображаются 4 промо доступные обычным пользователям' },
              { id: 'pl-reg-game-block', type: 'check', text: 'Отображается игровой блок' },
            ],
          },

          {
            id: 'pl-vip-block',
            type: 'group',
            text: 'Разделы для VIP пользователей',
            children: [
              { id: 'pl-vip-tournament', type: 'check', text: 'Отображается 1 турнир только для VIP' },
              { id: 'pl-vip-promos', type: 'check', text: 'Отображаются 3 промо только для VIP' },
            ],
          },

          {
            id: 'pl-logic',
            type: 'group',
            text: 'Логика отображения работает корректно',
            children: [
              {
                id: 'pl-logic-regular',
                type: 'check',
                text: 'Обычный пользователь видит только обычные промо и турниры',
              },
              {
                id: 'pl-logic-vip',
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
            id: 'pl-home-page-block',
            type: 'group',
            text: 'Главная страница',
            children: [
              { id: 'pl-home-category', type: 'check', text: 'Добавлена игровая категория для Promo Landing' },
              {
                id: 'pl-home-slider',
                type: 'group',
                text: 'В слайдер добавлен баннер или слайд Promo Landing',
                children: [
                  { id: 'pl-home-banner-title', type: 'check', text: 'Отображается название' },
                  { id: 'pl-home-banner-descr', type: 'check', text: 'Присутствует краткое описание' },
                  {
                    id: 'pl-home-banner-link',
                    type: 'check',
                    text: 'Ссылка с баннера ведет на Promo Landing',
                  },
                ],
              },
              {
                id: 'pl-home-all-added',
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
            id: 'pl-sections-block',
            type: 'group',
            text: 'Отображение в разделах',
            children: [
              {
                id: 'pl-tourn-added',
                type: 'check',
                text: 'Турниры Promo Landing добавлены в Tournaments с логикой обычный и VIP',
              },
              {
                id: 'pl-promo-added',
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
          { id: 'pl-header-btn', type: 'check', text: 'В хедер добавлена кнопка ведущая на Promo Landing' },
          {
            id: 'pl-popups-updated',
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
  },
  {
    slug: 'cashback-event-checklist',
    title: '[TL]Cashback Event (Promotions + Pages)',
    description: 'Перевірка Cashback-івенту: Promotions, внутрішня сторінка, головна сторінка, Bonus Policy та VIP.',
    createdAt: '2025-09-25T10:30:00+03:00',
    sections: [
      {
        id: 'sec-promotions-cashback-card',
        title: 'Картка на сторінці Promotions замість Bonus-картки Cashback',
        items: [
          {
            id: 'grp-promotions-event-type',
            type: 'group',
            text: 'Коректно обрано тип івента відповідно до механіки',
            children: [
              { id: 'chk-promotions-type-tournament', type: 'check', text: 'Tournament' },
              { id: 'chk-promotions-type-promo-event', type: 'check', text: 'Promo-event' },
              { id: 'chk-promotions-type-bonus', type: 'check', text: 'Bonus' },
            ],
          },
          {
            id: 'grp-promotions-title-and-slogan',
            type: 'group',
            text: 'Назва та слоган івенту',
            children: [
              { id: 'chk-promotions-copywriter-text-provided', type: 'check', text: 'Вказано наданий копірайтерами текст' },
              { id: 'chk-promotions-no-art-overlap-on-preview-banner', type: 'check', text: 'Не перекривають арт на прев’ю-банері' },
              { id: 'chk-promotions-within-max-lines', type: 'check', text: 'Не виходять за допустиму кількість рядків' },
              { id: 'chk-promotions-title-responsive-desktop-mobile', type: 'check', text: 'Коректно відображаються на desktop та mobile версіях сайту' },
            ],
          },
          {
            id: 'grp-promotions-locales-translations',
            type: 'group',
            text: 'Переклади для інших локалей',
            children: [
              { id: 'chk-promotions-translations-present-for-all-languages', type: 'check', text: 'Присутні для всіх доступних мов' },
              { id: 'chk-promotions-translations-match-length-and-layout-rules', type: 'check', text: 'Відповідають вимогам до довжини та верстки, зазначеним вище.' },
            ],
          },
          {
            id: 'grp-promotions-preview-banner',
            type: 'group',
            text: 'Прев’ю-банер',
            children: [
              { id: 'chk-promotions-preview-banner-uploaded', type: 'check', text: 'завантажений;' },
              { id: 'chk-promotions-preview-banner-correct-aspect-ratio', type: 'check', text: 'має коректне співвідношення сторін;' },
              { id: 'chk-promotions-preview-banner-no-artifacts', type: 'check', text: 'не містить артефактів, розмиття або обрізаного контенту.' },
            ],
          },
          {
            id: 'grp-promotions-terms',
            type: 'group',
            text: 'Термзи',
            children: [
              { id: 'chk-promotions-terms-loaded-from-bonus-policy', type: 'check', text: 'завантажено термзи які взято з Bonus policy;' },
            ],
          },
        ],
      },
  {
        id: 'sec-event-page',
        title: 'Внутрішня сторінка івенту',
        items: [
          {
            id: 'grp-event-page-main-banner',
            type: 'group',
            text: 'Основний банер',
            children: [
              { id: 'chk-event-page-banner-correct-format', type: 'check', text: 'завантажений у правильному форматі;' },
              { id: 'chk-event-page-banner-responsive', type: 'check', text: 'коректно відображається на desktop та mobile.' },
            ],
          },
          {
            id: 'grp-event-page-event-dates',
            type: 'group',
            text: 'Дати проведення івенту',
            children: [
              { id: 'chk-event-page-dates-correct', type: 'check', text: 'вказані коректно;' },
              { id: 'chk-event-page-dates-match-event-and-task', type: 'check', text: 'відповідають умовам івенту та поставленій задачі.' },
            ],
          },
          {
            id: 'grp-event-page-reward-sums',
            type: 'group',
            text: 'Суми винагород',
            children: [
              { id: 'chk-event-page-rewards-correct', type: 'check', text: 'вказані коректно;' },
              { id: 'chk-event-page-rewards-match-event-and-task', type: 'check', text: 'відповідають умовам івенту та поставленій задачі.' },
            ],
          },
          {
            id: 'grp-event-page-description-and-terms',
            type: 'group',
            text: 'Текст опису і термзи:',
            children: [
              { id: 'chk-event-page-no-bad-line-breaks', type: 'check', text: 'не містить некоректних переносів рядків, не естетичних розривів тексту;' },
              { id: 'chk-event-page-no-split-between-number-and-currency-or-percent', type: 'check', text: 'відсутні розриви між числом і символом валюти(якщо вказана через пробіл по правилам локалі) або “%”;' },
              { id: 'chk-event-page-checked-desktop-and-mobile', type: 'check', text: 'перевірено на desktop та mobile.' },
            ],
          },
          {
            id: 'grp-event-page-locales-translations',
            type: 'group',
            text: 'Переклади для інших локалей:',
            children: [
              { id: 'chk-event-page-translations-present-for-all-locales', type: 'check', text: 'наявні для всіх доступних локалей;' },
              { id: 'chk-event-page-translations-no-gaps-or-invalid-symbols', type: 'check', text: 'не містять пропусків або некоректних символів;' },
              { id: 'chk-event-page-currency-conversion-correct-if-needed', type: 'check', text: 'Конвертація валют коректна (якщо необхідна);' },
              { id: 'chk-event-page-currency-format-matches-locale-rules', type: 'check', text: 'форматування валют відповідає правилам обраної локалі (позиція символу, роздільники, формат чисел);' },
              { id: 'chk-event-page-values-consistent', type: 'check', text: 'значення узгоджені між собою.' },
            ],
          },
          {
            id: 'grp-event-page-games-list',
            type: 'group',
            text: 'Список ігор:',
            children: [
              { id: 'chk-event-page-games-present-if-required', type: 'check', text: 'присутній (якщо передбачено в івенті);' },
              { id: 'chk-event-page-games-required-count-shown', type: 'check', text: 'відображена необхідна кількість ігор.' },
            ],
          },
          {
            id: 'grp-event-page-data-consistency',
            type: 'group',
            text: 'Узгодженість даних:',
            children: [
              { id: 'chk-event-page-dates-rewards-and-params-same-everywhere', type: 'check', text: 'дати, суми нагород та інші ключові параметри однакові у всіх блоках сторінки;' },
              { id: 'chk-event-page-no-mismatches-between-banners-text-and-terms', type: 'check', text: 'відсутні розбіжності між банерами, текстами та умовами.' },
            ],
          },
        ],
      },
  {
        id: 'sec-homepage-slider',
        title: 'Слайдер на головній сторінці',
        items: [
          {
            id: 'grp-homepage-cashback-card',
            type: 'group',
            text: 'Картка Cashback:',
            children: [
              { id: 'chk-homepage-card-renamed-by-copywriter-title', type: 'check', text: 'перейменована відповідно до назви, наданої копірайтерами;' },
              { id: 'chk-homepage-card-title-does-not-break-layout', type: 'check', text: 'назва коректно відображається та не порушує верстку;' },
            ],
          },
          {
            id: 'grp-homepage-cashback-value',
            type: 'group',
            text: 'Значення кешбеку:',
            children: [
              { id: 'chk-homepage-holiday-cashback-up-to-twenty', type: 'check', text: 'вказано святковий кешбек до 20%;' },
              { id: 'chk-homepage-percent-matches-event-conditions', type: 'check', text: 'відсоток відповідає фактичним умовам івенту;' },
              { id: 'chk-homepage-percent-format-correct-for-all-locales', type: 'check', text: 'форматування відсотків коректне для всіх локалей.' },
            ],
          },
        ],
      },

      {
        id: 'sec-bonus-policy-terms',
        title: 'Термзи в Bonus Policy сайту',
        items: [
          {
            id: 'grp-bonus-policy-cashback-dropdown',
            type: 'group',
            text: 'Випадаючий список Cashback:',
            children: [
              { id: 'chk-bonus-policy-dropdown-renamed-by-copywriter-title', type: 'check', text: 'перейменований відповідно до назви, наданої копірайтерами;' },
              { id: 'chk-bonus-policy-dropdown-synced-with-site-sections', type: 'check', text: 'назва синхронізована з іншими розділами сайту.' },
            ],
          },
          {
            id: 'grp-bonus-policy-event-description',
            type: 'group',
            text: 'Опис івенту:',
            children: [
              { id: 'chk-bonus-policy-first-point-has-event-duration', type: 'check', text: 'додано перший пункт із чітко зазначеною тривалістю святкового івенту;' },
              { id: 'chk-bonus-policy-dates-and-wording-match-active-period', type: 'check', text: 'дати та формулювання відповідають фактичному періоду дії' },
            ],
          },
          {
            id: 'grp-bonus-policy-vip-levels-table',
            type: 'group',
            text: 'Таблиця VIP-рівнів:',
            children: [
              { id: 'chk-bonus-policy-added-seeker-levels-one-to-five-ten-percent', type: 'check', text: 'додано рівні 1–5 Seeker з кешбеком 10%;' },
              { id: 'chk-bonus-policy-levels-one-to-nineteen-ten-percent', type: 'check', text: 'для рівнів 1–19 встановлено кешбек 10%;' },
              { id: 'chk-bonus-policy-levels-twenty-to-twenty-five-twenty-percent', type: 'check', text: 'для рівнів 20–25 встановлено кешбек 20%.' },
            ],
          },
          {
            id: 'grp-bonus-policy-table-consistency',
            type: 'group',
            text: 'Узгодженість таблиці:',
            children: [
              { id: 'chk-bonus-policy-table-percentages-display-correctly', type: 'check', text: 'відсотки кешбеку відображаються коректно;' },
              { id: 'chk-bonus-policy-no-mismatches-between-levels-and-values', type: 'check', text: 'відсутні розбіжності між рівнями та значеннями.' },
            ],
          },
        ],
      },
  {
        id: 'sec-vip-section',
        title: 'VIP розділ',
        items: [
          {
            id: 'grp-vip-general-bonus-lists',
            type: 'group',
            text: 'Загальні списки бонусів:',
            children: [
              { id: 'chk-vip-general-levels-one-to-nineteen-ten-percent', type: 'check', text: 'для рівнів 1–19 вказано кешбек 10%;' },
              { id: 'chk-vip-general-levels-twenty-to-twenty-five-twenty-percent', type: 'check', text: 'для рівнів 20–25 вказано кешбек 20%.' },
            ],
          },
          {
            id: 'grp-vip-detailed-bonus-lists',
            type: 'group',
            text: 'Внутрішні списки бонусів для окремих рівнів:',
            children: [
              { id: 'chk-vip-detailed-lists-match-general-cashback-values', type: 'check', text: 'відповідають загальним значенням кешбеку;' },
              { id: 'chk-vip-no-mismatches-between-general-and-detailed-description', type: 'check', text: 'відсутні розбіжності між загальним та детальним описом.' },
            ],
          },
          {
            id: 'grp-vip-data-synchronization',
            type: 'group',
            text: 'Синхронізація даних:',
            children: [
              { id: 'chk-vip-cashback-values-identical-across-sections', type: 'check', text: 'значення кешбеку ідентичні у VIP-розділі, Bonus Policy та на головній сторінці;' },
              { id: 'chk-vip-no-conflicts-between-text-tables-and-ui', type: 'check', text: 'відсутні конфлікти між текстами, таблицями та UI-елементами.' },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'general-translation-and-formatting-check',
    title: '[TL]General Translation & Readability Check',
    description: 'Загальна перевірка перекладу, форматування та читабельності контенту.',
    createdAt: '2025-09-25T11:00:00+03:00',
    sections: [
      {
        id: 'sec-general-translation-check',
        title: 'Загальна перевірка перекладу',
        items: [
          {
            id: 'grp-translation-availability',
            type: 'group',
            text: 'Переклад присутній для всіх ключів локалізації:',
            children: [
              {
                id: 'chk-no-fallbacks-to-other-languages',
                type: 'check',
                text: 'відсутні fallback-и на інші мови;',
              },
              {
                id: 'chk-no-cropping-or-layout-breaks',
                type: 'check',
                text: 'відсутні обрізання, перекриття або злам верстки.',
              },
            ],
          },
          {
            id: 'grp-translation-applied-to-promotions',
            type: 'group',
            text: 'Переклад застосовано до всіх Promotions:',
            children: [
              {
                id: 'chk-translation-applied-to-cards',
                type: 'check',
                text: 'картки;',
              },
              {
                id: 'chk-translation-applied-to-internal-pages',
                type: 'check',
                text: 'внутрішні сторінки;',
              },
            ],
          },
          {
            id: 'grp-buttons-and-cta',
            type: 'group',
            text: 'Кнопки та CTA:',
            children: [
              {
                id: 'chk-cta-text-fits-area',
                type: 'check',
                text: 'весь текст вміщується у відведену область;',
              },
              {
                id: 'chk-cta-no-cropping-or-overlap',
                type: 'check',
                text: 'відсутні обрізання, перекриття або злам верстки;',
              },
              {
                id: 'chk-cta-looks-correct',
                type: 'check',
                text: 'візуально виглядають коректно.',
              },
            ],
          },
        ],
      },

      {
        id: 'sec-formatting-and-readability',
        title: 'Форматування та читабельність',
        items: [
          {
            id: 'grp-currency-format',
            type: 'group',
            text: 'Формат валют:',
            children: [
              {
                id: 'chk-currency-symbol-position',
                type: 'check',
                text: 'коректне розташування символу валюти;',
              },
              {
                id: 'chk-currency-thousands-and-decimals',
                type: 'check',
                text: 'правильні роздільники тисяч та дробової частини.',
              },
            ],
          },
          {
            id: 'grp-text-content',
            type: 'group',
            text: 'Текстовий контент:',
            children: [
              {
                id: 'chk-no-ugly-line-breaks',
                type: 'check',
                text: 'відсутні неестетичні розриви рядків;',
              },
              {
                id: 'chk-no-break-between-number-and-currency',
                type: 'check',
                text: 'немає переносів між числом і символом валюти;',
              },
              {
                id: 'chk-no-invalid-percent-or-unit-breaks',
                type: 'check',
                text: 'відсутні некоректні переноси відсотків та одиниць виміру.',
              },
            ],
          },
          {
            id: 'grp-links-inside-text',
            type: 'group',
            text: 'Посилання, вшиті в текст:',
            children: [
              {
                id: 'chk-links-clickable',
                type: 'check',
                text: 'клікабельні;',
              },
              {
                id: 'chk-links-lead-to-correct-pages',
                type: 'check',
                text: 'ведуть на коректні сторінки;',
              },
              {
                id: 'chk-links-do-not-break-layout',
                type: 'check',
                text: 'не порушують верстку тексту.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'promo-card-and-page-checklist',
    title: '[8tech]Promo (Promotions Card + Promo Page + Homepage Slider)',
    description: 'Перевірка промо-картки на Promotions, внутрішньої сторінки промо та слайдера на головній сторінці.',
    createdAt: '2025-09-25T11:30:00+03:00',
    sections: [
      {
        id: 'sec-promotions-promo-card',
        title: 'Картка промо на сторінці Promotions',
        items: [
          {
            id: 'grp-promo-title-and-slogan',
            type: 'group',
            text: 'Назва та слоган івенту:',
            children: [
              {
                id: 'chk-promo-title-no-art-overlap',
                type: 'check',
                text: 'не перекривають арт на прев’ю-банері;',
              },
              {
                id: 'chk-promo-title-within-max-lines',
                type: 'check',
                text: 'не виходять за допустиму кількість рядків;',
              },
              {
                id: 'chk-promo-title-responsive',
                type: 'check',
                text: 'коректно відображаються на desktop та mobile версіях сайту.',
              },
            ],
          },
          {
            id: 'grp-promo-card-locales',
            type: 'group',
            text: 'Переклади для інших локалей:',
            children: [
              {
                id: 'chk-promo-card-locales-present',
                type: 'check',
                text: 'присутні для всіх доступних мов;',
              },
              {
                id: 'chk-promo-card-locales-match-rules',
                type: 'check',
                text: 'відповідають вимогам до довжини та верстки, зазначеним вище.',
              },
            ],
          },
        ],
      },

      {
        id: 'sec-promo-internal-page',
        title: 'Внутрішня сторінка промо',
        items: [
          {
            id: 'grp-promo-main-banner',
            type: 'group',
            text: 'Основний банер:',
            children: [
              {
                id: 'chk-promo-banner-correct-format',
                type: 'check',
                text: 'завантажений у правильному форматі;',
              },
              {
                id: 'chk-promo-banner-responsive',
                type: 'check',
                text: 'коректно відображається на desktop та mobile.',
              },
            ],
          },
          {
            id: 'grp-promo-dates',
            type: 'group',
            text: 'Дати проведення промо:',
            children: [
              {
                id: 'chk-promo-dates-correct',
                type: 'check',
                text: 'вказані коректно;',
              },
              {
                id: 'chk-promo-dates-match-conditions',
                type: 'check',
                text: 'відповідають умовам івенту та поставленій задачі.',
              },
            ],
          },
          {
            id: 'grp-promo-reward-sums',
            type: 'group',
            text: 'Суми винагород:',
            children: [
              {
                id: 'chk-promo-rewards-correct',
                type: 'check',
                text: 'вказані коректно;',
              },
              {
                id: 'chk-promo-rewards-match-conditions',
                type: 'check',
                text: 'відповідають умовам івенту та поставленій задачі.',
              },
            ],
          },
          {
            id: 'grp-promo-description-and-terms',
            type: 'group',
            text: 'Текст опису івенту та термзи:',
            children: [
              {
                id: 'chk-promo-no-bad-line-breaks',
                type: 'check',
                text: 'не містить некоректних переносів рядків, не естетичних розривів тексту;',
              },
              {
                id: 'chk-promo-no-split-number-currency-or-percent',
                type: 'check',
                text: 'відсутні розриви між числом і символом валюти(якщо вказана через пробіл по правилам локалі) або “%”;',
              },
              {
                id: 'chk-promo-text-checked-desktop-mobile',
                type: 'check',
                text: 'перевірено на desktop та mobile.',
              },
            ],
          },
          {
            id: 'grp-promo-page-locales',
  type: 'group',
            text: 'Переклади для інших локалей:',
            children: [
              {
                id: 'chk-promo-page-locales-present',
                type: 'check',
                text: 'наявні для всіх доступних локалей;',
              },
              {
                id: 'chk-promo-page-no-gaps-or-invalid-symbols',
                type: 'check',
                text: 'не містять пропусків або некоректних символів;',
              },
              {
                id: 'chk-promo-page-currency-conversion-correct',
                type: 'check',
                text: 'Конвертація валют коректна (якщо необхідна);',
              },
              {
                id: 'chk-promo-page-currency-format-locale-rules',
                type: 'check',
                text: 'форматування валют відповідає правилам обраної локалі (позиція символу, роздільники, формат чисел);',
              },
              {
                id: 'chk-promo-page-values-consistent',
                type: 'check',
                text: 'значення узгоджені між собою.',
              },
            ],
          },
          {
            id: 'grp-promo-data-consistency',
            type: 'group',
            text: 'Узгодженість даних:',
            children: [
              {
                id: 'chk-promo-data-same-across-blocks',
                type: 'check',
                text: 'дати, суми нагород та інші ключові параметри однакові у всіх блоках сторінки;',
              },
              {
                id: 'chk-promo-no-mismatches-banners-text-terms',
                type: 'check',
                text: 'відсутні розбіжності між банерами, текстами та умовами.',
              },
            ],
          },
        ],
      },

      {
        id: 'sec-homepage-slider-promo',
        title: 'Слайдер на головній сторінці',
        items: [
          {
            id: 'grp-homepage-slider-general',
            type: 'group',
            text: 'Загальний вигляд та контент',
            children: [
              {
                id: 'chk-homepage-slider-cta-text-fits',
                type: 'check',
                text: 'текст для CTA кнопки коректно вмістився;',
              },
              {
                id: 'chk-homepage-slider-title-and-slogan-fit',
                type: 'check',
                text: 'текст з назвою івенту та слоган на банері коректно вмістився;',
              },
              {
                id: 'chk-homepage-slider-cta-link-correct',
                type: 'check',
                text: 'CTA кнопка має коректне посилання;',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: '8tech-general-translation-checklist',
    title: '[8tech] General Translation & Readability',
    description: 'Загальна перевірка перекладу, форматування та читабельності для бренду 8tech.',
    createdAt: '2025-09-25T12:00:00+03:00',
    sections: [
      {
        id: 'sec-8tech-general-translation',
        title: 'Загальна перевірка перекладу',
        items: [
          {
            id: 'grp-8tech-translation-for-all-keys',
            type: 'group',
            text: 'Переклад присутній для всіх ключів локалізації:',
            children: [
              {
                id: 'chk-8tech-no-language-fallbacks',
                type: 'check',
                text: 'відсутні fallback-и на інші мови;',
              },
              {
                id: 'chk-8tech-no-cropping-or-layout-breaks',
                type: 'check',
                text: 'відсутні обрізання, перекриття або злам верстки.',
              },
            ],
          },
          {
            id: 'grp-8tech-translation-applied-to-all-promotions',
            type: 'group',
            text: 'Переклад застосовано до всіх Promotions:',
            children: [
              {
                id: 'chk-8tech-translation-applied-to-cards',
                type: 'check',
                text: 'картки;',
              },
              {
                id: 'chk-8tech-translation-applied-to-internal-pages',
                type: 'check',
                text: 'внутрішні сторінки;',
              },
            ],
          },
          {
            id: 'grp-8tech-buttons-and-cta',
            type: 'group',
            text: 'Кнопки та CTA:',
            children: [
              {
                id: 'chk-8tech-cta-text-fits-container',
                type: 'check',
                text: 'весь текст вміщується у відведену область;',
              },
              {
                id: 'chk-8tech-cta-no-layout-issues',
                type: 'check',
                text: 'відсутні обрізання, перекриття або злам верстки;',
              },
              {
                id: 'chk-8tech-cta-visual-correctness',
                type: 'check',
                text: 'візуально виглядають коректно.',
              },
            ],
          },
        ],
      },
  {
        id: 'sec-8tech-formatting-and-readability',
        title: 'Форматування та читабельність',
        items: [
          {
            id: 'grp-8tech-currency-format',
            type: 'group',
            text: 'Формат валют:',
            children: [
              {
                id: 'chk-8tech-currency-symbol-position-correct',
                type: 'check',
                text: 'коректне розташування символу валюти;',
              },
              {
                id: 'chk-8tech-currency-thousand-and-decimal-separators',
                type: 'check',
                text: 'правильні роздільники тисяч та дробової частини.',
              },
            ],
          },
          {
            id: 'grp-8tech-text-content',
            type: 'group',
            text: 'Текстовий контент:',
            children: [
              {
                id: 'chk-8tech-no-ugly-line-breaks',
                type: 'check',
                text: 'відсутні неестетичні розриви рядків;',
              },
              {
                id: 'chk-8tech-no-break-between-number-and-currency',
                type: 'check',
                text: 'немає переносів між числом і символом валюти;',
              },
              {
                id: 'chk-8tech-no-invalid-percent-or-unit-breaks',
                type: 'check',
                text: 'відсутні некоректні переноси відсотків та одиниць виміру.',
              },
            ],
          },
          {
            id: 'grp-8tech-links-in-text',
            type: 'group',
            text: 'Посилання, вшиті в текст:',
            children: [
              {
                id: 'chk-8tech-links-clickable',
                type: 'check',
                text: 'клікабельні;',
              },
              {
                id: 'chk-8tech-links-lead-to-correct-pages',
                type: 'check',
                text: 'ведуть на коректні сторінки;',
              },
              {
                id: 'chk-8tech-links-do-not-break-text-layout',
                type: 'check',
                text: 'не порушують верстку тексту.',
              },
            ],
          },
        ],
      },
    ],
  }

]

