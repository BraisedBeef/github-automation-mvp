import dayjs from 'dayjs'
import t from '@/utils/i18n'
import { useBaseStore } from '@/store'
import { LANGUAGE_MAP } from '@/config/constant-config'
import {
  maoYunDayJs,
  FORMAT_TIME_NO_UTC,
  FORMAT_DAY_NO_UTC,
  FORMAT_TIME,
  FORMAT_ONLY_TIME_NO_UTC,
} from '@/utils/mao-yun-day-js'

export type FormatDate = string | number | Date | null | undefined | dayjs.Dayjs

export const _formateTimeDayjs = (time: FormatDate, type = FORMAT_TIME_NO_UTC) => {
  return time ? maoYunDayJs(time).format(type) : '-'
}

export const _formateTime = _formateTimeDayjs

export const _getOneDayDayjs = (num: number) => {
  return maoYunDayJs().subtract(num, 'day').valueOf()
}

export const _devideTimeDayjs = (range?: string[]) => {
  if (!range || range.length === 0) {
    const now: any = maoYunDayJs().valueOf()
    const interval = 1
    const start = now - 12 * interval * 60 * 60 * 1000
    const dates: string[] = []
    for (let i = 0; i < 12; i++) {
      const date = maoYunDayJs(start + i * interval * 60 * 60 * 1000)
      dates.push(_formateTimeDayjs(date))
    }
    return dates
  } else {
    const startTime: number = maoYunDayJs(range[0]).valueOf()
    const endTime: number = maoYunDayJs(range[1]).valueOf()
    const average: number = (endTime - startTime) / 12
    const dateArray: any[] = []
    for (let i = 0; i < 12; i++) {
      dateArray.push(_formateTimeDayjs(startTime + average * i, FORMAT_TIME_NO_UTC))
    }
    return dateArray
  }
}

const computeOffset = (o: number) => {
  if (!o) {
    return 0
  }
  if (typeof o !== 'number') {
    return 0
  }
  return -o
}

export const _getCustomTimeDayjs = (
  time: any,
  t: 'hour' | 'day' | 'week' | 'month',
  _offset: number,
  format = FORMAT_TIME_NO_UTC,
) => {
  const offset: number = computeOffset(_offset) || 0
  return maoYunDayJs(time).subtract(offset, t).format(format)
}

export const _getDurationTime2Dayjs = (t: 'today' | 'yesterday' | 'lastweek' | 'month' | 'custom', offset?: number) => {
  const todayStr = maoYunDayJs().format(FORMAT_DAY_NO_UTC)
  if (t === 'today') {
    return [todayStr + ' 00:00:00', todayStr + ' 23:59:00']
  }
  if (t === 'yesterday') {
    const yesterday = maoYunDayJs().subtract(1, 'day').format(FORMAT_DAY_NO_UTC)
    return [yesterday + ' 00:00:00', yesterday + ' 23:59:00']
  }
  if (t === 'lastweek') {
    const lastweekDay = maoYunDayJs().subtract(6, 'day').format(FORMAT_DAY_NO_UTC)
    return [lastweekDay + ' 00:00:00', todayStr + ' 23:59:00']
  }
  if (t === 'month') {
    const lastmonthDay = maoYunDayJs().subtract(1, 'month').subtract(-1, 'day').format(FORMAT_DAY_NO_UTC)
    return [lastmonthDay + ' 00:00:00', todayStr + ' 23:59:00']
  }
  if (offset) {
    const custom_start = maoYunDayJs().subtract(offset, 'day').format(FORMAT_DAY_NO_UTC)
    const custom_end = maoYunDayJs()
      .subtract(Math.floor(offset / 2) + 1, 'day')
      .format(FORMAT_DAY_NO_UTC)
    return [custom_start + ' 00:00:00', custom_end + ' 23:59:59']
  }
  return [todayStr + ' 00:00:00', todayStr + ' 23:59:00']
}

export const _getTimeRangeListDayjs = (range: number) => {
  try {
    return [maoYunDayJs().subtract(range, 'year').format(FORMAT_DAY_NO_UTC), maoYunDayJs().format(FORMAT_DAY_NO_UTC)]
  } catch (error) {
    console.log('_getTimeRange', error)
    return []
  }
}

export const theDayDayjs = (offset = 0) => {
  return maoYunDayJs().subtract(offset, 'day').startOf('day').valueOf()
}

export const _duration = (s: number) => {
  if (!s) {
    return '-'
  }
  const dateTime = 24 * 60 * 60
  const hourTime = 60 * 60
  const minuteTime = 60
  const d = Number(parseInt(s / 60 / 60 / 24 + '')) || 0
  if (d > 0) {
    s = s - d * dateTime
  }
  const h = Number(parseInt(s / 60 / 60 + '')) || 0
  if (h > 0) {
    s = s - h * hourTime
  }
  const m = Number(parseInt(s / 60 + '')) || 0
  if (m > 0) {
    s = s - m * minuteTime
  }
  let str: any = [
    { k: d, v: d ? t('common.d', { d: d }) : '' },
    { k: h, v: h ? t('common.h', { h: h }) : '' },
    { k: m, v: m ? t('common.m', { m: m }) : '' },
    { k: s, v: s ? t('common.s', { s: s }) : '' },
  ].filter(item => item.v)

  if (useBaseStore().$state.lang === LANGUAGE_MAP.en.i18nParam) {
    str = str.map(item => {
      return item.k === 1 ? item.v + ' ' : item.v + 's '
    })
  } else {
    str = str.map(item => item.v + ' ')
  }
  return str.join(' ')
}

