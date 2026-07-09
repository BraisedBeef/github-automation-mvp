//~~ 依据状态统计证书数量接口类型
export interface StatisticCertReq {}
export interface StatisticCertResp {
  /**
   * 已过期
   */
  expired_cert_cnt: number
  /**
   * 即将过期
   */
  expiring_cert_cnt: number
  issued_cert_cnt: number
  /**
   * 待提交
   */
  uncommitted_cert_cnt: number
  /**
   * 待验证
   */
  unverified_cert_cnt: number
}

//~~ 创建CSR证书接口类型
export interface CreateCsrReq {
  /**
   * CSR类型
   * CSR类型,默认1 服务器证书"`
   */
  csr_type?: number
  /**
   * 通用名称，域名
   */
  domain: string
  // 证书证书备用名
  backup_domain?: string[]
  // 公司名称
  company?: string
  // 证书使用部门
  department?: string
  // 邮箱地址
  email?: string
  // 设置证书组织机构所在国家或地区代码
  country?: string
  // 公司所在省份或地区
  province?: string
  // 公司所在城市
  city?: string
  // 秘钥算法，支持 1=rsa,2=ecdsa
  encryption: 1 | 2
  /**
   * 秘钥强度：
   * ras算法支持 1=2048, 2=3072, 3=4096,
   * ecdsa算法支持 4=p256, 5=p384, 6=p521, 7=p224
   */
  key_length: 1 | 2 | 3 | 4 | 5 | 6 | 7
}
export interface CreateCsrResp {
  /**
   * CSR ID
   */
  csr_id: string
}

//~~ CSR证书列表接口类型
export interface ListCSRReq {
  /**
   * CSR名称
   */
  csr_name?: string
  /**
   * 域名
   */
  domain?: string
  /**
   * 证书域名类型
   */
  csr_domain_type?: number
  /**
   * 页码
   */
  page?: number
  /**
   * 每页数量
   */
  page_size?: number
}
export interface ListCSRResp {
  /**
   * CSR列表
   */
  items: {
    /**
     * 公司所在城市
     */
    city: string
    /**
     * 通用名称
     */
    common_name: string
    /**
     * 公司名称
     */
    company: string
    /**
     * 设置证书组织机构所在国家或地区代码
     */
    country: string
    /**
     * 创建时间戳
     */
    created_at: number
    /**
     * CSR内容
     */
    csr?: string
    /**
     * CSR ID
     */
    csr_id: string
    /**
     * CSR类型
     */
    csr_type: number
    /**
     * 证书使用部门
     */
    department: string
    /**
     * 邮箱地址
     */
    email: string
    /**
     * 密钥类型
     */
    encryption: number
    /**
     * 密钥长度
     */
    key_size: number
    /**
     * 私钥内容
     */
    privateKey?: string
    /**
     * 公司所在省份或地区
     */
    province: string
    /**
     * CSR备注名称
     */
    remark: string
    /**
     * 用户ID
     */
    uid: number
    /**
     * 编辑时间戳
     */
    updatedAt?: number
    /**
     * 用户名
     */
    user_name: string
  }[]
  /**
   * 页码
   */
  page: number
  /**
   * 每页数量
   */
  page_size: number
  /**
   * 总数
   */
  total: number
}

//~~ 证书列表接口类型
export interface ListCertReq {
  /**
   * 证书ID
   */
  cert_id?: string
  domain?: string
  status?: number
  /**
   * 每页数量
   */
  limit: number
  /**
   * 页码
   */
  page: number
  /**
   * 证书来源：0=全部，1=免费，2=上传
   */
  source?: number
}
export interface ListCertResp {
  /**
   * Cert列表
   */
  items: {
    cert_id: string
    /**
     * 有效期，单位天
     */
    cert_validity: number
    /**
     * 部署 1=未关联，2=关联CDN
     */
    deploy_type: number
    domain: string
    /**
     * 过期时间
     */
    expire_at: number
    id: number
    /**
     * 证书托管状态：1=未托管，2=已托管，3=不支持
     */
    is_hosting: number
    /**
     * 是否通知提醒：1=是，2=否
     */
    is_notify: number
    /**
     * 备注，名称
     */
    remark: string
    /**
     * '来源：1=免费证书，2=上传证书',
     */
    source: number
    /**
     * 状态, 1:申请中;2:待提交;3:待验证;4:等待签发;5:已签发;6:审核失败;7:即将过期，8:已过期,9:已吊销
     */
    status: number
    // 证书域名类型
    cert_domain_type: number
    // 验证类型
    validate_type: number
    // 证书类型：1=DV 单域名
    cert_type: number
    // 证书厂商
    factory_id: number
  }[]
  /**
   * 每页数量
   */
  limit: number
  /**
   * 页码
   */
  page: number
  /**
   * 总数
   */
  total: number
}

