import { requestCs as request } from '@/request/http/index'
import {
  GetTransBillOverviewReq,
  GetTransMonthBillOverviewReq,
  GetDimensionOverviewReq,
  ResourceBillReq,
  GetBillTotalMoneyReq,
  DetailsBillReq,
  GetBillReq,
  GetTransMonthResourceBillOverviewReq,
  GenerateBillFileReq,
  UpdateVcInvoiceReq,
  AddVcInvoiceReq,
  GetInvoicableResourceBillReq,
  GetInvoicableMonthBillReq,
  GetInvoiceRecordReq,
  GetPreInvoiceReq,
  InvoicingReq,
} from './type'

// 账单概览
export const _getTransBillOverview = (params: GetTransBillOverviewReq) => {
  return request.get('/feeApi/bill/getTransBillOverview', params)
}

// 获取费用趋势
export const _getTransMonthBillOverview = (data: GetTransMonthBillOverviewReq) => {
  return request.post('/feeApi/bill/getTransMonthBillOverview', data)
}

// 多维度账单汇总
export const _getDimensionOverview = (params: GetDimensionOverviewReq) => {
  return request.get('/feeApi/bill/getDimensionOverview', params)
}

// 资源账单
export const _resourceBill = (data: ResourceBillReq) => {
  return request.post('/feeApi/bill/resourceBill', data)
}

// 资源账单，明细账单-总费用
export const _getBillTotalMoney = (data: GetBillTotalMoneyReq) => {
  return request.post('/feeApi/bill/getBillTotalMoney', data)
}

// 明细账单
export const _detailsBill = (data: DetailsBillReq) => {
  return request.post('/feeApi/bill/detailsBill', data)
}

// 获取账单详情
export const _getBill = (params: GetBillReq) => {
  return request.get('/feeApi/bill/getBill', params)
}

// 费用中心-资源账单-费用详情-费用趋势
export const _getTransMonthResourceBillOverview = (data: GetTransMonthResourceBillOverviewReq) => {
  return request.post('/feeApi/bill/getTransMonthResourceBillOverview', data)
}

// 生成账单文件
export const _generateBillFile = (data: GenerateBillFileReq) => {
  return request.post('/feeApi/bill/generate/billFile', data)
}

// 发票信息管理-我的发票信息
export const _getInvoice = () => {
  return request.get('/feeApi/invoice/getInvoice')
}

// 发票信息管理-修改发票信息
export const _updateVcInvoice = (data: UpdateVcInvoiceReq) => {
  return request.post('/feeApi/invoice/updateVcInvoice', data)
}

// 发票信息管理-添加发票抬头信息
export const _addVcInvoice = (data: AddVcInvoiceReq) => {
  return request.post('/feeApi/invoice/addVcInvoice', data)
}

// 发票信息管理-开票记录
export const _getInvoiceRecord = (data: GetInvoiceRecordReq) => {
  return request.post('/feeApi/invoice/record/getInvoiceRecord', data)
}

// 发票信息管理-合并汇总
export const _getInvoiceSummary = () => {
  return request.get('/feeApi/invoice/record/getInvoiceSummary')
}

// 发票信息管理-可开票金额
export const _getInvoicableSummary = () => {
  return request.get('/feeApi/invoice/record/getInvoicableSummary')
}

// 发票信息管理-按消费明细开票分页
export const _getInvoicableResourceBill = (data: GetInvoicableResourceBillReq) => {
  return request.post('/feeApi/invoice/getInvoicableResourceBill', data)
}

// 发票信息管理-按月账单汇总开单
export const _getInvoicableMonthBill = (data: GetInvoicableMonthBillReq) => {
  return request.post('/feeApi/invoice/getInvoicableMonthBill', data)
}

// 费用中心-发票管理-确认开票信息-待开票金额及发票信息
export const _preInvoice = (data: GetPreInvoiceReq) => {
  return request.post('/feeApi/invoice/preInvoice', data)
}

// 费用中心-发票管理-确认开票信息-开票
export const _invoicing = (data: InvoicingReq) => {
  return request.post('/feeApi/invoice/invoicing', data)
}
