export interface Pagination {
  pageIndex: number | string //分页下标
  pageSize: number | string //分页大小
}

export interface GetStrategyListReq extends Pagination {
  condition: string //查询条件
}

export interface InsertVsStrategyReq extends Pagination {
  condition: string //查询条件
}

export interface GetStrategytDetailReq {
  id: string // id
}

export interface GetStrategySummaryReq extends Pagination {
  condition: string //查询条件
  id: string // id
}
