import i18n from '@/locales'
const translate = i18n.global.t
const t = (...rest: [string | number, any?, any?]) => {
  return rest[0] === '' ? '' : translate(...rest)
}
export default t
