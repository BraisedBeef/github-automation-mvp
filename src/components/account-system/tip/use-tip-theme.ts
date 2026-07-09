export const useTipTheme = (theme: string) => {
  const tipStyle = computed(() => {
    if (theme === 'primary') {
      return { background: '#e3edff' }
    }
    // if (theme === 'danger') {
    //   return { background: '#FE4D4F1A' }
    // }
    if (theme === 'warning') {
      return { background: '#FFF3D3' }
    }
    return { background: '#FE4D4F1A' }
  })

  const tipClassName = computed(() => {
    if (theme === 'primary') return 'text-primary'
    // if (theme === 'danger') return 'text-error'
    if (theme === 'warning') return 'tip-text-warning'
    return 'text-error'
  })

  const svgIconName = computed(() => {
    if (theme === 'primary') return 'warn-primary'
    // if (theme === 'danger') return 'warn-red'
    if (theme === 'warning') return 'warn-warning'
    return 'warn-red'
  })

  return {
    tipStyle,
    tipClassName,
    svgIconName,
  }
}