export const _getDaysDifference = (date1, date2) => {
  const firstDate: any = new Date(date1)
  const secondDate: any = new Date(date2)
  const timeDifference = Math.abs(secondDate - firstDate)
  const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24))
  return daysDifference
}

export const isIntervalMoreThan7Days = (time: any[]) => {
  const d1 = +new Date(time[0])
  const d2 = +new Date(time[1])
  const timeDifference = Math.abs(d2 - d1)
  const dayDifference = timeDifference / (1000 * 60 * 60 * 24)
  return dayDifference >= 7
}

export const getDateDayjs = (
  time: number | Date | string | dayjs.Dayjs = maoYunDayJs(),
  type?: 'string' | 'number' | any,
  utc: boolean = false,
): string | any[] => {
  const format = utc ? FORMAT_TIME : FORMAT_TIME_NO_UTC
  if (type === 'string') {
    return maoYunDayJs(time).format(format)
  }
  if (type === 'number') {
    return maoYunDayJs(time).format(format).replace(/-|:| /g, '')
  }
  return [
    maoYunDayJs(time).format(FORMAT_DAY_NO_UTC).split(/-/),
    maoYunDayJs(time).format(FORMAT_ONLY_TIME_NO_UTC).split(/:/),
  ]
}

export const setDateTimeRangeDayjs = (
  type: 'today' | 'yesterday' | 'week' | 'month' | 'custom' = 'custom',
  date?: number | Date | string | dayjs.Dayjs,
) => {
  const start = ' 00:00:00'
  const end = ' 23:59:59'
  const maoYunDay = maoYunDayJs()
  if (type === 'today') {
    const currentFormat = maoYunDay.format(FORMAT_DAY_NO_UTC)
    const compareFormat = maoYunDay.subtract(1, 'day').format(FORMAT_DAY_NO_UTC)
    return {
      current: [`${currentFormat}${start}`, `${currentFormat}${end}`],
      compare: [`${compareFormat}${start}`, `${compareFormat}${end}`],
    }
  }
  if (type === 'yesterday') {
    const currentFormat = maoYunDay.subtract(1, 'day').format(FORMAT_DAY_NO_UTC)
    const compareFormat = maoYunDay.subtract(2, 'day').format(FORMAT_DAY_NO_UTC)
    return {
      current: [`${currentFormat}${start}`, `${currentFormat}${end}`],
      compare: [`${compareFormat}${start}`, `${compareFormat}${end}`],
    }
  }
  if (type === 'week') {
    return {
      current: [
        `${maoYunDay.subtract(6, 'day').format(FORMAT_DAY_NO_UTC)}${start}`,
        `${maoYunDay.format(FORMAT_DAY_NO_UTC)}${end}`,
      ],
      compare: [
        `${maoYunDay.subtract(13, 'day').format(FORMAT_DAY_NO_UTC)}${start}`,
        `${maoYunDay.subtract(7, 'day').format(FORMAT_DAY_NO_UTC)}${end}`,
      ],
    }
  }
  if (type === 'month') {
    return {
      current: [
        `${maoYunDay.subtract(1, 'month').subtract(-1, 'day').format(FORMAT_DAY_NO_UTC)}${start}`,
        `${maoYunDay.format(FORMAT_DAY_NO_UTC)}${end}`,
      ],
      compare: [
        `${maoYunDay.subtract(2, 'month').subtract(-1, 'day').format(FORMAT_DAY_NO_UTC)}${start}`,
        `${maoYunDay.subtract(1, 'month').format(FORMAT_DAY_NO_UTC)}${end}`,
      ],
    }
  }
  const dateFormat = date ? maoYunDayJs(date).format(FORMAT_DAY_NO_UTC) : maoYunDayJs().format(FORMAT_DAY_NO_UTC)
  return {
    current: [`${dateFormat}${start}`, `${dateFormat}${end}`],
    compare: [`${dateFormat}${start}`, `${dateFormat}${end}`],
  }
}

export const getLastMonthDayjs = (): string[] => {
  const maoYunDay = maoYunDayJs()
  const startOfLastMonth = maoYunDay.subtract(1, 'month').startOf('month')
  const endOfLastMonth = maoYunDay.subtract(1, 'month').endOf('month')
  return [
    `${startOfLastMonth.format(FORMAT_DAY_NO_UTC)} 00:00:00`,
    `${endOfLastMonth.format(FORMAT_DAY_NO_UTC)} 23:59:59`,
  ]
}
