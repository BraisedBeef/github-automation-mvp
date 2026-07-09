import cookies from 'js-cookie'
import { domainUrl } from '@/config/base-config'

const domain = domainUrl

const canUseDomainCookie = () => {
  if (!domain || typeof window === 'undefined') return false

  const hostname = window.location.hostname
  const normalizedDomain = domain.replace(/^\./, '')

  return hostname === normalizedDomain || hostname.endsWith(`.${normalizedDomain}`)
}

// 获取cookies
export function getCookies(key) {
  return cookies.get(key)
}

// 设置Cookies
export function setCookies(key, value) {
  const options = canUseDomainCookie() ? { domain } : undefined
  cookies.set(key, value, options)
}

// 移除Cookies
export function removeCookies(key) {
  cookies.remove(key)

  if (canUseDomainCookie()) {
    cookies.remove(key, { domain })
  }
}
