import { debounce, throttle } from 'lodash-es'

export const _throttle = <T extends (...args: any[]) => any>(func: T, wait = 800) => {
  return throttle((...args: Parameters<T>) => func(...args), wait, {
    leading: true,
    trailing: false,
  })
}

export const _debounce = <T extends (...args: any[]) => any>(func: T, wait = 300, immediate = false) => {
  return debounce((...args: Parameters<T>) => func(...args), wait, {
    leading: immediate,
    trailing: !immediate,
  })
}
