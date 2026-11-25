import { theme } from 'antd'
import type { ThemeConfig } from 'antd'

const filledField = { variant: 'filled' } as const

export const formControlDefaults = {
  input: filledField,
  inputNumber: filledField,
  textArea: filledField,
  select: filledField,
  datePicker: filledField,
  rangePicker: filledField,
  timePicker: filledField
}

// Локальное расширение темы: семантический токен тени рабочей панели.
// Antd не объявляет его в типах, но в рантайме выводит как CSS-переменную
// --ant-page-panel-shadow, которую использует page-layout.scss.
type AccentThemeConfig = Omit<ThemeConfig, 'token'> & {
  token: NonNullable<ThemeConfig['token']> & { pagePanelShadow: string }
}

// Заливка кнопки темнее ссылок: белый текст читается в обеих темах.
const commonComponents: ThemeConfig['components'] = {
  Button: {
    colorPrimary: '#1668dc',
    colorPrimaryHover: '#155fc8',
    colorPrimaryActive: '#0958d9',
    primaryColor: '#ffffff',
    primaryShadow: 'none',
    defaultShadow: 'none',
    fontWeight: 500,
    borderRadius: 6
  },
  Table: {
    cellPaddingBlock: 12,
    cellPaddingInline: 16,
    cellPaddingBlockMD: 12,
    cellPaddingInlineMD: 16
  }
}

const formComponents = (
  colorBorder: string,
  colorIcon: string
): ThemeConfig['components'] => ({
  Select: { colorTextQuaternary: colorIcon },
  DatePicker: { colorTextQuaternary: colorIcon },
  Checkbox: { colorBorder },
  Radio: { colorBorder },
  Switch: { colorTextQuaternary: colorBorder, colorTextTertiary: colorBorder }
})

export const darkTheme: AccentThemeConfig = {
  algorithm: theme.darkAlgorithm,
  cssVar: {},
  token: {
    // Цвета фона
    colorBgBase: '#141414', // Базовый фон (body)
    colorBgLayout: '#141414', // Холст каркаса: темнее сайдера и рабочей панели
    colorBgContainer: '#1f1f1f', // Контейнеры: Card, Table и пр.

    // Текст
    colorTextBase: '#f0f0f0', // Основной текст
    colorText: '#f0f0f0',
    colorTextSecondary: '#a6a6a6',
    colorTextTertiary: '#a6a6a6',
    colorTextDescription: '#a6a6a6',
    colorTextPlaceholder: '#929292',

    // Бордеры
    colorBorder: '#2a2a2a', // Спокойные рамки в обычном состоянии
    colorBorderSecondary: '#333333', // Вторичные границы

    // Основной акцент (Primary)
    colorPrimary: '#3c89ff', // Более мягкий синий
    colorPrimaryHover: '#4c99ff',
    colorPrimaryActive: '#1677ff',
    colorPrimaryBorder: '#69b1ff',
    colorPrimaryText: '#91caff',
    colorPrimaryTextHover: '#bae0ff',
    colorPrimaryTextActive: '#69b1ff',
    colorPrimaryBg: '#20375b',
    colorPrimaryBgHover: '#28466e',
    colorLink: '#69b1ff',
    colorLinkHover: '#91caff',
    colorLinkActive: '#4096ff',
    colorBgElevated: '#262626',
    controlItemBgHover: '#292929',
    controlItemBgActive: '#20375b',

    // Статусы
    colorSuccess: '#52c41a',
    colorSuccessText: '#95de64',
    colorSuccessBg: '#162312',
    colorWarningText: '#ffd666',
    colorWarningBg: '#2b2111',
    colorErrorText: '#ff7875',
    colorErrorBg: '#2c1618',

    // Hover фоны
    colorFillTertiary: 'rgba(255, 255, 255, 0.03)',
    colorFillQuaternary: 'rgba(255, 255, 255, 0.01)',
    // INFO palette overrides
    colorInfoText: '#69b1ff',
    colorInfoTextHover: '#91caff',
    colorInfoTextActive: '#4096ff',
    colorInfoBg: 'rgba(60, 137, 255, 0.15)',
    colorInfoBgHover: 'rgba(76, 153, 255, 0.15)',
    colorInfoBorder: '#4c99ff',
    colorInfoBorderHover: '#3c89ff',
    colorInfo: '#3c89ff', // базовый info
    colorInfoHover: '#4c99ff',
    colorInfoActive: '#2f70cc',

    // В тёмной теме уровни отделяются поверхностями и тонкой границей.
    pagePanelShadow: 'inset 0 0 0 1px #333333'
  },
  components: {
    ...commonComponents,
    ...formComponents('#787878', '#a6a6a6'),
    Form: { colorError: '#ff7875' },
    Button: {
      ...commonComponents.Button,
      defaultBg: '#262626',
      defaultHoverColor: '#91caff',
      defaultHoverBorderColor: '#69b1ff',
      defaultActiveColor: '#69b1ff',
      defaultActiveBorderColor: '#4096ff',
      colorError: '#ff7875',
      colorErrorHover: '#ff9c9a',
      colorErrorActive: '#ff8785',
      dangerColor: '#141414'
    },
    Tabs: {
      itemSelectedColor: '#91caff',
      itemHoverColor: '#bae0ff',
      itemActiveColor: '#69b1ff'
    },
    Segmented: {
      trackBg: '#303030',
      itemSelectedBg: '#28466e',
      itemSelectedColor: '#d6eaff'
    },
    Menu: {
      itemSelectedColor: '#91caff',
      subMenuItemSelectedColor: '#91caff'
    },
    Layout: {
      // LayoutSider из isp-ui-kit использует theme="light", поэтому фон
      // сайдера берётся из lightSiderBg: сайдер светлее холста
      lightSiderBg: '#1a1a1a'
    }
  }
}

