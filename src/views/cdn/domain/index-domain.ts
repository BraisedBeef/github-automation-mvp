import { STRING_REG, DOMAIN_WI_REG, DOMAIN_REG, ipAndMaskRegex } from '@/utils/reg'

import { useI18n } from 'vue-i18n'
import SvgIcon from '@/components/common/svg-icon/index.vue'
import t from '@/utils/i18n'
import { domainToUnicode } from '@/utils/encrypt-decrypt'
import { notify } from '@/utils/notification'

const DOMAIN_REG1 = /^(([a-z0-9]{1,}\.)+)([a-z]{2,10})$/
// const DOMAIN_REG2 = /^(([a-z0-9]{1,}(?!.*--)[a-z0-9-]{0,}[a-z0-9]{1,}\.)+)([a-z]{2,10})$/

const DOMAIN_REG2_Wildcard_Code = /^(%2A\.)(([a-z0-9]{1,}(?!.*--)[a-z0-9-]{0,}[a-z0-9]{1,}\.)*)([a-z]{2,10})$/

// // 域名正则
// const DOMAIN_REG = /^[a-zA-Z0-9\u4e00-\u9fa5][a-zA-Z0-9\u4e00-\u9fa5-]{0,61}[a-zA-Z0-9\u4e00-\u9fa5]\.(?:[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?|[\u4e00-\u9fa5]{2,})$/
// // 泛域名正则
// const DOMAIN_WI_REG = /^(?:\*\.)?[a-zA-Z0-9\u4e00-\u9fa5][a-zA-Z0-9\u4e00-\u9fa5-]{0,61}[a-zA-Z0-9\u4e00-\u9fa5]\.(?:[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?|[\u4e00-\u9fa5]{2,})$/

// const CDN_DOMAIN_REG_Wildcard = /^((\*\.|[a-z0-9]{1,}\.)*)([a-z]{2,10})$/
// const CDN_DOMAIN_REG = /^(([a-z0-9]{1,}\.)*)([a-z]{2,10})$/

export const checkOrdinaryDomain = (domain: string) => {
  return DOMAIN_REG.test(domain)
}

export const checkWildcardDomain = (domain: string) => {
  return DOMAIN_WI_REG.test(domain)
}

export const checkWildcardCodeDomain = (domain: string) => {
  return DOMAIN_REG1.test(domain) || DOMAIN_REG2_Wildcard_Code.test(domain)
}

export const validFileExtension = (content: string, reg: RegExp, separator: string = ';') => {
  // 分割输入字符串
  const extensions = content.split(separator)

  // 检查文件后缀名总数是否超过20个
  if (extensions.length > 20) {
    return false
  }

  // 检查字符总数是否超过255
  if (content.length > 255) {
    return false
  }

  // 创建正则表达式以验证每个文件后缀名
  const regex = reg

  // 验证每个文件后缀名
  for (let i = 0; i < extensions.length; i++) {
    if (!regex.test(extensions[i])) {
      return false
    }
  }

  // 如果所有检查都通过，则返回true
  return true
}

export const validContent = (content: string, type: number) => {
  // eslint-disable-next-line no-useless-escape
  const regs = [null, /^[a-zA-Z0-9]+$/, /^\/(?!.*\/$)([^*\/]*\/)*[^*\/]*$/, /^\/(?!.*\/$)([^\/]*\/)*[^\/]*$/, null]
  if (type === 0 || type === 4) return true
  return validFileExtension(content, regs[type] as RegExp)
}

export const getPlaceholder = (type: number) => {
  if (type === 0 || type === 4) return ''
  return [null, 'jpg;png;css', '/test;/a/b/c', '/index.html;/test/*.jpg', null][type]
}

export const validTime = (ttl: number, ttl_unit: number) => {
  const timeMap = [
    null,
    60 * 60 * 24 * 365, //秒
    60 * 24 * 365, //分钟
    24 * 365, //小时
    365, //天
  ]
  return ttl <= timeMap[ttl_unit]! && +ttl > 0
}

export const validParams = (params: string, type: number) => {
  if (type < 2) return true

  if (params.length > 75) return false

  const arr = params.split(';')

  if (arr.length > 10) return false

  const reg = /^[0-9a-zA-Z-]{1,128}$/

  for (let i = 0; i < arr.length; i++) {
    if (!reg.test(arr[i])) {
      return false
    }
  }

  return true
}

