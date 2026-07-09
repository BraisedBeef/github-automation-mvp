import { LANG } from '@/config/constant-config'
import { getLocalItemRaw } from '@/utils/storage'

export const convert = 1000

export const bytesToGB = bytes => {
  if (!bytes) return '0'
  const gigabytes = bytes / (convert * convert * convert)
  return gigabytes.toFixed(2) + ''
}

export const bytesToMB = (bytes, fixed: number = 2) => {
  if (!bytes) return '0'
  const megabytes = bytes / (convert * convert)
  // return megabytes.toFixed(2) + ' MB';
  return megabytes.toFixed(fixed)
}

export const bpsToMbps = (bps, fixed: number = 2) => {
  if (!bps) return '0'
  // 将 Bps 转换为比特每秒（bps）
  const bpsValue = bps /* * 8*/
  // 将比特每秒转换为兆比特每秒（Mbps）
  const MbpsValue = bpsValue / 1e6
  // return MbpsValue.toFixed(2) + ' Mbps';
  return MbpsValue.toFixed(fixed)
}

export const getFlux = (byte): any => {
  if (!byte) {
    return '0B'
  }

  if (byte < convert) {
    return byte + 'B'
  }

  const kb = byte / convert
  if (kb < convert) {
    return +kb.toFixed(2) + 'KB'
  }

  const mb = kb / convert
  if (mb < convert) {
    return +mb.toFixed(2) + 'MB'
  }

  const gb = mb / convert
  if (gb < convert) {
    return +gb.toFixed(2) + 'GB'
  }

  const tb = gb / convert
  if (tb < convert) {
    return +tb.toFixed(2) + 'TB'
  }

  const pb = tb / convert
  return +pb.toFixed(2) + 'PB'
}
export const getRequest = number => {
  const lang = getLocalItemRaw(LANG)
  if (lang === 'en') {
    if (!number) {
      return '0Time'
    }

    if (number < 1000) {
      return number + 'Times'
    }

    const T = number / 1000
    if (T < 1000) {
      return +T.toFixed(2) + 'T Times'
    }
    const M = T / 1000
    if (M < 1000) {
      return +M.toFixed(2) + 'M Times'
    }
    const B = M / 1000
    return +B.toFixed(2) + 'B Times'
  } else if (lang === 'ja') {
    if (!number) {
      return '0回'
    }

    if (number < 10000) {
      return number + '回'
    }

    const w = number / 10000
    if (w < 10000) {
      return +w.toFixed(2) + '万回'
    } else {
      return +(w / 10000).toFixed(2) + '亿回'
    }
  } else {
    if (!number) {
      return '0次'
    }

    if (number < 10000) {
      return number + '次'
    }

    const w = number / 10000
    if (w < 10000) {
      return +w.toFixed(2) + '万次'
    } else {
      return +(w / 10000).toFixed(2) + '亿次'
    }
  }
}

export const fluxFormat = (
  flux: number,
  unit: 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB' | string,
  type: boolean = true,
) => {
  if (unit === 'B') {
    return type ? flux : +flux.toFixed(2)
  } else if (unit === 'KB') {
    return type ? 10 ** 3 * flux : +(flux / 10 ** 3).toFixed(2)
  } else if (unit === 'MB') {
    return type ? 10 ** 6 * flux : +(flux / 10 ** 6).toFixed(2)
  } else if (unit === 'GB') {
    return type ? 10 ** 9 * flux : +(flux / 10 ** 9).toFixed(2)
  } else if (unit === 'TB') {
    return type ? 10 ** 12 * flux : +(flux / 10 ** 12).toFixed(2)
  } else if (unit === 'PB') {
    return type ? 10 ** 15 * flux : +(flux / 10 ** 15).toFixed(2)
  }
}

export const getFluxDetail = byte => {
  if (!byte) {
    return { count: 0, unit: 'B' }
  }

  if (byte < convert) {
    return { count: byte, unit: 'B' }
  }

  const kb = byte / convert
  if (kb < convert) {
    return { count: +kb.toFixed(2), unit: 'KB' }
  }

  const mb = kb / convert
  if (mb < convert) {
    return { count: +mb.toFixed(2), unit: 'MB' }
  }

  const gb = mb / convert
  if (gb < convert) {
    return { count: +gb.toFixed(2), unit: 'GB' }
  }

  const tb = gb / convert
  if (tb < convert) {
    return { count: +tb.toFixed(2), unit: 'TB' }
  }

  const pb = tb / convert
  return { count: +pb.toFixed(2), unit: 'PB' }
}
export const getRequestDetail = (count): any => {
  const lang = getLocalItemRaw(LANG)
  if (lang === 'en') {
    console.log(11)
    if (!count) {
      return { count: 0, unit: 'Time' }
    }
    if (count < 10000) {
      return { count, unit: 'Times' }
    }
    const T = count / 1000
    if (T < 1000) {
      return { count: +T.toFixed(2), unit: 'T Times' }
    }
    const M = T / 1000
    if (M < 1000) {
      return { count: +M.toFixed(2), unit: 'M Times' }
    }
    const B = M / 1000
    return { count: +B.toFixed(2), unit: 'B Times' }
  } else if (lang === 'ja') {
    if (!count) {
      return { count: 0, unit: '回' }
    }
    if (count < 10000) {
      return { count, unit: '回' }
    }
    const w = count / 10000
    if (w < 10000) {
      return { count: +w.toFixed(2), unit: '万回' }
    } else {
      return { count: +(w / 10000).toFixed(2), unit: '亿回' }
    }
  } else {
    if (!count) {
      return { count: 0, unit: '次' }
    }
    if (count < 10000) {
      return { count, unit: '次' }
    }
    const w = count / 10000
    if (w < 10000) {
      return { count: +w.toFixed(2), unit: '万次' }
    } else {
      return { count: +(w / 10000).toFixed(2), unit: '亿次' }
    }
  }
}

export const getDiscount = (price, originalPrice) => {
  if (price >= originalPrice || !price || !originalPrice) {
    return 0
  }
  const lang = getLocalItemRaw(LANG)

  if (lang === 'en') {
    return +(((originalPrice - price) / originalPrice) * 100).toFixed(1) + '% off'
  } else if (lang === 'ja') {
    return +(((originalPrice - price) / originalPrice) * 100).toFixed(1) + '% 割引'
  } else {
    return +((price / originalPrice) * 10).toFixed(1) + '折'
  }
}