export const lightTheme: AccentThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  cssVar: {},
  token: {
    // Базовый акцент: от него выводятся --ant-color-primary-bg и подсветки меню
    colorPrimary: '#1677ff',
    colorPrimaryBorder: '#1668dc',
    colorPrimaryText: '#0958d9',
    colorLink: '#0958d9',
    colorLinkHover: '#1668dc',
    colorLinkActive: '#003eb3',
    colorText: '#1f1f1f',
    colorTextSecondary: '#595959',
    colorTextTertiary: '#595959',
    colorTextDescription: '#595959',
    colorTextPlaceholder: '#666666',
    colorBorder: '#d9d9d9',
    colorBorderSecondary: '#f0f0f0',
    colorSuccessText: '#237804',
    colorWarningText: '#874d00',
    colorErrorText: '#cf1322',
    colorInfoText: '#0958d9',
    // Холст каркаса: холодный светло-серый, отделяет сайдер и рабочую панель
    colorBgLayout: '#f3f5f8',

    pagePanelShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
  },
  components: {
    ...commonComponents,
    ...formComponents('#8c8c8c', '#666666'),
    Form: { colorError: '#cf1322' },
    Button: {
      ...commonComponents.Button,
      defaultHoverColor: '#0958d9',
      defaultHoverBorderColor: '#1668dc',
      defaultActiveColor: '#003eb3',
      defaultActiveBorderColor: '#0958d9',
      colorError: '#b42318',
      colorErrorHover: '#9f1b16',
      colorErrorActive: '#7a1614'
    },
    Tabs: {
      itemSelectedColor: '#0958d9',
      itemHoverColor: '#1668dc',
      itemActiveColor: '#003eb3'
    },
    Segmented: {
      trackBg: '#e6ebf3',
      itemSelectedBg: '#cfe2ff',
      itemSelectedColor: '#064cad'
    },
    Menu: {
      itemSelectedColor: '#0958d9',
      subMenuItemSelectedColor: '#0958d9'
    },
    Layout: {
      // LayoutSider из isp-ui-kit использует theme="light", поэтому фон
      // сайдера берётся из lightSiderBg: сайдер остаётся белым на сером холсте
      lightSiderBg: '#ffffff'
    }
  }
}
