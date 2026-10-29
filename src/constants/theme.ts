import { theme } from 'antd'
import type { ThemeConfig } from 'antd'

// Локальное расширение темы: семантический токен тени рабочей панели.
// Antd не объявляет его в типах, но в рантайме выводит как CSS-переменную
// --ant-page-panel-shadow, которую использует page-layout.scss.
type AccentThemeConfig = Omit<ThemeConfig, 'token'> & {
  token: NonNullable<ThemeConfig['token']> & { pagePanelShadow: string }
}

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
    colorTextSecondary: '#8c8c8c', // Вторичный текст
    colorTextPlaceholder: '#5a5a5a',

    // Бордеры
    colorBorder: '#2a2a2a', // Основные границы
    colorBorderSecondary: '#333333', // Вторичные границы

    // Основной акцент (Primary)
    colorPrimary: '#3c89ff', // Более мягкий синий
    colorPrimaryHover: '#4c99ff',
    colorPrimaryActive: '#1677ff',

    // Статусы
    colorSuccess: '#52c41a',
    colorSuccessBg: 'rgba(82, 196, 26, 0.15)',

    // Hover фоны
    colorFillTertiary: 'rgba(255, 255, 255, 0.03)',
    colorFillQuaternary: 'rgba(255, 255, 255, 0.01)',
    // INFO palette overrides
    colorInfoText: '#3c89ff',
    colorInfoTextHover: '#4c99ff',
    colorInfoTextActive: '#2f70cc',
    colorInfoBg: 'rgba(60, 137, 255, 0.15)',
    colorInfoBgHover: 'rgba(76, 153, 255, 0.15)',
    colorInfoBorder: '#4c99ff',
    colorInfoBorderHover: '#3c89ff',
    colorInfo: '#3c89ff', // базовый info
    colorInfoHover: '#4c99ff',
    colorInfoActive: '#2f70cc',

    // Тень рабочей панели (PageLayout): по мотивам теней карточек профиля,
    // усилена — панель «парит» над холстом
    pagePanelShadow:
      '0 2px 6px rgba(0, 0, 0, 0.3), 0 12px 32px -8px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.04)'
  },
  components: {
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
    // Холст каркаса: холодный светло-серый, отделяет сайдер и рабочую панель
    colorBgLayout: '#eef1f6',

    // Тень рабочей панели (PageLayout): по мотивам теней карточек профиля,
    // усилена — панель «парит» над холстом
    pagePanelShadow:
      '0 2px 6px rgba(15, 23, 42, 0.05), 0 12px 32px -8px rgba(15, 23, 42, 0.18)'
  },
  components: {
    Layout: {
      // LayoutSider из isp-ui-kit использует theme="light", поэтому фон
      // сайдера берётся из lightSiderBg: сайдер остаётся белым на сером холсте
      lightSiderBg: '#ffffff'
    }
  }
}