export const validPort = (params: any) => {
  return +params > 0 && +params < 65536 && Number.isInteger(+params)
}

export const validWieght = (w: any) => {
  return +w > 0 && +w < 101 && Number.isInteger(+w)
}

export const validIPlist = (params: string, length?: number) => {
  const arr = params.split(';')
  return arr.length > 0 && arr.every(v => validIP(v)) && arr.length < (length || 51)
}

export const validHttpHeadValue = (type: string, params: any) => {
  const arr = params.split(',')
  if (params.length > 256 || !params || arr.length > 66) {
    return false
  }

  if (type === 'Access-Control-Allow-Origin') {
    if (params === '*') return true
    return arr.every(v => validHttpUrl(v))
  } else if (type === 'Access-Control-Allow-Methods') {
    const methods = ['GET', 'POST', 'HEAD', 'PUT', 'OPTIONS', 'DELETE', 'PATCH', 'TRACE', 'CONNECT']
    let valid = false
    for (let i = 0; i < arr.length; i++) {
      if (methods.includes(arr[i])) {
        valid = true
      } else {
        valid = false
        break
      }
    }
    return valid
  } else if (type === 'Access-Control-Max-Age') {
    return params > 0 && params < +'1000000000' && +params[0] !== 0
  } else if (type === 'Access-Control-Expose-Headers') {
    return arr.every(v => /^[a-zA-Z0-9!#$%&'*+.^_`|~-]+(\s*,\s*[a-zA-Z0-9!#$%&'*+.^_`|~-]+)*$/.test(v))
  } else if (type === 'Content-Disposition') {
    return params === 'inline' || params === 'attachment' || /attachment;filename="[^"]+\.[^"]+"/.test(params)
  } else if (type === 'Content-Language') {
    return STRING_REG.test(params)
  } else if (!type) {
    return STRING_REG.test(params)
  }
}

export const tableColumnNotRepeat = (
  tableData: any[],
  row: any,
  key1: string,
  index: number | undefined,
  key2?: string,
) => {
  if (key2 !== undefined) {
    return !tableData.find((v, i) => v[key1] === row[key1] && v[key2] === row[key2] && i != index)
  } else {
    return !tableData.find((v, i) => v[key1] === row[key1] && i != index)
  }
}

export const inputNotRepeat = (tableData: any, value: string, key: string, index: number | undefined) => {
  const arr1 = value.split(';')

  let valid

  if ([...new Set([...arr1])].length === arr1.length) {
    //输入查重
    valid = true
  } else {
    valid = false
    return valid
  }

  const arr2 = tableData.map(v => v[key])

  for (let i = 0; i < arr2.length; i++) {
    //表格查重
    if (i === index) {
      continue
    }
    if (arr1.includes(arr2[i])) {
      valid = false
      break
    } else {
      valid = true
    }
  }

  return valid
}

export const validIP = (ip: string) => {
  const blockedRanges = [
    { start: '0.0.0.0', end: '0.255.255.255' },
    { start: '10.0.0.0', end: '10.255.255.255' },
    { start: '100.64.0.0', end: '100.127.255.255' },
    { start: '127.0.0.0', end: '127.255.255.255' },
    { start: '169.254.0.0', end: '169.254.255.255' },
    { start: '172.16.0.0', end: '172.31.255.255' },
    { start: '192.0.0.0', end: '192.0.0.255' },
    { start: '192.0.2.0', end: '192.0.2.255' },
    { start: '192.88.99.0', end: '192.88.99.255' },
    { start: '192.168.0.0', end: '192.168.255.255' },
    { start: '198.18.0.0', end: '198.19.255.255' },
    { start: '198.51.100.0', end: '198.51.100.255' },
    { start: '203.0.113.0', end: '203.0.113.255' },
    { start: '224.0.0.0', end: '239.255.255.255' },
    { start: '240.0.0.0', end: '255.255.255.254' },
    { start: '255.255.255.255', end: '255.255.255.255' },
  ]
  const ipNum = ip.split('.').reduce((ipInt, octet) => (ipInt << 8) + parseInt(octet), 0)
  for (const range of blockedRanges) {
    const startNum = range.start.split('.').reduce((ipInt, octet) => (ipInt << 8) + parseInt(octet), 0)
    const endNum = range.end.split('.').reduce((ipInt, octet) => (ipInt << 8) + parseInt(octet), 0)
    if (ipNum >= startNum && ipNum <= endNum) {
      return false
    }
  }
  if (ipAndMaskRegex.test(ip)) {
    return true
  }
  return false
}

export const validHttpUrl = string => {
  let url

  try {
    url = new URL(string)
  } catch {
    return false
  }

  if (!/^(https?:\/\/)/.test(string)) {
    return false
  }

  const port = url.port
  if (port < 0 || port > 65535) {
    return false
  }
  if (url.pathname === '/' && string[string.length - 1] === ':') {
    return false
  }

  if (string[string.length - 1] === '.') {
    return false
  }

  const host = url.hostname

  if (host.length > 63) {
    return false
  }

  if (!checkOrdinaryDomain(host)) {
    return false
  }

  return true
}

export const validDomain = string => {
  const len = string[0] === '*' ? 3 : 2
  if (string.split('.').length < len) {
    return false
  }

  // 域名或ip地址
  if (!checkWildcardDomain(string) && !validIP(string)) {
    return false
  }
  return true
}

export const validDomain2 = (string: string) => {
  if (string.length > 63 || !string) {
    return false
  }

  // 不允许泛域名
  if (string.startsWith('*')) {
    return false
  }

  // 域名或ip地址
  if (!checkWildcardDomain(string) && !validIP(string)) {
    return false
  }
  return true
}

export const validPathAndUrl = (string, obj?) => {
  const options = {
    checkDir: false, //目录
    checkPath: true, //url
    validWildcard: false, //是否允许通配符匹配域名
    ...obj,
  }

  let url
  try {
    url = new URL(string)
  } catch {
    return false
  }

  const protocol = /^https?:\/\//
  if (!protocol.test(string)) {
    return false
  }

  const port = +url.port
  if (port < 0 || port > 65535) {
    return false
  }
  if (url.pathname === '/' && string[string.length - 1] === ':') {
    return false
  }

  const test = options.validWildcard ? checkWildcardDomain : checkOrdinaryDomain
  // 对原始域名进行校验
  const host = domainToUnicode(url.hostname)
  const len = options.validWildcard ? 3 : 2
  if (host.split('.').length < len) {
    return false
  } else if (host.length > 63) {
    return false
  } else if (!test(host)) {
    return false
  }

  const path = url.pathname

  if (options.checkPath && options.checkDir) {
    if (string[string.length - 1] !== '/') {
      return false
    } else {
      return true
    }
  }

  if (!options.checkPath && !options.checkDir) {
    if (path === '/') {
      return false
    }
    return true
  }

  if (options.checkPath) {
    if (path === '/') {
      return false
    }
    if (path[path.length - 1] === '.') {
      return false
    }
    return true
  }

  if (options.checkDir) {
    if (path !== '/' || string[string.length - 1] !== '/') {
      return false
    }
  }
  return true
}

export const notification = (params: { type: 'success' | 'failed'; msg: string }) => {
  const icon = {
    success: 'dialog-success',
    failed: 'dialog-failed',
  }
  notify({
    customClass: 'notification-' + params.type,
    offset: 100,
    duration: 1500,
    showClose: true,
    dangerouslyUseHTMLString: true,
    message: h('div', { style: 'display:flex;align-items:center' }, [
      h(SvgIcon, { name: icon[params.type], style: 'margin-right: 6px;' }),
      h('div', {}, t(params.msg)),
    ]),
  })
}

export const alsoInput = number => {
  // 限制输入数量
  if (number < 0) number = 0
  const { locale } = useI18n()
  const lang = locale.value || 'en'
  if (lang.includes('zh')) {
    return `还可以输入<span style="color:var(--primary-color)">${number}</span>个`
  }
  if (lang.includes('en') || lang.includes('us')) {
    return `You can also enter <span style="color:var(--primary-color)">${number}</span>`
  }
  if (lang.includes('ja') || lang.includes('jp')) {
    return `<span style="color:var(--primary-color)">${number}</span>個も入力できます`
  }
}

export const showErrorTip = msg => {
  if ((window as any).CDN_ERROR) {
    return
  }
  ;(window as any).CDN_ERROR = true
  notification({ type: 'failed', msg })
  const timer = setTimeout(() => {
    ;(window as any).CDN_ERROR = false
    clearTimeout(timer)
  }, 2000)
}
