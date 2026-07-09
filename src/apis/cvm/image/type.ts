import { Pagination } from '@/apis/account-system/access/strategy/type'

export interface ListImageReq extends Pagination {
  regionId: number
  // 地域

  imageType: number
  // 镜像类型 1 公共镜像 2 私有镜像

  imageName?: string
  // 镜像名称 模糊匹配

  platform?: string
  // 镜像平台

  osName?: string
  // 镜像操作系统  Linux Windows

  imageInsId?: string
}

export interface GroupImagesReq {
  imageType?: number
  // 1 公共镜像 2 私有镜像 示例值:镜像类型

  regionId?: number
  // 示例值:地域ID
}

export interface CreateImageReq {
  serverId: number
  // 服务器主键ID

  createWholeImage?: boolean
  // 是否创建整机镜像

  imageName: string
  // 名称

  description: string
  // 描述信息
}

export interface UpdateImageInfoReq {
  imageId: number | string
  imageName: string
  description: string
}

export interface DeleteImageReq {
  imageIds: string[]
  // 镜像主键ID
}

export interface GetImageInfoReq {
  imageId: number | string
  // 镜像ID
}

export interface ExportImageReq {
  regionId: number
  // 地域

  imageType: number
  // 镜像类型 1 公共镜像 2 私有镜像

  imageName?: string
  // 镜像名称 模糊匹配

  platform?: string
  // 镜像平台

  osName?: string
  // 镜像操作系统 Linux Windows
}
