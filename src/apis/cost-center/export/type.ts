export interface GeneratePagReq {
  fileType: number //文件类型 1 - L0_PDF账单 2 - L1_账单汇总 3 - L2_资源账单 4 - L3_账单明细 5 - 订单管理 6 - 续费管理 7 - 收支明细
}

export interface GetPathReq {
  id: number //账单记录ID
}
