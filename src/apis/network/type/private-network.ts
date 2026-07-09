export interface ContentPagination {
  pageIndex: number
  pageSize: number
}

export interface QueryVpcPageType extends ContentPagination {
  vpcId?: number // vpcId
  regionId: number // 地区ID
}

export interface QueryVpcDetailType {
  vpcId: number // vpcId
}

export interface UpdateVpcNameType {
  vpcId: number
  vpcName: string
}

export interface VerifyDefaultVpcType {
  regionId: number
}

export interface SubnetCidrListType {
  zoneId: number
  subnetName: string
  cidrBlock: string
}
export interface DirectCreateVpcType {
  regionId: number
  vpcName?: string
  cidr: string
  subnetCidrList: SubnetCidrListType[]
}
export interface DirectDeleteVpcType {
  id: number
}
