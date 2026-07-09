import t from '@/utils/i18n'

export const _matchRouteType = (
  _lineTypeId: string | string[],
  lineTypeArr: any[],
  noMatchValue = '-',
  matchName?: string,
) => {
  if (!_lineTypeId)
    return {
      lineName: noMatchValue,
    }
  const flatLineTypeArr: any[] = []
  const flat = (arr: any[]) => {
    arr.forEach(item => {
      flatLineTypeArr.push({
        lineTypeId: item.lineId,
        lineName: item.lineName,
        lineValue: item.lineValue,
        status: item.status,
        isDefault: item.isDefault,
      })
      item.childLine && flat(item.childLine)
    })
  }
  flat(lineTypeArr)
  const current = flatLineTypeArr.find(item => item[matchName || 'lineTypeId'] === _lineTypeId)
  if (current) {
    current.lineName = current.status === 1 ? current.lineName : current.lineName + t('notEnabled')
    return current
  } else {
    return {
      lineTypeId: '',
      lineName: noMatchValue,
    }
  }
}

export const _setRecordType = (typeArr: any[], isEdit?: boolean, currentType?: number) => {
  if (!isEdit) {
    for (let i = 0; i < typeArr.length; i++) {
      if (typeArr[i].status === 1) {
        return typeArr[i].type
      }
    }
  } else {
    const current = typeArr.find(item => item.type === currentType)
    return current && current.status === 1 ? currentType : ''
  }
}

export const _formatRouteType = arr => {
  arr.forEach(item => {
    if (item.childLine) {
      item.childLine.sort((a, b) => (a.showTop || 0) - (b.showTop || 0))
      item.childLine.forEach(citem => {
        if (citem.childLine) {
          citem.childLine.sort((aa, bb) => (aa.showTop || 0) - (bb.showTop || 0))
        }
      })
    }
  })
  console.log('排序完', arr)

  return arr
}
