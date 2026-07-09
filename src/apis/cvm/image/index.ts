import { requestCvmCs as request } from '@/request/http/index'

import {
  ListImageReq,
  GroupImagesReq,
  CreateImageReq,
  UpdateImageInfoReq,
  DeleteImageReq,
  GetImageInfoReq,
  ExportImageReq,
} from './type'

// 分页查询镜像列表
export const _listImage = (data: ListImageReq) => {
  return request.post('/image/listImage', data)
}

// 根据镜像类型获取镜像列表
export const _groupImages = (params: GroupImagesReq) => {
  return request.get('/image/groupImages', params)
}

// 创建镜像
export const _createImage = (data: CreateImageReq) => {
  return request.post('/image/createImage', data)
}

// 更新镜像信息
export const _updateImageInfo = (data: UpdateImageInfoReq) => {
  return request.post('/image/updateImageInfo', data)
}

// 批量删除镜像
export const _deleteImage = (data: DeleteImageReq) => {
  return request.post('/image/deleteImage', data)
}

// 获取镜像详情
export const _getImageInfo = (params: GetImageInfoReq) => {
  return request.get('/image/getImageInfo', params)
}

// 镜像导出
export const _exportImage = (data: ExportImageReq) => {
  return request({
    url: '/image/exportImage',
    responseType: 'blob',
    method: 'post',
    data,
  })
}
