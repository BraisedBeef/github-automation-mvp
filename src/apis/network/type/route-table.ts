export interface ContentPagination {
  pageIndex: number
  pageSize: number
}

export interface QueryRouteTablePageType extends ContentPagination {
  regionId: number // 地域ID
  id?: number // 路由表ID
  name?: string // 路由表名称
}

export interface QueryRouteTableDetailType {
  rbId: number // 路由表ID
}

export interface UpdateRouteTableNameType {
  id: number // 路由表ID
  name: string //路由表名称
}
