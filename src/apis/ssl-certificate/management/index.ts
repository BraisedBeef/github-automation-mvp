import { domainTOASCII, domainToUnicode } from '@/utils/encrypt-decrypt'
import { request } from '../index'
import type {
  StatisticCertResp,
  ListCertResp,
  ListCertReq,
  CreateCsrReq,
  CreateCsrResp,
  ListCSRReq,
  ListCSRResp,
  CSRDetailReq,
  CSRDetailResp,
  CreateCertReq,
  UploadCertReq,
  UploadCertResp,
  DownloadCertReq,
  DeleteCertReq,
  ValidateInfoReq,
  ValidateInfoResp,
  ValidateDomainReq,
  ValidateDomainResp,
  AutoValidateDomainReq,
  AutoValidateDomainResp,
  DeleteDeployReq,
  DeployCertResp,
  DeployCertReq,
  AvailableDomainsListReq,
  AvailableDomainsListResp,
  DeployListResp,
  DeployListReq,
  UpdateNotifyStatusReq,
  UpdateCertRemarkReq,
  CertDetailResp,
  CertDetailReq,
  UpdateCertReq,
  UpdateListReq,
  UpdateListResp,
  UpdateDomainReq,
  UpdateDomainResp,
  UpdateCertResp,
  SubmitUpdateResp,
  SubmitUpdateReq,
  DownloadCertResp,
  RevokeCertReq,
  GetDeployDetailsResp,
} from './type'

/**
 * 依据状态统计证书数量
 * GET /analysis/cert/status/count
 * 接口ID：262747906
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-262747906
 */
export const _getAnalysisGroupByStatusCount = () => {
  return request<StatisticCertResp>({
    url: `/analysis/cert/status/count`,
    method: 'GET',
  })
}

/**
 * 证书列表
 * GET /cert/list
 * 接口ID：253408120
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-253408120
 */
export const _getCertList = (params: ListCertReq) => {
  // TIPS CDN_CN_DOMAIN 中文域名编码
  if (params.domain) params.domain = domainTOASCII(params.domain)

  return request<ListCertResp>({
    url: `/cert/list`,
    method: 'GET',
    params,
  })
}

/**
 * 判断证书是否关联资源
 * POST /sslcert/cert/get/related/resources
 * 接口ID：272137611
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-272137611
 */
export const _getCertRelatedResources = (data: { cids: number[] }) => {
  return request<{
    cdn_resources: number[]
  }>({
    url: `/cert/get/related/resources`,
    method: 'POST',
    data,
  })
}

/**
 * 证书详情
 * GET /cert/get
 * 接口ID：259367664
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-259367664
 */
export const _getCertDetail = (params: CertDetailReq) => {
  return request<CertDetailResp>({
    url: `/cert/get`,
    method: 'GET',
    params,
  })
}

/**
 * 修改证书备注
 * POST /cert/update/remark
 * 接口ID：259367668
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-259367668
 */
export const _updateCertRemark = (data: UpdateCertRemarkReq) => {
  return request({
    url: `/cert/update/remark`,
    method: 'POST',
    data,
  })
}

/**
 * 创建免费证书
 * POST /cert/create
 * 接口ID：253408116
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-253408116
 */
export const _createCert = (data: CreateCertReq) => {
  // TIPS CDN_CN_DOMAIN 中文域名编码
  data.domain = domainTOASCII(data.domain)

  return request<CreateCsrResp>({
    url: `/cert/create`,
    method: 'POST',
    timeout: 1000 * 60 * 10,
    data,
  })
}

/**
 * 上传证书
 * POST /cert/upload/cert
 * 接口ID：253408123
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-253408123
 */
export const _uploadCert = (data: UploadCertReq) => {
  return request<UploadCertResp>({
    url: `/cert/upload/cert`,
    method: 'POST',
    data,
  })
}

/**
 * 修改证书通知提醒状态
 * POST /cert/update/notify/status
 * 接口ID：259367667
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-259367667
 */
export const _updateNotifyStatus = (data: UpdateNotifyStatusReq) => {
  return request({
    url: `/cert/update/notify/status`,
    method: 'POST',
    data,
  })
}

/**
 * 证书下载
 * POST /cert/download
 * 接口ID：253408118
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-253408118
 */
export const _downloadCert = (params: DownloadCertReq) => {
  return request<DownloadCertResp>({
    url: `/cert/download`,
    method: 'GET',
    params,
  })
}

/**
 * 删除证书
 * POST /cert/delete
 * 接口ID：253408117
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-253408117
 */
export const _deleteCert = (data: DeleteCertReq) => {
  return request({
    url: `/cert/delete`,
    method: 'POST',
    data,
  })
}

/**
 * 取消申请
 * POST /sslcert/cert/cancel/cert
 * 接口ID：269163442
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-269163442
 */
export const _cancelCert = (data: { cert_id: string }) => {
  return request({
    url: `/cert/cancel/cert`,
    method: 'POST',
    data,
  })
}

/**
 * cname或者http验证记录值
 * GET /cert/validate/info
 * 接口ID：253408124
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-253408124
 */
export const _validateInfo = (params: ValidateInfoReq) => {
  return request<ValidateInfoResp>({
    url: `/cert/validate/info`,
    method: 'GET',
    params,
  })
}

/**
 * 验证域名
 * 手动验证域名、http文件验证域名
 * GET /cert/verify/domain
 * 接口ID：253408125
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-253408125
 */
