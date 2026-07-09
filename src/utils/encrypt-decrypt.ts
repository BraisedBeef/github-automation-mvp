import punycode from 'punycode'

// 域名编码
export const domainTOASCII = (domain: string) => {
  return punycode.toASCII(domain || '')
}
// 域名解码
export const domainToUnicode = (domain: string) => {
  return punycode.toUnicode(domain || '')
}