//~~ 获取证书详情接口类型
export interface CertDetailReq {
  /**
   * Cert ID
   */
  cert_id?: string
}
export interface CertDetailResp {
  /**
   * 证书ID
   */
  cert_id: string
  /**
   * 证书类型：1=DV单域名
   */
  cert_type: number
  /**
   * 有效期，单位天
   */
  cert_validity: number
  /**
   * 申请时间
   */
  create_time: number
  domain: string
  sub_domains: string[]
  /**
   * 秘钥算法：1=rsa,2=ecdsa
   */
  encryption: number
  /**
   * 过期时间
   */
  expire_at: number
  /**
   * 证书指纹
   */
  fingerprint: string
  id: number
  /**
   * 秘钥强度：2048，4096
   */
  key_length: number
  /**
   * 备注，名称
   */
  remark: string
  /**
   * 签名算法
   */
  signature_algorithm: string
  /**
   * '来源：1=免费证书，2=上传证书',
   */
  source: number
  /**
   * 签发时间
   */
  start_at: number
  /**
   * 状态, 1:申请中;2:待提交;3:待验证;4:等待签发;5:已签发;6:审核失败;7:即将过期，8:已过期,9:已吊销
   */
  status: number
}

//~~ 删除CSR证书接口类型

//~~ 获取CSR证书详情接口类型
export interface CSRDetailReq {
  /**
   * CSR ID
   */
  csr_id?: string
  /**
   * ID
   */
  id?: number
}
export interface CSRDetailResp {
  /**
   * 公司所在城市
   */
  city: string
  /**
   * 通用名称
   */
  common_name: string
  /**
   * 公司名称
   */
  company: string
  /**
   * 设置证书组织机构所在国家或地区代码
   */
  country: string
  /**
   * 创建时间戳
   */
  created_at: number
  /**
   * CSR内容
   */
  csr: string
  /**
   * CSR ID
   */
  csr_id: string
  /**
   * CSR类型
   */
  csr_type: number
  /**
   * 证书使用部门
   */
  department: string
  /**
   * 邮箱地址
   */
  email: string
  /**
   * 密钥类型
   */
  encryption: number
  /**
   * 密钥长度
   */
  key_size: number
  /**
   * 私钥内容
   */
  private_key: string
  /**
   * 公司所在省份或地区
   */
  province: string
  /**
   * CSR备注名称
   */
  remark: string
  /**
   * 证书备用名
   */
  subject_alt_names: string[]
  /**
   * 用户ID
   */
  uid: number
  /**
   * 编辑时间戳
   */
  updated_at: number
  /**
   * 用户名
   */
  user_name: string
}

//~~ 修改证书备注接口类型
export interface UpdateCertRemarkReq {
  /**
   * Cert ID
   */
  cert_id: string
  /**
   * 备注，名称
   */
  remark: string
}
export interface UpdateCertRemarkResp {
  // cert_id: string
}

//~~ 创建免费证书接口类型
export interface CreateCertReq {
  /**
   * 验证类型
   * 1=手动dns 2=自动dns 3=http
   */
  validate_type: number
  // cert_id
  cert_id: string
  csr_generate_type: number
  csr_id?: string
  /**
   * CSR类型
   * 默认1 服务器证书"`
   */
  csr_type?: number
  // 通用名称，域名
  domain: string
  // 证书证书备用名
  backup_domain?: string[]
  // 公司名称
  company?: string
  // 证书使用部门
  department?: string
  // 邮箱地址
  email?: string
  // 设置证书组织机构所在国家或地区代码
  country?: string
  // 公司所在省份或地区
  province?: string
  // 公司所在城市
  city?: string
  /**
   * 秘钥算法
   * 1=rsa,2=ecdsa
   */
  encryption?: 1 | 2
  /**
   * 秘钥强度：
   * ras算法支持
   *  1=2048，2=3072,3=4096
   * ecdsa算法支持
   *  4=p256,5=p384,6=p521,7=p224
   */
  key_length?: 1 | 2 | 3 | 4 | 5 | 6 | 7
}
export interface CreateCertResp {
  /**
   * CSR ID
   */
  cert_id: string
}

//~~ 上传证书接口类型
export interface UploadCertReq {
  /**
   * 文件内容
   */
  cert_content: string
  /**
   * 证书名称
   */
  cert_name: string
  /**
   * 私钥
   */
  private_key: string
}
export interface UploadCertResp {
  cert_id: string
}

//~~ 修改证书通知提醒状态接口类型
export interface UpdateNotifyStatusReq {
  /**
   * Cert ID
   */
  cert_id: string
  /**
   * 是否通知提醒：1=是，2=否
   */
  status: 1 | 2
}
export interface UpdateNotifyStatusResp {
  // cert_id: string
}

//~~ 证书下载接口类型
export interface DownloadCertReq {
  /**
   * Cert ID
   */
  cert_id: string
  /**
   * 下载类型：1=apache 2=nginx 3=宝塔
   */
  type: number
}
export interface DownloadCertResp {
  content: string
  private_key: string
}

