import { Pagination } from '@/apis/account-system/access/strategy/type'

export interface CreateKeyPairReq {
  regionId: number
  //地域ID

  keyName: string
  //秘钥名称

  description?: string
  //描述信息

  publicKey?: string
  //公钥如果填了公钥，则为导入秘钥
}

export interface DeleteKeypairReq {
  keyIds: string[]
  // 秘钥ID
}

export interface BindKeypairReq {
  regionId: number
  // 地域ID

  sshId: number
  // 秘钥ID

  serverIds: string[]
  // 服务器ID

  forceStop?: boolean
  // 是否强制关机
}

export interface UnBindKeypairReq {
  regionId: number
  // 地域ID

  sshId: number
  // 秘钥ID

  serverIds: string[]
  // 服务器ID
}

export interface ListSShReq extends Pagination {
  regionId: number

  sshName?: string
  // 秘钥名称 模糊匹配

  sshUuid?: string
  // 秘钥ID
}

export interface UpdateInfoReq {
  keyName: string

  description: string

  id: number
  // SSH秘钥ID
}

export interface GetSSHInfoReq {
  id: number
  // SSH秘钥ID
}
export interface DownloadKeyPairReq {
  insId: string
  // 秘钥id
}
