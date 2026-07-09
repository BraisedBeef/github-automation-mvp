// 读取全局图标目录与 v2 图标目录下的所有 svg 文件
// 返回svg的name数组 [svgname, svgname2,...]
const formatSvgIconNames = (): string[] => {
  const svgIcons: string[] = []
  const icons = {
    ...import.meta.glob('../assets/svg-icon/*.svg', { eager: true }),
    ...import.meta.glob('../assets/v2/cvm/svg/*.svg', { eager: true }),
    ...import.meta.glob('../assets/v2/home-figma/svg/*.svg', { eager: true }),
  }
  const regex = /\/([^/]+)$/
  Object.keys(icons).forEach((icon: any) => {
    const match = regex.exec(icon)
    if (match) {
      svgIcons.push(match[1].split('.')[0])
    } else {
      svgIcons.push('')
    }
  })
  return svgIcons
}
export default formatSvgIconNames
