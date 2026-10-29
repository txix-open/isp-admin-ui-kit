import type { Preview } from '@storybook/react-vite'
import { ConfigProvider } from 'antd'
import ruRu from 'antd/locale/ru_RU'
import { createElement } from 'react'

import { darkTheme, lightTheme } from '../src/constants/theme'

const preview: Preview = {
  globalTypes: {
    adminTheme: {
      description: 'Тема интерфейса',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Светлая' },
          { value: 'dark', title: 'Тёмная' }
        ]
      }
    }
  },
  initialGlobals: { adminTheme: 'light' },
  decorators: [
    (Story, { globals }) =>
      createElement(ConfigProvider, {
        locale: ruRu,
        theme: globals.adminTheme === 'dark' ? darkTheme : lightTheme,
        children: createElement(Story)
      })
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },

    a11y: {
      test: 'todo'
    },
    docs: {
      toc: {
        title: 'Содержание',
        headingSelector: 'h2, h3, h4',
        disable: false,
        maxDepth: 2
      }
    },
    options: {
      storySort: {
        order: ['Описание', '*']
      }
    }
  }
}

export default preview
