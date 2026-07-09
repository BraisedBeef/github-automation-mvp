import { _formateTimeDayjs } from '@/utils/format-time'
import { InfoBoxInterface } from './info-box.vue'
import { PageName } from './type'
import { getFluxDetail, bpsToMbps, getRequestDetail } from '@/utils/unit'
import Broadband from './broadband/index.vue'
import Flow from './flow/index.vue'
import Request from './request/index.vue'
import Hit from './hit/index.vue'
import Status from './status/index.vue'
import Back from './back/index.vue'
import Backflow from './back-flow/index.vue'
import Backrequest from './back-request/index.vue'
import Backstatus from './back-status/index.vue'
import { getDateDayjs } from '@/utils/format-time'
import t from '@/utils/i18n'

export const monitorRoutes = [
  { label: t('bandwidth'), value: 'broadband', c: Broadband, allow: '3' },
  { label: t('flux'), value: 'flow', c: Flow, allow: '3' },
  { label: t('requestCount'), value: 'request', c: Request, allow: '3' },
  { label: t('hitRateTitle'), value: 'hit', c: Hit, allow: '3' },
  { label: t('statusCode'), value: 'status', c: Status, allow: '3' },
  { label: t('pullBandwidth'), value: 'back', c: Back, allow: '0,1,2' },
  { label: t('pullFlux'), value: 'backFlow', c: Backflow, allow: '0,1,2' },
  { label: t('pullRequestTitle'), value: 'backRequest', c: Backrequest, allow: '0,1,2' },
  { label: t('pullStatusCodeTitle'), value: 'backStatus', c: Backstatus, allow: '0,1,2' },
]

// 判断form-item的展示
export const showConfig: { [x in PageName]: any } = {
  // 带宽
  broadband: {
    compare: true, // 存在数据对比
    spilt: true, // 存在拆分
    operator: true, // 存在运营商筛选
    http_protocol: true, // 存在http筛选
    ip_protocol: true, // 存在ip筛选
  },
  // 流量
  flow: {
    compare: true,
    spilt: true, // 存在拆分
    operator: true,
    http_protocol: true,
    ip_protocol: true,
  },
  // 请求数
  request: {
    compare: true,
    operator: true,
    http_protocol: true,
    ip_protocol: true,
  },
  // 命中率
  hit: {
    compare: false,
  },
  // 状态码
  status: {
    compare: false,
  },
  // 回源带宽
  back: {
    compare: true,
  },
  // 回源流量
  backFlow: {
    compare: true,
  },
  // 回源请求数
  backRequest: {
    compare: true,
  },
  // 回源状态码
  backStatus: {
    compare: false,
  },
}

const boxTimeFormat = 'YYYY-MM-DD HH:mm'

//
export const formatMonitorTime = (time: number) => {
  return time ? _formateTimeDayjs(time * 1000, boxTimeFormat) : ''
}

// 格式化数据
export const formatInfoBox = (keys: string[], data: any[], info: InfoBoxInterface[]) => {
  const arr: InfoBoxInterface[] = info
  for (let i = 0; i < keys.length; i++) {
    let time
    if (data[keys[i]].start_time) {
      time =
        getDateDayjs(data[keys[i]].start_time * 1000, 'string', true) +
        ' ~ ' +
        getDateDayjs(data[keys[i]].end_time * 1000, 'string', true)
    } else {
      time = getDateDayjs(data[keys[i]].time * 1000, 'string', true)
    }
    arr[i] = {
      ...arr[i],
      value:
        arr[i].type === 'bandwidth'
          ? +bpsToMbps(data[keys[i]].value)
          : arr[i].type === 'flux'
            ? getFluxDetail(data[keys[i]].value).count
            : arr[i].type === 'request'
              ? getRequestDetail(data[keys[i]].value).count
              : arr[i].type === 'rate'
                ? +(data[keys[i]].value * 100).toFixed(2)
                : '',
      time,
      unit:
        arr[i].type === 'bandwidth'
          ? 'Mbps'
          : arr[i].type === 'flux'
            ? getFluxDetail(data[keys[i]].value).unit
            : arr[i].type === 'request'
              ? getRequestDetail(data[keys[i]].value).unit
              : arr[i].type === 'rate'
                ? '%'
                : '',
    }
  }
  return arr
}

// 最大拆分域名数量
export const MAX_SPLIT_DOMAIN = 10
