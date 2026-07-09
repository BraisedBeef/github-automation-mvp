import { requestCd as axios } from '@/request/http/index'

// 桶列表
export const _getStorageList = (params: {
  page: number
  pageSize: number
  bucketTag?: string
  bucketName?: string
  region?: string
  sortOrder?: 'desc' | 'asc' | ''
}) => {
  return axios.get('/oss/buckets_page', params)
}

export interface CreateStorageParams {
  bucketName: string
  region: string
  'x-cos-acl'?: string
  'x-oss-server-side-encryption'?: string
}
/**
 * 创建存储桶
 */
export const _createStorage = (data: CreateStorageParams) => {
  return axios.post('/oss/buckets', data)
}

/**
 * 删除存储桶
 */
export const _deleteStorage = (data: { bucketName: string; region: string }) => {
  return axios({ url: `/oss/buckets/${data.bucketName}`, method: 'delete', params: { region: data.region } })
}

/**
 * 校验存储桶名称是否重复
 */
export const _checkStorageName = (params: { bucketNameWithAppid: string }) => {
  return axios.get('/oss/buckets/check', params)
}

/**
 * 导出全部存储桶
 */
export const _exportAllStorageList = () => {
  return axios({
    url: '/oss/buckets/export/all',
    method: 'get',
    responseType: 'blob',
  })
}

/**
 * 导出指定存储桶
 */
export const _exportStorageList = (data: { bucketIds: number[] }) => {
  return axios({
    url: '/oss/buckets/export/selected',
    method: 'post',
    data,
    responseType: 'blob',
  })
}

/**
 * 存储桶配额检测
 */
export const _getStorageQuota = (params: { appid: string }) => {
  return axios.get('/oss/buckets/quota/check', params)
}

/**
 * 查询存储桶对象列表
 */
export const _getStorageObjectList = (params: {
  region: string
  bucketName: string
  maxKeys?: number
  marker?: string
  prefix?: string
  delimiter?: string
}) => {
  return axios.get('/oss/objects/list', params)
}

/**
 * @name 获取文件详情
 *
 */
export const _getStorageObjectDetail = (params: { region: string; bucketName: string; objectKey: string }) => {
  return axios.get(`/oss/objects/${params.objectKey}/info`, params)
}

/**
 * 部分更新对象元数据
 */
export const _updateStorageObjectMeta = (data: {
  bucketName: string
  region: string
  objectKey: string
  'x-oss-acl'?: string
  'x-oss-server-side-encryption'?: string
}) => {
  return axios({ url: `/oss/objects`, method: 'post', data })
}

/***
 * @name 重命名文件
 */
export const _renameStorageObject = (data: {
  bucketName: string
  region: string
  objectKey: string
  oldObjectKey: string
}) => {
  return axios({ url: `/oss/objects/${data.objectKey}/rename`, method: 'put', data })
}

/**
 * @name 查询对象元数据
 * @description 用于重名检测
 */
export const _getStorageObjectMeta = (params: { region: string; bucketName: string; objectKey: string }) => {
  return axios({ url: `/oss/objects/${params.objectKey}`, method: 'HEAD', params })
}

/**
 * @name 重命名检测
 *
 */
export const _checkStorageObjectRename = (params: { region: string; bucketName: string; objectKey: string }) => {
  return axios.get(`/oss/objects/check`, params)
}

/**
 * @name 初始化分块上传
 */
export const _initiateMultipartUpload = (data: {
  bucketName: string
  region: string
  objects: {
    'content-type'?: string
    key: string
  }[]
  'x-oss-acl': string
  'x-oss-server-side-encryption': string
  'x-oss-storage-class': 'STANDARD' | 'STANDARD_IA' | 'ARCHIVE'
}) => {
  return axios.post('/oss/batch/objects/multipart-uploads', data)
}

/**
 * @name 列举存储桶内所有未完成的分块上传任务
 */
export const _listMultipartUploads = (params: { bucketName: string; region: string; prefix?: string }) => {
  return axios.get(`/oss/buckets/${params.bucketName}/multipart-uploads`, params)
}

/**
 * 查看分块上传详情
 */
export const _getMultipartUploadDetail = (params: {
  key: string
  uploadId: string
  bucketName: string
  region: string
}) => {
  return axios.get(`/oss/objects/${params.key}/multipart-uploads/${params.uploadId}/info`, params)
}

