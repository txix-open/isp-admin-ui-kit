import type { Preview } from '@storybook/react-vite'

const preview: Preview = {
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
