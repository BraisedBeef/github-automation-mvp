import { Pagination } from '@/apis/account-system/access/strategy/type'

export interface GetTransBillOverviewReq {
  queryDate: string
}

export interface GetTransMonthBillOverviewReq {
  transMonth: string // 查询月份yyyy-MM

  queryType: number // 查询类型 查询类型 1 半年 2 一年

  productId?: number // 产品ID

  projectId?: number // 项目ID没有该条件时，传null 或者不传 存在默认项目为0的情况

  regionId?: number // 地域ID

  costType?: number // 计费模式 0 其他 1 按量 2 预付费 没有该条件时，传null 或者不传
}

export interface GetDimensionOverviewReq {
  queryDate: string
  queryType: number
}

export interface ResourceBillReq extends Pagination {
  instanceId?: string //实例ID

  payerUin?: number //支付者 UIN

  userUin?: number //使用者 UIN

  productIds?: number[] //产品ID 398759540226658308 : CDN 398759540226658309 : DNS 398759540226658310 : 对象存储

  billingMode?: number //计费模式 其他 : 0 按量计费 : 1 预付费（包年包月） : 2

  transactionType?: number //按量计费模式 1 : 按量计费 2 : 按量计费(小时结) 3 : 按量计费(日结) 4 : 按量计费(月结) 5 : 包年包月

  projectIds?: number[] //项目ID

  regionIds?: number[] //地域节点

  zoneIds?: number[] //地区节点

  month: string //查询月份yyyy-MM
}

export interface GetBillTotalMoneyReq {
  instanceId?: string //实例ID

  payerUin?: number //支付者 UIN

  userUin?: number //使用者 UIN

  productIds?: number[] //产品ID 398759540226658308 : CDN 398759540226658309 : DNS 398759540226658310 : 对象存储

  billingMode?: number //计费模式 其他 : 0 按量计费 : 1 预付费（包年包月） : 2

  transactionType?: number //按量计费模式 1 : 按量计费 2 : 按量计费(小时结) 3 : 按量计费(日结) 4 : 按量计费(月结) 5 : 包年包月

  projectIds?: number[] //项目ID

  regionIds?: number[] //地域节点

  zoneIds?: number[] //地区节点

  month: string //查询月份yyyy-MM
}

export interface DetailsBillReq extends Pagination {
  incomeSerialNo: string // 收支明细流水号

  instanceId?: string //实例ID

  payerUin?: number //支付者 UIN

  userUin?: number //使用者 UIN

  productIds?: number[] //产品ID 398759540226658308 : CDN 398759540226658309 : DNS 398759540226658310 : 对象存储

  billingMode?: number //计费模式 其他 : 0 按量计费 : 1 预付费（包年包月） : 2

  transactionType?: number //按量计费模式 1 : 按量计费 2 : 按量计费(小时结) 3 : 按量计费(日结) 4 : 按量计费(月结) 5 : 包年包月

  projectIds?: number[] //项目ID

  regionIds?: number[] //地域节点

  zoneIds?: number[] //地区节点

  month: string //查询月份yyyy-MM
}

export interface GetBillReq {
  billId: string | number
}

export interface GetTransMonthResourceBillOverviewReq {
  transMonth: string //查询月份yyyy-MM

  queryType: number //查询类型 1 半年 2 一年

  resourceId: number //资源ID
}

export interface GenerateBillFileReq {
  startTime: string //起始时间 yyyy-MM

  endTime: string //结束时间yyyy-MM

  fileType: number //文件类型 1 - L0_PDF账单 2 - L1_账单汇总 3 - L2_资源账单 4 - L3_账单明细 5 - 订单管理 6 - 续费管理 7 - 收支明细
}

export interface UpdateVcInvoiceReq {
  companyName: string //公司名称

  invoiceType: number //发票类型

  name: string //姓名

  phone: string //联系电话

  address: string //公司地址
}

export interface AddVcInvoiceReq {
  companyName: string //公司名称

  invoiceType: number //发票类型

  name: string //姓名

  phone: string //联系电话

  address: string //公司地址
}

export interface GetInvoicableResourceBillReq extends Pagination {
  startTime: string //起始时间 yyyy-MM

  endTime: string // 结束时间yyyy-MM

  productId?: string // 产品ID

  billId?: string // 账单ID
}

export interface GetInvoicableMonthBillReq extends Pagination {
  startTime: string //起始时间 yyyy-MM

  endTime: string // 结束时间yyyy-MM

  productId?: string // 产品ID

  billId?: string // 账单ID
}

export interface GetInvoiceRecordReq extends Pagination {
  startTime: string //起始时间 yyyy-MM

  endTime: string // 结束时间yyyy-MM

  invoiceNo?: string // 发票号码
}

export interface GetPreInvoiceReq {
  invoiceType: number //1 按消费明细开票 2 按月账单汇总开票

  billIds?: string[] //订单号ID集合 如果全选，则此值为空数组

  months?: string[] //月份集合 yyyy-MM 如果全选，则此值为空数组
}

export interface InvoicingReq {
  invoiceType: number //1 按消费明细开票 2 按月账单汇总开票

  billIds?: string[] //订单号ID集合 如果全选，则此值为空数组

  months?: string[] //月份集合 yyyy-MM 如果全选，则此值为空数组
}