//~~ 删除证书接口类型
export type DeleteCertReq = {
  /**
   * Cert ID
   */
  cert_id: string
}

//~~ cname或者http验证记录值接口类型
export interface ValidateInfoReq {
  /**
   * Cert ID
   */
  cert_id: string
}
export interface ValidateInfoResp {
  cname_or_txt_validate: {
    domain: string
    /**
     * 主机记录
     */
    host_record: string
    record_type: string
    /**
     * 记录值
     */
    record_value: string
  }[]
  http_validate: {
    /**
     * 文件内容
     */
    content: string
    domain: string
    file_url: string
  }[]
}

//~~ 验证证书
export interface ValidateDomainReq {
  /**
   * 证书ID
   */
  cert_id: string
}

export interface VerifyDomainItem {
  domain: string
  reason: string
}
export interface ValidateDomainResp {
  fail_domain: VerifyDomainItem[]
  success_domain: VerifyDomainItem[]
}
//~~ 自动验证域名
export interface AutoValidateDomainReq {
  /**
   * 证书id
   */
  cert_id: string
}
export interface AutoValidateDomainResp {
  cert_id: string
}

//~~ 吊销证书接口类型
export interface RevokeCertReq {
  /**
   * 证书ID
   */
  cert_id: string
}

//~~ 部署列表接口类型
export interface DeployListReq {
  /**
   * 证书ID
   */
  cert_id: string
  /**
   * 每页数量
   */
  limit: number
  /**
   * 页码
   */
  page: number
  /**
   * 产品类型：1=cdn
   */
  product_type: number
}
export interface DeployListResp {
  items: {
    created_at: number
    id: number
    product_type: number
    /**
     * 状态：1=等待部署，2=部署中，3=部署完成
     */
    status: number
    task_id: string
    updated_at: number
  }[]
  /**
   * 每页数量
   */
  limit: number
  /**
   * 页码
   */
  page: number
  /**
   * 总数
   */
  total: number
}

//~~ 获取证书部署明细接口类型
export interface GetDeployDetailsResp {
  items: {
    cert_id: string
    cert_name: string
    cid: number
    domain: string
    status: number
    updatedAt: number
    [property: string]: any
  }[]
  [property: string]: any
}

//~~ 可部署的域名列表接口类型
export interface AvailableDomainsListReq {
  cert_id: string
}
export interface AvailableDomainsListResp {
  items: {
    cert_id: string
    cid: number
    domain: string
    remark: string
    /**
     * 1=已启动，2=已关闭
     */
    status: number
    [key: string]: any
  }[]
}

//~~ 部署证书接口类型
export interface DeployCertReq {
  deploy_items: {
    cert_id: string
    /**
     * 上一次绑定的证书主键ID
     */
    cid: number
    domain: string
  }[]
  deploy_type: number
  new_cert_id: string
  new_cid: number
}
export interface DeployCertResp {
  task_id: string
}

//~~ 提交证书更新接口类型
export interface SubmitUpdateReq {
  domains: { domain: string; domain_id: number }[]
  /**
   * 旧证书到期是否提醒：1=是，2=否
   */
  is_notify: number
  new_cert_id: string | number
  new_cid: number | string
  /**
   * 旧证书ID
   */
  old_cert_id: string
  old_cid: number | string
  /**
   * 更新资源类型：1=CDN
   */
  update_type: number
}
export interface SubmitUpdateResp {
  task_id: string
}

//~~ 删除部署证书接口类型
export interface DeleteDeployReq {
  /**
   * 部署ID
   */
  did: number
}

//~~ 获取关联的新证书接口类型
export interface UpdateCertReq {
  /**
   * 证书来源:1=猫云证书，2=上传证书
   */
  cert_source: number
  /**
   * 已经部署的域名
   */
  deployed_domains: string[]
  /**
   * 用于去掉新证书里面重复的证书
   */
  old_cert_id: string
}
export interface UpdateCertResp {
  items: { cert_id: string; cid: number; domain: string; dns_domains?: string[]; [p: string]: any }[]
}

//~~ 新证书对应的域名接口类型
export interface UpdateDomainReq {
  old_cert_id: string | number
}
export interface UpdateDomainResp {
  items: { cert_id: string; cid: number; domain: string; domain_id: number; status: number; [p: string]: any }[]
}

//~~ 更新列表接口类型
export interface UpdateListReq {
  /**
   * 证书ID
   */
  cert_id: string
  /**
   * 每页数量
   */
  limit: number
  /**
   * 页码
   */
  page: number
}
export interface UpdateListResp {
  items: {
    created_at: number
    id: number
    /**
     * 更新后证书ID
     */
    new_cert_id: string
    old_cert_id: string
    /**
     * 状态：1=等待部署，2=部署中，3=部署完成
     */
    status: number
    task_id: string
    updated_at: number
  }[]
  /**
   * 每页数量
   */
  limit: number
  /**
   * 页码
   */
  page: number
  /**
   * 总数
   */
  total: number
}
