export interface Form {
  lineType: number | string
  size: number
  num: number
  name: string
  pkgId?: number | string
}

export interface FormTwo {
  lineType: number | string
  size: number
  num: number
  name: string
  period: number
  autoRenewFlag: boolean
}

export interface LineTypeInterface {
  label: string
  value: number
  msg?: string
}
