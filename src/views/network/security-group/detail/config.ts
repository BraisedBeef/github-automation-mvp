import t from '@/utils/i18n'
import ipaddr from 'ipaddr.js'

// 页面tab
export const pageTabs = [
  { label: t('securityGroup.securityGroupRule'), value: 1 },
  { label: t('securityGroup.associatedIns'), value: 2 },
]

// 安全组规则tab
export const ruleTabs = [
  { label: t('securityGroup.inboundRules'), value: 'ingress' },
  { label: t('securityGroup.egressRules'), value: 'egress' },
]

// 导入规则表格对应字段
// todo1：中、英、日对应模板的表头（必须一一对应才能正确导入并解析成功）
// todo2：不同的控制台多语言也必须对应相应语言的模板文件
export const importTable = new Map([
  [t('securityGroup.strategy'), 'action'], // 策略    Strategy    戦略
  [t('securityGroup.ipAddress'), 'remoteIpPrefix'], // IP地址     IP Address    IPアドレス
  [t('securityGroup.protocolNumber'), 'protocol'], // 协议号     Protocol Number    プロトコル番号
  [t('securityGroup.securityGroupType'), 'direction'], // 安全组类型     Security Group Type    セキュリティグループタイプ
  [t('securityGroup.describe'), 'description'], // 描述     Description    説明
  [t('securityGroup.port'), 'multiport'], // 端口     Port     ポート
  [t('securityGroup.priority'), 'priority'], // 优先级     Priority    優先度
])

//协议类型 icmp、tcp、udp、 icmpv6、 gre、 all
export const protocolTypeList = ['ICMP', 'TCP', 'UDP', 'ICMPV6', 'GRE', 'ALL']

// 端口必须为all的协议类型列表
export const multiportAllProtocolTypeList = ['ICMP', 'ICMPV6', 'GRE', 'ALL']

// ipv4地址正则表达式
const regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
// ipv6地址正则表达式
const ipv6Regex =
  /^(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}|(?:[A-Fa-f0-9]{1,4}:){1,7}:|(?:[A-Fa-f0-9]{1,4}:){1,6}:[A-Fa-f0-9]{1,4}|(?:[A-Fa-f0-9]{1,4}:){1,5}(?::[A-Fa-f0-9]{1,4}){1,2}|(?:[A-Fa-f0-9]{1,4}:){1,4}(?::[A-Fa-f0-9]{1,4}){1,3}|(?:[A-Fa-f0-9]{1,4}:){1,3}(?::[A-Fa-f0-9]{1,4}){1,4}|(?:[A-Fa-f0-9]{1,4}:){1,2}(?::[A-Fa-f0-9]{1,4}){1,5}|[A-Fa-f0-9]{1,4}:(?:(?::[A-Fa-f0-9]{1,4}){1,6})|:(?:(?::[A-Fa-f0-9]{1,4}){1,7}|:)|fe80:(?::[A-Fa-f0-9]{0,4}){0,4}%[0-9a-zA-Z]+|::(ffff(?::0{1,4}){0,1}:){0,1}((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3,3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

// 单纯只验证端口是否合规的方法 (这里校验的是协议为tcp或udp时的端口)
export const multiportVerify = val => {
  // 端口范围 all、 1-65535，支持和单端口(80)，连续端口(1-30)以及不连续端(22,3389,80)
  if (val.indexOf('-') > 0) {
    // ------------- 验证格式为（1到5位数字-1到5位数字）-----------------
    if (!/^\d{1,5}(-\d{1,5})$/.test(val)) return false
    const list = val.split('-')
    // 验证起止数字都在1到65535之间
    const startKey = Number(list[0]) >= 1 && Number(list[1]) <= 65535
    const endKey = Number(list[1]) >= 1 && Number(list[1]) <= 65535
    return startKey && endKey
  } else if (val.indexOf(',') > 0) {
    // ------------- 验证格式为（1到5位数字,1到5位数字...）----------------
    if (!/^\d{1,5}(,\d{1,5})+$/.test(val)) return false
    const list = val.split(',')
    let key = true
    // 验证每个数字都在1到65535之间
    list.forEach(item => {
      key = Number(item) >= 1 && Number(item) <= 65535
    })
    return key
  } else {
    // ----------- 非连续端口(1-30)以及不连续端(22,3389,80)的情况下 可以为all ---------
    if (val === 'ALL') return true
    // 验证格式为单个1到5位数字
    if (!/^\d{1,5}$/.test(val)) return false
    // 验证单个数字在1到65535之间
    return Number(val) >= 1 && Number(val) <= 65535
  }
}

function expandIPv6(ip) {
  // 将地址按冒号分割
  const parts = ip.split(':')

  // 计算需要填充的零段数量
  const numMissingParts = 8 - parts.filter(Boolean).length

  // 找到双冒号的位置
  let doubleColonIndex = -1
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === '') {
      doubleColonIndex = i
      break
    }
  }

  // 处理双冒号的情况
  const expandedParts: any[] = []
  for (let i = 0; i < parts.length; i++) {
    if (i === doubleColonIndex) {
      // 插入缺失的部分
      for (let j = 0; j < numMissingParts; j++) {
        expandedParts.push('0000')
      }
    }
    if (parts[i] !== '') {
      expandedParts.push(parts[i].padStart(4, '0'))
    }
  }

  // 返回展开后的地址
  return expandedParts.join(':')
}

