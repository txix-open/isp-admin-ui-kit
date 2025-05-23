import { theme } from 'antd'

export const darkTheme = {
  algorithm: theme.darkAlgorithm,
  cssVar: true,
  token: {
    // Цвета фона
    colorBgBase: '#141414', // Базовый фон (body, layout)
    colorBgLayout: '#1a1a1a', // Layout фон
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
    colorInfoActive: '#2f70cc'
  }
}

export const lightTheme = {
  algorithm: theme.defaultAlgorithm,
  cssVar: true,
  token: {
    colorBgLayout: '#FFFFFF'
  }
}
