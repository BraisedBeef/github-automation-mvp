import { createApp } from 'vue'
import App from './app.vue'
import 'element-plus/dist/index.css'
import 'element-plus/es/components/message/style/css'
import 'normalize.css/normalize.css'
import './assets/styles/tailwind.scss'
import './assets/styles/index.scss'
import i18n from './locales'
import router from './router'
import { registerDirectives } from './config/directives-config'
import { mode } from './config/base-config'
import store from './store'
import ElTableInfiniteScroll from 'el-table-infinite-scroll'
import 'virtual:svg-icons-register'
import { initMonitor } from '@company/web-monitor'

const app = createApp(App)
registerDirectives(app)

initMonitor({
  // debug: !['prod'].includes(mode), // 开启 Debug 面板
  debug: false, // 开启 Debug 面板
  dsn: '', // 暂无后端上报
  appId: 'cat-cloud-consol',
  network: {
    reportAllRequest: false, // 只上报 4xx/5xx 或 fetch 异常
    ignoreUrls: ['/sockjs-node', '/heartbeat'], // 忽略特定请求
  },
})

app.use(router).use(store).use(i18n).use(ElTableInfiniteScroll)
app.mount('#app')
