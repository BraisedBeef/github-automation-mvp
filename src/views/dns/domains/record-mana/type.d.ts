export interface MyDnsState {
  domainId: number
  domainName: string
  loading: boolean
  dialogLoading: boolean
  showHeaderBoxShadow: boolean
  current: number
  pagination: Pager
  total: number
  title: string
  searchValue: string
  multipleSelection: any[]
  tableData: any[]
  unmodifiedValue: any[]
  deleteDialog: boolean
  handleType: 'single' | 'multi'
  analysis: any[]

  errors: {
    is_host: string
    is_weight: string
    is_mx: string
    is_ttl: string
    is_record_value: string
  }[]

  completeDialog: boolean
  showComplete: boolean

  lineTypes: any[]

  remarkDialog: boolean
  newRemark: string

  columns: TableColumn[]

  noticeId: string
  hostRecordTooltip: number
}

export type SelectOption = {
  label: string
  value: any
}
