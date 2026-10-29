# Локальные регрессионные проверки

## Логика форм, фильтров и загрузки страницы

```sh
node --experimental-strip-types --test tests/*.test.mjs
```

Проверка уведомлений об ошибках отдельно:

```sh
node --test tests/api-error-notifications.test.mjs
```

Используются реальные Axios-interceptors и RTK Query с адаптером, который возвращает фиктивные ошибки без HTTP. Проверяются локальный текст, общий fallback, отсутствие дублей, 401, 403, 4xx/5xx, сетевые ошибки, отмена запроса и ошибки полей.

## Меню и лейаут без API

Нужен установленный `agent-browser`. Тестовая страница собирает реальные компоненты с подменой сервисов. CSP запрещает сетевые подключения; реальные страницы админки и её данные не используются. Скрипт меню создаёт собственную браузерную сессию и закрывает её после проверки.

Проверить установленный пакет `isp-ui-kit`:

```sh
node tests/build-layout-test.mjs /tmp/isp-layout-test
node tests/check-menu-browser.mjs /tmp/isp-layout-test/layout.html
node tests/check-pages-browser.mjs /tmp/isp-layout-test/layout.html
node tests/check-variable-list-browser.mjs /tmp/isp-layout-test/layout.html
node tests/check-applications-browser.mjs /tmp/isp-layout-test/layout.html
node tests/check-application-switch-browser.mjs /tmp/isp-layout-test/layout.html
node tests/check-page-headers-browser.mjs /tmp/isp-layout-test/layout.html
```

Проверка шапок включает модули, доступы приложений и вложенную историю версий, одинаковые стили при 2560/375 px и отсутствие прокрутки всего документа. Стенд Swagger использует локальную заглушку документации и не загружает спецификацию по сети.

Проверить только LayoutMenu из соседнего репозитория до обновления пакета:

```sh
node tests/build-layout-test.mjs /tmp/isp-layout-test ../isp-ui-kit
node tests/check-menu-browser.mjs /tmp/isp-layout-test/layout.html
```

Проверяются прямой вход, узкий экран, раскрытие группы, ручное закрытие, переходы router, повторный выбор активного пункта, наведение после выбора, ArrowRight и Escape. Всплывающие элементы проверяются после завершения анимаций. В обоих вариантах React и Ant Design берутся из одной установленной копии, чтобы не смешивать контексты библиотек.

Для визуальной проверки откройте сгенерированный HTML через file://. Переключение экрана доступно через `window.layoutTest.show('/users/new')`, `show('/users/7')`, `show('/roles/new')`, `show('/roles/1')`, `show('/modules/1/configurations')`, `show('/variables/new')`, `show('/variables/APP_TIMEOUT')` и `show('/variables/API_KEY')`; вторым аргументом передаётся true для тёмной темы. Третий аргумент false обновляет данные без пересоздания формы — для проверки сохранности черновика. `window.layoutTest.check()` проверяет размеры и локальную прокрутку. Это тестовая страница с фиктивными данными, не копия данных админки.
