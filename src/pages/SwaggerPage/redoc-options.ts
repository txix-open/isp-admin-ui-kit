import type { RedocRawOptions } from 'redoc'

const common: RedocRawOptions = {
  nativeScrollbars: true,
  hideDownloadButtons: true,
  hideSingleRequestSampleTab: true,
  pathInMiddlePanel: true,
  requiredPropsFirst: true,
  jsonSampleExpandLevel: 2,
  schemaExpansionLevel: 1,
  labels: {
    responses: 'Ответы',
    requestSamples: 'Примеры запроса',
    responseSamples: 'Примеры ответа',
    noResultsFound: 'Ничего не найдено'
  },
  theme: {
    spacing: { sectionHorizontal: 28, sectionVertical: 28 },
    sidebar: { width: '260px' },
    rightPanel: { width: '36%' },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: '14px',
      lineHeight: '1.6',
      headings: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontWeight: '600'
      },
      code: {
        fontFamily: 'SFMono-Regular, Consolas, monospace',
        fontSize: '13px',
        wrap: true
      }
    }
  }
}

export const LIGHT_OPTIONS: RedocRawOptions = {
  ...common,
  theme: {
    ...common.theme,
    colors: {
      primary: { main: '#1677ff' },
      text: { primary: '#1f1f1f', secondary: '#595959' },
      border: { light: '#e8ecf2', dark: '#d9d9d9' }
    },
    sidebar: {
      ...common.theme?.sidebar,
      backgroundColor: '#ffffff',
      textColor: '#595959',
      activeTextColor: '#0958d9',
      level1Items: {
        activeBackgroundColor: '#e6f4ff',
        activeTextColor: '#0958d9'
      }
    },
    rightPanel: {
      ...common.theme?.rightPanel,
      backgroundColor: '#243142',
      textColor: '#e8eaed'
    },
    codeBlock: { backgroundColor: '#1b2635' },
    schema: {
      nestedBackground: '#f8fafc',
      linesColor: '#d9e0e8',
      typeNameColor: '#0958d9',
      requireLabelColor: '#cf1322'
    }
  }
}

export const DARK_OPTIONS: RedocRawOptions = {
  ...common,
  theme: {
    ...common.theme,
    // ReDoc keeps several secondary elements in fixed light-theme colors.
    extensionsHook: (name: string) => {
      if (name === 'UnderlinedHeader')
        return `color: #a6a6a6; border-color: #434343;
          > span { color: #a6a6a6; }`
      if (name === 'Markdown')
        return `table tr { background-color: transparent; }
          table tr:nth-child(2n) { background-color: #262626; }
          blockquote { color: #a6a6a6; border-color: #434343; }`
      if (name === 'Prism')
        return `.token.number, .token.constant { color: #91caff; }
          .token.boolean, .token.deleted { color: #ff9c9a; }
          .token.comment, .token.prolog, .token.doctype, .token.cdata {
            color: #a6a6a6;
          }`
      return ''
    },
    colors: {
      primary: { main: '#69b1ff' },
      text: { primary: '#f0f0f0', secondary: '#a6a6a6' },
      border: { light: '#333333', dark: '#525252' },
      http: {
        get: '#73d13d',
        post: '#69b1ff',
        put: '#ffc069',
        delete: '#ff7875',
        patch: '#b37feb',
        options: '#5cdbd3',
        head: '#95de64',
        basic: '#bfbfbf',
        link: '#5cdbd3'
      },
      responses: {
        success: {
          color: '#95de64',
          backgroundColor: '#162312',
          tabTextColor: '#95de64'
        },
        error: {
          color: '#ff7875',
          backgroundColor: '#2c1618',
          tabTextColor: '#ff7875'
        },
        info: {
          color: '#91caff',
          backgroundColor: '#20375b',
          tabTextColor: '#91caff'
        },
        redirect: {
          color: '#ffd666',
          backgroundColor: '#2b2111',
          tabTextColor: '#ffd666'
        }
      }
    },
    sidebar: {
      ...common.theme?.sidebar,
      backgroundColor: '#1f1f1f',
      textColor: '#a6a6a6',
      activeTextColor: '#91caff',
      level1Items: {
        activeBackgroundColor: '#20375b',
        activeTextColor: '#91caff'
      },
      groupItems: {
        activeBackgroundColor: '#262626',
        activeTextColor: '#f0f0f0'
      }
    },
    rightPanel: {
      ...common.theme?.rightPanel,
      backgroundColor: '#191919',
      textColor: '#e8e8e8'
    },
    codeBlock: { backgroundColor: '#191919' },
    fab: { backgroundColor: '#262626', color: '#91caff' },
    schema: {
      nestedBackground: '#262626',
      linesColor: '#434343',
      typeNameColor: '#91caff',
      typeTitleColor: '#91caff',
      requireLabelColor: '#ff7875',
      arrow: { color: '#a6a6a6' }
    },
    typography: {
      ...common.theme?.typography,
      code: {
        ...common.theme?.typography?.code,
        color: '#d9e3f0',
        backgroundColor: '#191919'
      },
      links: { color: '#91caff', hover: '#bae0ff', visited: '#91caff' }
    }
  }
}
