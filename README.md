# isp-admin-ui-kit

[![npm version](https://img.shields.io/npm/v/isp-admin-ui-kit.svg)](https://www.npmjs.com/package/isp-admin-ui-kit)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**isp-admin-ui-kit** — это компонент базовой админ-панели для использования в других проектах. Библиотека предоставляет готовый каркас, навигацию, управление состоянием и типовые страницы, позволяя сосредоточиться на бизнес-логике.

## 📑 Содержание

- [Возможности](#-возможности)
- [Установка и зависимости](#-установка-и-зависимости)
- [⚙️ Настройка Monaco Editor](#-настройка-monaco-editor)
- [Быстрый старт](#-быстрый-старт)
- [Настройка компонента AdminBase](#-настройка-компонента-adminbase)
- [Работа с данными и Store](#-работа-с-данными-и-store)
- [Встроенные страницы](#-встроенные-страницы)
- [Разработка и обновление версии](#-разработка-и-обновление-версии)

---

## 🚀 Возможности

- **Готовый Layout**: Структура админ-панели с меню и навигацией.
- **State Management**: Redux Toolkit из коробки.
- **UI Kit**: Компоненты на базе Ant Design.
- **Code Editor**: Интеграция Monaco Editor.
- **Базовые страницы**: Пользователи, роли, логи, модули.
- **Типизация**: Полная поддержка TypeScript.

---

## 📦 Установка и зависимости

### 1. Установка пакета

```bash
npm install isp-admin-ui-kit
```

### 2. Установка зависимостей (Peer Dependencies)

Для корректной работы необходимо установить следующие библиотеки:

```bash
npm install @monaco-editor/react antd axios dayjs monaco-editor react react-dom react-hook-form react-router-dom react-redux @reduxjs/toolkit swagger-ui-react isp-ui-kit
```

**Требуемые версии:**

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

## ⚙️ Настройка Monaco Editor

> ⚠️ **Критически важно:** Компоненты библиотеки, использующие редактор кода, **не будут работать** без предварительной инициализации loader.

Необходимо выполнить конфигурацию и инициализацию монико-редактора в точке входа вашего приложения (например, `main.tsx` или `index.tsx`) **до** рендеринга компонента `AdminBase`.

```tsx
import * as monaco from 'monaco-editor';
import loader from '@monaco-editor/react';

// Конфигурация loader
loader.config({ monaco });

// Инициализация
loader.init().then(() => {
  console.log('Monaco Editor initialized');
  // Здесь можно запустить рендер приложения, если требуется гарантия загрузки
});
```

**Пример полной точки входа (`main.tsx`):**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import * as monaco from 'monaco-editor';
import loader from '@monaco-editor/react';
import { baseSetupStore, AdminBase } from 'isp-admin-ui-kit';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

// 1. Настройка Monaco
loader.config({ monaco });
loader.init().then(() => {
  // 2. Инициализация Store
  const store = baseSetupStore();

  // 3. Рендер приложения
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <AdminBase />
        </BrowserRouter>
      </Provider>
    </React.StrictMode>
  );
});
```

## Настройка Monaco Worker (Vite / Rollup)

⚠️ Важно: Если ваше приложение или библиотека собирается через Vite или Rollup, необходимо явно подключить Monaco Workers.
Без этого редактор может выдавать ошибки или не работать подсветка синтаксиса.

🔧 Пример настройки

Добавьте конфигурацию до инициализации loader:
```jsx
import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

// импорт worker-файлов
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

// настройка окружения Monaco
self.MonacoEnvironment = {
    getWorker(_: unknown, label: string) {
        if (label === 'json') return new jsonWorker();
        if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker();
        if (label === 'html' || label === 'handlebars' || label === 'razor') return new htmlWorker();
        if (label === 'typescript' || label === 'javascript') return new tsWorker();
        return new editorWorker();
    },
};

// конфигурация loader
loader.config({ monaco });

// инициализация
loader.init();
```

---

## ⚡ Быстрый старт

После настройки Monaco Editor, базовое подключение выглядит следующим образом:

```tsx
import { baseSetupStore, AdminBase } from 'isp-admin-ui-kit';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

const store = baseSetupStore();

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AdminBase />
      </BrowserRouter>
    </Provider>
  );
};
```

---

## ⚙️ Настройка компонента AdminBase

Компонент `AdminBase` поддерживает гибкую настройку через пропсы.

### Параметры компонента

| Название              | Описание                                                                 | Пример                               |
|-----------------------|--------------------------------------------------------------------------|--------------------------------------|
| `customRouters`       | Массив объектов маршрутов.                                               | `[{ route, element, label, key }]`   |
| `configProviderProps` | Пропсы для `ConfigProvider` (Ant Design).                                | `{ theme: lightTheme, locale: ru }`  |
| `defaultRoutePath`    | Путь для редиректа с главной страницы (`/`).                             | `"/modules"`                         |
| `excludePermissions`  | Массив пермишенов для скрытия стандартных страниц.                       | `[PermissionKeysType.user_view]`     |

### Маршрутизация (`customRouters`)

> ⚠️ **Важно:** Для корректной работы пунктов меню значения полей `route` и `key` **должны совпадать**.

| Параметр      | Тип         | Описание                                      |
|---------------|-------------|-----------------------------------------------|
| `route`       | `string`    | Путь маршрута (URL).                          |
| `element`     | `ReactNode` | Компонент, отображаемый по маршруту.          |
| `label`       | `string`    | Название маршрута (текст в меню).             |
| `key`         | `string`    | Уникальный ключ маршрута (должен совпадать с `route`). |
| `permissions` | `string[]`  | Список разрешений для доступа.                |
| `icon`        | `ReactNode` | Иконка маршрута.                              |
| `children`    | `Array`     | Вложенные маршруты.                           |
| `className`   | `string`    | Класс для оформления пункта меню.             |

**Пример:**

```tsx
const customRouters = [
  {
    route: '/dashboard',
    key: 'dashboard', // Должно совпадать с route
    label: 'Dashboard',
    element: <Dashboard />,
    permissions: ['admin', 'user'],
    icon: <DashboardIcon />,
    className: 'red-menu',
  },
];

<AdminBase customRouters={customRouters} />;
```

### Скрытие базовых страниц (`excludePermissions`)

Для скрытия стандартных страниц используйте массив `excludePermissions`. Ключи импортируются через `PermissionKeysType`.

```tsx
import { PermissionKeysType } from 'isp-admin-ui-kit';

const excludePermissions = [
  PermissionKeysType.user_view,
  PermissionKeysType.session_view,
];

<AdminBase excludePermissions={excludePermissions} />;
```

### Полный пример конфигурации

```tsx
<AdminBase
  customRouters={customRouters}
  configProviderProps={{ theme: lightTheme, locale: ru }}
  defaultRoutePath="/dashboard"
  excludePermissions={excludePermissions}
/>;
```

---

## 🗄 Работа с данными и Store

### Подключение базового хранилища

```tsx
import { baseSetupStore } from 'isp-admin-ui-kit';
import { Provider } from 'react-redux';

const store = baseSetupStore();

<Provider store={store}>
  <App />
</Provider>;
```

### Интеграция с кастомным стором

`baseSetupStore` принимает параметр `apiServices` для подключения пользовательских редьюсеров и RTK Query сервисов.

```tsx
const apiServices = {
  modulesServiceApi,
  UIReducer,
};

const store = baseSetupStore(apiServices);
```

### Использование базовых API

```tsx
import { baseApiServices } from 'isp-admin-ui-kit';

const { data, isLoading, isError } = baseApiServices.roleApi.useGetAllRolesQuery();
```

---

## 📄 Встроенные страницы

Библиотека предоставляет готовый набор страниц:

- **Приложения**: Управление настройками приложений.
- **Доступы приложений**: Настройка методов доступа.
- **Модули**: Конфигурация системных модулей.
- **Пользователи**: Список и управление пользователями.
- **Роли**: Управление ролями и правами.
- **Сессии**: Журнал пользовательских сессий.
- **Журналы ИБ**: Просмотр событий безопасности.

---

## 🛠 Разработка и обновление версии

### Сборка пакета

```bash
# Установка зависимостей
npm install

# Сборка
npm run build
```

### Обновление версии

Чтобы обновить версию пакета:

1.  Обновите значение `version` в `package.json`.
2.  Добавьте соответствующую запись в `CHANGELOG.md`.
3.  Закоммитьте изменения:
    ```bash
    git commit -m "up version to X.Y.Z"
    git push
    ```

---

## 📄 Лицензия

MIT License.
