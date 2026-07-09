export const fuzzyStr = (str: string, _i?: number) => {
  if (!str) return ''
  let v = ''
  const i = _i || 3
  Array.from(str).forEach((t, index, _arr) => {
    if (index >= i && index < i + 4) {
      v += '*'
    } else {
      v += t
    }
  })
  return v
}

export const fuzzyCellID = (ID: string) => {
  if (!ID) return ''
  let v = ''
  Array.from(ID).forEach((s: string, i: number, _arr) => {
    if (i < 4 || i > 13) {
      v += s
    } else {
      v += '*'
    }
  })
  return v
}

export const getStringLength = (length: number, string: string, separate: '\n' | ';' | ',' = '\n'): number => {
  if (!string) {
    return length
  }
  const arr = string.trim().split(separate)
  return length - arr.length
}

export const createRandomStr = (length: number, characters: string = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ') => {
  let result = ''
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}
