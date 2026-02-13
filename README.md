# isp-admin-ui-kit

`isp-admin-ui-kit` — это компонент базовой админ-панели для использования в других проектах.

---

## 📆 Установка и сборка

### Установка зависимостей

```bash
npm install
```

### Сборка пакета

```bash
npm run build
```

---

## 🚀 Установка библиотеки в проект

```bash
npm install isp-admin-ui-kit
```

### Дополнительные библиотеки, необходимые для работы

```bash
npm install @monaco-editor/react antd axios dayjs monaco-editor react react-dom react-hook-form react-router-dom react-redux @reduxjs/toolkit
```

#### Версии зависимостей:

```json
{
  "@monaco-editor/react": "^4.7.0",
  "@reduxjs/toolkit": "^2.2.3",
  "antd": ">=5.12.2",
  "axios": "^1.7.7",
  "dayjs": "^1.11.10",
  "isp-ui-kit": ">=1.0.0",
  "monaco-editor": "^0.55.1",
  "react": ">=18.2.0 <19",
  "react-dom": ">=18.2.0 <19",
  "react-hook-form": "^7.54.0",
  "react-redux": "^9.1.0",
  "react-router-dom": "^6.22.3",
  "swagger-ui-react": "^5.31.0"
}
```

---

## 🧹 Подключение базового хранилища (store)

```js
import { baseSetupStore } from 'isp-admin-ui-kit';
import { Provider } from 'react-redux';
import AdminBase from 'isp-admin-ui-kit';

const store = baseSetupStore();

<Provider store={store}>
  <AdminBase/>
</Provider>;
```

### Интеграция с кастомным стором

`baseSetupStore` принимает параметр `apiServices` для подключения пользовательских редьюсеров и RTK Query сервисов:

```js
const apiServices = {
  modulesServiceApi,
  UIReducer,
};

const store = baseSetupStore(apiServices);
```

---

## 🎨 Подключение темы

Библиотека использует тему Ant Design. Вы можете передать дополнительные параметры в `ConfigProvider` через проп
`configProviderProps`:

```js
<AdminBase configProviderProps={{ theme: lightTheme, locale: eng }}/>
```

---

## 🗺 Настройка маршрутов (роутеров)

Компонент `AdminBase` поддерживает кастомную маршрутизацию через параметр `customRouters`.

> ⚠️ Для корректной работы пунктов меню `route` и `key` должны совпадать!

### Структура объекта маршрута (`customRouters`)

| Название        | Тип         | Описание                                       |
|-----------------|-------------|------------------------------------------------|
| `route`      \* | `string`    | Путь маршрута                                  |
| `element`    \* | `ReactNode` | Компонент, отображаемый по маршруту            |
| `label`         | `string`    | Название маршрута (текст в меню)               |
| `key`           | `string`    | Уникальный ключ маршрута (используется в меню) |
| `permissions`   | `string[]`  | Список разрешений для доступа к маршруту       |
| `icon`       \* | `ReactNode` | Иконка маршрута                                |
| `children`   \* | `Array`     | Вложенные маршруты                             |
| `className`  \* | `string`    | Класс для оформления пункта меню               |

#### Пример:

```js
const customRouters = [
  {
    route: '/dashboard',
    element: <Dashboard/>,
    label: 'Dashboard',
    key: 'dashboard',
    permissions: ['admin', 'user'],
    icon: <DashboardIcon/>,
    className: 'red-menu',
  },
];
```

---

## 🗺 Скрытие базовых страниц

Компонент `AdminBase` поддерживает параметр `excludePermissions`: массив с пермишенами, страницы по которым необходимо
скрыть, сами пермишены можно получить через импорт PermissionKeysType из библиотеки

### Пример использования:

```js
import { PermissionKeysType } from 'isp-admin-ui-kit'
const excludePermissions = [PermissionKeysType.user_view, PermissionKeysType.session_view]

  < AdminBase
excludePermissions = { excludePermissions }
/>;
```

---

## 🧱 Параметры компонента `AdminBase`

Вы можете использовать `AdminBase` с разными параметрами:

| Название              | Описание                                                            | Пример                                                   |
|-----------------------|---------------------------------------------------------------------|----------------------------------------------------------|
| `customRouters`       | Массив объектов маршрутов                                           | customRouters={\[{ route, element, label, key, ... }]}   |
| `configProviderProps` | Пропсы для `ConfigProvider` из библиотеки `antd`                    | configProviderProps={{ theme: lightTheme, locale: ru }}  |
| `defaultRoutePath`    | Путь, на который будет редирект при открытии `/` (главной страницы) | defaultRoutePath="/modules"                              |
| `excludePermissions`  | Массив пермишенов (PermissionKeysType) для сокрытия                 | excludePermissions={[PermissionKeysType.user_view, ...]} |

### Пример использования:

```js
<AdminBase
  customRouters={customRouters}
  configProviderProps={{ theme: lightTheme, locale: ru }}
  defaultRoutePath="/dashboard"
  excludePermissions={excludePermissions}
/>;
```

---

## 📋 Обновление версии

Чтобы обновить версию пакета:

1. Обновите значение `version` в `package.json`.
2. Добавьте соответствующую запись в `CHANGELOG.md`.

---
