interface ImportMetaEnv {
  readonly VITE_APP_MODE: 'dev' | 'test' | 'uat' | 'prod'
  readonly VITE_APP_HTTP_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_TYPE: '1' | '2'
  readonly VITE_APP_REM_CHANGE: '0' | '1'
  readonly VITE_HTTP_URL_CS: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
