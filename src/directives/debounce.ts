import { _debounce } from '@/utils/timing-utils' // 你封装的

export const debounce = {
  mounted(
    el: HTMLElement,
    binding: {
      value: { callback: Function; params?: any; delay?: number }
    },
  ) {
    const { callback, params, delay = 1000 } = binding.value

    if (!callback || typeof callback !== 'function') {
      throw new Error('callback is not a function')
    }

    const handler = _debounce((e: Event) => {
      callback(params ?? e)
    }, delay)

    el.addEventListener('click', (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      handler(e)
    })
  },
}

export default debounce
