import t from '@/utils/i18n'
export const IS_DEFAULT_LIST = [
  { label: t('subnet.yes'), value: 1 },
  { label: t('subnet.no'), value: 2 },
]

// 子网cidr掩码长度可选值 及其可用IP数
export const netmaskList = [
  { label: 24, value: 24, num: 256 },
  { label: 25, value: 25, num: 128 },
  { label: 26, value: 26, num: 64 },
  { label: 27, value: 27, num: 32 },
  { label: 28, value: 28, num: 16 },
]

export const getNetmaskList = (minPrefixLength = 24, maxPrefixLength = 28) => {
  if (minPrefixLength > maxPrefixLength) {
    return []
  }
  return Array.from({ length: maxPrefixLength - minPrefixLength + 1 }, (_, index) => {
    const prefix = minPrefixLength + index
    const total = 2 ** (32 - prefix)
    return {
      label: prefix,
      value: prefix,
      num: total,
    }
  })
}

// 获取vpc子网cidr列表
const binaryToIp = (binary: string) => {
  const ip: number[] = []
  for (let i = 0; i < 32; i += 8) {
    const str: string = binary.slice(i, i + 8)
    ip.push(parseInt(str, 2))
  }
  return ip.join('.')
}

const calculateSubnets = (ip, originalPrefix, newPrefix) => {
  const numberOfSubnets = 1 << (newPrefix - originalPrefix) // 2^(newPrefix - originalPrefix)
  const subnets: string[] = []

  // Convert IP to binary
  const ipParts = ip.split('.').map(Number)
  const ipBinary = ipParts.map(part => part.toString(2).padStart(8, '0')).join('')

  for (let i = 0; i < numberOfSubnets; i++) {
    // Calculate the subnet binary prefix
    const subnetBinary = ipBinary.slice(0, originalPrefix) + i.toString(2).padStart(newPrefix - originalPrefix, '0')

    // Convert back to dotted-decimal format
    const subnetIp = binaryToIp(subnetBinary.padEnd(32, '0'))
    subnets.push(`${subnetIp}/${newPrefix}`)
  }

  return subnets
}

export const calculateAllowedSubnets = (cidr, minPrefixLength = 24, maxPrefixLength = 28) => {
  const [ip, prefixLength] = cidr.split('/')
  const originalPrefix = parseInt(prefixLength, 10)
  const startPrefix = Math.max(originalPrefix, minPrefixLength)
  const endPrefix = Math.max(startPrefix, maxPrefixLength)

  const subnets: { [key: number]: string[] } = {}

  for (let newPrefix = startPrefix; newPrefix <= endPrefix; newPrefix++) {
    subnets[newPrefix] = calculateSubnets(ip, originalPrefix, newPrefix)
  }

  return subnets
}

/**
 * 将子网cidr列表拆分成单独的列表
 * 如 [ '10.0.56.0/25', '10.0.56.1/25', '10.0.57.0/25', '10.0.57.1/25' ]
 * 返回 {
 *    ipv4One: ['10'],
 *    ipv4Two: ['0'],
 *    ipv4Three: ['56', '57'],
 *    ipv4Four: ['0', '1']
 * }
 *
 *  */
export interface AnalysisSubnetObjType {
  ipv4One: string[]
  ipv4Two: string[]
  ipv4Three: string[]
  ipv4Four: string[]
}
export const analysisSubnetList = (arr: string[]) => {
  const obj: AnalysisSubnetObjType = {
    ipv4One: [],
    ipv4Two: [],
    ipv4Three: [],
    ipv4Four: [],
  }
  let errKey = false
  arr.forEach(item => {
    if (item.indexOf('/') < 0) return (errKey = true)
    // 截取ip
    const ip = item.split('/')[0]
    if (ip.indexOf('.') < 0) return (errKey = true)
    const list = ip.split('.')
    if (list.length !== 4) return (errKey = true)
    if (obj.ipv4One.findIndex(i => i === list[0]) < 0) obj.ipv4One.push(list[0])
    if (obj.ipv4Two.findIndex(i => i === list[1]) < 0) obj.ipv4Two.push(list[1])
    if (obj.ipv4Three.findIndex(i => i === list[2]) < 0) obj.ipv4Three.push(list[2])
    if (obj.ipv4Four.findIndex(i => i === list[3]) < 0) obj.ipv4Four.push(list[3])
  })
  if (errKey) {
    return new Error(t('subnet.formatError'))
  }
  return obj
}

export const getIpv4ThreeRange = arr => {
  const max = Math.max(...arr)
  const min = Math.min(...arr)
  return `${t('subnet.range')}${min}-${max}`
}

export const getIpv4FourRange = list => {
  const arr = [...list]
  arr.sort((a, b) => Number(a) - Number(b))
  if (arr.length > 4) {
    return `${t('subnet.range')}${arr[0]},${arr[1]},...,${arr[arr.length - 1]}`
  } else {
    return `${t('subnet.range')}${arr.join(',')}`
  }
}
