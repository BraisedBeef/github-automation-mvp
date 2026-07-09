export const add0 = (time: number) => {
  return time > 9 ? time.toString() : '0' + time
}

export const thousandsCount = (count: number) => {
  if (!count) return 0
  const numArr = String(count).split('.')
  let num = numArr[0]
  let result = ''
  while (num.length > 3) {
    result = ',' + num.slice(-3) + result
    num = num.slice(0, num.length - 3)
  }
  if (num) {
    result = num + result
  }
  result = numArr[1] ? result + '.' + numArr[1] : result
  return result
}

export const ringCompare = (a: number, b: number) => {
  if (!b) {
    return a ? 100 : 0
  }
  return (a - b) / b
}

export const formatPrice = p => {
  return +p.toFixed(2)
}

export const getRate = (current, all) => {
  if (all === 0) {
    return 0
  } else {
    return +((current / all) * 100).toFixed(2)
  }
}
