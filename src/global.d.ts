interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface ImportMetaEnv {
  readonly VITE_APP_TOKEN: string
  readonly BASE_URL: string
}

declare module 'json-schema-view-js'
declare module '*.css'
declare module '*.scss'
declare module '*.sass'