export const _verifyDomain = (params: ValidateDomainReq) => {
  return request<ValidateDomainResp>({
    url: `/cert/verify/domain`,
    method: 'GET',
    params,
  })
}

/**
 * 切换验证方式
 * POST /cert/change/verify/types
 * 接口ID：262590262
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-262590262
 */
export const _changeVerifyTypes = (data: { cert_id: string; verify_types: number }) => {
  return request({
    url: `/cert/change/verify/types`,
    method: 'POST',
    data,
  })
}

/**
 * 自动验证域名
 * GET /cert/auto/verify/domain
 * 接口ID：259290591
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-259290591
 */
export const _autoVerifyDomain = (params: AutoValidateDomainReq) => {
  return request<AutoValidateDomainResp>({
    url: `/cert/auto/verify/domain`,
    method: 'GET',
    params,
  })
}

/**
 * 吊销证书
 * POST /cert/revoke/cert
 * 接口ID：261328558
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-261328558
 */
export const _revokeCert = (data: RevokeCertReq) => {
  return request({
    url: `/cert/revoke/cert`,
    method: 'POST',
    data,
  })
}

/**
 * 获取可部署的域名
 * GET /deploy/get/available/domains
 * 接口ID：259367679
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-259367679
 */
export const _getAvailableDomains = (params: AvailableDomainsListReq) => {
  return request<AvailableDomainsListResp>({
    url: `/deploy/get/available/domains`,
    method: 'GET',
    params,
  })
}
/**
 * 部署证书
 * POST /deploy/do
 * 接口ID：259367678
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-259367678
 */
export const _deployCert = (data: DeployCertReq) => {
  return request<DeployCertResp>({
    url: `/deploy/do`,
    method: 'POST',
    data,
  })
}
/**
 * 部署列表
 * POST /deploy/list
 * 接口ID：259367680
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-259367680
 */
export const _getDeployList = (params: DeployListReq) => {
  return request<DeployListResp>({
    url: `/deploy/list`,
    method: 'GET',
    params,
  })
}

/**
 * 部署明细
 * GET /sslcert/deploy/detail
 * 接口ID：268612193
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-268612193
 */
export const _getDeployDetail = (params: { task_id: string }) => {
  return request<GetDeployDetailsResp>({
    url: `/deploy/detail`,
    method: 'GET',
    params,
  })
}

/**
 * 删除部署记录
 * POST /deploy/delete
 * 接口ID：259367677
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-259367677
 */
export const _deleteDeploy = (data: DeleteDeployReq) => {
  return request({
    url: `/deploy/delete`,
    method: 'POST',
    data,
  })
}

/**
 * 提交证书更新
 * POST /update/do
 * 接口ID：259367690
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-259367690
 */
export const _updateCert = (data: SubmitUpdateReq) => {
  return request<SubmitUpdateResp>({
    url: `/update/do`,
    method: 'POST',
    data,
  })
}

/**
 * 获取关联的新证书
 * GET /update/get/available/updated/certs
 * 接口ID：259367691
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-259367691
 */
export const _getUpdateCert = (data: UpdateCertReq) => {
  return request<UpdateCertResp>({
    url: `/update/get/available/updated/certs`,
    method: 'POST',
    data,
  })
}

/**
 * 获取新证书对应的域名
 * GET /update/get/available/updated/domains
 * 接口ID：259367692
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-259367692
 */
export const _getUpdateDomain = (params: UpdateDomainReq) => {
  return request<UpdateDomainResp>({
    url: `/update/get/available/updated/domains`,
    method: 'GET',
    params,
  })
}

/**
 * 更新列表
 * GET /update/list
 * 接口ID：259367693
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-259367693
 */
export const _getUpdateList = (params: UpdateListReq) => {
  return request<UpdateListResp>({
    url: `/update/list`,
    method: 'GET',
    params,
  })
}

/**
 * 创建CSR证书
 * POST /csr/create
 * 接口ID：253408126
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-253408126
 */
export const _createCsr = (data: CreateCsrReq) => {
  // TIPS CDN_CN_DOMAIN 中文域名编码
  const backup_domain = data.backup_domain?.map(item => domainTOASCII(item))
  return request<CreateCsrResp>({
    url: `/csr/create`,
    method: 'POST',
    data: {
      ...data,
      domain: domainTOASCII(data.domain),
      backup_domain,
    },
  })
}

/**
 * 删除CSR证书
 * POST /csr/delete
 * 接口ID：253408127
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-253408127
 */
export const _deleteCsr = (data: { csr_id: string }) => {
  return request({
    url: `/csr/delete`,
    method: 'POST',
    data,
  })
}

/**
 * 获取CSR证书列表
 * GET /csr/list
 * 接口ID：253408129
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-253408129
 */
export const _getCsrList = (params: ListCSRReq) => {
  return request<ListCSRResp>({
    url: `/csr/list`,
    method: 'GET',
    params,
  })
}

/**
 * 修改CSR证书基本信息
 * POST /sslcert/csr/update/base
 * 接口ID：261328568
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-261328568
 */
export const _updateCsrBase = (data: { csr_id: string; remark: string }) => {
  return request({
    url: `/csr/update/base`,
    method: 'POST',
    data,
  })
}

/**
 * 获取CSR证书详情
 * GET /csr/get
 * 接口ID：253408128
 * 接口地址：https://app.apifox.com/link/project/5476448/apis/api-253408128
 */
export const _getCsrDetail = (params: CSRDetailReq) => {
  return request<CSRDetailResp>({
    url: `/csr/get`,
    method: 'GET',
    params,
  })
}
