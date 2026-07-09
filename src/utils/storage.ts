const canUseStorage = typeof window !== 'undefined'

const toStorableValue = (value: unknown) => {
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return JSON.stringify(value)
}

const parseStoredValue = <T = unknown>(value: string): T | string => {
  try {
    return JSON.parse(value) as T
  } catch {
    return value
  }
}

export const setLocalItemRaw = (key: string, value: string | number | boolean) => {
  if (!canUseStorage) {
    return
  }
  window.localStorage.setItem(key, String(value))
}

export const getLocalItemRaw = (key: string) => {
  if (!canUseStorage) {
    return void 0
  }
  return window.localStorage.getItem(key) ?? void 0
}

export const removeLocalItem = (key: string) => {
  if (!canUseStorage) {
    return
  }
  window.localStorage.removeItem(key)
}

export const clearLocalItems = () => {
  if (!canUseStorage) {
    return
  }
  window.localStorage.clear()
}

export const setLocalItem = (key: string, value: unknown) => {
  setLocalItemRaw(key, toStorableValue(value))
}

export const getLocalItem = <T = unknown>(key: string, raw?: boolean) => {
  const value = getLocalItemRaw(key)
  if (value === void 0) {
    return void 0
  }
  return raw ? value : parseStoredValue<T>(value)
}

export const setSessionItemRaw = (key: string, value: string | number | boolean) => {
  if (!canUseStorage) {
    return
  }
  window.sessionStorage.setItem(key, String(value))
}

export const getSessionItemRaw = (key: string) => {
  if (!canUseStorage) {
    return void 0
  }
  return window.sessionStorage.getItem(key) ?? void 0
}

export const removeSessionItem = (key: string) => {
  if (!canUseStorage) {
    return
  }
  window.sessionStorage.removeItem(key)
}

export const clearSessionItems = () => {
  if (!canUseStorage) {
    return
  }
  window.sessionStorage.clear()
}

export const setSessionItem = (key: string, value: unknown) => {
  setSessionItemRaw(key, toStorableValue(value))
}

export const getSessionItem = <T = unknown>(key: string, raw?: boolean) => {
  const value = getSessionItemRaw(key)
  if (value === void 0) {
    return void 0
  }
  return raw ? value : parseStoredValue<T>(value)
}

export const _setItem = setLocalItem
export const _getItem = (key: string, noParse?: boolean): any => getLocalItem(key, !!noParse)
export const _remove = removeLocalItem
export const _clear = clearLocalItems
export const _s_setItem = setSessionItem
export const _s_getItem = <T = any>(key: string): T => getSessionItem<T>(key) as T