/**
 * @name 删除分块
 */
export const _abortMultipartUpload = (data: { bucketName: string; region: string; key: string; uploadId: string }) => {
  return axios({
    url: `/oss/objects/${data.key}/multipart-uploads/${data.uploadId}`,
    method: 'delete',
    params: { region: data.region, bucketName: data.bucketName },
  })
}

/**
 * @name /oss/buckets/{bucketName}/clear 清空存储桶
 */
export const _clearStorageBucket = (data: { bucketName: string; region: string; mode: 'all' | 'fragment' }) => {
  return axios.post(`/oss/buckets/${data.bucketName}/clear`, data)
}

/**
 * @name 获取上传临时凭证（STS）
 */
export const _getUploadStsToken = (data: { bucketName: string; region: string }) => {
  return axios.post('/oss/auth/upload', data)
}

/**
 * @name 上传回调
 */
export const _uploadCallback = (data: {
  bucketName: string
  region: string
  objects: { key: string; size: number }[]
}) => {
  return axios.post('/oss/objects/upload/callback', data)
}

/**
 * @name 获取下载临时凭证（STS）
 */
export const _getDownloadStsToken = (data: { bucketName: string; region: string; objectKey: string }) => {
  return axios.post('/oss/auth/download', data)
}

/**
 * @name 删除对象
 */
export const _deleteStorageObjects = (data: {
  bucketName: string
  region: string
  files: { key: string }[]
  dirs: string[]
}) => {
  return axios({ url: `/oss/batch/objects/delete`, method: 'post', data })
}

/**
 * @name 获取存储桶的访问权限
 */
export const _getBucketAcl = (params: { bucketName: string; region: string }) => {
  return axios.get(`/oss/buckets/${params.bucketName}/permission`, params)
}

/**
 * @name 修改存储桶的访问权限
 */
export const _updateBucketAcl = (data: { bucketName: string; region: string; acl: string }) => {
  return axios({ url: `/oss/buckets/${data.bucketName}/permission`, method: 'put', data })
}

/**
 * @name 获取存储桶的服务端加密
 */
export const _getBucketEncryption = (params: { bucketName: string; region: string }) => {
  return axios.get(`/oss/buckets/${params.bucketName}/encryption`, params)
}

/**
 * @name 设置存储桶的服务端加密
 */
export const _updateBucketEncryption = (data: {
  bucketName: string
  region: string
  'x-oss-server-side-encryption': string
}) => {
  return axios({ url: `/oss/buckets/${data.bucketName}/encryption`, method: 'put', data })
}

/**
 * @name 获取存储桶的防盗链配置
 */
export const _getBucketReferer = (params: { bucketName: string; region: string }) => {
  return axios.get(`/oss/buckets/${params.bucketName}/referer`, params)
}

/**
 * @name 设置存储桶的防盗链配置
 */
export const _updateBucketReferer = (data: {
  bucketName: string
  region: string
  allowEmptyReferer: boolean
  domainList: string[]
  refererType: string
  status: boolean
}) => {
  return axios({ url: `/oss/buckets/${data.bucketName}/referer`, method: 'put', data })
}

/**
 * @name 获取存储桶概览信息
 */
export const _getBucketOverview = (params: { bucketName: string; region: string }) => {
  return axios.get(`/oss/system/stats/buckets/${params.bucketName}/overview`, {
    region: params.region,
  })
}

/**
 * @name 获取服务级概览信息
 */
export const _getOssServicesOverview = () => {
  return axios.get('/oss/system/stats/services/overview')
}

/**
 * @name 获取服务级使用统计
 */
export const _getOssServicesUsageStats = (params: { startDate: string; endDate: string }) => {
  return axios.get('/oss/system/stats/services/stats', params)
}

/**
 * @name 批量修改访问权限
 */
export const _batchUpdateObjectsAcl = (data: {
  bucketName: string
  region: string
  objectKeys: string[]
  'x-oss-acl': string
}): Promise<{
  code: number
  data: {
    taskId: string
  }
  msg: string
}> => {
  return axios({ url: `/oss/task/batch/acl`, method: 'post', data })
}

/**
 * @name 批量修改加密
 */
export const _batchUpdateObjectsEncryption = (data: {
  bucketName: string
  region: string
  objectKeys: string[]
  dirs: string[]
  'x-oss-server-side-encryption': string
}): Promise<{
  code: number
  data: {
    taskId: string
  }
  msg: string
}> => {
  return axios({ url: `/oss/task/batch/encryption`, method: 'post', data })
}