function ipv6ToHex(ip) {
  // 先展开 IPv6 地址
  const expandedIp = expandIPv6(ip)

  // 将展开后的地址按冒号分割
  const parts = expandedIp.split(':')

  // 将每个 16 位段拼接成一个 128 位的十六进制字符串
  return parts.join('')
}

const isIPv6Match = (ipStr, maskStr) => {
  const mask = parseInt(maskStr, 10)
  const ip = ipv6ToHex(ipStr)
  console.log('ip,', ip, ipStr)

  // 验证子网掩码范围
  if (mask < 0 || mask > 128) {
    return false
  }

  // 将 IPv6 地址转换为 128 位的十六进制字符串
  const ipHex = ip.replace(/:/g, '')
  console.log('ip=====>', ip, ipHex, ip.length, ipHex.length)
  if (ipHex.length !== 32) {
    throw new Error('Invalid IPv6 address length')
  }

  // 将 128 位的十六进制字符串转换为两个 64 位的十进制数
  const ipLong1 = BigInt(`0x${ipHex.slice(0, 16)}`)
  const ipLong2 = BigInt(`0x${ipHex.slice(16, 32)}`)

  // 计算子网掩码
  const maskLong1 = BigInt((1n << BigInt(Math.min(mask, 64))) - 1n) << BigInt(64 - Math.min(mask, 64))
  const maskLong2 = BigInt((1n << BigInt(Math.max(0, mask - 64))) - 1n) << BigInt(64 - Math.max(0, mask - 64))

  // 应用子网掩码
  const maskedIP1 = ipLong1 & maskLong1
  const maskedIP2 = ipLong2 & maskLong2

  // 比较结果
  return maskedIP1 === ipLong1 && maskedIP2 === ipLong2
}

