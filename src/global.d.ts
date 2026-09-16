interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface ImportMetaEnv {
  readonly VITE_APP_TOKEN: string
  readonly BASE_URL: string
  readonly VITE_CLIENT_NAME: string
  readonly VITE_OAUTH_LOGIN_BUTTON_TEXT: string
  readonly VITE_ENABLE_OAUTH_LOGIN: boolean
}

declare module 'json-schema-view-js'
declare module '*.css'
declare module '*.scss'
declare module '*.sass'
