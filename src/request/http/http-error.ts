import type { AxiosError } from 'axios'
import { message } from '@/utils/message'
import t from '@/utils/i18n'

export function httpErrorHandler(transmit: boolean, error: AxiosError) {
  if (transmit) return
  if (error.response) {
    const { status, data } = error.response as any
    let msg = ''
    switch (status) {
      case 400:
        msg = t('error.badRequest')
        break
      case 401:
        msg = t('error.unauthorized')
        break
      case 403:
        msg = t('error.forbidden')
        break
      case 404:
        msg = t('error.notFound')
        break
      case 500:
        msg = t('error.serverError')
        break
      default:
        msg = data?.msg || t('error.requestFailedWithStatus', [status])
    }
    message.error(msg)
  } else if (error.request) {
    message.error(t('error.networkError'))
  } else {
    message.error(error.message || t('error.requestError'))
  }
}
