export const checkEmptyObject = (object: object) => {
  let pass = true
  if (object === void 0) return false
  if (Object.values(object).length === 0) return false
  Object.values(object).forEach(member => {
    if (typeof member === 'object') {
      if (Array.isArray(member)) {
        pass = member.length > 0
      } else {
        pass = Object.values(member as object).length > 0
      }
    } else {
      pass = !!member
    }
  })
  return pass
}

export const _deepClone = (obj: any) => {
  const _obj = obj.constructor === Array ? [] : {}
  if (typeof obj !== 'object') {
    return obj
  } else {
    for (const key in obj) {
      if (typeof obj[key] === 'object') {
        ;(_obj as any)[key] = _deepClone(obj[key])
      } else {
        ;(_obj as any)[key] = obj[key]
      }
    }
  }
  return _obj
}

export const isSameObj = (obj1: any, obj2: any, includesKey: string[]) => {
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return false
  }
  if (includesKey.length === 0) return false
  const keyArr1: string[] = Object.keys(obj1).sort()
  const keyArr2: string[] = Object.keys(obj2).sort()
  const str1: string = keyArr1
    .filter(item => includesKey.includes(item))
    .map((item): any => {
      return item in obj1 && item + obj1[item]
    })
    .join(',')
  const str2: string = keyArr2
    .filter(item => includesKey.includes(item))
    .map((item): any => {
      return item in obj2 && item + obj2[item]
    })
    .join(',')
  return str1 === str2
}

export const getActive = (value: any, arr: any[], key?: string) => {
  return arr.find(item => item[key || 'value'] === value)
}

export const getLabel = (list, value) => list.find(item => item.value === value)?.label

export const uniqueArray = (arr, key, filterFn?: (item: any) => boolean) => {
  if (!arr.length) return []
  const res = new Map()
  return arr.filter(item => {
    if (filterFn && !filterFn(item)) {
      return false
    }
    return !res.has(item[key]) && res.set(item[key], true)
  })
}

export const getValueMap = (list: { label: any; value: any }[], value: any): string | number => {
  const str = list.find(v => v.value === value)?.label
  return str ? str : '--'
}

export const pickObjectProperties = (obj, includesProps) => {
  return Object.keys(obj)
    .filter(key => includesProps.includes(key))
    .reduce((result, key) => {
      result[key] = obj[key]
      return result
    }, {})
}
