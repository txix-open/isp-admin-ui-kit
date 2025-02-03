## Описание

`isp-admin-ui-kit` — это компонент базовой админ-панели для использования в других проектах.

---

## Команды

- **`npm install`** — установка зависимостей.
- **`npm build`** — сборка пакета.

---

## Обновление версии

Для обновления версии необходимо:

1. Поднять версию в `package.json`.
2. Прописать изменения в `CHANGELOG.md`.

## Установка пакета в другие проекты

Для установки пакета выполните:

```bash
npm install isp-admin-ui-kit
```

---

## Подключение базового стора

1. Импортируйте `baseSetupStore` из пакета.
2. Настройте store в вашем проекте:

```js
import { baseSetupStore } from 'isp-admin-ui-kit';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import AdminBase from 'isp-admin-ui-kit';

const store = baseSetupStore();

<Provider store={store}>
  <BrowserRouter>
    <AdminBase/>
  </BrowserRouter>
</Provider>;
```

### Интеграция с кастомным стором

`baseSetupStore` принимает необязательный параметр `apiServices`, который позволяет интегрировать пользовательские
редьюсеры и слайсеры.

| Название    | Описание                                | Пример                                                           |
|-------------|-----------------------------------------|------------------------------------------------------------------|
| apiServices | Объект кастомных редьюсеров и слайсеров | const apiServices = {<br/>modulesServiceApi,<br/>UIReducer<br/>} |

Пример использования:

```js
const apiServices = {
  modulesServiceApi,
  UIReducer,
};

const store = baseSetupStore(apiServices);
```

---

## Подключение темы

Базовая интеграция темы Ant Design встроена. Для добавления динамических стилей для кастомных компонентов используйте
переменные Ant Design.

Дополнительные пропсы для `ConfigProvider` можно передать через параметр `configProviderProps`.

Пример использования:

```js
import AdminBase from 'isp-admin-ui-kit';
import { lightTheme, eng } from 'some-theme-library';

<AdminBase configProviderProps={{ theme: lightTheme, locale: eng }}/>;
```

---

## Настройка роутеров

Компонент `AdminBase` поддерживает настройку пользовательских роутеров через параметр `customRouters`.

**Важный момент**

**Для корректной инициализации пунктов меню, связанных со страницами, необходимо, чтобы значения полей route и key совпадали.**

### Параметры `customRouters`

| Название      | Тип         | Описание                                                    |
|---------------|-------------|-------------------------------------------------------------|
| `route`       | `string`    | Путь маршрута.                                              |
| `element`     | `ReactNode` | Компонент, который будет отрисовываться на данном маршруте. |
| `label`       | `string`    | Название маршрута.                                          |
| `key`         | `string`    | Уникальный ключ маршрута (пункта меню).                     |
| `permissions` | `string[]`  | Список разрешений для доступа к маршруту.                   |
| `icon`        | `ReactNode` | Иконка маршрута.                                            |
| `children`    | `Array`     | Вложенные маршруты.                                         |
| `className`   | `string`    | Пользовательский className для пункта меню                  |

Пример использования:

```js
const customRouters = [
  {
    route: '/dashboard',
    element: <Dashboard/>,
    label: 'Dashboard',
    key: 'dashboard',
    permissions: ['admin', 'user'],
    icon: <DashboardIcon/>,
    className:'red-menu'
  },
];

<AdminBase customRouters={customRouters}/>;
```

---

## Работа с компонентом `AdminBase`

Вы можете использовать компонент `AdminBase` в своём проекте с настройкой следующих параметров:

| Название            | Описание                                                                                  | Пример                                                                                                                                                                                                |
|---------------------|-------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| customRouters       | массив объектов                                                                           | customRouters={ [<br>{<br>  route?: string <br> element?: any <br> className?: string <br> label: string <br> key: string <br> permissions: string[] <br> icon?: any <br> children?: []  <br>}<br>] } |
| configProviderProps | объект, принимающий в себя пропсы для ConfigProvider из библиотеки antd в качестве ключей | configProviderProps={{theme: lightTheme, locale: eng}}                                                                                                                                                |

```js
 <AdminBase/> 
```

- С настройкой роутеров и темы:

```js
<AdminBase customRouters={customRouters} configProviderProps={{ theme: lightTheme, locale: ru }}/>;
```
