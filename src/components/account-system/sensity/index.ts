import SensityDialog from './sensity-dialog.vue'
import AuthenticationDialog from './authentication-dialog.vue'
import OperateDialog from './operate-dialog.vue'
import store from '@/store'

interface Config {
  contentType: 'AuthenticationDialog' | 'OperateDialog'
  confirm: any
  close: any
  perms?: string
}

/**
 * @desc 显示
 * @param {Object} config
 * @param {Number} contentType 弹窗内容的类型
 * @param {Function} confirm 弹窗确认事件
 * @param {Function} close 弹窗关闭事件
 * @param {String} perms 某行为需要的验证字段
 */
export const showSensity = (config: Config) => {
  const { contentType, confirm, close, perms } = config
  let app: any = null // vueApp
  let div: any = null // dom

  // if (document.getElementById('sensity-dialog')) {
  //   return
  // }

  div = document.createElement('div')
  div.setAttribute('id', 'sensity-dialog')
  document.body.appendChild(div)
  // console.log(`contentType===>`, contentType)

  const content = contentType === 'AuthenticationDialog' ? AuthenticationDialog : OperateDialog
  // console.log(`content===>`, content)

  app = createApp(SensityDialog, {
    content,
    perms,
    dialogVisible: true,
    onHandleConfirm: (params: any) => {
      // console.log('触发函数内确认事件==>')
      confirm && confirm(params)

      setTimeout(() => {
        app.unmount()
        div.remove()
      }, 1000)
    },
    onHandleClose: (params: any) => {
      // console.log('触发函数内取消事件==>')
      close && close(params)
      setTimeout(() => {
        app.unmount()
        div.remove()
      }, 1000)
    },
  })
  app.use(store)
  app.mount(div)
}
