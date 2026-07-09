import type { App, Directive } from 'vue'
import * as directives from '@/directives'

export function registerDirectives(app: App<Element>) {
  Object.keys(directives).forEach(key => {
    app.directive(key, (directives as { [key: string]: Directive })[key])
  })
}