/**
 * @name 批量复制申请(含同名检测；无同名文件直接成功)
 */
export const _batchCopyObjects = (data: {
  bucketName: string
  region: string
  target: string
  objectKeys: string[]
  dirs: string[]
}): Promise<{
  code: number
  data: {
    taskId: string
    confirm: {
      files: { key: string; lastModified: string }[]
      dirs: string[]
    }
  }
  msg: string
}> => {
  return axios({ url: `/oss/batch/objects/copy/apply`, method: 'post', data })
}

/**
 * @name 批量复制二次确认（跳过/覆盖/取消）
 */
export const _batchCopyObjectsConfirm = (data: {
  bucketName: string
  region: string
  taskId: string
  action: 'skip' | 'over' | 'cancel'
}): Promise<{
  code: number
  data: {
    taskId: string
  }
  msg: string
}> => {
  return axios({ url: `/oss/batch/objects/copy/confirm`, method: 'post', data })
}

/**
 * @name 创建存储桶自定义域名
 */
export const _createBucketDomain = (data: {
  bucketName: string
  region: string
  customDomain: string
}): Promise<{
  code: number
  data: any
  msg: string
}> => {
  return axios({ url: `/oss/buckets/${data.bucketName}/custom-domains`, method: 'post', data })
}

/**
 * @name 编辑自定义域名
 * /oss/buckets/{bucketName}/custom-domains/{customDomain}/part-update
 */
export const _editBucketDomain = (data: {
  bucketName: string
  region: string
  customDomain: string
  status: number
}): Promise<{
  code: number
  data: any
  msg: string
}> => {
  return axios({
    url: `/oss/buckets/${data.bucketName}/custom-domains/${data.customDomain}/part-update`,
    method: 'POST',
    data,
  })
}

/**
 * @name 删除自定义域名
 * /oss/buckets/{bucketName}/custom-domains/{customDomain}
 */
export const _deleteBucketDomain = (data: {
  bucketName: string
  region: string
  customDomain: string
}): Promise<{
  code: number
  data: any
  msg: string
}> => {
  return axios({
    url: `/oss/buckets/${data.bucketName}/custom-domains/${data.customDomain}`,
    method: 'DELETE',
    params: { ...data },
  })
}

/**
 * @name 获取存储桶自定义域名列表
 */
export const _getBucketDomainList = (params: { bucketName: string; region: string; status?: number }) => {
  return axios.get(`/oss/buckets/${params.bucketName}/custom-domains`, params)
}

/**
 * @name 获取存储桶的跨域访问配置
 * /oss/buckets/{bucketName}/cors
 */
export const _getBucketCrossDomain = (params: { bucketName: string; region: string }) => {
  return axios.get(`/oss/buckets/${params.bucketName}/cors`, params)
}

interface Rule {
  allowedOrigins: string[]
  allowedMethods: string[]
  allowedHeaders: string[]
  exposeHeaders: string[]
  maxAgeSeconds: number
}

/**
 * @name 添加存储桶的跨域访问配置
 * /oss/buckets/{bucketName}/cors
 */
export const _addBucketCrossDomain = (data: { bucketName: string; region: string; rule: Rule }) => {
  return axios({ url: `/oss/buckets/${data.bucketName}/cors`, method: 'post', data })
}

/**
 * @name 编辑存储桶的跨域访问配置
 * @method PUT
 * /oss/buckets/{bucketName}/cors/{id}
 */
export const _editBucketCrossDomain = (data: { bucketName: string; region: string; id: string; rule: Rule }) => {
  return axios({ url: `/oss/buckets/${data.bucketName}/cors/${data.id}`, method: 'put', data })
}

/**
 * @name 删除存储桶的跨域访问配置
 * @method DELETE
 * /oss/buckets/{bucketName}/cors/{id}
 */
export const _deleteBucketCrossDomain = (params: { bucketName: string; region: string; id: string }) => {
  return axios({ url: `/oss/buckets/${params.bucketName}/cors/${params.id}`, method: 'delete', params })
}

/**
 * @name 获取存储桶域名后缀
 * /oss/system/bucket/domain/suffix
 */
export const _getBucketDomainSuffix = params => {
  return axios.get(`/oss/system/bucket/domain/suffix`, params)
}
