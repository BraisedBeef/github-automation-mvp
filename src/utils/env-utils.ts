import { _throttle } from '@/utils/timing-utils'
import { message } from '@/utils/message'
import { setSessionItemRaw } from '@/utils/storage'

export const getEnvAccount = _throttle(() => {
  message.success('got it')
  setSessionItemRaw(
    'cat-test-account',
    JSON.stringify({
      18711788520: 'cscs123456',
      15100000001: 'cscs123456',
    }),
  )
}, 1000)