// 验证安全组规则的方法
export const securityGroutRules = {
  direction: val => {
    // 安全组规则的出入控制方向 * ingress 表示入方向 * egress 表示出方向
    return val === 'ingress' || val === 'egress'
  },
  /**
   * 协议：(icmp、tcp、udp、 icmpv6、 gre、 all)
   * 当协议选择icmp、icmpv6、gre、all  腾讯和华为的端口必须为 all
   */
  protocol: val => {
    if (!val || val === '') return false
    return protocolTypeList.findIndex(item => item === val) >= 0
  },
  /**
   * 端口：
   *  协议为 tcp或者udp的时候 端口范围 1-65535，支持和单端口(80)，连续端口(1-30)以及不连续端(22,3389,80)
   *  当协议选择icmp、icmpv6、gre、all  腾讯和华为的端口必须为 all
   */
  multiport: (val, protocol) => {
    // 当协议选择icmp、icmpv6、gre、all  腾讯和华为的端口必须为 all（但是可以不输入all，如果输入了必须为all）
    if (multiportAllProtocolTypeList.findIndex(item => item === protocol) >= 0)
      return !val || val === '' || val === 'ALL'
    if (!val || val === '') return false
    return multiportVerify(val)
  },
  /*
    新增和修改安全组规则时，协议和端口在一个输入框中 需要拆分开分别验证协议和端口是否符合要求
    输入内容格式为（协议:端口）或（协议）
      当协议为 'TCP', 'udp' 时格式为（协议:端口）
      当协议为 'icmp','icmpv6', 'gre', 'all' 时格式为（协议）

  */
  port: val => {
    if (!val || val === '') return false
    // 判断当前内容的格式是否为（协议:端口）
    if (val.indexOf(':') >= 0) {
      // 拆分'协议','端口'
      const list = val.split(':')
      // 获取协议
      const protocol = list[0]
      // 获取端口
      const multiport = list[1]
      // 验证协议是否合规
      if (protocolTypeList.findIndex(item => item === protocol) < 0) return false
      // 如果当前协议为‘'icmp','icmpv6', 'gre', 'all'’则只能是（协议）格式  不需要带端口
      if (multiportAllProtocolTypeList.findIndex(item => item === protocol) >= 0) return false
      // ---- 验证端口是否合规 ----
      return multiportVerify(multiport)
    } else {
      // 验证（协议）格式是否合规 (必须是'icmp','icmpv6', 'gre', 'all'几个中的一个)
      return multiportAllProtocolTypeList.findIndex(item => item === val) >= 0
    }
  },
  /**
   *  IP地址 值范围：IP地址，或者cidr格式
   *  互斥 与remote_group_id，remote_address_group_id，ipTemplateId 字段互斥 4个字段只存在一个有效值
   *  protocol字段值等于 icmpv6 默认值 ::/0 等于其他类型时默认值 0.0.0.0/0
   *  ipv4 cidr格式192.168.0.0/32最大32个IP地址 ipv6 cidr格式2001:db8::/128最大128个IP地址
   *  全部IP为 all
   */
  remoteIpPrefix: val => {
    if (!val || val === '') return false
    // 全部IP为 all
    if (val === 'ALL') return true
    // 是否为cidr格式
    if (val.indexOf('/') >= 0) {
      try {
        // --- cidr格式ip地址校验 ---
        const list = val.split('/')
        // 验证ip格式是否正确
        const key = ipaddr.isValid(list[0])
        if (!key) return false
        // 验证第二个为0-129之间的数字
        if (!/^([0-9]|[1-9][0-9]|1[0-2][0-9])$/.test(list[1])) return false
        // 获取ip地址为‘ipv4’还是‘ipv6’
        const ip = ipaddr.parse(list[0])
        if (ip.kind() === 'ipv4') {
          // 11.21曹师傅查的校验规则
          const prefixLength = parseInt(list[1].trim(), 10)
          // ipv4 cidr格式最大32个IP地址
          if (prefixLength < 0 || prefixLength > 32) return false
          // 校验IP地址是否为有效的网络地址
          const ipSegments = list[0].split('.')
          let ipAsInt = 0
          for (let i = 0; i < ipSegments.length; i++) {
            ipAsInt |= parseInt(ipSegments[i], 10) << (24 - i * 8)
          }
          const mask = ~((1 << (32 - prefixLength)) - 1)
          if ((ipAsInt & mask) !== ipAsInt) {
            return false
          }
          return true
        }
        // -------------校验前缀（/后数字）的合法性-------------
        if (Number(list[1] || -1) < 0 || Number(list[1] || -1) > 128) return false
        if (!ipv6Regex.test(list[0])) return false
        return isIPv6Match(list[0], list[1])
      } catch (err) {
        return false
      }
    } else {
      try {
        const ip = ipaddr.parse(val)
        if (ip.kind() === 'ipv4') {
          if (!regex.test(val)) return false
          // --- 非cidr格式ip地址校验 ---
          return ipaddr.isValid(val)
        } else {
          if (!ipv6Regex.test(val)) return false
          return ipaddr.isValid(val)
        }
      } catch (err) {
        return false
      }
    }
  },
  /* 只验证ipv4格式的ip地址 */
  ipv4: val => {
    if (!val || val === '') return false
    if (val.indexOf('/') >= 0) {
      const list = val.split('/')
      /*
        针对单个IP只要填写ip地址即可，可以不添加掩码
        针对一个网段IP，需要指定具体的IP段 如10.0.0.0/24，末尾需要是x.x.x.0
        10.0.0.1/24指定的是单个IP
      */
      if (list[0].split('.')[3] !== '0') return false
      const key = ipaddr.isValid(list[0])
      if (!key) return false
      const ip = ipaddr.parse(list[0])
      if (ip.kind() !== 'ipv4') return false
      // 验证第二个为0-32之间的数字
      if (!/^([0-9]|[1-3][0-9])$/.test(list[1])) return false

      // 11.21曹师傅查的校验规则
      const prefixLength = parseInt(list[1].trim(), 10)
      // ipv4 cidr格式最大32个IP地址
      if (prefixLength < 0 || prefixLength > 32) return false
      // 校验IP地址是否为有效的网络地址
      const ipSegments = list[0].split('.')
      let ipAsInt = 0
      for (let i = 0; i < ipSegments.length; i++) {
        ipAsInt |= parseInt(ipSegments[i], 10) << (24 - i * 8)
      }
      const mask = ~((1 << (32 - prefixLength)) - 1)
      if ((ipAsInt & mask) !== ipAsInt) {
        return false
      }
      return true
    } else {
      if (!regex.test(val)) return false
      return ipaddr.isValid(val) && ipaddr.parse(val).kind() === 'ipv4'
    }
  },
  /* 只验证ipv6格式的ip地址 */
  ipv6: val => {
    if (!val || val === '') return false
    if (val.indexOf('/') >= 0) {
      const list = val.split('/')
      const key = ipaddr.isValid(list[0])
      if (!key) return false
      const ip = ipaddr.parse(list[0])
      if (ip.kind() !== 'ipv6') return false
      // 验证第二个为0-128之间的数字
      if (!/^([0-9]|[1-9][0-9]|[1][0-2][0-9])$/.test(list[1])) return false
      // -------------校验前缀（/后数字）的合法性-------------
      if (Number(list[1] || -1) < 0 || Number(list[1] || -1) > 128) return false
      if (!ipv6Regex.test(list[0])) return false
      return isIPv6Match(list[0], list[1])
    } else {
      if (!ipv6Regex.test(val)) return false
      return ipaddr.isValid(val) && ipaddr.parse(val).kind() === 'ipv6'
    }
  },
  remoteGroupId: val => {
    return /\d+/g.test(val)
  },
  remoteAddressGroupId: val => {
    return /\d+/g.test(val)
  },
  // 安全组规则生效策略  取值范围： allow表示允许 deny表示拒绝
  action: val => {
    return val === 'allow' || val === 'deny'
  },
  // 优先级 取值范围：1~100，1代表最高优先级
  priority: val => {
    return /^([1-9]|[1-9]\d|100)$/.test(val)
  },
}

