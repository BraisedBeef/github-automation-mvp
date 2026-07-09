import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isSameOrBefore)

/**
 * @desc 由于后端存在时间格式各不相同，有时间戳，utc时间，时区时间，字符串...且存库是东八区，暂时做不了动态时区展示
 * @desc 项目所有时间都以东八区为准，需统一时间控件，字段时间，图表展示
 * @desc 如需动态时区展示，约定后端时间字段，都应以时间戳返回或者请求
 */
const dynamicTz = false
export const FORMAT_DAY = 'YYYY-MM-DD [(UTC+8)]'
export const FORMAT_TIME = 'YYYY-MM-DD HH:mm:ss [(UTC+8)]'
export const FORMAT_TO_MINUTE = 'YYYY-MM-DD HH:mm [(UTC+8)]'
export const FORMAT_TIME_HMS = 'HH:mm:ss [(UTC+8)]'
export const FORMAT_DAY_NO_UTC = 'YYYY-MM-DD'
export const FORMAT_TIME_NO_UTC = 'YYYY-MM-DD HH:mm:ss'
export const FORMAT_ONLY_TIME_NO_UTC = 'HH:mm:ss'
export const FORMAT_MONTH_NO_UTC = 'YYYY-MM'
export const FORMAT_YEAR_NO_UTC = 'YYYY'
export const FORMAT_ONLY_MONTH_NO_UTC = 'MM'
export const FORMAT_ONLY_MONTH_SINGLE_NO_UTC = 'M'

/**
 * 检测字符串是否包含时区信息
 * @param dateStr 日期字符串
 * @returns 是否带有时区
 */
const hasTimezone = (dateStr: string): boolean => {
  const pattern = /([+-]\d{2}:?\d{2}|Z|[A-Z]{3,4})$/
  return pattern.test(dateStr)
}
/**
 * @param date
 * @param tz
 * @returns 东八区的dayjs
 */
export const shanghaiDayjs = (date?: dayjs.ConfigType, tz: string = 'Asia/Shanghai'): dayjs.Dayjs => {
  if (!date) {
    // 未传date，使用当前时间戳并转换为目标时区
    return dayjs.tz(Date.now(), tz)
  } else if (typeof date === 'string') {
    // 去除字符串两端的空格
    const trimmedDate = date.trim()

    if (hasTimezone(trimmedDate)) {
      // 带有时区信息，解析后转换为目标时区
      return dayjs(trimmedDate).tz(tz)
    } else {
      // 无时区信息，严格解析为目标时区时间
      return dayjs.tz(trimmedDate, tz)
    }
  } else {
    // 处理其他类型（如时间戳、Date对象）
    return dayjs.tz(date, tz)
  }
}

export const appDayjs = dynamicTz ? dayjs : shanghaiDayjs
export const shangHaiDayJs = shanghaiDayjs
export const maoYunDayJs = appDayjs

export type ManipulateType = dayjs.ManipulateType
export type MaoYunDayJs = dayjs.Dayjs
export {
  _formateTimeDayjs,
  _getOneDayDayjs,
  _devideTimeDayjs,
  _getCustomTimeDayjs,
  _getDurationTime2Dayjs,
  _getTimeRangeListDayjs,
  theDayDayjs,
  _duration,
  _getDaysDifference,
  isIntervalMoreThan7Days,
  getDateDayjs,
  setDateTimeRangeDayjs,
  getLastMonthDayjs,
} from '@/utils/format-time'
export type { FormatDate } from '@/utils/format-time'

/**
 console.log('-------------------dayjs--------------------')
console.log('2025-03-04 12:00:00在本地时区时间戳===>', dayjs('2025-03-04 12:00:00').valueOf())
console.log('2025-03-04 12:00:00在中国时区的时间戳===>', dayjs.tz('2025-03-04 12:00:00', 'Asia/Shanghai').valueOf())
console.log('2025-03-04 12:00:00在日本时区的时间戳===>', dayjs.tz('2025-03-04 12:00:00', 'Asia/Tokyo').valueOf())
console.log('2025-03-04 12:00:00在本地时区进行格式化===>', dayjs('2025-03-04 12:00:00').format('YYYY-MM-DD HH:mm:ss'))
console.log(
  '2025-03-04 12:00:00在中国时区进行格式化===>',
  dayjs.tz('2025-03-04 12:00:00', 'Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss'),
)
console.log(
  '2025-03-04 12:00:00在日本时区进行格式化===>',
  dayjs.tz('2025-03-04 12:00:00', 'Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss'),
)
console.log('1741060800000在本地时区进行格式化', dayjs(1741060800000).format('YYYY-MM-DD HH:mm:ss'))
console.log(
  '1741060800000在中国时区进行格式化===>',
  dayjs.tz(1741060800000, 'Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss'),
)
console.log(
  '1741060800000在日本时区进行格式化===>',
  dayjs.tz(1741060800000, 'Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss'),
)

console.log('-------------------js Date对象--------------------')
console.log('2025-03-04 12:00:00的本地时间戳===>', new Date('2025-03-04 12:00:00').getTime())
console.log('2025-03-04 12:00:00的UTC时间戳===>', Date.UTC(2025, 2, 4, 12, 0, 0))
console.log('2025-03-04 12:00:00的东九区时间戳===>', new Date('2025-03-04T12:00:00+09:00').getTime())
 */
