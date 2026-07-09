/**
 * CIDR 工具类
 */
const CidrUtil = {
  /**
   * 验证是否为有效的 CIDR 格式
   */
  isCidr(cidr: string) {
    if (!cidr || typeof cidr !== 'string') return false
    const parts = cidr.split('/')
    if (parts.length !== 2) return false

    const ip = parts[0]
    const mask = parseInt(parts[1], 10)

    // 验证掩码范围
    if (isNaN(mask) || mask < 0 || mask > 32) return false

    // 验证 IP 格式
    const ipParts = ip.split('.')
    if (ipParts.length !== 4) return false

    for (const part of ipParts) {
      const num = parseInt(part, 10)
      if (isNaN(num) || num < 0 || num > 255) return false
    }

    return true
  },

  /**
   * 将 IPv4 地址转换为长整型
   */
  ipv4ToLong(ip: string) {
    const parts = ip.split('.').map(p => parseInt(p, 10))
    return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3]
  },

  /**
   * 将长整型转换为 IPv4 地址
   */
  longToIpv4(long: number) {
    return [(long >>> 24) & 0xff, (long >>> 16) & 0xff, (long >>> 8) & 0xff, long & 0xff].join('.')
  },

  /**
   * 获取 CIDR 的起始 IP
   */
  getBeginIp(ip: string, maskBit: number) {
    const ipLong = this.ipv4ToLong(ip)
    const mask = maskBit === 0 ? 0 : (~0 << (32 - maskBit)) >>> 0
    const beginIpLong = (ipLong & mask) >>> 0
    return this.longToIpv4(beginIpLong)
  },

  /**
   * 获取 CIDR 的结束 IP
   */
  getEndIp(ip: string, maskBit: number) {
    const ipLong = this.ipv4ToLong(ip)
    const mask = maskBit === 0 ? 0 : (~0 << (32 - maskBit)) >>> 0
    const endIpLong = (ipLong | (~mask >>> 0)) >>> 0
    return this.longToIpv4(endIpLong)
  },

  /**
   * 检测两个 CIDR 网段是否冲突
   */
  cidrConflict(cidr1: string, cidr2: string) {
    // 验证 CIDR 格式
    if (!this.isCidr(cidr1)) {
      return true
    }
    if (!this.isCidr(cidr2)) {
      return true
    }

    // 解析第一个 CIDR
    const [cidrIp1, maskBit1Str] = cidr1.split('/')
    const maskBit1 = parseInt(maskBit1Str, 10)
    const beginIpStr1 = this.getBeginIp(cidrIp1, maskBit1)
    const endIpStr1 = this.getEndIp(cidrIp1, maskBit1)
    const beginIp1 = this.ipv4ToLong(beginIpStr1)
    const endIp1 = this.ipv4ToLong(endIpStr1)

    // 解析第二个 CIDR
    const [cidrIp2, maskBit2Str] = cidr2.split('/')
    const maskBit2 = parseInt(maskBit2Str, 10)
    const beginIpStr2 = this.getBeginIp(cidrIp2, maskBit2)
    const endIpStr2 = this.getEndIp(cidrIp2, maskBit2)
    const beginIp2 = this.ipv4ToLong(beginIpStr2)
    const endIp2 = this.ipv4ToLong(endIpStr2)

    // 不冲突的条件：一个网段完全在另一个网段之前或之后
    if (endIp1 < beginIp2 || beginIp1 > endIp2) {
      return false
    }
    return true
  },
}

export default CidrUtil