// 添加安全组规则类型列表
export const InboundAddTypeList = [
  { label: t('securityGroup.custom'), value: 0 },
  {
    label: t('securityGroup.windowLogin'),
    value: 1,
    data: {
      protocol: 'TCP',
      multiport: '3389',
      description: t('securityGroup.windowLoginDescription'),
    },
  },
  {
    label: t('securityGroup.linuxLogin'),
    value: 2,
    data: {
      protocol: 'TCP',
      multiport: '22',
      description: t('securityGroup.linuxLoginDescription'),
    },
  },
  {
    label: 'Ping',
    value: 3,
    data: {
      protocol: 'ICMP',
      description: t('securityGroup.pingDescription'),
    },
  },
  {
    label: 'HTTP (80)',
    value: 4,
    data: {
      protocol: 'TCP',
      multiport: '80',
      description: t('securityGroup.httpDescription'),
    },
  },
  {
    label: 'HTTPS (443)',
    value: 5,
    data: {
      protocol: 'TCP',
      multiport: '443',
      description: t('securityGroup.httpsDescription'),
    },
  },
  {
    label: 'MySQL(3306)',
    value: 6,
    data: {
      protocol: 'TCP',
      multiport: '3306',
      description: t('securityGroup.mySqlDescription'),
    },
  },
  {
    label: 'SQL Server(1433)',
    value: 7,
    data: {
      protocol: 'TCP',
      multiport: '1433',
      description: t('securityGroup.sqlServerDescription'),
    },
  },
]

// 添加安全组规则来源列表
export const sourceTypeList = [
  { label: t('securityGroup.sourceTypeOneLabel'), value: 1, placeholder: t('securityGroup.remoteIpPrefixPlaceholder') }, // IP 地址或 CIDR 段
  { label: t('securityGroup.sourceTypeTwoLabel'), value: 3, placeholder: t('securityGroup.sourceTypeTwoPlaceholder') }, // 参数模板 - IP 地址组
  { label: t('securityGroup.securityGroup'), value: 2, placeholder: t('securityGroup.placeSelectSecurityGroup') }, // 安全组
]

// 添加安全组规则策略列表
export const actionTypeList = [
  { label: t('securityGroup.allow'), value: 'allow' },
  { label: t('securityGroup.refuse'), value: 'deny' },
]
